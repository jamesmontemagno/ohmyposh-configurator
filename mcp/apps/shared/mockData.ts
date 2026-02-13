/**
 * Mock data for preview rendering — simplified from src/components/PreviewPanel/mockData.ts
 */

const sharedMockData: Record<string, unknown> = {
  Env: { HOME: '/home/user', USER: 'user', SHELL: '/bin/zsh' },
  Segments: {
    Git: { RepoName: 'my-app', HEAD: 'main', Ref: 'main', Dir: '/home/user/dev/my-app', BranchStatus: '↑2',
      Working: { Changed: true, String: '~1', Modified: 1, Added: 0, Deleted: 0, Untracked: 0 },
      Staging: { Changed: false, String: '', Modified: 0, Added: 0, Deleted: 0 },
      Commit: { Sha: 'abc12345', Author: 'Developer', Subject: 'Latest commit' } },
    Path: { Path: '~/dev/my-app', Folder: 'my-app', Location: '~/dev/my-app' },
    Contains: (name: string) => ['Git', 'Path'].includes(name),
  },
};

const segmentMockData: Record<string, Record<string, unknown>> = {
  battery: { Icon: '\uf240', Percentage: 85, State: { String: 'Charging' } },
  connection: { Type: 'wifi', Name: 'SSID-Network' },
  executiontime: { FormattedMs: '127ms', Ms: 127 },
  os: { Icon: '\ue70f', OS: 'darwin' },
  path: { Path: '~/dev/my-app', Folder: 'my-app', Parent: '~/dev/', Location: '~/dev/my-app', PWD: '/home/user/dev/my-app' },
  project: { Name: 'my-app', Version: '1.0.0', Type: 'node' },
  session: { UserName: 'user', HostName: 'laptop', SSHSession: false, Root: false },
  shell: { Name: 'zsh', Version: '5.9' },
  status: { Code: 0, String: '✓', Error: '' },
  sysinfo: { PhysicalPercentUsed: 45.2 },
  time: { CurrentDate: new Date(), Format: '15:04:05' },
  upgrade: { Current: '1.2.0', Latest: '1.3.0' },
  winget: { UpdateCount: 5 },
  text: { Text: 'hello' },

  git: { RepoName: 'my-app', HEAD: 'main', Ref: 'main', BranchStatus: '↑2', Behind: 0, Ahead: 2, UpstreamIcon: '\uf09b',
    Working: { Changed: true, String: '~1', Modified: 1 }, Staging: { Changed: false, String: '' },
    Commit: { Sha: 'abc12345' } },
  fossil: { Branch: 'trunk' },
  hg: { Branch: 'default' },
  jj: { ChangeId: 'qpvuntsm', Bookmark: 'main' },
  svn: { BaseRev: 1234, Branch: 'trunk' },
  sapling: { Bookmark: 'main', Hash: 'abc123' },

  angular: { Full: '17.0.0' }, azfunc: { Full: 'v4.0' }, bun: { Full: '1.0.0' },
  cmake: { Full: '3.28.0' }, crystal: { Full: '1.10.0' }, dart: { Full: '3.2.0' },
  deno: { Full: '1.38.0' }, dotnet: { Full: '8.0.101' }, elixir: { Full: '1.15.0' },
  flutter: { Full: '3.16.0' }, go: { Full: '1.21.5' }, haskell: { Full: '9.4.7' },
  java: { Full: '21.0.1' }, julia: { Full: '1.10.0' }, kotlin: { Full: '1.9.21' },
  lua: { Full: '5.4.6' }, node: { Full: 'v20.10.0' }, ocaml: { Full: '5.1.0' },
  perl: { Full: '5.38.0' }, php: { Full: '8.3.0' },
  python: { Full: '3.12.0', Venv: 'venv' },
  r: { Full: '4.3.2' }, ruby: { Full: '3.3.0' }, rust: { Full: '1.74.0' },
  scala: { Full: '3.3.1' }, swift: { Full: '5.9.2' }, typescript: { Full: '5.3.3' },
  zig: { Full: '0.11.0' }, react: { Full: '19.0.0' },

  aws: { Profile: 'default', Region: 'us-east-1' },
  az: { Name: 'My Subscription', ID: 'sub-12345' },
  azd: { Name: 'my-azd-app', DefaultEnvironment: 'dev' },
  docker: { Context: 'default' },
  firebase: { Project: 'my-firebase-app' },
  gcp: { Project: 'my-project', Account: 'user@example.com' },
  helm: { Version: 'v3.13.3', Full: '3.13.3' },
  kubectl: { Context: 'production', Namespace: 'default' },
  pulumi: { Stack: 'dev' },
  terraform: { WorkspaceName: 'production', Version: '1.6.0' },

  spotify: { Icon: '\uf1bc', Status: 'playing', Artist: 'The Beatles', Track: 'Come Together' },
  lastfm: { Icon: '\uf202', Artist: 'Radiohead', Track: 'Paranoid Android' },
  ytm: { Icon: '\uf16a', Artist: 'Daft Punk', Track: 'One More Time' },

  nightscout: { Sgv: 120, TrendIcon: '\uf062' },
  strava: { Ago: '5m' },
  withings: { Steps: 8542 },

  ipify: { IP: '192.168.1.100' },
  owm: { Weather: '\uf185', Temperature: 72, UnitIcon: '°F' },
  wakatime: { CumulativeTotal: { Seconds: 12345, Text: '3h 25m' } },
  carbonintensity: { Actual: { Index: 'low' } },

  copilot: { Premium: { Percent: { Gauge: '████░' } } },
  claude: { Model: { DisplayName: 'Claude 3.5 Sonnet' }, TokenUsagePercent: { Gauge: '▰▰▰▱▱' } },
};

export function getMockDataForSegment(segmentType: string): Record<string, unknown> {
  const data = segmentMockData[segmentType];
  if (data) return { ...sharedMockData, ...data };
  return { ...sharedMockData, Full: 'v1.2.3', Name: 'default', Icon: '' };
}
