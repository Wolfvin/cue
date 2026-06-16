import type { DemoScript } from "@cue-vin/core";
/** Props for the CuePlayer component. */
export interface CuePlayerProps {
    /** DemoScript configuration to render. */
    script: DemoScript;
    /** Player width in pixels. Default: 840. */
    width?: number;
    /** Player height in pixels. Default: 520. */
    height?: number;
    /** Whether to auto-advance steps via step.duration. Default: false. */
    autoPlay?: boolean;
    /** Whether to loop back to step 0 after the last step. Default: false. */
    loop?: boolean;
    /** Callback fired when the demo reaches the last step and cannot advance. */
    onComplete?: () => void;
    /** Callback fired whenever the current step changes. */
    onStepChange?: (step: number, total: number) => void;
}
/**
 * Standalone embeddable demo player that renders a DemoScript with
 * screenshot slides, templates, pointer, hotspots, annotations, caption,
 * progress, and navigation controls.
 */
export declare function CuePlayer({ script, width, height, autoPlay, loop, onComplete, onStepChange, }: CuePlayerProps): import("react").JSX.Element;
//# sourceMappingURL=CuePlayer.d.ts.map