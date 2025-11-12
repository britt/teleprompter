# Teleprompter

![Teleprompter](/doc/assets/diy_video_canon5d_teleprompter_gaffertape-285983.jpg)

Teleprompter is a prompt management system for Large Language Model (LLM) running on Cloudflare and Cloudflare Workers. It provides versioning, metadata tracking, and runtime editing and updating of prompts.

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
* Updates are sent to your applications via Cloudflare Queues
* Your application consumes the update and stashes the result in it's local KV namespace
* You can either fetch it out or render the template directly
* Fin

See also: [Theory of Operation](docs/guides/theory-of-operation.md) for the full architecture and update flow.

### Prompt Structure

```typescript
interface Prompt {
  id: TEXT // a unique ID for the prompt
  text: TEXT // the text of the Mustache template
  version: INTEGER // this is always just the UNIX timestamp of when this prom,pt was edited
  namespace: STRING // the name of the QUEUE to send updates to
}
```

### Example Prompt

```markdown
I want you to look at some text and decide:
- Is this code written in a programming language?
- What language is it written in?
- What is the purpose of the code? 

Write a short one sentence description of the nature and purpose of the code including the programming language it was written in. 
You are narrating an article to a person that cannot see the code so begin the description by explaining that \"The article shows a code sample\" then explain the purpose of the  code example.

Here are some examples of code and good descriptions.

Example 1:
Code: 
interface CodeSummary {
  code: boolean
  language: string
  summary: string
}
Description: The article shows a TypeScript interface definition for a CodeSummary object.

Example 2:
Code:\\t\\t
func toDefaultValueType(dataType string, s string) (any, error) {
  switch SqliteType(dataType) {
  case SqliteNull:
    return nil, nil
  case SqliteInteger:
    return strconv.ParseInt(s, 10, 64)
  case SqliteReal:
    return strconv.ParseFloat(s, 64)
  case SqliteText:
    return s, nil
  case SqliteBlob:
    return []byte(s), nil
  case SqliteBoolean:
    i, err := strconv.ParseInt(s, 10, 32)
    if err != nil {
      return false, err
    }
    return i != 0, nil
  }
  return nil, fmt.Errorf(\"unknown sqlite type: %s\", dataType)
}
Description: The article shows a Go function that converts a string to a value of the correct type based on a given SQLite data type.

Here is the code to analyze:
{{code}}
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Cloudflare account](https://dash.cloudflare.com/) (for deploying/workers)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`npm install -g wrangler`)

### Cloudflare Warp Access Control
Teleprompter has no authentication system of its own. It uses Cloudflare Warp for access control. The authentication token retrieved from Cloudflare is stored in `$HOME/.teleprompter/token`. The token file permissions are set to 0600 to keep it private but that's all there is for security.

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/britt/teleprompter.git
   cd teleprompter
   ```

2. **Install dependencies:**

   ```sh
   npm install
   # or
   yarn install
   ```

### Configuration

- Copy and edit `wrangler.example.toml` (or similar) to `wrangler.toml` and adjust for your Cloudflare account and your desired settings.
- Bindings for Durable Objects and Queues should be declared in your `wrangler.toml`.

### Running Locally for Development

You can use the Wrangler CLI to run the Cloudflare Worker locally:

```sh
wrangler dev
```

This will start the development server. The prompts Durable Object will be available for testing at local endpoints (e.g., `http://localhost:8787/prompts`).

### Running Tests

```sh
npm test
```

or with yarn:

```sh
yarn test
```

### Building Documentation

To build the documentation using TypeDoc:

```sh
npm run docs
```

The generated documentation will be found in the `doc` directory.

### Deploying to Cloudflare

After configuring your credentials and `wrangler.toml`, deploy using:

```sh
wrangler deploy
```

### Managing Prompts via CLI

For day-to-day prompt management, use the [Teleprompter CLI Tool](https://github.com/britt/teleprompter-cli). You can install and use it by following instructions at that repository, allowing you to create, edit, and roll back prompts in production or during development.

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

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
### PR Instructions
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

_This documentation was co-authored by [doc.holiday](https://doc.holiday)._ 
