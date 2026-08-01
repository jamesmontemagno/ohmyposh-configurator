const BLOCKED_ELEMENTS = new Set([
  'script',
  'foreignobject',
  'iframe',
  'object',
  'embed',
  'audio',
  'video',
  'canvas',
]);

function isUnsafeUrl(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized !== '' && !normalized.startsWith('#') && !normalized.startsWith('data:image/');
}

function isUnsafeStyle(value: string): boolean {
  const normalized = value.toLowerCase().replace(/\s/g, '');
  return normalized.includes('javascript:') || normalized.includes('expression(');
}

export function sanitizeStudioSvg(source: string): string {
  const document = new DOMParser().parseFromString(source, 'image/svg+xml');
  const root = document.documentElement;

  if (
    root.localName.toLowerCase() !== 'svg' ||
    document.querySelector('parsererror')
  ) {
    throw new Error('Studio returned an invalid SVG document');
  }

  for (const element of Array.from(root.querySelectorAll('*'))) {
    if (BLOCKED_ELEMENTS.has(element.localName.toLowerCase())) {
      element.remove();
      continue;
    }

    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      if (
        name.startsWith('on') ||
        (name === 'style' && isUnsafeStyle(attribute.value)) ||
        ((name === 'href' || name === 'xlink:href') && isUnsafeUrl(attribute.value))
      ) {
        element.removeAttribute(attribute.name);
      }
    }
  }

  for (const attribute of Array.from(root.attributes)) {
    const name = attribute.name.toLowerCase();
    if (
      name.startsWith('on') ||
      (name === 'style' && isUnsafeStyle(attribute.value)) ||
      ((name === 'href' || name === 'xlink:href') && isUnsafeUrl(attribute.value))
    ) {
      root.removeAttribute(attribute.name);
    }
  }

  return new XMLSerializer().serializeToString(root);
}
