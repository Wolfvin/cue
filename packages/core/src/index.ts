export { Timeline } from "./Timeline";
export type { TimelineEntry, TimelineOptions } from "./Timeline";

export { Pointer } from "./Pointer";
export type { PointerState, PointerKeyframe, PointerOptions } from "./Pointer";

export { StateMachine } from "./StateMachine";
export type { Scene, TransitionEvent, StateMachineOptions } from "./StateMachine";

export { ScrollTrigger } from "./ScrollTrigger";
export type { ScrollTriggerOptions } from "./ScrollTrigger";

export type {
  DemoScript,
  DemoStep,
  DemoTemplate,
  DemoHotspot,
  DemoAnnotation,
  ArrowAnnotation,
  BoxAnnotation,
  TextAnnotation,
  DemoPointer,
  DemoCta,
  DemoTheme,
} from "./DemoScript";
export { validateDemoScript, getDemoStep } from "./DemoScript";

export type {
  CueEventType,
  CueEvent,
  CueAnalyticsConfig,
  CueSummary,
} from "./Analytics";
export { CueAnalytics } from "./Analytics";

export { screenshotToStep, fileToDataUrl, interpolatePointer } from "./ScreenCapture";
export type { ScreenshotToStepOptions } from "./ScreenCapture";

export { generate } from "./generate";
export type { GenerateOptions } from "./generate";