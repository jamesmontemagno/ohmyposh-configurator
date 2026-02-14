/**
 * Configuration Builder for Oh My Posh
 * Provides reusable functions to create and modify Oh My Posh configurations
 * Used by both the web app and the MCP server
 */

import type {
  OhMyPoshConfig,
  Block,
  Segment,
  SegmentType,
  SegmentStyle,
  BlockType,
  BlockAlignment,
  Tooltip,
} from '../../src/types/ohmyposh.js';

// Generate unique IDs for segments and blocks
let idCounter = 0;
export const generateId = (): string => `${Date.now()}-${++idCounter}`;

/**
 * Create a new Oh My Posh configuration with default settings
 */
export function createDefaultConfig(): OhMyPoshConfig {
  return {
    $schema: 'https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json',
    version: 4,
    final_space: true,
    blocks: [],
  };
}

/**
 * Create a new block with default settings
 */
export function createBlock(options?: {
  type?: BlockType;
  alignment?: BlockAlignment;
  segments?: Segment[];
}): Block {
  return {
    id: generateId(),
    type: options?.type || 'prompt',
    alignment: options?.alignment || 'left',
    segments: options?.segments || [],
  };
}

/**
 * Create a new segment with smart defaults based on type
 */
export function createSegment(
  type: SegmentType,
  options?: {
    style?: SegmentStyle;
    foreground?: string;
    background?: string;
    template?: string;
    powerline_symbol?: string;
    segmentOptions?: Record<string, unknown>;
  }
): Segment {
  const style = options?.style || 'powerline';
  const segment: Segment = {
    id: generateId(),
    type,
    style,
    foreground: options?.foreground || '#ffffff',
    background: options?.background || '#61AFEF',
  };

  // Add powerline symbol for powerline style
  if (style === 'powerline') {
    segment.powerline_symbol = options?.powerline_symbol || '\ue0b0';
  }

  // Add template if provided
  if (options?.template) {
    segment.template = options.template;
  }

  // Add segment-specific options
  if (options?.segmentOptions) {
    segment.options = options.segmentOptions;
  }

  return segment;
}

/**
 * Create a tooltip segment
 */
export function createTooltip(
  type: SegmentType,
  tips: string[],
  options?: {
    style?: SegmentStyle;
    foreground?: string;
    background?: string;
    template?: string;
  }
): Tooltip {
  return {
    id: generateId(),
    type,
    style: options?.style || 'plain',
    tips,
    foreground: options?.foreground || '#ffffff',
    background: options?.background || '#61AFEF',
    template: options?.template,
  };
}

/**
 * Add a segment to a block
 */
export function addSegmentToBlock(
  config: OhMyPoshConfig,
  blockIndex: number,
  segment: Segment
): OhMyPoshConfig {
  const newConfig = { ...config };
  if (blockIndex >= 0 && blockIndex < newConfig.blocks.length) {
    newConfig.blocks = [...newConfig.blocks];
    newConfig.blocks[blockIndex] = {
      ...newConfig.blocks[blockIndex],
      segments: [...newConfig.blocks[blockIndex].segments, segment],
    };
  }
  return newConfig;
}

/**
 * Add a block to the configuration
 */
export function addBlockToConfig(config: OhMyPoshConfig, block: Block): OhMyPoshConfig {
  return {
    ...config,
    blocks: [...config.blocks, block],
  };
}

/**
 * Remove a segment from a block
 */
export function removeSegmentFromBlock(
  config: OhMyPoshConfig,
  blockIndex: number,
  segmentIndex: number
): OhMyPoshConfig {
  const newConfig = { ...config };
  if (blockIndex >= 0 && blockIndex < newConfig.blocks.length) {
    newConfig.blocks = [...newConfig.blocks];
    const segments = [...newConfig.blocks[blockIndex].segments];
    segments.splice(segmentIndex, 1);
    newConfig.blocks[blockIndex] = {
      ...newConfig.blocks[blockIndex],
      segments,
    };
  }
  return newConfig;
}

/**
 * Update global configuration settings
 */
export function updateGlobalSettings(
  config: OhMyPoshConfig,
  updates: Partial<OhMyPoshConfig>
): OhMyPoshConfig {
  return {
    ...config,
    ...updates,
    // Preserve blocks if not explicitly updated
    blocks: updates.blocks || config.blocks,
  };
}

/**
 * Add a tooltip to the configuration
 */
export function addTooltipToConfig(config: OhMyPoshConfig, tooltip: Tooltip): OhMyPoshConfig {
  return {
    ...config,
    tooltips: [...(config.tooltips || []), tooltip],
  };
}

/**
 * Set palette colors
 */
export function setPalette(
  config: OhMyPoshConfig,
  palette: Record<string, string>
): OhMyPoshConfig {
  return {
    ...config,
    palette,
  };
}

/**
 * Add a color to the palette
 */
export function addPaletteColor(
  config: OhMyPoshConfig,
  key: string,
  value: string
): OhMyPoshConfig {
  return {
    ...config,
    palette: {
      ...(config.palette || {}),
      [key]: value,
    },
  };
}
