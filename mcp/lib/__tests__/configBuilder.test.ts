/**
 * Tests for Configuration Builder
 */

import { describe, it, expect } from 'vitest';
import {
  createDefaultConfig,
  createBlock,
  createSegment,
  addBlockToConfig,
  addSegmentToBlock,
  createTooltip,
  updateGlobalSettings,
  setPalette,
  addPaletteColor,
} from '../configBuilder.js';

describe('configBuilder', () => {
  describe('createDefaultConfig', () => {
    it('should create a valid default configuration', () => {
      const config = createDefaultConfig();
      expect(config.$schema).toBe(
        'https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json'
      );
      expect(config.version).toBe(4);
      expect(config.final_space).toBe(true);
      expect(config.blocks).toEqual([]);
    });
  });

  describe('createBlock', () => {
    it('should create a prompt block with default settings', () => {
      const block = createBlock();
      expect(block.type).toBe('prompt');
      expect(block.alignment).toBe('left');
      expect(block.segments).toEqual([]);
      expect(block.id).toBeDefined();
    });

    it('should create a block with custom settings', () => {
      const block = createBlock({
        type: 'rprompt',
        alignment: 'right',
      });
      expect(block.type).toBe('rprompt');
      expect(block.alignment).toBe('right');
    });
  });

  describe('createSegment', () => {
    it('should create a segment with default style', () => {
      const segment = createSegment('path');
      expect(segment.type).toBe('path');
      expect(segment.style).toBe('powerline');
      expect(segment.powerline_symbol).toBe('\ue0b0');
      expect(segment.id).toBeDefined();
    });

    it('should create a plain segment without powerline symbol', () => {
      const segment = createSegment('git', { style: 'plain' });
      expect(segment.type).toBe('git');
      expect(segment.style).toBe('plain');
      expect(segment.powerline_symbol).toBeUndefined();
    });

    it('should create a segment with custom colors and template', () => {
      const segment = createSegment('python', {
        foreground: '#FFD700',
        background: '#4B8BBE',
        template: ' \ue73c {{ .Full }} ',
      });
      expect(segment.foreground).toBe('#FFD700');
      expect(segment.background).toBe('#4B8BBE');
      expect(segment.template).toBe(' \ue73c {{ .Full }} ');
    });

    it('should create a segment with options', () => {
      const segment = createSegment('path', {
        segmentOptions: {
          style: 'folder',
          folder_icon: '\uf07c',
        },
      });
      expect(segment.options).toEqual({
        style: 'folder',
        folder_icon: '\uf07c',
      });
    });
  });

  describe('createTooltip', () => {
    it('should create a tooltip with tips', () => {
      const tooltip = createTooltip('git', ['git', 'g'], {
        template: ' {{ .HEAD }} ',
      });
      expect(tooltip.type).toBe('git');
      expect(tooltip.tips).toEqual(['git', 'g']);
      expect(tooltip.template).toBe(' {{ .HEAD }} ');
      expect(tooltip.style).toBe('plain');
    });
  });

  describe('addBlockToConfig', () => {
    it('should add a block to the configuration', () => {
      const config = createDefaultConfig();
      const block = createBlock();
      const updatedConfig = addBlockToConfig(config, block);
      expect(updatedConfig.blocks).toHaveLength(1);
      expect(updatedConfig.blocks[0]).toEqual(block);
    });

    it('should not mutate the original config', () => {
      const config = createDefaultConfig();
      const block = createBlock();
      addBlockToConfig(config, block);
      expect(config.blocks).toHaveLength(0);
    });
  });

  describe('addSegmentToBlock', () => {
    it('should add a segment to a block', () => {
      const block = createBlock();
      const config = addBlockToConfig(createDefaultConfig(), block);
      const segment = createSegment('path');
      const updatedConfig = addSegmentToBlock(config, 0, segment);
      expect(updatedConfig.blocks[0].segments).toHaveLength(1);
      expect(updatedConfig.blocks[0].segments[0]).toEqual(segment);
    });

    it('should not add segment if block index is invalid', () => {
      const config = createDefaultConfig();
      const segment = createSegment('path');
      const updatedConfig = addSegmentToBlock(config, 0, segment);
      expect(updatedConfig.blocks).toHaveLength(0);
    });
  });

  describe('updateGlobalSettings', () => {
    it('should update global settings', () => {
      const config = createDefaultConfig();
      const updatedConfig = updateGlobalSettings(config, {
        final_space: false,
        console_title_template: '{{ .Shell }} in {{ .Folder }}',
      });
      expect(updatedConfig.final_space).toBe(false);
      expect(updatedConfig.console_title_template).toBe('{{ .Shell }} in {{ .Folder }}');
    });

    it('should preserve blocks when updating settings', () => {
      const block = createBlock();
      const config = addBlockToConfig(createDefaultConfig(), block);
      const updatedConfig = updateGlobalSettings(config, {
        final_space: false,
      });
      expect(updatedConfig.blocks).toHaveLength(1);
    });
  });

  describe('setPalette', () => {
    it('should set palette colors', () => {
      const config = createDefaultConfig();
      const palette = {
        'text-light': '#ffffff',
        'path-bg': '#61AFEF',
      };
      const updatedConfig = setPalette(config, palette);
      expect(updatedConfig.palette).toEqual(palette);
    });
  });

  describe('addPaletteColor', () => {
    it('should add a color to the palette', () => {
      const config = createDefaultConfig();
      const updatedConfig = addPaletteColor(config, 'git-bg', '#98C379');
      expect(updatedConfig.palette?.['git-bg']).toBe('#98C379');
    });

    it('should add to existing palette', () => {
      const config = setPalette(createDefaultConfig(), { 'text-light': '#ffffff' });
      const updatedConfig = addPaletteColor(config, 'path-bg', '#61AFEF');
      expect(updatedConfig.palette).toEqual({
        'text-light': '#ffffff',
        'path-bg': '#61AFEF',
      });
    });
  });
});
