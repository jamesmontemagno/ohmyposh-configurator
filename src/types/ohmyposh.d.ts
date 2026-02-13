export type SegmentStyle = 'plain' | 'powerline' | 'diamond' | 'accordion';
export type BlockType = 'prompt' | 'rprompt';
export type BlockAlignment = 'left' | 'right';
export type SegmentType = 'angular' | 'argocd' | 'aurelia' | 'aws' | 'az' | 'azd' | 'azfunc' | 'battery' | 'bazel' | 'brewfather' | 'buf' | 'bun' | 'carbonintensity' | 'cds' | 'cf' | 'cftarget' | 'claude' | 'clojure' | 'cmake' | 'copilot' | 'connection' | 'crystal' | 'dart' | 'deno' | 'docker' | 'dotnet' | 'elixir' | 'executiontime' | 'firebase' | 'flutter' | 'fortran' | 'fossil' | 'gcp' | 'git' | 'gitversion' | 'go' | 'haskell' | 'helm' | 'http' | 'ipify' | 'java' | 'jujutsu' | 'julia' | 'kotlin' | 'kubectl' | 'lastfm' | 'lua' | 'mercurial' | 'mojo' | 'mvn' | 'nbgv' | 'nightscout' | 'nim' | 'nix-shell' | 'node' | 'npm' | 'nx' | 'ocaml' | 'os' | 'owm' | 'path' | 'perl' | 'php' | 'plastic' | 'pnpm' | 'project' | 'pulumi' | 'python' | 'quasar' | 'r' | 'react' | 'root' | 'ruby' | 'rust' | 'sapling' | 'session' | 'shell' | 'sitecore' | 'spotify' | 'status' | 'strava' | 'svelte' | 'svn' | 'swift' | 'sysinfo' | 'talosctl' | 'tauri' | 'terraform' | 'text' | 'time' | 'ui5tooling' | 'umbraco' | 'unity' | 'upgrade' | 'v' | 'vala' | 'wakatime' | 'winget' | 'winreg' | 'withings' | 'xmake' | 'yarn' | 'ytm' | 'zig';
export interface Segment {
    id: string;
    type: SegmentType;
    style: SegmentStyle;
    foreground?: string;
    foreground_templates?: string[];
    background?: string;
    background_templates?: string[];
    template?: string;
    templates?: string[];
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
    cache?: SegmentCache;
}
export interface Block {
    id: string;
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
export interface Tooltip extends Omit<Segment, 'id'> {
    id: string;
    tips: string[];
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
export type ExtraPromptType = 'transient_prompt' | 'secondary_prompt' | 'valid_line' | 'error_line' | 'debug_prompt';
export interface SegmentCache {
    duration?: string;
    strategy?: 'session' | 'folder';
}
export interface CycleSettings {
    duration?: string;
    foreground?: string;
    background?: string;
}
export interface UpgradeSettings {
    interval?: string;
    source?: 'cdn' | 'github';
    auto?: boolean;
    notice?: boolean;
}
export type ITermFeature = 'prompt_mark' | 'current_dir' | 'remote_host';
export interface OhMyPoshConfig {
    $schema?: string;
    version?: number;
    final_space?: boolean;
    enable_cursor_positioning?: boolean;
    shell_integration?: boolean;
    pwd?: 'osc99' | 'osc7' | 'osc51';
    patch_pwsh_bleed?: boolean;
    async?: boolean;
    console_title_template?: string;
    terminal_background?: string;
    accent_color?: string;
    blocks: Block[];
    tooltips?: Tooltip[];
    tooltips_action?: 'replace' | 'extend' | 'prepend';
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
    cycle?: CycleSettings[];
    var?: Record<string, unknown>;
    maps?: {
        user_name?: Record<string, string>;
        host_name?: Record<string, string>;
        shell_name?: Record<string, string>;
    };
    upgrade?: UpgradeSettings;
    iterm_features?: ITermFeature[];
    extends?: string;
}
export type ExportFormat = 'json' | 'yaml' | 'toml';
export type SegmentCategory = 'system' | 'scm' | 'languages' | 'cloud' | 'cli' | 'web' | 'music' | 'health';
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
    defaultCache?: {
        duration: string;
        strategy: 'session' | 'folder';
    };
    previewText?: string;
    properties?: SegmentProperty[];
    methods?: SegmentMethod[];
    options?: SegmentOption[];
}
export interface SegmentProperty {
    name: string;
    type: string;
    description: string;
}
export interface SegmentMethod {
    name: string;
    returnType: string;
    description: string;
}
export interface SegmentOption {
    name: string;
    type: string;
    default?: unknown;
    values?: string[];
    description: string;
}
export interface SavedConfig {
    id: string;
    name: string;
    description?: string;
    config: OhMyPoshConfig;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
}
export interface SavedConfigsBundle {
    version: number;
    exportedAt: string;
    configs: SavedConfig[];
}
//# sourceMappingURL=ohmyposh.d.ts.map