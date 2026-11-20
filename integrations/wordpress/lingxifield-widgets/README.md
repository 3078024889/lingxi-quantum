# LINGXIFIELD widgets for WordPress (prototype)

**Status:** plugin source is ready for source review. It is not published on WordPress.org, not installed on any external WordPress site, and not approved by their directory.

Shortcodes:

- [lingxifield_siai partner="mywebsite" lang="en"] — verified public SIAI directory search
- [lingxifield_vendor vendor="openai" partner="mywebsite" lang="en"] — one approved public vendor profile
- [lingxifield_tools partner="mywebsite" lang="en"] — searchable directory of anonymous local tools
- [lingxifield_qr partner="mywebsite" lang="en"] — QR generator for public URLs

Supported languages: zh, en, ja, ko, fr, de, es, pt, ar.

Installation after review: place this folder under wp-content/plugins/, activate it from WordPress, then add a Shortcode block. Do not solicit paid listings or claim directory certification.

**Security:** no API keys, credentials, or personal records in the plugin. Executable widget code is bundled locally in assets/lingxifield-v1.js and synchronized with the public widget script; it is not loaded from a remote script. Only explicit widget attributes are forwarded. The SIAI feed exposes reviewed records only. The free-tools feed includes only anonymous local tools and excludes paid or server-metered tools. Widget links contain bounded partner labels for attribution. The QR component sends only deliberately entered public URLs to LINGXIFIELD and does not permit URL query parameters.

Review external scripts and privacy disclosure under your website's own policy.
