export default {
    extensions: ['ts'],
    require: ['ts-node/register'],
    timeout: '1m',
    files: [
        'src/**/*.test.ts',
        '!**/*.module.ts',
    ],
};
