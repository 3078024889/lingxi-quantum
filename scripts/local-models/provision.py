"""Install explicitly selected free local inference assets; no paid API credentials."""
import argparse
import hashlib
import json
from pathlib import Path
import urllib.request
import zipfile
from concurrent.futures import ThreadPoolExecutor
import time

ROOT = Path(__file__).resolve().parent


def ranged_download(asset, partial):
    """Bounded parallel ranges avoid large-response stalls; verify every range and final hash."""
    size=asset['size']
    chunk_size=16*1024*1024
    ranges=[(start,min(size-1,start+chunk_size-1)) for start in range(0,size,chunk_size)]
    parts=partial.parent/(partial.name+'.chunks')
    parts.mkdir(exist_ok=True)
    def fetch(bounds):
        start,end=bounds
        part=parts/str(start)
        if part.is_file() and part.stat().st_size==end-start+1: return part
        for attempt in range(3):
            try:
                req=urllib.request.Request(asset['url']+f'?download=true&range={start}&attempt={attempt}&request={time.time_ns()}',headers={'Range':f'bytes={start}-{end}'})
                with urllib.request.urlopen(req,timeout=45) as response:
                    if response.status!=206 or response.headers.get('Content-Range')!=f'bytes {start}-{end}/{size}':
                        raise RuntimeError('INVALID_DOWNLOAD_RANGE')
                    content=response.read(end-start+2)
                if len(content)!=end-start+1: raise RuntimeError('INCOMPLETE_DOWNLOAD_RANGE')
                part.write_bytes(content)
                return part
            except Exception:
                if attempt==2: raise
                time.sleep(1+attempt)
    with ThreadPoolExecutor(max_workers=4) as pool, partial.open('wb') as output:
        for index,part in enumerate(pool.map(fetch,ranges)):
            output.write(part.read_bytes())
            if index%8==0: print(f'Downloaded {min(size,(index+1)*chunk_size)//1024//1024} / {size//1024//1024} MiB',flush=True)


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as source:
        for chunk in iter(lambda: source.read(8 * 1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def provision(name, asset, destination):
    target = destination / asset['file']
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists() or digest(target) != asset['sha256']:
        partial = target.with_suffix(target.suffix + '.part')
        print('Downloading', name, flush=True)
        if asset.get('size',0)>1024*1024*1024:
            ranged_download(asset,partial)
        else:
            with urllib.request.urlopen(asset['url'], timeout=60) as response, partial.open('wb') as output:
                while chunk := response.read(4 * 1024 * 1024):
                    output.write(chunk)
        if digest(partial) != asset['sha256']:
            raise RuntimeError('CHECKSUM_MISMATCH: ' + name)
        partial.replace(target)
    if asset.get('extract'):
        folder = (destination / asset['extract']).resolve()
        folder.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(target) as archive:
            for entry in archive.infolist():
                if not (folder / entry.filename).resolve().is_relative_to(folder):
                    raise RuntimeError('UNSAFE_ARCHIVE_PATH')
            archive.extractall(folder)
    print('Verified', name, flush=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('assets', nargs='+', choices=['text-runtime','image-runtime','text-model','image-model'])
    parser.add_argument('--root', type=Path, default=Path('D:/SASI-local-runtime'))
    args = parser.parse_args()
    manifest = json.loads((ROOT/'manifest.json').read_text(encoding='utf-8'))
    for name in args.assets:
        provision(name, manifest['assets'][name], args.root.resolve())
    (args.root/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')


if __name__ == '__main__':
    main()
