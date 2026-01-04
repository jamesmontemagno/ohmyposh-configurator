// Mock data for preview - organized by segment type for easy maintenance
// Each segment type has its own complete set of mock data

// Shared data available to all segments (cross-segment references, environment)
const sharedMockData: Record<string, unknown> = {
  // Environment variables (accessible via .Env.*)
  Env: {
    TMUX: '',
    WT_PROFILE_ID: '',
    HOME: '/home/user',
    USER: 'user',
    SHELL: '/bin/zsh',
    PATH: '/usr/bin:/bin',
    TERM: 'xterm-256color',
  },
  
  // Segments accessor - allows templates like .Segments.Git.HEAD
  // Used by text segments and cross-segment templates
  Segments: {
    Git: {
      RepoName: 'my-app',
      HEAD: 'main',
      Ref: 'main',
      Dir: '/home/user/dev/my-app',
      BranchStatus: '↑2',
      Behind: 0,
      Ahead: 2,
      UpstreamIcon: '\ue0a0',
      UpstreamURL: 'https://github.com/user/my-app',
      Working: { 
        Changed: true, 
        String: '~1',
        Modified: 1,
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
      Commit: {
        Sha: 'abc12345',
        Author: 'Developer',
        Subject: 'Latest commit'
      },
    },
    Path: {
      Path: '~/dev/my-app',
      Folder: 'my-app',
      Location: '~/dev/my-app',
    },
    Session: {
      UserName: 'user',
      HostName: 'laptop',
      SSHSession: false,
      Root: false,
    },
    // Contains method simulation - handled in template processing
    Contains: (name: string) => ['Git', 'Path'].includes(name),
  },
};

// Complete mock data per segment type
// Each segment has all the properties it needs without relying on shared top-level data
export const segmentMockData: Record<string, Record<string, unknown>> = {
  // ============================================================
  // SYSTEM SEGMENTS
  // ============================================================
  
  battery: {
    Icon: '\uf240',
    Percentage: 85,
    State: { String: 'Charging' },
    Current: 50.5,
    Remaining: '2:30',
    Templates: ['{{ if eq "Charging" .State.String }}⚡{{ end }}'],
  },
  
  brewfather: {
    Status: 'Fermenting',
    StatusIcon: '\uf0fc',
    Recipe: { Name: 'IPA' },
    BatchName: 'Batch #42',
    MeasuredAbv: 6.5,
    DaysFermenting: 7,
    ReadingAge: '2h',
  },
  
  connection: {
    Type: 'wifi',
    Name: 'SSID-Network',
    SSID: 'SSID-Network',
    TransmitRate: 150,
  },
  
  executiontime: {
    FormattedMs: '127ms',
    Ms: 127,
  },
  
  os: {
    Icon: '\ue70f',
    WSL: false,
    OS: 'darwin',
    Platform: 'darwin',
  },
  
  path: {
    Path: '~/dev/my-app',
    Folder: 'my-app',
    Parent: '~/dev/',
    Location: '~/dev/my-app',
    PWD: '/home/user/dev/my-app',
    RootDir: false,
    StackCount: 0,
    Writable: true,
    // Format method simulation for path formatting
    Format: (p: string) => p,
  },
  
  project: {
    Name: 'my-app',
    Version: '1.0.0',
    Type: 'node',
    Target: 'ES2020',
  },
  
  root: {
    Icon: '⚡',
  },
  
  session: {
    UserName: 'user',
    HostName: 'laptop',
    SSHSession: false,
    Root: false,
    DefaultUserName: 'user',
  },
  
  shell: {
    Name: 'zsh',
    Version: '5.9',
    Root: false,
  },
  
  status: {
    Code: 0,
    String: '✓',
    Error: '',
  },
  
  sysinfo: {
    PhysicalPercentUsed: 45.2,
    PhysicalTotalMemory: 16384,
    PhysicalAvailableMemory: 8192,
    PhysicalFreeMemory: 8192,
    SwapPercentUsed: 10.5,
    SwapTotalMemory: 8192,
    Load1: 1.5,
    Load5: 1.2,
    Load15: 1.0,
    Disks: [{ Name: 'disk0', Percent: 65 }],
  },
  
  text: {
    // Text segment primarily uses .Segments accessor for cross-segment data
    // Include common display text
    Text: 'hello',
  },
  
  time: {
    CurrentDate: new Date(),
    Format: '15:04:05',
  },
  
  upgrade: {
    Current: '1.2.0',
    Latest: '1.3.0',
    Status: 'update_available',
  },
  
  winget: {
    UpdateCount: 5,
    Updates: [
      { Name: 'App1', ID: 'app1', Current: '1.0', Available: '1.1' },
      { Name: 'App2', ID: 'app2', Current: '2.0', Available: '2.1' },
    ],
  },
  
  // ============================================================
  // SCM SEGMENTS (Source Control)
  // ============================================================
  
  fossil: {
    Branch: 'trunk',
    Status: '',
  },
  
  git: {
    RepoName: 'my-app',
    HEAD: 'main',
    Ref: 'main',
    Dir: '/home/user/dev/my-app',
    BranchStatus: '↑2',
    Behind: 0,
    Ahead: 2,
    UpstreamIcon: '\uf09b',
    UpstreamURL: 'https://github.com/user/my-app',
    UpstreamGone: false,
    Working: { 
      Changed: true, 
      String: '~1',
      Modified: 1,
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
      Sha: 'abc12345',
      Author: 'Developer',
      Subject: 'Latest commit'
    },
  },
  
  gitversion: {
    Major: 1,
    Minor: 2,
    Patch: 3,
    MajorMinorPatch: '1.2.3',
    SemVer: '1.2.3',
    FullSemVer: '1.2.3+5',
    BranchName: 'main',
    Sha: 'abc12345',
    ShortSha: 'abc1234',
    CommitsSinceVersionSource: 5,
  },
  
  hg: {
    Branch: 'default',
    LocalCommitNumber: 42,
    ChangeSetID: 'abc123',
    ChangeSetIDShort: 'abc',
    Bookmark: '',
    Added: 0,
    Deleted: 0,
    Modified: 0,
    Untracked: 0,
  },
  
  jj: {
    ChangeId: 'qpvuntsm',
    ChangeIdShort: 'qpvu',
    CommitId: 'abc12345',
    CommitIdShort: 'abc1',
    Bookmark: 'main',
    Working: { Changed: false, String: '' },
  },
  
  plastic: {
    Selector: 'main@myrepo',
    Behind: false,
    MergePending: false,
    Branch: 'main',
    Repository: 'myrepo',
  },
  
  sapling: {
    Bookmark: 'main',
    Hash: 'abc123def456',
    ShortHash: 'abc123',
    Description: 'Latest commit',
    Author: 'Developer',
    When: '2h ago',
    Dir: '/home/user/repo',
    RelativeDir: 'src',
    New: false,
  },
  
  svn: {
    BaseRev: 1234,
    Branch: 'trunk',
    Repo: 'svn://example.com/repo',
    Working: { Added: 0, Modified: 0, Deleted: 0, Untracked: 0, Conflicted: 0, Changed: false, String: '' },
  },
  
  // ============================================================
  // LANGUAGES & RUNTIMES
  // ============================================================
  
  angular: {
    Full: '17.0.0',
    Major: '17',
    Minor: '0',
    Patch: '0',
    Error: '',
    URL: '',
  },
  
  azfunc: {
    Full: 'v4.0',
    Major: '4',
    Minor: '0',
    Error: '',
  },
  
  bazel: {
    Full: '7.0.0',
    Icon: '\ue63a',
    Major: '7',
    Minor: '0',
    Patch: '0',
    Error: '',
  },
  
  buf: {
    Full: '1.28.0',
    Major: '1',
    Minor: '28',
    Patch: '0',
    Error: '',
  },
  
  bun: {
    Full: '1.0.0',
    Major: '1',
    Minor: '0',
    Patch: '0',
    Error: '',
  },
  
  cf: {
    Full: 'v8.7.0',
    Org: 'myorg',
    Space: 'production',
  },
  
  cmake: {
    Full: '3.28.0',
    Major: '3',
    Minor: '28',
    Patch: '0',
    Error: '',
  },
  
  crystal: {
    Full: '1.10.0',
    Major: '1',
    Minor: '10',
    Patch: '0',
    Error: '',
  },
  
  dart: {
    Full: '3.2.0',
    Major: '3',
    Minor: '2',
    Patch: '0',
    Error: '',
  },
  
  deno: {
    Full: '1.38.0',
    Major: '1',
    Minor: '38',
    Patch: '0',
    Error: '',
  },
  
  dotnet: {
    Full: '8.0.101',
    Major: '8',
    Minor: '0',
    Patch: '101',
    Error: '',
    URL: '',
  },
  
  elixir: {
    Full: '1.15.0',
    Major: '1',
    Minor: '15',
    Patch: '0',
    Error: '',
  },
  
  elm: {
    Full: '0.19.1',
    Major: '0',
    Minor: '19',
    Patch: '1',
    Error: '',
  },
  
  erlang: {
    Full: '26.0',
    Major: '26',
    Minor: '0',
    Error: '',
  },
  
  flutter: {
    Full: '3.16.0',
    Major: '3',
    Minor: '16',
    Patch: '0',
    Error: '',
  },
  
  go: {
    Full: '1.21.5',
    Major: '1',
    Minor: '21',
    Patch: '5',
    Error: '',
    URL: '',
  },
  
  haskell: {
    Full: '9.4.7',
    Major: '9',
    Minor: '4',
    Patch: '7',
    StackGhc: '9.4.7',
    Error: '',
  },
  
  java: {
    Full: '21.0.1',
    Major: '21',
    Minor: '0',
    Patch: '1',
    Error: '',
    URL: '',
  },
  
  julia: {
    Full: '1.10.0',
    Major: '1',
    Minor: '10',
    Patch: '0',
    Error: '',
  },
  
  kotlin: {
    Full: '1.9.21',
    Major: '1',
    Minor: '9',
    Patch: '21',
    Error: '',
  },
  
  lua: {
    Full: '5.4.6',
    Major: '5',
    Minor: '4',
    Patch: '6',
    Error: '',
  },
  
  nbgv: {
    Version: '3.6.133',
    AssemblyVersion: '3.6.133.0',
    SimpleVersion: '3.6.133',
  },
  
  'nix-shell': {
    Type: 'devenv',
    Name: 'devenv',
    Packages: 'nodejs,npm',
  },
  
  node: {
    Full: 'v20.10.0',
    Major: '20',
    Minor: '10',
    Patch: '0',
    Error: '',
    URL: '',
    PackageManagerIcon: '\ue71e',
    PackageManagerName: 'npm',
    Mismatch: false,
  },
  
  ocaml: {
    Full: '5.1.0',
    Major: '5',
    Minor: '1',
    Patch: '0',
    Error: '',
  },
  
  perl: {
    Full: '5.38.0',
    Major: '5',
    Minor: '38',
    Patch: '0',
    Error: '',
  },
  
  php: {
    Full: '8.3.0',
    Major: '8',
    Minor: '3',
    Patch: '0',
    Error: '',
    URL: '',
  },
  
  python: {
    Full: '3.12.0',
    Major: '3',
    Minor: '12',
    Patch: '0',
    Error: '',
    URL: '',
    Venv: 'venv',
  },
  
  quasar: {
    Version: '2.14.0',
    Vite: { Version: '4.0.0', Dev: true },
    AppVite: { Version: '1.5.0', Dev: true },
  },
  
  r: {
    Full: '4.3.2',
    Major: '4',
    Minor: '3',
    Patch: '2',
    Error: '',
  },
  
  ruby: {
    Full: '3.3.0',
    Major: '3',
    Minor: '3',
    Patch: '0',
    Error: '',
    URL: '',
  },
  
  rust: {
    Full: '1.74.0',
    Major: '1',
    Minor: '74',
    Patch: '0',
    Error: '',
    URL: '',
  },
  
  scala: {
    Full: '3.3.1',
    Major: '3',
    Minor: '3',
    Patch: '1',
    Error: '',
  },
  
  swift: {
    Full: '5.9.2',
    Major: '5',
    Minor: '9',
    Patch: '2',
    Error: '',
  },
  
  typescript: {
    Full: '5.3.3',
    Major: '5',
    Minor: '3',
    Patch: '3',
    Error: '',
  },
  
  umbraco: {
    Version: '13.0.0',
    Modern: true,
  },
  
  unity: {
    UnityVersion: '2023.1.0',
    CSharpVersion: '10.0',
  },
  
  vala: {
    Full: '0.56.14',
    Major: '0',
    Minor: '56',
    Patch: '14',
    Error: '',
  },
  
  zig: {
    Full: '0.11.0',
    Major: '0',
    Minor: '11',
    Patch: '0',
    Error: '',
  },
  
  // ============================================================
  // CLOUD & INFRASTRUCTURE
  // ============================================================
  
  argocd: {
    Name: 'production',
    Server: 'argocd.example.com',
    User: 'admin',
    Context: 'default',
  },
  
  aws: {
    Profile: 'default',
    Region: 'us-east-1',
    RegionAlias: 'use1',
  },
  
  az: {
    Name: 'My Subscription',
    ID: 'sub-12345',
    EnvironmentName: 'production',
    TenantID: 'tenant-456',
    User: { Name: 'user@domain.com', Type: 'user' },
    Origin: 'CLI',
  },
  
  azd: {
    Name: 'my-azd-app',
    DefaultEnvironment: 'dev',
  },
  
  cds: {
    Full: '7.5.0',
    HasDependency: true,
    Major: '7',
    Minor: '5',
  },
  
  docker: {
    Context: 'default',
  },
  
  firebase: {
    Project: 'my-firebase-app',
  },
  
  gcp: {
    Project: 'my-project',
    Account: 'user@example.com',
    ActiveConfig: 'default',
    Region: 'us-central1',
  },
  
  helm: {
    Version: 'v3.13.3',
    Full: '3.13.3',
  },
  
  kubectl: {
    Context: 'production',
    Namespace: 'default',
    Cluster: 'production-cluster',
    User: 'admin',
  },
  
  pulumi: {
    Stack: 'dev',
    Name: 'my-stack',
    User: 'user',
  },
  
  talosctl: {
    Context: 'default',
  },
  
  terraform: {
    WorkspaceName: 'production',
    Version: '1.6.0',
  },
  
  // ============================================================
  // CLI & TOOLS
  // ============================================================
  
  'angular-cli': {
    Full: '17.0.0',
    Major: '17',
    Minor: '0',
    Patch: '0',
  },
  
  brew: {
    Full: '4.2.0',
    Major: '4',
    Minor: '2',
    Patch: '0',
  },
  
  command: {
    Output: 'command output',
  },
  
  volta: {
    Full: '1.1.1',
    Major: '1',
    Minor: '1',
    Patch: '1',
  },
  
  nx: {
    Full: '17.0.0',
    Major: '17',
    Minor: '0',
    Patch: '0',
  },
  
  pnpm: {
    Full: '8.12.0',
    Major: '8',
    Minor: '12',
    Patch: '0',
  },
  
  yarn: {
    Full: '4.0.0',
    Major: '4',
    Minor: '0',
    Patch: '0',
  },
  
  // ============================================================
  // AI & SPECIAL
  // ============================================================
  
  claude: {
    SessionID: 'session-123',
    Model: { ID: 'claude-3.5-sonnet', DisplayName: 'Claude 3.5 Sonnet' },
    TokenUsagePercent: {
      Gauge: '▰▰▰▱▱',
      String: '65'
    },
    FormattedCost: '$0.15',
    FormattedTokens: '1.2K',
    Cost: {
      TotalCostUSD: 0.15,
      TotalDurationMS: 45000
    },
    ContextWindow: {
      TotalInputTokens: 800,
      TotalOutputTokens: 400,
      ContextWindowSize: 200000
    },
    Workspace: {
      CurrentDir: '~/projects/my-app',
      ProjectDir: '~/projects/my-app'
    }
  },
  
  copilot: {
    Premium: { 
      Used: 45,
      Limit: 100,
      Percent: { 
        Gauge: '████░',
        String: '45'
      },
      Remaining: { 
        Gauge: '░░███',
        String: '55'
      },
      Unlimited: false
    },
    Inline: {
      Used: 500,
      Limit: 1000,
      Percent: { 
        Gauge: '███░░',
        String: '50'
      },
    },
    Chat: {
      Used: 20,
      Limit: 50,
      Percent: { 
        Gauge: '██░░░',
        String: '40'
      },
    },
    BillingCycleEnd: '2025-01-15',
  },
  
  // ============================================================
  // MUSIC SEGMENTS
  // ============================================================
  
  lastfm: {
    Icon: '\uf202',
    Status: 'playing',
    Artist: 'Radiohead',
    Track: 'Paranoid Android',
    Album: 'OK Computer',
  },
  
  spotify: {
    Icon: '\uf1bc',
    Status: 'playing',
    Artist: 'The Beatles',
    Track: 'Come Together',
    Album: 'Abbey Road',
  },
  
  ytm: {
    Icon: '\uf16a',
    Status: 'playing',
    Artist: 'Daft Punk',
    Track: 'One More Time',
    Album: 'Discovery',
  },
  
  // ============================================================
  // HEALTH SEGMENTS
  // ============================================================
  
  nightscout: {
    Sgv: 120,
    TrendIcon: '\uf062',
    Direction: 'Flat',
    DateString: '2h ago',
    Device: 'DexcomG6',
  },
  
  strava: {
    Ago: '5m',
    Icon: '\uef0c',
    Hours: 2,
    Duration: 3600,
    Distance: 10000,
    AverageWatts: 180,
    KudosCount: 15,
  },
  
  withings: {
    Steps: 8542,
    Weight: 70.5,
    SleepHours: '7.5',
    HeartRate: 68,
  },
  
  // ============================================================
  // WEB SEGMENTS
  // ============================================================
  
  carbonintensity: {
    Actual: { Index: 'low', Forecast: 120, Intensity: 85 },
    TrendIcon: '\uf062',
    Forecast: 150,
  },
  
  http: {
    Body: { status: 'ok', data: 'response' },
    Status: 200,
  },
  
  ipify: {
    IP: '192.168.1.100',
  },
  
  owm: {
    Weather: '\uf185',
    Temperature: 72,
    UnitIcon: '°F',
    Units: 'imperial',
    Location: 'Seattle',
  },
  
  wakatime: {
    CumulativeTotal: {
      Seconds: 12345,
      Text: '3h 25m',
      Decimal: '3.42',
      Digital: '3:25'
    },
    URL: 'https://wakatime.com/@user',
  },
  
  // ============================================================
  // OTHER SEGMENTS
  // ============================================================
  
  'windows-registry': {
    Value: 'RegistryValue',
  },
  
  sitecore: {
    EndpointName: 'Production',
    CmHost: 'cm.example.com',
  },
};

// Legacy export for backward compatibility - merges shared data with empty defaults
export const mockData: Record<string, unknown> = {
  ...sharedMockData,
  // Default fallback values for any segment that doesn't have specific data
  Full: 'v1.2.3',
  Major: '1',
  Minor: '2',
  Patch: '3',
  Error: '',
  Version: '1.2.3',
  Icon: '',
  Name: 'default',
};

// Backward compatibility alias
export const segmentTypeOverrides = segmentMockData;

// Helper to get mock data with segment-specific data merged with shared data
export function getMockDataForSegment(segmentType: string): Record<string, unknown> {
  const segmentData = segmentMockData[segmentType];
  if (segmentData) {
    return { ...sharedMockData, ...segmentData };
  }
  // Fallback to shared + default mock data
  return { ...sharedMockData, ...mockData };
}
