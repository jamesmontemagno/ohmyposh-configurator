import { describe, it, expect } from 'vitest';
import { importConfig } from '../configImporter';

describe('importConfig', () => {
  describe('JSON parsing', () => {
    it('should parse valid JSON config', () => {
      const json = JSON.stringify({
        blocks: [{
          type: 'prompt',
          segments: [{
            type: 'text',
            style: 'plain',
          }],
        }],
      });

      const config = importConfig(json, 'config.json');

      expect(config.blocks).toHaveLength(1);
      expect(config.blocks[0].segments).toHaveLength(1);
      expect(config.blocks[0].segments[0].type).toBe('text');
    });

    it('should add IDs to blocks and segments', () => {
      const json = JSON.stringify({
        blocks: [{
          type: 'prompt',
          segments: [{
            type: 'text',
            style: 'plain',
          }],
        }],
      });

      const config = importConfig(json, 'config.json');

      expect(config.blocks[0].id).toBeDefined();
      expect(config.blocks[0].segments[0].id).toBeDefined();
    });

    it('should preserve existing IDs', () => {
      const json = JSON.stringify({
        blocks: [{
          id: 'existing-block-id',
          type: 'prompt',
          segments: [{
            id: 'existing-segment-id',
            type: 'text',
            style: 'plain',
          }],
        }],
      });

      const config = importConfig(json, 'config.json');

      expect(config.blocks[0].id).toBe('existing-block-id');
      expect(config.blocks[0].segments[0].id).toBe('existing-segment-id');
    });
  });

  describe('YAML parsing', () => {
    it('should parse valid YAML config', () => {
      const yaml = `
blocks:
  - type: prompt
    segments:
      - type: text
        style: plain
`;

      const config = importConfig(yaml, 'config.yaml');

      expect(config.blocks).toHaveLength(1);
      expect(config.blocks[0].segments[0].type).toBe('text');
    });

    it('should handle .yml extension', () => {
      const yaml = `
blocks:
  - type: prompt
    segments: []
`;

      const config = importConfig(yaml, 'config.yml');

      expect(config.blocks).toHaveLength(1);
    });
  });

  describe('TOML parsing', () => {
    it('should parse valid TOML config', () => {
      const toml = `
[[blocks]]
type = "prompt"

[[blocks.segments]]
type = "text"
style = "plain"
`;

      const config = importConfig(toml, 'config.toml');

      expect(config.blocks).toHaveLength(1);
      expect(config.blocks[0].segments[0].type).toBe('text');
    });
  });

  describe('auto-detect format', () => {
    it('should auto-detect JSON when extension is unknown', () => {
      const json = JSON.stringify({
        blocks: [{ type: 'prompt', segments: [] }],
      });

      const config = importConfig(json, 'config.omp');

      expect(config.blocks).toHaveLength(1);
    });

    it('should fall back to YAML for non-JSON with unknown extension', () => {
      const yaml = `
blocks:
  - type: prompt
    segments: []
`;

      const config = importConfig(yaml, 'config.omp');

      expect(config.blocks).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should throw error for missing blocks', () => {
      const json = JSON.stringify({ version: 4 });

      expect(() => importConfig(json, 'config.json')).toThrow('missing or invalid blocks array');
    });

    it('should throw error for non-array blocks', () => {
      const json = JSON.stringify({ blocks: 'not-an-array' });

      expect(() => importConfig(json, 'config.json')).toThrow('missing or invalid blocks array');
    });

    it('should throw error for segment missing type', () => {
      const json = JSON.stringify({
        blocks: [{
          type: 'prompt',
          segments: [{
            style: 'plain',
            // missing type
          }],
        }],
      });

      expect(() => importConfig(json, 'config.json')).toThrow('missing required "type" field');
    });

    it('should throw error for invalid JSON', () => {
      expect(() => importConfig('{ invalid json', 'config.json')).toThrow();
    });

    it('should throw error for invalid YAML', () => {
      // YAML with unbalanced quotes causes parsing error
      const invalidYaml = `blocks: [{type: "prompt}`;

      expect(() => importConfig(invalidYaml, 'config.yaml')).toThrow();
    });

    it('should throw error for non-object config', () => {
      const json = JSON.stringify('just a string');

      expect(() => importConfig(json, 'config.json')).toThrow('not an object');
    });

    it('should throw error for invalid block', () => {
      const json = JSON.stringify({
        blocks: ['not-an-object'],
      });

      expect(() => importConfig(json, 'config.json')).toThrow('Invalid block');
    });

    it('should throw error for invalid segment', () => {
      const json = JSON.stringify({
        blocks: [{
          type: 'prompt',
          segments: ['not-an-object'],
        }],
      });

      expect(() => importConfig(json, 'config.json')).toThrow('Invalid segment');
    });
  });

  describe('normalization', () => {
    it('should handle empty segments array', () => {
      const json = JSON.stringify({
        blocks: [{
          type: 'prompt',
          segments: [],
        }],
      });

      const config = importConfig(json, 'config.json');

      expect(config.blocks[0].segments).toEqual([]);
    });

    it('should create empty segments array if missing', () => {
      const json = JSON.stringify({
        blocks: [{
          type: 'prompt',
          // no segments array
        }],
      });

      const config = importConfig(json, 'config.json');

      expect(config.blocks[0].segments).toEqual([]);
    });

    it('should set default style for segments', () => {
      const json = JSON.stringify({
        blocks: [{
          type: 'prompt',
          segments: [{
            type: 'text',
            // no style
          }],
        }],
      });

      const config = importConfig(json, 'config.json');

      expect(config.blocks[0].segments[0].style).toBe('powerline');
    });

    it('should set default block type', () => {
      const json = JSON.stringify({
        blocks: [{
          // no type
          segments: [],
        }],
      });

      const config = importConfig(json, 'config.json');

      expect(config.blocks[0].type).toBe('prompt');
    });

    it('should support legacy properties field as options', () => {
      const json = JSON.stringify({
        blocks: [{
          type: 'prompt',
          segments: [{
            type: 'path',
            style: 'plain',
            properties: {
              style: 'folder',
            },
          }],
        }],
      });

      const config = importConfig(json, 'config.json');

      expect(config.blocks[0].segments[0].options).toEqual({ style: 'folder' });
    });
  });

  describe('tooltip normalization', () => {
    it('should normalize tooltips with IDs', () => {
      const json = JSON.stringify({
        blocks: [],
        tooltips: [{
          type: 'git',
          tips: ['git'],
        }],
      });

      const config = importConfig(json, 'config.json');

      expect(config.tooltips).toHaveLength(1);
      expect(config.tooltips![0].id).toBeDefined();
      expect(config.tooltips![0].type).toBe('git');
      expect(config.tooltips![0].tips).toEqual(['git']);
    });

    it('should preserve existing tooltip IDs', () => {
      const json = JSON.stringify({
        blocks: [],
        tooltips: [{
          id: 'existing-tooltip-id',
          type: 'git',
          tips: ['git'],
        }],
      });

      const config = importConfig(json, 'config.json');

      expect(config.tooltips![0].id).toBe('existing-tooltip-id');
    });

    it('should set default values for tooltips', () => {
      const json = JSON.stringify({
        blocks: [],
        tooltips: [{
          type: 'git',
          tips: ['git'],
        }],
      });

      const config = importConfig(json, 'config.json');

      expect(config.tooltips![0].style).toBe('plain');
    });

    it('should throw error for invalid tooltip', () => {
      const json = JSON.stringify({
        blocks: [],
        tooltips: ['not-an-object'],
      });

      expect(() => importConfig(json, 'config.json')).toThrow('Invalid tooltip');
    });
  });

  describe('all config fields', () => {
    it('should preserve all config fields', () => {
      const json = JSON.stringify({
        $schema: 'https://example.com/schema.json',
        version: 4,
        final_space: true,
        console_title_template: '{{ .Shell }}',
        terminal_background: '#000000',
        accent_color: '#ff0000',
        enable_cursor_positioning: true,
        shell_integration: true,
        pwd: 'osc7',
        blocks: [],
        transient_prompt: { template: '> ' },
        secondary_prompt: { template: '>> ' },
        valid_line: { template: '✓ ' },
        error_line: { template: '✗ ' },
        debug_prompt: { template: 'debug> ' },
        palette: { primary: '#ff0000' },
        palettes: {
          template: '{{ .Env.THEME }}',
          list: { dark: { primary: '#111' } },
        },
      });

      const config = importConfig(json, 'config.json');

      expect(config.$schema).toBe('https://example.com/schema.json');
      expect(config.version).toBe(4);
      expect(config.final_space).toBe(true);
      expect(config.console_title_template).toBe('{{ .Shell }}');
      expect(config.terminal_background).toBe('#000000');
      expect(config.accent_color).toBe('#ff0000');
      expect(config.enable_cursor_positioning).toBe(true);
      expect(config.shell_integration).toBe(true);
      expect(config.pwd).toBe('osc7');
      expect(config.transient_prompt).toEqual({ template: '> ' });
      expect(config.secondary_prompt).toEqual({ template: '>> ' });
      expect(config.valid_line).toEqual({ template: '✓ ' });
      expect(config.error_line).toEqual({ template: '✗ ' });
      expect(config.debug_prompt).toEqual({ template: 'debug> ' });
      expect(config.palette).toEqual({ primary: '#ff0000' });
      expect(config.palettes?.template).toBe('{{ .Env.THEME }}');
      expect(config.palettes?.list?.dark).toEqual({ primary: '#111' });
    });
  });
});
