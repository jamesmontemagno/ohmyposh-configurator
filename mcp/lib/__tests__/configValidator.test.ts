/**
 * Tests for Configuration Validator
 */

import { describe, it, expect } from 'vitest';
import { validateConfig, isValidConfig, formatValidationResult } from '../configValidator';
import { createDefaultConfig, createBlock, createSegment, addBlockToConfig, addSegmentToBlock } from '../configBuilder';

describe('configValidator', () => {
  describe('validateConfig', () => {
    it('should validate a correct configuration', () => {
      const block = createBlock();
      const segment = createSegment('path');
      const config = addSegmentToBlock(addBlockToConfig(createDefaultConfig(), block), 0, segment);
      
      const result = validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object input', () => {
      const result = validateConfig(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('must be an object');
    });

    it('should warn about missing schema', () => {
      const config = { blocks: [] };
      const result = validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('$schema');
    });

    it('should error on missing blocks', () => {
      const config = { $schema: 'test' };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('blocks');
    });

    it('should error on block without type', () => {
      const config = {
        $schema: 'test',
        blocks: [{ segments: [] }],
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('type'))).toBe(true);
    });

    it('should error on segment without type', () => {
      const config = {
        $schema: 'test',
        blocks: [
          {
            type: 'prompt',
            segments: [{ style: 'plain' }],
          },
        ],
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('type'))).toBe(true);
    });

    it('should warn about empty segments array', () => {
      const config = {
        $schema: 'test',
        blocks: [
          {
            type: 'prompt',
            segments: [],
          },
        ],
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1); // Only empty segments warning
      expect(result.warnings[0].message).toContain('no segments');
    });

    it('should error on invalid palette reference', () => {
      const config = {
        $schema: 'test',
        palette: {
          'text-light': '#ffffff',
        },
        blocks: [
          {
            type: 'prompt',
            segments: [
              {
                type: 'path',
                style: 'plain',
                foreground: 'p:missing-color',
              },
            ],
          },
        ],
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('p:missing-color'))).toBe(true);
    });

    it('should validate correct palette reference', () => {
      const config = {
        $schema: 'test',
        palette: {
          'text-light': '#ffffff',
          'path-bg': '#61AFEF',
        },
        blocks: [
          {
            type: 'prompt',
            segments: [
              {
                type: 'path',
                style: 'plain',
                foreground: 'p:text-light',
                background: 'p:path-bg',
              },
            ],
          },
        ],
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(true);
    });
  });

  describe('isValidConfig', () => {
    it('should return true for valid config', () => {
      const block = createBlock();
      const segment = createSegment('path');
      const config = addSegmentToBlock(addBlockToConfig(createDefaultConfig(), block), 0, segment);
      expect(isValidConfig(config)).toBe(true);
    });

    it('should return false for invalid config', () => {
      expect(isValidConfig(null)).toBe(false);
      expect(isValidConfig({ $schema: 'test' })).toBe(false);
    });
  });

  describe('formatValidationResult', () => {
    it('should format a valid result', () => {
      const result = {
        valid: true,
        errors: [],
        warnings: [],
      };
      const formatted = formatValidationResult(result);
      expect(formatted).toContain('✓');
      expect(formatted).toContain('valid');
    });

    it('should format errors and warnings', () => {
      const result = {
        valid: false,
        errors: [
          { path: 'blocks', message: 'Missing blocks', severity: 'error' as const },
        ],
        warnings: [
          { path: '$schema', message: 'Missing schema', severity: 'warning' as const },
        ],
      };
      const formatted = formatValidationResult(result);
      expect(formatted).toContain('✗');
      expect(formatted).toContain('Missing blocks');
      expect(formatted).toContain('Missing schema');
    });
  });
});
