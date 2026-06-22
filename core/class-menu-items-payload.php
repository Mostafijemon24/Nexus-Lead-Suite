<?php
/**
 * Normalizes stored menu items (legacy flat buttons → grouped format).
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

namespace nexulesuite_\Core;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared read/migrate helpers for menu button groups.
 */
final class Menu_Items_Payload {

	public const OPTION_KEY = 'nexulesuite_menu_items_v1';

	/**
	 * @return array{ groups: array<int,array<string,mixed>>, globalFontSize: int }
	 */
	public static function normalize_stored( $stored ): array {
		if ( ! is_array( $stored ) ) {
			return array(
				'groups'         => array(),
				'globalFontSize' => 14,
			);
		}

		$font_size = isset( $stored['globalFontSize'] )
			? max( 10, min( 32, (int) $stored['globalFontSize'] ) )
			: 14;

		if ( isset( $stored['groups'] ) && is_array( $stored['groups'] ) ) {
			return array(
				'groups'         => array_values( $stored['groups'] ),
				'globalFontSize' => $font_size,
			);
		}

		$legacy_items = array();
		if ( isset( $stored['items'] ) && is_array( $stored['items'] ) ) {
			$legacy_items = array_values( $stored['items'] );
		} elseif ( self::looks_like_legacy_button_list( $stored ) ) {
			$legacy_items = array_values( $stored );
		}

		if ( count( $legacy_items ) === 0 ) {
			return array(
				'groups'         => array(),
				'globalFontSize' => $font_size,
			);
		}

		return array(
			'groups'         => array(
				self::build_default_group( $legacy_items ),
			),
			'globalFontSize' => $font_size,
		);
	}

	/**
	 * One-time migration: persist grouped format when legacy flat items exist.
	 *
	 * @return void
	 */
	public static function maybe_migrate_legacy_option(): void {
		if ( '1' === get_option( 'nexulesuite_migrate_menu_groups_v1', '' ) ) {
			return;
		}

		$stored = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $stored ) || isset( $stored['groups'] ) ) {
			update_option( 'nexulesuite_migrate_menu_groups_v1', '1', false );
			return;
		}

		$has_legacy = isset( $stored['items'] ) && is_array( $stored['items'] ) && count( $stored['items'] ) > 0;
		if ( ! $has_legacy && ! self::looks_like_legacy_button_list( $stored ) ) {
			update_option( 'nexulesuite_migrate_menu_groups_v1', '1', false );
			return;
		}

		$normalized = self::normalize_stored( $stored );
		update_option(
			self::OPTION_KEY,
			array(
				'groups'         => $normalized['groups'],
				'globalFontSize' => $normalized['globalFontSize'],
			),
			false
		);
		update_option( 'nexulesuite_migrate_menu_groups_v1', '1', false );
	}

	/**
	 * @param array<int,array<string,mixed>> $buttons Legacy buttons.
	 * @return array<string,mixed>
	 */
	public static function build_default_group( array $buttons ): array {
		return array(
			'id'         => 'group-default',
			'name'       => __( 'Default', 'nexus-lead-suite' ),
			'priority'   => 0,
			'enabled'    => true,
			'conditions' => array(
				'match' => 'any',
				'rules' => array(
					array( 'type' => 'all' ),
				),
			),
			'buttons'    => $buttons,
		);
	}

	/**
	 * @param array<string,mixed> $stored Raw option value.
	 */
	private static function looks_like_legacy_button_list( array $stored ): bool {
		if ( isset( $stored['items'] ) || isset( $stored['groups'] ) || isset( $stored['globalFontSize'] ) ) {
			return false;
		}

		if ( count( $stored ) === 0 ) {
			return false;
		}

		foreach ( $stored as $row ) {
			if ( ! is_array( $row ) ) {
				return false;
			}
			if ( ! array_key_exists( 'label', $row ) && ! array_key_exists( 'id', $row ) ) {
				return false;
			}
		}

		return true;
	}
}
