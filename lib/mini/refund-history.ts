import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

// Provider-confirmed refunds initiated outside the website must remain visible here.
export async function miniRefundHistory(userId: string) {
  const { data, error } = await createAdminClient().from('mini_refund_reviews')
    .select('order_id,refunded_fen,needs_review,updated_at').eq('user_id', userId)
    .gt('refunded_fen', 0).order('updated_at', { ascending: false }).limit(50);
  if (error) throw new Error('MINI_REFUND_HISTORY_UNAVAILABLE');
  return (data || []).map(row => ({ id: 'mini-' + row.order_id, order_id: row.order_id,
    wallet_kind: 'sasi_cny', provider: 'wechat_mini_virtual', currency: 'CNY', provider_currency: 'CNY',
    amount_minor: Number(row.refunded_fen), provider_amount_minor: Number(row.refunded_fen),
    status: 'completed', normalized_status: 'completed', provider_status: 'SUCCESS',
    failure_code: null, created_at: row.updated_at, updated_at: row.updated_at, completed_at: row.updated_at,
    submission_confirmed_at: row.updated_at, needs_review: row.needs_review }));
}
