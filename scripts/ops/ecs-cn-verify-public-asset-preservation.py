#!/usr/bin/env python3
"""Verify that a CN standalone candidate preserves every original public resource.

An older 2026-11-06 archive accidentally packaged assets twice:
  public/foo                    (the actual Next.js document root)
  public/public/foo             (a redundant full duplicate)
The new archive must contain each canonical asset exactly once, byte-for-byte,
except the one known build-generated WordPress ZIP: its four payload files must
have identical SHA256 even if ZIP directory timestamps change. No other content
change, extra ZIP member, missing model, or changed ZIP payload is accepted. This Python 3.6-compatible check is read-only and runs before install.
"""
from __future__ import print_function
import hashlib
import io
import os
import posixpath
import sys
import tarfile
import tempfile
import zipfile


class AssetError(Exception):
    pass


WORDPRESS_ZIP = "public/downloads/lingxifield-siai-wordpress.zip"
WORDPRESS_ALLOWED = frozenset([
    "lingxifield-widgets/lingxifield-widgets.php",
    "lingxifield-widgets/readme.txt",
    "lingxifield-widgets/README.md",
    "lingxifield-widgets/assets/lingxifield-v1.js",
])
WORDPRESS_DIRS = frozenset([
    "lingxifield-widgets/",
    "lingxifield-widgets/assets/",
])


def _wordpress_payload_hashes(tar_path):
    """Bounded read of one known generated ZIP; compare decompressed install files."""
    with tarfile.open(tar_path, "r:gz") as source:
        matches = []
        for m in source:
            name = m.name
            while name.startswith("./"):
                name = name[2:]
            if name == WORDPRESS_ZIP:
                matches.append(m)
        if len(matches) != 1 or not matches[0].isfile() or matches[0].size > 300000:
            raise AssetError("WORDPRESS_ZIP_UNEXPECTED_ARCHIVE_MEMBER")
        data_file = source.extractfile(matches[0])
        if data_file is None:
            raise AssetError("WORDPRESS_ZIP_NOT_READABLE")
        data = data_file.read(300001)
    if len(data) < 30 or len(data) > 300000 or not data.startswith(bytes((80, 75, 3, 4))):
        raise AssetError("WORDPRESS_ZIP_INVALID_FORMAT")
    files = {}
    seen = set()
    with zipfile.ZipFile(io.BytesIO(data), "r") as archive:
        if archive.comment:
            raise AssetError("WORDPRESS_ZIP_COMMENT_UNEXPECTED")
        for info in archive.infolist():
            name = info.filename
            if name in seen:
                raise AssetError("WORDPRESS_ZIP_DUPLICATE_ENTRY")
            seen.add(name)
            if info.flag_bits & 1:
                raise AssetError("WORDPRESS_ZIP_ENCRYPTED_ENTRY")
            mode = (info.external_attr >> 16) & 0o170000
            if mode not in (0, 0o040000, 0o100000):
                raise AssetError("WORDPRESS_ZIP_SPECIAL_FILE")
            if name.endswith("/"):
                if name not in WORDPRESS_DIRS or info.file_size != 0:
                    raise AssetError("WORDPRESS_ZIP_UNEXPECTED_DIRECTORY")
                continue
            if name not in WORDPRESS_ALLOWED or mode == 0o040000:
                raise AssetError("WORDPRESS_ZIP_UNEXPECTED_MEMBER")
            if info.file_size > 200000:
                raise AssetError("WORDPRESS_ZIP_MEMBER_OVERSIZE")
            payload = archive.read(info)
            if len(payload) != info.file_size:
                raise AssetError("WORDPRESS_ZIP_MEMBER_SIZE_MISMATCH")
            files[name] = (len(payload), hashlib.sha256(payload).hexdigest())
    if frozenset(files) != WORDPRESS_ALLOWED:
        raise AssetError("WORDPRESS_ZIP_MISSING_REQUIRED_MEMBER")
    return files


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
    if not missing and altered == [WORDPRESS_ZIP]:
        try:
            old_payload = _wordpress_payload_hashes(old_path)
            new_payload = _wordpress_payload_hashes(new_path)
        except (zipfile.BadZipFile, RuntimeError, EOFError) as error:
            raise AssetError("WORDPRESS_ZIP_CANNOT_VERIFY:{}".format(type(error).__name__))
        if old_payload != new_payload:
            raise AssetError("WORDPRESS_ZIP_PLUGIN_PAYLOAD_CHANGED")
        altered = []
        if not quiet:
            print("CN_WORDPRESS_ZIP_FOUR_PLUGIN_FILE_SHA256_MATCH=PASS", flush=True)
            print("CN_WORDPRESS_ZIP_ONLY_CONTAINER_METADATA_CHANGED=PASS", flush=True)
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


def _make_wp_zip(day=1, corrupt=False, extra=False):
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for name in sorted(WORDPRESS_ALLOWED):
            info = zipfile.ZipInfo(name, (2026, 1, day, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            original = b"Verified first-party WordPress plugin file"
            if corrupt and name.endswith(".php"):
                original = b"Altered first-party WordPress plugin file!"
            archive.writestr(info, original)
        if extra:
            archive.writestr("lingxifield-widgets/injected.php", b"bad")
    return output.getvalue()


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
        # A regenerated ZIP may differ at the container level while all four
        # extracted first-party plugin files remain byte-for-byte identical.
        old_zip = _make_wp_zip(day=1)
        new_zip = _make_wp_zip(day=2)
        assert old_zip != new_zip
        zip_original = dict(original)
        zip_original[WORDPRESS_ZIP] = old_zip
        zip_nested = {"public/public/" + key[len("public/"):]: value
                      for key, value in zip_original.items()}
        _synthetic_archive(old_path, dict(zip_original, **zip_nested))
        zip_updated = dict(zip_original)
        zip_updated[WORDPRESS_ZIP] = new_zip
        _synthetic_archive(new_path, zip_updated)
        assert compare(old_path, new_path, quiet=True) == (3, 3)
        for variant in (_make_wp_zip(day=2, corrupt=True),
                        _make_wp_zip(day=2, extra=True)):
            zip_updated[WORDPRESS_ZIP] = variant
            _synthetic_archive(new_path, zip_updated)
            try:
                compare(old_path, new_path, quiet=True)
            except AssetError:
                pass
            else:
                raise AssertionError("WORDPRESS_PLUGIN_TAMPER_NOT_DETECTED")
        # Restore the initial test fixture for duplicate corruption tests.
        _synthetic_archive(old_path, dict(original, **nested))
        _synthetic_archive(new_path, original)
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
    print("CN_PUBLIC_ASSET_SHA256_DUPLICATE_AND_WORDPRESS_ZIP_FIXTURE_PASS")


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
