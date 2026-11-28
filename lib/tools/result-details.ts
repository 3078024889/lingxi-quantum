const labels:Record<string,[string,string]>={
 files:['文件数量','Files'],inputFiles:['原始文件','Input files'],outputFiles:['生成文件','Output files'],
 pages:['页数','Pages'],slides:['幻灯片数','Slides'],images:['图片数量','Images'],
 characters:['文字数量','Characters'],totalCharacters:['文字数量','Characters'],
 rows:['行数','Rows'],totalRows:['总行数','Total rows'],columns:['列数','Columns'],
 originalKB:['原文件大小（KB）','Original size (KB)'],resultKB:['结果大小（KB）','Result size (KB)'],
 width:['宽度（像素）','Width (pixels)'],height:['高度（像素）','Height (pixels)'],
 content:['识别内容','Recognized content'],textItems:['识别的文字片段','Text sections'],
 structureConfidence:['表格识别参考值','Table recognition confidence'],preset:['保存用途','Output preset'],
 file:['文件名称','File name'],size:['文件大小（字节）','File size (bytes)'],bytes:['文件大小（字节）','File size (bytes)'],
 MD5:['MD5 校验值','MD5 checksum'],SHA256:['SHA256 校验值','SHA256 checksum'],
 fileA:['第一个文件','First file'],fileB:['第二个文件','Second file'],
 sizeA:['第一个文件大小（字节）','First file size (bytes)'],sizeB:['第二个文件大小（字节）','Second file size (bytes)'],
 sameSize:['文件大小相同','Same file size'],identical:['文件内容相同','Identical file contents'],
 sha256A:['第一个文件 SHA256','First file SHA256'],sha256B:['第二个文件 SHA256','Second file SHA256'],
};
/** Unknown internal identifiers stay out of the result UI. */
export function resultDetailLabel(key:string,lang:string):string|null{
 const label=labels[key];if(label)return label[lang==='zh'?0:1];
 return /\p{Script=Han}/u.test(key)&&key.length<=80?key:null;
}
