# web

Website for the Data Abstraction Platform.

## Key technologies used

1. [Vite](https://vitejs.dev/) - Frontend tooling for compiling the website into html, css,js etc. which will be served by the web_service.
2. [Lit](https://lit.dev/) - A framework that offers a neat abstraction for working with [web components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components).
3. [Handlebars](https://handlebarsjs.com/) - Templating tool for writing html templates (files that end with `.hbs.html`). These files are the entry points which will be served and processed by the web_service.
4. [Tailwind](https://tailwindcss.com/) - CSS framework.
5. [DaisyUI](https://daisyui.com/) - CSS framework on top of tailwind that offers styling and theming for common components like buttons, form inputs etc.
6. [Vitest](https://vitest.dev/) - Provides unit testing functionality.

## Environment variables

You can use the [.env.sh](/configs/env.sh.template) to set the required env variables.

NB. Website will require rebuild if any of the below env variables are changed.

- WEB_SERVICE_BASE_PATH - If site is served using a shared domain and therefore hosted on a subpath e.g. `/dap`. Default is `/`.
- VITE_WEBSITE_LOG_LEVEL - 0 for debug, 1 for warning, 2 for error.
- VITE_WEBSITE_TITLE - Title of the website.
- VITE_WEB_SERVICE_API_CORE_URL - Url to the API.

## Development

Install dependencies:

```sh
npm install
```

Audit fix:

```sh
npm audit fix
```

Compile website with hot reload:

```sh
npm run watch
```

Compilation generates `dist/` folder which contains a `html_pages.json` file that provides a map for the website generated which is used by the web_service to process and manipulate the html pages templates.

The `dist/` folder will be used by the web_app when serving the app in production.

Format code with prettier:

```sh
npm run format
```

Unit test watching:

```sh
npm run unit-test:watch
```

## Production

Compile website for production:

```sh
npm run build
```

Unit testing:

```sh
npm run unit-test:run
```

## Recommendations

In [Visual Studio Code](https://code.visualstudio.com/), install the following extensions for a better experience.

- [lit-plugin](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin) - Offers syntax highligting and code completion for Lit elements.
- [tailwind css intellisense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) - For tailwind auto-completion.
- [prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - Code formatter.
