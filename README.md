# Teleprompter

![Teleprompter](https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.falcofilms.com%2FuploadsSystem%2Fshopping%2Ffiles%2Fimages%2F8j1NYUzTgv.JPG&f=1&nofb=1&ipt=04ecddc673e830605d2bb7bf46ebac24b1c56c760b2aebe24d6782c1bdc39e6c&ipo=images)

Teleprompter is a project for managing prompts for Large Language Model (LLM) applications at runtime on Cloudflare and Cloudflare Workers. This system provides a robust solution for handling prompts with versioning, metadata tracking, and runtime editing and updating.

## Components

Teleprompter has three components that work together.

1. **[Worker](https://github.com/britt/teleprompter)**: The worker that manages the prompts and pushes updates
2. **[CLI Tool](https://github.com/britt/teleprompter-cli)**: A command-line tool for viewing and managing prompts
3. **[SDK](https://github.com/britt/teleprompter-sdk)**: A Typescript SDK for fetching your prompts

## How it Works

* Every prompt is a [Mustache](https://mustache.github.io/) template.
  * Prommpts are append only, there's no such thing  as an update just a full replacement.
  * Prompts are versioned using the UNIX timestamp when they were created
  * Prompts can be rollback to previous versions
* Prompts are updated and edited by the Teleprompter worker. You can talk to it with the CLI.
* Updates are sent to your applications via a Cloudflare Queue
* Your application consumes the update and stashes the result in it's local KV namespace
* You can either fetch it out or render the template directly
* Fin

### Cloudflare Warp Access Control
Teleprompter has no authentication system of its own. It uses Cloudflare Warp for access control. The authentication token retrieved from Cloudflare is stored in `$HOME/.teleprompter/token`. The token file permissions are set to 0600 to keep it private but that's all there is for security.

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
- _(Coming Soon)_ Mustache template metadata
- _(Coming  Soon)_ Token Counts

## Getting Started

(Add instructions for setting up and running the project)

## Usage

(Add examples and instructions for using Teleprompter)

## Contributing

(Add guidelines for contributing to the project)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
