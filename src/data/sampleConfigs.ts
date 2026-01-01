import type { OhMyPoshConfig } from '../types/ohmyposh';
import { generateId } from '../store/configStore';

export interface SampleConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: Omit<OhMyPoshConfig, 'blocks'> & {
    blocks: Array<{
      type: 'prompt' | 'rprompt';
      alignment?: 'left' | 'right';
      newline?: boolean;
      segments: Array<{
        type: string;
        style: string;
        [key: string]: unknown;
      }>;
    }>;
  };
}

export const sampleConfigs: SampleConfig[] = [
  {
    id: 'developer',
    name: 'Developer Pro',
    description: 'Complete setup for software developers with Git, language versions, and execution time',
    icon: 'Code2',
    config: {
      $schema: 'https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json',
      version: 2,
      final_space: true,
      blocks: [
        {
          type: 'prompt',
          alignment: 'left',
          segments: [
            {
              type: 'session',
              style: 'diamond',
              foreground: '#ffffff',
              background: '#c386f1',
              leading_diamond: '\ue0b6',
              trailing_diamond: '\ue0b0',
              template: ' {{ .UserName }} ',
            },
            {
              type: 'path',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#61AFEF',
              template: ' \uf07c {{ .Path }} ',
              options: {
                style: 'folder',
                max_depth: 3,
              },
            },
            {
              type: 'git',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#95ffa4',
              foreground_templates: [
                '{{ if or (.Working.Changed) (.Staging.Changed) }}#000000{{ end }}',
                '{{ if and (gt .Ahead 0) (gt .Behind 0) }}#ffffff{{ end }}',
                '{{ if gt .Ahead 0 }}#ffffff{{ end }}',
              ],
              background_templates: [
                '{{ if or (.Working.Changed) (.Staging.Changed) }}#ffeb95{{ end }}',
                '{{ if and (gt .Ahead 0) (gt .Behind 0) }}#f26d50{{ end }}',
                '{{ if gt .Ahead 0 }}#89d1dc{{ end }}',
              ],
              template: ' {{ .UpstreamIcon }}{{ .HEAD }}{{if .BranchStatus }} {{ .BranchStatus }}{{ end }}{{ if .Working.Changed }} \uf044 {{ .Working.String }}{{ end }}{{ if and (.Working.Changed) (.Staging.Changed) }} |{{ end }}{{ if .Staging.Changed }} \uf046 {{ .Staging.String }}{{ end }} ',
              options: {
                fetch_status: true,
                fetch_upstream_icon: true,
              },
            },
            {
              type: 'node',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#6CA35E',
              template: ' \uf898 {{ .Full }} ',
            },
            {
              type: 'python',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#111111',
              background: '#FFDE57',
              template: ' \ue235 {{ if .Venv }}{{ .Venv }} {{ end }}{{ .Full }} ',
            },
            {
              type: 'go',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#111111',
              background: '#00ADD8',
              template: ' \ue626 {{ .Full }} ',
            },
            {
              type: 'rust',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#99908a',
              template: ' \ue7a8 {{ .Full }} ',
            },
          ],
        },
        {
          type: 'prompt',
          alignment: 'right',
          segments: [
            {
              type: 'executiontime',
              style: 'diamond',
              foreground: '#ffffff',
              background: '#d62976',
              leading_diamond: '\ue0b2',
              trailing_diamond: '\ue0b4',
              template: ' \uf252 {{ .FormattedMs }} ',
              options: {
                threshold: 500,
              },
            },
          ],
        },
        {
          type: 'prompt',
          alignment: 'left',
          newline: true,
          segments: [
            {
              type: 'status',
              style: 'plain',
              foreground: '#e0f8ff',
              foreground_templates: ['{{ if gt .Code 0 }}#ef5350{{ end }}'],
              template: '❯ ',
              options: {
                always_enabled: true,
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: 'streamer',
    name: 'Streamer Setup',
    description: 'Clean and colorful prompt perfect for streaming with music and time info',
    icon: 'Video',
    config: {
      $schema: 'https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json',
      version: 2,
      final_space: true,
      blocks: [
        {
          type: 'prompt',
          alignment: 'left',
          segments: [
            {
              type: 'time',
              style: 'diamond',
              foreground: '#ffffff',
              background: '#ff6b6b',
              leading_diamond: '\ue0b6',
              trailing_diamond: '\ue0b0',
              template: ' \uf017 {{ .CurrentDate | date "15:04" }} ',
            },
            {
              type: 'path',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#4ecdc4',
              template: ' \uf07c {{ .Path }} ',
              options: {
                style: 'folder',
                max_depth: 2,
              },
            },
            {
              type: 'git',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#95e1d3',
              template: ' \ue725 {{ .HEAD }} ',
            },
          ],
        },
        {
          type: 'prompt',
          alignment: 'right',
          segments: [
            {
              type: 'spotify',
              style: 'diamond',
              foreground: '#ffffff',
              background: '#1DB954',
              leading_diamond: '\ue0b2',
              trailing_diamond: '\ue0b4',
              template: ' \uf1bc {{ if ne .Status "stopped" }}{{ .Artist }} - {{ .Track }}{{ end }} ',
              options: {
                playing_icon: '\uf04b ',
                paused_icon: '\uf04c ',
                stopped_icon: '\uf04d ',
              },
            },
          ],
        },
        {
          type: 'prompt',
          alignment: 'left',
          newline: true,
          segments: [
            {
              type: 'text',
              style: 'plain',
              foreground: '#e4f9f5',
              template: '➜ ',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'minimal',
    name: 'Minimal Dev',
    description: 'Simple and fast prompt with just the essentials',
    icon: 'Zap',
    config: {
      $schema: 'https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json',
      version: 2,
      final_space: true,
      blocks: [
        {
          type: 'prompt',
          alignment: 'left',
          segments: [
            {
              type: 'path',
              style: 'plain',
              foreground: '#26C6DA',
              template: '{{ .Path }} ',
              options: {
                style: 'folder',
              },
            },
            {
              type: 'git',
              style: 'plain',
              foreground: '#B388FF',
              template: 'on \ue725 {{ .HEAD }} ',
            },
            {
              type: 'status',
              style: 'plain',
              foreground: '#ffffff',
              foreground_templates: ['{{ if gt .Code 0 }}#FF5252{{ end }}'],
              template: '{{ if gt .Code 0 }}✗{{ else }}✓{{ end }} ',
              options: {
                always_enabled: true,
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: 'cloud-engineer',
    name: 'Cloud Engineer',
    description: 'Focused on cloud services with AWS, Azure, Kubernetes, and Docker info',
    icon: 'Cloud',
    config: {
      $schema: 'https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json',
      version: 2,
      final_space: true,
      blocks: [
        {
          type: 'prompt',
          alignment: 'left',
          segments: [
            {
              type: 'os',
              style: 'diamond',
              foreground: '#ffffff',
              background: '#003544',
              leading_diamond: '\ue0b6',
              trailing_diamond: '\ue0b0',
              template: ' {{ .Icon }} ',
            },
            {
              type: 'path',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#0077b6',
              template: ' \uf07c {{ .Path }} ',
              options: {
                style: 'folder',
                max_depth: 3,
              },
            },
            {
              type: 'git',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#00b4d8',
              template: ' \ue725 {{ .HEAD }} ',
            },
            {
              type: 'aws',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#FF9900',
              template: ' \uf270 {{ .Profile }}{{ if .Region }}@{{ .Region }}{{ end }} ',
            },
            {
              type: 'kubectl',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#326CE5',
              template: ' \ufd31 {{ .Context }}{{ if .Namespace }}::{{ .Namespace }}{{ end }} ',
            },
            {
              type: 'docker',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#2496ED',
              template: ' \uf308 {{ .Context }} ',
            },
          ],
        },
        {
          type: 'prompt',
          alignment: 'left',
          newline: true,
          segments: [
            {
              type: 'status',
              style: 'plain',
              foreground: '#00d9ff',
              foreground_templates: ['{{ if gt .Code 0 }}#ff6b9d{{ end }}'],
              template: '❯ ',
              options: {
                always_enabled: true,
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: 'full-stack',
    name: 'Full Stack',
    description: 'Comprehensive setup for full-stack developers with frontend and backend tools',
    icon: 'Rocket',
    config: {
      $schema: 'https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json',
      version: 2,
      final_space: true,
      blocks: [
        {
          type: 'prompt',
          alignment: 'left',
          segments: [
            {
              type: 'path',
              style: 'diamond',
              foreground: '#ffffff',
              background: '#ff8a65',
              leading_diamond: '\ue0b6',
              trailing_diamond: '\ue0b0',
              template: ' {{ .Path }} ',
              options: {
                style: 'folder',
                max_depth: 3,
              },
            },
            {
              type: 'git',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#ffb74d',
              template: ' \ue725 {{ .HEAD }} ',
            },
            {
              type: 'node',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#68a063',
              template: ' \uf898 {{ .Full }} ',
            },
            {
              type: 'react',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#61dafb',
              template: ' \ue7ba {{ .Full }} ',
            },
            {
              type: 'python',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#111111',
              background: '#ffde57',
              template: ' \ue235 {{ .Full }} ',
            },
            {
              type: 'dotnet',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#512bd4',
              template: ' \ue77f {{ .Full }} ',
            },
            {
              type: 'docker',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#0db7ed',
              template: ' \uf308 ',
            },
          ],
        },
        {
          type: 'prompt',
          alignment: 'right',
          segments: [
            {
              type: 'executiontime',
              style: 'diamond',
              foreground: '#ffffff',
              background: '#8b5cf6',
              leading_diamond: '\ue0b2',
              trailing_diamond: '\ue0b4',
              template: ' \uf252 {{ .FormattedMs }} ',
              options: {
                threshold: 500,
              },
            },
          ],
        },
        {
          type: 'prompt',
          alignment: 'left',
          newline: true,
          segments: [
            {
              type: 'status',
              style: 'plain',
              foreground: '#e0f8ff',
              foreground_templates: ['{{ if gt .Code 0 }}#ff5370{{ end }}'],
              template: '❯ ',
              options: {
                always_enabled: true,
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    description: 'Optimized for data science work with Python, R, and Jupyter',
    icon: 'BarChart3',
    config: {
      $schema: 'https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json',
      version: 2,
      final_space: true,
      blocks: [
        {
          type: 'prompt',
          alignment: 'left',
          segments: [
            {
              type: 'session',
              style: 'diamond',
              foreground: '#ffffff',
              background: '#29315a',
              leading_diamond: '\ue0b6',
              trailing_diamond: '\ue0b0',
              template: ' {{ .UserName }} ',
            },
            {
              type: 'path',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#3a86ff',
              template: ' \uf07c {{ .Path }} ',
              options: {
                style: 'folder',
                max_depth: 2,
              },
            },
            {
              type: 'git',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#8338ec',
              template: ' \ue725 {{ .HEAD }} ',
            },
            {
              type: 'python',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#111111',
              background: '#ffbe0b',
              template: ' \ue235 {{ if .Venv }}({{ .Venv }}) {{ end }}{{ .Full }} ',
            },
            {
              type: 'r',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#2a7fff',
              template: ' \ue67c {{ .Full }} ',
            },
            {
              type: 'julia',
              style: 'powerline',
              powerline_symbol: '\ue0b0',
              foreground: '#ffffff',
              background: '#9558b2',
              template: ' \ue624 {{ .Full }} ',
            },
          ],
        },
        {
          type: 'prompt',
          alignment: 'right',
          segments: [
            {
              type: 'time',
              style: 'diamond',
              foreground: '#ffffff',
              background: '#fb5607',
              leading_diamond: '\ue0b2',
              trailing_diamond: '\ue0b4',
              template: ' \uf017 {{ .CurrentDate | date "15:04:05" }} ',
            },
          ],
        },
        {
          type: 'prompt',
          alignment: 'left',
          newline: true,
          segments: [
            {
              type: 'text',
              style: 'plain',
              foreground: '#06d6a0',
              template: '$ ',
            },
          ],
        },
      ],
    },
  },
];

// Helper function to convert sample config to runtime config with unique IDs
export function loadSampleConfig(sampleId: string): OhMyPoshConfig | null {
  const sample = sampleConfigs.find((s) => s.id === sampleId);
  if (!sample) return null;

  return {
    ...sample.config,
    blocks: sample.config.blocks.map((block) => ({
      ...block,
      id: generateId(),
      segments: block.segments.map((segment) => ({
        ...segment,
        id: generateId(),
      })),
    })),
  } as OhMyPoshConfig;
}
