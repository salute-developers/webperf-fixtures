import {
    configBase,
    configNextJs,
    configPrettier,
    configReact,
    configReactCompiler,
    createConfig,
    saluteRules,
} from '@salutejs/eslint-config';
import { globalIgnores } from 'eslint/config';

/**
 * @type {import('typescript-eslint').ConfigArray}
 */
export default createConfig(
    globalIgnores(['package-lock.json', 'node_modules/*', '.next/*', 'dist/*']),
    configBase,
    configNextJs,
    configReactCompiler,
    configReact,
    configPrettier, // always last
    {
        rules: {
            ...saluteRules,
        },
    },
);
