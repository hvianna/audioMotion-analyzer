type OnCanvasDrawFunction = (instance: AudioMotionAnalyzer) => unknown;
type OnCanvasResizeFunction = (
  reason: CanvasResizeReason,
  instance: AudioMotionAnalyzer
) => unknown;

type CanvasResizeReason = "create" | "fschange" | "lores" | "resize" | "user";

export interface Options {
  barSpace?: number;
  bgAlpha?: number;
  fftSize?: number;
  fillAlpha?: number;
  gradient?: string;
  height?: number;
  lineWidth?: number;
  loRes?: boolean;
  lumiBars?: boolean;
  maxDecibels?: number;
  maxFreq?: number;
  minDecibels?: number;
  minFreq?: number;
  mirror?: number;
  mode?: number;
  onCanvasDraw?: OnCanvasDrawFunction;
  onCanvasResize?: OnCanvasResizeFunction;
  overlay?: boolean;
  radial?: boolean;
  reflexAlpha?: number;
  reflexBright?: number;
  reflexFit?: boolean;
  reflexRatio?: number;
  showBgColor?: boolean;
  showFPS?: boolean;
  showLeds?: boolean;
  showPeaks?: boolean;
  showScaleX?: boolean;
  showScaleY?: boolean;
  smoothing?: number;
  spinSpeed?: number;
  splitGradient?: boolean;
  start?: boolean;
  stereo?: boolean;
  useCanvas?: boolean;
  volume?: number;
  width?: number;
}

interface AnalyzerBarData {
  posX: number;
  freqLo: number;
  freqHi: number;
  hold: [ number, number? ];
  peak: [ number, number ];
  value: [ number, number? ];
}

interface ConstructorOptions extends Options {
  audioCtx?: AudioContext;
  connectSpeakers?: boolean;
  fsElement?: HTMLElement;
  source?: HTMLMediaElement | AudioNode;
}

type EnergyPreset = "peak" | "bass" | "lowMid" | "mid" | "highMid" | "treble";

type GradientColorStop = string | { pos: number; color: string };

type ArrayTwoOrMore<T> = {
  0: T
  1: T
} & Array<T>;

export interface GradientOptions {
  bgColor: string;
  dir?: "h";
  colorStops: ArrayTwoOrMore<GradientColorStop>
}

export interface LedParameters {
  maxLeds: number;
  spaceVRatio: number;
  spaceHRatio: number;
}

declare class AudioMotionAnalyzer {
  constructor(container?: HTMLElement, options?: ConstructorOptions);

  get audioCtx(): AudioContext;
  get canvas(): HTMLCanvasElement;
  get canvasCtx(): CanvasRenderingContext2D;

  get barSpace(): number;
  set barSpace(value: number);

  public bgAlpha: number;

  get connectedSources(): AudioNode[];
  get connectedTo(): AudioNode[];

  get energy(): number;

  get fftSize(): number;
  set fftSize(value: number);

  public fillAlpha: number;

  get fps(): number;

  get fsHeight(): number;
  get fsWidth(): number;

  get gradient(): string;
  set gradient(value: string);

  get height(): number;
  set height(h: number);

  get width(): number;
  set width(w: number);

  get isFullscreen(): boolean;
  get isLedDisplay(): boolean;
  get isLumiBars(): boolean;
  get isOctaveBands(): boolean;

  get isOn(): boolean;

  public lineWidth: number;

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

  public overlay: boolean;

  get peakEnergy(): number;
  get pixelRatio(): number;

  get radial(): boolean;
  set radial(value: boolean);

  public reflexAlpha: number;
  public reflexBright: number;
  public reflexFit: boolean;

  get reflexRatio(): number;
  set reflexRatio(value: number);

  public showBgColor: boolean;
  public showFPS: boolean;

  get showLeds(): boolean;
  set showLeds(value: boolean);

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

  public useCanvas: boolean;

  get volume(): number;
  set volume(value: number);

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
