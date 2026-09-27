#!/usr/bin/env python3
import argparse,json,sys
p=argparse.ArgumentParser();p.add_argument('--from',dest='src',required=True);p.add_argument('--to',dest='dst',required=True);a=p.parse_args()
text=sys.stdin.read()
import argostranslate.translate as tr
langs=tr.get_installed_languages()
src=next((x for x in langs if x.code==a.src),None);dst=next((x for x in langs if x.code==a.dst),None)
if not src or not dst: raise SystemExit('ARGOS_LANGUAGE_NOT_INSTALLED')
translation=src.get_translation(dst)
print(json.dumps({'text':translation.translate(text)},ensure_ascii=False))
