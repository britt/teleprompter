# Teleprompter

![Teleprompter](https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.falcofilms.com%2FuploadsSystem%2Fshopping%2Ffiles%2Fimages%2F8j1NYUzTgv.JPG&f=1&nofb=1&ipt=04ecddc673e830605d2bb7bf46ebac24b1c56c760b2aebe24d6782c1bdc39e6c&ipo=images)

Teleprompter is a project for managing prompts for Large Language Model (LLM) applications at runtime on Cloudflare and Cloudflare Workers. This system provides a robust solution for handling prompts with versioning, metadata tracking, and runtime management capabilities.

## Features

- Runtime prompt management
- Versioning support
- Metadata tracking
- Cloudflare Durable Objects integration

## Prompt Structure

Each prompt in the system consists of the following fields:

- `name`: TEXT
- `text`: TEXT
- `version`: INTEGER

## Components

1. **Durable Object**: Utilizes Cloudflare's Durable Objects for state management and persistence.
2. **CLI Tool**: A command-line interface for interacting with the Teleprompter worker and prompt store.

## Capabilities

- Dynamic prompt management at runtime
- Version control for prompts
- Metadata and tracking functionalities
- Command-line interaction with the Teleprompter system

## CLI Tool

Teleprompter comes with a dedicated CLI tool for easy interaction with the worker and prompt store. You can find the CLI tool at:

[https://github.com/britt/teleprompter-cli](https://github.com/britt/teleprompter-cli)

This tool provides a convenient way to manage prompts, interact with the Teleprompter worker, and perform various operations from the command line.

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
  - Aim for high test coverage
  - Consider integration tests where appropriate
- Add comments for complex logic
- Update documentation for any changed functionality
- Keep commits focused and atomic

### Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the version numbers following [Semantic Versioning](https://semver.org/)
3. Your PR will be reviewed by maintainers
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
- Follow project maintainers' decisions

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
