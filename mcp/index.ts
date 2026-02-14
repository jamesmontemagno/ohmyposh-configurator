#!/usr/bin/env node

/**
 * Oh My Posh Configurator MCP Server
 * 
 * Model Context Protocol server that exposes Oh My Posh configuration
 * functionality to AI assistants like Claude.
 * 
 * Provides:
 * - Tools: create_configuration, add_segment, modify_configuration, validate_configuration, export_configuration
 * - Resources: Segment definitions, sample configs, community configs
 * - Prompts: Quick start workflows, troubleshooting, theme customization
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

import {
  createDefaultConfig,
  createBlock,
  createSegment,
  addBlockToConfig,
  addSegmentToBlock,
  updateGlobalSettings,
} from './lib/configBuilder.js';
import {
  validateConfig,
  formatValidationResult,
} from './lib/configValidator.js';
import {
  loadAllSegments,
  loadSegmentCategory,
  getSegmentMetadata,
  searchSegments,
  getSegmentCategories,
} from './lib/segmentLoader.js';
import {
  loadConfigById,
  listConfigs,
} from './lib/configLoader.js';
import { exportConfig } from './lib/configExporter.js';

import type { OhMyPoshConfig, SegmentType, SegmentStyle, SegmentCategory } from '../src/types/ohmyposh.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths to data directories
// When compiled, __dirname is dist/mcp/, so go up two levels to reach project root
const SEGMENTS_DIR = join(__dirname, '../../public/segments');
const CONFIGS_DIR = join(__dirname, '../../public/configs');
const APPS_DIR = join(__dirname, 'apps');

// MCP Apps constants
const RESOURCE_MIME_TYPE = 'text/html;profile=mcp-app';
const RESOURCE_URI_META_KEY = 'ui/resourceUri';
const PREVIEW_RESOURCE_URI = 'ui://ohmyposh-configurator/preview.html';
const SEGMENTS_RESOURCE_URI = 'ui://ohmyposh-configurator/segments.html';

// Cache loaded app HTML
const appHtmlCache = new Map<string, string>();
async function loadAppHtml(name: string): Promise<string> {
  if (appHtmlCache.has(name)) return appHtmlCache.get(name)!;
  const html = await readFile(join(APPS_DIR, name), 'utf-8');
  appHtmlCache.set(name, html);
  return html;
}

/**
 * Main MCP Server
 */
const server = new Server(
  {
    name: 'ohmyposh-configurator',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// Initialize segment data on startup
let segmentsLoaded = false;
async function ensureSegmentsLoaded() {
  if (!segmentsLoaded) {
    await loadAllSegments(SEGMENTS_DIR);
    segmentsLoaded = true;
  }
}

/**
 * Tool: create_configuration
 * Create a new Oh My Posh configuration from a natural language description
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_configuration',
        description:
          'Create a new Oh My Posh configuration from a natural language description. ' +
          'Generates a complete configuration with blocks, segments, and smart defaults.',
        inputSchema: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description:
                'Natural language description of the desired prompt (e.g., "developer prompt with git and python")',
            },
            segments: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Optional list of segment types to include (e.g., ["path", "git", "python"])',
            },
            style: {
              type: 'string',
              enum: ['powerline', 'plain', 'diamond', 'accordion'],
              description: 'Style for all segments (default: powerline)',
            },
          },
          required: ['description'],
        },
        _meta: { ui: { resourceUri: PREVIEW_RESOURCE_URI }, [RESOURCE_URI_META_KEY]: PREVIEW_RESOURCE_URI },
      },
      {
        name: 'add_segment',
        description:
          'Add a segment to an existing Oh My Posh configuration with smart defaults. ' +
          'Automatically applies appropriate colors, templates, and options based on segment type.',
        inputSchema: {
          type: 'object',
          properties: {
            config: {
              type: 'string',
              description: 'The existing Oh My Posh configuration as JSON string',
            },
            segmentType: {
              type: 'string',
              description: 'The type of segment to add (e.g., "git", "python", "aws")',
            },
            blockIndex: {
              type: 'number',
              description: 'The index of the block to add the segment to (default: 0)',
            },
            style: {
              type: 'string',
              enum: ['powerline', 'plain', 'diamond', 'accordion'],
              description: 'Style for the segment (default: powerline)',
            },
            template: {
              type: 'string',
              description: 'Optional custom template for the segment',
            },
          },
          required: ['config', 'segmentType'],
        },
      },
      {
        name: 'modify_configuration',
        description:
          'Modify an existing Oh My Posh configuration. Can update global settings, ' +
          'add/remove blocks, modify segments, or change colors and templates.',
        inputSchema: {
          type: 'object',
          properties: {
            config: {
              type: 'string',
              description: 'The existing Oh My Posh configuration as JSON string',
            },
            modifications: {
              type: 'object',
              description:
                'Object describing the modifications to make (e.g., {"final_space": false, "palette": {...}})',
            },
          },
          required: ['config', 'modifications'],
        },
        _meta: { ui: { resourceUri: PREVIEW_RESOURCE_URI }, [RESOURCE_URI_META_KEY]: PREVIEW_RESOURCE_URI },
      },
      {
        name: 'validate_configuration',
        description:
          'Validate an Oh My Posh configuration for correctness. ' +
          'Checks required fields, structure, and palette references.',
        inputSchema: {
          type: 'object',
          properties: {
            config: {
              type: 'string',
              description: 'The Oh My Posh configuration to validate as JSON string',
            },
          },
          required: ['config'],
        },
      },
      {
        name: 'export_configuration',
        description:
          'Export an Oh My Posh configuration in different formats (JSON, YAML, TOML). ' +
          'Automatically cleans internal IDs and ensures proper formatting.',
        inputSchema: {
          type: 'object',
          properties: {
            config: {
              type: 'string',
              description: 'The Oh My Posh configuration as JSON string',
            },
            format: {
              type: 'string',
              enum: ['json', 'yaml', 'toml'],
              description: 'Output format (default: json)',
            },
          },
          required: ['config'],
        },
      },
      {
        name: 'list_segments',
        description:
          'List all available Oh My Posh segments with their descriptions, categories, and default settings. ' +
          'Can filter by category or search by keyword.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['system', 'scm', 'languages', 'cloud', 'cli', 'web', 'music', 'health'],
              description: 'Filter segments by category',
            },
            search: {
              type: 'string',
              description: 'Search segments by name, type, or description',
            },
          },
        },
        _meta: { ui: { resourceUri: SEGMENTS_RESOURCE_URI }, [RESOURCE_URI_META_KEY]: SEGMENTS_RESOURCE_URI },
      },
      {
        name: 'get_segment_info',
        description:
          'Get detailed information about a specific segment type including properties, ' +
          'options, and template variables.',
        inputSchema: {
          type: 'object',
          properties: {
            segmentType: {
              type: 'string',
              description: 'The segment type to get information about (e.g., "git", "python")',
            },
          },
          required: ['segmentType'],
        },
        _meta: { ui: { resourceUri: SEGMENTS_RESOURCE_URI }, [RESOURCE_URI_META_KEY]: SEGMENTS_RESOURCE_URI },
      },
      {
        name: 'list_sample_configs',
        description:
          'List all available sample configurations with descriptions and tags.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'load_sample_config',
        description:
          'Load a specific sample configuration by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            configId: {
              type: 'string',
              description: 'The ID of the sample configuration to load',
            },
          },
          required: ['configId'],
        },
        _meta: { ui: { resourceUri: PREVIEW_RESOURCE_URI }, [RESOURCE_URI_META_KEY]: PREVIEW_RESOURCE_URI },
      },
      {
        name: 'search_ohmyposh_docs',
        description:
          'Get links to the official Oh My Posh documentation at https://ohmyposh.dev/docs/ for a given topic. ' +
          'Returns documentation URLs and guidance for segments, configuration options, templates, and features.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (e.g., "git segment options", "powerline symbols", "color templates")',
            },
            topic: {
              type: 'string',
              enum: ['segments', 'configuration', 'templates', 'installation', 'general'],
              description: 'Optional: Narrow search to a specific documentation topic',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_ohmyposh_segment_docs',
        description:
          'Get the official Oh My Posh documentation for a specific segment type. ' +
          'Returns detailed information from https://ohmyposh.dev/docs/segments/',
        inputSchema: {
          type: 'object',
          properties: {
            segmentType: {
              type: 'string',
              description: 'The segment type to get documentation for (e.g., "git", "python", "aws")',
            },
          },
          required: ['segmentType'],
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  await ensureSegmentsLoaded();

  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_configuration': {
        const { description, segments, style } = args as {
          description: string;
          segments?: string[];
          style?: SegmentStyle;
        };

        // Create base configuration
        let config = createDefaultConfig();

        // Determine which segments to add based on description and explicit list
        const segmentsToAdd = segments || inferSegmentsFromDescription(description);
        const segmentStyle = style || 'powerline';

        // Separate status from main segments for better multi-block layout
        const mainSegments = segmentsToAdd.filter(s => s !== 'status');
        const hasStatus = segmentsToAdd.includes('status');

        // Create main block with primary segments
        const mainBlock = createBlock({
          type: 'prompt',
          alignment: 'left',
        });

        for (const segmentType of mainSegments) {
          const metadata = getSegmentMetadata(segmentType);
          if (metadata) {
            const segment = createSegment(segmentType as SegmentType, {
              style: segmentStyle,
              foreground: metadata.defaultForeground,
              background: metadata.defaultBackground,
              template: metadata.defaultTemplate,
            });
            mainBlock.segments.push(segment);
          }
        }

        config = addBlockToConfig(config, mainBlock);

        // Add status on a new line for cleaner prompt layout
        if (hasStatus) {
          const statusBlock = createBlock({
            type: 'prompt',
            alignment: 'left',
          });
          statusBlock.newline = true;

          const statusSegment = createSegment('status' as SegmentType, {
            style: 'plain',
            foreground: '#e0f8ff',
            background: 'transparent',
            template: '\u276f ',
            segmentOptions: { always_enabled: true },
          });
          statusSegment.foreground_templates = [
            '{{ if gt .Code 0 }}#ef5350{{ end }}',
          ];
          statusBlock.segments.push(statusSegment);
          config = addBlockToConfig(config, statusBlock);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(config, null, 2),
            },
          ],
        };
      }

      case 'add_segment': {
        const { config: configStr, segmentType, blockIndex = 0, style, template } = args as {
          config: string;
          segmentType: string;
          blockIndex?: number;
          style?: SegmentStyle;
          template?: string;
        };

        let config: OhMyPoshConfig;
        try {
          config = JSON.parse(configStr);
        } catch {
          throw new Error('Invalid JSON configuration');
        }

        // Get segment metadata
        const metadata = getSegmentMetadata(segmentType);
        if (!metadata) {
          throw new Error(`Unknown segment type: ${segmentType}`);
        }

        // Create segment with smart defaults
        const segment = createSegment(segmentType as SegmentType, {
          style: style || 'powerline',
          foreground: metadata.defaultForeground,
          background: metadata.defaultBackground,
          template: template || metadata.defaultTemplate,
        });

        // Validate block index
        if (blockIndex < 0 || blockIndex >= config.blocks.length) {
          throw new Error(
            `Invalid block index ${blockIndex}. Configuration has ${config.blocks.length} block(s) (valid indices: 0-${config.blocks.length - 1}).`
          );
        }

        // Add segment to block
        const updatedConfig = addSegmentToBlock(config, blockIndex, segment);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(updatedConfig, null, 2),
            },
          ],
        };
      }

      case 'modify_configuration': {
        const { config: configStr, modifications } = args as {
          config: string;
          modifications: Partial<OhMyPoshConfig>;
        };

        let config: OhMyPoshConfig;
        try {
          config = JSON.parse(configStr);
        } catch {
          throw new Error('Invalid JSON configuration');
        }

        // Apply modifications
        const updatedConfig = updateGlobalSettings(config, modifications);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(updatedConfig, null, 2),
            },
          ],
        };
      }

      case 'validate_configuration': {
        const { config: configStr } = args as { config: string };

        let config: unknown;
        try {
          config = JSON.parse(configStr);
        } catch (parseError) {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: Invalid JSON\n' + (parseError as Error).message,
              },
            ],
          };
        }

        const result = validateConfig(config);
        return {
          content: [
            {
              type: 'text',
              text: formatValidationResult(result),
            },
          ],
        };
      }

      case 'export_configuration': {
        const { config: configStr, format = 'json' } = args as {
          config: string;
          format?: 'json' | 'yaml' | 'toml';
        };

        let config: OhMyPoshConfig;
        try {
          config = JSON.parse(configStr);
        } catch {
          throw new Error('Invalid JSON configuration');
        }

        const output = exportConfig(config, format);

        return {
          content: [
            {
              type: 'text',
              text: output,
            },
          ],
        };
      }

      case 'list_segments': {
        const { category, search } = args as {
          category?: string;
          search?: string;
        };

        let segments;
        if (search) {
          segments = searchSegments(search);
        } else if (category) {
          // Validate category is one of the known types
          const validCategories: SegmentCategory[] = [
            'system',
            'scm',
            'languages',
            'cloud',
            'cli',
            'web',
            'music',
            'health',
          ];
          if (!validCategories.includes(category as SegmentCategory)) {
            throw new Error(`Invalid category: ${category}. Valid categories: ${validCategories.join(', ')}`);
          }
          segments = await loadSegmentCategory(category as SegmentCategory, SEGMENTS_DIR);
        } else {
          segments = await loadAllSegments(SEGMENTS_DIR);
        }

        const summary = segments.map((s) => ({
          type: s.type,
          name: s.name,
          category: s.category,
          description: s.description,
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(summary, null, 2),
            },
          ],
        };
      }

      case 'get_segment_info': {
        const { segmentType } = args as { segmentType: string };

        const metadata = getSegmentMetadata(segmentType);
        if (!metadata) {
          throw new Error(`Unknown segment type: ${segmentType}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(metadata, null, 2),
            },
          ],
        };
      }

      case 'list_sample_configs': {
        const configs = await listConfigs('samples', CONFIGS_DIR);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(configs, null, 2),
            },
          ],
        };
      }

      case 'load_sample_config': {
        const { configId } = args as { configId: string };

        const result = await loadConfigById('samples', configId, CONFIGS_DIR);
        if (!result) {
          throw new Error(`Sample configuration not found: ${configId}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'search_ohmyposh_docs': {
        const { query, topic } = args as { query: string; topic?: string };

        // Build the search URL for Oh My Posh docs
        const baseUrl = 'https://ohmyposh.dev/docs/';
        let searchPath = '';
        
        if (topic) {
          searchPath = topic === 'segments' ? 'segments/' : 
                      topic === 'configuration' ? 'configuration/' :
                      topic === 'templates' ? 'configuration/templates/' :
                      topic === 'installation' ? 'installation/' : '';
        }

        const docsUrl = baseUrl + searchPath;
        
        return {
          content: [
            {
              type: 'text',
              text: `To search the Oh My Posh documentation for "${query}":\n\n` +
                    `1. Visit: ${docsUrl}\n` +
                    `2. Use the search functionality on the docs site\n` +
                    `3. Or browse the relevant section:\n\n` +
                    (topic === 'segments' ? `   - Segments: ${baseUrl}segments/\n` : '') +
                    (topic === 'configuration' ? `   - Configuration: ${baseUrl}configuration/\n` : '') +
                    (topic === 'templates' ? `   - Templates: ${baseUrl}configuration/templates/\n` : '') +
                    (!topic ? `   - Main docs: ${baseUrl}\n` : '') +
                    `\nKey topics to explore:\n` +
                    `- Segment types and their options\n` +
                    `- Template variables and functions\n` +
                    `- Color and style configuration\n` +
                    `- Performance optimization (caching)\n` +
                    `\nNote: For segment-specific documentation, use the 'get_ohmyposh_segment_docs' tool with the segment type.`,
            },
          ],
        };
      }

      case 'get_ohmyposh_segment_docs': {
        const { segmentType } = args as { segmentType: string };

        // First check if we have metadata for this segment
        const metadata = getSegmentMetadata(segmentType);
        if (!metadata) {
          throw new Error(`Unknown segment type: ${segmentType}. Use list_segments to see available types.`);
        }

        const docsUrl = `https://ohmyposh.dev/docs/segments/${segmentType.toLowerCase()}`;
        
        // Build comprehensive response with local metadata and link to official docs
        let response = `# ${metadata.name} Segment\n\n`;
        response += `**Type**: \`${segmentType}\`\n`;
        response += `**Category**: ${metadata.category}\n\n`;
        response += `${metadata.description}\n\n`;

        if (metadata.defaultTemplate) {
          response += `## Default Template\n\`\`\`\n${metadata.defaultTemplate}\n\`\`\`\n\n`;
        }

        if (metadata.properties && metadata.properties.length > 0) {
          response += `## Available Properties\n\n`;
          metadata.properties.forEach(prop => {
            response += `- **${prop.name}** (${prop.type}): ${prop.description}\n`;
          });
          response += '\n';
        }

        if (metadata.options && metadata.options.length > 0) {
          response += `## Configuration Options\n\n`;
          metadata.options.forEach(opt => {
            response += `- **${opt.name}** (${opt.type})`;
            if (opt.default !== undefined) {
              response += ` - Default: \`${JSON.stringify(opt.default)}\``;
            }
            response += `\n  ${opt.description}\n`;
          });
          response += '\n';
        }

        if (metadata.defaultCache) {
          response += `## Recommended Cache Settings\n\n`;
          response += `- **Duration**: ${metadata.defaultCache.duration}\n`;
          response += `- **Strategy**: ${metadata.defaultCache.strategy}\n\n`;
        }

        response += `## Official Documentation\n\n`;
        response += `For complete and up-to-date information, visit:\n`;
        response += `${docsUrl}\n\n`;
        response += `The official documentation includes:\n`;
        response += `- Detailed property descriptions\n`;
        response += `- Configuration examples\n`;
        response += `- Platform-specific notes\n`;
        response += `- Troubleshooting tips\n`;

        return {
          content: [
            {
              type: 'text',
              text: response,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (toolError) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${(toolError as Error).message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Resource handlers - provide access to segment definitions and configs
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: PREVIEW_RESOURCE_URI,
        name: 'Config Preview App',
        description: 'Interactive visual preview of Oh My Posh configurations rendered inline',
        mimeType: RESOURCE_MIME_TYPE,
      },
      {
        uri: SEGMENTS_RESOURCE_URI,
        name: 'Segment Explorer App',
        description: 'Interactive browser for all 103+ Oh My Posh segments with search and details',
        mimeType: RESOURCE_MIME_TYPE,
      },
      {
        uri: 'ohmyposh://segments/all',
        name: 'All Segments',
        description: 'Complete list of all 103+ available Oh My Posh segments across all categories',
        mimeType: 'application/json',
      },
      {
        uri: 'ohmyposh://segments/categories',
        name: 'Segment Categories',
        description: 'List of all segment categories (system, scm, languages, cloud, cli, web, music, health)',
        mimeType: 'application/json',
      },
      {
        uri: 'ohmyposh://configs/samples',
        name: 'Sample Configurations',
        description: 'Pre-built sample configurations for common use cases',
        mimeType: 'application/json',
      },
      {
        uri: 'ohmyposh://configs/community',
        name: 'Community Configurations',
        description: 'Community-contributed Oh My Posh configurations',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  await ensureSegmentsLoaded();

  const { uri } = request.params;

  try {
    switch (uri) {
      case PREVIEW_RESOURCE_URI: {
        const html = await loadAppHtml('preview/index.html');
        return {
          contents: [
            { uri, mimeType: RESOURCE_MIME_TYPE, text: html },
          ],
        };
      }

      case SEGMENTS_RESOURCE_URI: {
        const html = await loadAppHtml('segments/index.html');
        return {
          contents: [
            { uri, mimeType: RESOURCE_MIME_TYPE, text: html },
          ],
        };
      }

      case 'ohmyposh://segments/all': {
        const segments = await loadAllSegments(SEGMENTS_DIR);
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(segments, null, 2),
            },
          ],
        };
      }

      case 'ohmyposh://segments/categories': {
        const categories = getSegmentCategories();
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(categories, null, 2),
            },
          ],
        };
      }

      case 'ohmyposh://configs/samples': {
        const configs = await listConfigs('samples', CONFIGS_DIR);
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(configs, null, 2),
            },
          ],
        };
      }

      case 'ohmyposh://configs/community': {
        const configs = await listConfigs('community', CONFIGS_DIR);
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(configs, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  } catch (resourceError) {
    throw new Error(`Failed to read resource: ${(resourceError as Error).message}`);
  }
});

/**
 * Prompt handlers - provide templated workflows
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'quick_start',
        description: 'Quick start workflow to create a new Oh My Posh configuration',
        arguments: [
          {
            name: 'use_case',
            description: 'The use case (e.g., "developer", "devops", "minimal")',
            required: true,
          },
        ],
      },
      {
        name: 'troubleshoot',
        description: 'Help troubleshoot issues with Oh My Posh configuration',
        arguments: [
          {
            name: 'issue',
            description: 'Description of the issue (e.g., "prompt is slow", "colors wrong")',
            required: true,
          },
        ],
      },
      {
        name: 'apply_theme',
        description: 'Apply a color theme to an existing configuration',
        arguments: [
          {
            name: 'theme',
            description: 'Theme name (e.g., "dracula", "nord", "gruvbox")',
            required: true,
          },
        ],
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'quick_start': {
      const { use_case } = args as { use_case: string };
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Create a new Oh My Posh configuration for a ${use_case} use case. Include appropriate segments and styling.`,
            },
          },
        ],
      };
    }

    case 'troubleshoot': {
      const { issue } = args as { issue: string };
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Help me troubleshoot this Oh My Posh issue: ${issue}. Suggest specific configuration changes to fix it.`,
            },
          },
        ],
      };
    }

    case 'apply_theme': {
      const { theme } = args as { theme: string };
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Apply the ${theme} color theme to my Oh My Posh configuration. Provide the palette configuration.`,
            },
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
});

/**
 * Helper: Infer segments from natural language description
 */
function inferSegmentsFromDescription(description: string): string[] {
  const lower = description.toLowerCase();
  const segments: string[] = ['path']; // Always include path

  // Version control
  if (lower.includes('git')) segments.push('git');

  // Languages
  if (lower.includes('node') || lower.includes('javascript') || lower.includes('npm') || lower.includes('typescript'))
    segments.push('node');
  if (lower.includes('python')) segments.push('python');
  if (lower.includes('go') && !lower.includes('google')) segments.push('go');
  if (lower.includes('rust')) segments.push('rust');
  if (lower.includes('java') && !lower.includes('javascript')) segments.push('java');
  if (lower.includes('dotnet') || lower.includes('.net') || lower.includes('c#') || lower.includes('csharp'))
    segments.push('dotnet');
  if (lower.includes('ruby')) segments.push('ruby');
  if (lower.includes('php')) segments.push('php');
  if (lower.includes('dart') || lower.includes('flutter')) segments.push('dart');
  if (lower.includes('swift')) segments.push('swift');
  if (lower.includes('react')) segments.push('react');
  if (lower.includes('angular')) segments.push('angular');

  // Cloud
  if (lower.includes('aws')) segments.push('aws');
  if (lower.includes('azure')) segments.push('az');
  if (lower.includes('gcp') || lower.includes('google cloud')) segments.push('gcp');
  if (lower.includes('kubernetes') || lower.includes('kubectl') || lower.includes('k8s')) segments.push('kubectl');
  if (lower.includes('docker')) segments.push('docker');
  if (lower.includes('helm')) segments.push('helm');

  // AI tools
  if (lower.includes('copilot')) segments.push('copilot');

  // System
  if (lower.includes('time')) segments.push('time');
  if (lower.includes('battery')) segments.push('battery');
  if (lower.includes('shell')) segments.push('shell');
  if (/\bos\b/.test(lower)) segments.push('os');

  // Dev tools
  if (lower.includes('terraform')) segments.push('terraform');

  // Always include status at the end
  segments.push('status');

  return segments;
}

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Oh My Posh Configurator MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
