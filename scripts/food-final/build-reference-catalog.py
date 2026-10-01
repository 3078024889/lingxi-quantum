"""Build a reproducible, credential-free nutrition index from USDA's CC0 CSV release.
Usage: python scripts/food-final/build-reference-catalog.py <USDA zip>
No estimates or missing values are invented. Branded products are excluded.
"""
import csv, hashlib, io, json, sys, zipfile
from pathlib import Path

archive=Path(sys.argv[1]); root=Path(__file__).resolve().parents[2]
z=zipfile.ZipFile(archive); prefix=next(n[:-len('food.csv')] for n in z.namelist() if n.endswith('/food.csv'))
def rows(name):
    return csv.DictReader(io.TextIOWrapper(z.open(prefix+name),encoding='utf-8-sig',newline=''))
foods={}
for r in rows('food.csv'):
    if r['data_type'] in {'sr_legacy_food','survey_fndds_food','foundation_food'}:
        foods[int(r['fdc_id'])]={'id':int(r['fdc_id']),'name':r['description'],'type':r['data_type'],'n':{},'portions':[]}
print(f'FOODS={len(foods)}',flush=True)
keys={'1008':'kcal','1003':'protein_g','1004':'fat_g','1005':'carbs_g','1079':'fiber_g','2000':'sugar_g','1093':'sodium_mg'}
for r in rows('food_nutrient.csv'):
    f=foods.get(int(r['fdc_id'])) if r.get('fdc_id','').isdigit() else None
    if f is not None and r['nutrient_id'] in keys and r['amount']:
        f['n'][keys[r['nutrient_id']]]=float(r['amount'])
for r in rows('food_portion.csv'):
    f=foods.get(int(r['fdc_id'])) if r.get('fdc_id','').isdigit() else None
    if f is not None and r.get('gram_weight') and r.get('amount'):
        label=r.get('portion_description') or r.get('modifier') or ''
        if label and float(r['gram_weight'])>0 and float(r['amount'])>0:
            f['portions'].append({'label':label,'grams':round(float(r['gram_weight'])/float(r['amount']),2)})
items=[f for f in foods.values() if all(k in f['n'] for k in ['kcal','protein_g','carbs_g','fat_g'])]
out=root/'data/nutrition/reference-foods.json'
out.write_text(json.dumps(items,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
manifest={'source':'USDA FoodData Central','license':'CC0-1.0','url':'https://fdc.nal.usda.gov/download-datasets/','archive':archive.name,'archive_sha256':hashlib.file_digest(archive.open('rb'),'sha256').hexdigest(),'records':len(items),'file_sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'basis':'nutrients per 100 g; original FDC IDs retained; missing measurements remain absent'}
(out.parent/'reference-foods.manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps(manifest),flush=True)
print(json.dumps([{'id':f['id'],'name':f['name']} for f in items if any(t in f['name'].lower() for t in ['youtiao','dough, fried','blueberries','taco'])][:18]))
