"""Run actual worker verifier against requests signed by the actual TS client.
FastAPI request transport is replaced; signature, body bounds and replay logic are not.
"""
import asyncio
import json
import os
from pathlib import Path
import sys
import types

data = json.load(sys.stdin)
os.environ['SASI_NATIVE_COMPUTE_SECRET'] = data['secret']
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'workers' / 'sasi-compute-v19'))
class HTTPException(Exception):
    def __init__(self, status_code, detail):
        self.status_code, self.detail = status_code, detail
fastapi = types.ModuleType('fastapi')
fastapi.HTTPException, fastapi.Request = HTTPException, object
sys.modules['fastapi'] = fastapi
from sasi_worker import security

class Request:
    def __init__(self, record, target=None, body=None):
        self.headers = record['headers']
        self.method = record['method']
        path, _, query = (target or record['target']).partition('?')
        self.url = types.SimpleNamespace(path=path, query=query)
        self.body = (record['body'] if body is None else body).encode()
    async def stream(self):
        for pos in range(0, len(self.body), 65536):
            yield self.body[pos:pos+65536]

async def reject(request, status, detail):
    try:
        await security.verify_request(request)
        raise AssertionError('unexpected acceptance')
    except HTTPException as error:
        assert (error.status_code, error.detail) == (status, detail)

async def main():
    for record in data['records']:
        assert await security.verify_request(Request(record)) == record['body'].encode()
        await reject(Request(record), 409, 'SIGNATURE_REPLAYED')
    record = data['records'][0]
    await reject(Request(record, target=record['target'].replace('owner%40example.test','other')), 401, 'SIGNATURE_INVALID')
    await reject(Request(record, target=record['target'].split('?')[0]), 401, 'SIGNATURE_INVALID')
    await reject(Request(data['records'][2], body='tampered'), 401, 'SIGNATURE_INVALID')
    await reject(Request(record, body='a'*(1024*1024+1)), 413, 'REQUEST_TOO_LARGE')
    expired = {**record, 'headers': {**record['headers'], 'x-lingxi-timestamp':'1'}}
    await reject(Request(expired), 401, 'SIGNATURE_EXPIRED')
    print('PASS: actual TypeScript GET/DELETE owner-query and POST signatures verified by actual Python worker; owner/path/body tampering, replay, expiry and streamed body limit rejected. Isolated request transport, no real jobs.')
asyncio.run(main())
