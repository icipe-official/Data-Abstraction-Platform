# Website for the data administration platform

## Pre-requisites

1. Node version: 20.9.0

## Required env variables

1. PUBLIC_API_URL="http://localhost:5174/dap/v1" #Must match the backend_api url it is running on.
2. PUBLIC_VERSION="V1Alpha"
3. PUBLIC_LOG_LEVEL="0" #Set 0=debug, 1=warning 2=error

## Steps to run

1. Set required env variables in a .env file.
2. Run `npm install`
3. Launch the dev server `npm run dev`
4. Visit the website at `http://localhost:5173/dap`. NB. Domain should match DOMAIN_URL variable set in the backend_service api or you'll get a CORS error.

## Miscellaneous

### create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

### Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

### Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
