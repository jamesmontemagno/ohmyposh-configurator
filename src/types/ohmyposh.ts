// Oh My Posh Configuration Types
// Based on https://github.com/JanDeDobbeleer/oh-my-posh/blob/main/themes/schema.json

export type SegmentStyle = 'plain' | 'powerline' | 'diamond' | 'accordion';

export type BlockType = 'prompt' | 'rprompt';

export type BlockAlignment = 'left' | 'right';

export type SegmentType =
  | 'angular'
  | 'argocd'
  | 'aurelia'
  | 'aws'
  | 'az'
  | 'azd'
  | 'azfunc'
  | 'battery'
  | 'bazel'
  | 'brewfather'
  | 'buf'
  | 'bun'
  | 'carbonintensity'
  | 'cds'
  | 'cf'
  | 'cftarget'
  | 'claude'
  | 'clojure'
  | 'cmake'
  | 'copilot'
  | 'connection'
  | 'crystal'
  | 'dart'
  | 'deno'
  | 'docker'
  | 'dotnet'
  | 'elixir'
  | 'executiontime'
  | 'firebase'
  | 'flutter'
  | 'fortran'
  | 'fossil'
  | 'gcp'
  | 'git'
  | 'gitversion'
  | 'go'
  | 'haskell'
  | 'helm'
  | 'http'
  | 'ipify'
  | 'java'
  | 'jujutsu'
  | 'julia'
  | 'kotlin'
  | 'kubectl'
  | 'lastfm'
  | 'lua'
  | 'mercurial'
  | 'mojo'
  | 'mvn'
  | 'nbgv'
  | 'nightscout'
  | 'nim'
  | 'nix-shell'
  | 'node'
  | 'npm'
  | 'nx'
  | 'ocaml'
  | 'os'
  | 'owm'
  | 'path'
  | 'perl'
  | 'php'
  | 'plastic'
  | 'pnpm'
  | 'project'
  | 'pulumi'
  | 'python'
  | 'quasar'
  | 'r'
  | 'react'
  | 'root'
  | 'ruby'
  | 'rust'
  | 'sapling'
  | 'session'
  | 'shell'
  | 'sitecore'
  | 'spotify'
  | 'status'
  | 'strava'
  | 'svelte'
  | 'svn'
  | 'swift'
  | 'sysinfo'
  | 'talosctl'
  | 'tauri'
  | 'terraform'
  | 'text'
  | 'time'
  | 'ui5tooling'
  | 'umbraco'
  | 'unity'
  | 'upgrade'
  | 'v'
  | 'vala'
  | 'wakatime'
  | 'winreg'
  | 'withings'
  | 'xmake'
  | 'yarn'
  | 'ytm'
  | 'zig';

export interface Segment {
  id: string; // For drag-and-drop identification
  type: SegmentType;
  style: SegmentStyle;
  foreground?: string;
  foreground_templates?: string[];
  background?: string;
  background_templates?: string[];
  template?: string;
  templates_logic?: 'first_match' | 'join';
  powerline_symbol?: string;
  leading_diamond?: string;
  trailing_diamond?: string;
  invert_powerline?: boolean;
  leading_powerline_symbol?: string;
  min_width?: number;
  max_width?: number;
  interactive?: boolean;
  alias?: string;
  include_folders?: string[];
  exclude_folders?: string[];
  options?: Record<string, unknown>;
  cache?: {
    duration?: string;
    strategy?: 'folder' | 'session';
  };
}

export interface Block {
  id: string; // For drag-and-drop identification
  type: BlockType;
  alignment?: BlockAlignment;
  newline?: boolean;
  leading_diamond?: string;
  trailing_diamond?: string;
  overflow?: 'break' | 'hide';
  filler?: string;
  force?: boolean;
  index?: number;
  segments: Segment[];
}

export interface ExtraPrompt {
  template?: string;
  foreground?: string;
  foreground_templates?: string[];
  background?: string;
  background_templates?: string[];
  filler?: string;
  newline?: boolean;
}

export interface OhMyPoshConfig {
  $schema?: string;
  version?: number;
  final_space?: boolean;
  enable_cursor_positioning?: boolean;
  shell_integration?: boolean;
  pwd?: string;
  console_title_template?: string;
  terminal_background?: string;
  accent_color?: string;
  blocks: Block[];
  tooltips?: Array<Segment & { tips: string[] }>;
  transient_prompt?: ExtraPrompt;
  valid_line?: ExtraPrompt;
  error_line?: ExtraPrompt;
  secondary_prompt?: ExtraPrompt;
  debug_prompt?: ExtraPrompt;
  palette?: Record<string, string>;
  palettes?: {
    template?: string;
    list?: Record<string, Record<string, string>>;
  };
  cycle?: Array<{ foreground?: string; background?: string }>;
  var?: Record<string, unknown>;
  maps?: {
    user_name?: Record<string, string>;
    host_name?: Record<string, string>;
    shell_name?: Record<string, string>;
  };
}

// Export format types
export type ExportFormat = 'json' | 'yaml' | 'toml';

// Segment category for the picker
export type SegmentCategory =
  | 'system'
  | 'scm'
  | 'languages'
  | 'cloud'
  | 'cli'
  | 'web'
  | 'music'
  | 'health';

export interface SegmentMetadata {
  type: SegmentType;
  name: string;
  description: string;
  category: SegmentCategory;
  icon: string;
  defaultTemplate?: string;
  defaultOptions?: Record<string, unknown>;
  defaultBackground?: string;
  defaultForeground?: string;
}
