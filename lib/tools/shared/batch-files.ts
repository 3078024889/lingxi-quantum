"use client";

import JSZip from "jszip";
import {safeFilename} from './download';
import {registerExportBundle} from '../commerce/export-access-client';

export async function filesToZip(
  files: Array<{ name: string; blob: Blob }>,
  zipName = "lingxifield-results.zip",
) {
  if(files.length>1000||files.reduce((size,file)=>size+file.blob.size,0)>256*1024*1024)throw Error('ZIP_INPUT_TOO_LARGE');
  const zip = new JSZip();
  const used = new Set<string>();

  for (const file of files) {
    const clean=safeFilename(file.name||'file');
    const base=clean==='.'||clean==='..'?'file':clean;
    let name=base,index=2;
    const dot=base.lastIndexOf('.');
    while(used.has(name.toLowerCase()))name=dot>0?`${base.slice(0,dot)}-${index++}${base.slice(dot)}`:`${base}-${index++}`;
    used.add(name.toLowerCase());
    zip.file(name,await file.blob.arrayBuffer());
  }

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  registerExportBundle(blob,files.map(file=>file.blob));
  return { name: safeFilename(zipName), blob };
}
