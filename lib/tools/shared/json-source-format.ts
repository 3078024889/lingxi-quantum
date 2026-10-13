/** Format source tokens without converting numbers or discarding duplicate keys. */
export function formatJsonSource(source:string,pretty=true):string{
 if(source.length>500000)throw Error('JSON_INPUT_TOO_LARGE');
 const tokens:string[]=[];let depth=0;
 for(let i=0;i<source.length;){
  const c=source[i];if(/\s/.test(c)){i++;continue}
  const start=i;
  if(c==='"'){i++;while(i<source.length){if(source[i]==='\\'){i+=2;continue}if(source[i++]==='"')break}}
  else if('{}[],:'.includes(c)){i++;if(c==='{'||c==='['){if(++depth>256)throw Error('JSON_DEPTH_LIMIT')}else if(c==='}'||c===']')depth--;}
  else{while(i<source.length&&!/[\s{}\[\],:]/.test(source[i]))i++;}
  tokens.push(source.slice(start,i));
 }
 JSON.parse(source); // Syntax validation only. Never serialize this lossy object.
 if(!pretty)return tokens.join('');
 const output:string[]=[];let level=0,size=0;
 const append=(s:string)=>{size+=s.length;if(size>2*1024*1024)throw Error('JSON_OUTPUT_TOO_LARGE');output.push(s)};
 const newline=()=>append('\n'+'  '.repeat(level));
 for(let i=0;i<tokens.length;i++){
  const token=tokens[i],previous=tokens[i-1];
  if(token==='{'||token==='['){append(token);level++;if(tokens[i+1]!=='}'&&tokens[i+1]!==']')newline();}
  else if(token==='}'||token===']'){level--;if(previous!=='{'&&previous!=='[')newline();append(token);}
  else if(token===','){append(token);newline();}
  else if(token===':')append(': ');
  else append(token);
 }
 return output.join('');
}
