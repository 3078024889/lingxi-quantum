export type MediaEngineKind="deterministic"|"browser-local"|"local-model"|"server-local"|"external-semantic"|"disabled";
export type QualityTier="fast"|"balanced"|"quality";
export type MediaCapability=
 |"ocr"|"pdf-compress"|"image-inpaint"|"id-photo"|"image-enhance"
 |"audio-transcription"|"video-transcription"|"video-compose"|"video-watermark"|"video-dubbing";

export type MediaRoute={
 capability:MediaCapability;engine:MediaEngineKind;tier:QualityTier;
 requiresPayment:boolean;requiresNetwork:boolean;truth:string;
 fallback?:MediaEngineKind;
};

const ROUTES:Record<MediaCapability,MediaRoute>={
 ocr:{capability:"ocr",engine:"browser-local",tier:"balanced",requiresPayment:false,requiresNetwork:false,truth:"Local OCR with language-aware recognition; layout/table fidelity is validated separately.",fallback:"local-model"},
 "pdf-compress":{capability:"pdf-compress",engine:"deterministic",tier:"balanced",requiresPayment:false,requiresNetwork:false,truth:"Choose structure-preserving compression when possible; raster rebuild is only an explicit fallback."},
 "image-inpaint":{capability:"image-inpaint",engine:"browser-local",tier:"balanced",requiresPayment:false,requiresNetwork:false,truth:"Local fixed-region restoration; complex occlusion requires a stronger restoration engine.",fallback:"local-model"},
 "id-photo":{capability:"id-photo",engine:"browser-local",tier:"balanced",requiresPayment:false,requiresNetwork:false,truth:"Local background/crop workflow. Do not claim portrait matting unless a segmentation model actually ran.",fallback:"local-model"},
 "image-enhance":{capability:"image-enhance",engine:"browser-local",tier:"balanced",requiresPayment:false,requiresNetwork:false,truth:"Deterministic/local enhancement first; learned super-resolution only when its model is present.",fallback:"local-model"},
 "audio-transcription":{capability:"audio-transcription",engine:"local-model",tier:"balanced",requiresPayment:false,requiresNetwork:false,truth:"Local speech recognition when the model runtime is available."},
 "video-transcription":{capability:"video-transcription",engine:"local-model",tier:"balanced",requiresPayment:false,requiresNetwork:false,truth:"Extract audio locally, then run local speech recognition."},
 "video-compose":{capability:"video-compose",engine:"browser-local",tier:"balanced",requiresPayment:false,requiresNetwork:false,truth:"FFmpeg composition/transcode with real exit-code and non-empty output validation."},
 "video-watermark":{capability:"video-watermark",engine:"browser-local",tier:"balanced",requiresPayment:false,requiresNetwork:false,truth:"Fixed-region local video processing; moving/complex watermark restoration is not claimed.",fallback:"local-model"},
 "video-dubbing":{capability:"video-dubbing",engine:"disabled",tier:"balanced",requiresPayment:false,requiresNetwork:false,truth:"Disabled until speech synthesis, alignment, mixing and final media validation are all present."}
};
export function routeMediaCapability(capability:MediaCapability,tier:QualityTier="balanced"):MediaRoute{
 const r=ROUTES[capability];return {...r,tier};
}
export function allMediaRoutes(){return Object.values(ROUTES).map(x=>({...x}));}
