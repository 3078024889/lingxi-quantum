<?php
/**
 * Plugin Name: LINGXIFIELD — SIAI & Free Widgets
 * Plugin URI: https://lingxifield.com/partners
 * Description: Embed a verified SIAI directory, anonymous free local tools, a vendor profile, or a public QR widget.
 * Version: 0.2.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: LINGXIFIELD
 * Author URI: https://lingxifield.com
 * License: GPLv2 or later
 * Text Domain: lingxifield-widgets
 */
if (!defined('ABSPATH')) {
    exit;
}

/** Bundled local script with a fixed, read-only remote API origin; no external executable code. */
function lingxifield_widget_shortcode($atts, $widget = 'siai') {
    $atts = shortcode_atts(array(
        'partner' => 'community',
        'lang' => 'en',
        'vendor' => '',
    ), $atts, 'lingxifield_' . $widget);

    $partner = strtolower((string)$atts['partner']);
    if (!preg_match('/^[a-z0-9][a-z0-9_-]{0,31}$/', $partner)) {
        $partner = 'community';
    }

    $lang = strtolower((string)$atts['lang']);
    if (!in_array($lang, array('zh','en','ja','ko','fr','de','es','pt','ar'), true)) {
        $lang = 'en';
    }

    $vendor = strtolower((string)$atts['vendor']);
    if ($vendor !== '' && !preg_match('/^[a-z0-9][a-z0-9-]{0,63}$/', $vendor)) {
        return '';
    }

    $kind = $widget === 'qr' ? 'tools' : ($widget === 'free-tools' ? 'free-tools' : 'siai');
    $attr = $widget === 'vendor' ? ' data-vendor="' . esc_attr($vendor) . '"' : '';
    if ($widget === 'vendor' && $vendor === '') {
        return '';
    }

    $local_script = plugins_url('assets/lingxifield-v1.js', __FILE__);
    return '<script defer src="' . esc_url($local_script) . '"'
         . ' data-api-origin="https://lingxifield.com"'
         . ' data-lx-widget="' . esc_attr($kind) . '"'
         . ' data-lang="' . esc_attr($lang) . '"'
         . ' data-partner="' . esc_attr($partner) . '"' . $attr . '></script>';
}
add_shortcode('lingxifield_siai', function($atts) {
    return lingxifield_widget_shortcode($atts, 'siai');
});
add_shortcode('lingxifield_tools', function($atts) {
    return lingxifield_widget_shortcode($atts, 'free-tools');
});
add_shortcode('lingxifield_qr', function($atts) {
    return lingxifield_widget_shortcode($atts, 'qr');
});
add_shortcode('lingxifield_vendor', function($atts) {
    return lingxifield_widget_shortcode($atts, 'vendor');
});
