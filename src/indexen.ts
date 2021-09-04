import type {CompareFunction} from '@nlib/nodetool';
import {getFileList, normalizeSlash} from '@nlib/nodetool';
import * as path from 'path';

export interface IndexenProps {
    directory: string,
    include: (file: string) => boolean,
    quote?: '"' | '\'' | '`',
    order?: CompareFunction<string>,
}

export const indexen = async function* (
    {
        directory,
        include,
        quote = '\'',
        order,
    }: IndexenProps,
): AsyncGenerator<string> {
    const history: Array<string> = [];
    for (const file of await getFileList(directory, order)) {
        if (include(file)) {
            const id = normalizeSlash(path.relative(directory, file)).slice(0, -path.extname(file).length);
            if (!history.includes(id)) {
                history.push(id);
                yield `export * from ${quote}./${id}${quote};\n`;
            }
        }
    }
};
