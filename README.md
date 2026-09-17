# Itypto website

This project is structured as a static site and is ready to be served from a GitHub repository.

## What was adjusted for GitHub hosting

- Relative asset and stylesheet paths were used instead of server-only root URLs.
- Root entry files were added so GitHub Pages can resolve the home page correctly.
- The site no longer depends on the custom Node server for normal page browsing.

## GitHub Pages / private repo notes

- GitHub Pages can serve a static site from a repo, including private repos in supported GitHub plans or enterprise setups.
- If your repo is a standard private repository without Pages support, you will still need a supported hosting plan or deployment method.
- For static hosting, the site root is the repository root and the main landing page is `index.html`.

## Use

Open the site locally from the repo root with any static web server, or deploy the repository via a GitHub Pages workflow.

Example local preview:

```bash
python -m http.server 8000
```

Then open:

- http://localhost:8000/
- http://localhost:8000/main/html/home.html

## Important

The Node server in `index.js` is still useful for local development, but it is not required for GitHub-hosted static deployment.
