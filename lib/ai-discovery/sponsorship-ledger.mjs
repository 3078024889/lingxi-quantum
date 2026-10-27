/** Deterministic sponsorship settlement reducer; persist results in a transactional database. */
const EVENTS = new Set(['settled','refunded','disputed']);
export function applySettlementEvent(current, event) {
  if (!event || !EVENTS.has(event.type) || typeof event.eventId !== 'string' || !/^[A-Za-z0-9_-]{4,128}$/.test(event.eventId)) throw Error('INVALID_GATEWAY_EVENT');
  if (typeof event.orderId !== 'string' || !/^[A-Za-z0-9_-]{4,128}$/.test(event.orderId)) throw Error('INVALID_ORDER_ID');
  if (event.serverVerified !== true) throw Error('SERVER_VERIFICATION_REQUIRED');
  const state = current ?? {orderId:event.orderId,status:'pending',seenEventIds:[]};
  if (state.orderId !== event.orderId) throw Error('ORDER_ID_MISMATCH');
  if (!Array.isArray(state.seenEventIds) || !['pending','paid','refunded','disputed'].includes(state.status)) throw Error('INVALID_LEDGER_STATE');
  if (state.seenEventIds.includes(event.eventId)) return {state,changed:false};
  const next = {...state,seenEventIds:[...state.seenEventIds,event.eventId]};
  if (event.type === 'settled' && state.status === 'pending') next.status = 'paid';
  if (event.type === 'refunded' && ['pending','paid'].includes(state.status)) next.status = 'refunded';
  if (event.type === 'disputed' && ['pending','paid'].includes(state.status)) next.status = 'disputed';
  return {state:next,changed:true};
}
export function mayFulfillSponsorship(state) {
  return !!state && state.status === 'paid' && Array.isArray(state.seenEventIds) && state.seenEventIds.length > 0;
}
