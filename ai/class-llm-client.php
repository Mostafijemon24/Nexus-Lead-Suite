<?php
/**
 * Direct-to-provider LLM client: chat + embeddings over the vendors' public HTTPS APIs.
 *
 * No self-hosted inference server is involved — WordPress talks to OpenAI, Anthropic,
 * Google, Groq, DeepSeek, Mistral, Together, OpenRouter, xAI and Voyage directly.
 * Three request/response shapes cover every vendor here, selected by `family`:
 * `openai` (chat completions), `anthropic` (messages) and `gemini` (generateContent).
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

namespace nexulesuite_\AI;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Stateless adapter around the hosted model APIs.
 *
 * Every public method takes the provider id, model and decrypted key explicitly —
 * nothing is read from options here, so the caller stays in charge of the credential.
 */
final class Llm_Client {

	/**
	 * Anthropic API version header value.
	 */
	private const ANTHROPIC_VERSION = '2023-06-01';

	/**
	 * Longest a single chunk may be before it is truncated for the embedding API.
	 */
	private const EMBED_INPUT_MAX_CHARS = 6000;

	/**
	 * Provider registry.
	 *
	 * `family` picks the chat adapter, `embed_family` the embedding adapter. `direct`
	 * marks providers reachable straight from WordPress; `server` marks the ones the
	 * legacy self-hosted AI server knows how to proxy.
	 *
	 * @return array<string,array<string,mixed>>
	 */
	private static function registry(): array {
		/*
		 * The provider endpoints below are intentional, user-selected, opt-in
		 * integrations. The AI Chatbot is disabled by default; no request is made
		 * unless the admin enables it, picks a provider and enters their own API
		 * key. Every provider and the data sent to it is disclosed under
		 * "External services" in readme.txt. WordPress 7.0's wp_ai_client_prompt()
		 * cannot be adopted because this plugin supports WordPress 6.2+, where that
		 * API does not exist. The provider host strings are therefore required.
		 */
		// phpcs:disable PluginCheck.CodeAnalysis.AIProvider.DirectIntegration -- See note above: opt-in, disclosed provider registry; wp_ai_client_prompt() requires WP 7.0 while this plugin supports WP 6.2+.
		return array(
			'openai'     => array(
				'label'        => 'OpenAI',
				'family'       => 'openai',
				'embed_family' => 'openai',
				'base'         => 'https://api.openai.com/v1',
				'chat'         => true,
				'embed'        => true,
				'vision'       => true,
				'json_mode'    => true,
				'direct'       => true,
				'server'       => true,
				'chat_model'   => 'gpt-4o-mini',
				'embed_model'  => 'text-embedding-3-small',
				'chat_models'  => array( 'gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini' ),
				'embed_models' => array( 'text-embedding-3-small', 'text-embedding-3-large' ),
				'key_hint'     => 'sk-…',
				'key_url'      => 'https://platform.openai.com/api-keys',
			),
			'anthropic'  => array(
				'label'        => 'Anthropic (Claude)',
				'family'       => 'anthropic',
				'embed_family' => '',
				'base'         => 'https://api.anthropic.com/v1',
				'chat'         => true,
				'embed'        => false,
				'vision'       => true,
				'json_mode'    => false,
				'direct'       => true,
				'server'       => true,
				'chat_model'   => 'claude-haiku-4-5',
				'embed_model'  => '',
				'chat_models'  => array( 'claude-haiku-4-5', 'claude-sonnet-5', 'claude-opus-4-8' ),
				'embed_models' => array(),
				'key_hint'     => 'sk-ant-…',
				'key_url'      => 'https://console.anthropic.com/settings/keys',
			),
			'gemini'     => array(
				'label'        => 'Google Gemini',
				'family'       => 'gemini',
				'embed_family' => 'gemini',
				'base'         => 'https://generativelanguage.googleapis.com/v1beta',
				'chat'         => true,
				'embed'        => true,
				'vision'       => true,
				'json_mode'    => true,
				'direct'       => true,
				'server'       => false,
				'chat_model'   => 'gemini-2.0-flash',
				'embed_model'  => 'gemini-embedding-001',
				'chat_models'  => array( 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro' ),
				'embed_models' => array( 'gemini-embedding-001' ),
				'key_hint'     => 'AIza…',
				'key_url'      => 'https://aistudio.google.com/app/apikey',
			),
			'groq'       => array(
				'label'        => 'Groq',
				'family'       => 'openai',
				'embed_family' => '',
				'base'         => 'https://api.groq.com/openai/v1',
				'chat'         => true,
				'embed'        => false,
				'vision'       => false,
				'json_mode'    => true,
				'direct'       => true,
				'server'       => true,
				'chat_model'   => 'llama-3.3-70b-versatile',
				'embed_model'  => '',
				'chat_models'  => array( 'llama-3.3-70b-versatile' ),
				'embed_models' => array(),
				'key_hint'     => 'gsk_…',
				'key_url'      => 'https://console.groq.com/keys',
			),
			'deepseek'   => array(
				'label'        => 'DeepSeek',
				'family'       => 'openai',
				'embed_family' => '',
				'base'         => 'https://api.deepseek.com/v1',
				'chat'         => true,
				'embed'        => false,
				'vision'       => false,
				'json_mode'    => true,
				'direct'       => true,
				'server'       => true,
				'chat_model'   => 'deepseek-chat',
				'embed_model'  => '',
				'chat_models'  => array( 'deepseek-chat' ),
				'embed_models' => array(),
				'key_hint'     => 'sk-…',
				'key_url'      => 'https://platform.deepseek.com/api_keys',
			),
			'mistral'    => array(
				'label'        => 'Mistral',
				'family'       => 'openai',
				'embed_family' => 'openai',
				'base'         => 'https://api.mistral.ai/v1',
				'chat'         => true,
				'embed'        => true,
				'vision'       => true,
				'json_mode'    => true,
				'direct'       => true,
				'server'       => true,
				'chat_model'   => 'mistral-small-latest',
				'embed_model'  => 'mistral-embed',
				'chat_models'  => array( 'mistral-small-latest', 'mistral-large-latest' ),
				'embed_models' => array( 'mistral-embed' ),
				'key_hint'     => '',
				'key_url'      => 'https://console.mistral.ai/api-keys',
			),
			'together'   => array(
				'label'        => 'Together AI',
				'family'       => 'openai',
				'embed_family' => '',
				'base'         => 'https://api.together.xyz/v1',
				'chat'         => true,
				'embed'        => false,
				'vision'       => false,
				'json_mode'    => true,
				'direct'       => true,
				'server'       => true,
				'chat_model'   => 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
				'embed_model'  => '',
				'chat_models'  => array( 'meta-llama/Llama-3.3-70B-Instruct-Turbo' ),
				'embed_models' => array(),
				'key_hint'     => '',
				'key_url'      => 'https://api.together.ai/settings/api-keys',
			),
			'openrouter' => array(
				'label'        => 'OpenRouter',
				'family'       => 'openai',
				'embed_family' => 'openai',
				'base'         => 'https://openrouter.ai/api/v1',
				'chat'         => true,
				'embed'        => true,
				'vision'       => true,
				'json_mode'    => true,
				'direct'       => true,
				'server'       => true,
				'chat_model'   => 'openai/gpt-4o-mini',
				'embed_model'  => 'openai/text-embedding-3-small',
				'chat_models'  => array( 'openai/gpt-4o-mini', 'anthropic/claude-haiku-4.5', 'google/gemini-2.0-flash-001' ),
				'embed_models' => array( 'openai/text-embedding-3-small', 'openai/text-embedding-3-large' ),
				'key_hint'     => 'sk-or-…',
				'key_url'      => 'https://openrouter.ai/settings/keys',
			),
			'xai'        => array(
				'label'        => 'xAI (Grok)',
				'family'       => 'openai',
				'embed_family' => '',
				'base'         => 'https://api.x.ai/v1',
				'chat'         => true,
				'embed'        => false,
				'vision'       => true,
				'json_mode'    => true,
				'direct'       => true,
				'server'       => false,
				'chat_model'   => 'grok-2-latest',
				'embed_model'  => '',
				'chat_models'  => array( 'grok-2-latest' ),
				'embed_models' => array(),
				'key_hint'     => 'xai-…',
				'key_url'      => 'https://console.x.ai',
			),
			'voyage'     => array(
				'label'        => 'Voyage AI (embeddings only)',
				'family'       => '',
				'embed_family' => 'openai',
				'base'         => 'https://api.voyageai.com/v1',
				'chat'         => false,
				'embed'        => true,
				'vision'       => false,
				'json_mode'    => false,
				'direct'       => true,
				'server'       => false,
				'chat_model'   => '',
				'embed_model'  => 'voyage-3-lite',
				'chat_models'  => array(),
				'embed_models' => array( 'voyage-3-lite', 'voyage-3' ),
				'key_hint'     => 'pa-…',
				'key_url'      => 'https://dash.voyageai.com',
			),
			'ollama'     => array(
				'label'        => 'Ollama (self-hosted server only)',
				'family'       => '',
				'embed_family' => '',
				'base'         => '',
				'chat'         => true,
				'embed'        => true,
				'vision'       => true,
				'json_mode'    => true,
				'direct'       => false,
				'server'       => true,
				'chat_model'   => 'qwen3:8b',
				'embed_model'  => 'nomic-embed-text',
				'chat_models'  => array( 'qwen3:8b', 'llama3.1:8b' ),
				'embed_models' => array( 'nomic-embed-text' ),
				'key_hint'     => '',
				'key_url'      => '',
			),
		);
		// phpcs:enable PluginCheck.CodeAnalysis.AIProvider.DirectIntegration
	}

	/**
	 * One provider's definition, or null when the id is unknown.
	 *
	 * @param string $provider Provider id.
	 * @return array<string,mixed>|null
	 */
	public static function provider( string $provider ): ?array {
		$all = self::registry();
		$id  = strtolower( trim( $provider ) );

		return isset( $all[ $id ] ) ? $all[ $id ] : null;
	}

	/**
	 * Every known provider id (direct + legacy server).
	 *
	 * @return array<int,string>
	 */
	public static function provider_ids(): array {
		return array_keys( self::registry() );
	}

	/**
	 * Registry trimmed down to what the admin UI needs (no secrets live here).
	 *
	 * @return array<string,array<string,mixed>>
	 */
	public static function ui_registry(): array {
		$out = array();
		foreach ( self::registry() as $id => $p ) {
			$out[ $id ] = array(
				'label'       => $p['label'],
				'chat'        => (bool) $p['chat'],
				'embed'       => (bool) $p['embed'],
				'vision'      => (bool) $p['vision'],
				'direct'      => (bool) $p['direct'],
				'server'      => (bool) $p['server'],
				'chatModel'   => $p['chat_model'],
				'embedModel'  => $p['embed_model'],
				'chatModels'  => $p['chat_models'],
				'embedModels' => $p['embed_models'],
				'keyHint'     => $p['key_hint'],
				'keyUrl'      => $p['key_url'],
			);
		}

		return $out;
	}

	/**
	 * Whether a provider can answer chat turns straight from WordPress.
	 *
	 * @param string $provider Provider id.
	 * @return bool
	 */
	public static function supports_direct_chat( string $provider ): bool {
		$p = self::provider( $provider );

		return null !== $p && $p['chat'] && $p['direct'];
	}

	/**
	 * Whether a provider exposes an embeddings endpoint we can call directly.
	 *
	 * @param string $provider Provider id.
	 * @return bool
	 */
	public static function supports_embeddings( string $provider ): bool {
		$p = self::provider( $provider );

		return null !== $p && $p['embed'] && $p['direct'] && '' !== (string) $p['embed_family'];
	}

	/**
	 * Whether a provider accepts image parts in a chat turn.
	 *
	 * @param string $provider Provider id.
	 * @return bool
	 */
	public static function supports_vision( string $provider ): bool {
		$p = self::provider( $provider );

		return null !== $p && (bool) $p['vision'];
	}

	/**
	 * Fallback chat model for a provider.
	 *
	 * @param string $provider Provider id.
	 * @return string
	 */
	public static function default_chat_model( string $provider ): string {
		$p = self::provider( $provider );

		return null === $p ? '' : (string) $p['chat_model'];
	}

	/**
	 * Fallback embedding model for a provider.
	 *
	 * @param string $provider Provider id.
	 * @return string
	 */
	public static function default_embed_model( string $provider ): string {
		$p = self::provider( $provider );

		return null === $p ? '' : (string) $p['embed_model'];
	}

	/**
	 * Human label for a provider id.
	 *
	 * @param string $provider Provider id.
	 * @return string
	 */
	public static function label( string $provider ): string {
		$p = self::provider( $provider );

		return null === $p ? $provider : (string) $p['label'];
	}

	/* ─────────────────────────────  Chat  ───────────────────────────── */

	/**
	 * One chat completion.
	 *
	 * `$args` accepts:
	 *  - `system`      string  System / developer instruction.
	 *  - `messages`    array   `[{role: user|assistant, content: string, image?: data-URI}]`.
	 *  - `max_tokens`  int     Reply cap (default 800).
	 *  - `temperature` float   Sampling (ignored on Anthropic — recent models reject it).
	 *  - `json`        bool    Ask for a JSON object back, when the provider supports it.
	 *  - `timeout`     int     HTTP timeout in seconds.
	 *
	 * @param string              $provider Provider id.
	 * @param string              $model    Model id ('' → provider default).
	 * @param string              $api_key  Decrypted key.
	 * @param array<string,mixed> $args     See above.
	 * @return array{text:string,usage:array<string,int>}|\WP_Error
	 */
	public static function chat( string $provider, string $model, string $api_key, array $args ) {
		$p = self::provider( $provider );
		if ( null === $p || ! $p['chat'] || ! $p['direct'] ) {
			return new \WP_Error(
				'nexulesuite_llm_provider',
				__( 'Choose an AI provider that supports direct chat.', 'nexus-lead-suite' ),
				array( 'status' => 400 )
			);
		}
		if ( '' === trim( $api_key ) ) {
			return new \WP_Error(
				'nexulesuite_llm_nokey',
				sprintf(
					/* translators: %s: provider label. */
					__( 'No %s API key is saved. Add one in Settings → AI Chatbot.', 'nexus-lead-suite' ),
					(string) $p['label']
				),
				array( 'status' => 400 )
			);
		}

		$model    = '' !== trim( $model ) ? trim( $model ) : (string) $p['chat_model'];
		$messages = self::normalize_turns( isset( $args['messages'] ) && is_array( $args['messages'] ) ? $args['messages'] : array() );
		if ( empty( $messages ) ) {
			return new \WP_Error( 'nexulesuite_llm_empty', __( 'Nothing to send to the model.', 'nexus-lead-suite' ), array( 'status' => 400 ) );
		}

		$args['messages'] = $messages;
		$args['model']    = $model;

		switch ( (string) $p['family'] ) {
			case 'anthropic':
				return self::chat_anthropic( $p, $api_key, $args );
			case 'gemini':
				return self::chat_gemini( $p, $api_key, $args );
			default:
				return self::chat_openai( $p, $api_key, $args );
		}
	}

	/**
	 * OpenAI-compatible `/chat/completions` (OpenAI, Groq, DeepSeek, Mistral, Together, OpenRouter, xAI).
	 *
	 * @param array<string,mixed> $p       Provider definition.
	 * @param string              $api_key Decrypted key.
	 * @param array<string,mixed> $args    Chat args (already normalized).
	 * @return array{text:string,usage:array<string,int>}|\WP_Error
	 */
	private static function chat_openai( array $p, string $api_key, array $args ) {
		$msgs = array();
		$system = trim( (string) ( $args['system'] ?? '' ) );
		if ( '' !== $system ) {
			$msgs[] = array( 'role' => 'system', 'content' => $system );
		}

		foreach ( $args['messages'] as $turn ) {
			$image = self::split_data_uri( (string) ( $turn['image'] ?? '' ) );
			if ( null !== $image && $p['vision'] ) {
				$content = array(
					array( 'type' => 'text', 'text' => (string) $turn['content'] ),
					array(
						'type'      => 'image_url',
						'image_url' => array( 'url' => 'data:' . $image['mime'] . ';base64,' . $image['data'] ),
					),
				);
			} else {
				$content = (string) $turn['content'];
			}
			$msgs[] = array( 'role' => (string) $turn['role'], 'content' => $content );
		}

		$body = array(
			'model'       => (string) $args['model'],
			'messages'    => $msgs,
			'max_tokens'  => (int) ( $args['max_tokens'] ?? 800 ),
			'temperature' => (float) ( $args['temperature'] ?? 0.2 ),
			'top_p'       => 0.85,
		);
		if ( ! empty( $args['json'] ) && $p['json_mode'] ) {
			$body['response_format'] = array( 'type' => 'json_object' );
		}

		$headers = array(
			'Content-Type'  => 'application/json',
			'Authorization' => 'Bearer ' . $api_key,
		);
		// OpenRouter attributes requests to the calling app; harmless elsewhere, so keep it scoped.
		// phpcs:ignore PluginCheck.CodeAnalysis.AIProvider.DirectIntegration -- Opt-in, disclosed provider; this only matches the base URL already defined in the registry to add OpenRouter's attribution headers.
		if ( 'https://openrouter.ai/api/v1' === $p['base'] ) {
			$headers['HTTP-Referer'] = home_url();
			$headers['X-Title']      = wp_strip_all_tags( (string) get_bloginfo( 'name' ) );
		}

		$json = self::http( $p['base'] . '/chat/completions', $headers, $body, (int) ( $args['timeout'] ?? 60 ) );
		if ( is_wp_error( $json ) ) {
			return $json;
		}

		$text = '';
		if ( isset( $json['choices'][0]['message']['content'] ) && is_string( $json['choices'][0]['message']['content'] ) ) {
			$text = $json['choices'][0]['message']['content'];
		}

		return array(
			'text'  => self::clean_answer( $text ),
			'usage' => array(
				'input'  => (int) ( $json['usage']['prompt_tokens'] ?? 0 ),
				'output' => (int) ( $json['usage']['completion_tokens'] ?? 0 ),
			),
		);
	}

	/**
	 * Anthropic `/messages`.
	 *
	 * Recent Claude models (Opus 4.7+, Sonnet 5, Fable 5) reject `temperature` / `top_p`
	 * with a 400, so no sampling parameters are sent on this branch.
	 *
	 * @param array<string,mixed> $p       Provider definition.
	 * @param string              $api_key Decrypted key.
	 * @param array<string,mixed> $args    Chat args (already normalized).
	 * @return array{text:string,usage:array<string,int>}|\WP_Error
	 */
	private static function chat_anthropic( array $p, string $api_key, array $args ) {
		$msgs = array();
		foreach ( $args['messages'] as $turn ) {
			$blocks = array();
			$image  = self::split_data_uri( (string) ( $turn['image'] ?? '' ) );
			if ( null !== $image ) {
				$blocks[] = array(
					'type'   => 'image',
					'source' => array(
						'type'       => 'base64',
						'media_type' => $image['mime'],
						'data'       => $image['data'],
					),
				);
			}
			$blocks[] = array( 'type' => 'text', 'text' => (string) $turn['content'] );
			$msgs[]   = array( 'role' => (string) $turn['role'], 'content' => $blocks );
		}

		$body = array(
			'model'      => (string) $args['model'],
			'max_tokens' => (int) ( $args['max_tokens'] ?? 800 ),
			'messages'   => $msgs,
		);
		$system = trim( (string) ( $args['system'] ?? '' ) );
		if ( '' !== $system ) {
			$body['system'] = $system;
		}

		$json = self::http(
			$p['base'] . '/messages',
			array(
				'Content-Type'      => 'application/json',
				'x-api-key'         => $api_key,
				'anthropic-version' => self::ANTHROPIC_VERSION,
			),
			$body,
			(int) ( $args['timeout'] ?? 60 )
		);
		if ( is_wp_error( $json ) ) {
			return $json;
		}

		$text = '';
		if ( isset( $json['content'] ) && is_array( $json['content'] ) ) {
			foreach ( $json['content'] as $block ) {
				if ( is_array( $block ) && 'text' === ( $block['type'] ?? '' ) ) {
					$text .= (string) ( $block['text'] ?? '' );
				}
			}
		}

		return array(
			'text'  => self::clean_answer( $text ),
			'usage' => array(
				'input'  => (int) ( $json['usage']['input_tokens'] ?? 0 ),
				'output' => (int) ( $json['usage']['output_tokens'] ?? 0 ),
			),
		);
	}

	/**
	 * Google Gemini `models/{model}:generateContent`.
	 *
	 * @param array<string,mixed> $p       Provider definition.
	 * @param string              $api_key Decrypted key.
	 * @param array<string,mixed> $args    Chat args (already normalized).
	 * @return array{text:string,usage:array<string,int>}|\WP_Error
	 */
	private static function chat_gemini( array $p, string $api_key, array $args ) {
		$contents = array();
		foreach ( $args['messages'] as $turn ) {
			$parts = array( array( 'text' => (string) $turn['content'] ) );
			$image = self::split_data_uri( (string) ( $turn['image'] ?? '' ) );
			if ( null !== $image ) {
				$parts[] = array(
					'inline_data' => array(
						'mime_type' => $image['mime'],
						'data'      => $image['data'],
					),
				);
			}
			$contents[] = array(
				'role'  => 'assistant' === $turn['role'] ? 'model' : 'user',
				'parts' => $parts,
			);
		}

		$generation = array(
			'temperature'     => (float) ( $args['temperature'] ?? 0.2 ),
			'maxOutputTokens' => (int) ( $args['max_tokens'] ?? 800 ),
			'topP'            => 0.85,
		);
		if ( ! empty( $args['json'] ) ) {
			$generation['responseMimeType'] = 'application/json';
		}

		$body = array(
			'contents'         => $contents,
			'generationConfig' => $generation,
		);
		$system = trim( (string) ( $args['system'] ?? '' ) );
		if ( '' !== $system ) {
			$body['systemInstruction'] = array( 'parts' => array( array( 'text' => $system ) ) );
		}

		$json = self::http(
			$p['base'] . '/models/' . rawurlencode( (string) $args['model'] ) . ':generateContent',
			array(
				'Content-Type'   => 'application/json',
				'x-goog-api-key' => $api_key,
			),
			$body,
			(int) ( $args['timeout'] ?? 60 )
		);
		if ( is_wp_error( $json ) ) {
			return $json;
		}

		$text = '';
		if ( isset( $json['candidates'][0]['content']['parts'] ) && is_array( $json['candidates'][0]['content']['parts'] ) ) {
			foreach ( $json['candidates'][0]['content']['parts'] as $part ) {
				if ( is_array( $part ) && isset( $part['text'] ) ) {
					$text .= (string) $part['text'];
				}
			}
		}

		return array(
			'text'  => self::clean_answer( $text ),
			'usage' => array(
				'input'  => (int) ( $json['usageMetadata']['promptTokenCount'] ?? 0 ),
				'output' => (int) ( $json['usageMetadata']['candidatesTokenCount'] ?? 0 ),
			),
		);
	}

	/* ──────────────────────────  Embeddings  ────────────────────────── */

	/**
	 * Embeds a batch of texts, preserving input order.
	 *
	 * @param string            $provider Provider id.
	 * @param string            $model    Embedding model ('' → provider default).
	 * @param string            $api_key  Decrypted key.
	 * @param array<int,string> $texts    Inputs (max ~100 per call).
	 * @return array<int,array<int,float>>|\WP_Error
	 */
	public static function embed( string $provider, string $model, string $api_key, array $texts ) {
		$p = self::provider( $provider );
		if ( null === $p || ! self::supports_embeddings( $provider ) ) {
			return new \WP_Error(
				'nexulesuite_llm_noembed',
				__( 'This provider has no embeddings API. Pick an embedding provider in Settings → AI Chatbot.', 'nexus-lead-suite' ),
				array( 'status' => 400 )
			);
		}
		if ( '' === trim( $api_key ) ) {
			return new \WP_Error(
				'nexulesuite_llm_nokey',
				sprintf(
					/* translators: %s: provider label. */
					__( 'No %s API key is saved for embeddings.', 'nexus-lead-suite' ),
					(string) $p['label']
				),
				array( 'status' => 400 )
			);
		}

		$clean = array();
		foreach ( $texts as $text ) {
			$text = trim( (string) $text );
			if ( '' === $text ) {
				continue;
			}
			$clean[] = mb_substr( $text, 0, self::EMBED_INPUT_MAX_CHARS );
		}
		if ( empty( $clean ) ) {
			return array();
		}

		$model = '' !== trim( $model ) ? trim( $model ) : (string) $p['embed_model'];

		return 'gemini' === (string) $p['embed_family']
			? self::embed_gemini( $p, $model, $api_key, $clean )
			: self::embed_openai( $p, $model, $api_key, $clean );
	}

	/**
	 * OpenAI-shaped `/embeddings` (OpenAI, Mistral, Voyage).
	 *
	 * @param array<string,mixed> $p       Provider definition.
	 * @param string              $model   Embedding model.
	 * @param string              $api_key Decrypted key.
	 * @param array<int,string>   $texts   Inputs.
	 * @return array<int,array<int,float>>|\WP_Error
	 */
	private static function embed_openai( array $p, string $model, string $api_key, array $texts ) {
		$json = self::http(
			$p['base'] . '/embeddings',
			array(
				'Content-Type'  => 'application/json',
				'Authorization' => 'Bearer ' . $api_key,
			),
			array(
				'model' => $model,
				'input' => $texts,
			),
			60
		);
		if ( is_wp_error( $json ) ) {
			return $json;
		}
		if ( ! isset( $json['data'] ) || ! is_array( $json['data'] ) ) {
			return new \WP_Error( 'nexulesuite_llm_embedshape', __( 'The embedding provider returned an unexpected response.', 'nexus-lead-suite' ), array( 'status' => 502 ) );
		}

		// `data[].index` is authoritative — do not rely on array order.
		$out = array();
		foreach ( $json['data'] as $pos => $row ) {
			if ( ! is_array( $row ) || ! isset( $row['embedding'] ) || ! is_array( $row['embedding'] ) ) {
				continue;
			}
			$index         = isset( $row['index'] ) ? (int) $row['index'] : (int) $pos;
			$out[ $index ] = array_map( 'floatval', $row['embedding'] );
		}
		ksort( $out );

		return array_values( $out );
	}

	/**
	 * Gemini `models/{model}:batchEmbedContents`.
	 *
	 * @param array<string,mixed> $p       Provider definition.
	 * @param string              $model   Embedding model.
	 * @param string              $api_key Decrypted key.
	 * @param array<int,string>   $texts   Inputs.
	 * @return array<int,array<int,float>>|\WP_Error
	 */
	private static function embed_gemini( array $p, string $model, string $api_key, array $texts ) {
		$requests = array();
		foreach ( $texts as $text ) {
			$requests[] = array(
				'model'   => 'models/' . $model,
				'content' => array( 'parts' => array( array( 'text' => $text ) ) ),
			);
		}

		$json = self::http(
			$p['base'] . '/models/' . rawurlencode( $model ) . ':batchEmbedContents',
			array(
				'Content-Type'   => 'application/json',
				'x-goog-api-key' => $api_key,
			),
			array( 'requests' => $requests ),
			60
		);
		if ( is_wp_error( $json ) ) {
			return $json;
		}
		if ( ! isset( $json['embeddings'] ) || ! is_array( $json['embeddings'] ) ) {
			return new \WP_Error( 'nexulesuite_llm_embedshape', __( 'The embedding provider returned an unexpected response.', 'nexus-lead-suite' ), array( 'status' => 502 ) );
		}

		$out = array();
		foreach ( $json['embeddings'] as $row ) {
			if ( is_array( $row ) && isset( $row['values'] ) && is_array( $row['values'] ) ) {
				$out[] = array_map( 'floatval', $row['values'] );
			}
		}

		return $out;
	}

	/* ─────────────────────────────  Test  ───────────────────────────── */

	/**
	 * One tiny real completion, so a bad key surfaces in the admin rather than on a visitor's first message.
	 *
	 * @param string $provider Provider id.
	 * @param string $model    Model id.
	 * @param string $api_key  Decrypted key.
	 * @return array{latency_ms:int,text:string}|\WP_Error
	 */
	public static function test_chat( string $provider, string $model, string $api_key ) {
		$started = microtime( true );
		$res     = self::chat(
			$provider,
			$model,
			$api_key,
			array(
				'system'     => 'Reply with the single word: ok',
				'messages'   => array( array( 'role' => 'user', 'content' => 'ping' ) ),
				'max_tokens' => 8,
				'timeout'    => 25,
			)
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}

		return array(
			'latency_ms' => (int) round( ( microtime( true ) - $started ) * 1000 ),
			'text'       => mb_substr( $res['text'], 0, 40 ),
		);
	}

	/* ────────────────────────────  Helpers  ─────────────────────────── */

	/**
	 * Drops empty turns, forces a valid role, collapses consecutive same-role turns
	 * and guarantees the transcript opens on a user turn — Anthropic and Gemini both
	 * reject anything else, and no provider is harmed by the normalization.
	 *
	 * @param array<int,array<string,mixed>> $messages Raw turns.
	 * @return array<int,array<string,string>>
	 */
	private static function normalize_turns( array $messages ): array {
		$clean = array();
		foreach ( $messages as $turn ) {
			if ( ! is_array( $turn ) ) {
				continue;
			}
			$content = trim( (string) ( $turn['content'] ?? '' ) );
			$image   = (string) ( $turn['image'] ?? '' );
			if ( '' === $content && '' === $image ) {
				continue;
			}
			$role = ( 'assistant' === ( $turn['role'] ?? '' ) ) ? 'assistant' : 'user';

			// An image-only turn still needs text on Gemini/Anthropic.
			if ( '' === $content ) {
				$content = '(image attached)';
			}

			$last = count( $clean ) - 1;
			if ( $last >= 0 && $clean[ $last ]['role'] === $role && '' === $image && '' === $clean[ $last ]['image'] ) {
				$clean[ $last ]['content'] .= "\n\n" . $content;
				continue;
			}
			$clean[] = array( 'role' => $role, 'content' => $content, 'image' => $image );
		}

		// Trim leading assistant turns.
		while ( ! empty( $clean ) && 'assistant' === $clean[0]['role'] ) {
			array_shift( $clean );
		}

		return $clean;
	}

	/**
	 * Splits a `data:image/png;base64,…` URI into mime + payload.
	 *
	 * @param string $uri Data URI.
	 * @return array{mime:string,data:string}|null
	 */
	private static function split_data_uri( string $uri ): ?array {
		$uri = trim( $uri );
		if ( '' === $uri || ! preg_match( '#^data:(image/(?:png|jpe?g|gif|webp));base64,(.+)$#is', $uri, $m ) ) {
			return null;
		}

		return array(
			'mime' => strtolower( $m[1] ),
			'data' => preg_replace( '/\s+/', '', $m[2] ),
		);
	}

	/**
	 * Strips reasoning-model `<think>` blocks and collapses the blank lines they leave behind.
	 *
	 * @param string $text Raw model output.
	 * @return string
	 */
	private static function clean_answer( string $text ): string {
		$text = preg_replace( '#<think>.*?</think>#is', '', $text );
		$text = preg_replace( '/\n{3,}/', "\n\n", (string) $text );

		return trim( (string) $text );
	}

	/**
	 * POSTs JSON and decodes the reply, turning every failure into a WP_Error whose
	 * message is safe to show an administrator (any key-shaped token is redacted).
	 *
	 * @param string                $url     Absolute endpoint.
	 * @param array<string,string>  $headers Request headers.
	 * @param array<string,mixed>   $body    JSON body.
	 * @param int                   $timeout Seconds.
	 * @return array<string,mixed>|\WP_Error
	 */
	private static function http( string $url, array $headers, array $body, int $timeout ) {
		$res = wp_remote_post(
			$url,
			array(
				'timeout' => max( 5, $timeout ),
				'headers' => $headers,
				'body'    => wp_json_encode( $body ),
			)
		);
		if ( is_wp_error( $res ) ) {
			return new \WP_Error( 'nexulesuite_llm_unreachable', self::redact( $res->get_error_message() ), array( 'status' => 502 ) );
		}

		$code = (int) wp_remote_retrieve_response_code( $res );
		$json = json_decode( (string) wp_remote_retrieve_body( $res ), true );

		if ( $code < 200 || $code >= 300 ) {
			$msg = self::extract_error( is_array( $json ) ? $json : array() );
			if ( '' === $msg ) {
				$msg = sprintf(
					/* translators: %d: HTTP status code. */
					__( 'The AI provider returned an error (%d).', 'nexus-lead-suite' ),
					$code
				);
			}
			return new \WP_Error( 'nexulesuite_llm_http', self::redact( $msg ), array( 'status' => $code > 0 ? $code : 502 ) );
		}

		return is_array( $json ) ? $json : array();
	}

	/**
	 * Pulls the human-readable message out of the various vendor error envelopes.
	 *
	 * @param array<string,mixed> $json Decoded error body.
	 * @return string
	 */
	private static function extract_error( array $json ): string {
		if ( isset( $json['error']['message'] ) && is_string( $json['error']['message'] ) ) {
			return $json['error']['message'];
		}
		if ( isset( $json['error'] ) && is_string( $json['error'] ) ) {
			return $json['error'];
		}
		foreach ( array( 'message', 'detail' ) as $key ) {
			if ( isset( $json[ $key ] ) && is_string( $json[ $key ] ) ) {
				return $json[ $key ];
			}
		}

		return '';
	}

	/**
	 * Masks anything shaped like an API key before the string reaches the admin UI or a log.
	 *
	 * @param string $text Message.
	 * @return string
	 */
	private static function redact( string $text ): string {
		return (string) preg_replace(
			'/\b(?:sk-ant|sk-or|sk|gsk|xai|pa)[-_][A-Za-z0-9_\-]{8,}|\bAIza[A-Za-z0-9_\-]{8,}/',
			'[redacted]',
			$text
		);
	}
}
