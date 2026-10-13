'use strict';
self.onmessage = event => {
 try {
  const {pattern,text}=event.data;
  if(typeof pattern!=='string'||typeof text!=='string'||pattern.length>20000||text.length>500000)throw Error('REGEX_INPUT_TOO_LARGE');
  const parsed=pattern.match(/^\/(.*)\/([dgimsuvy]*)$/);
  if(!parsed)throw Error('REGEX_INVALID');
  const regex=new RegExp(parsed[1],parsed[2].includes('g')?parsed[2]:parsed[2]+'g');
  const matches=[];let bytes=0;
  for(const match of text.matchAll(regex)){
   const row={index:matches.length+1,match:match[0],position:match.index,groups:match.slice(1)};
   bytes+=JSON.stringify(row).length;
   if(matches.length>=10000||bytes>2*1024*1024)throw Error('REGEX_RESULT_TOO_LARGE');
   matches.push(row);
  }
  self.postMessage({ok:true,matches});
 }catch(error){self.postMessage({ok:false,error:/^REGEX_/.test(error.message)?error.message:'REGEX_INVALID'})}
};
self.postMessage({ready:true});
