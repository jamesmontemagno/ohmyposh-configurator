import { describe, it, expect, beforeEach } from 'vitest';
import { useConfigStore, generateId, findBlockForSegment, getSelectedSegment } from '../configStore';
import type { OhMyPoshConfig, Segment } from '../../types/ohmyposh';

describe('generateId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    const id3 = generateId();

    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it('should generate string IDs', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
});

describe('configStore', () => {
  beforeEach(() => {
    // Reset the store to default state before each test
    useConfigStore.getState().resetConfig();
  });

  describe('setConfig', () => {
    it('should replace the entire config', () => {
      const newConfig: OhMyPoshConfig = {
        blocks: [
          {
            id: 'test-block-1',
            type: 'prompt',
            alignment: 'left',
            segments: [],
          },
        ],
        version: 4,
      };

      useConfigStore.getState().setConfig(newConfig);
      const state = useConfigStore.getState();

      expect(state.config.blocks).toHaveLength(1);
      expect(state.config.blocks[0].id).toBe('test-block-1');
    });
  });

  describe('resetConfig', () => {
    it('should reset to default config', () => {
      // First modify the config
      useConfigStore.getState().updateGlobalConfig({ version: 5 });
      expect(useConfigStore.getState().config.version).toBe(5);

      // Then reset
      useConfigStore.getState().resetConfig();
      expect(useConfigStore.getState().config.version).toBe(4);
    });

    it('should clear selections', () => {
      useConfigStore.setState({
        selectedBlockId: 'some-block',
        selectedSegmentId: 'some-segment',
        selectedTooltipId: 'some-tooltip',
      });

      useConfigStore.getState().resetConfig();

      expect(useConfigStore.getState().selectedBlockId).toBeNull();
      expect(useConfigStore.getState().selectedSegmentId).toBeNull();
      expect(useConfigStore.getState().selectedTooltipId).toBeNull();
    });
  });

  describe('updateGlobalConfig', () => {
    it('should update global config fields', () => {
      useConfigStore.getState().updateGlobalConfig({
        final_space: false,
        console_title_template: 'My Title',
      });

      const config = useConfigStore.getState().config;
      expect(config.final_space).toBe(false);
      expect(config.console_title_template).toBe('My Title');
    });
  });

  describe('block actions', () => {
    describe('addBlock', () => {
      it('should add a new block with defaults', () => {
        const initialLength = useConfigStore.getState().config.blocks.length;
        useConfigStore.getState().addBlock();

        const blocks = useConfigStore.getState().config.blocks;
        expect(blocks).toHaveLength(initialLength + 1);
        expect(blocks[blocks.length - 1].type).toBe('prompt');
        expect(blocks[blocks.length - 1].alignment).toBe('left');
        expect(blocks[blocks.length - 1].segments).toEqual([]);
      });

      it('should add a block with custom properties', () => {
        useConfigStore.getState().addBlock({ type: 'rprompt', alignment: 'right' });

        const blocks = useConfigStore.getState().config.blocks;
        const newBlock = blocks[blocks.length - 1];
        expect(newBlock.type).toBe('rprompt');
        expect(newBlock.alignment).toBe('right');
      });
    });

    describe('updateBlock', () => {
      it('should update an existing block', () => {
        const blockId = useConfigStore.getState().config.blocks[0].id;
        useConfigStore.getState().updateBlock(blockId, { alignment: 'right' });

        const block = useConfigStore.getState().config.blocks.find((b) => b.id === blockId);
        expect(block?.alignment).toBe('right');
      });

      it('should not affect other blocks', () => {
        useConfigStore.getState().addBlock();
        const blocks = useConfigStore.getState().config.blocks;
        const secondBlockId = blocks[1].id;

        useConfigStore.getState().updateBlock(secondBlockId, { type: 'rprompt' });

        expect(useConfigStore.getState().config.blocks[0].type).toBe('prompt');
        expect(useConfigStore.getState().config.blocks[1].type).toBe('rprompt');
      });
    });

    describe('removeBlock', () => {
      it('should remove a block', () => {
        useConfigStore.getState().addBlock();
        const blocks = useConfigStore.getState().config.blocks;
        const blockToRemove = blocks[blocks.length - 1].id;
        const initialLength = blocks.length;

        useConfigStore.getState().removeBlock(blockToRemove);

        expect(useConfigStore.getState().config.blocks).toHaveLength(initialLength - 1);
        expect(useConfigStore.getState().config.blocks.find((b) => b.id === blockToRemove)).toBeUndefined();
      });

      it('should clear selection if removed block was selected', () => {
        const blockId = useConfigStore.getState().config.blocks[0].id;
        useConfigStore.getState().selectBlock(blockId);

        useConfigStore.getState().addBlock();
        useConfigStore.getState().removeBlock(blockId);

        expect(useConfigStore.getState().selectedBlockId).toBeNull();
      });
    });

    describe('reorderBlocks', () => {
      it('should reorder blocks', () => {
        useConfigStore.getState().addBlock({ type: 'rprompt' });
        const blocks = useConfigStore.getState().config.blocks;
        const firstId = blocks[0].id;
        const secondId = blocks[1].id;

        useConfigStore.getState().reorderBlocks(0, 1);

        const reorderedBlocks = useConfigStore.getState().config.blocks;
        expect(reorderedBlocks[0].id).toBe(secondId);
        expect(reorderedBlocks[1].id).toBe(firstId);
      });
    });

    describe('selectBlock', () => {
      it('should select a block', () => {
        const blockId = useConfigStore.getState().config.blocks[0].id;
        useConfigStore.getState().selectBlock(blockId);

        expect(useConfigStore.getState().selectedBlockId).toBe(blockId);
      });

      it('should clear segment and tooltip selection', () => {
        useConfigStore.setState({
          selectedSegmentId: 'some-segment',
          selectedTooltipId: 'some-tooltip',
        });

        const blockId = useConfigStore.getState().config.blocks[0].id;
        useConfigStore.getState().selectBlock(blockId);

        expect(useConfigStore.getState().selectedSegmentId).toBeNull();
        expect(useConfigStore.getState().selectedTooltipId).toBeNull();
      });
    });
  });

  describe('segment actions', () => {
    let testBlockId: string;
    let testSegment: Segment;

    beforeEach(() => {
      testBlockId = useConfigStore.getState().config.blocks[0].id;
      testSegment = {
        id: generateId(),
        type: 'text',
        style: 'plain',
        template: 'Test',
      };
    });

    describe('addSegment', () => {
      it('should add a segment to a block', () => {
        const initialLength = useConfigStore.getState().config.blocks[0].segments.length;
        useConfigStore.getState().addSegment(testBlockId, testSegment);

        const segments = useConfigStore.getState().config.blocks[0].segments;
        expect(segments).toHaveLength(initialLength + 1);
        expect(segments[segments.length - 1].id).toBe(testSegment.id);
      });

      it('should add a segment at specific index', () => {
        useConfigStore.getState().addSegment(testBlockId, testSegment, 0);

        const segments = useConfigStore.getState().config.blocks[0].segments;
        expect(segments[0].id).toBe(testSegment.id);
      });
    });

    describe('updateSegment', () => {
      it('should update a segment', () => {
        const segmentId = useConfigStore.getState().config.blocks[0].segments[0].id;
        useConfigStore.getState().updateSegment(testBlockId, segmentId, { template: 'Updated' });

        const segment = useConfigStore.getState().config.blocks[0].segments.find((s) => s.id === segmentId);
        expect(segment?.template).toBe('Updated');
      });
    });

    describe('removeSegment', () => {
      it('should remove a segment', () => {
        const segments = useConfigStore.getState().config.blocks[0].segments;
        const segmentToRemove = segments[0].id;
        const initialLength = segments.length;

        useConfigStore.getState().removeSegment(testBlockId, segmentToRemove);

        expect(useConfigStore.getState().config.blocks[0].segments).toHaveLength(initialLength - 1);
        expect(
          useConfigStore.getState().config.blocks[0].segments.find((s) => s.id === segmentToRemove)
        ).toBeUndefined();
      });

      it('should clear selection if removed segment was selected', () => {
        const segmentId = useConfigStore.getState().config.blocks[0].segments[0].id;
        useConfigStore.getState().selectSegment(segmentId);

        useConfigStore.getState().removeSegment(testBlockId, segmentId);

        expect(useConfigStore.getState().selectedSegmentId).toBeNull();
      });
    });

    describe('moveSegment', () => {
      it('should move segment within same block', () => {
        useConfigStore.getState().addSegment(testBlockId, testSegment);
        const segments = useConfigStore.getState().config.blocks[0].segments;
        const firstId = segments[0].id;

        useConfigStore.getState().moveSegment(testBlockId, testBlockId, 0, 1);

        const movedSegments = useConfigStore.getState().config.blocks[0].segments;
        expect(movedSegments[1].id).toBe(firstId);
      });

      it('should move segment between blocks', () => {
        useConfigStore.getState().addBlock();
        const blocks = useConfigStore.getState().config.blocks;
        const fromBlockId = blocks[0].id;
        const toBlockId = blocks[1].id;
        const segmentId = blocks[0].segments[0].id;

        useConfigStore.getState().moveSegment(fromBlockId, toBlockId, 0, 0);

        expect(
          useConfigStore.getState().config.blocks[0].segments.find((s) => s.id === segmentId)
        ).toBeUndefined();
        expect(useConfigStore.getState().config.blocks[1].segments[0].id).toBe(segmentId);
      });
    });

    describe('duplicateSegment', () => {
      it('should duplicate a segment', () => {
        const segmentId = useConfigStore.getState().config.blocks[0].segments[0].id;
        const initialLength = useConfigStore.getState().config.blocks[0].segments.length;

        useConfigStore.getState().duplicateSegment(testBlockId, segmentId);

        const segments = useConfigStore.getState().config.blocks[0].segments;
        expect(segments).toHaveLength(initialLength + 1);
        // Duplicated segment should be right after the original
        expect(segments[1].type).toBe(segments[0].type);
        expect(segments[1].id).not.toBe(segments[0].id);
      });
    });
  });

  describe('palette actions', () => {
    describe('setPalette', () => {
      it('should set the palette', () => {
        const newPalette = { primary: '#ff0000', secondary: '#00ff00' };
        useConfigStore.getState().setPalette(newPalette);

        expect(useConfigStore.getState().config.palette).toEqual(newPalette);
      });

      it('should clear palette when empty object passed', () => {
        useConfigStore.getState().setPalette({});

        expect(useConfigStore.getState().config.palette).toBeUndefined();
      });
    });

    describe('setPaletteColor', () => {
      it('should set a palette color', () => {
        useConfigStore.getState().setPaletteColor('newColor', '#123456');

        expect(useConfigStore.getState().config.palette?.['newColor']).toBe('#123456');
      });
    });

    describe('removePaletteColor', () => {
      it('should remove a palette color', () => {
        useConfigStore.getState().setPaletteColor('toRemove', '#123456');
        useConfigStore.getState().removePaletteColor('toRemove');

        expect(useConfigStore.getState().config.palette?.['toRemove']).toBeUndefined();
      });
    });

    describe('setPalettesListEntry', () => {
      it('should add a palette variant', () => {
        useConfigStore.getState().setPalettesListEntry('dark', { primary: '#111' });

        expect(useConfigStore.getState().config.palettes?.list?.['dark']).toEqual({ primary: '#111' });
      });
    });

    describe('removePalettesListEntry', () => {
      it('should remove a palette variant', () => {
        useConfigStore.getState().setPalettesListEntry('dark', { primary: '#111' });
        useConfigStore.getState().setPalettesListEntry('light', { primary: '#eee' });
        useConfigStore.getState().removePalettesListEntry('dark');

        expect(useConfigStore.getState().config.palettes?.list?.['dark']).toBeUndefined();
        expect(useConfigStore.getState().config.palettes?.list?.['light']).toBeDefined();
      });

      it('should reset preview palette name if current variant is removed', () => {
        useConfigStore.getState().setPalettesListEntry('dark', { primary: '#111' });
        useConfigStore.getState().setPreviewPaletteName('dark');
        useConfigStore.getState().removePalettesListEntry('dark');

        expect(useConfigStore.getState().previewPaletteName).toBeUndefined();
      });
    });
  });

  describe('tooltip actions', () => {
    describe('addTooltip', () => {
      it('should add a tooltip with defaults', () => {
        useConfigStore.getState().addTooltip();

        const tooltips = useConfigStore.getState().config.tooltips;
        expect(tooltips).toHaveLength(1);
        expect(tooltips?.[0].type).toBe('git');
        expect(tooltips?.[0].style).toBe('plain');
        expect(tooltips?.[0].tips).toEqual(['command']);
      });

      it('should add a tooltip with custom properties', () => {
        useConfigStore.getState().addTooltip({ type: 'text', tips: ['npm'] });

        const tooltips = useConfigStore.getState().config.tooltips;
        expect(tooltips?.[0].type).toBe('text');
        expect(tooltips?.[0].tips).toEqual(['npm']);
      });

      it('should select the new tooltip', () => {
        useConfigStore.getState().addTooltip();

        const tooltipId = useConfigStore.getState().config.tooltips?.[0].id;
        expect(useConfigStore.getState().selectedTooltipId).toBe(tooltipId);
      });
    });

    describe('updateTooltip', () => {
      it('should update a tooltip', () => {
        useConfigStore.getState().addTooltip();
        const tooltipId = useConfigStore.getState().config.tooltips?.[0].id as string;

        useConfigStore.getState().updateTooltip(tooltipId, { template: 'Updated' });

        expect(useConfigStore.getState().config.tooltips?.[0].template).toBe('Updated');
      });
    });

    describe('removeTooltip', () => {
      it('should remove a tooltip', () => {
        useConfigStore.getState().addTooltip();
        useConfigStore.getState().addTooltip();
        const tooltipId = useConfigStore.getState().config.tooltips?.[0].id as string;

        useConfigStore.getState().removeTooltip(tooltipId);

        expect(useConfigStore.getState().config.tooltips).toHaveLength(1);
      });

      it('should clear tooltip array when last tooltip removed', () => {
        useConfigStore.getState().addTooltip();
        const tooltipId = useConfigStore.getState().config.tooltips?.[0].id as string;

        useConfigStore.getState().removeTooltip(tooltipId);

        expect(useConfigStore.getState().config.tooltips).toBeUndefined();
      });
    });

    describe('duplicateTooltip', () => {
      it('should duplicate a tooltip', () => {
        useConfigStore.getState().addTooltip({ tips: ['git'] });
        const tooltipId = useConfigStore.getState().config.tooltips?.[0].id as string;

        useConfigStore.getState().duplicateTooltip(tooltipId);

        const tooltips = useConfigStore.getState().config.tooltips;
        expect(tooltips).toHaveLength(2);
        expect(tooltips?.[0].tips).toEqual(['git']);
        expect(tooltips?.[1].tips).toEqual(['git']);
        expect(tooltips?.[0].id).not.toBe(tooltips?.[1].id);
      });
    });

    describe('reorderTooltips', () => {
      it('should reorder tooltips', () => {
        useConfigStore.getState().addTooltip({ tips: ['first'] });
        useConfigStore.getState().addTooltip({ tips: ['second'] });
        const firstId = useConfigStore.getState().config.tooltips?.[0].id;

        useConfigStore.getState().reorderTooltips(0, 1);

        expect(useConfigStore.getState().config.tooltips?.[1].id).toBe(firstId);
        expect(useConfigStore.getState().config.tooltips?.[0].tips).toEqual(['second']);
      });
    });
  });

  describe('extra prompt actions', () => {
    describe('setExtraPrompt', () => {
      it('should set an extra prompt', () => {
        useConfigStore.getState().setExtraPrompt('transient_prompt', { template: '> ' });

        expect(useConfigStore.getState().config.transient_prompt).toEqual({ template: '> ' });
      });

      it('should clear an extra prompt', () => {
        useConfigStore.getState().setExtraPrompt('transient_prompt', { template: '> ' });
        useConfigStore.getState().setExtraPrompt('transient_prompt', undefined);

        expect(useConfigStore.getState().config.transient_prompt).toBeUndefined();
      });
    });

    describe('updateExtraPrompt', () => {
      it('should update an extra prompt', () => {
        useConfigStore.getState().setExtraPrompt('transient_prompt', { template: '> ' });
        useConfigStore.getState().updateExtraPrompt('transient_prompt', { foreground: '#fff' });

        expect(useConfigStore.getState().config.transient_prompt?.foreground).toBe('#fff');
        expect(useConfigStore.getState().config.transient_prompt?.template).toBe('> ');
      });

      it('should create a new prompt if none exists', () => {
        useConfigStore.getState().updateExtraPrompt('secondary_prompt', { template: '>> ' });

        expect(useConfigStore.getState().config.secondary_prompt?.template).toBe('>> ');
      });
    });
  });

  describe('export format', () => {
    it('should set export format', () => {
      useConfigStore.getState().setExportFormat('yaml');
      expect(useConfigStore.getState().exportFormat).toBe('yaml');

      useConfigStore.getState().setExportFormat('toml');
      expect(useConfigStore.getState().exportFormat).toBe('toml');
    });
  });

  describe('preview settings', () => {
    it('should set preview background', () => {
      useConfigStore.getState().setPreviewBackground('light');
      expect(useConfigStore.getState().previewBackground).toBe('light');

      useConfigStore.getState().setPreviewBackground('dark');
      expect(useConfigStore.getState().previewBackground).toBe('dark');
    });
  });
});

describe('helper functions', () => {
  beforeEach(() => {
    useConfigStore.getState().resetConfig();
  });

  describe('findBlockForSegment', () => {
    it('should find the block containing a segment', () => {
      const config = useConfigStore.getState().config;
      const segmentId = config.blocks[0].segments[0].id;

      const block = findBlockForSegment(config, segmentId);

      expect(block).toBeDefined();
      expect(block?.id).toBe(config.blocks[0].id);
    });

    it('should return undefined for non-existent segment', () => {
      const config = useConfigStore.getState().config;

      const block = findBlockForSegment(config, 'non-existent');

      expect(block).toBeUndefined();
    });
  });

  describe('getSelectedSegment', () => {
    it('should return the selected segment', () => {
      const config = useConfigStore.getState().config;
      const segmentId = config.blocks[0].segments[0].id;

      const segment = getSelectedSegment(config, segmentId);

      expect(segment).toBeDefined();
      expect(segment?.id).toBe(segmentId);
    });

    it('should return undefined for null selection', () => {
      const config = useConfigStore.getState().config;

      const segment = getSelectedSegment(config, null);

      expect(segment).toBeUndefined();
    });

    it('should return undefined for non-existent segment', () => {
      const config = useConfigStore.getState().config;

      const segment = getSelectedSegment(config, 'non-existent');

      expect(segment).toBeUndefined();
    });
  });
});
