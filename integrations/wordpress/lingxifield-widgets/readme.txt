=== LINGXIFIELD SIAI and QR Widgets ===
Tags: ai tools, directory, qr code, shortcode, comparison
Requires at least: 6.0
Requires PHP: 7.4
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Embed the reviewed Global SIAI directory, a single approved provider card, or a public-URL QR code generator on your website.

== Description ==

LINGXIFIELD widgets provide a compact, searchable list of reviewed public SI/AI tools
and an optional QR generator for public URLs. A WordPress editor chooses where to
display the widgets by inserting a shortcode. This plugin does not automatically
insert links, advertisements, trackers or widgets into pages.

= Shortcodes =

* [lingxifield_siai partner="exampleblog" lang="en"]
* [lingxifield_vendor vendor="chatgpt" partner="exampleblog" lang="en"]
* [lingxifield_qr partner="exampleblog" lang="en"]

Replace "chatgpt" with the exact approved public vendor ID. Supported languages:
zh, en, ja, ko, fr, de, es, pt, ar.

= Required external service =

This plugin is a client for the free LINGXIFIELD service at
https://lingxifield.com/. Its executable JavaScript is bundled locally
in this plugin and is loaded only on pages where the site owner has inserted
a shortcode. No JavaScript is loaded from the remote service.

The reviewed directory widget requests public profile data from
https://lingxifield.com/api/public/siai-widget. The QR widget sends
a public URL entered by a visitor to
https://lingxifield.com/api/public/qr-code to generate its QR image.
Private documents and files are not accepted or uploaded through these widgets.
Do not enter private links, signed URLs, personal data or query tokens.

A visitor who voluntarily clicks the optional "Explore rankings" link
will reach https://lingxifield.com/ with source, campaign and the
site-owner-selected partner label in the destination URL. The plugin itself
does not collect email addresses, cookies, WordPress user data or page history.
The remote server may receive ordinary HTTP request metadata in accordance
with its published policies. No account or API key is required.

Terms: https://lingxifield.com/terms
Privacy: https://lingxifield.com/privacy
Service website: https://lingxifield.com/

= External data and ranking integrity =

Only approved public catalogue records are distributed; unreviewed candidates
and unsourced details are omitted. A provider appearing on the list does not
imply endorsement, ownership validation, or a paid ranking.

== Installation ==

1. Upload the lingxifield-widgets folder to wp-content/plugins.
2. Activate "LINGXIFIELD — SIAI & Free Widgets" in Plugins.
3. Insert a Shortcode block and paste one of the shortcodes above.
4. Preview the page, confirm that you accept the external service request,
   and publish only after checking the layout and your site's privacy policy.

== Frequently Asked Questions ==

= Is an account required? =
No. Approved public data and QR generation are accessible without sign-up.

= Does the QR generator accept private documents? =
No. Only public website URLs should be entered.

= Can I display only one provider? =
Yes. Use the exact approved vendor ID in [lingxifield_vendor vendor="id"].

= Are plugin URLs or partner labels verified? =
The site owner chooses the partner label. Labels are attribution hints,
not independently verified ownership credentials.

== Changelog ==

= 0.1.0 =
* Initial shortcodes for reviewed SIAI directory, provider cards and public QR URLs.
