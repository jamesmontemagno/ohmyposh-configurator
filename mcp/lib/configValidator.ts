/**
 * Configuration Validator for Oh My Posh
 * Validates Oh My Posh configurations for correctness
 */

import type { OhMyPoshConfig } from '../../src/types/ohmyposh.js';

import type { Block, Segment } from '../../src/types/ohmyposh.js';

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validate an Oh My Posh configuration
 */
export function validateConfig(config: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check if config is an object
  if (!config || typeof config !== 'object') {
    errors.push({
      path: '$',
      message: 'Configuration must be an object',
      severity: 'error',
    });
    return { valid: false, errors, warnings };
  }

  const cfg = config as Partial<OhMyPoshConfig>;

  // Validate required fields
  if (!cfg.$schema) {
    warnings.push({
      path: '$schema',
      message: 'Missing $schema field (recommended)',
      severity: 'warning',
    });
  }

  if (!cfg.blocks) {
    errors.push({
      path: 'blocks',
      message: 'Missing required "blocks" array',
      severity: 'error',
    });
  } else if (!Array.isArray(cfg.blocks)) {
    errors.push({
      path: 'blocks',
      message: 'blocks must be an array',
      severity: 'error',
    });
  } else {
    // Validate each block
    cfg.blocks.forEach((block: Block, blockIndex: number) => {
      const blockPath = `blocks[${blockIndex}]`;

      if (!block.type) {
        errors.push({
          path: `${blockPath}.type`,
          message: 'Block missing required "type" field',
          severity: 'error',
        });
      }

      if (!block.segments || !Array.isArray(block.segments)) {
        errors.push({
          path: `${blockPath}.segments`,
          message: 'Block missing or invalid "segments" array',
          severity: 'error',
        });
      } else if (block.segments.length === 0) {
        warnings.push({
          path: `${blockPath}.segments`,
          message: 'Block has no segments',
          severity: 'warning',
        });
      } else {
        // Validate each segment
        block.segments.forEach((segment: Segment, segmentIndex: number) => {
          const segmentPath = `${blockPath}.segments[${segmentIndex}]`;

          if (!segment.type) {
            errors.push({
              path: `${segmentPath}.type`,
              message: 'Segment missing required "type" field',
              severity: 'error',
            });
          }

          if (!segment.style) {
            warnings.push({
              path: `${segmentPath}.style`,
              message: 'Segment missing "style" field (will use default)',
              severity: 'warning',
            });
          }
        });
      }
    });
  }

  // Validate palette references if palette is used
  if (cfg.palette) {
    const paletteKeys = new Set(Object.keys(cfg.palette));
    const checkColorRef = (value: unknown, path: string) => {
      if (typeof value === 'string' && value.startsWith('p:')) {
        const refName = value.slice(2);
        if (!paletteKeys.has(refName)) {
          errors.push({
            path,
            message: `Palette reference "p:${refName}" not found in palette`,
            severity: 'error',
          });
        }
      }
    };

    // Check palette references inside template arrays (foreground_templates, background_templates)
    const checkTemplateRefs = (templates: unknown, path: string) => {
      if (!Array.isArray(templates)) return;
      templates.forEach((tpl: unknown, tplIndex: number) => {
        if (typeof tpl !== 'string') return;
        const matches = tpl.matchAll(/p:([\w-]+)/g);
        for (const match of matches) {
          if (!paletteKeys.has(match[1])) {
            errors.push({
              path: `${path}[${tplIndex}]`,
              message: `Palette reference "p:${match[1]}" not found in palette`,
              severity: 'error',
            });
          }
        }
      });
    };

    // Check all blocks and segments for palette references
    cfg.blocks?.forEach((block: Block, blockIndex: number) => {
      block.segments?.forEach((segment: Segment, segmentIndex: number) => {
        const segmentPath = `blocks[${blockIndex}].segments[${segmentIndex}]`;
        if (segment.foreground) {
          checkColorRef(segment.foreground, `${segmentPath}.foreground`);
        }
        if (segment.background) {
          checkColorRef(segment.background, `${segmentPath}.background`);
        }
        checkTemplateRefs(segment.foreground_templates, `${segmentPath}.foreground_templates`);
        checkTemplateRefs(segment.background_templates, `${segmentPath}.background_templates`);
      });
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if a configuration is valid
 */
export function isValidConfig(config: unknown): config is OhMyPoshConfig {
  const result = validateConfig(config);
  return result.valid;
}

/**
 * Format validation errors and warnings for display
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.valid) {
    lines.push('✓ Configuration is valid');
  } else {
    lines.push('✗ Configuration has errors');
  }

  if (result.errors.length > 0) {
    lines.push('\nErrors:');
    result.errors.forEach((error) => {
      lines.push(`  - ${error.path}: ${error.message}`);
    });
  }

  if (result.warnings.length > 0) {
    lines.push('\nWarnings:');
    result.warnings.forEach((warning) => {
      lines.push(`  - ${warning.path}: ${warning.message}`);
    });
  }

  return lines.join('\n');
}
