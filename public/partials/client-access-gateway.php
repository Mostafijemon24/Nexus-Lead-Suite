<?php
/**
 * Token-gated activity report (HTML table + PDF download).
 *
 * Expected variables from {@see Client_Access::maybe_serve_gateway()}:
 * string $nexus_ls_ca_token
 * string $nexus_ls_ca_tab
 * string $nexus_ls_ca_date_from
 * string $nexus_ls_ca_date_to
 * string $nexus_ls_ca_search
 * array  $nexus_ls_ca_rows
 * string $nexus_ls_ca_site_title
 * string $nexus_ls_ca_rest_pdf
 * string $nexus_ls_ca_report_logo Optional logo URL (settings report logo; else theme custom logo).
 * int    $nexus_ls_ca_report_logo_max_px Header logo max width/height (100–1000), from settings.
 *
 * @package Nexus_Lead_Suite
 */

declare(strict_types=1);

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Nexus_Lead_Suite\Public\Client_Access;

if ( ! isset( $nexus_ls_ca_report_logo ) ) {
	$nexus_ls_ca_report_logo = '';
}

if ( ! isset( $nexus_ls_ca_report_logo_max_px ) ) {
	$nexus_ls_ca_report_logo_max_px = 400;
}
$nexus_ls_ca_report_logo_max_px = max( 100, min( 1000, (int) $nexus_ls_ca_report_logo_max_px ) );

$nexus_ls_ca_plain_urls = ! (bool) get_option( 'permalink_structure' );
$nexus_ls_ca_report_base = $nexus_ls_ca_plain_urls
	? trailingslashit( home_url() )
	: trailingslashit( home_url( Client_Access::slug_from_db() ) );

/**
 * Build URL preserving token and optional filters.
 *
 * @param array<string,string> $extra Query args (tab/from/to/q).
 * @return string
 */
$nexus_ls_report_url = static function ( array $extra = array() ) use ( $nexus_ls_ca_plain_urls, $nexus_ls_ca_report_base, $nexus_ls_ca_token ): string {
	$args = array_merge(
		array(
			'token' => $nexus_ls_ca_token,
		),
		$extra
	);
	if ( $nexus_ls_ca_plain_urls ) {
		$args['nexus_ls_client_report'] = '1';
	}

	return esc_url( add_query_arg( $args, $nexus_ls_ca_report_base ) );
};

$nexus_ls_ca_tab_labels = array(
	'all'           => __( 'All', 'nexus-lead-suite' ),
	'forms'         => __( 'Forms', 'nexus-lead-suite' ),
	'calls'         => __( 'Calls', 'nexus-lead-suite' ),
	'consultations' => __( 'Consultations', 'nexus-lead-suite' ),
	'interactions'  => __( 'Interactions', 'nexus-lead-suite' ),
);

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="robots" content="noindex,nofollow">
	<title><?php echo esc_html( $nexus_ls_ca_site_title ); ?> — <?php esc_html_e( 'Activity report', 'nexus-lead-suite' ); ?></title>
	<?php wp_head(); ?>
</head>
<body>
	<div class="wrap">
		<header class="report-header">
			<?php if ( '' !== $nexus_ls_ca_report_logo ) : ?>
				<?php
				$nexus_ls_ca_logo_style = sprintf(
					'max-width:min(100%%,%dpx);max-height:min(70vh,%dpx);',
					$nexus_ls_ca_report_logo_max_px,
					$nexus_ls_ca_report_logo_max_px
				);
				?>
				<img class="report-header__logo" style="<?php echo esc_attr( $nexus_ls_ca_logo_style ); ?>" src="<?php echo esc_url( $nexus_ls_ca_report_logo ); ?>" alt="" decoding="async" />
			<?php endif; ?>
			<h1><?php esc_html_e( 'Activity report', 'nexus-lead-suite' ); ?></h1>
			<p class="sub"><?php echo esc_html( $nexus_ls_ca_site_title ); ?> — <?php esc_html_e( 'Read-only access. Download a PDF snapshot of the filtered list below.', 'nexus-lead-suite' ); ?></p>
		</header>

		<div class="tabs">
			<?php foreach ( $nexus_ls_ca_tab_labels as $nexus_ls_ca_tid => $nexus_ls_ca_tlabel ) : ?>
				<?php
				$nexus_ls_ca_active = ( $nexus_ls_ca_tab === $nexus_ls_ca_tid ) ? 'active' : '';
				$nexus_ls_ca_url    = $nexus_ls_report_url(
					array_filter(
						array(
							'tab'  => 'all' === $nexus_ls_ca_tid ? '' : $nexus_ls_ca_tid,
							'from' => $nexus_ls_ca_date_from,
							'to'   => $nexus_ls_ca_date_to,
							'q'    => $nexus_ls_ca_search,
						)
					)
				);
				?>
				<a class="<?php echo esc_attr( $nexus_ls_ca_active ); ?>" href="<?php echo esc_url( $nexus_ls_ca_url ); ?>"><?php echo esc_html( $nexus_ls_ca_tlabel ); ?></a>
			<?php endforeach; ?>
		</div>

		<form class="toolbar" method="get" action="<?php echo esc_url( $nexus_ls_ca_report_base ); ?>">
			<input type="hidden" name="token" value="<?php echo esc_attr( $nexus_ls_ca_token ); ?>">
			<?php if ( $nexus_ls_ca_plain_urls ) : ?>
				<input type="hidden" name="nexus_ls_client_report" value="1">
			<?php endif; ?>
			<input type="hidden" name="tab" value="<?php echo esc_attr( $nexus_ls_ca_tab ); ?>">

			<label><?php esc_html_e( 'From', 'nexus-lead-suite' ); ?>
				<input type="date" name="from" value="<?php echo esc_attr( $nexus_ls_ca_date_from ); ?>">
			</label>
			<label><?php esc_html_e( 'To', 'nexus-lead-suite' ); ?>
				<input type="date" name="to" value="<?php echo esc_attr( $nexus_ls_ca_date_to ); ?>">
			</label>
			<label style="flex:1;min-width:12rem;"><?php esc_html_e( 'Search', 'nexus-lead-suite' ); ?>
				<input type="search" name="q" value="<?php echo esc_attr( $nexus_ls_ca_search ); ?>" placeholder="<?php esc_attr_e( 'Keyword…', 'nexus-lead-suite' ); ?>">
			</label>
			<button class="btn btn-pdf" type="submit" style="background:#0f172a;"><?php esc_html_e( 'Apply filters', 'nexus-lead-suite' ); ?></button>
			<button type="button" class="btn btn-pdf" id="nexus-ls-client-pdf"><?php esc_html_e( 'Download PDF', 'nexus-lead-suite' ); ?></button>
			<p id="nexus-ls-client-pdf-msg" class="nexus-ls-client-pdf-msg" role="status" aria-live="polite" hidden></p>
		</form>

		<?php if ( empty( $nexus_ls_ca_rows ) ) : ?>
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
					<?php foreach ( $nexus_ls_ca_rows as $nexus_ls_ca_row ) : ?>
						<?php
						$nexus_ls_ca_key  = isset( $nexus_ls_ca_row['categoryKey'] ) ? (string) $nexus_ls_ca_row['categoryKey'] : 'forms';
						$nexus_ls_ca_bcls = 'forms' === $nexus_ls_ca_key ? 'b-forms' : ( 'calls' === $nexus_ls_ca_key ? 'b-calls' : ( 'consultations' === $nexus_ls_ca_key ? 'b-consult' : 'b-interactions' ) );
						$nexus_ls_ca_mcls = isset( $nexus_ls_ca_row['mailSent'] ) ? ( ! empty( $nexus_ls_ca_row['mailSent'] ) ? 'm-sent' : 'm-fail' ) : 'm-na';
						?>
						<tr>
							<td><strong><?php echo esc_html( (string) ( $nexus_ls_ca_row['actionName'] ?? '' ) ); ?></strong></td>
							<td>
								<?php $nexus_ls_ca_pu = isset( $nexus_ls_ca_row['pageUrl'] ) ? (string) $nexus_ls_ca_row['pageUrl'] : ''; ?>
								<?php if ( '' !== $nexus_ls_ca_pu ) : ?>
									<a class="url" href="<?php echo esc_url( $nexus_ls_ca_pu ); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $nexus_ls_ca_pu ); ?></a>
								<?php else : ?>
									—
								<?php endif; ?>
							</td>
							<td><span class="badge <?php echo esc_attr( $nexus_ls_ca_bcls ); ?>"><?php echo esc_html( (string) ( $nexus_ls_ca_row['category'] ?? '' ) ); ?></span></td>
							<td><?php echo esc_html( (string) ( $nexus_ls_ca_row['context'] ?? '' ) ); ?></td>
							<td><?php echo esc_html( (string) ( $nexus_ls_ca_row['dateTime'] ?? '' ) ); ?></td>
							<td class="<?php echo esc_attr( $nexus_ls_ca_mcls ); ?>"><?php echo esc_html( (string) ( $nexus_ls_ca_row['mailStatus'] ?? '' ) ); ?></td>
							<td><code><?php echo esc_html( (string) ( $nexus_ls_ca_row['id'] ?? '' ) ); ?></code></td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		<?php endif; ?>
	</div>
	<?php wp_footer(); ?>
</body>
</html>
