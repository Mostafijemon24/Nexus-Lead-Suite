<?php
/**
 * Token-gated activity report (HTML table + PDF download).
 *
 * Expected variables from {@see Client_Access::maybe_serve_gateway()}:
 * string $nexulesuite_ca_token
 * string $nexulesuite_ca_tab
 * string $nexulesuite_ca_date_from
 * string $nexulesuite_ca_date_to
 * string $nexulesuite_ca_search
 * array  $nexulesuite_ca_rows
 * string $nexulesuite_ca_site_title
 * string $nexulesuite_ca_rest_pdf
 * string $nexulesuite_ca_report_logo Optional logo URL (settings report logo; else theme custom logo).
 * int    $nexulesuite_ca_report_logo_max_px Header logo max width/height (100–1000), from settings.
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use nexulesuite_\Frontend\Client_Access;

if ( ! isset( $nexulesuite_ca_report_logo ) ) {
	$nexulesuite_ca_report_logo = '';
}

if ( ! isset( $nexulesuite_ca_report_logo_max_px ) ) {
	$nexulesuite_ca_report_logo_max_px = 400;
}
$nexulesuite_ca_report_logo_max_px = max( 100, min( 1000, (int) $nexulesuite_ca_report_logo_max_px ) );

$nexulesuite_ca_plain_urls = ! (bool) get_option( 'permalink_structure' );
$nexulesuite_ca_report_base = $nexulesuite_ca_plain_urls
	? trailingslashit( home_url() )
	: trailingslashit( home_url( Client_Access::slug_from_db() ) );

/**
 * Build URL preserving token and optional filters.
 *
 * @param array<string,string> $extra Query args (tab/from/to/q).
 * @return string
 */
$nexulesuite_report_url = static function ( array $extra = array() ) use ( $nexulesuite_ca_plain_urls, $nexulesuite_ca_report_base, $nexulesuite_ca_token ): string {
	$args = array_merge(
		array(
			'token' => $nexulesuite_ca_token,
		),
		$extra
	);
	if ( $nexulesuite_ca_plain_urls ) {
		$args['nexulesuite_client_report'] = '1';
	}

	return esc_url( add_query_arg( $args, $nexulesuite_ca_report_base ) );
};

$nexulesuite_ca_tab_labels = array(
	'all'           => __( 'All', 'nexus-lead-suite' ),
	'forms'         => __( 'Forms', 'nexus-lead-suite' ),
	'calls'         => __( 'Calls', 'nexus-lead-suite' ),
	'consultations' => __( 'Consultations', 'nexus-lead-suite' ),
	'interactions'  => __( 'Interactions', 'nexus-lead-suite' ),
);

/* Sections this link may see. Anything absent was never queried. */
$nexulesuite_ca_can = static function ( string $section ) use ( $nexulesuite_ca_sections ): bool {
	return in_array( $section, $nexulesuite_ca_sections, true );
};

$nexulesuite_ca_summary = is_array( $nexulesuite_ca_report['summary'] ?? null ) ? $nexulesuite_ca_report['summary'] : array();
$nexulesuite_ca_forms   = is_array( $nexulesuite_ca_report['forms'] ?? null ) ? $nexulesuite_ca_report['forms'] : array();
$nexulesuite_ca_chats   = is_array( $nexulesuite_ca_report['chats'] ?? null ) ? $nexulesuite_ca_report['chats'] : array();
$nexulesuite_ca_meta    = is_array( $nexulesuite_ca_report['meta'] ?? null ) ? $nexulesuite_ca_report['meta'] : array();

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="robots" content="noindex,nofollow">
	<title><?php echo esc_html( $nexulesuite_ca_site_title ); ?> — <?php esc_html_e( 'Report', 'nexus-lead-suite' ); ?></title>
	<?php wp_head(); ?>
</head>
<body class="nexulesuite_client-gateway<?php echo $nexulesuite_ca_print ? ' is-print' : ''; ?>">
	<div class="wrap">
		<header class="report-header">
			<?php if ( '' !== $nexulesuite_ca_report_logo ) : ?>
				<?php
				$nexulesuite_ca_logo_style = sprintf(
					'max-width:min(100%%,%dpx);max-height:min(70vh,%dpx);',
					$nexulesuite_ca_report_logo_max_px,
					$nexulesuite_ca_report_logo_max_px
				);
				?>
				<img class="report-header__logo" style="<?php echo esc_attr( $nexulesuite_ca_logo_style ); ?>" src="<?php echo esc_url( $nexulesuite_ca_report_logo ); ?>" alt="" decoding="async" />
			<?php endif; ?>
			<h1><?php esc_html_e( 'Leads &amp; conversations report', 'nexus-lead-suite' ); ?></h1>
			<p class="sub"><?php echo esc_html( $nexulesuite_ca_site_title ); ?> — <?php esc_html_e( 'Read-only access. Download a PDF, or use Print to save it from your browser.', 'nexus-lead-suite' ); ?></p>
			<?php if ( ! empty( $nexulesuite_ca_meta['generatedAt'] ) ) : ?>
				<p class="sub"><?php echo esc_html( sprintf( /* translators: %s: timestamp. */ __( 'Generated %s', 'nexus-lead-suite' ), (string) $nexulesuite_ca_meta['generatedAt'] ) ); ?></p>
			<?php endif; ?>
		</header>

		<?php /* Filters and exports sit above every section, so a link without the activity list still has them. */ ?>
		<form class="toolbar" method="get" action="<?php echo esc_url( $nexulesuite_ca_report_base ); ?>">
			<input type="hidden" name="token" value="<?php echo esc_attr( $nexulesuite_ca_token ); ?>">
			<?php if ( $nexulesuite_ca_plain_urls ) : ?>
				<input type="hidden" name="nexulesuite_client_report" value="1">
			<?php endif; ?>
			<input type="hidden" name="tab" value="<?php echo esc_attr( $nexulesuite_ca_tab ); ?>">

			<label><?php esc_html_e( 'From', 'nexus-lead-suite' ); ?>
				<input type="date" name="from" value="<?php echo esc_attr( $nexulesuite_ca_date_from ); ?>">
			</label>
			<label><?php esc_html_e( 'To', 'nexus-lead-suite' ); ?>
				<input type="date" name="to" value="<?php echo esc_attr( $nexulesuite_ca_date_to ); ?>">
			</label>
			<label style="flex:1;min-width:12rem;"><?php esc_html_e( 'Search', 'nexus-lead-suite' ); ?>
				<input type="search" name="q" value="<?php echo esc_attr( $nexulesuite_ca_search ); ?>" placeholder="<?php esc_attr_e( 'Keyword…', 'nexus-lead-suite' ); ?>">
			</label>
			<button class="btn btn-pdf" type="submit" style="background:#0f172a;"><?php esc_html_e( 'Apply filters', 'nexus-lead-suite' ); ?></button>
			<button type="button" class="btn btn-pdf" id="nexulesuite_client-pdf"><?php esc_html_e( 'Download PDF', 'nexus-lead-suite' ); ?></button>
			<button type="button" class="btn btn-print" id="nexulesuite_client-print"><?php esc_html_e( 'Print / Save as PDF', 'nexus-lead-suite' ); ?></button>
			<p id="nexulesuite_client-pdf-msg" class="nexulesuite_client-pdf-msg" role="status" aria-live="polite" hidden></p>
		</form>

		<?php if ( $nexulesuite_ca_can( 'summary' ) && ! empty( $nexulesuite_ca_summary ) ) : ?>
			<section class="nexulesuite_ca-section">
				<div class="nexulesuite_ca-stats">
					<?php
					$nexulesuite_ca_cards = array(
						__( 'Form submissions', 'nexus-lead-suite' ) => (int) ( $nexulesuite_ca_summary['formSubmissions'] ?? 0 ),
					);
					if ( array_key_exists( 'conversations', $nexulesuite_ca_summary ) ) {
						$nexulesuite_ca_cards[ __( 'Conversations', 'nexus-lead-suite' ) ] = (int) $nexulesuite_ca_summary['conversations'];
						$nexulesuite_ca_cards[ __( 'Chat messages', 'nexus-lead-suite' ) ]  = (int) ( $nexulesuite_ca_summary['messages'] ?? 0 );
						$nexulesuite_ca_cards[ __( 'With images', 'nexus-lead-suite' ) ]    = (int) ( $nexulesuite_ca_summary['withImages'] ?? 0 );
					}
					foreach ( $nexulesuite_ca_cards as $nexulesuite_ca_clabel => $nexulesuite_ca_cvalue ) :
						?>
						<div class="nexulesuite_ca-stat">
							<span class="nexulesuite_ca-stat__value"><?php echo esc_html( (string) $nexulesuite_ca_cvalue ); ?></span>
							<span class="nexulesuite_ca-stat__label"><?php echo esc_html( $nexulesuite_ca_clabel ); ?></span>
						</div>
					<?php endforeach; ?>
				</div>
			</section>
		<?php endif; ?>

		<?php if ( $nexulesuite_ca_can( 'forms' ) ) : ?>
			<section class="nexulesuite_ca-section">
				<h2><?php echo esc_html( sprintf( /* translators: %d: count. */ __( 'Form submissions (%d)', 'nexus-lead-suite' ), count( $nexulesuite_ca_forms ) ) ); ?></h2>
				<?php if ( ! empty( $nexulesuite_ca_meta['retentionDays'] ) ) : ?>
					<p class="nexulesuite_ca-note">
						<?php
						echo esc_html(
							sprintf(
								/* translators: %d: retention days. */
								__( 'Answers are retained for %d days; older submissions appear in the activity list only.', 'nexus-lead-suite' ),
								(int) $nexulesuite_ca_meta['retentionDays']
							)
						);
						?>
					</p>
				<?php endif; ?>

				<?php if ( empty( $nexulesuite_ca_forms ) ) : ?>
					<div class="empty"><?php esc_html_e( 'No submissions match these filters.', 'nexus-lead-suite' ); ?></div>
				<?php else : ?>
					<?php foreach ( $nexulesuite_ca_forms as $nexulesuite_ca_sub ) : ?>
						<article class="nexulesuite_ca-card">
							<h3><?php echo esc_html( (string) ( $nexulesuite_ca_sub['formName'] ?? '' ) ); ?></h3>
							<p class="nexulesuite_ca-meta">
								<?php echo esc_html( (string) ( $nexulesuite_ca_sub['submittedAt'] ?? '' ) ); ?>
								<?php if ( null !== ( $nexulesuite_ca_sub['mailSent'] ?? null ) ) : ?>
									· <?php echo esc_html( $nexulesuite_ca_sub['mailSent'] ? __( 'Notification sent', 'nexus-lead-suite' ) : __( 'Notification not sent', 'nexus-lead-suite' ) ); ?>
								<?php endif; ?>
							</p>
							<dl class="nexulesuite_ca-fields">
								<?php foreach ( (array) ( $nexulesuite_ca_sub['fields'] ?? array() ) as $nexulesuite_ca_field ) : ?>
									<dt><?php echo esc_html( (string) ( $nexulesuite_ca_field['label'] ?? '' ) ); ?></dt>
									<dd><?php echo esc_html( '' !== (string) ( $nexulesuite_ca_field['value'] ?? '' ) ? (string) $nexulesuite_ca_field['value'] : '—' ); ?></dd>
								<?php endforeach; ?>
							</dl>
						</article>
					<?php endforeach; ?>
				<?php endif; ?>
			</section>
		<?php endif; ?>

		<?php if ( $nexulesuite_ca_can( 'chats' ) ) : ?>
			<section class="nexulesuite_ca-section">
				<h2><?php echo esc_html( sprintf( /* translators: %d: count. */ __( 'Chat conversations (%d)', 'nexus-lead-suite' ), count( $nexulesuite_ca_chats ) ) ); ?></h2>

				<?php if ( empty( $nexulesuite_ca_chats ) ) : ?>
					<div class="empty"><?php esc_html_e( 'No conversations match these filters.', 'nexus-lead-suite' ); ?></div>
				<?php else : ?>
					<?php foreach ( $nexulesuite_ca_chats as $nexulesuite_ca_i => $nexulesuite_ca_chat ) : ?>
						<?php /* Open in the print view so nothing is hidden when saving as PDF. */ ?>
						<details class="nexulesuite_ca-chat"<?php echo $nexulesuite_ca_print ? ' open' : ''; ?>>
							<summary>
								<strong><?php echo esc_html( (string) ( $nexulesuite_ca_chat['firstQuestion'] ?? __( '(image only)', 'nexus-lead-suite' ) ) ); ?></strong>
								<span class="nexulesuite_ca-meta">
									<?php echo esc_html( (string) ( $nexulesuite_ca_chat['lastAt'] ?? '' ) ); ?>
									· <?php echo esc_html( sprintf( /* translators: %d: message count. */ _n( '%d message', '%d messages', (int) ( $nexulesuite_ca_chat['messageCount'] ?? 0 ), 'nexus-lead-suite' ), (int) ( $nexulesuite_ca_chat['messageCount'] ?? 0 ) ) ); ?>
								</span>
							</summary>
							<div class="nexulesuite_ca-transcript">
								<?php foreach ( (array) ( $nexulesuite_ca_chat['transcript'] ?? array() ) as $nexulesuite_ca_turn ) : ?>
									<?php
									$nexulesuite_ca_q = trim( (string) ( $nexulesuite_ca_turn['question'] ?? '' ) );
									if ( '' === $nexulesuite_ca_q && ! empty( $nexulesuite_ca_turn['hasImage'] ) ) {
										$nexulesuite_ca_q = __( '(image attached)', 'nexus-lead-suite' );
									}
									?>
									<?php if ( '' !== $nexulesuite_ca_q ) : ?>
										<p class="nexulesuite_ca-turn nexulesuite_ca-turn--user"><span><?php esc_html_e( 'Visitor', 'nexus-lead-suite' ); ?></span><?php echo esc_html( $nexulesuite_ca_q ); ?></p>
									<?php endif; ?>
									<p class="nexulesuite_ca-turn nexulesuite_ca-turn--bot"><span><?php esc_html_e( 'Assistant', 'nexus-lead-suite' ); ?></span><?php echo esc_html( (string) ( $nexulesuite_ca_turn['answer'] ?? '' ) ); ?></p>
									<p class="nexulesuite_ca-time"><?php echo esc_html( (string) ( $nexulesuite_ca_turn['createdAt'] ?? '' ) ); ?></p>
								<?php endforeach; ?>
							</div>
						</details>
					<?php endforeach; ?>
				<?php endif; ?>
			</section>
		<?php endif; ?>

		<?php if ( $nexulesuite_ca_can( 'activities' ) ) : ?>

		<h2 class="nexulesuite_ca-section-title"><?php esc_html_e( 'Activity', 'nexus-lead-suite' ); ?></h2>

		<div class="tabs">
			<?php foreach ( $nexulesuite_ca_tab_labels as $nexulesuite_ca_tid => $nexulesuite_ca_tlabel ) : ?>
				<?php
				$nexulesuite_ca_active = ( $nexulesuite_ca_tab === $nexulesuite_ca_tid ) ? 'active' : '';
				$nexulesuite_ca_url    = $nexulesuite_report_url(
					array_filter(
						array(
							'tab'  => 'all' === $nexulesuite_ca_tid ? '' : $nexulesuite_ca_tid,
							'from' => $nexulesuite_ca_date_from,
							'to'   => $nexulesuite_ca_date_to,
							'q'    => $nexulesuite_ca_search,
						)
					)
				);
				?>
				<a class="<?php echo esc_attr( $nexulesuite_ca_active ); ?>" href="<?php echo esc_url( $nexulesuite_ca_url ); ?>"><?php echo esc_html( $nexulesuite_ca_tlabel ); ?></a>
			<?php endforeach; ?>
		</div>

		<?php if ( empty( $nexulesuite_ca_rows ) ) : ?>
			<div class="empty"><?php esc_html_e( 'No activities match these filters yet. Form submits, clicks, scroll depth, exit intent, and pop-up actions appear here when tracking runs on your site.', 'nexus-lead-suite' ); ?></div>
		<?php else : ?>
			<table>
				<thead>
					<tr>
						<th><?php esc_html_e( 'Action', 'nexus-lead-suite' ); ?></th>
						<th><?php esc_html_e( 'Page', 'nexus-lead-suite' ); ?></th>
						<th><?php esc_html_e( 'Type', 'nexus-lead-suite' ); ?></th>
						<th><?php esc_html_e( 'Summary', 'nexus-lead-suite' ); ?></th>
						<th><?php esc_html_e( 'Date', 'nexus-lead-suite' ); ?></th>
						<th><?php esc_html_e( 'Notify', 'nexus-lead-suite' ); ?></th>
						<th><?php esc_html_e( 'Ref', 'nexus-lead-suite' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $nexulesuite_ca_rows as $nexulesuite_ca_row ) : ?>
						<?php
						$nexulesuite_ca_key  = isset( $nexulesuite_ca_row['categoryKey'] ) ? (string) $nexulesuite_ca_row['categoryKey'] : 'forms';
						$nexulesuite_ca_bcls = 'forms' === $nexulesuite_ca_key ? 'b-forms' : ( 'calls' === $nexulesuite_ca_key ? 'b-calls' : ( 'consultations' === $nexulesuite_ca_key ? 'b-consult' : 'b-interactions' ) );
						$nexulesuite_ca_mcls = isset( $nexulesuite_ca_row['mailSent'] ) ? ( ! empty( $nexulesuite_ca_row['mailSent'] ) ? 'm-sent' : 'm-fail' ) : 'm-na';
						?>
						<tr>
							<td><strong><?php echo esc_html( (string) ( $nexulesuite_ca_row['actionName'] ?? '' ) ); ?></strong></td>
							<td>
								<?php $nexulesuite_ca_pu = isset( $nexulesuite_ca_row['pageUrl'] ) ? (string) $nexulesuite_ca_row['pageUrl'] : ''; ?>
								<?php if ( '' !== $nexulesuite_ca_pu ) : ?>
									<a class="url" href="<?php echo esc_url( $nexulesuite_ca_pu ); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $nexulesuite_ca_pu ); ?></a>
								<?php else : ?>
									—
								<?php endif; ?>
							</td>
							<td><span class="badge <?php echo esc_attr( $nexulesuite_ca_bcls ); ?>"><?php echo esc_html( (string) ( $nexulesuite_ca_row['category'] ?? '' ) ); ?></span></td>
							<td><?php echo esc_html( (string) ( $nexulesuite_ca_row['context'] ?? '' ) ); ?></td>
							<td><?php echo esc_html( (string) ( $nexulesuite_ca_row['dateTime'] ?? '' ) ); ?></td>
							<td class="<?php echo esc_attr( $nexulesuite_ca_mcls ); ?>"><?php echo esc_html( (string) ( $nexulesuite_ca_row['mailStatus'] ?? '' ) ); ?></td>
							<td><code><?php echo esc_html( (string) ( $nexulesuite_ca_row['id'] ?? '' ) ); ?></code></td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		<?php endif; ?>

		<?php endif; /* activities section */ ?>
	</div>
	<?php wp_footer(); ?>
</body>
</html>
