/**
 * Comprehensive Nerd Font Icon Library with Unique User-Friendly IDs
 * Each icon has a unique ID for easy reference and searching
 * Codes verified against: https://nerdfonts.ytyng.com/
 */

export interface NerdFontIcon {
  id: string;                    // Unique user-friendly ID (e.g., 'ui-plus', 'lang-python')
  name: string;                  // Display name
  code: string;                  // Unicode code point (e.g., 'F067')
  char: string;                  // Unicode character
  category: string;              // Icon category
  aliases?: string[];            // Alternative names for searching
  description?: string;          // Description of what the icon represents
}

// Type for icon lookups
export type IconId = keyof typeof NERD_FONT_ICONS_MAP;

// Comprehensive icon definitions with unique IDs
export const NERD_FONT_ICONS_MAP: Record<string, NerdFontIcon> = {
  // === UI & NAVIGATION ===
  'ui-plus': { id: 'ui-plus', name: 'Plus', code: 'F067', char: '\uf067', category: 'UI & Navigation', aliases: ['plus', 'add'], description: 'Add or increase' },
  'ui-minus': { id: 'ui-minus', name: 'Minus', code: 'F068', char: '\uf068', category: 'UI & Navigation', aliases: ['minus', 'remove'], description: 'Subtract or decrease' },
  'ui-close': { id: 'ui-close', name: 'Close', code: 'F00D', char: '\uf00d', category: 'UI & Navigation', aliases: ['times', 'close', 'exit'], description: 'Close or cancel' },
  'ui-check': { id: 'ui-check', name: 'Check', code: 'F00C', char: '\uf00c', category: 'UI & Navigation', aliases: ['check', 'checkmark'], description: 'Success or confirmation' },
  'ui-chevron-down': { id: 'ui-chevron-down', name: 'Chevron Down', code: 'F078', char: '\uf078', category: 'UI & Navigation', aliases: ['chevronDown', 'dropdown'], description: 'Expand or navigate down' },
  'ui-chevron-up': { id: 'ui-chevron-up', name: 'Chevron Up', code: 'F077', char: '\uf077', category: 'UI & Navigation', aliases: ['chevronUp', 'collapse'], description: 'Collapse or navigate up' },
  'ui-chevron-right': { id: 'ui-chevron-right', name: 'Chevron Right', code: 'F054', char: '\uf054', category: 'UI & Navigation', aliases: ['chevronRight', 'next'], description: 'Navigate right' },
  'ui-chevron-left': { id: 'ui-chevron-left', name: 'Chevron Left', code: 'F053', char: '\uf053', category: 'UI & Navigation', aliases: ['chevronLeft', 'previous'], description: 'Navigate left' },
  'ui-arrow-up': { id: 'ui-arrow-up', name: 'Arrow Up', code: 'F062', char: '\uf062', category: 'UI & Navigation', aliases: ['ArrowUp', 'up'], description: 'Up arrow' },
  'ui-arrow-down': { id: 'ui-arrow-down', name: 'Arrow Down', code: 'F063', char: '\uf063', category: 'UI & Navigation', aliases: ['ArrowDown', 'down'], description: 'Down arrow' },
  'ui-arrow-left': { id: 'ui-arrow-left', name: 'Arrow Left', code: 'F060', char: '\uf060', category: 'UI & Navigation', aliases: ['ArrowLeft', 'left'], description: 'Left arrow' },
  'ui-arrow-right': { id: 'ui-arrow-right', name: 'Arrow Right', code: 'F061', char: '\uf061', category: 'UI & Navigation', aliases: ['ArrowRight', 'right'], description: 'Right arrow' },
  'ui-grip-vertical': { id: 'ui-grip-vertical', name: 'Grip Vertical', code: 'F142', char: '\uf142', category: 'UI & Navigation', aliases: ['gripVertical', 'drag'], description: 'Drag handle' },
  'ui-external-link': { id: 'ui-external-link', name: 'External Link', code: 'F08E', char: '\uf08e', category: 'UI & Navigation', aliases: ['externalLink', 'external'], description: 'External link' },
  'action-search': { id: 'action-search', name: 'Search', code: 'F002', char: '\uf002', category: 'UI & Navigation', aliases: ['search', 'magnify'], description: 'Search or find' },
  'action-copy': { id: 'action-copy', name: 'Copy', code: 'F0C5', char: '\uf0c5', category: 'UI & Navigation', aliases: ['copy', 'duplicate'], description: 'Copy to clipboard' },
  'action-download': { id: 'action-download', name: 'Download', code: 'F019', char: '\uf019', category: 'UI & Navigation', aliases: ['download', 'Download'], description: 'Download file' },
  'action-upload': { id: 'action-upload', name: 'Upload', code: 'F093', char: '\uf093', category: 'UI & Navigation', aliases: ['upload', 'publish'], description: 'Upload file' },
  'action-share': { id: 'action-share', name: 'Share', code: 'F064', char: '\uf064', category: 'UI & Navigation', aliases: ['share', 'distribute'], description: 'Share or distribute' },
  'action-trash': { id: 'action-trash', name: 'Trash', code: 'F1F8', char: '\uf1f8', category: 'UI & Navigation', aliases: ['trash', 'delete'], description: 'Delete or remove' },
  'action-delete': { id: 'action-delete', name: 'Delete', code: 'F1F8', char: '\uf1f8', category: 'UI & Navigation', aliases: ['delete', 'remove', 'trash'], description: 'Delete item' },
  'action-refresh': { id: 'action-refresh', name: 'Refresh', code: 'F021', char: '\uf021', category: 'UI & Navigation', aliases: ['refresh', 'reload'], description: 'Refresh or reload' },
  'action-save': { id: 'action-save', name: 'Save', code: 'F0C7', char: '\uf0c7', category: 'UI & Navigation', aliases: ['save', 'store'], description: 'Save file or data' },
  'action-edit': { id: 'action-edit', name: 'Edit', code: 'F044', char: '\uf044', category: 'UI & Navigation', aliases: ['edit', 'modify'], description: 'Edit or modify' },
  'action-import': { id: 'action-import', name: 'Import', code: 'F093', char: '\uf093', category: 'UI & Navigation', aliases: ['import', 'upload', 'load'], description: 'Import or upload' },
  'action-export': { id: 'action-export', name: 'Export', code: 'F019', char: '\uf019', category: 'UI & Navigation', aliases: ['export', 'download', 'save'], description: 'Export or download' },
  'tool-settings': { id: 'tool-settings', name: 'Settings', code: 'F013', char: '\uf013', category: 'UI & Navigation', aliases: ['settings', 'Settings', 'cog'], description: 'Settings or configuration' },
  'tool-sliders': { id: 'tool-sliders', name: 'Sliders', code: 'F1DE', char: '\uf1de', category: 'UI & Navigation', aliases: ['sliders', 'adjust'], description: 'Adjust or control' },
  'tool-wrench': { id: 'tool-wrench', name: 'Wrench', code: 'F0AD', char: '\uf0ad', category: 'UI & Navigation', aliases: ['wrench', 'Wrench', 'tools'], description: 'Tools or utilities' },
  'tool-debug': { id: 'tool-debug', name: 'Debug', code: 'F0AD', char: '\uf0ad', category: 'UI & Navigation', aliases: ['debug', 'bug', 'Debug'], description: 'Debug or bug' },
  'ui-palette': { id: 'ui-palette', name: 'Palette', code: 'F1FC', char: '\uf1fc', category: 'UI & Navigation', aliases: ['palette', 'Palette', 'color'], description: 'Color or theme' },
  'ui-code': { id: 'ui-code', name: 'Code', code: 'F121', char: '\uf121', category: 'UI & Navigation', aliases: ['code', 'Code', 'Code2', 'brackets'], description: 'Code or programming' },
  'ui-globe': { id: 'ui-globe', name: 'Globe', code: 'F0AC', char: '\uf0ac', category: 'UI & Navigation', aliases: ['globe', 'Globe', 'world'], description: 'World or internet' },
  'ui-monitor': { id: 'ui-monitor', name: 'Monitor', code: 'F108', char: '\uf108', category: 'UI & Navigation', aliases: ['monitor', 'Monitor', 'screen'], description: 'Display or monitor' },
  'ui-eye': { id: 'ui-eye', name: 'Eye', code: 'F06E', char: '\uf06e', category: 'UI & Navigation', aliases: ['eye', 'view'], description: 'View or visibility' },
  'ui-eye-off': { id: 'ui-eye-off', name: 'Eye Off', code: 'F070', char: '\uf070', category: 'UI & Navigation', aliases: ['eyeOff', 'hide'], description: 'Hide or invisible' },
  'ui-more-vertical': { id: 'ui-more-vertical', name: 'More Vertical', code: 'F142', char: '\uf142', category: 'UI & Navigation', aliases: ['moreVertical', 'ellipsis', 'menu', 'dots'], description: 'More options menu' },
  'ui-unfold-more': { id: 'ui-unfold-more', name: 'Unfold More', code: 'F103', char: '\uf103', category: 'UI & Navigation', aliases: ['unfoldMore', 'expandAll', 'angle-double-down'], description: 'Expand all' },
  'ui-unfold-less': { id: 'ui-unfold-less', name: 'Unfold Less', code: 'F102', char: '\uf102', category: 'UI & Navigation', aliases: ['unfoldLess', 'collapseAll', 'angle-double-up'], description: 'Collapse all' },
  'ui-users': { id: 'ui-users', name: 'Users', code: 'F0C0', char: '\uf0c0', category: 'UI & Navigation', aliases: ['users', 'group', 'community'], description: 'Users or community' },
  'ui-home': { id: 'ui-home', name: 'Home', code: 'F015', char: '\uf015', category: 'UI & Navigation', aliases: ['Home', 'house'], description: 'Home or dashboard' },
  'status-info': { id: 'status-info', name: 'Info', code: 'F129', char: '\uf129', category: 'UI & Navigation', aliases: ['info', 'information'], description: 'Information' },
  'status-check-circle': { id: 'status-check-circle', name: 'Check Circle', code: 'F058', char: '\uf058', category: 'UI & Navigation', aliases: ['check_circle', 'CheckCircle', 'success'], description: 'Success status' },
  'status-exclamation': { id: 'status-exclamation', name: 'Exclamation', code: 'F12A', char: '\uf12a', category: 'UI & Navigation', aliases: ['exclamation', 'warning'], description: 'Warning or alert' },
  'status-warning': { id: 'status-warning', name: 'Warning', code: 'F071', char: '\uf071', category: 'UI & Navigation', aliases: ['warning', 'alert', 'caution'], description: 'Warning triangle' },
  'status-question': { id: 'status-question', name: 'Question', code: 'F128', char: '\uf128', category: 'UI & Navigation', aliases: ['question', 'help'], description: 'Question or help' },
  'status-circle': { id: 'status-circle', name: 'Circle', code: 'F111', char: '\uf111', category: 'UI & Navigation', aliases: ['Circle', 'dot'], description: 'Circle indicator' },
  'status-circle-dot': { id: 'status-circle-dot', name: 'Circle Dot', code: 'F192', char: '\uf192', category: 'UI & Navigation', aliases: ['CircleDot', 'filled-circle'], description: 'Filled circle indicator' },
  'status-target': { id: 'status-target', name: 'Target', code: 'F140', char: '\uf140', category: 'UI & Navigation', aliases: ['Target', 'focus', 'bullseye'], description: 'Target or goal' },
  'status-alert-circle': { id: 'status-alert-circle', name: 'Alert Circle', code: 'F06A', char: '\uf06a', category: 'UI & Navigation', aliases: ['AlertCircle', 'error'], description: 'Alert or error' },
  'status-x-circle': { id: 'status-x-circle', name: 'X Circle', code: 'F057', char: '\uf057', category: 'UI & Navigation', aliases: ['XCircle', 'failure'], description: 'Error or failure' },

  // === DEVELOPMENT ===
  'lang-python': { id: 'lang-python', name: 'Python', code: 'E73C', char: '\ue73c', category: 'Development', aliases: ['Python', 'Snake'], description: 'Python language' },
  'lang-rust': { id: 'lang-rust', name: 'Rust', code: 'E7A8', char: '\ue7a8', category: 'Development', aliases: ['Rust'], description: 'Rust language' },
  'lang-go': { id: 'lang-go', name: 'Go', code: 'E724', char: '\ue724', category: 'Development', aliases: ['Go', 'Golang', 'golang'], description: 'Go/Golang language' },
  'lang-java': { id: 'lang-java', name: 'Java', code: 'E738', char: '\ue738', category: 'Development', aliases: ['Java'], description: 'Java language' },
  'lang-ruby': { id: 'lang-ruby', name: 'Ruby', code: 'E739', char: '\ue739', category: 'Development', aliases: ['Ruby'], description: 'Ruby language' },
  'lang-nodejs': { id: 'lang-nodejs', name: 'Node.js', code: 'E718', char: '\ue718', category: 'Development', aliases: ['Node', 'nodejs'], description: 'Node.js runtime' },
  'lang-csharp': { id: 'lang-csharp', name: 'C#', code: 'E648', char: '\ue648', category: 'Development', aliases: ['CSharp'], description: 'C# language' },
  'lang-clojure': { id: 'lang-clojure', name: 'Clojure', code: 'E76A', char: '\ue76a', category: 'Development', aliases: ['Clojure'], description: 'Clojure language' },
  'lang-crystal': { id: 'lang-crystal', name: 'Crystal', code: 'E62F', char: '\ue62f', category: 'Development', aliases: ['Crystal'], description: 'Crystal language' },
  'lang-haskell': { id: 'lang-haskell', name: 'Haskell', code: 'E777', char: '\ue777', category: 'Development', aliases: ['Haskell'], description: 'Haskell language' },
  'lang-julia': { id: 'lang-julia', name: 'Julia', code: 'E624', char: '\ue624', category: 'Development', aliases: ['Julia'], description: 'Julia language' },
  'lang-ocaml': { id: 'lang-ocaml', name: 'OCaml', code: 'E67A', char: '\ue67a', category: 'Development', aliases: ['OCaml'], description: 'OCaml language' },
  'lang-perl': { id: 'lang-perl', name: 'Perl', code: 'E769', char: '\ue769', category: 'Development', aliases: ['Perl'], description: 'Perl language' },
  'lang-swift': { id: 'lang-swift', name: 'Swift', code: 'E755', char: '\ue755', category: 'Development', aliases: ['Swift'], description: 'Swift language' },
  'lang-kotlin': { id: 'lang-kotlin', name: 'Kotlin', code: 'E81B', char: '\ue81b', category: 'Development', aliases: ['Kotlin'], description: 'Kotlin language' },
  'lang-php': { id: 'lang-php', name: 'PHP', code: 'E73D', char: '\ue73d', category: 'Development', aliases: ['PHP'], description: 'PHP language' },
  'lang-lua': { id: 'lang-lua', name: 'Lua', code: 'E620', char: '\ue620', category: 'Development', aliases: ['Lua'], description: 'Lua language' },
  'lang-r': { id: 'lang-r', name: 'R', code: 'F25D', char: '\uf25d', category: 'Development', aliases: ['R'], description: 'R language' },
  'lang-dart': { id: 'lang-dart', name: 'Dart', code: 'E64C', char: '\ue64c', category: 'Development', aliases: ['Dart'], description: 'Dart language' },
  'lang-elixir': { id: 'lang-elixir', name: 'Elixir', code: 'E62D', char: '\ue62d', category: 'Development', aliases: ['Elixir'], description: 'Elixir language' },
  'lang-vala': { id: 'lang-vala', name: 'Vala', code: 'E8D1', char: '\ue8d1', category: 'Development', aliases: ['Vala'], description: 'Vala language' },
  'lang-v': { id: 'lang-v', name: 'V', code: 'E6AC', char: '\ue6ac', category: 'Development', aliases: ['V', 'vlang'], description: 'V language' },
  'lang-zig': { id: 'lang-zig', name: 'Zig', code: 'E6A9', char: '\ue6a9', category: 'Development', aliases: ['Zig'], description: 'Zig language' },
  'lang-powershell': { id: 'lang-powershell', name: 'PowerShell', code: 'F489', char: '\uf489', category: 'Development', aliases: ['PowerShell', 'Bash', 'Shell'], description: 'PowerShell/Shell' },
  'fw-react': { id: 'fw-react', name: 'React', code: 'E7BA', char: '\ue7ba', category: 'Development', aliases: ['React', 'jsx'], description: 'React framework' },
  'fw-vue': { id: 'fw-vue', name: 'Vue', code: 'E6A0', char: '\ue6a0', category: 'Development', aliases: ['Vue', 'vuejs'], description: 'Vue.js framework' },
  'fw-angular': { id: 'fw-angular', name: 'Angular', code: 'E753', char: '\ue753', category: 'Development', aliases: ['Angular', 'ng'], description: 'Angular framework' },
  'fw-svelte': { id: 'fw-svelte', name: 'Svelte', code: 'E697', char: '\ue697', category: 'Development', aliases: ['Svelte'], description: 'Svelte framework' },
  'fw-nextjs': { id: 'fw-nextjs', name: 'Next.js', code: 'E718', char: '\ue718', category: 'Development', aliases: ['NextJS', 'next'], description: 'Next.js framework' },
  'fw-django': { id: 'fw-django', name: 'Django', code: 'E71D', char: '\ue71d', category: 'Development', aliases: ['Django'], description: 'Django framework' },
  'fw-flask': { id: 'fw-flask', name: 'Flask', code: 'E73C', char: '\ue73c', category: 'Development', aliases: ['Flask'], description: 'Flask framework' },
  'fw-rails': { id: 'fw-rails', name: 'Rails', code: 'E73B', char: '\ue73b', category: 'Development', aliases: ['Rails', 'rubyonrails'], description: 'Ruby on Rails' },
  'fw-laravel': { id: 'fw-laravel', name: 'Laravel', code: 'E73F', char: '\ue73f', category: 'Development', aliases: ['Laravel'], description: 'Laravel framework' },
  'pkg-npm': { id: 'pkg-npm', name: 'NPM', code: 'E71E', char: '\ue71e', category: 'Development', aliases: ['NPM'], description: 'NPM package manager' },
  'pkg-yarn': { id: 'pkg-yarn', name: 'Yarn', code: 'E6A7', char: '\ue6a7', category: 'Development', aliases: ['Yarn'], description: 'Yarn package manager' },
  'pkg-pnpm': { id: 'pkg-pnpm', name: 'PNPM', code: 'E865', char: '\ue865', category: 'Development', aliases: ['PNPM', 'pnpm'], description: 'PNPM package manager' },
  'pkg-deno': { id: 'pkg-deno', name: 'Deno', code: 'E7C0', char: '\ue7c0', category: 'Development', aliases: ['Deno'], description: 'Deno runtime' },
  'fw-flutter': { id: 'fw-flutter', name: 'Flutter', code: 'E7DD', char: '\ue7dd', category: 'Development', aliases: ['Flutter', 'dart-flutter'], description: 'Flutter framework' },
  'tool-maven': { id: 'tool-maven', name: 'Maven', code: 'E674', char: '\ue674', category: 'Development', aliases: ['Maven', 'mvn'], description: 'Apache Maven' },
  'tool-helm': { id: 'tool-helm', name: 'Helm', code: 'E7FB', char: '\ue7fb', category: 'Development', aliases: ['Helm', 'Ship'], description: 'Helm/Kubernetes ship' },
  'tool-hammer': { id: 'tool-hammer', name: 'Hammer', code: 'F6E3', char: '\uf6e3', category: 'Development', aliases: ['hammer', 'build'], description: 'Hammer build tool' },
  'test-jest': { id: 'test-jest', name: 'Jest', code: 'E60B', char: '\ue60b', category: 'Development', aliases: ['Jest', 'testing'], description: 'Jest testing framework' },
  'test-cypress': { id: 'test-cypress', name: 'Cypress', code: 'E64B', char: '\ue64b', category: 'Development', aliases: ['Cypress', 'e2e'], description: 'Cypress E2E testing' },
  'dev-terminal': { id: 'dev-terminal', name: 'Terminal', code: 'F120', char: '\uf120', category: 'Development', aliases: ['Terminal', 'Command', 'console'], description: 'Terminal or command line' },
  'dev-database': { id: 'dev-database', name: 'Database', code: 'F1C0', char: '\uf1c0', category: 'Development', aliases: ['Database', 'db'], description: 'Database' },
  'dev-server': { id: 'dev-server', name: 'Server', code: 'F233', char: '\uf233', category: 'Development', aliases: ['Server'], description: 'Server' },
  'dev-hash': { id: 'dev-hash', name: 'Hash', code: 'F292', char: '\uf292', category: 'Development', aliases: ['Hash', 'hashtag'], description: 'Hash symbol' },

  // === VERSION CONTROL ===
  'vcs-github': { id: 'vcs-github', name: 'GitHub', code: 'F09B', char: '\uf09b', category: 'Version Control', aliases: ['github', 'Github'], description: 'GitHub platform' },
  'vcs-git-branch': { id: 'vcs-git-branch', name: 'Git Branch', code: 'E0A0', char: '\ue0a0', category: 'Version Control', aliases: ['git_branch', 'GitBranch'], description: 'Git branch' },
  'vcs-git-merge': { id: 'vcs-git-merge', name: 'Git Merge', code: 'F126', char: '\uf126', category: 'Version Control', aliases: ['GitMerge', 'pull-request'], description: 'Git merge or pull request' },
  'vcs-git-commit': { id: 'vcs-git-commit', name: 'Git Commit', code: 'F417', char: '\uf417', category: 'Version Control', aliases: ['GitCommit', 'commit'], description: 'Git commit' },
  'vcs-fossil': { id: 'vcs-fossil', name: 'Fossil', code: 'EE9A', char: '\uee9a', category: 'Version Control', aliases: ['Fossil', 'Bone'], description: 'Fossil version control' },
  'vcs-sapling': { id: 'vcs-sapling', name: 'Sapling', code: 'F1BB', char: '\uf1bb', category: 'Version Control', aliases: ['Sapling', 'Sprout'], description: 'Sapling version control' },
  'vcs-subversion': { id: 'vcs-subversion', name: 'Subversion', code: 'F126', char: '\uf126', category: 'Version Control', aliases: ['Subversion', 'svn'], description: 'Subversion (SVN)' },
  'vcs-mercurial': { id: 'vcs-mercurial', name: 'Mercurial', code: 'EBAB', char: '\uebab', category: 'Version Control', aliases: ['Mercurial', 'hg'], description: 'Mercurial version control' },
  'vcs-tag': { id: 'vcs-tag', name: 'Tag', code: 'F02B', char: '\uf02b', category: 'Version Control', aliases: ['Tag', 'label', 'version'], description: 'Tag or label' },

  // === CLOUD & INFRASTRUCTURE ===
  'cloud-azure': { id: 'cloud-azure', name: 'Azure', code: 'EBD8', char: '\uebd8', category: 'Cloud & Infrastructure', aliases: ['Azure'], description: 'Microsoft Azure' },
  'cloud-aws': { id: 'cloud-aws', name: 'AWS', code: 'E7AD', char: '\ue7ad', category: 'Cloud & Infrastructure', aliases: ['AWS'], description: 'Amazon Web Services' },
  'cloud-gcp': { id: 'cloud-gcp', name: 'Google Cloud', code: 'E7F1', char: '\ue7f1', category: 'Cloud & Infrastructure', aliases: ['GCP', 'google-cloud'], description: 'Google Cloud Platform' },
  'cloud-kubernetes': { id: 'cloud-kubernetes', name: 'Kubernetes', code: 'E81D', char: '\ue81d', category: 'Cloud & Infrastructure', aliases: ['Kubernetes', 'k8s'], description: 'Kubernetes container orchestration' },
  'cloud-docker': { id: 'cloud-docker', name: 'Docker', code: 'F308', char: '\uf308', category: 'Cloud & Infrastructure', aliases: ['Docker'], description: 'Docker containerization' },
  'cloud-terraform': { id: 'cloud-terraform', name: 'Terraform', code: 'E8BD', char: '\ue8bd', category: 'Cloud & Infrastructure', aliases: ['Terraform'], description: 'Terraform infrastructure' },
  'cloud-pulumi': { id: 'cloud-pulumi', name: 'Pulumi', code: 'E873', char: '\ue873', category: 'Cloud & Infrastructure', aliases: ['Pulumi'], description: 'Pulumi infrastructure as code' },
  'cloud-generic': { id: 'cloud-generic', name: 'Cloud', code: 'F0C2', char: '\uf0c2', category: 'Cloud & Infrastructure', aliases: ['Cloud', 'CloudCog'], description: 'Generic cloud' },
  'devops-jenkins': { id: 'devops-jenkins', name: 'Jenkins', code: 'E767', char: '\ue767', category: 'Cloud & Infrastructure', aliases: ['Jenkins', 'ci'], description: 'Jenkins CI/CD' },
  'devops-gitlab': { id: 'devops-gitlab', name: 'GitLab', code: 'E7EB', char: '\ue7eb', category: 'Cloud & Infrastructure', aliases: ['GitLab', 'cicd'], description: 'GitLab DevOps' },
  'devops-argocd': { id: 'devops-argocd', name: 'Argo CD', code: 'E734', char: '\ue734', category: 'Cloud & Infrastructure', aliases: ['ArgoCD', 'argocd', 'argo'], description: 'Argo CD GitOps' },

  // === DATA & STORAGE ===
  'db-mongodb': { id: 'db-mongodb', name: 'MongoDB', code: 'E704', char: '\ue704', category: 'Data & Storage', aliases: ['MongoDB', 'mongo'], description: 'MongoDB database' },
  'db-postgresql': { id: 'db-postgresql', name: 'PostgreSQL', code: 'E76E', char: '\ue76e', category: 'Data & Storage', aliases: ['PostgreSQL', 'postgres'], description: 'PostgreSQL database' },
  'db-redis': { id: 'db-redis', name: 'Redis', code: 'E76D', char: '\ue76d', category: 'Data & Storage', aliases: ['Redis', 'cache'], description: 'Redis cache' },
  'db-firebase': { id: 'db-firebase', name: 'Firebase', code: 'E657', char: '\ue657', category: 'Data & Storage', aliases: ['Firebase'], description: 'Firebase database' },

  // === FILES & FOLDERS ===
  'file-json': { id: 'file-json', name: 'JSON File', code: 'E60B', char: '\ue60b', category: 'Files & Folders', aliases: ['fileJson', 'json'], description: 'JSON file' },
  'file-code': { id: 'file-code', name: 'Code File', code: 'F1C9', char: '\uf1c9', category: 'Files & Folders', aliases: ['fileCode', 'source'], description: 'Source code file' },
  'file-text': { id: 'file-text', name: 'Text File', code: 'F15C', char: '\uf15c', category: 'Files & Folders', aliases: ['FileText', 'text'], description: 'Text file' },
  'file-generic': { id: 'file-generic', name: 'File', code: 'F15B', char: '\uf15b', category: 'Files & Folders', aliases: ['File', 'document'], description: 'Generic file' },
  'folder-closed': { id: 'folder-closed', name: 'Folder', code: 'F07B', char: '\uf07b', category: 'Files & Folders', aliases: ['Folder', 'directory'], description: 'Closed folder' },
  'folder-open': { id: 'folder-open', name: 'Folder Open', code: 'F07C', char: '\uf07c', category: 'Files & Folders', aliases: ['FolderOpen', 'open'], description: 'Open folder' },
  'file-package': { id: 'file-package', name: 'Package', code: 'EB30', char: '\ueb30', category: 'Files & Folders', aliases: ['Package', 'archive', 'Box', 'Project'], description: 'Package or project' },

  // === SYMBOLS & OBJECTS ===
  'symbol-diamond': { id: 'symbol-diamond', name: 'Diamond', code: 'F219', char: '\uf219', category: 'Symbols & Objects', aliases: ['Diamond', 'gem'], description: 'Diamond or gem' },
  'symbol-gem': { id: 'symbol-gem', name: 'Gem', code: 'F219', char: '\uf219', category: 'Symbols & Objects', aliases: ['Gem', 'jewel'], description: 'Gem or jewel' },
  'symbol-crown': { id: 'symbol-crown', name: 'Crown', code: 'F521', char: '\uf521', category: 'Symbols & Objects', aliases: ['Crown', 'premium'], description: 'Crown or premium' },
  'symbol-heart': { id: 'symbol-heart', name: 'Heart', code: 'F004', char: '\uf004', category: 'Symbols & Objects', aliases: ['Heart', 'love', 'favorite'], description: 'Heart or love' },
  'symbol-shield': { id: 'symbol-shield', name: 'Shield', code: 'F132', char: '\uf132', category: 'Symbols & Objects', aliases: ['Shield', 'security', 'protection'], description: 'Shield or security' },
  'symbol-trophy': { id: 'symbol-trophy', name: 'Trophy', code: 'F091', char: '\uf091', category: 'Symbols & Objects', aliases: ['Trophy', 'award', 'achievement'], description: 'Trophy or achievement' },
  'symbol-flag': { id: 'symbol-flag', name: 'Flag', code: 'F024', char: '\uf024', category: 'Symbols & Objects', aliases: ['Flag', 'marker'], description: 'Flag or marker' },
  'symbol-bookmark': { id: 'symbol-bookmark', name: 'Bookmark', code: 'F02E', char: '\uf02e', category: 'Symbols & Objects', aliases: ['Bookmark', 'save'], description: 'Bookmark or save' },
  'symbol-shirt': { id: 'symbol-shirt', name: 'Shirt', code: 'EE1C', char: '\uee1c', category: 'Symbols & Objects', aliases: ['Shirt', 'tshirt'], description: 'Shirt or clothing' },
  'symbol-music': { id: 'symbol-music', name: 'Music', code: 'F001', char: '\uf001', category: 'Symbols & Objects', aliases: ['Music', 'note'], description: 'Music note' },
  'symbol-headphones': { id: 'symbol-headphones', name: 'Headphones', code: 'F025', char: '\uf025', category: 'Symbols & Objects', aliases: ['Headphones', 'audio'], description: 'Headphones or audio' },
  'symbol-beer': { id: 'symbol-beer', name: 'Beer', code: 'F0FC', char: '\uf0fc', category: 'Symbols & Objects', aliases: ['Beer', 'brew', 'drink'], description: 'Beer or brewing' },
  'symbol-gamepad': { id: 'symbol-gamepad', name: 'Gamepad', code: 'F11B', char: '\uf11b', category: 'Symbols & Objects', aliases: ['Gamepad', 'game', 'gaming'], description: 'Gaming controller' },
  'symbol-umbrella': { id: 'symbol-umbrella', name: 'Umbrella', code: 'F0E9', char: '\uf0e9', category: 'Symbols & Objects', aliases: ['Umbrella', 'protection'], description: 'Umbrella or protection' },
  'symbol-atom': { id: 'symbol-atom', name: 'Atom', code: 'E764', char: '\ue764', category: 'Symbols & Objects', aliases: ['Atom', 'science', 'pulsar'], description: 'Atom or science' },

  // === NATURE & WEATHER ===
  'nature-sprout': { id: 'nature-sprout', name: 'Sprout', code: 'F4D8', char: '\uf4d8', category: 'Nature & Weather', aliases: ['Sprout', 'seedling', 'plant'], description: 'Sprout or seedling' },
  'weather-sunny': { id: 'weather-sunny', name: 'Sunny', code: 'F185', char: '\uf185', category: 'Nature & Weather', aliases: ['sunny', 'sun', 'Sun', 'clear'], description: 'Clear sunny weather' },
  'weather-cloudy': { id: 'weather-cloudy', name: 'Cloudy', code: 'F0C2', char: '\uf0c2', category: 'Nature & Weather', aliases: ['cloudy', 'cloud', 'Cloud'], description: 'Cloudy conditions' },
  'weather-rainy': { id: 'weather-rainy', name: 'Rainy', code: 'F043', char: '\uf043', category: 'Nature & Weather', aliases: ['rainy', 'rain', 'Droplet', 'droplet'], description: 'Rain or precipitation' },
  'weather-stormy': { id: 'weather-stormy', name: 'Storm', code: 'F0E7', char: '\uf0e7', category: 'Nature & Weather', aliases: ['storm', 'lightning', 'thunderstorm', 'Zap'], description: 'Stormy weather' },
  'symbol-flame': { id: 'symbol-flame', name: 'Flame', code: 'F06D', char: '\uf06d', category: 'Nature & Weather', aliases: ['Flame', 'Fire', 'fire', 'hot'], description: 'Flame or fire' },

  // === MISCELLANEOUS ===
  'misc-book': { id: 'misc-book', name: 'Book', code: 'F02D', char: '\uf02d', category: 'Miscellaneous', aliases: ['book', 'Book', 'documentation'], description: 'Book or documentation' },
  'misc-rocket': { id: 'misc-rocket', name: 'Rocket', code: 'F135', char: '\uf135', category: 'Miscellaneous', aliases: ['Rocket', 'launch'], description: 'Rocket or launch' },
  'misc-coffee': { id: 'misc-coffee', name: 'Coffee', code: 'F0F4', char: '\uf0f4', category: 'Miscellaneous', aliases: ['Coffee', 'drink', 'java'], description: 'Coffee break' },
  'misc-puzzle': { id: 'misc-puzzle', name: 'Puzzle', code: 'F12E', char: '\uf12e', category: 'Miscellaneous', aliases: ['Puzzle', 'solution'], description: 'Puzzle or solution' },
  'misc-lightbulb': { id: 'misc-lightbulb', name: 'Lightbulb', code: 'F0EB', char: '\uf0eb', category: 'Miscellaneous', aliases: ['lightbulb', 'Lightbulb', 'idea'], description: 'Idea or inspiration' },
  'misc-moon': { id: 'misc-moon', name: 'Moon', code: 'F186', char: '\uf186', category: 'Miscellaneous', aliases: ['moon', 'Moon', 'night'], description: 'Moon or nighttime' },
  'misc-star': { id: 'misc-star', name: 'Star', code: 'F005', char: '\uf005', category: 'Miscellaneous', aliases: ['Star', 'favorite', 'Sparkles'], description: 'Star or favorite' },
  'misc-video': { id: 'misc-video', name: 'Video', code: 'F03D', char: '\uf03d', category: 'Miscellaneous', aliases: ['Video', 'camera', 'stream'], description: 'Video or streaming' },
  'misc-chart': { id: 'misc-chart', name: 'Bar Chart', code: 'F080', char: '\uf080', category: 'Miscellaneous', aliases: ['BarChart', 'BarChart3', 'analytics'], description: 'Bar chart or analytics' },
  'misc-clock': { id: 'misc-clock', name: 'Clock', code: 'F017', char: '\uf017', category: 'Miscellaneous', aliases: ['Clock', 'Timer', 'time'], description: 'Clock or timer' },
  'misc-battery': { id: 'misc-battery', name: 'Battery', code: 'F240', char: '\uf240', category: 'Miscellaneous', aliases: ['Battery', 'power'], description: 'Battery or power level' },

  // === ADDITIONAL DEVELOPMENT TOOLS ===
  'tool-bazel': { id: 'tool-bazel', name: 'Bazel', code: 'E63A', char: '\ue63a', category: 'Development', aliases: ['Bazel', 'build'], description: 'Bazel build system' },
  'tool-cmake': { id: 'tool-cmake', name: 'CMake', code: 'E794', char: '\ue794', category: 'Development', aliases: ['CMake', 'cmake'], description: 'CMake build system' },
  'tool-gradle': { id: 'tool-gradle', name: 'Gradle', code: 'E887', char: '\ue887', category: 'Development', aliases: ['Gradle', 'gradle'], description: 'Gradle build tool' },
  'lang-bun': { id: 'lang-bun', name: 'Bun', code: 'E76F', char: '\ue76f', category: 'Development', aliases: ['Bun', 'bun'], description: 'Bun JavaScript runtime' },
  'lang-typescript': { id: 'lang-typescript', name: 'TypeScript', code: 'E628', char: '\ue628', category: 'Development', aliases: ['TypeScript', 'ts'], description: 'TypeScript language' },
  'lang-scala': { id: 'lang-scala', name: 'Scala', code: 'E737', char: '\ue737', category: 'Development', aliases: ['Scala', 'scala'], description: 'Scala language' },
  'lang-groovy': { id: 'lang-groovy', name: 'Groovy', code: 'E775', char: '\ue775', category: 'Development', aliases: ['Groovy', 'groovy'], description: 'Groovy language' },
  'lang-erlang': { id: 'lang-erlang', name: 'Erlang', code: 'E7B1', char: '\ue7b1', category: 'Development', aliases: ['Erlang', 'erlang'], description: 'Erlang language' },
  'lang-elm': { id: 'lang-elm', name: 'Elm', code: 'E62C', char: '\ue62c', category: 'Development', aliases: ['Elm', 'elm'], description: 'Elm language' },
  'lang-fsharp': { id: 'lang-fsharp', name: 'F#', code: 'E7A7', char: '\ue7a7', category: 'Development', aliases: ['FSharp', 'fsharp', 'F#'], description: 'F# language' },
  'lang-fortran': { id: 'lang-fortran', name: 'Fortran', code: 'E7DE', char: '\ue7de', category: 'Development', aliases: ['Fortran', 'fortran'], description: 'Fortran language' },
  'fw-tauri': { id: 'fw-tauri', name: 'Tauri', code: 'E8BB', char: '\ue8bb', category: 'Development', aliases: ['Tauri', 'tauri'], description: 'Tauri framework' },
  'fw-aurelia': { id: 'fw-aurelia', name: 'Aurelia', code: 'EAC4', char: '\ueac4', category: 'Development', aliases: ['Aurelia', 'aurelia'], description: 'Aurelia framework' },
  'lang-c': { id: 'lang-c', name: 'C', code: 'E61E', char: '\ue61e', category: 'Development', aliases: ['C', 'clang'], description: 'C language' },
  'lang-cpp': { id: 'lang-cpp', name: 'C++', code: 'E61D', char: '\ue61d', category: 'Development', aliases: ['Cpp', 'C++', 'cplusplus'], description: 'C++ language' },

  // === CLOUD & INFRASTRUCTURE ADDITIONS ===
  'cloud-nix': { id: 'cloud-nix', name: 'NixOS', code: 'F313', char: '\uf313', category: 'Cloud & Infrastructure', aliases: ['NixOS', 'Nix', 'nix'], description: 'NixOS/Nix package manager' },
  'cloud-azure-devops': { id: 'cloud-azure-devops', name: 'Azure DevOps', code: 'EBE8', char: '\uebe8', category: 'Cloud & Infrastructure', aliases: ['AzureDevOps', 'devops'], description: 'Azure DevOps' },

  // === GAMING & TOOLS ===
  'tool-unity': { id: 'tool-unity', name: 'Unity', code: 'E721', char: '\ue721', category: 'Development', aliases: ['Unity', 'unity'], description: 'Unity game engine' },
  'tool-umbraco': { id: 'tool-umbraco', name: 'Umbraco', code: 'EFBF', char: '\uefbf', category: 'Development', aliases: ['Umbraco', 'umbraco'], description: 'Umbraco CMS' },

  // === AI & SERVICES ===
  'ai-copilot': { id: 'ai-copilot', name: 'GitHub Copilot', code: 'EC1E', char: '\uec1e', category: 'Development', aliases: ['Copilot', 'copilot', 'ai'], description: 'GitHub Copilot AI assistant' },
  'ai-robot': { id: 'ai-robot', name: 'Robot', code: 'EE0D', char: '\uee0d', category: 'Symbols & Objects', aliases: ['Robot', 'bot', 'ai', 'Claude'], description: 'Robot or AI assistant' },

  // === FITNESS & HEALTH ===
  'health-running': { id: 'health-running', name: 'Running', code: 'EF0C', char: '\uef0c', category: 'Miscellaneous', aliases: ['Running', 'strava', 'fitness'], description: 'Running or fitness' },
  'health-heartbeat': { id: 'health-heartbeat', name: 'Heartbeat', code: 'F21E', char: '\uf21e', category: 'Miscellaneous', aliases: ['Heartbeat', 'health', 'pulse'], description: 'Heart rate or health' },

  // === TOOLTIPS & COMMENTS ===
  'misc-comment': { id: 'misc-comment', name: 'Comment', code: 'F075', char: '\uf075', category: 'Miscellaneous', aliases: ['comment', 'tooltip', 'speech'], description: 'Comment or tooltip' },
  'misc-comment-plus': { id: 'misc-comment-plus', name: 'Comment Plus', code: 'F4B5', char: '\uf4b5', category: 'Miscellaneous', aliases: ['comment-add', 'tooltip-add'], description: 'Add comment or tooltip' },
  'misc-comments': { id: 'misc-comments', name: 'Comments', code: 'F086', char: '\uf086', category: 'Miscellaneous', aliases: ['comments', 'chat', 'discussion'], description: 'Multiple comments' },
  'misc-edit': { id: 'misc-edit', name: 'Edit', code: 'F044', char: '\uf044', category: 'Miscellaneous', aliases: ['edit', 'pencil', 'modify'], description: 'Edit or modify' },
  'misc-keyboard': { id: 'misc-keyboard', name: 'Keyboard', code: 'F11C', char: '\uf11c', category: 'Miscellaneous', aliases: ['keyboard', 'input', 'type'], description: 'Keyboard or input' },
  'misc-terminal': { id: 'misc-terminal', name: 'Terminal', code: 'F120', char: '\uf120', category: 'Miscellaneous', aliases: ['terminal', 'console', 'command'], description: 'Terminal or console' },
  'misc-clipboard': { id: 'misc-clipboard', name: 'Clipboard', code: 'F328', char: '\uf328', category: 'Miscellaneous', aliases: ['clipboard', 'copy', 'paste'], description: 'Clipboard' },

  // === FILES & FOLDERS ===
  'ui-folder': { id: 'ui-folder', name: 'Folder', code: 'F07B', char: '\uf07b', category: 'Files & Folders', aliases: ['folder', 'directory'], description: 'Folder or directory' },
  'ui-package': { id: 'ui-package', name: 'Package', code: 'F466', char: '\uf466', category: 'Files & Folders', aliases: ['package', 'box', 'archive'], description: 'Package or box' },

  // === MUSIC SERVICES ===
  'service-spotify': { id: 'service-spotify', name: 'Spotify', code: 'F1BC', char: '\uf1bc', category: 'Miscellaneous', aliases: ['Spotify', 'spotify'], description: 'Spotify music' },
  'service-lastfm': { id: 'service-lastfm', name: 'Last.fm', code: 'F202', char: '\uf202', category: 'Miscellaneous', aliases: ['Lastfm', 'lastfm'], description: 'Last.fm music' },
  'service-youtube': { id: 'service-youtube', name: 'YouTube', code: 'F16A', char: '\uf16a', category: 'Miscellaneous', aliases: ['YouTube', 'youtube'], description: 'YouTube' },

  // === DATA PROTOCOL ===
  'tool-buf': { id: 'tool-buf', name: 'Buf', code: 'E7A1', char: '\ue7a1', category: 'Development', aliases: ['Buf', 'protobuf'], description: 'Buf Protocol Buffers' },
  'tool-quasar': { id: 'tool-quasar', name: 'Quasar', code: 'E87F', char: '\ue87f', category: 'Development', aliases: ['Quasar', 'quasar'], description: 'Quasar framework' },

  // === OPERATING SYSTEMS ===
  'os-windows': { id: 'os-windows', name: 'Windows', code: 'E70F', char: '\ue70f', category: 'Cloud & Infrastructure', aliases: ['Windows', 'windows'], description: 'Windows OS' },
  'os-linux': { id: 'os-linux', name: 'Linux', code: 'F31A', char: '\uf31a', category: 'Cloud & Infrastructure', aliases: ['Linux', 'linux', 'tux'], description: 'Linux OS' },
  'os-apple': { id: 'os-apple', name: 'Apple', code: 'F302', char: '\uf302', category: 'Cloud & Infrastructure', aliases: ['Apple', 'macos', 'osx'], description: 'macOS/Apple' },

  // === ENVIRONMENT & SUSTAINABILITY ===
  'env-carbon': { id: 'env-carbon', name: 'Carbon', code: 'F06C', char: '\uf06c', category: 'Miscellaneous', aliases: ['Carbon', 'carbon', 'co2', 'environment'], description: 'Carbon or environmental footprint' },

  // === ADDITIONAL UTILITY ICONS ===
  'status-bolt': { id: 'status-bolt', name: 'Bolt', code: 'F0E7', char: '\uf0e7', category: 'Symbols & Objects', aliases: ['Bolt', 'lightning', 'power', 'root'], description: 'Power or lightning bolt' },
  'status-sudo': { id: 'status-sudo', name: 'Sudo', code: 'F09C', char: '\uf09c', category: 'Symbols & Objects', aliases: ['Sudo', 'unlock', 'admin'], description: 'Admin or superuser' },

  // === COMMONLY USED OH MY POSH ICONS ===
  // Powerline Symbols (complete set - all 19 symbols from symbols.ts)
  'powerline-e0b0': { id: 'powerline-e0b0', name: 'Left Hard Divider', code: 'E0B0', char: '\ue0b0', category: 'Powerline', aliases: ['powerline', 'separator', 'right-filled'], description: 'Left Hard Divider' },
  'powerline-e0b1': { id: 'powerline-e0b1', name: 'Left Soft Divider', code: 'E0B1', char: '\ue0b1', category: 'Powerline', aliases: ['powerline', 'separator', 'right-outline'], description: 'Left Soft Divider' },
  'powerline-e0b2': { id: 'powerline-e0b2', name: 'Right Hard Divider', code: 'E0B2', char: '\ue0b2', category: 'Powerline', aliases: ['powerline', 'separator', 'left-filled'], description: 'Right Hard Divider' },
  'powerline-e0b3': { id: 'powerline-e0b3', name: 'Right Soft Divider', code: 'E0B3', char: '\ue0b3', category: 'Powerline', aliases: ['powerline', 'separator', 'left-outline'], description: 'Right Soft Divider' },
  'powerline-e0b4': { id: 'powerline-e0b4', name: 'Right Half Circle Thick', code: 'E0B4', char: '\ue0b4', category: 'Powerline', aliases: ['powerline', 'separator', 'circle-thick'], description: 'Right Half Circle Thick' },
  'powerline-e0b5': { id: 'powerline-e0b5', name: 'Right Half Circle Thin', code: 'E0B5', char: '\ue0b5', category: 'Powerline', aliases: ['powerline', 'separator', 'circle-thin'], description: 'Right Half Circle Thin' },
  'powerline-e0b6': { id: 'powerline-e0b6', name: 'Left Half Circle Thick', code: 'E0B6', char: '\ue0b6', category: 'Powerline', aliases: ['powerline', 'separator', 'circle-thick'], description: 'Left Half Circle Thick' },
  'powerline-e0b7': { id: 'powerline-e0b7', name: 'Left Half Circle Thin', code: 'E0B7', char: '\ue0b7', category: 'Powerline', aliases: ['powerline', 'separator', 'circle-thin'], description: 'Left Half Circle Thin' },
  'powerline-e0bc': { id: 'powerline-e0bc', name: 'Upper Left Triangle', code: 'E0BC', char: '\ue0bc', category: 'Powerline', aliases: ['powerline', 'separator', 'triangle'], description: 'Upper Left Triangle' },
  'powerline-e0be': { id: 'powerline-e0be', name: 'Upper Right Triangle', code: 'E0BE', char: '\ue0be', category: 'Powerline', aliases: ['powerline', 'separator', 'triangle'], description: 'Upper Right Triangle' },
  'powerline-e0c0': { id: 'powerline-e0c0', name: 'Flame Thick', code: 'E0C0', char: '\ue0c0', category: 'Powerline', aliases: ['powerline', 'separator', 'flame'], description: 'Flame Thick' },
  'powerline-e0c2': { id: 'powerline-e0c2', name: 'Flame Thick Mirrored', code: 'E0C2', char: '\ue0c2', category: 'Powerline', aliases: ['powerline', 'separator', 'flame'], description: 'Flame Thick Mirrored' },
  'powerline-e0c4': { id: 'powerline-e0c4', name: 'Pixelated Squares Small', code: 'E0C4', char: '\ue0c4', category: 'Powerline', aliases: ['powerline', 'separator', 'pixel'], description: 'Pixelated Squares Small' },
  'powerline-e0c6': { id: 'powerline-e0c6', name: 'Pixelated Squares Big', code: 'E0C6', char: '\ue0c6', category: 'Powerline', aliases: ['powerline', 'separator', 'pixel'], description: 'Pixelated Squares Big' },
  'powerline-e0c8': { id: 'powerline-e0c8', name: 'Ice Waveform', code: 'E0C8', char: '\ue0c8', category: 'Powerline', aliases: ['powerline', 'separator', 'wave'], description: 'Ice Waveform' },
  'powerline-e0cc': { id: 'powerline-e0cc', name: 'Honeycomb', code: 'E0CC', char: '\ue0cc', category: 'Powerline', aliases: ['powerline', 'separator', 'hex'], description: 'Honeycomb' },
  'powerline-e0ce': { id: 'powerline-e0ce', name: 'Lego Separator', code: 'E0CE', char: '\ue0ce', category: 'Powerline', aliases: ['powerline', 'separator', 'lego'], description: 'Lego Separator' },
  'powerline-e0d2': { id: 'powerline-e0d2', name: 'Trapezoid Top Bottom', code: 'E0D2', char: '\ue0d2', category: 'Powerline', aliases: ['powerline', 'separator', 'trapezoid'], description: 'Trapezoid Top Bottom' },
  'powerline-e0d4': { id: 'powerline-e0d4', name: 'Trapezoid Top Bottom Mirrored', code: 'E0D4', char: '\ue0d4', category: 'Powerline', aliases: ['powerline', 'separator', 'trapezoid'], description: 'Trapezoid Top Bottom Mirrored' },
  
  // Legacy aliases for backward compatibility
  'powerline-branch': { id: 'powerline-branch', name: 'Git Branch', code: 'E0A0', char: '\ue0a0', category: 'Powerline', aliases: ['branch', 'git'], description: 'Git branch icon' },
  'powerline-lock': { id: 'powerline-lock', name: 'Lock', code: 'E0A2', char: '\ue0a2', category: 'Powerline', aliases: ['lock', 'readonly'], description: 'Lock icon' },

  // Git SCM icons commonly used in themes
  'git-commit': { id: 'git-commit', name: 'Git Commit', code: 'F417', char: '\uf417', category: 'Development', aliases: ['commit', 'git'], description: 'Git commit' },
  'git-compare': { id: 'git-compare', name: 'Git Compare', code: 'F0AC', char: '\uf0ac', category: 'Development', aliases: ['compare', 'diff'], description: 'Git compare branches' },
  'git-merge': { id: 'git-merge', name: 'Git Merge', code: 'F419', char: '\uf419', category: 'Development', aliases: ['merge', 'git'], description: 'Git merge' },
  'git-pull-request': { id: 'git-pull-request', name: 'Pull Request', code: 'F3D4', char: '\uf3d4', category: 'Development', aliases: ['pr', 'pull'], description: 'Pull request' },
  'git-branch-delete': { id: 'git-branch-delete', name: 'Branch Delete', code: 'F46E', char: '\uf46e', category: 'Development', aliases: ['delete', 'remove'], description: 'Delete git branch' },

  // Language icons that appear frequently (note: most already exist above, only new ones added)
  'lang-php-alt': { id: 'lang-php-alt', name: 'PHP Alt', code: 'F81E', char: '\uf81e', category: 'Development', aliases: ['PHP', 'php', 'elephant'], description: 'PHP language alternative icon' },

  // Package managers - already exist above, no need to duplicate

  // Container & Docker
  'tool-docker-alt': { id: 'tool-docker-alt', name: 'Docker Alt', code: 'F308', char: '\uf308', category: 'Development', aliases: ['docker', 'container'], description: 'Docker alternative icon' },

  // Cloud provider icons
  'cloud-aws-alt': { id: 'cloud-aws-alt', name: 'AWS Alt', code: 'E7AD', char: '\ue7ad', category: 'Cloud & Infrastructure', aliases: ['aws', 'amazon'], description: 'AWS alternative icon' },
  'cloud-azure-alt': { id: 'cloud-azure-alt', name: 'Azure Alt', code: 'EBD8', char: '\uebd8', category: 'Cloud & Infrastructure', aliases: ['azure', 'microsoft'], description: 'Azure alternative icon' },

  // Terminal & System icons
  'term-zsh': { id: 'term-zsh', name: 'Zsh', code: 'E795', char: '\ue795', category: 'Development', aliases: ['zsh', 'shell'], description: 'Zsh shell' },
  'term-bash': { id: 'term-bash', name: 'Bash', code: 'EACC', char: '\ueacc', category: 'Development', aliases: ['bash', 'shell'], description: 'Bash shell' },
  'term-powershell': { id: 'term-powershell', name: 'PowerShell', code: 'E683', char: '\ue683', category: 'Development', aliases: ['powershell', 'pwsh'], description: 'PowerShell' },

  // Status & State icons
  'status-sync': { id: 'status-sync', name: 'Sync', code: 'F021', char: '\uf021', category: 'Symbols & Objects', aliases: ['sync', 'refresh'], description: 'Sync or refresh' },
  'status-time': { id: 'status-time', name: 'Time', code: 'F017', char: '\uf017', category: 'Symbols & Objects', aliases: ['time', 'clock', 'duration'], description: 'Time or duration' },
  'status-calendar': { id: 'status-calendar', name: 'Calendar', code: 'F073', char: '\uf073', category: 'Symbols & Objects', aliases: ['calendar', 'date'], description: 'Calendar or date' },
  'status-location': { id: 'status-location', name: 'Location', code: 'F041', char: '\uf041', category: 'Symbols & Objects', aliases: ['location', 'pin', 'marker'], description: 'Location or marker' },
  'status-history': { id: 'status-history', name: 'History', code: 'F1DA', char: '\uf1da', category: 'Symbols & Objects', aliases: ['history', 'undo'], description: 'History' },

  // File system icons
  'file-zip': { id: 'file-zip', name: 'Zip Archive', code: 'F410', char: '\uf410', category: 'Files & Folders', aliases: ['zip', 'archive', 'compress'], description: 'Zip file' },
  'file-config': { id: 'file-config', name: 'Config', code: 'E615', char: '\ue615', category: 'Files & Folders', aliases: ['config', 'settings'], description: 'Configuration file' },
  'file-binary': { id: 'file-binary', name: 'Binary', code: 'F471', char: '\uf471', category: 'Files & Folders', aliases: ['binary', 'exe'], description: 'Binary executable' },
  'file-symlink': { id: 'file-symlink', name: 'Symlink', code: 'F481', char: '\uf481', category: 'Files & Folders', aliases: ['symlink', 'link'], description: 'Symbolic link' },

  // Network & Communication
  'network-wifi': { id: 'network-wifi', name: 'WiFi', code: 'F1EB', char: '\uf1eb', category: 'Symbols & Objects', aliases: ['wifi', 'network', 'wireless'], description: 'WiFi network' },
  'network-signal': { id: 'network-signal', name: 'Signal', code: 'F012', char: '\uf012', category: 'Symbols & Objects', aliases: ['signal', 'connection'], description: 'Network signal' },
  'network-server': { id: 'network-server', name: 'Server', code: 'F233', char: '\uf233', category: 'Symbols & Objects', aliases: ['server', 'host'], description: 'Server' },

  // Additional utilities
  'util-filter': { id: 'util-filter', name: 'Filter', code: 'F0B0', char: '\uf0b0', category: 'Symbols & Objects', aliases: ['filter', 'funnel'], description: 'Filter' },
  'util-sort': { id: 'util-sort', name: 'Sort', code: 'F0DC', char: '\uf0dc', category: 'Symbols & Objects', aliases: ['sort', 'order'], description: 'Sort' },
  'util-magic': { id: 'util-magic', name: 'Magic', code: 'F0D0', char: '\uf0d0', category: 'Symbols & Objects', aliases: ['magic', 'wand'], description: 'Magic wand' },
  'util-shield': { id: 'util-shield', name: 'Shield', code: 'F132', char: '\uf132', category: 'Symbols & Objects', aliases: ['shield', 'security', 'protection'], description: 'Shield or security' },
  'util-crown': { id: 'util-crown', name: 'Crown', code: 'F521', char: '\uf521', category: 'Symbols & Objects', aliases: ['crown', 'premium'], description: 'Crown or premium' },
  
  // Music & Media
  'media-play': { id: 'media-play', name: 'Play', code: 'F04B', char: '\uf04b', category: 'Symbols & Objects', aliases: ['play', 'start'], description: 'Play button' },
  'media-pause': { id: 'media-pause', name: 'Pause', code: 'F04C', char: '\uf04c', category: 'Symbols & Objects', aliases: ['pause', 'stop'], description: 'Pause button' },
  'media-music': { id: 'media-music', name: 'Music', code: 'F001', char: '\uf001', category: 'Symbols & Objects', aliases: ['music', 'note'], description: 'Music note' },
  'media-headphones': { id: 'media-headphones', name: 'Headphones', code: 'F025', char: '\uf025', category: 'Symbols & Objects', aliases: ['headphones', 'audio'], description: 'Headphones' },

  // OS-specific icons that appear in themes (many already exist, adding missing ones)
  'os-rocky': { id: 'os-rocky', name: 'Rocky Linux', code: 'F32B', char: '\uf32b', category: 'Cloud & Infrastructure', aliases: ['rocky', 'linux'], description: 'Rocky Linux' },
};

// Export as array for backward compatibility
export const NERD_FONT_ICONS: NerdFontIcon[] = Object.values(NERD_FONT_ICONS_MAP);

// Export lookup functions for easy access
export const getIconById = (id: string): NerdFontIcon | undefined => {
  return NERD_FONT_ICONS_MAP[id];
};

export const getIconByName = (name: string): NerdFontIcon | undefined => {
  return NERD_FONT_ICONS.find(icon => icon.name === name);
};

export const getIconsByCategory = (category: string): NerdFontIcon[] => {
  return NERD_FONT_ICONS.filter(icon => icon.category === category);
};

export const getCategories = (): string[] => {
  const categories = new Set(NERD_FONT_ICONS.map(icon => icon.category));
  return Array.from(categories).sort();
};

export const searchIcons = (query: string): NerdFontIcon[] => {
  const lowerQuery = query.toLowerCase();
  return NERD_FONT_ICONS.filter(icon => 
    icon.id.includes(lowerQuery) ||
    icon.name.toLowerCase().includes(lowerQuery) ||
    (icon.description?.toLowerCase().includes(lowerQuery) || false) ||
    (icon.aliases?.some(alias => alias.toLowerCase().includes(lowerQuery)) || false)
  );
};

/**
 * Get icon character by ID - the primary lookup function
 * @param id The icon ID (e.g., 'ui-plus', 'lang-python')
 * @returns The unicode character or fallback question mark
 */
export const getIconChar = (id: string): string => {
  const icon = NERD_FONT_ICONS_MAP[id];
  if (icon) return icon.char;
  
  // Fallback to question mark
  return NERD_FONT_ICONS_MAP['status-question']?.char || '\uf128';
};
