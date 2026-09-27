#!/usr/bin/env python3
import argparse,cv2
p=argparse.ArgumentParser();p.add_argument('--input',required=True);p.add_argument('--mask',required=True);p.add_argument('--output',required=True);a=p.parse_args()
img=cv2.imread(a.input,cv2.IMREAD_COLOR);mask=cv2.imread(a.mask,cv2.IMREAD_GRAYSCALE)
if img is None or mask is None: raise SystemExit('INPUT_OR_MASK_INVALID')
if mask.shape[:2]!=img.shape[:2]: mask=cv2.resize(mask,(img.shape[1],img.shape[0]),interpolation=cv2.INTER_NEAREST)
_,mask=cv2.threshold(mask,8,255,cv2.THRESH_BINARY);out=cv2.inpaint(img,mask,3,cv2.INPAINT_TELEA)
if not cv2.imwrite(a.output,out): raise SystemExit('OUTPUT_WRITE_FAILED')
