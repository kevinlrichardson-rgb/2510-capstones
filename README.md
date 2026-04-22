# AI/ML Cohort 2510: Capstone Projects

A community-maintained showcase of student capstone projects. The site is automatically built from YAML files and deployed to GitHub Pages whenever a pull request is merged into `main`.

**Live site:** https://fullstackacademy.github.io/2510-capstones/

---

## How to add your project

1. **Fork** this repository and create a new branch (e.g. `add/your-project-name`).

2. **Copy** `projects/_template.yml` to a new file in the same folder, named after yourself:
   ```
   projects/firstname-lastname-capstone.yml
   ```
   Use lowercase letters and hyphens — no spaces.

3. **Fill in** your project details. Only `title` and `student` are required; everything else is optional but encouraged.

4. **Add images** (optional) to the repo root folders — name them after yourself with hyphens:
   ```
   headshots/firstname-lastname-headshot.png
   screenshots/firstname-lastname-screenshot.png
   ```
   The build script picks them up automatically — no YAML changes needed.

5. **Open a pull request** back to `main`.

5. Once merged, your project appears on the live site within a minute or two.

### YAML fields

| Field | Required | Description |
|---|---|---|
| `title` | ✅ | Your project name |
| `student` | ✅ | Your full name |
| `tagline` | | One-sentence summary shown on the list page |
| `description` | | Paragraph(s) shown on the detail page |
| `repo` | | Link to your GitHub repository |
| `demo` | | Link to a live demo / deployed app |
| `tags` | | List of technology tags, e.g. `[React, PostgreSQL]` |

---

## Local development

```bash
npm install
npm run build        # generates the site in docs/
open docs/index.html # view locally
```

The build script reads every `.yml` file in `projects/` (ignoring `_template.yml`) and writes static HTML to `docs/`.

---

## Deployment

GitHub Actions builds and deploys the site on every push to `main`. The workflow file is at `.github/workflows/deploy.yml`.

You need to enable GitHub Pages in the repository settings:
**Settings → Pages → Source → GitHub Actions**

