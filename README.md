# Teleprompter

![Teleprompter](/docs/assets/diy_video_canon5d_teleprompter_gaffertape-285983.jpg)

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

## Getting Started

(Add instructions for setting up and running the project)

## Usage

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
