# AC Armando Concrete

A responsive, single-page website concept for AC Armando Concrete, featuring a black, white and green visual identity and project photography supplied for the site.

## Features

- Project portfolio with category filters and an automatic carousel.
- Service overview, project process and company information.
- Facebook video reels with visible previews.
- Contact dialog and FAQ assistant with call, text and Google links.
- Review invitation that links to the business's Google profile.
- No blog or individual service pages.

## Project structure

- `dist/` contains the complete static website and optimized image assets.
- `vercel.json` configures the static output directory for Vercel.
- `.github/workflows/deploy-pages.yml` publishes `dist/` to GitHub Pages on pushes to `main`.

## Public website

<https://julioolivodeveloper.github.io/ac-armando-concrete/>

## Preview locally

```sh
python3 -m http.server 4181 --bind 127.0.0.1 -d dist
```

Then open <http://127.0.0.1:4181>.

## Deploy with Vercel

Import this repository into Vercel and use the repository root as the project root. The included configuration serves the static site from `dist/`.
