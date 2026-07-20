<?php
/**
 * Standalone chat document behind the iframe HTML embed code.
 *
 * Deliberately does NOT call wp_head() / wp_footer(). Those are actions, and themes hook their own
 * furniture onto them — a floating cart button, a back-to-top arrow, cookie bars — which would then
 * render *inside* the chat frame. Instead we fire wp_enqueue_scripts and print only the enqueued
 * assets, so the plugin's form runtime, global font and popup styles still load exactly as they do
 * on a normal page, while the frame stays just the chat.
 *
 * Expected variables from {@see \nexulesuite_\Public\Shortcodes::maybe_serve_chat_embed()}:
 * string $nexulesuite_chat_embed_html Pre-escaped widget markup.
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! isset( $nexulesuite_chat_embed_html ) ) {
	$nexulesuite_chat_embed_html = '';
}

// Lets plugins and the theme register + enqueue as usual; wp_head() would normally fire this.
// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- WordPress core action, fired deliberately in place of wp_head() (see file docblock).
do_action( 'wp_enqueue_scripts' );

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="robots" content="noindex, nofollow" />
	<?php
	wp_print_styles();
	wp_print_head_scripts();
	?>
</head>
<body class="nexulesuite_chat-embed-doc">

	<?php
	echo wp_kses( $nexulesuite_chat_embed_html, \nexulesuite_\Public\Shortcodes::allowed_embed_html() );

	wp_print_footer_scripts();
	?>
</body>
</html>
