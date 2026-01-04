import type { ReactNode } from 'react';
import type { Segment } from '../../types/ohmyposh';
import { getMockDataForSegment } from './mockData';
import { 
  resolvePaletteColor, 
  isHexColor,
  NAMED_COLORS,
  isNamedColor,
} from '../../utils/paletteResolver';

// Parse inline color codes and HTML formatting from Oh My Posh templates
// Format: <#hexcolor>text</>, <p:palette-key>text</>, or </>text (to reset)
// HTML: <b>bold</b>, <i>italic</i>, <u>underline</u>, <s>strikethrough</s>
export function parseInlineColors(
  text: string, 
  defaultColor: string,
  palette: Record<string, string> = {}
): ReactNode[] {
  const parts: ReactNode[] = [];
  // Match color start tags <#RRGGBB>, palette tags <p:key-name>, color end tags </>, or HTML formatting tags
  const tagRegex = /<#([0-9a-fA-F]{6})>|<p:([\w-]+)>|<\/>|<(b|i|u|s|strike)>|<\/(b|i|u|s|strike)>/g;
  let lastIndex = 0;
  let match;
  let currentColor = defaultColor;
  const styleStack: { bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean } = {};

  while ((match = tagRegex.exec(text)) !== null) {
    // Add text before the tag with current styles
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      if (beforeText) {
        const style: React.CSSProperties = { color: currentColor };
        if (styleStack.bold) style.fontWeight = 'bold';
        if (styleStack.italic) style.fontStyle = 'italic';
        
        // Combine text decorations if multiple are active
        const decorations: string[] = [];
        if (styleStack.underline) decorations.push('underline');
        if (styleStack.strikethrough) decorations.push('line-through');
        if (decorations.length > 0) style.textDecoration = decorations.join(' ');
        
        parts.push(
          <span key={`text-${lastIndex}`} style={style}>
            {beforeText}
          </span>
        );
      }
    }

    if (match[1]) {
      // Hex color start tag found - set new color
      currentColor = `#${match[1]}`;
    } else if (match[2]) {
      // Palette color tag <p:key-name> - resolve from palette
      const paletteKey = match[2];
      if (paletteKey in palette) {
        const paletteValue = palette[paletteKey];
        // Resolve the palette value (could be hex, named color, or another reference)
        const resolved = resolvePaletteColor(`p:${paletteKey}`, palette);
        if (resolved.color) {
          currentColor = resolved.color;
        } else {
          // Fall back to palette value as-is if we can't resolve
          currentColor = isHexColor(paletteValue) ? paletteValue : 
                         isNamedColor(paletteValue) ? NAMED_COLORS[paletteValue.toLowerCase()] : 
                         defaultColor;
        }
      } else {
        // Unresolved palette key - keep current color but could add warning
        currentColor = defaultColor;
      }
    } else if (match[0] === '</>') {
      // Color end tag </> - reset to default color
      currentColor = defaultColor;
    } else if (match[3]) {
      // HTML formatting opening tag
      const tag = match[3];
      if (tag === 'b') styleStack.bold = true;
      else if (tag === 'i') styleStack.italic = true;
      else if (tag === 'u') styleStack.underline = true;
      else if (tag === 's' || tag === 'strike') styleStack.strikethrough = true;
    } else if (match[4]) {
      // HTML formatting closing tag
      const tag = match[4];
      if (tag === 'b') delete styleStack.bold;
      else if (tag === 'i') delete styleStack.italic;
      else if (tag === 'u') delete styleStack.underline;
      else if (tag === 's' || tag === 'strike') delete styleStack.strikethrough;
    }

    lastIndex = tagRegex.lastIndex;
  }

  // Add remaining text after the last tag
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText) {
      const style: React.CSSProperties = { color: currentColor };
      if (styleStack.bold) style.fontWeight = 'bold';
      if (styleStack.italic) style.fontStyle = 'italic';
      
      // Combine text decorations if multiple are active
      const decorations: string[] = [];
      if (styleStack.underline) decorations.push('underline');
      if (styleStack.strikethrough) decorations.push('line-through');
      if (decorations.length > 0) style.textDecoration = decorations.join(' ');
      
      parts.push(
        <span key={`text-${lastIndex}`} style={style}>
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const segmentMockData = getMockDataForSegment(segment.type) as Record<string, any>;
    
    // Helper to get nested value from mock data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getNestedValue = (prop: string): any => {
      const keys = prop.split('.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    
    // Handle url function - {{ url "text" "url" }} or {{ url .Something .Other }}
    result = result.replace(/\{\{\s*url\s+(?:\(\s*print\s+[^)]+\)|"[^"]*"|\.[\w.]+)\s+(?:\(\s*print\s+[^)]+\)|"[^"]*"|\.[\w.]+)\s*\}\}/g, (match) => {
      // Extract the text part (first argument)
      const textMatch = match.match(/url\s+(?:\(\s*print\s+([^)]+)\)|"([^"]*)"|\.(\w[\w.]*)\s)/);
      if (textMatch) {
        // If it's a print expression, just show the concatenated value
        if (textMatch[1]) {
          // Handle print expressions like (print  .UserName "@" .HostName )
          return textMatch[1].replace(/\.(\w+)/g, (_, prop) => getNestedValue(prop) || prop).replace(/"/g, '').trim();
        }
        if (textMatch[2]) return textMatch[2];
        if (textMatch[3]) return getNestedValue(textMatch[3]) || textMatch[3];
      }
      return '';
    });
    
    // Handle trunc function - {{ trunc 8 .Segments.Git.Commit.Sha }}
    result = result.replace(/\{\{\s*trunc\s+(\d+)\s+\.([.\w]+)\s*\}\}/g, (_match, len, prop) => {
      const value = getNestedValue(prop);
      if (value) {
        return String(value).substring(0, parseInt(len));
      }
      return '';
    });
    
    // Handle path function - {{ path (.Format .Path) .Location }}
    result = result.replace(/\{\{\s*path\s+(?:\([^)]+\)|\.[\w.]+)\s+\.[\w.]+\s*\}\}/g, () => {
      return getNestedValue('Path') || '~/dev/my-app';
    });
    
    // Handle now | date - {{ now | date "15:04:05" }}
    result = result.replace(/\{\{\s*now\s*\|\s*date\s+"([^"]+)"\s*\}\}/g, (_match, format) => {
      // Return a mock time based on format
      if (format.includes('15:04:05')) return '14:30:45';
      if (format.includes('15:04')) return '14:30';
      return '2:30 PM';
    });
    
    // Handle .Segments.Contains - {{ .Segments.Contains "Git" }}
    result = result.replace(/\.Segments\.Contains\s+"([^"]+)"/g, (_match, segmentName) => {
      // For preview, assume Git and Path are present
      return ['Git', 'Path'].includes(segmentName) ? 'true' : 'false';
    });
    
    // Handle trimPrefix function - {{ trimPrefix .Segments.Git.Dir .PWD }}
    result = result.replace(/\{\{\s*trimPrefix\s+\.([.\w]+)\s+\.([.\w]+)\s*\}\}/g, (_match, prefixProp, valueProp) => {
      const prefix = getNestedValue(prefixProp);
      const value = getNestedValue(valueProp);
      if (prefix && value) {
        return String(value).replace(String(prefix), '');
      }
      return value || '';
    });
    
    // Handle coalesce - {{ coalesce .Env.WT_PROFILE_ID }}
    result = result.replace(/\{\{\s*coalesce\s+\.([.\w]+)\s*\}\}/g, (_match, prop) => {
      const value = getNestedValue(prop);
      return value || '';
    });
    
    // Handle printf - {{ printf "format" args }}
    result = result.replace(/\{\{\s*printf\s+"([^"]+)"\s+\.([.\w]+)\s*\}\}/g, (_match, format, prop) => {
      const value = getNestedValue(prop);
      // Simple %s and %d replacement
      return format.replace(/%[sd]/, value || '');
    });
    
    // Handle or function - {{ or .Something .Other }}
    result = result.replace(/\{\{\s*or\s+\.([.\w]+)\s+\.([.\w]+)\s*\}\}/g, (_match, prop1, prop2) => {
      const val1 = getNestedValue(prop1);
      const val2 = getNestedValue(prop2);
      return val1 || val2 || '';
    });
    
    // Handle hresult filter for Windows error codes - {{ .Code | hresult }}
    result = result.replace(/\{\{\s*\.Code\s*\|\s*hresult\s*\}\}/g, '0x00000000');
    
    // Handle nested properties (any depth) like .Working.Changed or .Premium.Percent.Gauge
    // Also handle method calls with parentheses like .Premium.Percent.Gauge()
    result = result.replace(/\{\{\s*\.([.\w]+)(\(\))?\s*\}\}/g, (_match, path) => {
      const value = getNestedValue(path);
      return value !== undefined ? String(value) : '';
    });
    
    // Handle complex if conditions with and/or and multiple conditions
    // {{ if and (.Segments.Contains "Git") .Segments.Git.RepoName (not (.Segments.Contains "Session")) }}
    result = result.replace(/\{\{\s*if\s+and\s+[^}]+\}\}([\s\S]*?)(?:\{\{\s*else\s*\}\}([\s\S]*?))?\{\{\s*end\s*\}\}/g, (_match, trueContent, falseContent) => {
      // For preview purposes, show the true content if Git-related
      return trueContent || falseContent || '';
    });
    
    // Handle "if not" conditions - {{ if not .Error }}
    result = result.replace(/\{\{\s*if\s+not\s+\.([.\w]+)\s*\}\}(.*?)(\{\{\s*end\s*\}\}|$)/gs, (_match, prop, content) => {
      const value = getNestedValue(prop);
      // Show content if property is falsy
      return (!value) ? content : '';
    });
    
    // Handle conditional statements with else - {{ if .Error }}{{ .Error }}{{ else }}{{ .Full }}{{ end }}
    result = result.replace(/\{\{\s*if\s+\.([.\w]+)\s*\}\}(.*?)\{\{\s*else\s*\}\}(.*?)\{\{\s*end\s*\}\}/gs, (_match, prop, trueContent, falseContent) => {
      const value = getNestedValue(prop);
      // Show trueContent if property is truthy, otherwise falseContent
      return value ? trueContent : falseContent;
    });
    
    // Handle simple conditional statements - {{ if .Venv }}{{ .Venv }} {{ end }}
    result = result.replace(/\{\{\s*if\s+\.([.\w]+)\s*\}\}(.*?)\{\{\s*end\s*\}\}/gs, (_match, prop, content) => {
      const value = getNestedValue(prop);
      // Show content if property is truthy
      return value ? content : '';
    });
    
    // Handle "and" conditions - {{ if and (.Staging.Changed) (.Working.Changed) }}
    result = result.replace(/\{\{\s*if\s+and\s+\(\.([.\w]+)\)\s+\(\.([.\w]+)\)\s*\}\}(.*?)\{\{\s*end\s*\}\}/gs, (_match, prop1, prop2, content) => {
      const val1 = getNestedValue(prop1);
      const val2 = getNestedValue(prop2);
      return (val1 && val2) ? content : '';
    });
    
    // Handle "ne" (not equal) conditions - {{ if ne .Status "stopped" }}
    result = result.replace(/\{\{\s*if\s+ne\s+\.([.\w]+)\s+"([^"]*)"\s*\}\}(.*?)\{\{\s*end\s*\}\}/gs, (_match, prop, compareValue, content) => {
      const value = getNestedValue(prop);
      return String(value) !== compareValue ? content : '';
    });
    
    // Handle "eq" (equal) conditions - {{ if eq .Shell "pwsh" }}
    result = result.replace(/\{\{\s*if\s+eq\s+\.([.\w]+)\s+"([^"]*)"\s*\}\}(.*?)\{\{\s*end\s*\}\}/gs, (_match, prop, compareValue, content) => {
      const value = getNestedValue(prop);
      return String(value) === compareValue ? content : '';
    });
    
    // Handle remaining if statements
    result = result.replace(/\{\{\s*if\s+[^}]*\}\}/g, '');
    result = result.replace(/\{\{\s*else\s*\}\}/g, '');
    result = result.replace(/\{\{\s*end\s*\}\}/g, '');
    
    // Handle date formatting - Go date format uses reference time: Mon Jan 2 15:04:05 MST 2006
    // Common patterns: 15:04:05 (time), 15:04 (hour:min), 2006-01-02 (date)
    const formatGoDate = (format: string): string => {
      const now = new Date();
      // Go uses reference time patterns - map to actual values
      let result = format;
      result = result.replace('15', now.getHours().toString().padStart(2, '0'));
      result = result.replace('04', now.getMinutes().toString().padStart(2, '0'));
      result = result.replace('05', now.getSeconds().toString().padStart(2, '0'));
      result = result.replace('2006', now.getFullYear().toString());
      result = result.replace('01', (now.getMonth() + 1).toString().padStart(2, '0'));
      result = result.replace('02', now.getDate().toString().padStart(2, '0'));
      result = result.replace('Jan', now.toLocaleString('en', { month: 'short' }));
      result = result.replace('Mon', now.toLocaleString('en', { weekday: 'short' }));
      result = result.replace('PM', now.getHours() >= 12 ? 'PM' : 'AM');
      result = result.replace('pm', now.getHours() >= 12 ? 'pm' : 'am');
      result = result.replace('3', (now.getHours() % 12 || 12).toString()); // 12-hour format
      return result;
    };
    
    result = result.replace(/\{\{\s*\.CurrentDate\s*\|\s*date\s+\.Format\s*\}\}/g, () => {
      return formatGoDate(segmentMockData.Format as string || '15:04:05');
    });
    result = result.replace(/\{\{\s*\.CurrentDate\s*\|\s*date\s+"([^"]+)"\s*\}\}/g, (_match, format) => {
      return formatGoDate(format);
    });
    
    // Handle round function - {{ round .PhysicalPercentUsed .Precision }}
    result = result.replace(/\{\{\s*round\s+\.([.\w]+)(?:\s+\.Precision)?\s*\}\}/g, (_match, prop) => {
      const value = getNestedValue(prop);
      return typeof value === 'number' ? Math.round(value).toString() : String(value || '');
    });
    
    // Handle secondsRound function for WakaTime - {{ secondsRound .CumulativeTotal.Seconds }}
    result = result.replace(/\{\{\s*secondsRound\s+\.([.\w]+)\s*\}\}/g, (_match, prop) => {
      const value = getNestedValue(prop);
      // Convert seconds to human readable format
      if (typeof value === 'number') {
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        return `${hours}h ${minutes}m`;
      }
      return String(value || '');
    });
    
    // Clean up any remaining template expressions
    result = result.replace(/\{\{.*?\}\}/g, '');
    
    return result;
  }
  
  // Second priority: use previewText from metadata if available
  if (metadata?.previewText) {
    return metadata.previewText;
  }
  
  // Third priority: generate preview based on segment type using segment-specific mock data
  const segmentData = getMockDataForSegment(segment.type);
  
  // Build preview text from segment's mock data
  const typeMap: Record<string, () => string> = {
    path: () => segmentData.Path as string,
    git: () => `${segmentData.HEAD} ${segmentData.BranchStatus}`,
    node: () => segmentData.Full as string,
    python: () => segmentData.Full as string,
    go: () => segmentData.Full as string,
    rust: () => segmentData.Full as string,
    dotnet: () => segmentData.Full as string,
    java: () => segmentData.Full as string,
    azfunc: () => segmentData.Full as string,
    az: () => segmentData.Name as string,
    azd: () => segmentData.DefaultEnvironment as string,
    aws: () => `${segmentData.Profile}@${segmentData.Region}`,
    gcp: () => segmentData.Project as string,
    docker: () => segmentData.Context as string,
    kubectl: () => `${segmentData.Context}::${segmentData.Namespace}`,
    time: () => '14:30:45',
    session: () => `${segmentData.UserName}@${segmentData.HostName}`,
    executiontime: () => segmentData.FormattedMs as string,
    status: () => '❯',
    battery: () => `${segmentData.Icon}${segmentData.Percentage}%`,
    terraform: () => segmentData.WorkspaceName as string,
    pulumi: () => segmentData.Stack as string,
    firebase: () => segmentData.Project as string,
    helm: () => segmentData.Version as string,
    spotify: () => `${segmentData.Icon} ${segmentData.Artist} - ${segmentData.Track}`,
    lastfm: () => `${segmentData.Icon} ${segmentData.Artist} - ${segmentData.Track}`,
    ytm: () => `${segmentData.Icon} ${segmentData.Artist} - ${segmentData.Track}`,
    nightscout: () => `${segmentData.Sgv}${segmentData.TrendIcon}`,
    strava: () => segmentData.Ago as string,
    withings: () => `${segmentData.Steps} steps`,
    ipify: () => segmentData.IP as string,
    wakatime: () => ((segmentData.CumulativeTotal as Record<string, unknown>)?.Text as string) || '3h 25m',
    owm: () => `${segmentData.Weather} ${segmentData.Temperature}${segmentData.UnitIcon}`,
    brewfather: () => `${segmentData.StatusIcon} ${((segmentData.Recipe as Record<string, unknown>)?.Name as string) || 'IPA'}`,
    carbonintensity: () => ((segmentData.Actual as Record<string, unknown>)?.Index as string) || 'low',
    claude: () => `🤖 ${((segmentData.Model as Record<string, unknown>)?.DisplayName as string) || 'Claude'} ${((segmentData.TokenUsagePercent as Record<string, unknown>)?.Gauge as string) || ''}`,
    copilot: () => ((segmentData.Premium as Record<string, Record<string, unknown>>)?.Percent?.Gauge as string) || '████░',
    winget: () => `${segmentData.UpdateCount} updates`,
    os: () => '🪟',
    shell: () => segmentData.Name as string,
    project: () => `${segmentData.Name} ${segmentData.Version}`,
    sysinfo: () => `${segmentData.PhysicalPercentUsed}%`,
    upgrade: () => segmentData.Latest as string,
    connection: () => segmentData.Type as string,
    root: () => '⚡',
    text: () => 'hello',
  };
  
  if (typeMap[segment.type]) {
    return typeMap[segment.type]();
  }
  
  // Fall back to segment name
  return metadata?.name || segment.type;
}
