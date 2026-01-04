import { 
  isHexColor, 
  NAMED_COLORS,
  isPaletteReference,
  isContextDependentColor,
} from '../../utils/paletteResolver';

interface ColorSwatchProps {
  value: string;
  palette: Record<string, string>;
}

/**
 * Resolves a color value to a CSS-displayable color for swatches
 */
function getSwatchColor(value: string, palette: Record<string, string>): string | null {
  if (isHexColor(value)) return value;
  if (value.toLowerCase() in NAMED_COLORS) return NAMED_COLORS[value.toLowerCase()];
  if (isPaletteReference(value)) {
    const key = value.slice(2);
    if (key in palette) {
      return getSwatchColor(palette[key], palette);
    }
  }
  if (isContextDependentColor(value)) return null;
  return null;
}

/**
 * Color swatch component with fallback for unresolvable colors
 */
export function ColorSwatch({ value, palette }: ColorSwatchProps) {
  const color = getSwatchColor(value, palette);
  
  if (!color) {
    // Show striped pattern for context-dependent or unresolved colors
    return (
      <span 
        className="w-6 h-6 rounded border border-gray-600 inline-flex items-center justify-center text-[10px]"
        style={{
          background: 'repeating-linear-gradient(45deg, #333, #333 2px, #555 2px, #555 4px)',
        }}
        title={`Dynamic: ${value}`}
      >
        ↔
      </span>
    );
  }
  
  return (
    <span 
      className="w-6 h-6 rounded border border-gray-600"
      style={{ backgroundColor: color }}
      title={value}
    />
  );
}
