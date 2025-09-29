# Documentation Style Guide

## Project Summary

Project: teleprompter

Summary:
- The repository contains a small TypeScript project named "teleprompter". There is no explicit project description in the repository, but the code and file names (for example, worker-configuration.d.ts and src/index.ts) indicate this is a TypeScript library that exposes types and an API surface (a public index) intended to be documented with TypeDoc. The repo contains source files under src/, type declarations, and config files (typedoc.json). The documentation is expected to be API-focused (TypeDoc-generated) with example code snippets and JSDoc-style comments in the TypeScript sources.

Purpose and goals (inferred):
- Provide a concise, typed API for teleprompter-related functionality (types, interfaces, exported functions/classes) that can be consumed by other TypeScript/JavaScript projects.
- Generate API reference documentation using TypeDoc.
- Ship minimal top-level documentation (README) and programmatic typings (d.ts).

Audience:
- Primary: Developers who use the teleprompter package and need API reference (type information, functions, classes, interfaces). These users are expected to be familiar with TypeScript/JavaScript and package consumption.
- Secondary: Contributors who will edit TypeScript sources and documentation comments (JSDoc) that TypeDoc will render.

Content types present or expected:
- API reference (generated from TypeScript via TypeDoc)
- Example code snippets within API docs and README
- Minimal human-facing README documentation

Technical complexity level:
- Moderate: TypeScript types and API surfaces with some configuration (typedoc.json). Writers should be comfortable with JSDoc in TypeScript, the TypeDoc toolchain, and how exported symbols map to documentation pages.

Observed writing patterns and conventions (analysis):
- No table of contents or metadata/front matter is present in repository-generated markdown currently.
- The repository includes examples (code examples exist in source comments or README) and API documentation (TypeScript type declarations and exports).
- Front matter is not used in repository files; typedoc.json exists, indicating TypeDoc will be used to generate docs, but front-matter insertion for static site generation is not present in the repository.
- No consistent heading or link patterns are detectable from the current content; a style guide is needed to establish consistent structure for future docs.

## Context

**Project:** teleprompter
**Description:** No description available
**Publishing System:** TypeDoc

## Primary Documentation Goals

## Writing Rules

### Core Principles
- **Be concise** - Use the minimum words necessary
- **Be practical** - Focus on actionable information
- **Be example-driven** - Show working code for every concept
- **Be consistent** - Match existing documentation patterns

### Tone Guidelines

#### Default Tone (Technical Users)
- Direct and practical language
- Assume familiarity with TypeScript, package managers, CLI
- Use technical jargon and shorthand
- Focus on code examples over explanations
- Avoid marketing language or benefit statements

#### Non-Technical User Adjustments
When explicitly writing for non-technical users:
- Explain what each command does and why
- Spell out abbreviations and technical terms
- Provide simpler code examples with explanations
- Include more step-by-step guidance
- Link to additional learning resources

### Publishing System Requirements
TypeDoc-specific publishing recommendations and front-matter guidance

Overview:
- TypeDoc is being used to generate API documentation from TypeScript JSDoc comments. TypeDoc itself outputs Markdown or HTML depending on plugins. When integrating TypeDoc output into a static site (Docusaurus, GitHub Pages, etc.) you may need front matter (YAML at top of markdown files). The repository currently contains typedoc.json; augment this to ensure predictable output and, if desired, automatic front-matter insertion using typedoc-plugin-markdown (or an equivalent plugin).

Required metadata fields (for this project):
- For generated documentation pages used in a static site, require the following front-matter fields per page: title, description, slug (permalink), sidebar_label, sidebar_position. These fields are required by the documentation site conventions we enforce; TypeDoc alone doesn't require them but the publishing layer will.

If you do not use a static site generator that requires front matter, there are no required front-matter fields for TypeDoc itself.

Recommended typedoc.json configuration (example):
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/api",
  "plugin": ["typedoc-plugin-markdown"],
  "includeVersion": true,
  "excludePrivate": true,
  "excludeExternals": true,
  "gitRevision": "main",
  "mdPlugin": {
    "enabled": true
  }
}

Note: The exact key names vary by plugin. For typedoc-plugin-markdown there are options to add front matter automatically; see plugin docs.

Front matter template (exact template to use for generated pages if your publishing system requires front matter):
---
title: "{{title}}"
description: "{{description | short summary of the symbol/page}}"
slug: "/docs/api/{{path}}"
sidebar_label: "{{title}}"
sidebar_position: {{position}}
---

- Replace variables ({{title}}, {{description}}, {{path}}, {{position}}) with the actual values when generating or post-processing. The typedoc-plugin-markdown or a custom post-processing script can be configured to populate these fields.

Example of a concrete page front matter for a function page:
---
title: "start"
description: "Start the teleprompter playback at the given speed (words per minute)."
slug: "/docs/api/start"
sidebar_label: "start"
sidebar_position: 10
---

Code examples for documenting API in TypeScript (JSDoc):
/**
 * Starts the teleprompter playback.
 * @param speed Words per minute at which the teleprompter should run.
 * @example
 * ```ts
 * import { start } from 'teleprompter'
 * start(120)
 * ```
 */
export function start(speed: number): void {
  // implementation
}

Notes on front matter automation:
- Use typedoc-plugin-markdown or a post-processing script to add the YAML front matter block to each generated markdown file.
- If you use Docusaurus, the required front matter fields include title and sidebar_label; additional fields such as description and slug are recommended for SEO and navigation.
- Ensure generated files are written into the documentation folder that your site builder expects (for example docs/api or docs/reference).

Publishing checklist before release:
- Confirm typedoc.json entryPoints point to src/index.ts or other public entry files.
- Run TypeDoc build locally and verify that API pages generate and that front matter (if required) is present for site ingestion.
- Validate that each generated page has a proper title and short description.
- Run link validation (see Linking Strategy below) against the generated site to detect broken links.

### Content Structure Rules
Content organization guidelines

General principles
- Each page should open with a short one-paragraph summary that states purpose and scope.
- Move from high-level overview → specifics → examples. Readers should be able to quickly scan a page for example usage and signature.
- Keep API documentation focused on signature, parameters, return value, errors, examples, and related items.

Technical Documentation Pages (API reference)
- Start with: H1: symbol name or component being documented.
- Include a one-sentence summary line (short description) directly under the H1.
- Sections to include in this order: Signature (or declaration), Description (expanded), Parameters, Returns, Examples, Related symbols, See also.
- Use JSDoc in the source to populate Description, Parameters, and Examples. Example of JSDoc:
  /**
   * Starts the teleprompter playback.
   * @param speed Words per minute at which the teleprompter should run.
   * @returns void
   * @example
   * ```ts
   * start(120)
   * ```
   */
   export function start(speed: number): void {}

Process/How-to/Guides pages
- Use `docs/guides/` for authored guides.
- Begin with: Purpose and a one-sentence summary.
- Prerequisites: List required environment, versions, or packages.
- Steps: Use a numbered list for sequences.
- Examples: Provide copy-paste ready code blocks with explanations.
- Troubleshooting: Short section listing common errors and fixes.

Examples and code snippets
- Prefer TypeScript code fences (```ts) for API usage and examples.
- Keep examples small and focused; include import statements and expected outcomes.
- Include both minimal and slightly expanded examples for edge cases.

Documenting types and configuration interfaces
- For interfaces and configuration objects, include property-level documentation in the source using JSDoc @property or inline comments.
- Example for a configuration interface in TypeScript:
  /**
   * Worker configuration for teleprompter.
   */
  export interface WorkerConfiguration {
    /** Text to display in the teleprompter. */
    text: string
    /** Words per minute. Default: 100 */
    wpm?: number
  }

README.md recommended structure
- H1: Project name
- Short description (1–2 sentences)
- Badges (optional)
- Installation (copy & paste install command)
- Basic usage example (minimal code snippet)
- Link to API Reference (generated docs)
- Contributing / License links

Maintenance rules
- Keep code examples in sync with APIs: when changing signatures, update JSDoc and README examples.
- Avoid duplicating long API descriptions in authored guides; link to the generated API page instead.

#### Heading Rules
```markdown
Heading style and hierarchy

H1 (Single per file)
- Use exactly one H1 per document as the primary title (for README.md the project name is appropriate).
- No trailing punctuation or special characters.
- Use Title Case for the H1.
- Example file-level H1s to adopt: `# teleprompter`, `# API Reference — teleprompter`.

H2 (Major sections)
- Use H2 for top-level sections such as Overview, Installation, Usage, API, Examples, and Changelog.
- Use Title Case and concise labels.
- Examples: `## Overview`, `## Installation`, `## Usage`, `## API Reference`, `## Examples`, `## Configuration`.

H3 (Subsections)
- Use H3 for subsections within H2 sections: specific functions, classes, configuration properties, or examples.
- Examples: `### start(speed: number)`, `### Interfaces`, `### WorkerConfiguration`.

H4 (Detail-level subsections)
- Rarely used; only for very specific technical details such as parameter tables, error lists, or small reference sections.
- Example: `#### Error Codes`.

Heading progression rules
- Always follow a linear progression: do not jump from H2 to H4 without H3.
- Each document should start with an H1 followed by H2 sections. Repeated headings at the same level should have consistent labeling and capitalization.

Exact heading examples to copy into docs:
- README.md: `# teleprompter`
  - `## Overview`
  - `## Installation`
  - `## Usage`
  - `## API Reference`
  - `## Contributing`
- API function page: `# start`
  - `## Signature`
  - `## Parameters`
  - `## Returns`
  - `## Examples`

Capitalization and punctuation
- Title Case for headings (Capitalize principal words).
- No trailing periods.
- Keep headings short and action-oriented where possible.
```

### Formatting Requirements

#### Lists

- Use bullets for unordered lists
- No periods at end of list items
- Use Oxford comma in series

### Code Example Requirements

1. Always include syntax highlighting with language tags
2. Always include a language tag when adding a code block
3. Show both input and expected output
4. Include comments for complex logic
5. Place runnable example near page top
6. Use codetabs for platform variants

### Linking Rules
Linking strategy and rules

Internal links (links within documentation site)
- Use absolute paths starting from the documentation root where possible. This ensures links work regardless of nesting.
  - Example: `[API Reference](/docs/api)`
- For cross-references between API pages, prefer relative links when authoring guides in the same docs tree. Keep consistent by using root-relative links in authored markdown.
  - Example: `[start function](/docs/api/start)`
- When linking from README.md to generated docs, reference the path as it will be served on the site (for example `/docs/api` or `/docs/api/index.html` depending on the site config).

External links
- Always use full URLs and open in the same tab (no special target attribute in markdown).
  - Example: `[Node.js](https://nodejs.org/)`
- For links to third-party documentation (Node, TypeScript, browser APIs), include the name of the resource and an optional short parenthetical note if needed.
  - Example: `[TypeDoc Plugin docs](https://github.com/rbuckton/typedoc-plugin-markdown) — used to generate markdown from TypeDoc.`

Cross-reference and navigation standards
- Use explicit link text rather than inline URLs; link text should be descriptive.
  - Bad: `[start](https://.../start)`
  - Good: `[start function](/docs/api/start)`
- When referring to symbols in text, wrap the symbol name in inline code (backticks) and, where appropriate, also link to the symbol's API page.
  - Example: "Call `start()` to begin playback — see the [start function](/docs/api/start) for details."

Link formatting examples (exact syntax):
- Internal top-level doc link: `[API Reference](/docs/api)`
- Link to an API function page: `[start function](/docs/api/start)`
- External URL: `[TypeDoc](https://typedoc.org)`
- Inline code + link: "Use `WorkerConfiguration` (see the [WorkerConfiguration interface](/docs/api/interfaces/workerconfiguration))."

When to use internal vs external links
- Internal: Use for anything documented in the teleprompter docs (API pages, configuration references, developer guides).
- External: Use for third-party resources, background reading, or tools like TypeScript, TypeDoc, and runtime environments.

Link maintenance and validation
- Run a link-checking step as part of CI against generated docs.
- When renaming or moving API pages, update links across guides; prefer single-source-of-truth references (point guides to generated API pages instead of duplicating signature details).
- Avoid hardcoding branch names or repository-specific paths in links; use site-relative paths where possible.

Automating front matter & links:
- If you use typedoc-plugin-markdown, configure its front-matter options or use a post-processing script that injects the front matter template above and rewrites internal links into site-consistent paths.

Additional notes observed from repository:
- No Table of Contents or front matter present currently — implement the front matter template during the TypeDoc generation step or with a post-processing script.
- Examples exist in code; make sure JSDoc @example blocks are used so TypeDoc includes them in generated pages.

### Documentation Content Examples
- Below are examples of existing documentation that you should use for reference, including formatting, structure, layout, style, and language.
- The start and end of the following examples is marked by 10 dashes in a row, like this ----------. The 10 dashes in a row are not part of the formatting or content of the examples.

undefined

## Existing Documentation Directory Structure
Top-level files:
- README.md: Human-facing project summary, installation, basic usage examples, and links to API reference. Keep this concise and focused on getting started.
- LICENSE: Project license (do not alter).
- typedoc.json: TypeDoc configuration file controlling API documentation generation. Maintain canonical TypeDoc settings here.
- worker-configuration.d.ts: Type declaration file exposing types/interfaces used by the project. Document types using JSDoc in the .ts/.d.ts files.

src/ directory:
- src/index.ts: Public entry point for the library; exports the public API surface. This is the primary entryPoint for TypeDoc and should contain minimal re-exporting and JSDoc comments for the public API.
- src/<subdirectories>: Organize implementation files into feature-based subfolders where each folder contains related types, implementation, and a README (optional) explaining internal implementation details if necessary.

docs/ (generated or authored):
- docs/api/: Generated TypeDoc markdown output should be placed here if the site expects docs/ as the source.
- docs/guides/: Hand-authored guides and tutorials (see Content Organization below).

Recommended mapping:
- Source code (src/) -> API docs (docs/api/) via TypeDoc
- README.md -> docs/index.md or kept at repo root for quick overview
- Guides and how-to content -> docs/guides/

Rules:
- Keep authored markdown (guides) under docs/guides with front matter following the template above.
- Generated API markdown files must not be edited in-place; if you need to add custom content, create a guide that links to the generated API pages instead, or set up a post-processing step that injects front matter or custom content into generated files.


*Generated on: 2025-09-29T23:51:04.357Z*
