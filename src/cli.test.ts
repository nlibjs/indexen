import test from 'ava';
import * as childProcess from 'child_process';
import * as fs from 'fs/promises';
import {createRequire} from 'module';
import * as os from 'os';
import * as path from 'path';

const require = createRequire(import.meta.url);
const cliFilePath = require.resolve('./cli.mjs');
type Files = Record<string, string>;
const createTestDirectory = async () => await fs.mkdtemp(path.join(os.tmpdir(), 'indexen-'));
const deployFiles = async (directory: string, files: Files) => {
    for (const [relativePath, body] of Object.entries(files)) {
        const dest = path.join(directory, ...relativePath.split('/'));
        await fs.mkdir(path.dirname(dest), {recursive: true});
        await fs.writeFile(dest, body);
    }
};
const execute = async (cwd: string, ...args: Array<string>) => {
    args.unshift(cliFilePath);
    args.unshift('node');
    await new Promise((resolve, reject) => {
        const p = childProcess.spawn(args.join(' '), {cwd, shell: true, stdio: 'inherit'});
        p.once('error', reject);
        p.once('close', resolve);
    });
};

test('generate index', async (t) => {
    const baseDirectory = await createTestDirectory();
    await deployFiles(baseDirectory, {
        'test/index.ts': '',
        'test/a.js': '',
        'test/a.d.ts': '',
        'test/b/b.js': '',
        'test/b/b.ts': '',
        'test/b/c.ts': '',
        'test/b/d.js': '',
        'test/b/e.cjs': '',
        'test/b/f.mjs': '',
        'test/b/testFoo.ts': '',
        'test/b/x.test.ts': '',
        'test/b/y.private.ts': '',
        'test/c1/c2/c.js': '',
    });
    const output = path.join(baseDirectory, 'test', 'index.ts');
    const expected = [
        '// Generated by @nlib/indexen',
        'export * from \'./a\';',
        'export * from \'./b/b\';',
        'export * from \'./b/c\';',
        'export * from \'./b/d\';',
        'export * from \'./b/e\';',
        'export * from \'./b/f\';',
        'export * from \'./b/testFoo\';',
        '',
    ].join('\n');
    await execute(baseDirectory, '-o', output, '"*.js" "b/*"');
    t.is(await fs.readFile(output, 'utf8'), expected);
});
