export type OnCanvasDrawFunction = (
  instance: AudioMotionAnalyzer,
  info: CanvasDrawInfo
) => unknown;

export type CanvasDrawInfo = {
  timestamp: DOMHighResTimeStamp,
  themes: ActiveTheme[]
}

export interface ThemeData {
  colorStops: GradientColorStop[];
  muted: {
    colorStops: GradientColorStop[];
  };
  peakColor: string;
}

export interface ActiveTheme extends ThemeData {
  name: string;
  gradient: CanvasGradient;
  muted: ThemeData["muted"] & {
    gradient: CanvasGradient;
  };
}

export type ThemeModifiers = {
  horizontal?: boolean,
  reverse?: boolean,
  spread?: boolean
}

export type ThemeNameAndModifiers = {
  name: string,
  modifiers: ThemeModifiers
}

export type OnCanvasResizeFunction = (
  reason: CanvasResizeReason,
  instance: AudioMotionAnalyzer
) => unknown;

export type CanvasResizeReason = "create" | "fschange" | "lores" | "resize" | "user";

export interface Options {
  alphaBars?: boolean;
  ansiBands?: boolean;
  bandResolution?: number;
  barSpace?: number;
  channelLayout?: ChannelLayout;
  colorMode?: ColorMode;
  fadePeaks?: boolean;
  fftSize?: number;
  fillAlpha?: number;
  frequencyScale?: FrequencyScale;
  height?: number;
  ledBars?: boolean;
  linearAmplitude?: boolean;
  linearBoost?: number;
  lineWidth?: number;
  loRes?: boolean;
  lumiBars?: boolean;
  maxDecibels?: number;
  maxFPS?: number;
  maxFreq?: number;
  minDecibels?: number;
  minFreq?: number;
  mirror?: number;
  mode?: VisualizationMode;
  noteLabels?: boolean;
  onCanvasDraw?: OnCanvasDrawFunction;
  onCanvasResize?: OnCanvasResizeFunction;
  outlineBars?: boolean;
  peakDecayTime?: number;
  peakHoldTime?: number;
  peakLine?: boolean;
  radial?: boolean;
  radialInvert?: boolean;
  radius?: number;
  reflexAlpha?: number;
  reflexBright?: number;
  reflexFit?: boolean;
  reflexRatio?: number;
  roundBars?: boolean;
  showFPS?: boolean;
  showLedMask?: boolean;
  showPeaks?: boolean;
  showScaleX?: boolean;
  showScaleY?: boolean;
  smoothing?: number;
  spinSpeed?: number;
  trueLeds?: boolean;
  useCanvas?: boolean;
  volume?: number;
  weightingFilter?: WeightingFilter;
  width?: number;
}

export interface AnalyzerBarData {
  posX: number;
  freq: number;
  freqLo: number;
  freqHi: number;
  hold: [ number, number? ];
  peak: [ number, number ];
  value: [ number, number? ];
}

export interface ConstructorOptions extends Options {
  audioCtx?: AudioContext;
  canvas?: HTMLCanvasElement;
  connectSpeakers?: boolean;
  fsElement?: HTMLElement;
  source?: HTMLMediaElement | AudioNode;
  start?: boolean;
}

export type ChannelLayout = "single" | "dual-horizontal" | "dual-vertical" | "dual-combined";

export type ColorMode = "gradient" | "bar-index" | "bar-level";

export type EnergyPreset = "peak" | "bass" | "lowMid" | "mid" | "highMid" | "treble";

export type FrequencyScale = "bark" | "linear" | "log" | "mel";

export type FrequencyLabel = number | [ frequency: number; label: string; highlight?: boolean ];

export type GradientColorStop = string | { pos?: number; color: string; level?: number };

export type VisualizationMode = "bars" | "graph";

export type WeightingFilter = "" | "A" | "B" | "C" | "D" | "468";

export interface GradientOptions {
  colorStops: GradientColorStop[];
  peakColor?: string;
}

export interface XAxisOptions {
  addLabels?: boolean;
  backgroundColor?: string;
  color?: string;
  height?: number;
  highlightColor?: string;
  labels?: FrequencyLabel[];
  overlay?: boolean;
}

export interface YAxisOptions {
  color?: string;
  dbInterval?: number;
  linearInterval?: number;
  lineDash?: number[];
  operation?: string;
  showSubdivisions?: boolean;
  subLineColor?: string;
  subLineDash?: number[];
  width?: number;
}

declare class AudioMotionAnalyzer {
  constructor(container?: HTMLElement, options?: ConstructorOptions);
  constructor(options?: ConstructorOptions);

  get alphaBars(): boolean;
  set alphaBars(value: boolean);

  get ansiBands(): boolean;
  set ansiBands(value: boolean);

  get audioCtx(): AudioContext;
  get canvas(): HTMLCanvasElement;
  get canvasCtx(): CanvasRenderingContext2D;

  get bandResolution(): number;
  set bandResolution(value: number);

  get barSpace(): number;
  set barSpace(value: number);

  get channelLayout(): ChannelLayout;
  set channelLayout(value: ChannelLayout);

  get colorMode(): ColorMode;
  set colorMode(value: ColorMode);

  get connectedSources(): AudioNode[];
  get connectedTo(): AudioNode[];

  get fadePeaks(): boolean;
  set fadePeaks(value: boolean);

  get fftSize(): number;
  set fftSize(value: number);

  public fillAlpha: number;

  get fps(): number;

  get fsHeight(): number;
  get fsWidth(): number;

  get frequencyScale(): FrequencyScale;
  set frequencyScale(value: FrequencyScale);

  get height(): number;
  set height(h: number);

  get isAlphaBars(): boolean;
  get isBandsMode(): boolean;
  get isFullscreen(): boolean;
  get isLedBars(): boolean;
  get isLumiBars(): boolean;
  get isOctaveBands(): boolean;
  get isOutlineBars(): boolean;
  get isRoundBars(): boolean;

  get isDestroyed(): boolean;
  get isOn(): boolean;

  get ledBars(): boolean;
  set ledBars(value: boolean);

  get linearAmplitude(): boolean;
  set linearAmplitude(value: boolean);

  get linearBoost(): number;
  set linearBoost(value: number);

  get lineWidth(): number;
  set lineWidth(value: number);

  get loRes(): boolean;
  set loRes(value: boolean);

  get lumiBars(): boolean;
  set lumiBars(value: boolean);

  get maxDecibels(): number;
  set maxDecibels(value: number);

  get minDecibels(): number;
  set minDecibels(value: number);

  get maxFPS(): number;
  set maxFPS(value: number);

  get maxFreq(): number;
  set maxFreq(value: number);

  get minFreq(): number;
  set minFreq(value: number);

  get mirror(): number;
  set mirror(value: number);

  get mode(): VisualizationMode;
  set mode(value: VisualizationMode);

  get noteLabels(): boolean;
  set noteLabels(value: boolean);

  get outlineBars(): boolean;
  set outlineBars(value: boolean);

  get peakDecayTime(): number;
  set peakDecayTime(value: number);

  get peakHoldTime(): number;
  set peakHoldTime(value: number);

  get peakLine(): boolean;
  set peakLine(value: boolean);

  get pixelRatio(): number;

  get radial(): boolean;
  set radial(value: boolean);

  get radialInvert(): boolean;
  set radialInvert(value: boolean);

  get radius(): number;
  set radius(value: number);

  public reflexAlpha: number;
  public reflexBright: number;
  public reflexFit: boolean;

  get reflexRatio(): number;
  set reflexRatio(value: number);

  get roundBars(): boolean;
  set roundBars(value: boolean);

  public showFPS: boolean;
  public showLedMask: boolean;
  public showPeaks: boolean;
  public showScaleX: boolean;
  public showScaleY: boolean;

  get smoothing(): number;
  set smoothing(value: number);

  get spinSpeed(): number;
  set spinSpeed(value: number);

  get trueLeds(): boolean;
  set trueLeds(value: boolean);

  public useCanvas: boolean;

  get volume(): number;
  set volume(value: number);

  get weightingFilter(): WeightingFilter;
  set weightingFilter(value: WeightingFilter);

  get width(): number;
  set width(w: number);

  static get version(): string;

  public onCanvasDraw: OnCanvasDrawFunction | undefined;
  public onCanvasResize: OnCanvasResizeFunction | undefined;

  public connectInput(source: HTMLMediaElement): MediaElementAudioSourceNode;
  public connectInput(source: AudioNode): AudioNode;
  public connectOutput(node?: AudioNode): void;

  public destroy(): void;

  public disconnectInput(node?: AudioNode | AudioNode[] | null, stopTracks?: boolean): void;
  public disconnectOutput(node?: AudioNode): void;

  public getBars(): AnalyzerBarData[];

  public getEnergy(preset?: EnergyPreset): number;
  public getEnergy(startFreq: number, endFreq?: number): number;

  public getOptions(ignore?: string | string[]): Options;

  public getTheme( channel?: number ): string;
  public getTheme( channel?: number, includeModifiers: true ): ThemeNameAndModifiers;

  public getThemeData( name: string ): ThemeData | null;

  public getThemeModifiers( channel?: number ): ThemeModifiers;
  public getThemeModifiers( modifier: string, channel?: number ): boolean;

  public getThemeList(): string[];

  public registerTheme(name: string, options: GradientOptions): boolean;

  public setCanvasSize(width: number, height: number): void;
  public setFreqRange(minFreq: number, maxFreq: number): void;
  public setLedParams(ledHeight: number, ledGap: number): void;
  public setOptions(options?: Options): void;
  public setSensitivity(minDecibels: number, maxDecibels: number): void;

  public setTheme( name: string, modifiers?: ThemeModifiers, channel?: number ): void;
  public setTheme( options: ThemeNameAndModifiers, channel?: number ): void;
  public setTheme( options: string[] | ThemeNameAndModifiers[] ): void;

  public setThemeModifiers( modifier: ThemeModifiers, channel?: number ): void;
  public setThemeModifiers( modifier: string, value: boolean, channel?: number ): void;

  public setXAxis(options?: XAxisOptions): void;
  public setYAxis(options?: YAxisOptions): void;

  public start(): void;
  public stop(): void;

  public toggleAnalyzer(force?: boolean): boolean;
  public toggleFullscreen(): void;
  public toggleThemeModifier( modifier: string, channel?: number ): void;

  public unregisterTheme(name: string): boolean;
}

export { AudioMotionAnalyzer };
export default AudioMotionAnalyzer;
