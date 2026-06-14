<?php
/**
 * Resolves which menu button groups match the current front-end request.
 *
 * @package Nexus_Lead_Suite
 */

declare(strict_types=1);

namespace Nexus_Lead_Suite\Core;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Evaluates group display conditions against the current WordPress query.
 */
final class Menu_Group_Resolver {

	/**
	 * Returns all enabled groups whose conditions match the current request.
	 * Sorted by priority descending (higher priority first).
	 *
	 * @param array<int,array<string,mixed>> $groups Menu groups from storage.
	 * @return array<int,array<string,mixed>>
	 */
	public function get_matching_groups( array $groups ): array {
		$matches = array();

		foreach ( $groups as $group ) {
			if ( ! is_array( $group ) ) {
				continue;
			}

			if ( array_key_exists( 'enabled', $group ) && empty( $group['enabled'] ) ) {
				continue;
			}

			$conditions = isset( $group['conditions'] ) && is_array( $group['conditions'] )
				? $group['conditions']
				: array();

			if ( ! $this->group_matches( $conditions ) ) {
				continue;
			}

			$matches[] = $group;
		}

		if ( count( $matches ) > 1 ) {
			usort(
				$matches,
				static function ( array $a, array $b ): int {
					$pa = isset( $a['priority'] ) ? (int) $a['priority'] : 0;
					$pb = isset( $b['priority'] ) ? (int) $b['priority'] : 0;
					return $pb <=> $pa;
				}
			);
		}

		return $matches;
	}

	/**
	 * Flattens buttons from all matching groups (priority order preserved).
	 *
	 * @param array<int,array<string,mixed>> $groups Menu groups from storage.
	 * @return array<int,array<string,mixed>>
	 */
	public function get_buttons_for_request( array $groups ): array {
		$matching = $this->get_matching_groups( $groups );
		$buttons  = array();

		foreach ( $matching as $group ) {
			$group_buttons = isset( $group['buttons'] ) && is_array( $group['buttons'] )
				? $group['buttons']
				: array();

			foreach ( $group_buttons as $btn ) {
				if ( is_array( $btn ) ) {
					$buttons[] = $btn;
				}
			}
		}

		return $buttons;
	}

	/**
	 * @param array<string,mixed> $conditions Group conditions payload.
	 */
	public function group_matches( array $conditions ): bool {
		$rules = isset( $conditions['rules'] ) && is_array( $conditions['rules'] )
			? array_values( $conditions['rules'] )
			: array();

		if ( count( $rules ) === 0 ) {
			return false;
		}

		$match_mode = isset( $conditions['match'] ) ? (string) $conditions['match'] : 'any';
		$require_all = 'all' === $match_mode;

		if ( $require_all ) {
			foreach ( $rules as $rule ) {
				if ( ! is_array( $rule ) || ! $this->rule_matches( $rule ) ) {
					return false;
				}
			}
			return true;
		}

		foreach ( $rules as $rule ) {
			if ( is_array( $rule ) && $this->rule_matches( $rule ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * @param array<string,mixed> $rule Single condition rule.
	 */
	private function rule_matches( array $rule ): bool {
		$type = isset( $rule['type'] ) ? sanitize_key( (string) $rule['type'] ) : '';

		switch ( $type ) {
			case 'all':
				return true;

			case 'homepage':
				return is_front_page() && ! is_paged();

			case 'page':
				return $this->matches_content_ids( 'page', $rule );

			case 'post':
				return $this->matches_content_ids( 'post', $rule );

			case 'post_type':
				return $this->matches_post_type( $rule );

			case 'category':
				return $this->matches_taxonomy( 'category', $rule );

			case 'tag':
				return $this->matches_taxonomy( 'post_tag', $rule );

			default:
				return false;
		}
	}

	/**
	 * @param string              $object_type page|post.
	 * @param array<string,mixed> $rule        Rule with ids[].
	 */
	private function matches_content_ids( string $object_type, array $rule ): bool {
		$ids = $this->normalize_int_list( $rule['ids'] ?? array() );
		if ( count( $ids ) === 0 ) {
			return false;
		}

		if ( 'page' === $object_type && is_page( $ids ) ) {
			return true;
		}

		if ( 'post' === $object_type && is_single( $ids ) ) {
			return true;
		}

		return false;
	}

	/**
	 * @param array<string,mixed> $rule Rule with slugs[].
	 */
	private function matches_post_type( array $rule ): bool {
		$slugs = $this->normalize_slug_list( $rule['slugs'] ?? array() );
		if ( count( $slugs ) === 0 || ! is_singular() ) {
			return false;
		}

		$current = get_post_type( get_queried_object_id() );
		return is_string( $current ) && in_array( $current, $slugs, true );
	}

	/**
	 * @param string              $taxonomy category|post_tag.
	 * @param array<string,mixed> $rule     Rule with ids[].
	 */
	private function matches_taxonomy( string $taxonomy, array $rule ): bool {
		$ids = $this->normalize_int_list( $rule['ids'] ?? array() );
		if ( count( $ids ) === 0 ) {
			return false;
		}

		if ( 'category' === $taxonomy && is_category( $ids ) ) {
			return true;
		}

		if ( 'post_tag' === $taxonomy && is_tag( $ids ) ) {
			return true;
		}

		if ( is_singular() ) {
			$post_id = get_queried_object_id();
			if ( $post_id > 0 && has_term( $ids, $taxonomy, $post_id ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * @param mixed $raw Raw ids list.
	 * @return array<int,int>
	 */
	private function normalize_int_list( $raw ): array {
		if ( ! is_array( $raw ) ) {
			return array();
		}

		$out = array();
		foreach ( $raw as $id ) {
			$int = (int) $id;
			if ( $int > 0 ) {
				$out[] = $int;
			}
		}

		return array_values( array_unique( $out ) );
	}

	/**
	 * @param mixed $raw Raw slug list.
	 * @return array<int,string>
	 */
	private function normalize_slug_list( $raw ): array {
		if ( ! is_array( $raw ) ) {
			return array();
		}

		$out = array();
		foreach ( $raw as $slug ) {
			$clean = sanitize_key( (string) $slug );
			if ( '' !== $clean ) {
				$out[] = $clean;
			}
		}

		return array_values( array_unique( $out ) );
	}
}
