# 🐾 NekoGrimoire

A community-curated gallery of AI art prompts, built as a static site with
[11ty](https://www.11ty.dev/). Browse what a prompt produces, see the exact
text, and compare multiple versions per model side by side. Anyone can
submit a new prompt via a pull request — including people with no git/CLI
experience, via the in-browser [Submit a Prompt](/submit/) form.

## Setup

```sh
npm install
npm start      # dev server at http://localhost:8080
npm run build   # outputs to _site/
```

## Before you deploy

Edit `src/_data/site.js` and set `repo` to your actual
`"github-username/repo-name"`. This value drives the "Submit a Prompt" page
links and the footer/nav GitHub links.

## Deploying to GitHub Pages

A workflow at `.github/workflows/deploy.yml` builds the site with 11ty and
publishes it via GitHub Pages on every push to `main`.

1. Push this repo to GitHub.
2. In the repo settings, go to **Pages** and set **Source** to
   **GitHub Actions**.
3. Push to `main` — the site builds and deploys automatically.

If your repo is **not** named `<your-username>.github.io` (i.e. it's a
project page, served at `/repo-name/`), the workflow already passes the
correct `PATH_PREFIX` automatically. If you rename the repo, the prefix
updates on the next deploy — no changes needed.

## Adding a prompt

See [CONTRIBUTING.md](CONTRIBUTING.md) for the JSON schema and both the
no-GitHub-experience and manual git flows.

## How submissions work without a backend

GitHub Pages only serves static files, so there's no server to accept
uploads. The Submit page works around this using GitHub's own web UI:

- It builds the prompt JSON in the browser and opens GitHub's
  `.../new/<branch>?filename=...&value=...` URL, which pre-fills GitHub's
  "create new file" editor.
- For visitors without write access, GitHub automatically forks the repo
  and proposes a pull request when they commit.
- Optional images go through GitHub's own `/upload/<branch>/images` page
  the same way.

This means a GitHub account is still required (it's free and fast to
create), but no git, CLI, or manual JSON-schema knowledge is needed.

## Project structure

```
prompts/            one JSON file per prompt (see CONTRIBUTING.md)
images/              prompt result images referenced from prompts/*.json
src/                 11ty site source
  _data/             site config + the prompts.js data loader
  _includes/         base layout + card macro
  assets/            css/js, copied as-is to the built site
  index.njk           gallery page
  prompt.njk          prompt detail page (one per entry, via pagination)
  submit.njk          the no-GitHub-needed submission form
```
