import argparse,json,os

def ts(v):
    ms=max(0,int(round(v*1000)));h=ms//3600000;ms%=3600000;m=ms//60000;ms%=60000;s=ms//1000;ms%=1000
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def main():
    p=argparse.ArgumentParser();p.add_argument('--input',required=True);p.add_argument('--language',default=None);p.add_argument('--model',default=os.getenv('LINGXI_FASTER_WHISPER_MODEL','small'))
    a=p.parse_args()
    from faster_whisper import WhisperModel
    device=os.getenv('LINGXI_WHISPER_DEVICE','cpu');compute=os.getenv('LINGXI_WHISPER_COMPUTE','int8' if device=='cpu' else 'float16')
    model=WhisperModel(a.model,device=device,compute_type=compute)
    segs,info=model.transcribe(a.input,language=a.language,beam_size=5,vad_filter=True)
    chunks=[];srt=[]
    for i,x in enumerate(segs,1):
        t=(x.text or '').strip()
        if not t: continue
        chunks.append(t);srt.append(f"{i}\n{ts(x.start)} --> {ts(x.end)}\n{t}\n")
    print(json.dumps({'text':' '.join(chunks).strip(),'srt':'\n'.join(srt).strip(),'language':getattr(info,'language',None),'duration':getattr(info,'duration',None)},ensure_ascii=False))
if __name__=='__main__': main()
