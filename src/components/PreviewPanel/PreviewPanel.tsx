import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useConfigStore } from '../../store/configStore';
import { useSegmentMetadata } from '../../hooks/useSegmentMetadata';
import type { Block, Segment, SegmentStyle } from '../../types/ohmyposh';
import { DynamicIcon } from '../DynamicIcon';

// Mock data for preview - comprehensive data based on segment properties
const mockData: Record<string, any> = {
  // Path segments
  Path: '~/dev/my-app',
  Folder: 'my-app',
  Parent: '~/dev/',
  Location: '~/dev/my-app',
  RootDir: false,
  StackCount: 0,
  Writable: true,
  
  // Session
  UserName: 'user',
  HostName: 'laptop',
  SSHSession: false,
  Root: false,
  
  // Git
  RepoName: 'my-app',
  HEAD: 'main',
  Ref: 'main',
  BranchStatus: '↑2',
  Behind: 0,
  Ahead: 2,
  UpstreamIcon: '',
  UpstreamGone: false,
  Working: { 
    Changed: false, 
    String: '',
    Modified: 0,
    Added: 0,
    Deleted: 0,
    Untracked: 0
  },
  Staging: { 
    Changed: false, 
    String: '',
    Modified: 0,
    Added: 0,
    Deleted: 0
  },
  StashCount: 0,
  Detached: false,
  Merge: false,
  Rebase: false,
  CherryPick: false,
  Revert: false,
  Commit: {
    Sha: 'abc1234',
    Author: 'Developer',
    Subject: 'Latest commit'
  },
  
  // Version properties (used by most language/CLI segments)
  Full: 'v1.2.3',
  Major: '1',
  Minor: '2',
  Patch: '3',
  Error: '',
  URL: '',
  
  // Language specific
  Venv: 'venv',
  PackageManagerIcon: '',
  PackageManagerName: 'npm',
  Mismatch: false,
  Expected: '',
  Unsupported: false,
  Prerelease: '',
  BuildMetadata: '',
  
  // Time
  CurrentDate: 'Monday at 2:45 PM',
  Format: '15:04:05',
  
  // Execution time
  FormattedMs: '127ms',
  Ms: 127,
  
  // Cloud - AWS
  Profile: 'default',
  Region: 'us-east-1',
  RegionAlias: 'use1',
  
  // Cloud - Azure
  Name: 'My Subscription',
  ID: 'sub-123',
  EnvironmentName: 'production',
  TenantID: 'tenant-456',
  User: { Name: 'user@domain.com', Type: 'user' },
  Origin: 'CLI',
  
  // Cloud - GCP
  Project: 'my-project',
  Account: 'user@example.com',
  ActiveConfig: 'default',
  
  // Cloud - Azure Functions
  DefaultEnvironment: 'dev',
  
  // Docker/Kubectl/Containers
  Context: 'default',
  Namespace: 'default',
  Cluster: 'production',
  
  // Cloud Foundry
  Org: 'myorg',
  Space: 'production',
  
  // Pulumi
  Stack: 'dev',
  
  // Terraform
  WorkspaceName: 'production',
  
  // Status
  Code: 0,
  String: '✓',
  
  // Battery
  State: { String: 'Charging' },
  Current: 50.5,
  Percentage: 85,
  Icon: '🔋',
  
  // OS
  WSL: false,
  
  // Shell
  Version: '7.3.0',
  
  // System Info
  PhysicalPercentUsed: 45.2,
  PhysicalTotalMemory: 16384,
  PhysicalAvailableMemory: 8192,
  SwapPercentUsed: 10.5,
  
  // Connection
  Type: 'wifi',
  
  // Project
  ProjectType: 'node',
  ProjectVersion: '1.2.3',
  Target: 'ES2020',
  
  // Upgrade
  UpgradeCurrent: '1.2.0',
  Latest: '1.3.0',
  
  // GitHub Copilot
  Premium: { 
    Used: 45,
    Limit: 100,
    Percent: { Gauge: '████░' },
    Remaining: { Gauge: '░░░░░' },
    Unlimited: false
  },
  Inline: {
    Used: 500,
    Limit: 1000,
    Percent: { Gauge: '█████' },
    Unlimited: false
  },
  Chat: {
    Used: 20,
    Limit: 50,
    Percent: { Gauge: '██░░░' },
    Unlimited: false
  },
  BillingCycleEnd: '2025-01-15',
  
  // Music segments
  Status: 'playing',
  Artist: 'Artist Name',
  Track: 'Song Title',
  MusicIcon: '🎵',
  Ago: '5m',
  
  // Health segments
  Sgv: 120,
  TrendIcon: '↗',
  Weight: 70.5,
  Steps: 8542,
  SleepHours: '7.5',
  
  // Web segments
  IP: '192.168.1.100',
  Body: { status: 'ok', data: 'response' },
  Weather: '☀️',
  Temperature: 72,
  UnitIcon: '°F',
  Value: 'RegistryValue',
  
  // Brewfather
  StatusIcon: '🍺',
  Recipe: { Name: 'IPA' },
  BatchName: 'Batch #42',
  MeasuredAbv: 6.5,
  
  // Carbon Intensity
  Actual: { Index: 'low' },
  Forecast: 150,
  
  // WakaTime
  CumulativeTotal: {
    Seconds: 12345,
    Text: '3h 25m'
  },
  
  // Special segments
  SessionID: 'session-123',
  Model: { DisplayName: 'Claude 3.5 Sonnet' },
  FormattedCost: '$0.15',
  TokenUsagePercent: { Gauge: '███░░' },
  
  // ArgoCD
  Server: 'argocd.example.com',
  
  // NBGV
  AssemblyVersion: '1.2.3.0',
  SimpleVersion: '1.2.3',
  
  // Nix Shell
  
  // Quasar
  Vite: { Version: '4.0.0', Dev: true },
  AppVite: { Version: '1.5.0', Dev: true },
  
  // Talosctl
  
  // Umbraco
  Modern: true,
  
  // Unity
  UnityVersion: '2023.1.0',
  CSharpVersion: '10.0',
  
  // WinGet
  UpdateCount: 5,
  Updates: [
    { Name: 'App1', ID: 'app1', Current: '1.0', Available: '1.1' }
  ],
  
  // Fossil
  Branch: 'trunk',
  
  // GitVersion
  
  // Jujutsu
  ChangeId: 'qpvuntsm',
  
  // Mercurial
  
  // Plastic SCM
  Selector: 'main@myrepo',
  PlasticBehind: false,
  MergePending: false,
  
  // Sapling
  Bookmark: 'main',
  Hash: 'abc123def456',
  ShortHash: 'abc123',
  Description: 'Latest commit',
  Author: 'Developer',
  When: '2h ago',
  Dir: '/home/user/repo',
  RelativeDir: 'src',
  New: false,
  
  // SVN
  BaseRev: 1234,
  Repo: 'svn://example.com/repo',
  
  // Sitecore
  EndpointName: 'Production',
  CmHost: 'cm.example.com',
  
  // SAP CDS
  HasDependency: true,
  
  // Nightscout
  DateString: '2h ago',
  Device: 'DexcomG6',
  
  // Strava
  Hours: 2,
  Duration: 3600,
  Distance: 10000,
  AverageWatts: 180,
  KudosCount: 15,
  
  // Firebase
  
  // Helm
};

// Default symbols
const DEFAULT_POWERLINE_SYMBOL = '\ue0b0';

// Parse inline color codes from Oh My Posh templates
// Format: <#hexcolor>text</> or </>text (to reset)
function parseInlineColors(text: string, defaultColor: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /<#([0-9a-fA-F]{6})>([^<]*)<\/>|<\/>/g;
  let lastIndex = 0;
  let match;
  let currentColor = defaultColor;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      parts.push(
        <span key={`text-${lastIndex}`} style={{ color: currentColor }}>
          {beforeText}
        </span>
      );
    }

    // Add colored text or handle color reset
    if (match[1]) {
      // Color code found
      currentColor = `#${match[1]}`;
      parts.push(
        <span key={`color-${match.index}`} style={{ color: currentColor }}>
          {match[2]}
        </span>
      );
    } else {
      // Reset to default color
      currentColor = defaultColor;
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${lastIndex}`} style={{ color: currentColor }}>
        {text.substring(lastIndex)}
      </span>
    );
  }

  return parts.length > 0 ? parts : [text];
}

function getPreviewText(segment: Segment, metadata?: { name: string; previewText?: string }): string {
  // First priority: use template if available (shows inline colors and symbols)
  if (segment.template) {
    // Replace template variables with mock data
    let result = segment.template;
    
    // Handle nested properties (any depth) like .Working.Changed or .Premium.Percent.Gauge
    result = result.replace(/\{\{\s*\.([.\w]+)\s*\}\}/g, (_match, path) => {
      const keys = path.split('.');
      let value: any = mockData;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return '';
        }
      }
      
      return value !== undefined ? String(value) : '';
    });
    
    // Handle "if not" conditions - {{ if not .Error }}
    result = result.replace(/\{\{\s*if\s+not\s+\.([.\w]+)\s*\}\}(.*?)(\{\{\s*end\s*\}\}|$)/gs, (_match, prop, content) => {
      const keys = prop.split('.');
      let value: any = mockData;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          value = undefined;
          break;
        }
      }
      
      // Show content if property is falsy
      return (!value) ? content : '';
    });
    
    // Handle conditional statements with else - {{ if .Error }}{{ .Error }}{{ else }}{{ .Full }}{{ end }}
    result = result.replace(/\{\{\s*if\s+\.([.\w]+)\s*\}\}(.*?)\{\{\s*else\s*\}\}(.*?)\{\{\s*end\s*\}\}/gs, (_match, prop, trueContent, falseContent) => {
      const keys = prop.split('.');
      let value: any = mockData;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          value = undefined;
          break;
        }
      }
      
      // Show trueContent if property is truthy, otherwise falseContent
      return value ? trueContent : falseContent;
    });
    
    // Handle simple conditional statements - {{ if .Venv }}{{ .Venv }} {{ end }}
    result = result.replace(/\{\{\s*if\s+\.([.\w]+)\s*\}\}(.*?)\{\{\s*end\s*\}\}/gs, (_match, prop, content) => {
      const keys = prop.split('.');
      let value: any = mockData;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          value = undefined;
          break;
        }
      }
      
      // Show content if property is truthy
      return value ? content : '';
    });
    
    // Handle "and" conditions - {{ if and (.Staging.Changed) (.Working.Changed) }}
    result = result.replace(/\{\{\s*if\s+and\s+\(\.([.\w]+)\)\s+\(\.([.\w]+)\)\s*\}\}(.*?)\{\{\s*end\s*\}\}/gs, (_match, prop1, prop2, content) => {
      const getValue = (prop: string) => {
        const keys = prop.split('.');
        let value: any = mockData;
        for (const key of keys) {
          if (value && typeof value === 'object' && key in value) {
            value = value[key];
          } else {
            return undefined;
          }
        }
        return value;
      };
      
      const val1 = getValue(prop1);
      const val2 = getValue(prop2);
      return (val1 && val2) ? content : '';
    });
    
    // Handle "ne" (not equal) conditions - {{ if ne .Status "stopped" }}
    result = result.replace(/\{\{\s*if\s+ne\s+\.([.\w]+)\s+"([^"]*)"\s*\}\}(.*?)\{\{\s*end\s*\}\}/gs, (_match, prop, compareValue, content) => {
      const keys = prop.split('.');
      let value: any = mockData;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          value = undefined;
          break;
        }
      }
      
      return String(value) !== compareValue ? content : '';
    });
    
    // Handle remaining if statements
    result = result.replace(/\{\{\s*if\s+[^}]*\}\}/g, '');
    result = result.replace(/\{\{\s*else\s*\}\}/g, '');
    result = result.replace(/\{\{\s*end\s*\}\}/g, '');
    
    // Handle date formatting
    result = result.replace(/\{\{\s*\.CurrentDate\s*\|\s*date\s+\.Format\s*\}\}/g, mockData.CurrentDate);
    result = result.replace(/\{\{\s*\.CurrentDate\s*\|\s*date\s+"([^"]+)"\s*\}\}/g, mockData.CurrentDate);
    
    // Handle round function - {{ round .PhysicalPercentUsed .Precision }}
    result = result.replace(/\{\{\s*round\s+\.([.\w]+)(?:\s+\.Precision)?\s*\}\}/g, (_match, prop) => {
      const keys = prop.split('.');
      let value: any = mockData;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return '';
        }
      }
      
      return typeof value === 'number' ? Math.round(value).toString() : String(value);
    });
    
    // Handle secondsRound function for WakaTime - {{ secondsRound .CumulativeTotal.Seconds }}
    result = result.replace(/\{\{\s*secondsRound\s+\.([.\w]+)\s*\}\}/g, (_match, prop) => {
      const keys = prop.split('.');
      let value: any = mockData;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return '';
        }
      }
      
      // Convert seconds to human readable format
      if (typeof value === 'number') {
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        return `${hours}h ${minutes}m`;
      }
      return String(value);
    });
    
    // Clean up any remaining template expressions
    result = result.replace(/\{\{.*?\}\}/g, '');
    
    return result;
  }
  
  // Second priority: use previewText from metadata if available
  if (metadata?.previewText) {
    return metadata.previewText;
  }
  
  // Third priority: generate preview based on segment type
  const typeMap: Record<string, string> = {
    path: mockData.Path,
    git: `${mockData.HEAD} ${mockData.BranchStatus}`,
    node: 'v20.10.0',
    python: '3.11.0',
    go: '1.21.0',
    rust: '1.74.0',
    dotnet: '8.0.0',
    java: '17.0.0',
    azfunc: 'v4.0',
    az: mockData.Name,
    azd: mockData.DefaultEnvironment,
    aws: `${mockData.Profile}@${mockData.Region}`,
    gcp: mockData.Project,
    docker: mockData.Context,
    kubectl: `${mockData.Context}::${mockData.Namespace}`,
    time: mockData.CurrentDate,
    session: `${mockData.UserName}@${mockData.HostName}`,
    executiontime: mockData.FormattedMs,
    status: '❯',
    battery: `${mockData.Icon}${mockData.Percentage}%`,
    terraform: mockData.WorkspaceName,
    pulumi: mockData.Stack,
    firebase: mockData.Project,
    helm: 'Helm 3.13.3',
    spotify: `${mockData.MusicIcon}${mockData.Artist} - ${mockData.Track}`,
    lastfm: `${mockData.MusicIcon}${mockData.Artist} - ${mockData.Track}`,
    ytm: `${mockData.MusicIcon}${mockData.Artist} - ${mockData.Track}`,
    nightscout: `${mockData.Sgv}${mockData.TrendIcon}`,
    strava: mockData.Ago,
    withings: `${mockData.Steps} steps`,
    ipify: mockData.IP,
    wakatime: mockData.CumulativeTotal.Text,
    owm: `${mockData.Weather} ${mockData.Temperature}${mockData.UnitIcon}`,
    brewfather: `${mockData.StatusIcon} ${mockData.Recipe.Name}`,
    carbonintensity: mockData.Actual.Index,
    copilot: mockData.Premium.Percent.Gauge,
    winget: `${mockData.UpdateCount} updates`,
    os: '🪟',
    shell: 'pwsh',
    project: `${mockData.Name} ${mockData.ProjectVersion}`,
    sysinfo: `${mockData.PhysicalPercentUsed}%`,
    upgrade: mockData.Latest,
    connection: mockData.Type,
    root: '⚡',
    text: 'hello',
  };
  
  if (typeMap[segment.type]) {
    return typeMap[segment.type];
  }
  
  // Fall back to segment name
  return metadata?.name || segment.type;
}

interface SegmentPreviewProps {
  segment: Segment;
  nextBackground?: string;
  blockLeadingDiamond?: string;
  blockTrailingDiamond?: string;
  prevStyle?: SegmentStyle;
}

function SegmentPreview({ segment, nextBackground, blockLeadingDiamond, blockTrailingDiamond, prevStyle }: SegmentPreviewProps) {
  const metadata = useSegmentMetadata(segment.type);
  const text = getPreviewText(segment, metadata);
  const bg = segment.background || 'transparent';
  const fg = segment.foreground || '#ffffff';
  const hasBackground = !!segment.background;
  
  // Parse inline colors from text
  const renderedText = parseInlineColors(text, fg);

  // Add negative margin if previous segment was powerline
  const marginClass = prevStyle === 'powerline' ? '-ml-[2px]' : '';

  if (segment.style === 'powerline') {
    const powerlineSymbol = segment.powerline_symbol || DEFAULT_POWERLINE_SYMBOL;
    // For powerline, the symbol color is the current segment's background,
    // rendered on top of the next segment's background (or transparent)
    const symbolBg = nextBackground || 'transparent';
    
    return (
      <span className={`inline-flex items-stretch -mr-[2px] ${marginClass}`}>
        <span
          style={{ 
            backgroundColor: bg, 
            color: fg,
            border: !hasBackground ? '1px solid rgba(128,128,128,0.3)' : 'none',
            borderRight: !hasBackground && hasBackground ? 'none' : undefined,
          }}
          className="px-2 py-1 inline-flex items-center gap-1.5"
        >
          {metadata?.icon && <DynamicIcon name={metadata.icon} size={14} />}
          <span>{renderedText}</span>
        </span>
        {/* Powerline symbol - only show if current segment has background */}
        {hasBackground && (
          <span 
            className="nerd-font-symbol -ml-[2px] inline-flex items-center"
            style={{
              color: bg,
              backgroundColor: symbolBg,
            }}
          >
            {powerlineSymbol}
          </span>
        )}
      </span>
    );
  }

  if (segment.style === 'diamond') {
    // Only use diamonds if explicitly set (don't use defaults)
    const leadingDiamond = segment.leading_diamond || blockLeadingDiamond;
    const trailingDiamond = segment.trailing_diamond || blockTrailingDiamond;
    
    return (
      <span className={`inline-flex items-stretch ${marginClass}`}>
        {/* Leading diamond - only show if explicitly set */}
        {leadingDiamond && (
          <span 
            className="nerd-font-symbol inline-flex items-center -mr-[2px]"
            style={{
              color: hasBackground ? bg : fg,
              backgroundColor: 'transparent',
            }}
          >
            {parseInlineColors(leadingDiamond, hasBackground ? bg : fg)}
          </span>
        )}
        <span
          style={{ 
            backgroundColor: bg, 
            color: fg,
            border: !hasBackground ? '1px solid rgba(128,128,128,0.3)' : 'none',
            borderLeft: !hasBackground && leadingDiamond ? 'none' : undefined,
            borderRight: !hasBackground && trailingDiamond ? 'none' : undefined,
          }}
          className={`px-2 py-1 inline-flex items-center gap-1.5 ${leadingDiamond ? '-ml-[2px]' : ''} ${trailingDiamond ? '-mr-[2px]' : ''}`}
        >
          {metadata?.icon && <DynamicIcon name={metadata.icon} size={14} />}
          <span>{renderedText}</span>
        </span>
        {/* Trailing diamond - only show if explicitly set */}
        {trailingDiamond && (
          <span 
            className="nerd-font-symbol inline-flex items-center -ml-[2px]"
            style={{
              color: hasBackground ? bg : fg,
              backgroundColor: 'transparent',
            }}
          >
            {parseInlineColors(trailingDiamond, hasBackground ? bg : fg)}
          </span>
        )}
      </span>
    );
  }

  // Plain or accordion style
  return (
    <span
      style={{ 
        backgroundColor: bg, 
        color: fg,
        border: !hasBackground ? '1px solid rgba(128,128,128,0.3)' : 'none',
      }}
      className={`px-2 py-1 rounded inline-flex items-center gap-1.5 ${marginClass}`}
    >
      {metadata?.icon && <DynamicIcon name={metadata.icon} size={14} />}
      <span>{renderedText}</span>
    </span>
  );
}

interface BlockPreviewProps {
  block: Block;
}

function BlockPreview({ block }: BlockPreviewProps) {
  if (block.segments.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-0 ${
        block.alignment === 'right' ? 'justify-end' : 'justify-start'
      }`}
    >
      {block.segments.map((segment, index) => (
        <SegmentPreview
          key={segment.id}
          segment={segment}
          nextBackground={index < block.segments.length - 1 ? block.segments[index + 1].background : undefined}
          blockLeadingDiamond={block.leading_diamond}
          blockTrailingDiamond={block.trailing_diamond}
          prevStyle={index > 0 ? block.segments[index - 1].style : undefined}
        />
      ))}
    </div>
  );
}

export function PreviewPanel() {
  const config = useConfigStore((state) => state.config);
  const previewBackground = useConfigStore((state) => state.previewBackground);
  const setPreviewBackground = useConfigStore((state) => state.setPreviewBackground);

  // Use terminal_background from config if set, otherwise use preview background preference
  const bgColor = config.terminal_background || (previewBackground === 'dark' ? '#1e1e1e' : '#ffffff');
  const textColor = previewBackground === 'dark' ? '#cccccc' : '#333333';
  const finalSpace = config.final_space ?? true;

  return (
    <div className="bg-[#16213e] border-t border-[#0f3460]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#0f3460]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-200">Preview</h2>
          {config.terminal_background && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span>•</span>
              <span>Using terminal_background</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Background:</span>
          <button
            onClick={() => setPreviewBackground('dark')}
            className={`p-1.5 rounded transition-colors ${
              previewBackground === 'dark'
                ? 'bg-[#0f3460] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Dark background"
            disabled={!!config.terminal_background}
          >
            <Moon size={14} />
          </button>
          <button
            onClick={() => setPreviewBackground('light')}
            className={`p-1.5 rounded transition-colors ${
              previewBackground === 'light'
                ? 'bg-[#0f3460] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Light background"
            disabled={!!config.terminal_background}
          >
            <Sun size={14} />
          </button>
        </div>
      </div>

      <div
        className="p-4 text-sm"
        style={{ 
          backgroundColor: bgColor, 
          color: textColor,
          fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', 'Monaco', monospace",
        }}
      >
        <div className="space-y-2">
          {config.blocks.map((block, index) => (
            <div key={block.id}>
              <BlockPreview block={block} />
              {block.newline && index < config.blocks.length - 1 && <br />}
            </div>
          ))}
          <div className="mt-2">
            <span style={{ color: textColor }}>❯ </span>
            {finalSpace && <span> </span>}
            <span className="animate-pulse">▋</span>
          </div>
        </div>
      </div>
    </div>
  );
}
