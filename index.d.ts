type OnCanvasDrawFunction = (instance: AudioMotionAnalyzer) => unknown;
type OnCanvasResizeFunction = (reason: CanvasResizeReason, instance: AudioMotionAnalyzer) => unknown;

type CanvasResizeReason = "create" | "fschange" | "lores" | "resize" | "user";

interface Options {
    audioCtx?: AudioContext;
    barSpace?: number;
    fftSize?: number;
    gradient?: string;
    height?: number;
    lineWidth?: number;
    loRes?: boolean;
    lumiBars?: boolean;
    maxDecibels?: number;
    maxFreq?: number;
    minDecibles?: number;
    minFreq?: number;
    mode?: number;
    onCanvasDraw?: OnCanvasDrawFunction;
    onCanvasResize?: OnCanvasResizeFunction;
    reflexAlpha?: number;
    reflexFit?: boolean;
    reflexRatio?: number;
    showBgColor?: boolean;
    showFPS?: boolean;
    showLeds?: boolean;
    showPeaks?: boolean;
    showScale?: boolean;
    smoothing?: number;
    source?: HTMLMediaElement;
    start?: boolean;
    width?: number;
}

type GradientColorStop = string | { pos: number; color: string};

interface GradientOptions {
    bgColor: string;
    dir?: 'h';
    colorStops: GradientColorStop[];
}

declare class AudioMotionAnalyzer {
    constructor(container?: HTMLElement, options?: Options);

    get analyzer(): AnalyserNode;
    get audioCtx(): AudioContext;
    get audioSource(): MediaElementAudioSourceNode;
    get canvas(): HTMLCanvasElement;
    get canvasCtx(): CanvasRenderingContext2D;

    get barSpace(): number;
    set barSpace(value: number);

    get dataArray(): Uint8Array;

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

    get isOn(): boolean;

    public linewidth: number;

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

    get mode(): number;
    set mode(value: number);

    get pixelRatio(): number;

    public reflexAlpha: number;
    public reflexFit: boolean;

    get reflexRatio(): number;
    set reflexRatio(value: number);

    public showBgColor: boolean;
    public showFPS: boolean;
    public showLeds: boolean;
    public showPeaks: boolean;
    public showScale: boolean;

    get smoothing(): number;
    set smoothing(value: number);

    get version(): string;

    public onCanvasDraw: OnCanvasDrawFunction;
    public onCanvasResize: OnCanvasResizeFunction;

    public connectAudio(element: HTMLMediaElement): MediaElementAudioSourceNode;
    public registerGradient(name: string, options: GradientOptions): void;
    public setCanvasSize(width: number, height: number): void;
    public setFreqRange(minFreq: number, maxFreq: number): void;
    public setOptions(options: Options): void;
    public setSensitivity(minDecibels: number, maxDecibels: number): void;
    public toggleAnalyzer(value?: boolean): void;
    public toggleFullscreen(): void;
}

export default AudioMotionAnalyzer;