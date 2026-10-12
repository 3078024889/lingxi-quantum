export function convertIntegerBase(input:string,from:number,to:number):string{
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<2||from>36||to<2||to>36)throw Error('BASE_INVALID');
 let text=input.trim();if(!text||text.length>10000)throw Error('INTEGER_INVALID');
 const negative=text[0]==='-';if(negative||text[0]==='+')text=text.slice(1);
 if(!text||!/^[0-9a-z]+$/i.test(text))throw Error('INTEGER_INVALID');
 let value=BigInt(0);for(const character of text.toLowerCase()){const digit='0123456789abcdefghijklmnopqrstuvwxyz'.indexOf(character);if(digit>=from)throw Error('INTEGER_INVALID');value=value*BigInt(from)+BigInt(digit)}
 return (negative?-value:value).toString(to).toUpperCase();
}

export function csvToJson(input:string):Record<string,string>[] {
 if(input.length>500000)throw Error('CSV_TOO_LARGE');
 const rows:string[][]=[];let row:string[]=[],cell='',quoted=false,closed=false;
 for(let i=0;i<=input.length;i++){
  const character=i===input.length?'\n':input[i];
  if(quoted){if(i===input.length)throw Error('CSV_UNCLOSED_QUOTE');if(character==='"'){if(input[i+1]==='"'){cell+='"';i++}else{quoted=false;closed=true}}else cell+=character;continue}
  if(character==='"'){if(cell||closed)throw Error('CSV_QUOTE_INVALID');quoted=true;continue}
  if(character===','||character==='\n'||character==='\r'){
   row.push(cell);cell='';closed=false;
   if(character!==','){if(row.some(value=>value.length))rows.push(row);row=[];if(character==='\r'&&input[i+1]==='\n')i++}
  }else{if(closed)throw Error('CSV_QUOTE_INVALID');cell+=character}
 }
 if(!rows.length)return[];
 const headers=rows[0];headers[0]=headers[0].replace(/^\uFEFF/,'');
 if(headers.some(header=>!header)||new Set(headers).size!==headers.length)throw Error('CSV_HEADER_INVALID');
 return rows.slice(1).map(values=>{if(values.length!==headers.length)throw Error('CSV_COLUMN_COUNT');return Object.fromEntries(headers.map((header,index)=>[header,values[index]]))});
}
