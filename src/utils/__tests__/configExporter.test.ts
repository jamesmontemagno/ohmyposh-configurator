import { describe, it, expect } from 'vitest';
import {
  cleanConfig,
  exportToJson,
  exportToYaml,
  exportToToml,
  exportConfig,
} from '../configExporter';
import type { OhMyPoshConfig, Block, Segment, Tooltip } from '../../types/ohmyposh';

describe('cleanConfig', () => {
  it('should remove internal id from segments', () => {
    const config: OhMyPoshConfig = {
      blocks: [{
        id: 'block-1',
        type: 'prompt',
        segments: [{
          id: 'segment-1',
          type: 'text',
          style: 'plain',
          template: 'test',
        }],
      }],
    };

    const cleaned = cleanConfig(config);

    // Check segment doesn't have id
    expect((cleaned.blocks[0].segments[0] as Segment & { id?: string }).id).toBeUndefined();
  });

  it('should remove internal id from blocks', () => {
    const config: OhMyPoshConfig = {
      blocks: [{
        id: 'block-1',
        type: 'prompt',
        segments: [],
      }],
    };

    const cleaned = cleanConfig(config);

    expect((cleaned.blocks[0] as Block & { id?: string }).id).toBeUndefined();
  });

  it('should remove internal id from tooltips', () => {
    const config: OhMyPoshConfig = {
      blocks: [],
      tooltips: [{
        id: 'tooltip-1',
        type: 'git',
        style: 'plain',
        tips: ['git'],
      }],
    };

    const cleaned = cleanConfig(config);

    expect(cleaned.tooltips).toBeDefined();
    expect((cleaned.tooltips![0] as Tooltip & { id?: string }).id).toBeUndefined();
  });

  it('should preserve all other segment properties', () => {
    const config: OhMyPoshConfig = {
      blocks: [{
        id: 'block-1',
        type: 'prompt',
        segments: [{
          id: 'segment-1',
          type: 'text',
          style: 'powerline',
          template: 'test',
          foreground: '#ffffff',
          background: '#000000',
          powerline_symbol: '\ue0b0',
        }],
      }],
    };

    const cleaned = cleanConfig(config);

    expect(cleaned.blocks[0].segments[0].type).toBe('text');
    expect(cleaned.blocks[0].segments[0].style).toBe('powerline');
    expect(cleaned.blocks[0].segments[0].template).toBe('test');
    expect(cleaned.blocks[0].segments[0].foreground).toBe('#ffffff');
    expect(cleaned.blocks[0].segments[0].background).toBe('#000000');
    expect(cleaned.blocks[0].segments[0].powerline_symbol).toBe('\ue0b0');
  });

  it('should include required fields with defaults', () => {
    const config: OhMyPoshConfig = {
      blocks: [{
        id: 'block-1',
        type: 'prompt',
        segments: [],
      }],
    };

    const cleaned = cleanConfig(config);

    expect(cleaned.$schema).toBe('https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json');
    expect(cleaned.version).toBe(4);
  });

  it('should preserve provided schema and version', () => {
    const config: OhMyPoshConfig = {
      $schema: 'custom-schema',
      version: 5,
      blocks: [],
    };

    const cleaned = cleanConfig(config);

    expect(cleaned.$schema).toBe('custom-schema');
    expect(cleaned.version).toBe(5);
  });

  it('should include optional fields when set', () => {
    const config: OhMyPoshConfig = {
      blocks: [],
      final_space: true,
      console_title_template: '{{ .Shell }}',
      terminal_background: '#000000',
      accent_color: '#ff0000',
    };

    const cleaned = cleanConfig(config);

    expect(cleaned.final_space).toBe(true);
    expect(cleaned.console_title_template).toBe('{{ .Shell }}');
    expect(cleaned.terminal_background).toBe('#000000');
    expect(cleaned.accent_color).toBe('#ff0000');
  });

  it('should include palette when set', () => {
    const config: OhMyPoshConfig = {
      blocks: [],
      palette: {
        primary: '#ff0000',
        secondary: '#00ff00',
      },
    };

    const cleaned = cleanConfig(config);

    expect(cleaned.palette).toEqual({
      primary: '#ff0000',
      secondary: '#00ff00',
    });
  });

  it('should include palette variants when set', () => {
    const config: OhMyPoshConfig = {
      blocks: [],
      palettes: {
        template: '{{ .Env.THEME }}',
        list: {
          dark: { primary: '#111' },
          light: { primary: '#eee' },
        },
      },
    };

    const cleaned = cleanConfig(config);

    expect(cleaned.palettes?.template).toBe('{{ .Env.THEME }}');
    expect(cleaned.palettes?.list?.dark).toEqual({ primary: '#111' });
    expect(cleaned.palettes?.list?.light).toEqual({ primary: '#eee' });
  });
});

describe('exportToJson', () => {
  it('should export valid JSON', () => {
    const config: OhMyPoshConfig = {
      blocks: [{
        id: 'block-1',
        type: 'prompt',
        segments: [],
      }],
    };

    const json = exportToJson(config);
    const parsed = JSON.parse(json);

    expect(parsed.blocks).toBeDefined();
    expect(parsed.version).toBe(4);
  });

  it('should escape unicode characters as \\uXXXX', () => {
    const config: OhMyPoshConfig = {
      blocks: [{
        id: 'block-1',
        type: 'prompt',
        segments: [{
          id: 'segment-1',
          type: 'text',
          style: 'plain',
          template: '\ue0b0 test',
        }],
      }],
    };

    const json = exportToJson(config);

    expect(json).toContain('\\ue0b0');
    expect(json).not.toContain('\ue0b0'); // Should not contain raw unicode
  });

  it('should use proper indentation', () => {
    const config: OhMyPoshConfig = {
      blocks: [],
    };

    const json = exportToJson(config);

    expect(json).toContain('  '); // Should have 2-space indentation
    expect(json.split('\n').length).toBeGreaterThan(1); // Should be multi-line
  });

  it('should include schema', () => {
    const config: OhMyPoshConfig = {
      blocks: [],
    };

    const json = exportToJson(config);
    const parsed = JSON.parse(json);

    expect(parsed.$schema).toBeDefined();
  });
});

describe('exportToYaml', () => {
  it('should export valid YAML', () => {
    const config: OhMyPoshConfig = {
      blocks: [{
        id: 'block-1',
        type: 'prompt',
        segments: [],
      }],
    };

    const yaml = exportToYaml(config);

    expect(yaml).toContain('blocks:');
    expect(yaml).toContain('type: prompt');
    expect(yaml).toContain('version: 4');
  });

  it('should not use YAML refs', () => {
    const config: OhMyPoshConfig = {
      blocks: [{
        id: 'block-1',
        type: 'prompt',
        segments: [],
      }],
    };

    const yaml = exportToYaml(config);

    expect(yaml).not.toContain('&');
    expect(yaml).not.toContain('*');
  });
});

describe('exportToToml', () => {
  it('should export valid TOML', () => {
    const config: OhMyPoshConfig = {
      version: 4,
      blocks: [{
        id: 'block-1',
        type: 'prompt',
        segments: [],
      }],
    };

    const toml = exportToToml(config);

    expect(toml).toContain('version = 4');
    expect(toml).toContain('[[blocks]]');
    expect(toml).toContain('type = "prompt"');
  });

  it('should remove null values', () => {
    const config: OhMyPoshConfig = {
      blocks: [{
        id: 'block-1',
        type: 'prompt',
        segments: [{
          id: 'segment-1',
          type: 'text',
          style: 'plain',
          foreground: undefined,
        }],
      }],
    };

    const toml = exportToToml(config);

    // TOML should not have null values
    expect(toml).not.toContain('= null');
  });
});

describe('exportConfig', () => {
  const testConfig: OhMyPoshConfig = {
    blocks: [{
      id: 'block-1',
      type: 'prompt',
      segments: [],
    }],
  };

  it('should export as JSON when format is json', () => {
    const output = exportConfig(testConfig, 'json');

    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('should export as YAML when format is yaml', () => {
    const output = exportConfig(testConfig, 'yaml');

    expect(output).toContain('blocks:');
    expect(output).not.toContain('{');
  });

  it('should export as TOML when format is toml', () => {
    const output = exportConfig(testConfig, 'toml');

    expect(output).toContain('[[blocks]]');
  });

  it('should default to JSON for invalid format', () => {
    // @ts-expect-error - Testing invalid format
    const output = exportConfig(testConfig, 'invalid');

    expect(() => JSON.parse(output)).not.toThrow();
  });
});
