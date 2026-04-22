#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const PROJECTS_DIR = path.join(__dirname, "..", "projects");
const OUT_DIR = path.join(__dirname, "..", "docs");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

// ---------------------------------------------------------------------------
// Load project YAML files
// ---------------------------------------------------------------------------

function loadProjects() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.warn("No projects/ directory found — nothing to build.");
    return [];
  }

  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => (f.endsWith(".yml") || f.endsWith(".yaml")) && !f.startsWith("_"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(PROJECTS_DIR, file), "utf8");
      const data = yaml.load(raw);
      if (!data.title || !data.student) {
        throw new Error(`${file} is missing required fields: title, student`);
      }
      data._slug = slug(data.title);
      data._file = file;
      return data;
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

// ---------------------------------------------------------------------------
// HTML shell
// ---------------------------------------------------------------------------

function shell(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} | Capstone Projects</title>
  <link rel="stylesheet" href="/2510-capstones/style.css" />
</head>
<body>
  <header>
    <a class="site-title" href="/2510-capstones/">Student Capstone Projects</a>
  </header>
  <main>
${bodyHtml}
  </main>
  <footer>
    <p>Add your project via a pull request — see the <a href="https://github.com/FullstackAcademy/2510-capstones">repo README</a>.</p>
  </footer>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Index page
// ---------------------------------------------------------------------------

function buildIndex(projects) {
  const cards = projects
    .map(
      (p) => `
    <article class="project-card">
      <h2><a href="/2510-capstones/projects/${escapeHtml(p._slug)}/">${escapeHtml(p.title)}</a></h2>
      <p class="student-name">${escapeHtml(p.student)}</p>
      ${p.tagline ? `<p class="tagline">${escapeHtml(p.tagline)}</p>` : ""}
      ${
        p.tags && p.tags.length
          ? `<ul class="tags">${p.tags.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`
          : ""
      }
    </article>`
    )
    .join("\n");

  const body =
    projects.length === 0
      ? `<p class="empty">No projects yet — be the first to <a href="https://github.com/FullstackAcademy/2510-capstones">submit yours</a>!</p>`
      : `<h1>All Projects</h1>\n    <div class="project-grid">${cards}\n    </div>`;

  return shell("All Projects", body);
}

// ---------------------------------------------------------------------------
// Detail page
// ---------------------------------------------------------------------------

function buildDetail(p) {
  const repoLine = p.repo
    ? `<p><strong>Repo:</strong> <a href="${escapeHtml(p.repo)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.repo)}</a></p>`
    : "";
  const demoLine = p.demo
    ? `<p><strong>Demo:</strong> <a href="${escapeHtml(p.demo)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.demo)}</a></p>`
    : "";
  const tagsLine =
    p.tags && p.tags.length
      ? `<ul class="tags">${p.tags.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`
      : "";
  const descLine = p.description
    ? `<div class="description"><p>${escapeHtml(p.description)}</p></div>`
    : "";

  const body = `
    <a class="back-link" href="/2510-capstones/">&larr; All Projects</a>
    <h1>${escapeHtml(p.title)}</h1>
    <p class="student-name">${escapeHtml(p.student)}</p>
    ${p.tagline ? `<p class="tagline">${escapeHtml(p.tagline)}</p>` : ""}
    ${descLine}
    ${repoLine}
    ${demoLine}
    ${tagsLine}`;

  return shell(p.title, body);
}

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

const CSS = `
/* Reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #f9f9fb;
  color: #1a1a2e;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: #1a1a2e;
  padding: 1rem 2rem;
}

.site-title {
  color: #e2e8f0;
  text-decoration: none;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.site-title:hover { color: #fff; }

main {
  flex: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  width: 100%;
}

h1 { margin-bottom: 1.5rem; font-size: 2rem; }

footer {
  text-align: center;
  padding: 1.5rem;
  font-size: 0.875rem;
  color: #666;
  border-top: 1px solid #ddd;
}

footer a { color: #4a6cf7; }

/* Project grid */
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.project-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.25rem;
  transition: box-shadow 0.15s;
}

.project-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.project-card h2 { font-size: 1.1rem; margin-bottom: 0.35rem; }
.project-card h2 a { color: #1a1a2e; text-decoration: none; }
.project-card h2 a:hover { color: #4a6cf7; text-decoration: underline; }

.student-name { font-weight: 600; color: #4a6cf7; margin-bottom: 0.4rem; }

.tagline { color: #555; font-size: 0.9rem; margin-bottom: 0.5rem; }

.tags {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.tags li {
  background: #eef0fb;
  color: #4a6cf7;
  font-size: 0.75rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
}

/* Detail page */
.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  color: #4a6cf7;
  text-decoration: none;
  font-size: 0.9rem;
}

.back-link:hover { text-decoration: underline; }

.description {
  margin: 1rem 0;
  line-height: 1.65;
  color: #333;
}

.empty { font-size: 1.1rem; color: #555; }
`.trim();

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  ensureDir(OUT_DIR);

  const projects = loadProjects();

  // Write CSS
  fs.writeFileSync(path.join(OUT_DIR, "style.css"), CSS, "utf8");

  // Write index
  fs.writeFileSync(path.join(OUT_DIR, "index.html"), buildIndex(projects), "utf8");

  // Write detail pages
  const projectsOut = path.join(OUT_DIR, "projects");
  ensureDir(projectsOut);

  for (const p of projects) {
    const dir = path.join(projectsOut, p._slug);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, "index.html"), buildDetail(p), "utf8");
  }

  console.log(
    `Built ${projects.length} project page(s) → docs/`
  );
}

main();
