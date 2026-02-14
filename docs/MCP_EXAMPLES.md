# MCP Server Examples

This document provides practical examples of using the Oh My Posh Configurator MCP Server with AI assistants like GitHub Copilot in VS Code.

## Getting Started

After setting up the MCP server in VS Code (see [MCP_SERVER.md](MCP_SERVER.md)), you can start creating configurations using natural language. Here are some common examples:

## Example 1: Create a Developer Prompt

**User Request:**
```
Create a developer prompt with git and Python segments
```

**Expected Flow:**
1. The AI calls `create_configuration` with description
2. MCP server infers segments: path, git, python, status
3. Returns complete JSON configuration with smart defaults

**Result:**
You get a fully configured prompt with:
- Path segment with folder icon
- Git segment showing branch and status
- Python segment displaying version
- Status segment for exit codes
- Appropriate colors for each segment

## Example 2: Add a Segment to Existing Config

**User Request:**
```
Add an AWS segment to this configuration:
[paste your JSON config]
```

**Expected Flow:**
1. The AI calls `add_segment` with config and segmentType: "aws"
2. MCP server looks up AWS segment metadata
3. Applies default colors, template, and options
4. Returns updated configuration

**Result:**
AWS segment added to your first block with:
- Orange background (#FF9900)
- White foreground
- Template showing AWS profile
- Smart defaults for display

## Example 3: Validate Configuration

**User Request:**
```
Check if this configuration is valid:
[paste your JSON config]
```

**Expected Flow:**
1. The AI calls `validate_configuration`
2. MCP server checks structure, required fields, palette references
3. Returns validation result with errors/warnings

**Result:**
Detailed validation report showing:
- Missing required fields
- Invalid palette references
- Empty segments arrays
- Schema warnings

## Example 4: Export to Different Format

**User Request:**
```
Export this configuration as YAML
```

**Expected Flow:**
1. The AI calls `export_configuration` with format: "yaml"
2. MCP server cleans internal IDs
3. Converts to YAML format
4. Returns formatted output

**Result:**
Clean YAML configuration ready to use with Oh My Posh

## Example 5: Browse Available Segments

**User Request:**
```
Show me all cloud-related segments
```

**Expected Flow:**
1. The AI calls `list_segments` with category: "cloud"
2. MCP server loads cloud segment metadata
3. Returns filtered list with descriptions

**Result:**
List of cloud segments:
- AWS
- Azure (az, azd, azfunc)
- GCP
- Kubernetes (kubectl)
- Docker
- Terraform
- Pulumi
- And more...

## Example 6: Get Segment Documentation

**User Request:**
```
Tell me about the git segment and what options it has
```

**Expected Flow:**
1. The AI calls `get_segment_info` with segmentType: "git"
2. MCP server returns full segment metadata
3. Includes properties, options, and descriptions

**Result:**
Complete git segment documentation:
- Available properties (e.g., .HEAD, .Working, .Staging)
- Configuration options (e.g., fetch_status, branch_icon)
- Default template
- Cache recommendations

## Example 7: Load Sample Configuration

**User Request:**
```
Load the developer-pro sample configuration
```

**Expected Flow:**
1. The AI calls `load_sample_config` with configId: "developer-pro"
2. MCP server loads from samples manifest
3. Returns configuration with metadata

**Result:**
Complete developer-pro configuration with:
- Git, language, and execution time segments
- Professional color scheme
- Optimized caching settings
- Metadata (author, tags, description)

## Example 8: Troubleshoot Slow Prompt

**User Request:**
```
My prompt is slow. Help me optimize it.
```

**Expected Flow:**
1. The AI uses `troubleshoot` prompt with issue: "prompt is slow"
2. The AI analyzes configuration via `validate_configuration`
3. The AI suggests optimizations using segment metadata

**Result:**
Optimization suggestions:
- Add caching to language segments
- Adjust fetch_status on git segment
- Use folder strategy for path-dependent segments
- Remove unnecessary segments

## Example 9: Apply Color Theme

**User Request:**
```
Apply the Dracula color theme to my configuration
```

**Expected Flow:**
1. The AI uses `apply_theme` prompt with theme: "dracula"
2. The AI generates Dracula palette colors
3. The AI updates config using `modify_configuration`
4. Returns updated configuration

**Result:**
Configuration with Dracula theme:
- Background: #282a36
- Foreground: #f8f8f2
- Purple: #bd93f9
- Pink: #ff79c6
- Green: #50fa7b
- And more Dracula colors

## Example 10: Batch Operations

**User Request:**
```
Add caching with 5-minute duration to all language segments in my configuration
```

**Expected Flow:**
1. The AI parses your configuration
2. Identifies language segments (node, python, go, etc.)
3. Calls `modify_configuration` to add cache settings
4. Returns updated configuration

**Result:**
All language segments now have:
```json
"cache": {
  "duration": "5m",
  "strategy": "folder"
}
```

## Advanced Use Cases

### Team Standardization

**User Request:**
```
Generate a standardized DevOps prompt for our team with AWS, kubectl, terraform, and git
```

**Result:**
Consistent configuration that can be shared across team:
- Same segments in same order
- Team color scheme
- Standardized templates
- Optimal caching for all segments

### Quick Prototyping

**User Request:**
```
Show me what a minimal prompt with just path and git would look like
```

**Result:**
Clean, minimal configuration you can iterate on

### Documentation Generation

**User Request:**
```
Explain each segment in my configuration
```

**Result:**
The AI uses `get_segment_info` for each segment type and provides detailed explanations

## Example 11: Search Official Documentation

**User Request:**
```
Search the Oh My Posh docs for information about powerline symbols
```

**Expected Flow:**
1. The AI calls `search_ohmyposh_docs` with query: "powerline symbols"
2. MCP server provides documentation links and context
3. Returns relevant sections and URLs

**Result:**
Guidance on where to find information:
- Direct link to powerline documentation
- Key topics to explore
- Relevant configuration examples

## Example 12: Get Official Segment Documentation

**User Request:**
```
Get the official Oh My Posh documentation for the git segment
```

**Expected Flow:**
1. The AI calls `get_ohmyposh_segment_docs` with segmentType: "git"
2. MCP server retrieves local metadata
3. Provides link to official docs at ohmyposh.dev
4. Returns formatted documentation

**Result:**
Complete documentation including:
- Segment description and properties
- Configuration options with defaults
- Template variables available
- Recommended cache settings
- Link to official docs for latest info

## Tips for Best Results

1. **Be Specific**: "Add git segment" vs "Add version control"
2. **Include Context**: Share your full config when modifying
3. **Ask for Validation**: Always validate before exporting
4. **Iterate**: Start simple and add complexity
5. **Use Resources**: Ask about available segments and samples

## Common Workflows

### Creating from Scratch
1. Start with natural language description
2. Review generated configuration
3. Add/remove segments as needed
4. Validate configuration
5. Export in preferred format

### Modifying Existing
1. Share your current configuration
2. Request specific changes
3. Validate updated configuration
4. Compare before/after
5. Export updated version

### Learning
1. Browse available segments
2. Get detailed segment info
3. Load and study sample configs
4. Experiment with modifications
5. Build your own configuration

## Troubleshooting

If the MCP server isn't working:

1. **Check Installation**: Verify MCP server is built (`npm run build:mcp`) or installed (`npm ls ohmyposh-configurator`)
2. **Check Config**: Ensure your `.vscode/mcp.json` has the correct server configuration
3. **Restart VS Code**: MCP servers may require a restart to load
4. **Check Logs**: Look at the Output panel in VS Code for MCP errors
5. **Test Tools**: Ask "What tools do you have?" to verify MCP server is loaded

## Next Steps

- Try these examples yourself
- Experiment with natural language variations
- Share interesting use cases with the community
- Contribute examples to this document

Happy configuring! 🎨✨
