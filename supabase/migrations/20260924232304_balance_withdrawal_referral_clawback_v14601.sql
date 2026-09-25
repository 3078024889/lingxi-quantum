-- Production migration already applied as 20260924232304.
begin;

alter table public.balance_withdrawals
  add column if not exists processing_started_at timestamptz;

-- The production function complete_balance_withdrawal also claws back proportional
-- AI referral bonus on completed CNY AI principal withdrawals, using existing
-- ai_referral_rewards.reversed_bonus_fen and adjustment_debt_fen semantics.

commit;
