-- Disposable PostgreSQL quote-stage acceptance. No production charges.
begin;
do $$
declare
 a uuid:='11111111-1111-4111-8111-111111111111';
 b uuid:='22222222-2222-4222-8222-222222222222';
 q uuid:='f1111111-1111-4111-8111-111111111111';
 pending uuid:='f2222222-2222-4222-8222-222222222222';
 other_tool uuid:='f3333333-3333-4333-8333-333333333333';
 op1 uuid:='f4444444-4444-4444-8444-444444444444';
 op2 uuid:='f5555555-5555-4555-8555-555555555555';
 op3 uuid:='f6666666-6666-4666-8666-666666666666';
 val jsonb;
begin
 insert into public.tool_payment_quotes(id,user_id,tool_id,quantity,status)
 values(q,a,'video-dubbing',1,'paid'),
  (pending,a,'video-dubbing',1,'quoted'),
  (other_tool,a,'pdf-editor',1,'paid');
 val:=public.lingxi_claim_legacy_media_stage(q,a,'media-transcribe',op1,0);
 if val->>'ok' is distinct from 'true' or val->>'alreadyStarted' is distinct from 'false'
 then raise exception 'FIRST_PAID_TRANSCRIBE_FAILED %',val;end if;
 val:=public.lingxi_claim_legacy_media_stage(q,a,'media-transcribe',op1,0);
 if val->>'alreadyStarted' is distinct from 'true'
 then raise exception 'REPLAY_TRANSCRIBE_NOT_RECOGNIZED %',val;end if;
 val:=public.lingxi_claim_legacy_media_stage(q,a,'media-transcribe',op2,0);
 if val->>'error' is distinct from 'LEGACY_MEDIA_PAID_ALLOWANCE_EXHAUSTED'
 then raise exception 'REPEATED_PAID_QUOTE_UNLIMITED %',val;end if;
 val:=public.lingxi_claim_legacy_media_stage(q,a,'media-translate',op1,2000);
 if val->>'ok' is distinct from 'true' then raise exception 'FIRST_TRANSLATE_FAILED %',val;end if;
 val:=public.lingxi_claim_legacy_media_stage(q,a,'media-translate',op2,2500);
 if val->>'ok' is distinct from 'true' then raise exception 'SECOND_TRANSLATE_FAILED %',val;end if;
 val:=public.lingxi_claim_legacy_media_stage(q,a,'media-translate',op3,1600);
 if val->>'error' is distinct from 'LEGACY_MEDIA_PAID_ALLOWANCE_EXHAUSTED'
 then raise exception 'TRANSLATION_CHAR_BUDGET_BYPASS %',val;end if;
 val:=public.lingxi_claim_legacy_media_stage(q,a,'media-tts',op1,5000);
 if val->>'ok' is distinct from 'true' then raise exception 'FIRST_TTS_FAILED %',val;end if;
 val:=public.lingxi_claim_legacy_media_stage(q,a,'media-tts',op2,1200);
 if val->>'error' is distinct from 'LEGACY_MEDIA_PAID_ALLOWANCE_EXHAUSTED'
 then raise exception 'TTS_CHAR_BUDGET_BYPASS %',val;end if;
 val:=public.lingxi_claim_legacy_media_stage(q,b,'media-tts',op2,100);
 if val->>'error' is distinct from 'LEGACY_MEDIA_QUOTE_NOT_PAID'
 then raise exception 'CROSS_ACCOUNT_QUOTE_BYPASS %',val;end if;
 val:=public.lingxi_claim_legacy_media_stage(pending,a,'media-tts',op2,100);
 if val->>'error' is distinct from 'LEGACY_MEDIA_QUOTE_NOT_PAID'
 then raise exception 'UNPAID_QUOTE_BYPASS %',val;end if;
 val:=public.lingxi_claim_legacy_media_stage(other_tool,a,'media-tts',op2,100);
 if val->>'error' is distinct from 'LEGACY_MEDIA_STAGE_TOOL_MISMATCH'
 then raise exception 'WRONG_TOOL_QUOTE_BYPASS %',val;end if;
 if (select count(*) from public.lingxi_legacy_media_stage_usage where quote_id=q)<>4
 then raise exception 'QUOTE_USAGE_JOURNAL_MISMATCH';end if;
end $$;
do $$
begin
 if has_function_privilege('anon',
  'public.lingxi_claim_legacy_media_stage(uuid,uuid,text,uuid,integer)','EXECUTE')
 or has_function_privilege('authenticated',
  'public.lingxi_claim_legacy_media_stage(uuid,uuid,text,uuid,integer)','EXECUTE')
 then raise exception 'PAID_MEDIA_RPC_PUBLICLY_EXPOSED';end if;
end $$;
rollback;
