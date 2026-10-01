"""Build the attributed Taiwan FDA reference layer from official dataset 8543.
Usage (Windows): python build-tfda-catalog.py downloaded-json.zip
Simplified names are display/search derivatives; original labels remain preserved.
"""
import ctypes,hashlib,json,sys,zipfile
from pathlib import Path
archive=Path(sys.argv[1]); root=Path(__file__).resolve().parents[2]
def simplified(text):
    if not text:return ''
    output=ctypes.create_unicode_buffer(len(text)*2+4)
    result=ctypes.windll.kernel32.LCMapStringEx('zh-CN',0x02000000,text,len(text),output,len(output),None,None,0)
    if not result: raise RuntimeError('Chinese conversion failed')
    return output.value
z=zipfile.ZipFile(archive)
rows=json.loads(z.read(z.namelist()[0]).decode('utf-8-sig'))
keys={'熱量':'kcal','粗蛋白':'protein_g','粗脂肪':'fat_g','總碳水化合物':'carbs_g','膳食纖維':'fiber_g','糖質總量':'sugar_g','鈉':'sodium_mg'}
foods={}
for r in rows:
    code=r['整合編號'];original=r['樣品名稱'];english=r.get('樣品英文名稱') or ''
    f=foods.setdefault(code,{'id':2000000000+int(hashlib.sha256(code.encode()).hexdigest()[:7],16),'code':code,'name':original,'name_zh':simplified(original),'name_en':english,'description':r.get('內容物描述') or '', 'aliases':[original,simplified(original),r.get('俗名') or '',simplified(r.get('俗名') or '')],'n':{}})
    key=keys.get(r['分析項']);value=r.get('每100克含量')
    if key and value is not None and str(value).strip():
        expected='kcal' if key=='kcal' else 'mg' if key=='sodium_mg' else 'g'
        if r.get('含量單位')==expected:f['n'][key]=float(value)
items=[f for f in foods.values() if all(k in f['n'] for k in ['kcal','protein_g','carbs_g','fat_g'])]
assert len({f['id'] for f in items})==len(items)
out=root/'data/nutrition/tfda-foods.json';out.write_text(json.dumps(items,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
manifest={'source':'Taiwan Food and Drug Administration','dataset':'https://data.gov.tw/dataset/8543','download':'https://data.fda.gov.tw/data/opendata/export/20/json','license':'Open Government Data License, version 1.0','license_url':'https://data.gov.tw/license','archive_sha256':hashlib.file_digest(archive.open('rb'),'sha256').hexdigest(),'records':len(items),'file_sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'basis':'per 100 g; absent measurements omitted; original names preserved; simplified names derived with Windows LCMapStringEx'}
(out.parent/'tfda-foods.manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps(manifest));print(json.dumps([f for f in items if f['name']=='油條']))
