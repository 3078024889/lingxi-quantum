import type {EngineEstimate} from "./types";

const BASE:Record<string,EngineEstimate>={
 "native-js":{cpu:"low",memoryMB:128,secondsPerUnit:.05,unit:"operation"},
 "browser-canvas":{cpu:"medium",memoryMB:256,secondsPerUnit:.2,unit:"image"},
 "sharp-libvips":{cpu:"medium",memoryMB:512,secondsPerUnit:.15,unit:"image"},
 "qpdf":{cpu:"low",memoryMB:256,secondsPerUnit:.2,unit:"file"},
 "pdfcpu":{cpu:"medium",memoryMB:384,secondsPerUnit:.4,unit:"file"},
 "ffmpeg":{cpu:"high",memoryMB:1024,secondsPerUnit:1,unit:"media-minute"},
 "whispercpp":{cpu:"high",memoryMB:2048,gpuPreferred:true,secondsPerUnit:5,unit:"audio-minute"},
 "faster-whisper":{cpu:"high",memoryMB:3072,gpuPreferred:true,secondsPerUnit:2,unit:"audio-minute"},
 "paddleocr":{cpu:"high",memoryMB:2048,gpuPreferred:true,secondsPerUnit:1,unit:"page"},
 "argos":{cpu:"medium",memoryMB:1024,secondsPerUnit:.5,unit:"1000-chars"},
 "opencv":{cpu:"medium",memoryMB:1024,secondsPerUnit:.5,unit:"image"},
 "mammoth":{cpu:"low",memoryMB:256,secondsPerUnit:.2,unit:"document"},
 "exceljs":{cpu:"medium",memoryMB:768,secondsPerUnit:.4,unit:"workbook"},
 "readability":{cpu:"low",memoryMB:256,secondsPerUnit:.1,unit:"document"},
 "dompurify":{cpu:"low",memoryMB:256,secondsPerUnit:.1,unit:"document"},
 "turndown":{cpu:"low",memoryMB:256,secondsPerUnit:.1,unit:"document"},
 "gotenberg":{cpu:"high",memoryMB:2048,secondsPerUnit:1,unit:"document"},
};

export function estimateEngine(engineId:string,units=1):EngineEstimate{
 const x=BASE[engineId]||{cpu:"medium",memoryMB:512,secondsPerUnit:.5,unit:"operation"};
 return {...x,secondsPerUnit:(x.secondsPerUnit||0)*Math.max(1,units)};
}
