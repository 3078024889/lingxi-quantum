#!/usr/bin/env python3
"""Fail-closed, streaming extraction of SHA256-pinned Node release archives."""
import os
import pathlib
import shutil
import sys
import tarfile

MAX_FILES = 180_000
MAX_SIZE = 4 * 1024**3
MAX_FILE_SIZE = 1024**3

def safe_name(member):
    name = member.name
    if name in (".", "./") and member.isdir():
        return None
    if not name or name.startswith("/") or "\\" in name or any(ord(c) < 32 for c in name):
        raise ValueError("ARCHIVE_UNSAFE_NAME")
    parts = tuple(p for p in name.split("/") if p and p != ".")
    if not parts or ".." in parts or len("/".join(parts)) > 4096:
        raise ValueError("ARCHIVE_PATH_TRAVERSAL")
    if not (member.isdir() or member.isfile()):
        raise ValueError("ARCHIVE_LINK_OR_SPECIAL_ENTRY")
    if member.mode & 0o7000:
        raise ValueError("ARCHIVE_PRIVILEGED_MODE")
    if member.size < 0 or member.size > MAX_FILE_SIZE:
        raise ValueError("ARCHIVE_FILE_TOO_LARGE")
    return parts

def safe_extract(archive, destination):
    out = pathlib.Path(destination)
    if out.is_symlink() or not out.is_dir() or any(out.iterdir()):
        raise ValueError("ARCHIVE_OUTPUT_MUST_BE_EMPTY_DIRECTORY")
    with tarfile.open(archive, mode="r:gz") as tf:
        members = tf.getmembers()
        if len(members) > MAX_FILES:
            raise ValueError("ARCHIVE_TOO_MANY_MEMBERS")
        entries = []
        seen = {}
        total = 0
        for member in members:
            parts = safe_name(member)
            if parts is None:
                continue
            name = "/".join(parts)
            if name in seen:
                raise ValueError("ARCHIVE_DUPLICATE_ENTRY:" + name)
            seen[name] = member.isdir()
            total += member.size if member.isfile() else 0
            if total > MAX_SIZE:
                raise ValueError("ARCHIVE_UNCOMPRESSED_SIZE_LIMIT")
            entries.append((member, parts))
        for name in seen:
            parts = name.split("/")
            for i in range(1, len(parts)):
                if seen.get("/".join(parts[:i])) is False:
                    raise ValueError("ARCHIVE_FILE_AS_PARENT")
        for member, parts in entries:
            path = out.joinpath(*parts)
            if member.isdir():
                path.mkdir(parents=True, exist_ok=True)
            else:
                path.parent.mkdir(parents=True, exist_ok=True)
                source = tf.extractfile(member)
                if source is None:
                    raise ValueError("ARCHIVE_BODY_MISSING")
                with source, open(path, "xb") as dest:
                    shutil.copyfileobj(source, dest, length=1024 * 1024)
                os.chmod(path, 0o755 if member.mode & 0o111 else 0o644)
    print("ARCHIVE_STRICT_EXTRACTION_OK", len(entries), total)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("usage: strict-archive.py archive.tar.gz empty-directory")
    try:
        safe_extract(sys.argv[1], sys.argv[2])
    except (OSError, ValueError, tarfile.TarError) as err:
        print("COM_ARCHIVE_REFUSED", err, file=sys.stderr)
        sys.exit(1)
