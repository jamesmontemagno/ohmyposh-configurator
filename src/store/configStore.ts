import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Block, Segment, OhMyPoshConfig, ExportFormat, ExtraPrompt, ExtraPromptType, Tooltip } from '../types/ohmyposh';

// Generate unique IDs
let idCounter = 0;
export const generateId = (): string => `${Date.now()}-${++idCounter}`;

interface ConfigState {
  config: OhMyPoshConfig;
  selectedBlockId: string | null;
  selectedSegmentId: string | null;
  selectedTooltipId: string | null;
  exportFormat: ExportFormat;
  previewBackground: 'dark' | 'light';
  previewPaletteName: string | undefined;

  // Actions
  setConfig: (config: OhMyPoshConfig) => void;
  resetConfig: () => void;
  updateGlobalConfig: (updates: Partial<OhMyPoshConfig>) => void;

  // Block actions
  addBlock: (block?: Partial<Block>) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  removeBlock: (blockId: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  selectBlock: (blockId: string | null) => void;

  // Segment actions
  addSegment: (blockId: string, segment: Segment, index?: number) => void;
  updateSegment: (blockId: string, segmentId: string, updates: Partial<Segment>) => void;
  removeSegment: (blockId: string, segmentId: string) => void;
  moveSegment: (
    fromBlockId: string,
    toBlockId: string,
    fromIndex: number,
    toIndex: number
  ) => void;
  selectSegment: (segmentId: string | null) => void;
  duplicateSegment: (blockId: string, segmentId: string) => void;

  // Palette actions
  setPalette: (palette: Record<string, string>) => void;
  setPaletteColor: (key: string, value: string) => void;
  removePaletteColor: (key: string) => void;
  setPalettes: (palettes: OhMyPoshConfig['palettes']) => void;
  setPalettesTemplate: (template: string) => void;
  setPalettesListEntry: (name: string, palette: Record<string, string>) => void;
  removePalettesListEntry: (name: string) => void;
  setPreviewPaletteName: (name: string | undefined) => void;

  // Extra prompt actions
  setExtraPrompt: (type: ExtraPromptType, prompt: ExtraPrompt | undefined) => void;
  updateExtraPrompt: (type: ExtraPromptType, updates: Partial<ExtraPrompt>) => void;

  // Tooltip actions
  addTooltip: (tooltip?: Partial<Tooltip>) => void;
  updateTooltip: (tooltipId: string, updates: Partial<Tooltip>) => void;
  removeTooltip: (tooltipId: string) => void;
  selectTooltip: (tooltipId: string | null) => void;
  duplicateTooltip: (tooltipId: string) => void;
  reorderTooltips: (fromIndex: number, toIndex: number) => void;

  // Export
  setExportFormat: (format: ExportFormat) => void;

  // Preview
  setPreviewBackground: (bg: 'dark' | 'light') => void;
}

const defaultConfig: OhMyPoshConfig = {
  $schema: 'https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json',
  version: 4,
  final_space: true,
  blocks: [
    {
      id: generateId(),
      type: 'prompt',
      alignment: 'left',
      segments: [
        {
          id: generateId(),
          type: 'path',
          style: 'powerline',
          powerline_symbol: '\ue0b0',
          foreground: '#ffffff',
          background: '#61AFEF',
          template: ' \uf07c {{ .Path }} ',
          options: {
            style: 'folder',
          },
        },
        {
          id: generateId(),
          type: 'git',
          style: 'powerline',
          powerline_symbol: '\ue0b0',
          foreground: '#ffffff',
          background: '#98C379',
          template: ' \ue725 {{ .HEAD }}{{ if .BranchStatus }} {{ .BranchStatus }}{{ end }} ',
        },
      ],
    },
  ],
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      config: defaultConfig,
      selectedBlockId: null,
      selectedSegmentId: null,
      selectedTooltipId: null,
      exportFormat: 'json',
      previewBackground: 'dark',
      previewPaletteName: undefined,

      setConfig: (config) => set({ config }),

      resetConfig: () =>
        set({
          config: {
            ...defaultConfig,
            blocks: defaultConfig.blocks.map((block) => ({
              ...block,
              id: generateId(),
              segments: block.segments.map((seg) => ({
                ...seg,
                id: generateId(),
              })),
            })),
          },
          selectedBlockId: null,
          selectedSegmentId: null,
          selectedTooltipId: null,
          previewPaletteName: undefined,
        }),

      updateGlobalConfig: (updates) =>
        set((state) => ({
          config: {
            ...state.config,
            ...updates,
          },
        })),

      addBlock: (block) =>
        set((state) => ({
          config: {
            ...state.config,
            blocks: [
              ...state.config.blocks,
              {
                id: generateId(),
                type: 'prompt',
                alignment: 'left',
                segments: [],
                ...block,
              },
            ],
          },
        })),

      updateBlock: (blockId, updates) =>
        set((state) => ({
          config: {
            ...state.config,
            blocks: state.config.blocks.map((block) =>
              block.id === blockId ? { ...block, ...updates } : block
            ),
          },
        })),

      removeBlock: (blockId) =>
        set((state) => ({
          config: {
            ...state.config,
            blocks: state.config.blocks.filter((block) => block.id !== blockId),
          },
          selectedBlockId:
            state.selectedBlockId === blockId ? null : state.selectedBlockId,
        })),

      reorderBlocks: (fromIndex, toIndex) =>
        set((state) => {
          const blocks = [...state.config.blocks];
          const [removed] = blocks.splice(fromIndex, 1);
          blocks.splice(toIndex, 0, removed);
          return { config: { ...state.config, blocks } };
        }),

      selectBlock: (blockId) => set({ selectedBlockId: blockId, selectedSegmentId: null, selectedTooltipId: null }),

      addSegment: (blockId, segment, index) =>
        set((state) => ({
          config: {
            ...state.config,
            blocks: state.config.blocks.map((block) => {
              if (block.id !== blockId) return block;
              const segments = [...block.segments];
              if (index !== undefined) {
                segments.splice(index, 0, segment);
              } else {
                segments.push(segment);
              }
              return { ...block, segments };
            }),
          },
        })),

      updateSegment: (blockId, segmentId, updates) =>
        set((state) => ({
          config: {
            ...state.config,
            blocks: state.config.blocks.map((block) => {
              if (block.id !== blockId) return block;
              return {
                ...block,
                segments: block.segments.map((seg) =>
                  seg.id === segmentId ? { ...seg, ...updates } : seg
                ),
              };
            }),
          },
        })),

      removeSegment: (blockId, segmentId) =>
        set((state) => ({
          config: {
            ...state.config,
            blocks: state.config.blocks.map((block) => {
              if (block.id !== blockId) return block;
              return {
                ...block,
                segments: block.segments.filter((seg) => seg.id !== segmentId),
              };
            }),
          },
          selectedSegmentId:
            state.selectedSegmentId === segmentId ? null : state.selectedSegmentId,
        })),

      moveSegment: (fromBlockId, toBlockId, fromIndex, toIndex) =>
        set((state) => {
          const blocks = state.config.blocks.map((block) => ({
            ...block,
            segments: [...block.segments],
          }));

          const fromBlock = blocks.find((b) => b.id === fromBlockId);
          const toBlock = blocks.find((b) => b.id === toBlockId);

          if (!fromBlock || !toBlock) return state;

          const [segment] = fromBlock.segments.splice(fromIndex, 1);
          toBlock.segments.splice(toIndex, 0, segment);

          return { config: { ...state.config, blocks } };
        }),

      selectSegment: (segmentId) => set({ selectedSegmentId: segmentId, selectedTooltipId: null }),

      duplicateSegment: (blockId, segmentId) =>
        set((state) => {
          const block = state.config.blocks.find((b) => b.id === blockId);
          if (!block) return state;

          const segmentIndex = block.segments.findIndex((s) => s.id === segmentId);
          if (segmentIndex === -1) return state;

          const segment = block.segments[segmentIndex];
          const newSegment = {
            ...segment,
            id: generateId(),
          };

          return {
            config: {
              ...state.config,
              blocks: state.config.blocks.map((b) => {
                if (b.id !== blockId) return b;
                const segments = [...b.segments];
                segments.splice(segmentIndex + 1, 0, newSegment);
                return { ...b, segments };
              }),
            },
          };
        }),

      // Palette actions
      setPalette: (palette) =>
        set((state) => ({
          config: {
            ...state.config,
            palette: Object.keys(palette).length > 0 ? palette : undefined,
          },
        })),

      setPaletteColor: (key, value) =>
        set((state) => ({
          config: {
            ...state.config,
            palette: {
              ...(state.config.palette || {}),
              [key]: value,
            },
          },
        })),

      removePaletteColor: (key) =>
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [key]: _omitted, ...rest } = state.config.palette || {};
          return {
            config: {
              ...state.config,
              palette: Object.keys(rest).length > 0 ? rest : undefined,
            },
          };
        }),

      setPalettes: (palettes) =>
        set((state) => ({
          config: {
            ...state.config,
            palettes: palettes,
          },
        })),

      setPalettesTemplate: (template) =>
        set((state) => ({
          config: {
            ...state.config,
            palettes: {
              ...state.config.palettes,
              template: template || undefined,
              list: state.config.palettes?.list,
            },
          },
        })),

      setPalettesListEntry: (name, palette) =>
        set((state) => ({
          config: {
            ...state.config,
            palettes: {
              ...state.config.palettes,
              template: state.config.palettes?.template,
              list: {
                ...(state.config.palettes?.list || {}),
                [name]: palette,
              },
            },
          },
        })),

      removePalettesListEntry: (name) =>
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [name]: _omitted, ...rest } = state.config.palettes?.list || {};
          const hasRemainingEntries = Object.keys(rest).length > 0;
          const hasTemplate = !!state.config.palettes?.template;
          
          return {
            config: {
              ...state.config,
              palettes: hasRemainingEntries || hasTemplate
                ? {
                    template: state.config.palettes?.template,
                    list: hasRemainingEntries ? rest : undefined,
                  }
                : undefined,
            },
            // Reset preview palette if the current one was removed
            previewPaletteName: state.previewPaletteName === name ? undefined : state.previewPaletteName,
          };
        }),

      setPreviewPaletteName: (name) => set({ previewPaletteName: name }),

      // Extra prompt actions
      setExtraPrompt: (type, prompt) =>
        set((state) => ({
          config: {
            ...state.config,
            [type]: prompt,
          },
        })),

      updateExtraPrompt: (type, updates) =>
        set((state) => {
          const currentPrompt = state.config[type];
          // If no current prompt exists, create new one from updates
          // Otherwise merge updates into existing prompt
          const newPrompt: ExtraPrompt = {
            ...currentPrompt,
            ...updates,
          };
          
          // Check if the resulting prompt is effectively empty
          const isEmptyPrompt = 
            !newPrompt.template &&
            !newPrompt.foreground &&
            !newPrompt.background &&
            !newPrompt.filler &&
            newPrompt.newline === undefined &&
            (!newPrompt.foreground_templates || newPrompt.foreground_templates.length === 0) &&
            (!newPrompt.background_templates || newPrompt.background_templates.length === 0);
          
          return {
            config: {
              ...state.config,
              [type]: isEmptyPrompt ? undefined : newPrompt,
            },
          };
        }),

      // Tooltip actions
      addTooltip: (partial) =>
        set((state) => {
          const newTooltip: Tooltip = {
            id: generateId(),
            type: 'git',
            style: 'plain',
            tips: ['command'],
            template: ' {{ .HEAD }} ',
            foreground: '#ffffff',
            background: '#193549',
            ...partial,
          };
          
          return {
            config: {
              ...state.config,
              tooltips: [...(state.config.tooltips ?? []), newTooltip],
            },
            selectedTooltipId: newTooltip.id,
            selectedBlockId: null,
            selectedSegmentId: null,
          };
        }),

      updateTooltip: (tooltipId, updates) =>
        set((state) => ({
          config: {
            ...state.config,
            tooltips: state.config.tooltips?.map((tooltip) =>
              tooltip.id === tooltipId ? { ...tooltip, ...updates } : tooltip
            ),
          },
        })),

      removeTooltip: (tooltipId) =>
        set((state) => {
          const filteredTooltips = state.config.tooltips?.filter((t) => t.id !== tooltipId);
          return {
            config: {
              ...state.config,
              tooltips: filteredTooltips && filteredTooltips.length > 0 ? filteredTooltips : undefined,
            },
            selectedTooltipId: state.selectedTooltipId === tooltipId ? null : state.selectedTooltipId,
          };
        }),

      selectTooltip: (tooltipId) =>
        set({
          selectedTooltipId: tooltipId,
          selectedBlockId: tooltipId ? null : null,
          selectedSegmentId: tooltipId ? null : null,
        }),

      duplicateTooltip: (tooltipId) =>
        set((state) => {
          const original = state.config.tooltips?.find((t) => t.id === tooltipId);
          if (!original) return state;
          
          const duplicate: Tooltip = {
            ...original,
            id: generateId(),
            tips: [...original.tips],
          };
          
          return {
            config: {
              ...state.config,
              tooltips: [...(state.config.tooltips ?? []), duplicate],
            },
            selectedTooltipId: duplicate.id,
            selectedBlockId: null,
            selectedSegmentId: null,
          };
        }),

      reorderTooltips: (fromIndex, toIndex) =>
        set((state) => {
          const tooltips = [...(state.config.tooltips ?? [])];
          const [removed] = tooltips.splice(fromIndex, 1);
          tooltips.splice(toIndex, 0, removed);
          
          return {
            config: { ...state.config, tooltips },
          };
        }),

      setExportFormat: (format) => set({ exportFormat: format }),

      setPreviewBackground: (bg) => set({ previewBackground: bg }),
    }),
    {
      name: 'ohmyposh-config',
      partialize: (state) => ({
        config: state.config,
        exportFormat: state.exportFormat,
        previewBackground: state.previewBackground,
      }),
    }
  )
);

// Helper to find which block contains a segment
export const findBlockForSegment = (
  config: OhMyPoshConfig,
  segmentId: string
): Block | undefined => {
  return config.blocks.find((block) =>
    block.segments.some((seg) => seg.id === segmentId)
  );
};

// Helper to get selected segment
export const getSelectedSegment = (
  config: OhMyPoshConfig,
  segmentId: string | null
): Segment | undefined => {
  if (!segmentId) return undefined;
  for (const block of config.blocks) {
    const segment = block.segments.find((s) => s.id === segmentId);
    if (segment) return segment;
  }
  return undefined;
};
