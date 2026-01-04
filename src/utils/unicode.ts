/**
 * Convert unicode escape sequences to actual characters
 * Handles both \uXXXX and \u{XXXXX} formats
 */
export function parseUnicodeEscapes(input: string): string {
  let processedValue = input;
  
  // Handle \uXXXX format
  processedValue = processedValue.replace(/\\u([0-9a-fA-F]{4})/g, (_match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  // Handle \u{XXXXX} format (with braces)
  processedValue = processedValue.replace(/\\u\{([0-9a-fA-F]+)\}/g, (_match, hex) => {
    return String.fromCodePoint(parseInt(hex, 16));
  });
  
  return processedValue;
}

/**
 * Convert unicode characters to escape sequences for display
 * Characters above U+007F are converted to \uXXXX format
 */
export function unicodeToEscapes(input: string): string {
  return input.replace(/[\u0080-\uffff]/g, (char) => {
    return '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
  });
}

/**
 * Check if a string contains unicode characters that need escaping
 */
export function hasUnicodeCharacters(input: string): boolean {
  return input !== unicodeToEscapes(input);
}

/**
 * Strip Oh My Posh markup tags from a string, leaving just the content.
 * Handles color tags like <#ff70a6>text</> and <p:palette>text</>
 * Returns the inner content (with Unicode escapes parsed) for preview display.
 */
export function stripOmpMarkup(input: string): string {
  if (!input) return '';
  
  // First parse any Unicode escapes
  let result = parseUnicodeEscapes(input);
  
  // Remove color tags: <#XXXXXX>...</> or <p:name>...</>
  // This regex handles opening tags like <#ff70a6>, <p:palette>, </>, etc.
  result = result.replace(/<\/?[#p:][^>]*>/gi, '');
  
  // Also handle standalone closing tags </>
  result = result.replace(/<\/>/g, '');
  
  // Trim any extra whitespace that might be left
  return result.trim();
}
