import LxText from "@/components/LxText";
import {TOOL_INTROS} from "@/lib/tools/product-copy";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import TranscriptionWorkbench from "@/components/tools/TranscriptionWorkbench";
export default function Page(){return <AdvancedToolPage title={<LxText {...{"zh": "音频转文字", "en": "Audio Transcription", "ja": "音声文字起こし", "ko": "오디오 전사", "fr": "Transcription audio", "de": "Audio-Transkription", "es": "Transcripción de audio", "pt": "Transcrição de áudio", "ar": "تحويل الصوت إلى نص"}}/>} intro={<LxText {...TOOL_INTROS["audio-transcription"]}/>}> <TranscriptionWorkbench/></AdvancedToolPage>}
