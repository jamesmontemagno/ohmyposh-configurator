# Oh My Posh Configurator MCP Server

Model Context Protocol (MCP) server that enables AI assistants like Claude to help users create and manage Oh My Posh configurations through natural language conversations.

## Overview

The Oh My Posh Configurator MCP Server exposes the configurator's functionality through:

- **Tools (Actions)**: Create, modify, validate, and export configurations
- **Resources (Data)**: Access to 103+ segment definitions and sample configurations
- **Prompts (Templates)**: Quick start workflows and troubleshooting assistance

## Installation

### Prerequisites

- Node.js 18 or later
- npm or another package manager

### Setup

1. Clone the repository:
```bash
git clone https://github.com/jamesmontemagno/ohmyposh-configurator.git
cd ohmyposh-configurator
```

2. Install dependencies:
```bash
npm install
```

3. Build the MCP server:
```bash
npm run build:mcp
```

## Configuration with Claude Desktop

To use this MCP server with Claude Desktop, add it to your Claude configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ohmyposh": {
      "command": "node",
      "args": [
        "/absolute/path/to/ohmyposh-configurator/dist/mcp/index.js"
      ]
    }
  }
}
```

Replace `/absolute/path/to/ohmyposh-configurator` with the actual path to your cloned repository.

After adding this configuration, restart Claude Desktop.

## Available Tools

### create_configuration

Generate a new Oh My Posh configuration from a natural language description.

**Parameters:**
- `description` (string, required): Natural language description of the desired prompt
- `segments` (string[], optional): Specific segment types to include
- `style` (string, optional): Style for segments (powerline, plain, diamond, accordion)

**Example:**
```
Create a developer prompt with git and python
```

### add_segment

Add a segment to an existing configuration with smart defaults.

**Parameters:**
- `config` (string, required): Existing configuration as JSON string
- `segmentType` (string, required): Type of segment to add
- `blockIndex` (number, optional): Index of block to add to (default: 0)
- `style` (string, optional): Style for the segment
- `template` (string, optional): Custom template

**Example:**
```
Add a git segment to my configuration
```

### modify_configuration

Modify an existing Oh My Posh configuration.

**Parameters:**
- `config` (string, required): Existing configuration as JSON string
- `modifications` (object, required): Object describing modifications

**Example:**
```
Update my configuration to disable final_space
```

### validate_configuration

Validate an Oh My Posh configuration for correctness.

**Parameters:**
- `config` (string, required): Configuration to validate as JSON string

**Example:**
```
Validate this configuration
```

### export_configuration

Export configuration in different formats (JSON, YAML, TOML).

**Parameters:**
- `config` (string, required): Configuration as JSON string
- `format` (string, optional): Output format (json, yaml, toml)

**Example:**
```
Export this configuration as YAML
```

### list_segments

List all available Oh My Posh segments.

**Parameters:**
- `category` (string, optional): Filter by category
- `search` (string, optional): Search by keyword

**Example:**
```
List all language segments
```

### get_segment_info

Get detailed information about a specific segment type.

**Parameters:**
- `segmentType` (string, required): The segment type

**Example:**
```
Tell me about the git segment
```

### list_sample_configs

List all available sample configurations.

**Example:**
```
Show me available sample configurations
```

### load_sample_config

Load a specific sample configuration by ID.

**Parameters:**
- `configId` (string, required): The ID of the sample configuration

**Example:**
```
Load the developer-pro sample config
```

## Available Resources

Resources are read-only data sources that Claude can access:

- `ohmyposh://segments/all`: Complete list of all 103+ segments
- `ohmyposh://segments/categories`: List of segment categories
- `ohmyposh://configs/samples`: Sample configurations
- `ohmyposh://configs/community`: Community configurations

## Available Prompts

Prompts are templated workflows for common tasks:

### quick_start

Quick start workflow to create a new configuration.

**Arguments:**
- `use_case`: The use case (e.g., "developer", "devops", "minimal")

### troubleshoot

Help troubleshoot issues with Oh My Posh configuration.

**Arguments:**
- `issue`: Description of the issue

### apply_theme

Apply a color theme to an existing configuration.

**Arguments:**
- `theme`: Theme name (e.g., "dracula", "nord", "gruvbox")

## Use Cases

### Beginners
"Create me a nice-looking developer prompt with git and Python info"

### Advanced Users
"Add caching to all language segments with optimal durations"

### Teams
"Generate a standardized DevOps prompt for our team with AWS, kubectl, and terraform"

### Customization
"Apply the Dracula color theme to my prompt"

### Troubleshooting
"My prompt is slow - help me optimize it"

## Development

### Running Tests

```bash
npm run test
```

### Building

```bash
npm run build:mcp
```

### Running the Server

```bash
npm run mcp
```

## Architecture

The MCP server is built with:
- **@modelcontextprotocol/sdk**: Official MCP SDK for TypeScript
- **Reusable Modules**: Configuration builder, validator, segment loader
- **Type Safety**: Full TypeScript support with shared types from the web app
- **Node.js**: Runs in Node.js environment (unlike the browser-based web app)

## File Structure

```
mcp/
├── index.ts                    # Main MCP server
├── lib/
│   ├── configBuilder.ts        # Configuration creation utilities
│   ├── configExporter.ts       # Export to JSON/YAML/TOML
│   ├── configLoader.ts         # Load sample/community configs
│   ├── configValidator.ts      # Configuration validation
│   ├── segmentLoader.ts        # Load segment metadata
│   └── __tests__/              # Unit tests
└── tsconfig.json               # TypeScript configuration
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass: `npm run test`
5. Ensure linting passes: `npm run lint`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Related Projects

- [Oh My Posh](https://ohmyposh.dev/) - The prompt theme engine
- [Model Context Protocol](https://modelcontextprotocol.io/) - Protocol specification
- [Oh My Posh Configurator Web App](https://jamesmontemagno.github.io/ohmyposh-configurator/) - Visual configurator

## Support

- [GitHub Issues](https://github.com/jamesmontemagno/ohmyposh-configurator/issues)
- [GitHub Discussions](https://github.com/jamesmontemagno/ohmyposh-configurator/discussions)
- [Oh My Posh Documentation](https://ohmyposh.dev/docs/)
