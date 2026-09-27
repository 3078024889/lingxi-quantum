#!/usr/bin/env python3
import argparse,json
p=argparse.ArgumentParser();p.add_argument('--input',required=True);p.add_argument('--lang',default='ch');a=p.parse_args()
from paddleocr import PaddleOCR
engine=PaddleOCR(lang=a.lang,use_doc_orientation_classify=True,use_doc_unwarping=True,use_textline_orientation=True)
rows=[]
try:
 result=engine.predict(a.input)
 for item in result:
  data=item.json if hasattr(item,'json') else item
  if callable(data): data=data()
  if isinstance(data,str):
   try:data=json.loads(data)
   except: data={'text':data}
  if isinstance(data,dict): rows.append(data)
except Exception:
 # Compatibility with older PaddleOCR APIs.
 engine=PaddleOCR(lang=a.lang,use_angle_cls=True)
 result=engine.ocr(a.input,cls=True)
 for block in result or []:
  for line in block or []:
   try: rows.append({'box':line[0],'text':line[1][0],'score':float(line[1][1])})
   except Exception: pass
texts=[]
for r in rows:
 if isinstance(r,dict):
  if isinstance(r.get('text'),str): texts.append(r['text'])
  rr=r.get('res') or r.get('data')
  if isinstance(rr,dict):
   t=rr.get('rec_texts')
   if isinstance(t,list): texts.extend(str(x) for x in t)
print(json.dumps({'text':'\n'.join(x for x in texts if x).strip(),'rows':rows},ensure_ascii=False))
