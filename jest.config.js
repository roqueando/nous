module.exports = {
    transform: {
        '^.+\\.ts?$': 'ts-jest'
    },
    testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx|js)$',
    preset: 'ts-jest',
    testEnvironment: 'node',
    runner: 'jest-runner',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
