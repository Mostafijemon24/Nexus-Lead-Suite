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

$plain_urls = ! (bool) get_option( 'permalink_structure' );
$report_base = $plain_urls
	? trailingslashit( home_url() )
	: trailingslashit( home_url( Client_Access::slug_from_db() ) );

/**
 * Build URL preserving token and optional filters.
 *
 * @param array<string,string> $extra Query args (tab/from/to/q).
 * @return string
 */
$nexus_ls_report_url = static function ( array $extra = array() ) use ( $plain_urls, $report_base, $nexus_ls_ca_token ): string {
	$args = array_merge(
		array(
			'token' => $nexus_ls_ca_token,
		),
		$extra
	);
	if ( $plain_urls ) {
		$args['nexus_ls_client_report'] = '1';
	}

	return esc_url( add_query_arg( $args, $report_base ) );
};

$tab_labels = array(
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
	<style>
		:root { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #0f172a; background: #f1f5f9; }
		body { margin: 0; padding: 1.25rem; }
		.wrap { max-width: 1200px; margin: 0 auto; }
		.report-header { text-align: center; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid #e2e8f0; }
		.report-header__logo { display: block; margin: 0 auto 1rem; width: auto; height: auto; object-fit: contain; }
		.report-header h1 { font-size: 1.35rem; margin: 0 0 .35rem; font-weight: 700; }
		.report-header .sub { color: #64748b; font-size: .875rem; margin: 0 auto; max-width: 42rem; line-height: 1.45; }
		.toolbar { display: flex; flex-wrap: wrap; gap: .75rem; align-items: flex-end; margin-bottom: 1rem; background: #fff; padding: 1rem; border-radius: .75rem; border: 1px solid #e2e8f0; }
		.toolbar label { display: flex; flex-direction: column; font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #64748b; gap: .25rem; }
		.toolbar input[type="text"], .toolbar input[type="date"], .toolbar input[type="search"] { padding: .45rem .55rem; border: 1px solid #cbd5e1; border-radius: .5rem; font-size: .875rem; min-width: 8rem; }
		.tabs { display: flex; flex-wrap: wrap; gap: .35rem; margin-bottom: .75rem; justify-content: center; }
		.tabs a { display: inline-block; padding: .4rem .85rem; border-radius: 999px; font-size: .78rem; font-weight: 700; text-decoration: none; border: 1px solid #e2e8f0; background: #fff; color: #475569; }
		.tabs a.active { background: #4f46e5; color: #fff; border-color: #4f46e5; }
		.btn { cursor: pointer; border: none; border-radius: .5rem; padding: .55rem 1rem; font-weight: 700; font-size: .8rem; }
		.btn-pdf { background: #4f46e5; color: #fff; }
		.btn-pdf:disabled { opacity: .55; cursor: wait; }
		.nexus-ls-client-pdf-msg { flex: 1 1 100%; margin: 0; padding: .5rem 0 0; font-size: .875rem; font-weight: 600; color: #b91c1c; }
		.nexus-ls-client-pdf-msg[hidden] { display: none !important; }
		table { width: 100%; border-collapse: collapse; background: #fff; border-radius: .75rem; overflow: hidden; border: 1px solid #e2e8f0; font-size: .82rem; }
		th { text-align: left; background: #f8fafc; color: #64748b; font-size: .68rem; text-transform: uppercase; letter-spacing: .06em; padding: .65rem .75rem; border-bottom: 1px solid #e2e8f0; }
		td { padding: .65rem .75rem; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
		tr:last-child td { border-bottom: none; }
		.badge { display: inline-block; padding: .15rem .45rem; border-radius: .35rem; font-size: .68rem; font-weight: 700; }
		.b-forms { background: #dbeafe; color: #1d4ed8; }
		.b-calls { background: #dcfce7; color: #15803d; }
		.b-consult { background: #ede9fe; color: #6d28d9; }
		.b-interactions { background: #fef3c7; color: #b45309; }
		.m-sent { color: #15803d; font-weight: 600; }
		.m-fail { color: #b91c1c; font-weight: 600; }
		.m-na { color: #64748b; font-weight: 600; }
		.url { word-break: break-all; color: #2563eb; text-decoration: none; }
		.empty { padding: 2rem; text-align: center; color: #64748b; background: #fff; border-radius: .75rem; border: 1px dashed #cbd5e1; }
	</style>
</head>
<body>
	<div class="wrap">
		<header class="report-header">
			<?php if ( '' !== $nexus_ls_ca_report_logo ) : ?>
				<?php
				$logo_style = sprintf(
					'max-width:min(100%%,%dpx);max-height:min(70vh,%dpx);',
					$nexus_ls_ca_report_logo_max_px,
					$nexus_ls_ca_report_logo_max_px
				);
				?>
				<img class="report-header__logo" style="<?php echo esc_attr( $logo_style ); ?>" src="<?php echo esc_url( $nexus_ls_ca_report_logo ); ?>" alt="" decoding="async" />
			<?php endif; ?>
			<h1><?php esc_html_e( 'Activity report', 'nexus-lead-suite' ); ?></h1>
			<p class="sub"><?php echo esc_html( $nexus_ls_ca_site_title ); ?> — <?php esc_html_e( 'Read-only access. Download a PDF snapshot of the filtered list below.', 'nexus-lead-suite' ); ?></p>
		</header>

		<div class="tabs">
			<?php foreach ( $tab_labels as $tid => $tlabel ) : ?>
				<?php
				$active = ( $nexus_ls_ca_tab === $tid ) ? 'active' : '';
				$url    = $nexus_ls_report_url(
					array_filter(
						array(
							'tab'  => 'all' === $tid ? '' : $tid,
							'from' => $nexus_ls_ca_date_from,
							'to'   => $nexus_ls_ca_date_to,
							'q'    => $nexus_ls_ca_search,
						)
					)
				);
				?>
				<a class="<?php echo esc_attr( $active ); ?>" href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $tlabel ); ?></a>
			<?php endforeach; ?>
		</div>

		<form class="toolbar" method="get" action="<?php echo esc_url( $report_base ); ?>">
			<input type="hidden" name="token" value="<?php echo esc_attr( $nexus_ls_ca_token ); ?>">
			<?php if ( $plain_urls ) : ?>
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
					<?php foreach ( $nexus_ls_ca_rows as $r ) : ?>
						<?php
						$key  = isset( $r['categoryKey'] ) ? (string) $r['categoryKey'] : 'forms';
						$bcls = 'forms' === $key ? 'b-forms' : ( 'calls' === $key ? 'b-calls' : ( 'consultations' === $key ? 'b-consult' : 'b-interactions' ) );
						$mcls = isset( $r['mailSent'] ) ? ( ! empty( $r['mailSent'] ) ? 'm-sent' : 'm-fail' ) : 'm-na';
						?>
						<tr>
							<td><strong><?php echo esc_html( (string) ( $r['actionName'] ?? '' ) ); ?></strong></td>
							<td>
								<?php $pu = isset( $r['pageUrl'] ) ? (string) $r['pageUrl'] : ''; ?>
								<?php if ( '' !== $pu ) : ?>
									<a class="url" href="<?php echo esc_url( $pu ); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $pu ); ?></a>
								<?php else : ?>
									—
								<?php endif; ?>
							</td>
							<td><span class="badge <?php echo esc_attr( $bcls ); ?>"><?php echo esc_html( (string) ( $r['category'] ?? '' ) ); ?></span></td>
							<td><?php echo esc_html( (string) ( $r['context'] ?? '' ) ); ?></td>
							<td><?php echo esc_html( (string) ( $r['dateTime'] ?? '' ) ); ?></td>
							<td class="<?php echo esc_attr( $mcls ); ?>"><?php echo esc_html( (string) ( $r['mailStatus'] ?? '' ) ); ?></td>
							<td><code><?php echo esc_html( (string) ( $r['id'] ?? '' ) ); ?></code></td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		<?php endif; ?>
	</div>

	<script>
	(function () {
		var btn = document.getElementById('nexus-ls-client-pdf');
		var msgEl = document.getElementById('nexus-ls-client-pdf-msg');
		if (!btn) return;
		var cfg = <?php echo wp_json_encode( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON for strict script payload.
			array(
				'pdfUrl'   => $nexus_ls_ca_rest_pdf,
				'token'    => $nexus_ls_ca_token,
				'tab'      => $nexus_ls_ca_tab,
				'dateFrom' => $nexus_ls_ca_date_from,
				'dateTo'   => $nexus_ls_ca_date_to,
				'search'   => $nexus_ls_ca_search,
			)
		); ?>;
		btn.addEventListener('click', function () {
			if (msgEl) {
				msgEl.textContent = '';
				msgEl.setAttribute('hidden', '');
			}
			btn.disabled = true;
			fetch(cfg.pdfUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'omit',
				body: JSON.stringify({
					token: cfg.token,
					tab: cfg.tab,
					dateFrom: cfg.dateFrom,
					dateTo: cfg.dateTo,
					search: cfg.search
				})
			}).then(function (res) { return res.json().then(function (j) { return { res: res, j: j }; }); })
				.then(function (x) {
					var pdf = x.j && x.j.data && x.j.data.pdf_url;
					if (!x.res.ok || !pdf) {
						if (msgEl) {
							msgEl.textContent = (x.j && x.j.message) ? String(x.j.message) : <?php echo wp_json_encode( __( 'Could not generate PDF.', 'nexus-lead-suite' ) ); ?>;
							msgEl.removeAttribute('hidden');
						}
						return;
					}
					window.open(pdf, '_blank', 'noopener,noreferrer');
				})
				.catch(function () {
					if (msgEl) {
						msgEl.textContent = <?php echo wp_json_encode( __( 'Could not generate PDF.', 'nexus-lead-suite' ) ); ?>;
						msgEl.removeAttribute('hidden');
					}
				})
				.then(function () { btn.disabled = false; });
		});
	})();
	</script>
</body>
</html>
