# Directory TempLate engine

Create code folders faster for any language!

## Template syntax

Templates provide few special statements. All of them can be used:

1. Inside of files.
2. In file/directory names.

Any template can consist any count of folders & files.

All statements are wrapped by `--`. Here they are:

1. Case sensitive `name`. Second param of term `new` command:

```js
--Name-- // Case as defined
--name-- // Lower case
--NAME-- // Upper case
--na-me-- // Kebab case
```

2. Current `datetime`:

```js
--DateTime--
```

3. `From-Use` statement. Paste files from other templates:

```js
-- From TemplateName: Use ./rel/path/to/file.js; --
```

## Generating template instance

When your template is ready, simply call command from term:

``` bash
node dtl.mjs new TemplateName NameToUseInTemplate
```