<?php return array(
	'a11y/index.js' => array(
		'dependencies' => array(),
		'version' => '1c371cb517a97cdbcb9f',
	),
	'abilities/index.js' => array(
		'dependencies' => array(
			'wp-data',
			'wp-i18n',
		),
		'version' => 'f3475bc77a30dcc5b38d',
	),
	'boot/index.js' => array(
		'dependencies' => array(
			'react',
			'react-dom',
			'react-jsx-runtime',
			'wp-commands',
			'wp-components',
			'wp-compose',
			'wp-core-data',
			'wp-data',
			'wp-editor',
			'wp-element',
			'wp-html-entities',
			'wp-i18n',
			'wp-keyboard-shortcuts',
			'wp-keycodes',
			'wp-notices',
			'wp-primitives',
			'wp-private-apis',
			'wp-theme',
			'wp-url',
		),
		'module_dependencies' => array(
			array(
				'id' => '@wordpress/a11y',
				'import' => 'static',
			),
			array(
				'id' => '@wordpress/lazy-editor',
				'import' => 'dynamic',
			),
			array(
				'id' => '@wordpress/route',
				'import' => 'static',
			),
		),
		'version' => '54bb5a420026a61c7e4f',
	),
	'connectors/index.js' => array(
		'dependencies' => array(
			'react-jsx-runtime',
			'wp-components',
			'wp-data',
			'wp-element',
			'wp-i18n',
			'wp-private-apis',
		),
		'version' => '274797868955a828dfdc',
	),
	'core-abilities/index.js' => array(
		'dependencies' => array(
			'wp-api-fetch',
			'wp-url',
		),
		'module_dependencies' => array(
			array(
				'id' => '@wordpress/abilities',
				'import' => 'static',
			),
		),
		'version' => '012760fd849397dd0031',
	),
	'latex-to-mathml/index.js' => array(
		'dependencies' => array(),
		'version' => 'e5fd3ae6d2c3b6e669da',
	),
	'latex-to-mathml/loader.js' => array(
		'dependencies' => array(),
		'module_dependencies' => array(
			array(
				'id' => '@wordpress/latex-to-mathml',
				'import' => 'dynamic',
			),
		),
		'version' => '4f37456af539bd3d2351',
	),
	'route/index.js' => array(
		'dependencies' => array(
			'react',
			'react-dom',
			'react-jsx-runtime',
			'wp-private-apis',
		),
		'version' => 'c5843b6c5e84b352f43b',
	),
	'workflow/index.js' => array(
		'dependencies' => array(
			'react',
			'react-dom',
			'react-jsx-runtime',
			'wp-components',
			'wp-data',
			'wp-element',
			'wp-i18n',
			'wp-keyboard-shortcuts',
			'wp-primitives',
			'wp-private-apis',
		),
		'module_dependencies' => array(
			array(
				'id' => '@wordpress/abilities',
				'import' => 'static',
			),
		),
		'version' => '13556bc597bbf2a8d620',
	),
);
