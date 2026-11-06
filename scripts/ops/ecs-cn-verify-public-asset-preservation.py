#!/usr/bin/env python3
"""Verify that a CN standalone candidate preserves every original public resource.

An older 2026-11-06 archive accidentally packaged assets twice:
  public/foo                    (the actual Next.js document root)
  public/public/foo             (a redundant full duplicate)
The new archive must contain each canonical asset exactly once, byte-for-byte.
Neither missing files nor changed contents (including equal-length changes) are
accepted. This Python 3.6-compatible check is read-only and runs before install.
"""
from __future__ import print_function
import hashlib
import io
import os
import posixpath
import sys
import tarfile
import tempfile


class AssetError(Exception):
    pass


def _archive_inventory(path):
    result = {}
    with tarfile.open(path, "r:gz") as archive:
        for member in archive:
            raw = member.name
            while raw.startswith("./"):
                raw = raw[2:]
            if not raw.startswith("public/"):
                continue
            normalized = posixpath.normpath(raw)
            if (normalized != raw or normalized.startswith("../")
                    or raw.startswith("/") or "\\" in raw):
                raise AssetError("UNSAFE_PUBLIC_ASSET_PATH")
            if member.isdir():
                continue
            if not member.isfile():
                raise AssetError("PUBLIC_ASSET_NOT_REGULAR_FILE")
            if raw in result:
                raise AssetError("DUPLICATE_PUBLIC_MEMBER")
            digest = hashlib.sha256()
            contents = archive.extractfile(member)
            if contents is None:
                raise AssetError("PUBLIC_FILE_CONTENT_UNAVAILABLE")
            total = 0
            while True:
                block = contents.read(1024 * 1024)
                if not block:
                    break
                digest.update(block)
                total += len(block)
            if total != member.size:
                raise AssetError("PUBLIC_FILE_CONTENT_SHORT")
            result[raw] = (member.size, digest.hexdigest())
    return result


def compare(old_path, new_path, quiet=False):
    old = _archive_inventory(old_path)
    new = _archive_inventory(new_path)
    nested_prefix = "public/public/"
    duplicates = {key: data for key, data in old.items()
                  if key.startswith(nested_prefix)}
    canonical = {key: data for key, data in old.items()
                 if not key.startswith(nested_prefix)}
    if not quiet:
        print("CN_OLD_PUBLIC_FILES=" + str(len(old)), flush=True)
        print("CN_NEW_PUBLIC_FILES=" + str(len(new)), flush=True)
        print("CN_OLD_REDUNDANT_PUBLIC_PUBLIC_FILES=" + str(len(duplicates)), flush=True)
        print("CN_OLD_CANONICAL_PUBLIC_FILES=" + str(len(canonical)), flush=True)
    if not canonical or len(canonical) < (1 if quiet else 50):
        raise AssetError("CANONICAL_PUBLIC_INVENTORY_TOO_SMALL")
    # Redundant paths are accepted ONLY when the canonical path exists and the
    # exact bytes match. Never assume double nesting is harmless.
    for path, data in duplicates.items():
        proper = "public/" + path[len(nested_prefix):]
        if proper not in canonical or canonical[proper] != data:
            raise AssetError("OLD_NESTED_DUPLICATE_MISMATCH")
    # Catch any change in the real, served public/ resource tree, even when
    # the file size remains unchanged.
    missing = sorted(set(canonical) - set(new))
    altered = sorted(k for k, value in canonical.items()
                     if k in new and new[k] != value)
    if missing or altered:
        if not quiet:
            for item in (missing + altered)[:8]:
                print("CN_PUBLIC_ASSET_ISSUE=" + item[:180], flush=True)
            print("CN_CANONICAL_PUBLIC_MISSING=" + str(len(missing)), flush=True)
            print("CN_CANONICAL_PUBLIC_SHA256_MISMATCH=" + str(len(altered)), flush=True)
        raise AssetError("PUBLIC_CANONICAL_ASSETS_CHANGED_OR_MISSING")
    if not quiet:
        print("CN_PUBLIC_CANONICAL_SHA256_MATCH=" + str(len(canonical)), flush=True)
        print("CN_PUBLIC_REDUNDANT_DUPLICATE_SHA256_MATCH=" +
              str(len(duplicates)), flush=True)
        print("CN_PUBLIC_ASSET_FILES_AND_SHA256_PRESERVED", flush=True)
    return len(canonical), len(duplicates)


def _synthetic_archive(path, files):
    with tarfile.open(path, "w:gz") as archive:
        for key, contents in files.items():
            info = tarfile.TarInfo(key)
            info.size = len(contents)
            info.mode = 0o644
            archive.addfile(info, io.BytesIO(contents))


def self_test():
    with tempfile.TemporaryDirectory() as td:
        old_path = os.path.join(td, "old.tar.gz")
        new_path = os.path.join(td, "new.tar.gz")
        original = {"public/a.txt": b"a-v1", "public/models/weights.onnx": b"binary model"}
        nested = {"public/public/" + name[len("public/"):]: data
                  for name, data in original.items()}
        _synthetic_archive(old_path, dict(original, **nested))
        _synthetic_archive(new_path, original)
        assert compare(old_path, new_path, quiet=True) == (2, 2)
        problems = [
            {"public/a.txt": b"a-v2", "public/models/weights.onnx": b"binary model"},
            {"public/a.txt": b"a-v1"},
        ]
        for problem in problems:
            _synthetic_archive(new_path, problem)
            try:
                compare(old_path, new_path, quiet=True)
            except AssetError:
                pass
            else:
                raise AssertionError("PUBLIC_CORRUPTION_NOT_DETECTED")
        broken = dict(original, **nested)
        broken["public/public/a.txt"] = b"a-v2"
        _synthetic_archive(old_path, broken)
        _synthetic_archive(new_path, original)
        try:
            compare(old_path, new_path, quiet=True)
        except AssetError:
            pass
        else:
            raise AssertionError("BROKEN_OLD_DUPLICATE_NOT_DETECTED")
    print("CN_PUBLIC_ASSET_SHA256_DUPLICATE_FIXTURE_PASS")


if __name__ == "__main__":
    try:
        if len(sys.argv) == 2 and sys.argv[1] == "--self-test":
            self_test()
        elif len(sys.argv) == 3:
            compare(sys.argv[1], sys.argv[2])
        else:
            raise AssetError("USAGE: python3 verify.py old.tar.gz new.tar.gz")
    except (AssetError, OSError, EOFError, tarfile.TarError) as exc:
        print("CN_PUBLIC_MODEL_OR_ASSET_PRESERVATION_FAILED=" + str(exc))
        sys.exit(1)
