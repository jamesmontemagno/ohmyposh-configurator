/**
 * Template evaluator for Oh My Posh Go templates — vanilla TS, no React
 * Ported from src/components/PreviewPanel/templateUtils.tsx
 */
import { getMockDataForSegment } from './mockData';

interface SegmentLike {
  type: string;
  template?: string;
}

export function getPreviewText(segment: SegmentLike): string {
  if (segment.template) {
    let result = segment.template;
    const segmentMockData = getMockDataForSegment(segment.type) as Record<string, unknown>;

    const getNestedValue = (prop: string): unknown => {
      const keys = prop.split('.');
      let value: unknown = segmentMockData;
      for (const key of keys) {
        if (value && typeof value === 'object' && key in (value as Record<string, unknown>)) {
          value = (value as Record<string, unknown>)[key];
        } else {
          return undefined;
        }
      }
      return value;
    };

    // url function
    result = result.replace(/\{\{\s*url\s+(?:\(\s*print\s+[^)]+\)|"[^"]*"|\.[\w.]+)\s+(?:\(\s*print\s+[^)]+\)|"[^"]*"|\.[\w.]+)\s*\}\}/g, (match) => {
      const textMatch = match.match(/url\s+(?:\(\s*print\s+([^)]+)\)|"([^"]*)"|\.(\w[\w.]*)\s)/);
      if (textMatch) {
        if (textMatch[1]) return textMatch[1].replace(/\.(\w+)/g, (_, prop: string) => String(getNestedValue(prop) || prop)).replace(/"/g, '').trim();
        if (textMatch[2]) return textMatch[2];
        if (textMatch[3]) return String(getNestedValue(textMatch[3]) || textMatch[3]);
      }
      return '';
    });

    // trunc
    result = result.replace(/\{\{\s*trunc\s+(\d+)\s+\.([.\w]+)\s*\}\}/g, (_m, len, prop) => {
      const v = getNestedValue(prop);
      return v ? String(v).substring(0, parseInt(len)) : '';
    });

    // now | date
    result = result.replace(/\{\{\s*now\s*\|\s*date\s+"([^"]+)"\s*\}\}/g, (_m, format) => {
      if (format.includes('15:04:05')) return '14:30:45';
      if (format.includes('15:04')) return '14:30';
      return '2:30 PM';
    });

    // .CurrentDate | date
    result = result.replace(/\{\{\s*\.CurrentDate\s*\|\s*date\s+(?:\.Format|"([^"]+)")\s*\}\}/g, (_m, fmt) => {
      return fmt?.includes('15:04:05') ? '14:30:45' : '14:30';
    });

    // secondsRound
    result = result.replace(/\{\{\s*secondsRound\s+\.([.\w]+)\s*\}\}/g, (_m, prop) => {
      const v = getNestedValue(prop);
      if (typeof v === 'number') { const h = Math.floor(v / 3600); const m = Math.floor((v % 3600) / 60); return `${h}h ${m}m`; }
      return String(v || '');
    });

    // round
    result = result.replace(/\{\{\s*round\s+\.([.\w]+)(?:\s+\.Precision)?\s*\}\}/g, (_m, prop) => {
      const v = getNestedValue(prop);
      return typeof v === 'number' ? Math.round(v).toString() : String(v || '');
    });

    // printf
    result = result.replace(/\{\{\s*printf\s+"([^"]+)"\s+\.([.\w]+)\s*\}\}/g, (_m, format, prop) => {
      const v = getNestedValue(prop);
      return format.replace(/%[sd]/, String(v || ''));
    });

    // or
    result = result.replace(/\{\{\s*or\s+\.([.\w]+)\s+\.([.\w]+)\s*\}\}/g, (_m, p1, p2) =>
      String(getNestedValue(p1) || getNestedValue(p2) || ''));

    // hresult
    result = result.replace(/\{\{\s*\.Code\s*\|\s*hresult\s*\}\}/g, '0x00000000');

    // nested properties
    result = result.replace(/\{\{\s*\.([.\w]+)(\(\))?\s*\}\}/g, (_m, path) => {
      const v = getNestedValue(path);
      return v !== undefined ? String(v) : '';
    });

    // complex if and
    result = result.replace(/\{\{\s*if\s+and\s+[^}]+\}\}([\s\S]*?)(?:\{\{\s*else\s*\}\}([\s\S]*?))?\{\{\s*end\s*\}\}/g,
      (_m, t, f) => t || f || '');

    // if not
    result = result.replace(/\{\{\s*if\s+not\s+\.([.\w]+)\s*\}\}(.*?)(\{\{\s*end\s*\}\}|$)/gs,
      (_m, prop, content) => !getNestedValue(prop) ? content : '');

    // if ... else ... end
    result = result.replace(/\{\{\s*if\s+\.([.\w]+)\s*\}\}(.*?)\{\{\s*else\s*\}\}(.*?)\{\{\s*end\s*\}\}/gs,
      (_m, prop, t, f) => getNestedValue(prop) ? t : f);

    // if ... end
    result = result.replace(/\{\{\s*if\s+\.([.\w]+)\s*\}\}(.*?)\{\{\s*end\s*\}\}/gs,
      (_m, prop, content) => getNestedValue(prop) ? content : '');

    // if ne
    result = result.replace(/\{\{\s*if\s+ne\s+\.([.\w]+)\s+"([^"]*)"\s*\}\}(.*?)\{\{\s*end\s*\}\}/gs,
      (_m, prop, cmp, content) => String(getNestedValue(prop)) !== cmp ? content : '');

    // if eq
    result = result.replace(/\{\{\s*if\s+eq\s+\.([.\w]+)\s+"([^"]*)"\s*\}\}(.*?)\{\{\s*end\s*\}\}/gs,
      (_m, prop, cmp, content) => String(getNestedValue(prop)) === cmp ? content : '');

    // Clean remaining template expressions
    result = result.replace(/\{\{\s*if\s+[^}]*\}\}/g, '');
    result = result.replace(/\{\{\s*else\s*\}\}/g, '');
    result = result.replace(/\{\{\s*end\s*\}\}/g, '');
    result = result.replace(/\{\{.*?\}\}/g, '');

    return result;
  }

  // Fallback preview text by segment type
  const fallbacks: Record<string, () => string> = {
    path: () => '~/dev/my-app',
    git: () => 'main ↑2',
    node: () => 'v20.10.0',
    python: () => '3.12.0',
    go: () => '1.21.5',
    rust: () => '1.74.0',
    dotnet: () => '8.0.101',
    java: () => '21.0.1',
    time: () => '14:30:45',
    session: () => 'user@laptop',
    status: () => '❯',
    battery: () => '\uf24085%',
    docker: () => 'default',
    kubectl: () => 'production::default',
    aws: () => 'default@us-east-1',
    terraform: () => 'production',
    spotify: () => '\uf1bc The Beatles - Come Together',
  };

  return fallbacks[segment.type]?.() || segment.type;
}
