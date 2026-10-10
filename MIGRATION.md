# Replace @nlib/indexen with a local script

Maintenance of @nlib/indexen ended on 2026-10-11. Index generation is small enough
to own in each consuming project; no replacement package or new release is planned.
Existing releases remain available, so migration does not need to be immediate.

## Copy and adapt

Copy [examples/generate-index.mjs](examples/generate-index.mjs) to
`scripts/generate-index.mjs` in your project. It uses only Node.js built-ins and
requires Node.js 24 or later. Retain its license notice and a copy of this
repository's [Apache-2.0 license](LICENSE.txt) when distributing the copied code.

For a bundler project that accepts extensionless imports, add this npm script.
Escaped double quotes keep glob patterns intact on both Unix and Windows shells:

```json
{
  "scripts": {
    "generate:index": "node scripts/generate-index.mjs --noext src/index.ts \"src/**/*.ts\""
  }
}
```

For Node ESM, omit `--noext` and include the extensions your project uses:

```sh
node scripts/generate-index.mjs src/index.mts 'src/**/*.{ts,mts}'
```

The default mapping is `.ts`/`.tsx`/`.jsx` to `.js`, `.mts` to `.mjs`, and `.cts`
to `.cjs`. JavaScript extensions are preserved. Adapt this mapping if your compiler
preserves JSX or your runtime executes TypeScript directly.

## Differences to review

- Patterns are relative to the process working directory, rather than the output
  directory as in indexen. Quote patterns so the shell does not expand them.
- The example excludes `.test.*`, `.private.*`, declaration files and the output
  itself. Edit the filter to match your own public API; `.spec.*` is not excluded.
- Exports are sorted and deduplicated. `--noext` removes every source extension,
  including `.mts`; indexen previously kept `.mjs` for `.mts` even in that mode.
- Files are written through a temporary file after discovery completes. An empty
  match is an error and leaves existing output intact. The output directory must
  already exist.
- This is an editable example, not a drop-in implementation of fast-glob or the
  old CLI/API. It emits `export *`; default exports and name collisions still need
  an explicit policy in your project.

Run the script and inspect the generated diff, then run your project's build and
tests. Once the output is correct, replace all indexen calls and remove the dependency:

```sh
npm uninstall --save-dev @nlib/indexen
```

Commit the copied script, npm script changes and lockfile changes together. For
projects on older Node.js, a short explicit list of exports or a local `readdir`
script may be simpler than upgrading just for this example.
