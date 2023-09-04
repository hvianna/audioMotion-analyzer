export type OnCanvasDrawFunction = (
  instance: AudioMotionAnalyzer,
  info: CanvasDrawInfo
) => unknown;

export type CanvasDrawInfo = {
  timestamp: DOMHighResTimeStamp,
  canvasGradients: CanvasGradient[]
}

export type OnCanvasResizeFunction = (
  reason: CanvasResizeReason,
  instance: AudioMotionAnalyzer
) => unknown;

export type CanvasResizeReason = "create" | "fschange" | "lores" | "resize" | "user";

export interface Options {
  alphaBars?: boolean;
  ansiBands?: boolean;
  barSpace?: number;
  bgAlpha?: number;
  channelLayout?: ChannelLayout;
  colorMode?: ColorMode;
  fftSize?: number;
  fillAlpha?: number;
  frequencyScale?: FrequencyScale;
  gradient?: string;
  gradientLeft?: string;
  gradientRight?: string;
  height?: number;
  ledBars?: boolean;
  linearAmplitude?: boolean;
  linearBoost?: number;
  lineWidth?: number;
  loRes?: boolean;
  lumiBars?: boolean;
  maxDecibels?: number;
  maxFreq?: number;
  minDecibels?: number;
  minFreq?: number;
  mirror?: number;
  mode?: number;
  noteLabels?: boolean;
  onCanvasDraw?: OnCanvasDrawFunction;
  onCanvasResize?: OnCanvasResizeFunction;
  outlineBars?: boolean;
  overlay?: boolean;
  radial?: boolean;
  reflexAlpha?: number;
  reflexBright?: number;
  reflexFit?: boolean;
  reflexRatio?: number;
  roundBars?: boolean;
  showBgColor?: boolean;
  showFPS?: boolean;
  showPeaks?: boolean;
  showScaleX?: boolean;
  showScaleY?: boolean;
  smoothing?: number;
  spinSpeed?: number;
  splitGradient?: boolean;
  start?: boolean;
  stereo?: boolean;
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
  connectSpeakers?: boolean;
  fsElement?: HTMLElement;
  source?: HTMLMediaElement | AudioNode;
}

export type ChannelLayout = "single" | "dual-vertical" | "dual-combined";

export type ColorMode = "gradient" | "bar-index" | "bar-level";

export type EnergyPreset = "peak" | "bass" | "lowMid" | "mid" | "highMid" | "treble";

export type FrequencyScale = "bark" | "linear" | "log" | "mel";

export type GradientColorStop = string | { pos?: number; color: string; level?: number };

export type WeightingFilter = "" | "A" | "B" | "C" | "D" | "468";

export interface GradientOptions {
  bgColor: string;
  dir?: "h";
  colorStops: GradientColorStop[];
}

export interface LedParameters {
  maxLeds: number;
  spaceV: number;
  spaceH: number;
}

declare class AudioMotionAnalyzer {
  constructor(container?: HTMLElement, options?: ConstructorOptions);

  get alphaBars(): boolean;
  set alphaBars(value: boolean);

  get ansiBands(): boolean;
  set ansiBands(value: boolean);

  get audioCtx(): AudioContext;
  get canvas(): HTMLCanvasElement;
  get canvasCtx(): CanvasRenderingContext2D;

  get barSpace(): number;
  set barSpace(value: number);

  public bgAlpha: number;

  get channelLayout(): ChannelLayout;
  set channelLayout(value: ChannelLayout);

  get colorMode(): ColorMode;
  set colorMode(value: ColorMode);

  get connectedSources(): AudioNode[];
  get connectedTo(): AudioNode[];

  get fftSize(): number;
  set fftSize(value: number);

  public fillAlpha: number;

  get fps(): number;

  get fsHeight(): number;
  get fsWidth(): number;

  get frequencyScale(): FrequencyScale;
  set frequencyScale(value: FrequencyScale);

  get gradient(): string;
  set gradient(value: string);

  get gradientLeft(): string;
  set gradientLeft(value: string);

  get gradientRight(): string;
  set gradientRight(value: string);

  get height(): number;
  set height(h: number);

  get width(): number;
  set width(w: number);

  get isAlphaBars(): boolean;
  get isBandsMode(): boolean;
  get isFullscreen(): boolean;
  get isLedBars(): boolean;
  get isLumiBars(): boolean;
  get isOctaveBands(): boolean;
  get isOutlineBars(): boolean;
  get isRoundBars(): boolean;

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

  get maxFreq(): number;
  set maxFreq(value: number);

  get minFreq(): number;
  set minFreq(value: number);

  get mirror(): number;
  set mirror(value: number);

  get mode(): number;
  set mode(value: number);

  get noteLabels(): boolean;
  set noteLabels(value: boolean);

  get outlineBars(): boolean;
  set outlineBars(value: boolean);

  public overlay: boolean;

  get pixelRatio(): number;

  get radial(): boolean;
  set radial(value: boolean);

  public reflexAlpha: number;
  public reflexBright: number;
  public reflexFit: boolean;

  get reflexRatio(): number;
  set reflexRatio(value: number);

  get roundBars(): boolean;
  set roundBars(value: boolean);

  public showBgColor: boolean;
  public showFPS: boolean;
  public showPeaks: boolean;
  public showScaleX: boolean;
  public showScaleY: boolean;

  get smoothing(): number;
  set smoothing(value: number);

  get spinSpeed(): number;
  set spinSpeed(value: number);

  get splitGradient(): boolean;
  set splitGradient(value: boolean);

  get stereo(): boolean;
  set stereo(value: boolean);

  get trueLeds(): boolean;
  set trueLeds(value: boolean);

  public useCanvas: boolean;

  get volume(): number;
  set volume(value: number);

  get weightingFilter(): WeightingFilter;
  set weightingFilter(value: WeightingFilter);

  static get version(): string;

  public onCanvasDraw: OnCanvasDrawFunction | undefined;
  public onCanvasResize: OnCanvasResizeFunction | undefined;

  public connectInput(source: HTMLMediaElement): MediaElementAudioSourceNode;
  public connectInput(source: AudioNode): AudioNode;
  public connectOutput(node?: AudioNode): void;

  public disconnectInput(node?: AudioNode | AudioNode[]): void;
  public disconnectOutput(node?: AudioNode): void;

  public getBars(): AnalyzerBarData[];

  public getEnergy(preset?: EnergyPreset): number;
  public getEnergy(startFreq: number, endFreq?: number): number;

  public registerGradient(name: string, options: GradientOptions): void;

  public setCanvasSize(width: number, height: number): void;
  public setFreqRange(minFreq: number, maxFreq: number): void;
  public setLedParams(params?: LedParameters): void;
  public setOptions(options?: Options): void;
  public setSensitivity(minDecibels: number, maxDecibels: number): void;

  public toggleAnalyzer(value?: boolean): boolean;
  public toggleFullscreen(): void;
}

export default AudioMotionAnalyzer;
