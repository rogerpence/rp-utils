# TypeScript utility functions

[Documentation](https://rogerpence.github.io/rp-utils/)

## To add this to a project

```
pnpm add https://github.com/rogerpence/rp-utils
```

or, to install a specific version: 

```
pnpm add https://github.com/rogerpence/rp-utils#[major].[minor].[patch]
```


# Barrel Exports in This Project

This project uses a **barrel export** file at `src/index.ts`.

A barrel file re-exports symbols from many modules so consumers can import from one place instead of many individual files.

## How It Works Here

`src/index.ts` contains `export * from "./..."` statements for the utility modules:

- `array`
- `console`
- `date`
- `filesystem`
- `markdown`
- `math`
- `objects`
- `sort`
- `string`
- `types`

Because of this, anything exported by those modules is available through the barrel.

## Consumer Import Style

Instead of importing from deep module paths, import from the package entry point (the barrel output):

```ts
import { convertDateToStringYYYY_MM_DD, divideWithRemainder } from "<package-entry>";
```

This keeps imports cleaner and makes module organization easier to change without affecting consumers.

