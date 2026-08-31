const CACHE_KEY = 'lingxifield_stellar_trace_draft_v3'
const LEGACY_CACHE_KEYS = ['lingxifield_stellar_trace_draft_v1', 'lingxifield_stellar_trace_draft_v2']

const EMPTY_DRAFT = Object.freeze({
  name: '', relationship: 'family', birthDate: '', birthTime: '', birthPlace: '',
  lastContactAt: '', lastKnownPlace: '', lastKnownMapLabel: '', lastKnownLat: '', lastKnownLon: '',
  movementDirection: '', context: '',
})

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(0)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCFullYear(year, month - 1, day)
  return year >= 1 && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day && date.getTime() <= Date.now()
}

function validTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value || '')
}

function validContactAt(value) {
  if (!/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/.test(value || '')) return false
  const [date, time] = value.split(/[T ]/)
  if (!validDate(date) || !validTime(time)) return false
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  const instant = new Date(0)
  instant.setFullYear(year, month - 1, day)
  instant.setHours(hour, minute, 0, 0)
  return instant.getTime() <= Date.now()
}

function validCoordinates(draft) {
  const lat = Number(draft.lastKnownLat)
  const lon = Number(draft.lastKnownLon)
  return draft.lastKnownLat !== '' && draft.lastKnownLon !== '' && Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lon) && lon >= -180 && lon <= 180
}

function sanitizeDraft(value) {
  const input = value && typeof value === 'object' ? value : {}
  const relationships = ['self', 'family', 'partner', 'friend', 'colleague', 'other']
  const draft = {
    ...EMPTY_DRAFT,
    name: clean(input.name, 40),
    relationship: relationships.includes(input.relationship) ? input.relationship : 'family',
    birthDate: validDate(input.birthDate) ? input.birthDate : '',
    birthTime: validTime(input.birthTime) ? input.birthTime : '',
    birthPlace: clean(input.birthPlace, 80),
    lastContactAt: validContactAt(input.lastContactAt) ? input.lastContactAt.replace('T', ' ') : '',
    lastKnownPlace: clean(input.lastKnownPlace, 120),
    lastKnownMapLabel: clean(input.lastKnownMapLabel, 160),
    lastKnownLat: clean(input.lastKnownLat, 20),
    lastKnownLon: clean(input.lastKnownLon, 20),
    movementDirection: clean(input.movementDirection, 60),
    context: clean(input.context, 500),
  }
  if (!validCoordinates(draft)) {
    draft.lastKnownLat = ''
    draft.lastKnownLon = ''
  }
  return draft
}

function evaluateDraft(draft) {
  const [contactDate = '', contactTime = ''] = draft.lastContactAt.split(/[T ]/)
  const required = [
    [!!draft.name, '姓名'],
    [validDate(draft.birthDate), '出生日期'],
    [validContactAt(draft.lastContactAt), '最后有效联系日期与时间'],
    [!!draft.lastKnownPlace, '最后已知位置说明'],
    [validCoordinates(draft), '精准地图选点'],
  ]
  const visible = [
    !!draft.name, !!draft.relationship, validDate(draft.birthDate), validTime(draft.birthTime), !!draft.birthPlace,
    validDate(contactDate), validContactAt(draft.lastContactAt) && !!contactTime, !!draft.lastKnownPlace,
    validCoordinates(draft), !!draft.movementDirection, !!draft.context,
  ]
  return {
    completeness: visible.filter(Boolean).length,
    coreComplete: required.filter(([ready]) => ready).length,
    essentialComplete: required.every(([ready]) => ready),
    missing: required.filter(([ready]) => !ready).map(([, label]) => label),
  }
}

module.exports = { CACHE_KEY, LEGACY_CACHE_KEYS, EMPTY_DRAFT, sanitizeDraft, evaluateDraft, validDate, validTime, validContactAt, validCoordinates }
