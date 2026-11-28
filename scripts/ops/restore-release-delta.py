#!/usr/bin/env python3
"""Reconstruct in a NEW directory, verify every byte, never alter the baseline."""
import hashlib
import json
import os
import pathlib
import posixpath
import shutil
import sys
import tarfile


def safe_path(value):
    path = pathlib.PurePosixPath(value)
    if path.is_absolute() or '..' in path.parts or not path.parts:
        raise ValueError('Unsafe release path')
    return path


def restore(delta, baseline, destination, expected_baseline, expected_source):
    baseline, destination = pathlib.Path(baseline), pathlib.Path(destination)
    if destination.exists():
        raise ValueError('Destination must be new')
    if (baseline / 'RELEASE_SOURCE_SHA').read_text().strip() != expected_baseline:
        raise ValueError('Wrong baseline')
    with tarfile.open(delta, 'r:gz') as archive:
        manifest = json.load(archive.extractfile('delta-manifest.json'))
        if manifest['version'] != 1 or manifest['baseline'] != expected_baseline or manifest['source'] != expected_source:
            raise ValueError('Wrong manifest')
        entries = manifest['entries']
        names = set()
        links = set(entry['path'] for entry in entries if entry['kind'] == 'symlink')
        for entry in entries:
            path = safe_path(entry['path'])
            if str(path) in names or any(str(parent) in links for parent in path.parents):
                raise ValueError('Duplicate or symlink parent')
            names.add(str(path))
        destination.mkdir(mode=0o755)
        for entry in entries:
            path = destination / entry['path']
            if entry['kind'] == 'directory':
                path.mkdir(parents=True, exist_ok=True)
            elif entry['kind'] == 'file':
                path.parent.mkdir(parents=True, exist_ok=True)
                if entry['reuse']:
                    source = baseline / entry['path']
                    if source.is_symlink() or not source.is_file():
                        raise ValueError('Missing baseline file')
                    source_stream = source.open('rb')
                else:
                    member = archive.getmember('payload/' + entry['path'])
                    if not member.isfile():
                        raise ValueError('Invalid payload')
                    source_stream = archive.extractfile(member)
                checksum = hashlib.sha256()
                with source_stream, path.open('xb') as output:
                    for chunk in iter(lambda: source_stream.read(1024 * 1024), b''):
                        checksum.update(chunk)
                        output.write(chunk)
                if checksum.hexdigest() != entry['sha256']:
                    raise ValueError('Checksum mismatch: ' + entry['path'])
                path.chmod(entry['mode'])
            elif entry['kind'] != 'symlink':
                raise ValueError('Unsupported entry')
        for entry in entries:
            if entry['kind'] != 'symlink':
                continue
            target = entry['target']
            resolved = posixpath.normpath(posixpath.join(posixpath.dirname(entry['path']), target))
            if target.startswith('/') or resolved == '..' or resolved.startswith('../'):
                raise ValueError('Unsafe symlink')
            path = destination / entry['path']
            path.parent.mkdir(parents=True, exist_ok=True)
            path.symlink_to(target)
    if (destination / 'RELEASE_SOURCE_SHA').read_text().strip() != expected_source:
        raise ValueError('Wrong reconstructed source')
    print('RELEASE_RECONSTRUCTED_AND_VERIFIED ' + expected_source)


if __name__ == '__main__':
    restore(*sys.argv[1:])
