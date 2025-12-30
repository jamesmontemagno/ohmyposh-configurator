import type { Block } from '../../types/ohmyposh';
import { SegmentPreview } from './SegmentPreview';

interface BlockPreviewProps {
  block: Block;
  useMockData?: boolean;
}

export function BlockPreview({ block, useMockData = false }: BlockPreviewProps) {
  if (block.segments.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-0 ${
        block.alignment === 'right' ? 'justify-end' : 'justify-start'
      }`}
    >
      {block.segments.map((segment, index) => (
        <SegmentPreview
          key={segment.id}
          segment={segment}
          nextBackground={index < block.segments.length - 1 ? block.segments[index + 1].background : undefined}
          blockLeadingDiamond={block.leading_diamond}
          blockTrailingDiamond={block.trailing_diamond}
          prevStyle={index > 0 ? block.segments[index - 1].style : undefined}
          useMockData={useMockData}
        />
      ))}
    </div>
  );
}
