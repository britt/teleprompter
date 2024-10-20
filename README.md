# Teleprompter

![Teleprompter](https://example.com/teleprompter-image.jpg)

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

(Add guidelines for contributing to the project)

## License

(Specify the license under which this project is released)
