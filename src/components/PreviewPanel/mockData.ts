// Mock data for preview - comprehensive data based on segment properties
export const mockData: Record<string, any> = {
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
