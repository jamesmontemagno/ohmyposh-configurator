// Common Powerline/Nerd Font symbols with their descriptions
export const POWERLINE_SYMBOLS = [
  { value: '\ue0b0', label: 'Left Hard Divider', code: 'E0B0' },
  { value: '\ue0b2', label: 'Right Hard Divider', code: 'E0B2' },
  { value: '\ue0b4', label: 'Right Half Circle Thick', code: 'E0B4' },
  { value: '\ue0b6', label: 'Left Half Circle Thick', code: 'E0B6' },
  { value: '\ue0b1', label: 'Left Soft Divider', code: 'E0B1' },
  { value: '\ue0b3', label: 'Right Soft Divider', code: 'E0B3' },
  { value: '\ue0b5', label: 'Right Half Circle Thin', code: 'E0B5' },
  { value: '\ue0b7', label: 'Left Half Circle Thin', code: 'E0B7' },
  { value: '\ue0bc', label: 'Upper Left Triangle', code: 'E0BC' },
  { value: '\ue0be', label: 'Upper Right Triangle', code: 'E0BE' },
  { value: '\ue0c0', label: 'Flame Thick', code: 'E0C0' },
  { value: '\ue0c2', label: 'Flame Thick Mirrored', code: 'E0C2' },
  { value: '\ue0c4', label: 'Pixelated Squares Small', code: 'E0C4' },
  { value: '\ue0c6', label: 'Pixelated Squares Big', code: 'E0C6' },
  { value: '\ue0c8', label: 'Ice Waveform', code: 'E0C8' },
  { value: '\ue0cc', label: 'Honeycomb', code: 'E0CC' },
  { value: '\ue0ce', label: 'Lego Separator', code: 'E0CE' },
  { value: '\ue0d2', label: 'Trapezoid Top Bottom', code: 'E0D2' },
  { value: '\ue0d4', label: 'Trapezoid Top Bottom Mirrored', code: 'E0D4' },
] as const;

// Recommended symbols for leading diamond (left-pointing)
export const LEADING_DIAMOND_SYMBOLS = POWERLINE_SYMBOLS.filter(s => 
  ['E0B6', 'E0B2', 'E0B7', 'E0B3', 'E0BE', 'E0C2', 'E0D4'].includes(s.code)
);

// Recommended symbols for trailing diamond (right-pointing)
export const TRAILING_DIAMOND_SYMBOLS = POWERLINE_SYMBOLS.filter(s => 
  ['E0B0', 'E0B4', 'E0B1', 'E0B5', 'E0BC', 'E0C0', 'E0D2'].includes(s.code)
);

export type PowerlineSymbol = typeof POWERLINE_SYMBOLS[number];
