# Project Gallery

A GitHub Pages-ready project image gallery.

## Features

- Project selection home page
- 25% thumbnail panel / 75% large image viewer
- Keyboard navigation with Left/Right arrows
- Full-size lightbox
- Fullscreen viewer
- Responsive mobile layout
- Projects and images controlled through `data/projects.json`
- No backend or framework required

## Add your own project

1. Create a folder:

```text
images/my-project/
```

2. Put your images inside it:

```text
images/my-project/
├── 01.jpg
├── 02.jpg
└── 03.jpg
```

3. Add an entry to `data/projects.json`:

```json
{
  "id": "my-project",
  "name": "My Project",
  "description": "A short description.",
  "cover": "images/my-project/01.jpg",
  "images": [
    "images/my-project/01.jpg",
    "images/my-project/02.jpg",
    "images/my-project/03.jpg"
  ]
}
```

## Important

For GitHub Pages, filenames and paths are case-sensitive. Keep the capitalization in `projects.json` exactly the same as the actual filenames.

## GitHub Pages

Push the repository to GitHub.

Then open:

**Repository → Settings → Pages → Build and deployment → Deploy from a branch**

Select:

- Branch: `main`
- Folder: `/ (root)`

Save it. GitHub will provide the Pages URL.

## Local testing

Because `projects.json` is loaded with `fetch()`, opening `index.html` directly with `file://` may be blocked by the browser.

Use a local server instead. For example, with Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```
