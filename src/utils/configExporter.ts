import yaml from 'js-yaml';
import TOML from '@iarna/toml';
import type { OhMyPoshConfig, Block, Segment, ExportFormat } from '../types/ohmyposh';

// Type for cleaned segment (without internal id)
type CleanedSegment = Omit<Segment, 'id'>;

// Type for cleaned block (without internal ids)
interface CleanedBlock extends Omit<Block, 'id' | 'segments'> {
  segments: CleanedSegment[];
}

// Type for cleaned config
interface CleanedConfig extends Omit<OhMyPoshConfig, 'blocks'> {
  blocks: CleanedBlock[];
}

// Remove internal IDs before export
function cleanSegment(segment: Segment): CleanedSegment {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...rest } = segment;
  return rest;
}

function cleanBlock(block: Block): CleanedBlock {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...rest } = block;
  return {
    ...rest,
    segments: rest.segments.map(cleanSegment),
  };
}

export function cleanConfig(config: OhMyPoshConfig): CleanedConfig {
  // Ensure global settings are always at the top in a consistent order
  const {
    blocks,
    $schema,
    version,
    final_space,
    console_title_template,
    terminal_background,
    accent_color,
    enable_cursor_positioning,
    shell_integration,
    pwd,
    tooltips,
    transient_prompt,
    valid_line,
    error_line,
    secondary_prompt,
    debug_prompt,
    palette,
    palettes,
    cycle,
    var: configVar,
    maps,
  } = config;

  // Build the cleaned config with explicit ordering
  const cleanedConfig: Partial<CleanedConfig> = {};

  // Always add schema (default to official Oh My Posh schema)
  cleanedConfig.$schema = $schema || 'https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json';
  
  // Add version (default to 4)
  cleanedConfig.version = version !== undefined ? version : 4;

  // Add global settings in a logical order (only if explicitly set)
  if (final_space !== undefined) cleanedConfig.final_space = final_space;
  if (console_title_template) cleanedConfig.console_title_template = console_title_template;
  if (terminal_background) cleanedConfig.terminal_background = terminal_background;
  if (accent_color) cleanedConfig.accent_color = accent_color;
  if (enable_cursor_positioning) cleanedConfig.enable_cursor_positioning = enable_cursor_positioning;
  if (shell_integration) cleanedConfig.shell_integration = shell_integration;
  if (pwd) cleanedConfig.pwd = pwd;

  // Add blocks (required)
  cleanedConfig.blocks = blocks.map(cleanBlock);

  // Add optional prompts and tooltips
  if (tooltips && tooltips.length > 0) cleanedConfig.tooltips = tooltips;
  if (transient_prompt) cleanedConfig.transient_prompt = transient_prompt;
  if (valid_line) cleanedConfig.valid_line = valid_line;
  if (error_line) cleanedConfig.error_line = error_line;
  if (secondary_prompt) cleanedConfig.secondary_prompt = secondary_prompt;
  if (debug_prompt) cleanedConfig.debug_prompt = debug_prompt;

  // Add theme customization
  if (palette) cleanedConfig.palette = palette;
  if (palettes) cleanedConfig.palettes = palettes;
  if (cycle) cleanedConfig.cycle = cycle;

  // Add variables and maps
  if (configVar) cleanedConfig.var = configVar;
  if (maps) cleanedConfig.maps = maps;

  return cleanedConfig as CleanedConfig;
}

export function exportToJson(config: OhMyPoshConfig): string {
  const cleanedConfig = cleanConfig(config);
  
  // Custom replacer to escape unicode characters
  const escapeUnicode = (str: string): string => {
    return str.replace(/[\u0080-\uffff]/g, (char) => {
      return '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
    });
  };
  
  // Stringify with proper formatting
  const jsonString = JSON.stringify(cleanedConfig, null, 2);
  
  // Escape unicode characters in string values
  return jsonString.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
    // Only process string values (not keys), and only if they contain high unicode
    if (/[\u0080-\uffff]/.test(match)) {
      const inner = match.slice(1, -1); // Remove quotes
      const escaped = escapeUnicode(inner);
      return '"' + escaped + '"';
    }
    return match;
  });
}

export function exportToYaml(config: OhMyPoshConfig): string {
  const cleanedConfig = cleanConfig(config);
  return yaml.dump(cleanedConfig, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });
}

export function exportToToml(config: OhMyPoshConfig): string {
  const cleanedConfig = cleanConfig(config);
  // TOML doesn't support null values, so we need to remove them
  const cleanedForToml = JSON.parse(JSON.stringify(cleanedConfig, (_, value) => 
    value === null ? undefined : value
  ));
  return TOML.stringify(cleanedForToml as TOML.JsonMap);
}

export function exportConfig(config: OhMyPoshConfig, format: ExportFormat): string {
  switch (format) {
    case 'json':
      return exportToJson(config);
    case 'yaml':
      return exportToYaml(config);
    case 'toml':
      return exportToToml(config);
    default:
      return exportToJson(config);
  }
}

export function downloadConfig(config: OhMyPoshConfig, format: ExportFormat): void {
  const content = exportConfig(config, format);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const extension = format === 'yaml' ? 'yaml' : format;
  const filename = `ohmyposh.${extension}`;
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
