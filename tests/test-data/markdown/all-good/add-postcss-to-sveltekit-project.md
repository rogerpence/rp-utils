---
title: How to add PostCSS to a Sveltekit project
description: How to add PostCSS to a Sveltekit project
date_created: 2025-05-18
date_updated: 2025-11-03
date_published: null
pinned: 
tags:
  - sveltekit
  - asna-com
  - css
---

See also:

 [[use-postcss-and-open-props-with-sveltekit|See this doc too--I am not sure which came first]]

> These instructions use the assets/files provided in this [GitHub repo](https://github.com/rogerpence/postcss-open-props-starter-kit).

Step 1. Create a `css-dev` folder into root of Sveltekit project. This is where all the CSS dev work lives.

Create these two files in `css-dev`:

```css
/* css-dev/style.css */

@import './main.css';
```

```css
/* css-dev/main.css */

body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
```

The `main.css` is where the primary CSS lives. Add other CSS files as needed. 

Step 2. Copy `postcss.config.mjs` (note: `.mjs` extension) into root of Sveltekit project.

```js
import cssnano from 'cssnano';
import postcssImport from 'postcss-import';
import postcssCustomMedia from 'postcss-custom-media';
import openProps from 'open-props';
import postcssJitProps from 'postcss-jit-props';
import postcssGlobalData from '@csstools/postcss-global-data';
// change
import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss';

const DO_NOT_PRESERVE_UNRESOLVED_RULE = false;

console.log('NODE_ENV', process.env.NODE_ENV);

// change
//module.exports = {
export default {
    map: {inline: true},
	plugins: [
		postcssImport(),
		postcssJitProps(openProps),
		postcssGlobalData({
		 	files: ['./node_modules/open-props/src/props.media.css']
		}),
		postcssCustomMedia({
			preserve: DO_NOT_PRESERVE_UNRESOLVED_RULE
		}),

		...(process.env.NODE_ENV === 'production'
			? [purgeCSSPlugin(
				{
					content: ['./src/routes/**/*.svelte'],
					safelist: ['mt-48'],
				}
			)]
			: []),

		...(process.env.NODE_ENV === 'production' ? [cssnano()] : [])
	]
};
```

This line causes PostCSS to include in the final CSS only the Open Props that are referenced in your CSS.

Step 3. Add these two commands to `scripts` node in `package.json`

```
"postcss:build": "postcss ./css-dev/style.css ---dir ./src --env production",
"postcss:watch": "postcss ./css-dev/style.css ---dir ./src --watch --verbose --env development"
```

Note that the `style.css` produced is put in the root of the `./src` folder (alongside `app.html`). (Vite doesn't serve files from outside of the `src` folder.)
Step 4. Add or edit  `+layout.svelte`  in the root of the `routes` folder to import the `style.css` file.

```
<script>
    let { children } = $props();    

    import '../style.css';
</script>

{@render children()}
```

Importing the the `style.css` file this way ensures that when changes are made in the CSS they are shown instantly when the app is running under the dev server.

Step 5. Add these files with pnpm:

```
"cssnano": "^6.0.1",
"postcss-import": "^15.1.0",
"postcss-custom-media": "^10.0.0",
"open-props": "^1.5.10",
"postcss-jit-props": "^1.0.13",
"@csstools/postcss-global-data": "^2.0.1",
"@fullhuman/postcss-purgecss": "^5.0.0",
"postcss": "^8.4.25",
"postcss-cli": "^10.1.0"
```

> [!info]
> You don't need to install and configure `CSSNano` because Vite and PostCSS implicitly compile/compress the CSS with the Sveltekit build step: `pnpm run build`. More on this shortly.

to the dev dependencies of `package.json`.

with this command line:

```
pnpm i -D cssnano postcss-import postcss-custom-media open-props postcss-jit-props @csstools/postcss-global-data @fullhuman/postcss-purgecss postcss postcss-cli
```

The above options are examples what you might want to include. See the `purgecss` [docs](https://purgecss.com/configuration.html) for more information.

Step 6. Run `pnpm i` one time to install the components listed in Step 5.

Step 7. Run `pnpm run postcss:watch` to build the CSS during development

Step 8. Run `pnpm run postcss:build` to build the CSS for production.

## Some notes on [[https://open-props.style/|CSS Open Props]]

In `postcss.config.mjs`, this import pulls in the `postcss-jit-props` module.

```
import postcssJitProps from 'postcss-jit-props';
```

In the `plugins` section of `postcss.config.mjs`, the line below causes PostCSS to include in the final CSS only the Open Props that are referenced in your CSS.

```
plugins:[
    ...
    postcssJitProps(openProps),
    ...
]    
```


```
@import "./css-dev/_configure.css";
@import "./css-dev/_resets.css";
@import "./css-dev/_page.css";
@import "./css-dev/_forms.css";
@import "./css-dev/_utility.css";

:root {
	// Application-specific variables.
    --accent-color: var(--orange-7);
    ...
}
```

After doing `npm run build` you can see the compiled CSS here: (the CSS file name will vary)

```
.svelte-kit\output\client\_app\immutable\assets\0.2b389f06.css
```
### Using Vite with PostCSS and Open Props is so cool

By using [postcss-jit-props](https://github.com/GoogleChromeLabs/postcss-jit-props), you can now use any of the CSS Open Props in your CSS and Vite uses PostCSS to ensure that the variables are selectively imported for you (that is, the only CSS Open Props imported are the ones you need).

For example, a `+page.svelte` file like this:

```
<h1>About</h1>

<style>
	h1 {
		color: var(--purple-4);
		font-size: var(--font-size-2);
	}
</style>
```

Injects this CSS during the Sveltekit build process:

```
:root{--purple-4:#da77f2;--font-size-2:1.1rem}h1.svelte-6n23wp{color:var(--purple-4);font-size:var(--font-size-2)}
```

You don't need to worry about any explicit CSS tree shaking. In the blink of an eye, the `post-jit-props` `PostCSS` plugin prunes your CSS to include only the Open Props variables referenced in your app's CSS.

This process is crazy fast (you won't notice any lag during development as `Vite/PostCSS` keeps your CSS current) and there is hardly any configuration. What's not to love!

