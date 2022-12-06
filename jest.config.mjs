import path from 'path';

/** @type {import('jest').Config} */
export default {
    testMatch: [
        '**/__tests__/**/*.(js|ts|mjs)?(x)', 
        '**/?(*.)+(spec|test).(js|ts|mjs)?(x)',
    ],
    testPathIgnorePatterns: ["<rootDir>/node_modules/"],
    transform: {},
    moduleNameMapper: {
        "chalk": "<rootDir>/node_modules/chalk/source/index.js",
        "#ansi-styles": "<rootDir>/node_modules/chalk/source/vendor/ansi-styles/index.js",
        "#supports-color": "<rootDir>/node_modules/chalk/source/vendor/supports-color/index.js",
    },
};