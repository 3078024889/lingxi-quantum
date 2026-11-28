#!/usr/bin/env python3
"""Package exact-source releases without retransmitting unchanged runtime files."""
import hashlib
import json
import os
import pathlib
import sys
import tarfile


def digest(stream):
    value = hashlib.sha256()
    for chunk in iter(lambda: stream.read(1024 * 1024), b''):
        value.update(chunk)
    return value.hexdigest()


def build(baseline_archive, release_dir, output, baseline_sha, release_sha):
    release_dir = pathlib.Path(release_dir)
    baseline = {}
    with tarfile.open(baseline_archive, 'r:gz') as archive:
        for member in archive:
            name = str(pathlib.PurePosixPath(member.name))
            if member.isfile() or member.islnk():
                baseline[name] = ('file', digest(archive.extractfile(member)))
            elif member.issym():
                baseline[name] = ('symlink', member.linkname)
    entries = []
    with tarfile.open(output, 'w:gz', compresslevel=9) as archive:
        for directory, dirs, files in os.walk(release_dir, followlinks=False):
            for name in sorted(dirs + files):
                path = pathlib.Path(directory, name)
                relative = path.relative_to(release_dir).as_posix()
                if path.is_symlink():
                    target = os.readlink(path)
                    entries.append({'path': relative, 'kind': 'symlink', 'target': target})
                elif path.is_dir():
                    entries.append({'path': relative, 'kind': 'directory'})
                elif path.is_file():
                    with path.open('rb') as stream:
                        checksum = digest(stream)
                    reuse = baseline.get(relative) == ('file', checksum)
                    entries.append({'path': relative, 'kind': 'file', 'sha256': checksum,
                                    'mode': path.stat().st_mode & 0o777, 'reuse': reuse})
                    if not reuse:
                        archive.add(path, arcname='payload/' + relative, recursive=False)
                else:
                    raise ValueError('Unsupported release entry: ' + relative)
        manifest = {'version': 1, 'baseline': baseline_sha, 'source': release_sha,
                    'entries': entries}
        import io
        encoded = json.dumps(manifest, separators=(',', ':')).encode()
        info = tarfile.TarInfo('delta-manifest.json')
        info.size = len(encoded)
        info.mode = 0o600
        archive.addfile(info, io.BytesIO(encoded))
    print(json.dumps({'files': len(entries), 'changed': sum(
        entry['kind'] == 'file' and not entry['reuse'] for entry in entries),
        'bytes': pathlib.Path(output).stat().st_size}))


if __name__ == '__main__':
    build(*sys.argv[1:])
