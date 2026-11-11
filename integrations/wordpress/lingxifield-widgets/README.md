# LINGXIFIELD widgets for WordPress (prototype)

**Status:** plugin source is ready for source review. It is not published on WordPress.org, not installed on any external WordPress site, and not approved by their directory.

Shortcodes:

- \`[lingxifield_siai partner="mywebsite" lang="en"]\` — verified public SIAI directory search
- \`[lingxifield_vendor vendor="openai" partner="mywebsite" lang="en"]\` — profile for an exact reviewed vendor ID, visible only if that ID is approved and available in the public feed
- \`[lingxifield_tools partner="mywebsite" lang="en" — searchable directory of anonymous local tools
- `[lingxifield_qr partner="mywebsite" lang="en"]`]\` — QR generator for public URLs

Installation after review: place this folder under \`wp-content/plugins/\`, activate from WordPress, then add a Shortcode block. Do not solicit paid listings or claim directory certification.

**Security:** no API keys, credentials, or personal records in the plugin. Executable widget code is bundled in `assets/lingxifield-v1.js` (synchronized with the web distribution script), not loaded as a remote script. Only explicit widget attributes are forwarded. Public widget source is loaded from HTTPS LINGXIFIELD; the SIAI feed exposes reviewed records only and the free-tools feed includes only anonymous local tools. Widget links contain bounded partner labels for attribution. The QR component sends only deliberately entered public URLs to LINGXIFIELD and does not permit URL query parameters. Review external scripts and privacy disclosure under your website's own policy.
