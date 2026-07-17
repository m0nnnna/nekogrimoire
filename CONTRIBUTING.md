# Contributing to NekoGrimoire

There are two ways to add a prompt:

1. **No GitHub experience needed:** use the [Submit a Prompt](/submit/) page on
   the live site. It generates the JSON file for you and opens GitHub's
   "create new file" page pre-filled — you just review and click "Propose
   new file" / "Create pull request".
2. **Comfortable with git:** follow the manual steps below.

## Manual steps (git / GitHub UI)

1. Fork this repo and create a branch.
2. If your prompt has result image(s), add them under `images/`
   (e.g. `images/my-prompt-name.jpg`). Keep files reasonably small
   (compress large PNGs/JPEGs before committing).
3. Add one new file under `prompts/`, named `your-slug.json`, following the
   schema below.
4. Open a pull request.

## Prompt schema

```jsonc
{
  "title": "Neon Alley Cat",
  "credit": {
    "name": "floofywolf",
    "url": "https://x.com/floofywolf" // optional — X/Twitter, portfolio, etc.
  },
  "tags": ["cyberpunk", "cat", "neon"],
  "images": ["/images/neon-alley-cat-1.jpg"], // optional, can be empty []
  "dateAdded": "2026-07-17",
  "versions": [
    {
      "label": "Midjourney v6",
      "text": "the exact prompt text used for this version…"
    },
    {
      "label": "Stable Diffusion XL",
      "text": "a different prompt text, e.g. for a different model or a variant…"
    }
  ]
}
```

Notes:

- `credit` is optional — omit it entirely to stay anonymous.
- `images` is optional. Leave it as `[]` if you only want to share prompt
  text; the gallery shows a placeholder card instead of a broken image.
- `versions` needs at least one entry. Add multiple entries when you have
  more than one variant of a prompt, or the same prompt adapted for a
  different AI model — each renders as its own copyable block on the
  prompt's page.
- `dateAdded` is `YYYY-MM-DD`, used only for sorting the gallery (newest
  first).

See [`prompts/example-neon-alley-cat.json`](prompts/example-neon-alley-cat.json)
for a working example.
