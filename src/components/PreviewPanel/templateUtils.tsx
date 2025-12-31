import type { ReactNode } from 'react';
import type { Segment } from '../../types/ohmyposh';
import { mockData, getMockDataForSegment } from './mockData';

// Parse inline color codes from Oh My Posh templates
// Format: <#hexcolor>text</> or </>text (to reset)
export function parseInlineColors(text: string, defaultColor: string): ReactNode[] {
  const parts: ReactNode[] = [];
  // Match color start tags <#RRGGBB> or color end tags </>
  const tagRegex = /<#([0-9a-fA-F]{6})>|<\/>/g;
  let lastIndex = 0;
  let match;
  let currentColor = defaultColor;

  while ((match = tagRegex.exec(text)) !== null) {
    // Add text before the tag with current color
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      if (beforeText) {
        parts.push(
          <span key={`text-${lastIndex}`} style={{ color: currentColor }}>
            {beforeText}
          </span>
        );
      }
    }

    if (match[1]) {
      // Color start tag found - set new color
      currentColor = `#${match[1]}`;
    } else {
      // Color end tag </> - reset to default color
      currentColor = defaultColor;
    }

    lastIndex = tagRegex.lastIndex;
  }

  // Add remaining text after the last tag
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText) {
      parts.push(
        <span key={`text-${lastIndex}`} style={{ color: currentColor }}>
          {remainingText}
        </span>
      );
    }
  }

  return parts.length > 0 ? parts : [<span key="default">{text}</span>];
}

export function getPreviewText(
  segment: Segment,
  metadata?: { name: string; previewText?: string },
  useMockData: boolean = false
): string {
  // First priority: use template if available (shows inline colors and symbols)
  if (segment.template) {
    // Replace template variables with mock data (only if useMockData is true)
    let result = segment.template;
    
    // If not using mock data, just return the template with previewText or segment type
    if (!useMockData) {
      // For preview mode, just show the previewText or segment name
      return metadata?.previewText || metadata?.name || segment.type;
    }
    
    // Get segment-specific mock data (handles .Icon differently for music vs battery vs os)
    const segmentMockData = getMockDataForSegment(segment.type);
    
    // Handle nested properties (any depth) like .Working.Changed or .Premium.Percent.Gauge
    // Also handle method calls with parentheses like .Premium.Percent.Gauge()
    result = result.replace(/\{\{\s*\.([.\w]+)(\(\))?\s*\}\}/g, (_match, path) => {
      const keys = path.split('.');
      let value: any = segmentMockData;
      
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
      let value: any = segmentMockData;
      
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
      let value: any = segmentMockData;
      
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
      let value: any = segmentMockData;
      
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
        let value: any = segmentMockData;
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
      let value: any = segmentMockData;
      
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
    result = result.replace(/\{\{\s*\.CurrentDate\s*\|\s*date\s+\.Format\s*\}\}/g, segmentMockData.CurrentDate);
    result = result.replace(/\{\{\s*\.CurrentDate\s*\|\s*date\s+"([^"]+)"\s*\}\}/g, segmentMockData.CurrentDate);
    
    // Handle round function - {{ round .PhysicalPercentUsed .Precision }}
    result = result.replace(/\{\{\s*round\s+\.([.\w]+)(?:\s+\.Precision)?\s*\}\}/g, (_match, prop) => {
      const keys = prop.split('.');
      let value: any = segmentMockData;
      
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
      let value: any = segmentMockData;
      
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
