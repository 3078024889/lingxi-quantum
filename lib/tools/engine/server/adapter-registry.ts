import {qpdfCheck,qpdfLinearize,qpdfOptimize} from "./adapters/qpdf";
import {pdfcpuMerge,pdfcpuOptimize,pdfcpuSplit,pdfcpuValidate} from "./adapters/pdfcpu";
import {extractAudio,transcodeMedia} from "./adapters/ffmpeg";
import {whisperTranscribe} from "./adapters/whispercpp";
import {paddleOcr,argosTranslate,opencvInpaint} from "./adapters/python";
import {fasterWhisper} from "./adapters/fasterwhisper";
import {exiftoolJson,exiftoolRemoveAll} from "./adapters/exiftool";
import {urlToPdf,htmlToPdf} from "./adapters/gotenberg";
import {openccFile,openccText} from "./adapters/opencc";
import {sharpMetadata,sharpConvert,sharpResize,sharpCompress,sharpStripMetadata} from "./adapters/sharp";
import {docxToText,docxToHtml,xlsxToCsv,csvToXlsx} from "./adapters/document";
import {sanitizeHtml,extractArticle,htmlToMarkdown} from "./adapters/web";

export type ServerAdapterOperation=(args:Record<string,unknown>)=>Promise<unknown>;
const need=(a:Record<string,unknown>,k:string)=>{const v=a[k];if(typeof v!=="string"||!v)throw new Error(`MISSING_${k.toUpperCase()}`);return v};
const optNum=(a:Record<string,unknown>,k:string)=>{const v=Number(a[k]);return Number.isFinite(v)?v:undefined};

export const SERVER_ADAPTERS:Record<string,Record<string,ServerAdapterOperation>>={
 qpdf:{
  check:a=>qpdfCheck(need(a,"input")),
  optimize:a=>qpdfOptimize(need(a,"input"),need(a,"output")),
  linearize:a=>qpdfLinearize(need(a,"input"),need(a,"output"))
 },
 pdfcpu:{
  validate:a=>pdfcpuValidate(need(a,"input")),
  optimize:a=>pdfcpuOptimize(need(a,"input"),need(a,"output")),
  merge:a=>pdfcpuMerge(need(a,"output"),Array.isArray(a.inputs)?a.inputs.map(String):[]),
  split:a=>pdfcpuSplit(need(a,"input"),need(a,"outputDir"))
 },
 ffmpeg:{
  extractAudio:a=>extractAudio(need(a,"input"),need(a,"output")),
  transcode:a=>transcodeMedia(need(a,"input"),need(a,"output"),Array.isArray(a.args)?a.args.map(String):[])
 },
 whispercpp:{
  transcribe:a=>whisperTranscribe(need(a,"input"),need(a,"outputBase"),typeof a.language==="string"?a.language:undefined)
 },
 "faster-whisper":{
  transcribe:a=>fasterWhisper(need(a,"input"),typeof a.language==="string"?a.language:undefined)
 },
 paddleocr:{
  recognize:a=>paddleOcr(need(a,"input"),typeof a.lang==="string"?a.lang:"ch")
 },
 argos:{
  translate:a=>argosTranslate(need(a,"text"),need(a,"from"),need(a,"to"))
 },
 opencv:{
  inpaint:a=>opencvInpaint(need(a,"input"),need(a,"mask"),need(a,"output"))
 },
 exiftool:{
  inspect:a=>exiftoolJson(need(a,"input")),
  removeAll:a=>exiftoolRemoveAll(need(a,"input"),need(a,"output"))
 },
 gotenberg:{
  urlToPdf:a=>urlToPdf(need(a,"url")),
  htmlToPdf:a=>htmlToPdf(new Blob([need(a,"html")],{type:"text/html"}),typeof a.fileName==="string"?a.fileName:"index.html")
 },
 opencc:{
  convertFile:a=>openccFile(need(a,"input"),need(a,"output"),typeof a.config==="string"?a.config:"t2s.json"),
  convertText:a=>openccText(need(a,"text"),typeof a.config==="string"?a.config:"t2s.json")
 },
 "sharp-libvips":{
  metadata:a=>sharpMetadata(need(a,"input")),
  convert:a=>sharpConvert(need(a,"input"),need(a,"output"),typeof a.format==="string"?a.format:undefined,optNum(a,"quality")??88),
  resize:a=>sharpResize(need(a,"input"),need(a,"output"),optNum(a,"width"),optNum(a,"height"),(a.fit==="cover"||a.fit==="contain")?a.fit:"inside"),
  compress:a=>sharpCompress(need(a,"input"),need(a,"output"),optNum(a,"quality")??82),
  stripMetadata:a=>sharpStripMetadata(need(a,"input"),need(a,"output")),
 },
 mammoth:{
  toText:a=>docxToText(need(a,"input")),
  toHtml:a=>docxToHtml(need(a,"input"))
 },
 exceljs:{
  xlsxToCsv:a=>xlsxToCsv(need(a,"input"),need(a,"outputDir")),
  csvToXlsx:a=>csvToXlsx(need(a,"input"),need(a,"output"),typeof a.delimiter==="string"?a.delimiter:",")
 },
 readability:{
  extract:a=>extractArticle(need(a,"html"),typeof a.url==="string"?a.url:undefined)
 },
 dompurify:{
  sanitize:a=>sanitizeHtml(need(a,"html"))
 },
 turndown:{
  markdown:a=>htmlToMarkdown(need(a,"html"))
 },
};

export function serverAdapter(engineId:string,operation:string){return SERVER_ADAPTERS[engineId]?.[operation]}
