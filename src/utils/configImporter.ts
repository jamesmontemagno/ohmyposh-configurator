import * as yaml from 'js-yaml';
import * as toml from '@iarna/toml';
import type { OhMyPoshConfig, Segment, Tooltip } from '../types/ohmyposh';
import { generateId } from '../store/configStore';

/**
 * Imports and parses an Oh My Posh configuration file
 * Supports JSON, YAML, and TOML formats
 */
export function importConfig(content: string, filename: string): OhMyPoshConfig {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  let parsedConfig: unknown;
  
  try {
    switch (extension) {
      case 'json':
        parsedConfig = JSON.parse(content);
        break;
      case 'yaml':
      case 'yml':
        parsedConfig = yaml.load(content);
        break;
      case 'toml':
        parsedConfig = toml.parse(content);
        break;
      default:
        // Try JSON first, then YAML as fallback
        try {
          parsedConfig = JSON.parse(content);
        } catch {
          parsedConfig = yaml.load(content);
        }
    }
  } catch (error) {
    throw new Error(`Failed to parse ${extension?.toUpperCase() || 'config'} file: ${error instanceof Error ? error.message : 'Invalid format'}`);
  }

  // Validate and normalize the config
  return normalizeConfig(parsedConfig as Record<string, unknown>);
}

/**
 * Normalizes and validates an Oh My Posh config object
 * Adds required IDs for drag-and-drop functionality
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeConfig(config: Record<string, any>): OhMyPoshConfig {
  if (!config || typeof config !== 'object') {
    throw new Error('Invalid configuration: not an object');
  }

  if (!Array.isArray(config.blocks)) {
    throw new Error('Invalid configuration: missing or invalid blocks array');
  }

  // Normalize blocks and segments by adding IDs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizedBlocks = config.blocks.map((block: any) => {
    if (!block || typeof block !== 'object') {
      throw new Error('Invalid block in configuration');
    }

    if (!Array.isArray(block.segments)) {
      block.segments = [];
    }

    // Add IDs to segments if missing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalizedSegments = block.segments.map((segment: any): Segment => {
      if (!segment || typeof segment !== 'object') {
        throw new Error('Invalid segment in configuration');
      }

      if (!segment.type) {
        throw new Error('Segment missing required "type" field');
      }

      return {
        id: segment.id || generateId(),
        type: segment.type,
        style: segment.style || 'powerline',
        foreground: segment.foreground,
        foreground_templates: segment.foreground_templates,
        background: segment.background,
        background_templates: segment.background_templates,
        template: segment.template,
        templates: segment.templates,
        templates_logic: segment.templates_logic,
        powerline_symbol: segment.powerline_symbol,
        leading_diamond: segment.leading_diamond,
        trailing_diamond: segment.trailing_diamond,
        invert_powerline: segment.invert_powerline,
        leading_powerline_symbol: segment.leading_powerline_symbol,
        min_width: segment.min_width,
        max_width: segment.max_width,
        interactive: segment.interactive,
        alias: segment.alias,
        include_folders: segment.include_folders,
        exclude_folders: segment.exclude_folders,
        // Support both 'options' (correct) and 'properties' (legacy) for backward compatibility
        options: segment.options || segment.properties,
        cache: segment.cache,
      };
    });

    return {
      id: block.id || generateId(),
      type: block.type || 'prompt',
      alignment: block.alignment,
      newline: block.newline,
      leading_diamond: block.leading_diamond,
      trailing_diamond: block.trailing_diamond,
      overflow: block.overflow,
      filler: block.filler,
      force: block.force,
      index: block.index,
      segments: normalizedSegments,
    };
  });

  // Normalize tooltips by adding IDs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizedTooltips = config.tooltips?.map((tooltip: any): Tooltip => {
    if (!tooltip || typeof tooltip !== 'object') {
      throw new Error('Invalid tooltip in configuration');
    }

    return {
      id: tooltip.id || generateId(),
      type: tooltip.type || 'text',
      style: tooltip.style || 'plain',
      tips: tooltip.tips || [],
      foreground: tooltip.foreground,
      foreground_templates: tooltip.foreground_templates,
      background: tooltip.background,
      background_templates: tooltip.background_templates,
      template: tooltip.template,
      templates: tooltip.templates,
      templates_logic: tooltip.templates_logic,
      powerline_symbol: tooltip.powerline_symbol,
      leading_diamond: tooltip.leading_diamond,
      trailing_diamond: tooltip.trailing_diamond,
      invert_powerline: tooltip.invert_powerline,
      leading_powerline_symbol: tooltip.leading_powerline_symbol,
      min_width: tooltip.min_width,
      max_width: tooltip.max_width,
      interactive: tooltip.interactive,
      alias: tooltip.alias,
      include_folders: tooltip.include_folders,
      exclude_folders: tooltip.exclude_folders,
      options: tooltip.options || tooltip.properties,
      cache: tooltip.cache,
    };
  });

  // Return normalized config
  return {
    $schema: config.$schema,
    version: config.version,
    final_space: config.final_space,
    enable_cursor_positioning: config.enable_cursor_positioning,
    shell_integration: config.shell_integration,
    pwd: config.pwd,
    patch_pwsh_bleed: config.patch_pwsh_bleed,
    async: config.async,
    console_title_template: config.console_title_template,
    terminal_background: config.terminal_background,
    accent_color: config.accent_color,
    blocks: normalizedBlocks,
    tooltips: normalizedTooltips,
    tooltips_action: config.tooltips_action,
    transient_prompt: config.transient_prompt,
    valid_line: config.valid_line,
    error_line: config.error_line,
    secondary_prompt: config.secondary_prompt,
    debug_prompt: config.debug_prompt,
    palette: config.palette,
    palettes: config.palettes,
    cycle: config.cycle,
    var: config.var,
    maps: config.maps,
  };
}
