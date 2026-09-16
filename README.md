# Obsidian Pay API documentation

The public API reference, built with [Docusaurus](https://docusaurus.io). Content lives
in `docs/` as Markdown.

## Run it

```bash
cd docs/docusaurus
npm install
npm start          # http://localhost:3000, hot reloads
```

## Build

```bash
npm run build      # outputs to build/
npm run serve      # serve the built site locally
```

`npm run build` fails on a broken internal link, so it is the check to run before
merging documentation changes.

## Layout

```
docs/                 page content
  transactions/       one page per money operation
  reference/          error codes, enums, changelog
sidebars.ts           navigation
docusaurus.config.ts  site config, fonts, navbar, footer
src/css/custom.css    brand palette over the classic theme
static/img/           logo and favicon, from the design system
```

## Writing

- Keep the stock classic theme. It is what readers expect from a docs site.
- One page per resource. Endpoint headings are written as `` `POST /api/v1/...` ``.
- Document what a consumer needs: fields, an example, and what the failures mean.
  Leave internal mechanics out unless they change how the API behaves.
- Error tables list the code, the status and what the client should do.
- Every request example is runnable `curl`. Every response example is a real shape.
- No em dashes.

## Keeping it accurate

The API surface is defined by the controllers in `ObsidianCore.Api/Controllers/`, and
`frontend_workspace/spec/swagger.json` is generated from them. When either changes,
check these pages:

| Change | Pages to update |
| --- | --- |
| New or changed endpoint | The resource page, plus `sidebars.ts` if it is a new page |
| New error code | `docs/reference/errors.md` and the resource page |
| New enum value | `docs/reference/enums.md` |
| Behaviour change for consumers | `docs/reference/changelog.md` |
