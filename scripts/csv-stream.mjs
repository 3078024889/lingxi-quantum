import fs from "node:fs";
import {StringDecoder} from "node:string_decoder";

/**
 * Streaming RFC4180 CSV reader.
 * Handles quoted commas, escaped quotes and embedded CR/LF without reading the file into one JS string.
 */
export async function* csvRows(path){
  const stream=fs.createReadStream(path,{highWaterMark:1024*1024});
  const dec=new StringDecoder("utf8");
  let row=[],field="",quoted=false,pendingQuote=false,skipLF=false,first=true;
  function emitField(){row.push(field);field=""}
  for await(const buf of stream){
    const s=dec.write(buf);
    for(let i=0;i<s.length;i++){
      let c=s[i];
      if(first){first=false;if(c==="\uFEFF")continue}
      if(skipLF){skipLF=false;if(c==="\n")continue}
      if(quoted){
        if(pendingQuote){
          if(c==='"'){field+='"';pendingQuote=false;continue}
          quoted=false;pendingQuote=false;
          if(c===","){emitField();continue}
          if(c==="\r"){emitField();yield row;row=[];skipLF=true;continue}
          if(c==="\n"){emitField();yield row;row=[];continue}
          if(c===" "||c==="\t")continue;
          field+=c;continue;
        }
        if(c==='"'){pendingQuote=true}else field+=c;
        continue;
      }
      if(c==='"' && field===""){quoted=true;continue}
      if(c===","){emitField();continue}
      if(c==="\r"){emitField();yield row;row=[];skipLF=true;continue}
      if(c==="\n"){emitField();yield row;row=[];continue}
      field+=c;
    }
  }
  field+=dec.end();
  if(pendingQuote){quoted=false;pendingQuote=false}
  if(field.length||row.length){emitField();yield row}
}
export function rowObject(header,row){
 const o={};for(let i=0;i<header.length;i++)o[header[i]]=row[i]??"";return o;
}
