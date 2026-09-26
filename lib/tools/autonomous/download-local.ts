"use client";

import {downloadBlob} from "@/lib/tools/shared/download";

export function saveText(text:string,name:string,type="text/plain;charset=utf-8"){
  const blob=new Blob([text],{type});
  void downloadBlob(blob,name);
}

export function saveBlob(blob:Blob,name:string){
  void downloadBlob(blob,name);
}
