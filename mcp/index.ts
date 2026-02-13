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
import yaml from 'js-yaml';
import TOML from '@iarna/toml';

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
import { cleanConfig } from './lib/configExporter.js';

import type { OhMyPoshConfig, SegmentType, SegmentStyle } from '../src/types/ohmyposh.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths to data directories
const SEGMENTS_DIR = join(__dirname, '../public/segments');
const CONFIGS_DIR = join(__dirname, '../public/configs');

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

        // Add a default block
        const block = createBlock({
          type: 'prompt',
          alignment: 'left',
        });

        // Determine which segments to add based on description and explicit list
        const segmentsToAdd = segments || inferSegmentsFromDescription(description);

        // Add segments to the block
        for (const segmentType of segmentsToAdd) {
          const metadata = getSegmentMetadata(segmentType);
          if (metadata) {
            const segment = createSegment(segmentType as SegmentType, {
              style: style || 'powerline',
              foreground: metadata.defaultForeground,
              background: metadata.defaultBackground,
              template: metadata.defaultTemplate,
            });
            block.segments.push(segment);
          }
        }

        // Add block to config
        config = addBlockToConfig(config, block);

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
        } catch {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: Invalid JSON\n' + (error as Error).message,
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
        const args = request.params.arguments as {
          config: string;
          format?: 'json' | 'yaml' | 'toml';
        };
        const { config: configStr, format = 'json' } = args;

        let config: OhMyPoshConfig;
        try {
          config = JSON.parse(configStr);
        } catch {
          throw new Error('Invalid JSON configuration');
        }

        // Clean config (remove internal IDs)
        const cleaned = cleanConfig(config);

        let output: string;
        switch (format) {
          case 'yaml':
            output = yaml.dump(cleaned, { indent: 2, lineWidth: 120, noRefs: true });
            break;
          case 'toml': {
            // Remove null values for TOML
            const cleanedForToml = JSON.parse(
              JSON.stringify(cleaned, (_, value) => (value === null ? undefined : value))
            );
            output = TOML.stringify(cleanedForToml as TOML.JsonMap);
            break;
          }
          case 'json':
          default:
            output = JSON.stringify(cleaned, null, 2);
            break;
        }

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
        const args = request.params.arguments as {
          category?: string;
          search?: string;
        };
        const { category, search } = args;

        let segments;
        if (search) {
          segments = searchSegments(search);
        } else if (category) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          segments = await loadSegmentCategory(category as any, SEGMENTS_DIR);
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

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${(error as Error).message}`,
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
  } catch {
    throw new Error(`Failed to read resource: ${(error as Error).message}`);
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
  if (lower.includes('node') || lower.includes('javascript') || lower.includes('npm'))
    segments.push('node');
  if (lower.includes('python')) segments.push('python');
  if (lower.includes('go')) segments.push('go');
  if (lower.includes('rust')) segments.push('rust');
  if (lower.includes('java')) segments.push('java');
  if (lower.includes('dotnet') || lower.includes('.net') || lower.includes('c#'))
    segments.push('dotnet');
  if (lower.includes('ruby')) segments.push('ruby');
  if (lower.includes('php')) segments.push('php');

  // Cloud
  if (lower.includes('aws')) segments.push('aws');
  if (lower.includes('azure')) segments.push('az');
  if (lower.includes('gcp') || lower.includes('google cloud')) segments.push('gcp');
  if (lower.includes('kubernetes') || lower.includes('kubectl')) segments.push('kubectl');
  if (lower.includes('docker')) segments.push('docker');

  // System
  if (lower.includes('time')) segments.push('time');
  if (lower.includes('battery')) segments.push('battery');
  if (lower.includes('shell')) segments.push('shell');
  if (lower.includes('os')) segments.push('os');

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
