import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { closeUserFeedback } from "@/lib/sasi/integration/feedback-closure";

export async function summarizeRuntimeLearningSignal(input:{userId:string;learningEventId:string}){
 const admin=createAdminClient();
 const [{data:event,error:eventError},{data:feedback,error:feedbackError}]=await Promise.all([
  admin.from("sasi_runtime_learning_events").select("id,user_id,event_kind,scope,mode,intelligence,payload,created_at").eq("id",input.learningEventId).eq("user_id",input.userId).maybeSingle(),
  admin.from("sasi_user_learning_feedback").select("signal,note,updated_at").eq("learning_event_id",input.learningEventId).eq("user_id",input.userId).maybeSingle(),
 ]);
 if(eventError) throw new Error("SASI_RUNTIME_EVENT_LOOKUP_FAILED");
 if(feedbackError) throw new Error("SASI_RUNTIME_FEEDBACK_LOOKUP_FAILED");
 if(!event) throw new Error("SASI_RUNTIME_EVENT_NOT_FOUND");
 const closure=feedback?.signal?closeUserFeedback(feedback.signal):null;
 return {event,feedback:feedback??null,closure,promotable:false,note:"Runtime feedback may create learning candidates but never directly promotes knowledge or code."};
}
