// The catalog is cached for up to an hour and can temporarily be served by an
// older web deployment. Keep these public entry routes in the Mini Program as
// a compatibility fallback; the web route itself remains the product source.
const REPORT_WEB_PATHS = {
  'stellar-trace': '/stellar-trace',
  'life-map-report': '/life-map',
  'relationship-resonance': '/relationship',
  'qian-reading': '/qian',
  'tarot-reading': '/tarot',
  'resilience-report': '/resilience',
  'romance-report': '/romance',
  'daily-tide-report': '/daily',
  'wealth-report': '/wealth',
  'life-archetype': '/archetype',
}

function getReportWebPath(item) {
  return item && (item.webPath || REPORT_WEB_PATHS[item.productId])
}

module.exports = { getReportWebPath }
