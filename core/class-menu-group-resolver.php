<?php
/**
 * Resolves which menu button groups match the current front-end request.
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

		// No rules configured: show on every page (admin default when all checkboxes are unchecked).
		if ( count( $rules ) === 0 ) {
			return true;
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

			case 'custom_link':
				return $this->matches_custom_link( $rule );

			default:
				return false;
		}
	}

	/**
	 * Exact page URL / path match for custom_link rules.
	 *
	 * @param array<string,mixed> $rule Rule with url string.
	 */
	private function matches_custom_link( array $rule ): bool {
		$target = isset( $rule['url'] ) ? trim( (string) $rule['url'] ) : '';
		if ( '' === $target ) {
			return false;
		}

		$target_norm = $this->normalize_request_url( $target );
		if ( '' === $target_norm['path'] ) {
			return false;
		}

		$current_uri = isset( $_SERVER['REQUEST_URI'] )
			? sanitize_text_field( wp_unslash( (string) $_SERVER['REQUEST_URI'] ) )
			: '/';
		$current     = $this->normalize_request_url( $current_uri );

		if ( '' !== $target_norm['host'] ) {
			$current_host = isset( $_SERVER['HTTP_HOST'] )
				? strtolower( sanitize_text_field( wp_unslash( (string) $_SERVER['HTTP_HOST'] ) ) )
				: '';
			if ( $current_host !== $target_norm['host'] ) {
				return false;
			}
		}

		return $current['path'] === $target_norm['path'];
	}

	/**
	 * @param string $raw Full URL or path.
	 * @return array{host:string,path:string}
	 */
	private function normalize_request_url( string $raw ): array {
		$raw = trim( $raw );
		if ( '' === $raw ) {
			return array(
				'host' => '',
				'path' => '',
			);
		}

		$host = '';
		$path = $raw;

		if ( preg_match( '#^https?://#i', $raw ) ) {
			$parts = wp_parse_url( $raw );
			$host  = isset( $parts['host'] ) ? strtolower( (string) $parts['host'] ) : '';
			$path  = isset( $parts['path'] ) ? (string) $parts['path'] : '/';
		} else {
			$qpos = strpos( $path, '?' );
			if ( false !== $qpos ) {
				$path = substr( $path, 0, $qpos );
			}
			$hash = strpos( $path, '#' );
			if ( false !== $hash ) {
				$path = substr( $path, 0, $hash );
			}
		}

		$path = '/' . ltrim( $path, '/' );
		if ( '/' !== $path ) {
			$path = untrailingslashit( $path );
		}

		// Strip site subdirectory if WP is installed in a subfolder.
		$home_path = wp_parse_url( home_url( '/' ), PHP_URL_PATH );
		if ( is_string( $home_path ) && '/' !== $home_path && '' !== $home_path ) {
			$home_path = untrailingslashit( $home_path );
			if ( 0 === strpos( $path, $home_path . '/' ) ) {
				$path = substr( $path, strlen( $home_path ) ) ?: '/';
			} elseif ( $path === $home_path ) {
				$path = '/';
			}
		}

		return array(
			'host' => $host,
			'path' => $path ? $path : '/',
		);
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

		$qid = (int) get_queried_object_id();

		if ( 'page' === $object_type ) {
			if ( $qid > 0 && in_array( $qid, $ids, true ) && ( is_page() || ( is_front_page() && ! is_home() ) ) ) {
				return true;
			}
			if ( is_page( $ids ) ) {
				return true;
			}
			if ( is_home() && ! is_front_page() ) {
				$posts_page_id = (int) get_option( 'page_for_posts' );
				if ( $posts_page_id > 0 && in_array( $posts_page_id, $ids, true ) ) {
					return true;
				}
			}
			return false;
		}

		if ( 'post' === $object_type ) {
			if ( is_singular( 'post' ) && $qid > 0 && in_array( $qid, $ids, true ) ) {
				return true;
			}
			return is_single( $ids );
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
