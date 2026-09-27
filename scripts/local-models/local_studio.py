"""Loopback-only testing UI. Never reads API keys or calls paid inference providers."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import subprocess
import threading
import time
import urllib.request
import uuid

ROOT = Path('D:/SASI-local-runtime')
JOBS = {}
LOCK = threading.Lock()
POOL = ThreadPoolExecutor(max_workers=1)
BUSY = False
PORT = 8765


def capabilities():
    text=False
    try:
        with urllib.request.urlopen('http://127.0.0.1:8766/health',timeout=2) as response:
            text=json.load(response).get('status')=='ok'
    except Exception:
        pass
    return {'service':'sasi-local-studio','text':text,'image':(ROOT/'models/sd-v1-5.safetensors').is_file(),
            'video':False,'busy':BUSY}


def execute(job_id, kind, prompt, steps=8):
    global BUSY
    start=time.monotonic()
    try:
        with LOCK: JOBS[job_id]={'state':'running','kind':kind}
        if kind=='text':
            payload={'model':'SASI-local-Qwen','messages':[
                {'role':'system','content':'You are SASI, a local assistant. Answer in the user language. Be honest about uncertainty and never claim tools were executed.'},
                {'role':'user','content':prompt+' /no_think'}],
                'max_tokens':384,'temperature':0.3,'stream':False}
            request=urllib.request.Request('http://127.0.0.1:8766/v1/chat/completions',
                data=json.dumps(payload).encode(),headers={'Content-Type':'application/json'})
            with urllib.request.urlopen(request,timeout=180) as response:
                data=json.load(response)
            text=data['choices'][0]['message']['content'].strip()
            if not text: raise RuntimeError('EMPTY_TEXT')
            result={'text':text}
        else:
            output=ROOT/'outputs'/(job_id+'.png')
            output.parent.mkdir(parents=True,exist_ok=True)
            command=[str(ROOT/'sd/sd-cli.exe'),'-m',str(ROOT/'models/sd-v1-5.safetensors'),
                '-p',prompt,'-o',str(output),'-W','256','-H','256','--steps',str(steps),
                '--type','q8_0','--cfg-scale','7','--sampling-method','euler','-t','4']
            with (ROOT/'outputs'/(job_id+'.log')).open('wb') as log:
                subprocess.run(command,stdout=log,stderr=subprocess.STDOUT,timeout=1200,check=True,
                    creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
            if not output.is_file() or output.stat().st_size<100: raise RuntimeError('EMPTY_IMAGE')
            result={'image':'/image/'+job_id}
        with LOCK:
            JOBS[job_id]={'state':'succeeded','kind':kind,**result,'elapsedSeconds':round(time.monotonic()-start,2)}
    except Exception as error:
        with LOCK: JOBS[job_id]={'state':'failed','kind':kind,'error':type(error).__name__}
    finally:
        with LOCK: BUSY=False


class Handler(BaseHTTPRequestHandler):
    def respond(self, status, data, content_type='application/json; charset=utf-8'):
        body=json.dumps(data,ensure_ascii=False).encode() if isinstance(data,dict) else data
        self.send_response(status)
        self.send_header('Content-Type',content_type)
        self.send_header('Content-Length',str(len(body)))
        self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('X-Frame-Options','DENY')
        self.end_headers()
        self.wfile.write(body)

    def valid_host(self):
        return self.headers.get('Host') in (f'127.0.0.1:{PORT}',f'localhost:{PORT}')

    def do_GET(self):
        if not self.valid_host(): return self.respond(403,{'error':'HOST_REJECTED'})
        if self.path=='/':
            return self.respond(200,Path(__file__).with_name('studio.html').read_bytes(),'text/html; charset=utf-8')
        if self.path=='/status': return self.respond(200,capabilities())
        if self.path.startswith('/jobs/'):
            with LOCK: job=JOBS.get(self.path.removeprefix('/jobs/'))
            return self.respond(200 if job else 404,job or {'error':'NOT_FOUND'})
        if self.path.startswith('/image/'):
            identity=self.path.removeprefix('/image/')
            with LOCK: job=JOBS.get(identity)
            if job and job['state']=='succeeded' and job['kind']=='image':
                return self.respond(200,(ROOT/'outputs'/(identity+'.png')).read_bytes(),'image/png')
        self.respond(404,{'error':'NOT_FOUND'})

    def do_POST(self):
        global BUSY
        origin=self.headers.get('Origin')
        if not self.valid_host() or (origin and origin not in (f'http://127.0.0.1:{PORT}',f'http://localhost:{PORT}')):
            return self.respond(403,{'error':'ORIGIN_REJECTED'})
        if self.path!='/jobs': return self.respond(404,{'error':'NOT_FOUND'})
        if self.headers.get('Content-Type','').split(';')[0]!='application/json':
            return self.respond(415,{'error':'JSON_REQUIRED'})
        try:
            self.connection.settimeout(10)
            length=int(self.headers.get('Content-Length','0'))
            if not 0<length<=16384: return self.respond(413,{'error':'INPUT_TOO_LARGE'})
            body=json.loads(self.rfile.read(length))
            kind,prompt=body.get('kind'),body.get('prompt')
            if kind not in ('text','image') or not isinstance(prompt,str) or not 0<len(prompt.strip())<=2000:
                return self.respond(400,{'error':'INVALID_INPUT'})
        except (ValueError,AttributeError): return self.respond(400,{'error':'INVALID_JSON'})
        if not capabilities()[kind]: return self.respond(503,{'error':'MODEL_NOT_READY'})
        with LOCK:
            if BUSY: return self.respond(409,{'error':'WORKER_BUSY'})
            BUSY=True
            identity=str(uuid.uuid4())
            JOBS[identity]={'state':'queued','kind':kind}
            # This is a local smoke-test UI, not a durable production queue.
            if len(JOBS)>100: del JOBS[next(iter(JOBS))]
        POOL.submit(execute,identity,kind,prompt.strip(),20 if body.get('quality')=='clear' else 8)
        return self.respond(202,{'id':identity})


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--root',type=Path,default=ROOT)
    args=parser.parse_args()
    ROOT=args.root.resolve()
    print(f'SASI local studio: http://127.0.0.1:{PORT}',flush=True)
    ThreadingHTTPServer(('127.0.0.1',PORT),Handler).serve_forever()
