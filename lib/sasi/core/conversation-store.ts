import 'server-only';
import {createAdminClient} from '@/lib/supabase/admin';
export const conversationUuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function saveConversationTurn(input:{userId:string;threadId:string;requestId:string;question:string;answer?:string;modelInfo?:unknown}){
 const {data,error}=await createAdminClient().rpc('save_sasi_chat_turn_v78',{p_user_id:input.userId,p_thread_id:input.threadId,p_request_id:input.requestId,p_question:input.question,p_answer:input.answer??null,p_model_info:input.modelInfo??null});
 if(error)throw Error('HISTORY_UNAVAILABLE');
 if(!data?.ok)throw Error(data?.error||'HISTORY_UNAVAILABLE');return data;
}
export async function finishConversationState(input:{userId:string;threadId:string;requestId:string},state:'failed'|'needs-connection'){
 const {error}=await createAdminClient().rpc('finish_sasi_chat_turn_state_v78',{p_user_id:input.userId,p_thread_id:input.threadId,p_request_id:input.requestId,p_state:state});
 if(error)throw Error('HISTORY_UNAVAILABLE');
}
