import type { OhMyPoshConfig, Block, Segment, ExportFormat, Tooltip } from '../types/ohmyposh';
type CleanedSegment = Omit<Segment, 'id'>;
type CleanedTooltip = Omit<Tooltip, 'id'>;
interface CleanedBlock extends Omit<Block, 'id' | 'segments'> {
    segments: CleanedSegment[];
}
interface CleanedConfig extends Omit<OhMyPoshConfig, 'blocks' | 'tooltips'> {
    blocks: CleanedBlock[];
    tooltips?: CleanedTooltip[];
}
export declare function cleanConfig(config: OhMyPoshConfig): CleanedConfig;
export declare function exportToJson(config: OhMyPoshConfig): string;
export declare function exportToYaml(config: OhMyPoshConfig): string;
export declare function exportToToml(config: OhMyPoshConfig): string;
export declare function exportConfig(config: OhMyPoshConfig, format: ExportFormat): string;
export declare function downloadConfig(config: OhMyPoshConfig, format: ExportFormat, name?: string): void;
export declare function copyToClipboard(text: string): Promise<void>;
export {};
//# sourceMappingURL=configExporter.d.ts.map