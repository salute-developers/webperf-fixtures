import {
    configBase,
    createConfig,
    configPrettier,
    saluteRules,
    configNextJs,
    configReact,
    configReactCompiler,
    reactRules,
} from '@salutejs/eslint-config';
import { globalIgnores } from 'eslint/config';

/**
 * @type {import('typescript-eslint').ConfigArray}
 */
export default createConfig(
    globalIgnores(['node_modules', 'package-lock.json', '.next', '**/*.d.ts']),
    configBase,
    configPrettier,
    configNextJs,
    configReact,
    configReactCompiler,
    {
        rules: {
            ...saluteRules,
            ...reactRules,
            'react-hooks/exhaustive-deps': 'error',
        },
    },
);
