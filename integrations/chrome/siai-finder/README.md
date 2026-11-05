# LINGXIFIELD Global SIAI Finder (Chrome MV3 prototype)

Purpose: an actually usable, source-reviewed SI/AI catalogue lookup directly in the browser toolbar, with category and documented-free-tier filters. Each public vendor profile links to its official website. A single click leads to the full LINGXIFIELD rankings, while free tools are separately available.

## Status and restrictions
- Not submitted to Chrome Web Store, not installed on user devices.
- No access to tabs, web browsing history, cookies, active pages, account data, location, or clipboard.
- One narrowly scoped host permission: `https://lingxifield.com/*` to read the official verified public JSON data feed.
- No third-party JS, trackers or remote executable code. Only fixed outbound UTM labels on voluntary clicks.
- If the public feed is unavailable, the popup still shows a direct link to the main ranking.
- The product's original official logo has not been packaged; obtain approved user-owned icon assets before store submission. Do not substitute a new logo.
- Before submission: test Chrome's "Load unpacked" on the folder, cross-browser layout, network failure, privacy disclosures, store metadata/screenshot requirements, and verify new approved data propagates after release.
- Store policy: https://developer.chrome.com/docs/webstore/program-policies/policies/
- Host permission docs: https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions

## Minimum test
Run `node --check popup.js` and parse `manifest.json`. Confirm all links use HTTPS and no remote scripts, user page URL reading, or event injection are requested.
