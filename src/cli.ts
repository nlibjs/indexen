#!/usr/bin/env node
import {Command} from 'commander';
import * as console from 'console';
import * as fs from 'fs';
import {indexen} from './indexen';

const packageJson = JSON.parse(
    fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8'),
) as unknown as {name: string, version: string, description: string};
const program = new Command();
program.name(packageJson.name);
program.description(packageJson.description);
program.option('-o, --output <path>', 'A path where the result is written to.');
program.option('-e, --exclude <patterns...>', 'Patterns of files to be excluded. It will be passed to fast-glob.');
program.option('--noext', 'It true, the output will be [export * from "./a"] not [export * from "./a.js"].');
program.argument('<patterns...>', 'Patterns of files to be included. It will be passed to fast-glob.');
program.version(packageJson.version);
program.action(
    /** @param {Array<string>} patterns */
    async (
        include: Array<string>,
        {
            output,
            exclude = [
                '**/*.test.*',
                '**/*.private.*',
            ],
            noext = Boolean(output && output.endsWith('.ts')),
        }: {output?: string, exclude?: Array<string>, noext?: boolean},
    ) => {
        await indexen({
            include,
            exclude,
            withoutExtension: Boolean(noext),
            output,
        });
    },
);
program.parseAsync()
.catch((error) => {
    console.error(error);
    process.exit(1);
});
