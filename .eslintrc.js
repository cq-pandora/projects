module.exports = {
	env: {
		node: true
	},
	'extends': [
		'airbnb-base',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript',
		'plugin:@typescript-eslint/recommended'
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json',
		tsconfigRootDir: __dirname
	},
	plugins: [
		'import',
		'@typescript-eslint'
	],
	rules: {
		'@typescript-eslint/interface-name-prefix': ['error', 'always'],
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/indent': ['error', 'tab'],
		'@typescript-eslint/ban-ts-ignore': 'off',
		'@typescript-eslint/semi': ['error'],
		'no-restricted-syntax': ['error', 'WithStatement'],
		'comma-dangle': ['error', 'only-multiline'],
		'max-len': ['error',
			{
				code: 120,
				ignoreTemplateLiterals: true,
				ignoreStrings: true
			}
		],
		'no-param-reassign': ['error', { props: false }],
		'import/extensions': ['error', 'ignorePackages',
			{
				js: 'never',
				ts: 'never'
			}
		],
		'no-dupe-class-members': 'off',
		'no-await-in-loop': 'off',
		'arrow-parens': 'off',
		'no-continue': 'off',
		'lines-between-class-members': 'off',
		'no-tabs': ['error',
			{
				allowIndentationTabs: true
			}
		],
		indent: 'off',
		semi: 'off',
		'class-methods-use-this': 'off',
		'no-multi-assign': 'off',
		'import/prefer-default-export': 'off',
		'max-classes-per-file': ['error', 3],
		'no-plusplus': 'off',
		'no-nested-ternary': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
	},
	overrides: [
		{
			files: [
				'{services,shared}/*/test/**/*.ts'
			],
			env: {
				jest: true
			}
		}
	]
};
