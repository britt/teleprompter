# Teleprompter

![Teleprompter](/doc/assets/diy_video_canon5d_teleprompter_gaffertape-285983.jpg)

Teleprompter is a project for managing prompts for Large Language Model (LLM) applications at runtime on Cloudflare and Cloudflare Workers. It provides versioning, metadata tracking, and runtime editing and updating of prompts.

## Components

Teleprompter has three components that work together.

1. **[Worker](https://github.com/britt/teleprompter)**: The worker that manages the prompts and pushes updates
2. **[CLI Tool](https://github.com/britt/teleprompter-cli)**: A command-line tool for viewing and managing prompts
3. **[SDK](https://github.com/britt/teleprompter-sdk)**: A Typescript SDK for fetching your prompts

## How it Works

* Every prompt is a [Mustache](https://mustache.github.io/) template.
  * Prompts are append only, there's no such thing  as an update just a full replacement.
  * Prompts are versioned using the UNIX timestamp when they were created
  * Prompts can be rolled back to previous versions
* Prompts are updated and edited by the Teleprompter worker. You can talk to it with the CLI.
* Updates are sent to your applications via a Cloudflare Queue
* Your application consumes the update and stashes the result in it's local KV namespace
* You can either fetch it out or render the template directly
* Fin

### Cloudflare Warp Access Control
Teleprompter has no authentication system of its own. It uses Cloudflare Warp for access control. The authentication token retrieved from Cloudflare is stored in `$HOME/.teleprompter/token`. The token file permissions are set to 0600 to keep it private but that's all there is for security.

_**NOTE:** Currently it does not check to see if the token is expired (coming soon). So, if you're having problems authenticating just_ `$> rm $HOME/.teleprompter/token` _and try again._

### Prompt Structure

```typescript
interface Prompt {
  id: TEXT // a unique ID for the prompt
  text: TEXT // the text of the Mustache template
  version: INTEGER // this is always just the UNIX timestamp of when this prom,pt was edited
  namespace: STRING // the name of the QUEUE to send updates to
}
```
   
## Features
- Runtime prompt management
- Prompt Versioning

## Getting Started

To get started with Teleprompter, you will set up the worker, install dependencies, and run it locally using [Cloudflare's Wrangler](https://developers.cloudflare.com/workers/wrangler/).

### Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or newer recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Cloudflare account](https://dash.cloudflare.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

Install Wrangler globally if you haven't already:

```sh
npm install -g wrangler
```

### Clone the Repository

```sh
git clone https://github.com/britt/teleprompter.git
cd teleprompter
```

### Install Dependencies

```sh
npm install
```

### Configure Cloudflare Environment

- Copy your Cloudflare account credentials ([get your API token](https://dash.cloudflare.com/profile/api-tokens) and [set up wrangler](https://developers.cloudflare.com/workers/wrangler/get-started/#configure-your-project)).
- Edit or create `wrangler.toml` in the repo root. Example snippet:

```toml
name = "teleprompter"
type = "javascript"
account_id = "your_account_id"
workers_dev = true
durable_objects = [{name = "PROMPTS", class_name = "PromptsDurableObject"}]
[triggers]
crons = []
```

> **Note**: You may need to configure additional queues or bindings as your use-case requires. Consult Cloudflare Workers and Queue documentation for details.

### Run Locally for Development

```sh
npm run dev
```

This uses `wrangler` to start a local development server at `http://localhost:8787`. You can test API endpoints such as:

- `GET /prompts` – List all prompts
- `POST /prompts` – Add a prompt (provide JSON body: `{ "id": "example", "prompt": "Say hello, {{name}}!", "namespace": "your-namespace" }`)
- `GET /prompts/:id` – Fetch a specific prompt
- `GET /prompts/:id/versions` – Get all versions of a prompt
- `DELETE /prompts/:id` – Remove a prompt

You can interact with these endpoints using `curl`, [Postman](https://www.postman.com/), or your CLI tool.

### Build for Production

To build the project for deployment, run:

```sh
npm run build
```

### Deploy to Cloudflare Workers

Once you have configured your `wrangler.toml` and are ready to deploy:

```sh
wrangler deploy
```

This will deploy Teleprompter to your Cloudflare Workers account using the settings in `wrangler.toml`.

### Additional Steps

- For prompt management via CLI, see [teleprompter-cli](https://github.com/britt/teleprompter-cli).
- For SDK usage, see [teleprompter-sdk](https://github.com/britt/teleprompter-sdk).
- Refer to [Cloudflare Durable Objects documentation](https://developers.cloudflare.com/workers/learning/using-durable-objects/) for more details on configuration.

## Usage

_COMING  SOON_
(Add examples and instructions for using Teleprompter)

## Contributing

We welcome contributions to Teleprompter! Here's how you can help:

### Getting Started

1. Fork the repository
2. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Write or update tests as needed
5. Run tests to ensure everything works
6. Commit your changes: `git commit -m "Add some feature"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

### Development Guidelines

- Write thorough and comprehensive tests for your changes
  - Include both positive and negative test cases
  - Test edge cases and error conditions
  - Try to have better test coverage than I did when I first wrote it
  - Consider integration tests where appropriate
- Add comments for complex logic
- Update documentation for any changed functionality
- Keep commits focused and atomic

### Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the version numbers following [Semantic Versioning](https://semver.org/)
3. Your PR will be reviewed by the maintainer. This is not guaranteed _(or even likely)_ to be timely since it's just me.
4. Once approved, your PR will be merged

### Bug Reports

When filing an issue, please include:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Version information
- Any relevant logs or error messages

### Code of Conduct

- Be respectful and inclusive
- Keep discussions constructive
- Focus on the technical merits
- Follow the maintainer's decisions

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
