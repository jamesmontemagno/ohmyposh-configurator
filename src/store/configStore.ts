import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Block, Segment, OhMyPoshConfig, ExportFormat } from '../types/ohmyposh';

// Generate unique IDs
let idCounter = 0;
export const generateId = (): string => `${Date.now()}-${++idCounter}`;

interface ConfigState {
  config: OhMyPoshConfig;
  selectedBlockId: string | null;
  selectedSegmentId: string | null;
  exportFormat: ExportFormat;
  previewBackground: 'dark' | 'light';

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

  // Export
  setExportFormat: (format: ExportFormat) => void;

  // Preview
  setPreviewBackground: (bg: 'dark' | 'light') => void;
}

const defaultConfig: OhMyPoshConfig = {
  $schema: 'https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json',
  version: 2,
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
          template: ' {{ .Path }} ',
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
          template: ' {{ .HEAD }}{{ if .BranchStatus }} {{ .BranchStatus }}{{ end }} ',
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
      exportFormat: 'json',
      previewBackground: 'dark',

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

      selectBlock: (blockId) => set({ selectedBlockId: blockId }),

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

      selectSegment: (segmentId) => set({ selectedSegmentId: segmentId }),

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
