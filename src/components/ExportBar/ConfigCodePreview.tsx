import type { ExportFormat } from '../../types/ohmyposh';
import { tokenizeConfig, type ConfigTokenType } from '../../utils/configSyntaxHighlight';

interface ConfigCodePreviewProps {
  content: string;
  format: ExportFormat;
}

const tokenClassNames: Record<Exclude<ConfigTokenType, 'plain'>, string> = {
  key: 'config-token-key',
  string: 'config-token-string',
  number: 'config-token-number',
  boolean: 'config-token-boolean',
  comment: 'config-token-comment',
  punctuation: 'config-token-punctuation',
};

export function ConfigCodePreview({ content, format }: ConfigCodePreviewProps) {
  const tokens = tokenizeConfig(content, format);

  return (
    <pre className="config-code-preview p-4 text-xs font-mono whitespace-pre-wrap" aria-label={`${format.toUpperCase()} configuration code`}>
      {tokens.map((token, index) => (
        <span
          key={`${token.type}-${index}`}
          className={token.type === 'plain' ? undefined : tokenClassNames[token.type]}
        >
          {token.value}
        </span>
      ))}
    </pre>
  );
}
