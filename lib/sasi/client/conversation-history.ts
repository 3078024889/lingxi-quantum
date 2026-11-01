import {boundedDialogueHistory,SASI_HISTORY_MAX_MESSAGES} from "@/lib/sasi/core/context-window";

/**
 * Send at most 20 recent conversational turns rather than silently
 * dropping everything before turn 12. The shared cap also protects the
 * server against 196 KiB JSON requests becoming oversized model prompts.
 */
export function conversationHistory(turns:Array<{question:string;answer?:string}>,budget=48000){
 const messages=turns.slice(-SASI_HISTORY_MAX_MESSAGES/2).flatMap(turn=>[
  {role:"user" as const,content:turn.question},
  ...(turn.answer?[{role:"assistant" as const,content:turn.answer}]:[])
 ]);
 return boundedDialogueHistory(messages,budget);
}
