/**!
 * audioMotion-analyzer
 * High-resolution real-time graphic audio spectrum analyzer JS module
 *
 * @version 4.5.0
 * @author  Henrique Avila Vianna <hvianna@gmail.com> <https://henriquevianna.com>
 * @license AGPL-3.0-or-later
 */

const VERSION = "4.5.0";

type AnalyzerBarData = {
	width: number;
	alpha: [number, number];
	binHi: number;
	binLo: number;
	posX: number;
	freq: number;
	freqLo: number;
	freqHi: number;
	ratioLo: number;
	ratioHi: number;
	hold: [number, number] | [number];
	peak: [number, number];
	value: [number, number] | [number];
	barCenter: number;
};

type AudioSource = HTMLMediaElement | AudioNode;

type ChannelLayout =
	| typeof CHANNEL_SINGLE
	| typeof CHANNEL_HORIZONTAL
	| typeof CHANNEL_VERTICAL
	| typeof CHANNEL_COMBINED;

type ColorMode =
	| typeof COLOR_GRADIENT
	| typeof COLOR_BAR_INDEX
	| typeof COLOR_BAR_LEVEL;

type ColorStop = {
	color: string;
	level: number;
	pos: number;
};

type Gradient = {
	bgColor: string;
	dir?: string;
	colorStops: ColorStop[];
};

type Reason =
	| typeof REASON_CREATE
	| typeof REASON_FSCHANGE
	| typeof REASON_LORES
	| typeof REASON_RESIZE
	| typeof REASON_USER;

// internal constants
const PI = Math.PI;
const TAU = 2 * PI;
const HALF_PI = PI / 2;
const C_1 = 8.17579892;

const CANVAS_BACKGROUND_COLOR = "#000";
const CHANNEL_COMBINED = "dual-combined";
const CHANNEL_HORIZONTAL = "dual-horizontal";
const CHANNEL_SINGLE = "single";
const CHANNEL_VERTICAL = "dual-vertical";
const COLOR_BAR_INDEX = "bar-index";
const COLOR_BAR_LEVEL = "bar-level";
const COLOR_GRADIENT = "gradient";
const DEBOUNCE_TIMEOUT = 60;
const EVENT_CLICK = "click";
const EVENT_FULLSCREENCHANGE = "fullscreenchange";
const EVENT_RESIZE = "resize";
const GRADIENT_DEFAULT_BGCOLOR = "#111";
const FILTER_NONE = "";
const FILTER_A = "A";
const FILTER_B = "B";
const FILTER_C = "C";
const FILTER_D = "D";
const FILTER_468 = "468";
const FONT_FAMILY = "sans-serif";
const FPS_COLOR = "#0f0";
const LEDS_UNLIT_COLOR = "#7f7f7f22";
const MODE_GRAPH = 10;
const REASON_CREATE = "create";
const REASON_FSCHANGE = "fschange";
const REASON_LORES = "lores";
const REASON_RESIZE = EVENT_RESIZE;
const REASON_USER = "user";
const SCALEX_BACKGROUND_COLOR = "#000c";
const SCALEX_LABEL_COLOR = "#fff";
const SCALEX_HIGHLIGHT_COLOR = "#4f4";
const SCALEY_LABEL_COLOR = "#888";
const SCALEY_MIDLINE_COLOR = "#555";
const SCALE_BARK = "bark";
const SCALE_LINEAR = "linear";
const SCALE_LOG = "log";
const SCALE_MEL = "mel";

const frequencyPresets = {
	bass: [20, 250],
	lowMid: [250, 500],
	mid: [500, 2e3],
	highMid: [2e3, 4e3],
	treble: [4e3, 16e3],
} as const;

type FrequencyScale =
	| typeof SCALE_LOG
	| typeof SCALE_BARK
	| typeof SCALE_MEL
	| typeof SCALE_LINEAR;

type BaseGradient = [
	string,
	{
		colorStops: (string | { color: string; level: number; pos?: number })[];
		bgColor?: string;
		dir?: string;
	},
];

const PRISM = [
	"#a35",
	"#c66",
	"#e94",
	"#ed0",
	"#9d5",
	"#4d8",
	"#2cb",
	"#0bc",
	"#09c",
	"#36b",
];
const GRADIENTS: BaseGradient[] = [
	[
		"classic",
		{
			colorStops: [
				"red",
				{ color: "yellow", level: 0.85, pos: 0.6 },
				{ color: "lime", level: 0.475 },
			],
		},
	],
	[
		"prism",
		{
			colorStops: PRISM,
		},
	],
	[
		"rainbow",
		{
			dir: "h",
			colorStops: ["#817", ...PRISM, "#639"],
		},
	],
	[
		"orangered",
		{
			bgColor: "#3e2f29",
			colorStops: ["OrangeRed"],
		},
	],
	[
		"steelblue",
		{
			bgColor: "#222c35",
			colorStops: ["SteelBlue"],
		},
	],
];

type Options = {
	alphaBars?: boolean;
	ansiBands?: boolean;
	audioCtx?: AudioContext; // constructor only
	barSpace?: number;
	bgAlpha?: number;
	canvas?: HTMLCanvasElement; // constructor only
	channelLayout?: ChannelLayout;
	colorMode?: ColorMode;
	connectSpeakers?: boolean;
	fadePeaks?: boolean;
	fftSize?: number;
	fillAlpha?: number;
	frequencyScale?: FrequencyScale;
	fsElement?: Element; // constructor only
	gradient?: BaseGradient[0];
	gradientLeft?: string;
	gradientRight?: string;
	gravity?: number;
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
	mode?: number;
	noteLabels?: boolean;
	onCanvasDraw?: (
		instance: AudioMotionAnalyzer,
		params: {
			timestamp: DOMHighResTimeStamp;
			canvasGradients: CanvasGradient[];
		},
	) => void;
	onCanvasResize?: (reason: string, instance: AudioMotionAnalyzer) => void;
	outlineBars?: boolean;
	overlay?: boolean;
	peakFadeTime?: number;
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
	showBgColor?: boolean;
	showFPS?: boolean;
	showPeaks?: boolean;
	showScaleX?: boolean;
	showScaleY?: boolean;
	smoothing?: number;
	source?: HTMLMediaElement | AudioNode; // constructor only
	spinSpeed?: number;
	splitGradient?: boolean;
	start?: boolean;
	trueLeds?: boolean;
	useCanvas?: boolean;
	volume?: number;
	weightingFilter?: string;
	width?: number;
};

const DEFAULT_SETTINGS = {
	alphaBars: false,
	ansiBands: false,
	barSpace: 0.1,
	bgAlpha: 0.7,
	channelLayout: CHANNEL_SINGLE,
	colorMode: COLOR_GRADIENT,
	fadePeaks: false,
	fftSize: 8192,
	fillAlpha: 1,
	frequencyScale: SCALE_LOG,
	gradient: GRADIENTS[0][0],
	gravity: 3.8,
	height: undefined,
	ledBars: false,
	linearAmplitude: false,
	linearBoost: 1,
	lineWidth: 0,
	loRes: false,
	lumiBars: false,
	maxDecibels: -25,
	maxFPS: 0,
	maxFreq: 22000,
	minDecibels: -85,
	minFreq: 20,
	mirror: 0,
	mode: 0,
	noteLabels: false,
	outlineBars: false,
	overlay: false,
	peakFadeTime: 750,
	peakHoldTime: 500,
	peakLine: false,
	radial: false,
	radialInvert: false,
	radius: 0.3,
	reflexAlpha: 0.15,
	reflexBright: 1,
	reflexFit: true,
	reflexRatio: 0,
	roundBars: false,
	showBgColor: true,
	showFPS: false,
	showPeaks: true,
	showScaleX: true,
	showScaleY: false,
	smoothing: 0.5,
	spinSpeed: 0,
	splitGradient: false,
	start: true,
	trueLeds: false,
	useCanvas: true,
	volume: 1,
	weightingFilter: FILTER_NONE,
	width: undefined,
} as const satisfies Options;

// custom error messages
const ERR_AUDIO_CONTEXT_FAIL: [string, string] = [
	"ERR_AUDIO_CONTEXT_FAIL",
	"Could not create audio context. Web Audio API not supported?",
];
const ERR_INVALID_AUDIO_CONTEXT: [string, string] = [
	"ERR_INVALID_AUDIO_CONTEXT",
	"Provided audio context is not valid",
];
const ERR_UNKNOWN_GRADIENT: [string, string] = [
	"ERR_UNKNOWN_GRADIENT",
	"Unknown gradient",
];
const ERR_FREQUENCY_TOO_LOW: [string, string] = [
	"ERR_FREQUENCY_TOO_LOW",
	"Frequency values must be >= 1",
];
const ERR_INVALID_MODE: [string, string] = ["ERR_INVALID_MODE", "Invalid mode"];
const ERR_REFLEX_OUT_OF_RANGE: [string, string] = [
	"ERR_REFLEX_OUT_OF_RANGE",
	"Reflex ratio must be >= 0 and < 1",
];
const ERR_INVALID_AUDIO_SOURCE: [string, string] = [
	"ERR_INVALID_AUDIO_SOURCE",
	"Audio source must be an instance of HTMLMediaElement or AudioNode",
];
const ERR_GRADIENT_INVALID_NAME: [string, string] = [
	"ERR_GRADIENT_INVALID_NAME",
	"Gradient name must be a non-empty string",
];
const ERR_GRADIENT_NOT_AN_OBJECT: [string, string] = [
	"ERR_GRADIENT_NOT_AN_OBJECT",
	"Gradient options must be an object",
];
const ERR_GRADIENT_MISSING_COLOR: [string, string] = [
	"ERR_GRADIENT_MISSING_COLOR",
	"Gradient colorStops must be a non-empty array",
];

class AudioMotionError extends Error {
	code: string;
	constructor(error: [string, string], value?: unknown) {
		const [code, message] = error;
		super(message + (value !== undefined ? `: ${value}` : ""));
		this.name = "AudioMotionError";
		this.code = code;
		this.message = message;
	}
}

// helper function - output deprecation warning message on console
const deprecate = (name: string, alternative: string) =>
	console.warn(`${name} is deprecated. Use ${alternative} instead.`);

// helper function - validate a given value with an array of strings (by default, all lowercase)
// returns the validated value, or the first element of `list` if `value` is not found in the array
const validateFromList = <T extends string>(value: T | undefined, list: T[]) =>
	value && list.includes(value) ? value : list[0];

// helper function - find the Y-coordinate of a point located between two other points, given its X-coordinate

const findY = (x1: number, y1: number, x2: number, y2: number, x: number) =>
	y1 + ((y2 - y1) * (x - x1)) / (x2 - x1);

// AudioMotionAnalyzer class

export class AudioMotionAnalyzer {
	private _ready: boolean;
	private _analyzer: AnalyserNode[];
	private _alphaBars!: boolean;
	private _ansiBands!: boolean;
	private _barSpace!: number;
	private _chLayout!: ChannelLayout;
	private _colorMode!: string;
	private _bars: AnalyzerBarData[] = [];
	private _energy = { val: 0, peak: 0, hold: 0 };
	private _aux!: {
		analyzerWidth: number;
		analyzerHeight: number;
		centerX: number;
		centerY: number;
		channelCoords: {
			channelTop: number;
			channelBottom: number;
			analyzerBottom: number;
		}[];
		channelHeight: number;
		channelGap: number;
		initialX: number;
		innerRadius: number;
		outerRadius: number;
		scaleMin: number;
		unitWidth: number;
	};
	private _destroyed: boolean;
	private _flg: {
		isAlpha?: boolean;
		isBands?: boolean;
		isLeds?: boolean;
		isLumi?: boolean;
		isOctaves?: boolean;
		isOutline?: boolean;
		isRound?: boolean;
		noLedGap?: boolean;
	};
	private _fps: number;
	private _gradients: Record<string, Gradient>;
	private _last: number;
	private _outNodes: AudioNode[];
	private _sources: AudioNode[];
	private _ownCanvas: boolean;
	private _ctx: CanvasRenderingContext2D;
	private _container: Element;
	private _defaultWidth: number;
	private _defaultHeight: number;
	private _splitter: ChannelSplitterNode;
	private _merger: ChannelMergerNode;
	private _input: GainNode;
	private _output: GainNode;
	private _fsEl: Element;
	private _fsTimeout?: number;
	private _fsChanging: unknown;
	private _observer?: ResizeObserver;
	private _controller: AbortController;
	private _frames: number;
	private _time!: number;
	useCanvas: boolean;
	private _fadePeaks!: boolean;
	private _fftData!: Float32Array[];
	private _frequencyScale!: FrequencyScale;
	private _selectedGrads: string[];
	private _gravity!: number;
	private _height?: number;
	private _showLeds!: boolean;
	private _linearAmplitude!: boolean;
	private _linearBoost!: number;
	private _lineWidth!: number;
	private _loRes!: boolean;
	private _lumiBars!: boolean;
	private _maxFPS!: number;
	private _maxFreq!: number;
	private _minFreq!: number;
	private _mirror!: number;
	private _mode!: number;
	private _noteLabels!: boolean;
	private _outlineBars!: boolean;
	private _peakFadeTime!: number;
	private _peakHoldTime!: number;
	private _peakLine!: boolean;
	private _radial!: boolean;
	private _radialInvert!: boolean;
	private _radius!: number;
	private _reflexRatio!: number;
	private _roundBars!: boolean;
	private _spinSpeed!: number;
	private _spinAngle: number;
	private _splitGradient!: boolean;
	private _trueLeds!: boolean;
	private _weightingFilter?: string;
	private _width?: number;
	private _fsHeight!: number;
	private _fsWidth!: number;
	private _runId?: number;
	private _pixelRatio!: number;
	private _ledParams: [number, number, number] | undefined;
	private _leds!: [number, number, number, number];
	private _scaleX: CanvasRenderingContext2D;
	private _scaleR: CanvasRenderingContext2D;
	reflexFit: boolean;
	reflexAlpha: number;
	reflexBright: number;
	showScaleX: boolean;
	bgAlpha: number;
	showScaleY: boolean;
	showFPS: boolean;
	onCanvasDraw?: (
		instance: AudioMotionAnalyzer,
		params: {
			timestamp: DOMHighResTimeStamp;
			canvasGradients: CanvasGradient[];
		},
	) => void;
	private _canvasGradients: CanvasGradient[];
	overlay: unknown;
	private _fsStatus: unknown;
	onCanvasResize?: (reason: string, instance: AudioMotionAnalyzer) => void;
	fillAlpha: number;
	showBgColor: boolean;
	showPeaks: boolean;

	constructor(container: Element, options: Options) {
		const config = { ...DEFAULT_SETTINGS, ...options };
		this._ready = false;

		// Initialize internal objects
		this._destroyed = false;
		this._energy = { val: 0, peak: 0, hold: 0 };
		this._flg = {}; // flags
		this._fps = 0;
		this._gradients = {}; // registered gradients
		this._last = 0; // timestamp of last rendered frame
		this._outNodes = []; // output nodes
		this._selectedGrads = []; // names of the currently selected gradients for channels 0 and 1
		this._sources = []; // input nodes
		this._frames = 0; // frame counter
		this._spinAngle = -HALF_PI; // initial rotation angle
		this._canvasGradients = []; // canvas gradients

		// Create a new canvas or use the one provided by the user
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const canvas = options.canvas ?? document.createElement("canvas")!;

		this._ownCanvas = !(options.canvas instanceof HTMLCanvasElement);

		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		this._ctx = canvas.getContext("2d")!;

		// Register built-in gradients
		for (const [name, options] of GRADIENTS)
			this.registerGradient(name, options);

		// Set container
		this._container =
			container || (!this._ownCanvas && canvas.parentElement) || document.body;

		// Make sure we have minimal width and height dimensions in case of an inline container
		this._defaultWidth = this._container.clientWidth || 640;
		this._defaultHeight = this._container.clientHeight || 270;

		// Use audio context provided by user, or create a new one

		let audioCtx: AudioContext;
		if (options.source) {
			if (options.source instanceof AudioNode) {
				audioCtx = options.source.context as AudioContext;
			} else if (options.source instanceof HTMLMediaElement) {
				audioCtx = new (window.AudioContext || window.webkitAudioContext)();
			} else {
				throw new AudioMotionError(ERR_INVALID_AUDIO_CONTEXT);
			}
		} else {
			audioCtx =
				options.audioCtx ||
				new (window.AudioContext || window.webkitAudioContext)();
		}

		// make sure audioContext is valid
		if (!audioCtx.createGain)
			throw new AudioMotionError(ERR_INVALID_AUDIO_CONTEXT);

		/*
			Connection routing:
			===================

			for dual channel layouts:                +--->  analyzer[0]  ---+
													 |                      |
			(source) --->  input  --->  splitter  ---+                      +--->  merger  --->  output  ---> (destination)
													 |                      |
													 +--->  analyzer[1]  ---+

			for single channel layout:

			(source) --->  input  ----------------------->  analyzer[0]  --------------------->  output  ---> (destination)

		*/

		// create the analyzer nodes, channel splitter and merger, and gain nodes for input/output connections
		this._analyzer = [audioCtx.createAnalyser(), audioCtx.createAnalyser()];
		const analyzer = this._analyzer;
		this._splitter = audioCtx.createChannelSplitter(2);
		const splitter = this._splitter;
		this._merger = audioCtx.createChannelMerger(2);
		const merger = this._merger;
		this._input = audioCtx.createGain();
		this._output = audioCtx.createGain();

		// connect audio source if provided in the options
		if (options.source) this.connectInput(options.source);

		// connect splitter -> analyzers
		for (const i of [0, 1]) splitter.connect(analyzer[i], i);

		// connect merger -> output
		merger.connect(this._output);

		// connect output -> destination (speakers)
		if (options.connectSpeakers !== false) this.connectOutput();

		// create auxiliary canvases for the X-axis and radial scale labels
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		this._scaleX = document.createElement("canvas").getContext("2d")!;
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		this._scaleR = document.createElement("canvas").getContext("2d")!;

		// set fullscreen element (defaults to canvas)
		this._fsEl = options.fsElement || canvas;

		// Update canvas size on container / window resize and fullscreen events

		// Fullscreen changes are handled quite differently across browsers:
		// 1. Chromium browsers will trigger a `resize` event followed by a `fullscreenchange`
		// 2. Firefox triggers the `fullscreenchange` first and then the `resize`
		// 3. Chrome on Android (TV) won't trigger a `resize` event, only `fullscreenchange`
		// 4. Safari won't trigger `fullscreenchange` events at all, and on iPadOS the `resize`
		//    event is triggered **on the window** only (last tested on iPadOS 14)

		// helper function for resize events
		const onResize = () => {
			if (!this._fsTimeout) {
				// delay the resize to prioritize a possible following `fullscreenchange` event
				this._fsTimeout = window.setTimeout(() => {
					if (!this._fsChanging) {
						this._setCanvas(REASON_RESIZE);
						this._fsTimeout = 0;
					}
				}, DEBOUNCE_TIMEOUT);
			}
		};

		// if browser supports ResizeObserver, listen for resize on the container
		if (window.ResizeObserver) {
			this._observer = new ResizeObserver(onResize);
			this._observer.observe(this._container);
		}

		// create an AbortController to remove event listeners on destroy()
		this._controller = new AbortController();
		const signal = this._controller.signal;

		// listen for resize events on the window - required for fullscreen on iPadOS
		window.addEventListener(EVENT_RESIZE, onResize, { signal });

		// listen for fullscreenchange events on the canvas - not available on Safari
		canvas.addEventListener(
			EVENT_FULLSCREENCHANGE,
			() => {
				// set flag to indicate a fullscreen change in progress
				this._fsChanging = true;

				// if there is a scheduled resize event, clear it
				if (this._fsTimeout) window.clearTimeout(this._fsTimeout);

				// update the canvas
				this._setCanvas(REASON_FSCHANGE);

				// delay clearing the flag to prevent any shortly following resize event
				this._fsTimeout = window.setTimeout(() => {
					this._fsChanging = false;
					this._fsTimeout = 0;
				}, DEBOUNCE_TIMEOUT);
			},
			{ signal },
		);

		// Resume audio context if in suspended state (browsers' autoplay policy)
		const unlockContext = () => {
			if (audioCtx.state === "suspended") audioCtx.resume();
			window.removeEventListener(EVENT_CLICK, unlockContext);
		};
		window.addEventListener(EVENT_CLICK, unlockContext);

		// reset FPS-related variables when window becomes visible (avoid FPS drop due to frames not rendered while hidden)
		document.addEventListener(
			"visibilitychange",
			() => {
				if (document.visibilityState !== "hidden") {
					this._frames = 0;
					this._time = performance.now();
				}
			},
			{ signal },
		);

		this.alphaBars = config.alphaBars;
		this.ansiBands = config.ansiBands;
		this.barSpace = config.barSpace;
		this.channelLayout = config.channelLayout;
		this.colorMode = config.colorMode;
		this.bgAlpha = config.bgAlpha;
		this.colorMode = config.colorMode;
		this.fadePeaks = config.fadePeaks;
		this.fftSize = config.fftSize;
		this.fillAlpha = config.fillAlpha;
		this.frequencyScale = config.frequencyScale;
		this.gradient = config.gradient;
		this.gradientLeft = config.gradientLeft || config.gradient;
		this.gradientRight = config.gradientRight || config.gradient;
		this.gravity = config.gravity;
		if (config.height) this.height = config.height;
		this.ledBars = config.ledBars;
		this.linearAmplitude = config.linearAmplitude;
		this.linearBoost = config.linearBoost;
		this.lineWidth = config.lineWidth;
		this.loRes = config.loRes;
		this.lumiBars = config.lumiBars;
		this.maxDecibels = config.maxDecibels;
		this.maxFPS = config.maxFPS;
		this.maxFreq = config.maxFreq;
		this.minDecibels = config.minDecibels;
		this.minFreq = config.minFreq;
		this.mirror = config.mirror;
		this.mode = config.mode;
		this.noteLabels = config.noteLabels;
		this.outlineBars = config.outlineBars;
		if (config.onCanvasDraw) this.onCanvasDraw = config.onCanvasDraw;
		if (config.onCanvasResize) this.onCanvasResize = config.onCanvasResize;
		this.overlay = config.overlay;
		this.peakFadeTime = config.peakFadeTime;
		this.peakHoldTime = config.peakHoldTime;
		this.peakLine = config.peakLine;
		this.radial = config.radial;
		this.radialInvert = config.radialInvert;
		this.radius = config.radius;
		this.reflexAlpha = config.reflexAlpha;
		this.reflexBright = config.reflexBright;
		this.reflexFit = config.reflexFit;
		this.reflexRatio = config.reflexRatio;
		this.roundBars = config.roundBars;
		this.showBgColor = config.showBgColor;
		this.showFPS = config.showFPS;
		this.showPeaks = config.showPeaks;
		this.showScaleX = config.showScaleX;
		this.showScaleY = config.showScaleY;
		this.smoothing = config.smoothing;
		this.spinSpeed = config.spinSpeed;
		this.splitGradient = config.splitGradient;
		this.trueLeds = config.trueLeds;
		this.useCanvas = config.useCanvas;
		this.volume = config.volume;
		this.weightingFilter = config.weightingFilter;
		if (config.width) this.width = config.width;

		// Add canvas to the container (only when canvas not provided by user)
		if (this.useCanvas && this._ownCanvas) this._container.appendChild(canvas);

		// Finish canvas setup
		this._ready = true;
		this._setCanvas(REASON_CREATE);
		if (options.start === undefined) this.toggleAnalyzer(options.start);
	}

	/**
	 * ==========================================================================
	 *
	 * PUBLIC PROPERTIES GETTERS AND SETTERS
	 *
	 * ==========================================================================
	 */

	get alphaBars() {
		return this._alphaBars;
	}
	set alphaBars(value) {
		this._alphaBars = !!value;
		this._calcBars();
	}

	get ansiBands() {
		return this._ansiBands;
	}
	set ansiBands(value) {
		this._ansiBands = !!value;
		this._calcBars();
	}

	get barSpace() {
		return this._barSpace;
	}
	set barSpace(value) {
		this._barSpace = +value || 0;
		this._calcBars();
	}

	get channelLayout() {
		return this._chLayout;
	}
	set channelLayout(value) {
		this._chLayout = validateFromList(value, [
			CHANNEL_SINGLE,
			CHANNEL_HORIZONTAL,
			CHANNEL_VERTICAL,
			CHANNEL_COMBINED,
		]);

		// update node connections

		this._input.disconnect();
		this._input.connect(
			this._chLayout !== CHANNEL_SINGLE ? this._splitter : this._analyzer[0],
		);
		this._analyzer[0].disconnect();
		if (this._outNodes.length)
			// connect analyzer only if the output is connected to other nodes
			this._analyzer[0].connect(
				this._chLayout !== CHANNEL_SINGLE ? this._merger : this._output,
			);

		this._calcBars();
		this._makeGrad();
	}

	get colorMode() {
		return this._colorMode;
	}
	set colorMode(value) {
		this._colorMode = validateFromList(value, [
			COLOR_GRADIENT,
			COLOR_BAR_INDEX,
			COLOR_BAR_LEVEL,
		]);
	}

	get fadePeaks() {
		return this._fadePeaks;
	}
	set fadePeaks(value) {
		this._fadePeaks = !!value;
	}

	get fftSize() {
		return this._analyzer[0].fftSize;
	}
	set fftSize(value) {
		for (const i of [0, 1]) this._analyzer[i].fftSize = value;
		const binCount = this._analyzer[0].frequencyBinCount;
		this._fftData = [new Float32Array(binCount), new Float32Array(binCount)];
		this._calcBars();
	}

	get frequencyScale() {
		return this._frequencyScale;
	}
	set frequencyScale(value) {
		this._frequencyScale = validateFromList(value, [
			SCALE_LOG,
			SCALE_BARK,
			SCALE_MEL,
			SCALE_LINEAR,
		]);
		this._calcBars();
	}

	get gradient() {
		return this._selectedGrads[0];
	}
	set gradient(value) {
		this._setGradient(value);
	}

	get gradientLeft() {
		return this._selectedGrads[0];
	}
	set gradientLeft(value) {
		this._setGradient(value, 0);
	}

	get gradientRight() {
		return this._selectedGrads[1];
	}
	set gradientRight(value) {
		this._setGradient(value, 1);
	}

	get gravity() {
		return this._gravity;
	}
	set gravity(value) {
		this._gravity =
			value > 0 ? +value : this._gravity || DEFAULT_SETTINGS.gravity;
	}

	get height() {
		return this._height;
	}
	set height(h) {
		this._height = h;
		this._setCanvas(REASON_USER);
	}

	get ledBars() {
		return this._showLeds;
	}
	set ledBars(value) {
		this._showLeds = !!value;
		this._calcBars();
	}

	get linearAmplitude() {
		return this._linearAmplitude;
	}
	set linearAmplitude(value) {
		this._linearAmplitude = !!value;
	}

	get linearBoost() {
		return this._linearBoost;
	}
	set linearBoost(value) {
		this._linearBoost = value >= 1 ? +value : 1;
	}

	get lineWidth() {
		return this._lineWidth;
	}
	set lineWidth(value) {
		this._lineWidth = +value || 0;
	}

	get loRes() {
		return this._loRes;
	}
	set loRes(value) {
		this._loRes = !!value;
		this._setCanvas(REASON_LORES);
	}

	get lumiBars() {
		return this._lumiBars;
	}
	set lumiBars(value) {
		this._lumiBars = !!value;
		this._calcBars();
		this._makeGrad();
	}

	get maxDecibels() {
		return this._analyzer[0].maxDecibels;
	}
	set maxDecibels(value) {
		for (const i of [0, 1]) this._analyzer[i].maxDecibels = value;
	}

	get maxFPS() {
		return this._maxFPS;
	}
	set maxFPS(value) {
		this._maxFPS = value < 0 ? 0 : +value || 0;
	}

	get maxFreq() {
		return this._maxFreq;
	}
	set maxFreq(value) {
		if (value < 1) throw new AudioMotionError(ERR_FREQUENCY_TOO_LOW);

		this._maxFreq = Math.min(value, this.audioCtx.sampleRate / 2);
		this._calcBars();
	}

	get minDecibels() {
		return this._analyzer[0].minDecibels;
	}
	set minDecibels(value) {
		for (const i of [0, 1]) this._analyzer[i].minDecibels = value;
	}

	get minFreq() {
		return this._minFreq;
	}
	set minFreq(value) {
		if (value < 1) throw new AudioMotionError(ERR_FREQUENCY_TOO_LOW);

		this._minFreq = +value;
		this._calcBars();
	}

	get mirror() {
		return this._mirror;
	}
	set mirror(value) {
		this._mirror = Math.sign(value) | 0; // ensure only -1, 0 or 1
		this._calcBars();
		this._makeGrad();
	}

	get mode() {
		return this._mode;
	}
	set mode(value) {
		const mode = value | 0;
		if (mode >= 0 && mode <= 10 && mode !== 9) {
			this._mode = mode;
			this._calcBars();
			this._makeGrad();
		} else throw new AudioMotionError(ERR_INVALID_MODE, value);
	}

	get noteLabels() {
		return this._noteLabels;
	}
	set noteLabels(value) {
		this._noteLabels = !!value;
		this._createScales();
	}

	get outlineBars() {
		return this._outlineBars;
	}
	set outlineBars(value) {
		this._outlineBars = !!value;
		this._calcBars();
	}

	get peakFadeTime() {
		return this._peakFadeTime;
	}
	set peakFadeTime(value) {
		this._peakFadeTime =
			value >= 0 ? +value : this._peakFadeTime || DEFAULT_SETTINGS.peakFadeTime;
	}

	get peakHoldTime() {
		return this._peakHoldTime;
	}
	set peakHoldTime(value) {
		this._peakHoldTime = +value || 0;
	}

	get peakLine() {
		return this._peakLine;
	}
	set peakLine(value) {
		this._peakLine = !!value;
	}

	get radial() {
		return this._radial;
	}
	set radial(value) {
		this._radial = !!value;
		this._calcBars();
		this._makeGrad();
	}

	get radialInvert() {
		return this._radialInvert;
	}
	set radialInvert(value) {
		this._radialInvert = !!value;
		this._calcBars();
		this._makeGrad();
	}

	get radius() {
		return this._radius;
	}
	set radius(value) {
		this._radius = +value || 0;
		this._calcBars();
		this._makeGrad();
	}

	get reflexRatio() {
		return this._reflexRatio;
	}
	set reflexRatio(value) {
		if (value < 0 || value >= 1)
			throw new AudioMotionError(ERR_REFLEX_OUT_OF_RANGE);

		this._reflexRatio = value;
		this._calcBars();
		this._makeGrad();
	}

	get roundBars() {
		return this._roundBars;
	}
	set roundBars(value) {
		this._roundBars = !!value;
		this._calcBars();
	}

	get smoothing() {
		return this._analyzer[0].smoothingTimeConstant;
	}
	set smoothing(value) {
		for (const i of [0, 1]) this._analyzer[i].smoothingTimeConstant = value;
	}

	get spinSpeed() {
		return this._spinSpeed;
	}
	set spinSpeed(value) {
		this._spinSpeed = value;
	}

	get splitGradient() {
		return this._splitGradient;
	}
	set splitGradient(value) {
		this._splitGradient = !!value;
		this._makeGrad();
	}
	get stereo() {
		deprecate("stereo", "channelLayout");
		return this._chLayout !== CHANNEL_SINGLE;
	}
	set stereo(value) {
		deprecate("stereo", "channelLayout");
		this.channelLayout = value ? CHANNEL_VERTICAL : CHANNEL_SINGLE;
	}
	get trueLeds() {
		return this._trueLeds;
	}
	set trueLeds(value) {
		this._trueLeds = !!value;
	}

	get volume() {
		return this._output.gain.value;
	}
	set volume(value) {
		this._output.gain.value = value;
	}

	get weightingFilter() {
		return this._weightingFilter;
	}
	set weightingFilter(value) {
		this._weightingFilter = validateFromList(value, [
			FILTER_NONE,
			FILTER_A,
			FILTER_B,
			FILTER_C,
			FILTER_D,
			FILTER_468,
		]);
	}

	get width() {
		return this._width;
	}
	set width(w) {
		this._width = w;
		this._setCanvas(REASON_USER);
	}

	// Read only properties

	get audioCtx() {
		return this._input.context as AudioContext;
	}
	get canvas() {
		return this._ctx.canvas;
	}
	get canvasCtx() {
		return this._ctx;
	}
	get connectedSources() {
		return this._sources;
	}
	get connectedTo() {
		return this._outNodes;
	}
	get fps() {
		return this._fps;
	}
	get fsHeight() {
		return this._fsHeight;
	}
	get fsWidth() {
		return this._fsWidth;
	}
	get isAlphaBars() {
		return this._flg.isAlpha;
	}
	get isBandsMode() {
		return this._flg.isBands;
	}
	get isDestroyed() {
		return this._destroyed;
	}
	get isFullscreen() {
		return (
			this._fsEl &&
			(document.fullscreenElement || document.webkitFullscreenElement) ===
				this._fsEl
		);
	}
	get isLedBars() {
		return this._flg.isLeds;
	}
	get isLumiBars() {
		return this._flg.isLumi;
	}
	get isOctaveBands() {
		return this._flg.isOctaves;
	}
	get isOn() {
		return !!this._runId;
	}
	get isOutlineBars() {
		return this._flg.isOutline;
	}
	get pixelRatio() {
		return this._pixelRatio;
	}
	get isRoundBars() {
		return this._flg.isRound;
	}
	static get version() {
		return VERSION;
	}
	/**
	 * ==========================================================================
	 *
	 * PUBLIC METHODS
	 *
	 * ==========================================================================
	 */

	/**
	 * Connects an HTML media element or audio node to the analyzer
	 *
	 * @param {object} an instance of HTMLMediaElement or AudioNode
	 * @returns {object} a MediaElementAudioSourceNode object if created from HTML element, or the same input object otherwise
	 */
	connectInput(source: AudioSource) {
		const isHTML = source instanceof HTMLMediaElement;

		if (!(isHTML || source.connect))
			throw new AudioMotionError(ERR_INVALID_AUDIO_SOURCE);

		// if source is an HTML element, create an audio node for it; otherwise, use the provided audio node
		const node = isHTML
			? this.audioCtx.createMediaElementSource(source)
			: source;

		if (!this._sources.includes(node)) {
			node.connect(this._input);
			this._sources.push(node);
		}

		return node;
	}

	/**
	 * Connects the analyzer output to another audio node
	 *
	 * @param [{object}] an AudioNode; if undefined, the output is connected to the audio context destination (speakers)
	 */
	connectOutput(node = this.audioCtx.destination) {
		if (this._outNodes.includes(node)) return;

		this._output.connect(node);
		this._outNodes.push(node);

		// when connecting the first node, also connect the analyzer nodes to the merger / output nodes
		if (this._outNodes.length === 1) {
			for (const i of [0, 1])
				this._analyzer[i].connect(
					this._chLayout === CHANNEL_SINGLE && !i ? this._output : this._merger,
					0,
					i,
				);
		}
	}

	/**
	 * Destroys instance
	 */
	destroy() {
		if (!this._ready) return;

		const {
			canvas,
			_controller,
			_input,
			_merger,
			_observer,
			_ownCanvas,
			_splitter,
		} = this;

		this._destroyed = true;
		this._ready = false;
		this.stop();

		// remove event listeners
		_controller.abort();
		if (_observer) _observer.disconnect();

		// clear callbacks and fullscreen element
		this.onCanvasResize = undefined;
		this.onCanvasDraw = undefined;

		// disconnect audio nodes
		this.disconnectInput();
		this.disconnectOutput(); // also disconnects analyzer nodes
		_input.disconnect();
		_splitter.disconnect();
		_merger.disconnect();

		// remove canvas from the DOM (if not provided by the user)
		if (_ownCanvas && canvas) canvas.remove();

		// reset flags
		this._calcBars();
	}

	/**
	 * Disconnects audio sources from the analyzer
	 *
	 * @param [{object|array}] a connected AudioNode object or an array of such objects; if falsy, all connected nodes are disconnected
	 * @param [{boolean}] if true, stops/releases audio tracks from disconnected media streams (e.g. microphone)
	 */
	disconnectInput(sources?: AudioNode[] | AudioNode, stopTracks?: boolean) {
		let sourceArray: AudioNode[] = [];
		if (!sources) sourceArray = Array.from(this._sources);
		else if (!Array.isArray(sources)) sourceArray = [sources];

		for (const node of sourceArray) {
			const idx = this._sources.indexOf(node);
			if (stopTracks && node instanceof MediaStreamAudioSourceNode) {
				for (const track of node.mediaStream.getAudioTracks()) {
					track.stop();
				}
			}
			if (idx >= 0) {
				node.disconnect(this._input);
				this._sources.splice(idx, 1);
			}
		}
	}

	/**
	 * Disconnects the analyzer output from other audio nodes
	 *
	 * @param [{object}] a connected AudioNode object; if undefined, all connected nodes are disconnected
	 */
	disconnectOutput(node?: AudioNode) {
		if (node) {
			if (!this._outNodes.includes(node)) return;

			this._output.disconnect(node);
			this._outNodes = node ? this._outNodes.filter((e) => e !== node) : [];
		}

		// if disconnected from all nodes, also disconnect the analyzer nodes so they keep working on Chromium
		// see https://github.com/hvianna/audioMotion-analyzer/issues/13#issuecomment-808764848
		if (this._outNodes.length === 0) {
			for (const i of [0, 1]) this._analyzer[i].disconnect();
		}
	}

	getBars() {
		return Array.from(
			this._bars,
			({ posX, freq, freqLo, freqHi, hold, peak, value }) => ({
				posX,
				freq,
				freqLo,
				freqHi,
				hold,
				peak,
				value,
			}),
		);
	}

	/**
	 * Returns the energy of a frequency, or average energy of a range of frequencies
	 *
	 * @param [{number|string}] single or initial frequency (Hz), or preset name; if undefined, returns the overall energy
	 * @param [{number}] ending frequency (Hz)
	 * @returns {number|null} energy value (0 to 1) or null, if the specified preset is unknown
	 */
	getEnergy(
		startFreqParam: number | "peak" | keyof typeof frequencyPresets,
		endFreqParam?: number,
	) {
		let startFreq = startFreqParam;
		let endFreq = endFreqParam;
		if (startFreq === undefined) return this._energy.val;

		// if startFreq is a string, check for presets
		if (typeof startFreq === "string") {
			if (startFreq === "peak") return this._energy.peak;

			if (!frequencyPresets[startFreq]) return null;

			[startFreq, endFreq] = frequencyPresets[startFreq];
		}

		const startBin = this._freqToBin(startFreq);
		const endBin = endFreq ? this._freqToBin(endFreq) : startBin;
		const chnCount = this._chLayout === CHANNEL_SINGLE ? 1 : 2;

		let energy = 0;
		for (let channel = 0; channel < chnCount; channel++) {
			for (let i = startBin; i <= endBin; i++)
				energy += this._normalizedB(this._fftData[channel][i]);
		}

		return energy / (endBin - startBin + 1) / chnCount;
	}

	/**
	 * Registers a custom gradient
	 *
	 * @param {string} name
	 * @param {object} options
	 */
	registerGradient(name: string, options: BaseGradient[1]) {
		if (typeof name !== "string" || name.trim().length === 0)
			throw new AudioMotionError(ERR_GRADIENT_INVALID_NAME);

		if (typeof options !== "object")
			throw new AudioMotionError(ERR_GRADIENT_NOT_AN_OBJECT);

		const { colorStops } = options;

		if (!Array.isArray(colorStops) || !colorStops.length)
			throw new AudioMotionError(ERR_GRADIENT_MISSING_COLOR);

		const count = colorStops.length;
		const isInvalid = (val: number | undefined) =>
			val === undefined || val < 0 || val > 1;

		let newColorStops: {
			pos: number;
			color: string;
			level: number;
		}[] = [];

		// normalize all colorStops as objects with `pos`, `color` and `level` properties
		newColorStops = colorStops.map((colorStop, index) => ({
			pos:
				typeof colorStop === "string" ||
				isInvalid(colorStop.pos) ||
				colorStop.pos === undefined
					? index / Math.max(1, count - 1)
					: colorStop.pos,
			color: typeof colorStop === "string" ? colorStop : colorStop.color,
			level:
				typeof colorStop === "string" || isInvalid(colorStop.level)
					? 1 - index / count
					: colorStop.level,
		}));

		// make sure colorStops is in descending `level` order and that the first one has `level == 1`
		// this is crucial for proper operation of 'bar-level' colorMode!
		newColorStops.sort((a, b) =>
			a.level < b.level ? 1 : a.level > b.level ? -1 : 0,
		);
		newColorStops[0].level = 1;

		this._gradients[name] = {
			bgColor: options.bgColor || GRADIENT_DEFAULT_BGCOLOR,
			dir: options.dir,
			colorStops: newColorStops,
		};

		// if the registered gradient is one of the currently selected gradients, regenerate them
		if (this._selectedGrads.includes(name)) this._makeGrad();
	}

	/**
	 * Set dimensions of analyzer's canvas
	 *
	 * @param {number} w width in pixels
	 * @param {number} h height in pixels
	 */
	setCanvasSize(w: number, h: number) {
		this._width = w;
		this._height = h;
		this._setCanvas(REASON_USER);
	}

	/**
	 * Set desired frequency range
	 *
	 * @param {number} min lowest frequency represented in the x-axis
	 * @param {number} max highest frequency represented in the x-axis
	 */
	setFreqRange(min: number, max: number) {
		if (min < 1 || max < 1) throw new AudioMotionError(ERR_FREQUENCY_TOO_LOW);

		this._minFreq = Math.min(min, max);
		this.maxFreq = Math.max(min, max); // use the setter for maxFreq
	}

	/**
	 * Set custom parameters for LED effect
	 * If called with no arguments or if any property is invalid, clears any previous custom parameters
	 *
	 * @param {object} [params]
	 */
	setLedParams(params: {
		maxLeds: number;
		spaceV: number;
		spaceH: number;
	}) {
		this._ledParams =
			params.maxLeds > 0 && params.spaceV > 0 && params.spaceH >= 0
				? [params.maxLeds, params.spaceV, params.spaceH]
				: undefined;
		this._calcBars();
	}

	/**
	 * Adjust the analyzer's sensitivity
	 *
	 * @param {number} min minimum decibels value
	 * @param {number} max maximum decibels value
	 */
	setSensitivity(min: number, max: number) {
		for (const i of [0, 1]) {
			this._analyzer[i].minDecibels = Math.min(min, max);
			this._analyzer[i].maxDecibels = Math.max(min, max);
		}
	}

	/**
	 * Start the analyzer
	 */
	start() {
		this.toggleAnalyzer(true);
	}

	/**
	 * Stop the analyzer
	 */
	stop() {
		this.toggleAnalyzer(false);
	}

	/**
	 * Start / stop canvas animation
	 *
	 * @param {boolean} [force] if undefined, inverts the current state
	 * @returns {boolean} resulting state after the change
	 */
	toggleAnalyzer(force?: boolean) {
		const hasStarted = this.isOn;
		let shouldForce = force;

		if (force === undefined) shouldForce = !hasStarted;

		// Stop the analyzer if it was already running and must be disabled
		if (hasStarted && !force && this._runId) {
			cancelAnimationFrame(this._runId);
			this._runId = 0;
		}
		// Start the analyzer if it was stopped and must be enabled
		else if (!hasStarted && shouldForce && !this._destroyed) {
			this._frames = 0;
			this._time = performance.now();
			this._runId = requestAnimationFrame((timestamp) => this._draw(timestamp)); // arrow function preserves the scope of *this*
		}

		return this.isOn;
	}

	/**
	 * Toggles canvas full-screen mode
	 */
	toggleFullscreen() {
		if (this.isFullscreen) {
			if (document.exitFullscreen) document.exitFullscreen();
			else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
		} else {
			const fsEl = this._fsEl;
			if (!fsEl) return;
			if (fsEl.requestFullscreen) fsEl.requestFullscreen();
			else if (fsEl.webkitRequestFullscreen) fsEl.webkitRequestFullscreen();
		}
	}

	/**
	 * ==========================================================================
	 *
	 * PRIVATE METHODS
	 *
	 * ==========================================================================
	 */

	/**
	 * Return the frequency (in Hz) for a given FFT bin
	 */
	_binToFreq(bin: number) {
		return (bin * this.audioCtx.sampleRate) / this.fftSize || 1; // returns 1 for bin 0
	}

	/**
	 * Compute all internal data required for the analyzer, based on its current settings
	 */
	_calcBars() {
		this._bars = [];
		let bars: AnalyzerBarData[] = this._bars; // initialize object property

		if (!this._ready) {
			this._flg = {
				isAlpha: false,
				isBands: false,
				isLeds: false,
				isLumi: false,
				isOctaves: false,
				isOutline: false,
				isRound: false,
				noLedGap: false,
			};
			return;
		}

		const {
			_ansiBands,
			_barSpace,
			canvas,
			_chLayout,
			_maxFreq,
			_minFreq,
			_mirror,
			_mode,
			_radial,
			_radialInvert,
			_reflexRatio,
		} = this;
		const centerX = canvas.width >> 1;
		const centerY = canvas.height >> 1;
		const isDualVertical = _chLayout === CHANNEL_VERTICAL && !_radial;
		const isDualHorizontal = _chLayout === CHANNEL_HORIZONTAL;
		// COMPUTE FLAGS
		const isBands = _mode % 10 !== 0; // true for modes 1 to 9
		const isOctaves = isBands && this._frequencyScale === SCALE_LOG;
		const isLeds = this._showLeds && isBands && !_radial;
		const isLumi = this._lumiBars && isBands && !_radial;
		const isAlpha = this._alphaBars && !isLumi && _mode !== MODE_GRAPH;
		const isOutline = this._outlineBars && isBands && !isLumi && !isLeds;
		const isRound = this._roundBars && isBands && !isLumi && !isLeds;
		const noLedGap =
			_chLayout !== CHANNEL_VERTICAL || (_reflexRatio > 0 && !isLumi);
		// COMPUTE AUXILIARY VALUES
		// channelHeight is the total canvas height dedicated to each channel, including the reflex area, if any)
		const channelHeight =
			(canvas.height - (isDualVertical && !isLeds ? 0.5 : 0)) >>
			Number(isDualVertical);
		// analyzerHeight is the effective height used to render the analyzer, excluding the reflex area
		const analyzerHeight =
			(channelHeight * (isLumi || _radial ? 1 : 1 - _reflexRatio)) | 0;
		const analyzerWidth =
			canvas.width - centerX * Number(isDualHorizontal || _mirror !== 0);
		// channelGap is **0** if isLedDisplay == true (LEDs already have spacing); **1** if canvas height is odd (windowed); **2** if it's even
		// TODO: improve this, make it configurable?
		const channelGap = isDualVertical ? canvas.height - channelHeight * 2 : 0;
		const initialX =
			centerX * Number(_mirror === -1 && !isDualHorizontal && !_radial);

		let innerRadius =
			(Math.min(canvas.width, canvas.height) *
				0.375 *
				(_chLayout === CHANNEL_VERTICAL ? 1 : this._radius)) |
			0;
		let outerRadius = Math.min(centerX, centerY);

		if (_radialInvert && _chLayout !== CHANNEL_VERTICAL)
			[innerRadius, outerRadius] = [outerRadius, innerRadius];

		/**
		 *	CREATE ANALYZER BANDS
		 *
		 *	USES:
		 *		analyzerWidth
		 *		initialX
		 *		isBands
		 *		isOctaves
		 *
		 *	GENERATES:
		 *		bars (populates this._bars)
		 *		bardWidth
		 *		scaleMin
		 *		unitWidth
		 */

		// helper function to add a bar to the bars array
		// bar object format:
		// {
		//	 posX,
		//   freq,
		//   freqLo,
		//   freqHi,
		//   binLo,
		//   binHi,
		//   ratioLo,
		//   ratioHi,
		//   peak,    // peak value
		//   hold,    // peak hold frames (negative value indicates peak falling / fading)
		//   alpha,   // peak alpha (used by fadePeaks)
		//   value    // current bar value
		// }
		const barsPush = (
			args: Omit<
				AnalyzerBarData,
				"peak" | "hold" | "alpha" | "value" | "width" | "barCenter"
			>,
		) =>
			bars.push({
				...args,
				peak: [0, 0],
				hold: [0, 0],
				alpha: [0, 0],
				value: [0, 0],
				width: 0,
				barCenter: 0,
			});

		/*
			A simple interpolation is used to obtain an approximate amplitude value for any given frequency,
			from the available FFT data. We find the FFT bin which closer matches the desired frequency	and
			interpolate its value with that of the next adjacent bin, like so:

				v = v0 + ( v1 - v0 ) * ( log2( f / f0 ) / log2( f1 / f0 ) )
				                       \__________________________________/
				                                        |
				                                      ratio
				where:

				f  - desired frequency
				v  - amplitude (volume) of desired frequency
				f0 - frequency represented by the lower FFT bin
				f1 - frequency represented by the upper FFT bin
				v0 - amplitude of f0
				v1 - amplitude of f1

			ratio is calculated in advance here, to reduce computational complexity during real-time rendering.
		*/

		// helper function to calculate FFT bin and interpolation ratio for a given frequency
		const calcRatio = (freq: number) => {
			const bin = this._freqToBin(freq, "floor"); // find closest FFT bin
			const lower = this._binToFreq(bin);
			const upper = this._binToFreq(bin + 1);
			const ratio = Math.log2(freq / lower) / Math.log2(upper / lower);

			return [bin, ratio];
		};

		let barWidth: number;
		let scaleMin: number;
		let unitWidth: number;

		if (isOctaves) {
			// helper function to round a value to a given number of significant digits
			// `atLeast` set to true prevents reducing the number of integer significant digits
			const roundSD = (value: number, digits: number, atLeast?: boolean) =>
				+value.toPrecision(
					atLeast ? Math.max(digits, (1 + Math.log10(value)) | 0) : digits,
				);

			// helper function to find the nearest preferred number (Renard series) for a given value
			const nearestPreferred = (value: number) => {
				// R20 series is used here, as it provides closer approximations for 1/2 octave bands (non-standard)
				const preferred = [
					1, 1.12, 1.25, 1.4, 1.6, 1.8, 2, 2.24, 2.5, 2.8, 3.15, 3.55, 4, 4.5,
					5, 5.6, 6.3, 7.1, 8, 9, 10,
				];
				const power = Math.log10(value) | 0;
				const normalized = value / 10 ** power;

				let i = 1;
				while (i < preferred.length && normalized > preferred[i]) i++;

				if (normalized - preferred[i - 1] < preferred[i] - normalized) i--;

				return ((preferred[i] * 10 ** (power + 5)) | 0) / 1e5; // keep 5 significant digits
			};

			// ANSI standard octave bands use the base-10 frequency ratio, as preferred by [ANSI S1.11-2004, p.2]
			// The equal-tempered scale uses the base-2 ratio
			const bands = [0, 24, 12, 8, 6, 4, 3, 2, 1][_mode];
			const bandWidth = _ansiBands
				? 10 ** (3 / (bands * 10))
				: 2 ** (1 / bands); // 10^(3/10N) or 2^(1/N)
			const halfBand = bandWidth ** 0.5;

			let currFreq = _ansiBands ? 7.94328235 / (bands % 2 ? 1 : halfBand) : C_1;
			// For ANSI bands with even denominators (all except 1/1 and 1/3), the reference frequency (1 kHz)
			// must fall on the edges of a pair of adjacent bands, instead of midband [ANSI S1.11-2004, p.2]
			// In the equal-tempered scale, all midband frequencies represent a musical note or quarter-tone.

			do {
				let freq = currFreq; // midband frequency

				const freqLo = roundSD(freq / halfBand, 4, true); // lower edge frequency
				const freqHi = roundSD(freq * halfBand, 4, true); // upper edge frequency
				const [binLo, ratioLo] = calcRatio(freqLo);
				const [binHi, ratioHi] = calcRatio(freqHi);

				// for 1/1, 1/2 and 1/3 ANSI bands, use the preferred numbers to find the nominal midband frequency
				// for 1/4 to 1/24, round to 2 or 3 significant digits, according to the MSD [ANSI S1.11-2004, p.12]
				if (_ansiBands)
					freq =
						bands < 4
							? nearestPreferred(freq)
							: roundSD(freq, Number.parseInt(freq.toString()[0]) < 5 ? 3 : 2);
				else freq = roundSD(freq, 4, true);

				if (freq >= _minFreq)
					barsPush({
						posX: 0,
						freq,
						freqLo,
						freqHi,
						binLo,
						binHi,
						ratioLo,
						ratioHi,
					});

				currFreq *= bandWidth;
			} while (currFreq <= _maxFreq);

			barWidth = analyzerWidth / bars.length;

			bars = bars.map((bar, index) => ({
				...bar,
				posX: initialX + index * barWidth,
			}));

			const firstBar = bars[0];
			const lastBar = bars[bars.length - 1];

			scaleMin = this._freqScaling(firstBar.freqLo);
			unitWidth =
				analyzerWidth / (this._freqScaling(lastBar.freqHi) - scaleMin);

			// clamp edge frequencies to minFreq / maxFreq, if necessary
			// this is done after computing scaleMin and unitWidth, for the proper positioning of labels on the X-axis
			if (firstBar.freqLo && firstBar.freqLo < _minFreq) {
				firstBar.freqLo = _minFreq;
				[firstBar.binLo, firstBar.ratioLo] = calcRatio(_minFreq);
			}

			if (lastBar.freqHi && lastBar.freqHi > _maxFreq) {
				lastBar.freqHi = _maxFreq;
				[lastBar.binHi, lastBar.ratioHi] = calcRatio(_maxFreq);
			}
		} else if (isBands) {
			// a bands mode is selected, but frequency scale is not logarithmic

			const bands = [0, 24, 12, 8, 6, 4, 3, 2, 1][_mode] * 10;

			const invFreqScaling = (x: number) => {
				switch (this._frequencyScale) {
					case SCALE_BARK:
						return 1960 / (26.81 / (x + 0.53) - 1);
					case SCALE_MEL:
						return 700 * (2 ** x - 1);
					case SCALE_LINEAR:
						return x;
					case SCALE_LOG:
						return 10 ** x;
				}
			};

			barWidth = analyzerWidth / bands;

			scaleMin = this._freqScaling(_minFreq);
			unitWidth = analyzerWidth / (this._freqScaling(_maxFreq) - scaleMin);

			for (let i = 0, posX = 0; i < bands; i++, posX += barWidth) {
				const freqLo = invFreqScaling(scaleMin + posX / unitWidth);
				const freq = invFreqScaling(
					scaleMin + (posX + barWidth / 2) / unitWidth,
				);
				const freqHi = invFreqScaling(scaleMin + (posX + barWidth) / unitWidth);
				const [binLo, ratioLo] = calcRatio(freqLo);
				const [binHi, ratioHi] = calcRatio(freqHi);

				barsPush({
					posX: initialX + posX,
					freq,
					freqLo,
					freqHi,
					binLo,
					binHi,
					ratioLo,
					ratioHi,
				});
			}
		} else {
			// Discrete frequencies modes
			barWidth = 1;

			scaleMin = this._freqScaling(_minFreq);
			unitWidth = analyzerWidth / (this._freqScaling(_maxFreq) - scaleMin);

			const minIndex = this._freqToBin(_minFreq, "floor");
			const maxIndex = this._freqToBin(_maxFreq);

			let lastPos = -999;

			for (let i = minIndex; i <= maxIndex; i++) {
				const freq = this._binToFreq(i); // frequency represented by this index
				const posX =
					initialX +
					Math.round(unitWidth * (this._freqScaling(freq) - scaleMin)); // avoid fractionary pixel values

				// if it's on a different X-coordinate, create a new bar for this frequency
				if (posX > lastPos) {
					barsPush({
						posX,
						freq,
						freqLo: freq,
						freqHi: freq,
						binLo: i,
						binHi: i,
						ratioLo: 0,
						ratioHi: 0,
					});
					lastPos = posX;
				} // otherwise, add this frequency to the last bar's range
				else if (bars.length) {
					const lastBar = bars[bars.length - 1];
					lastBar.binHi = i;
					lastBar.freqHi = freq;
					lastBar.freq = (lastBar.freqLo * freq) ** 0.5; // compute center frequency (geometric mean)
				}
			}
		}

		/**
		 *  COMPUTE ATTRIBUTES FOR THE LED BARS
		 *
		 *	USES:
		 *		analyzerHeight
		 *		barWidth
		 *		noLedGap
		 *
		 *	GENERATES:
		 * 		spaceH
		 * 		spaceV
		 *		this._leds
		 */

		let spaceH = 0;
		let spaceV = 0;

		if (isLeds) {
			// adjustment for high pixel-ratio values on low-resolution screens (Android TV)
			const dPR =
				this._pixelRatio /
				(window.devicePixelRatio > 1 && window.screen.height <= 540 ? 2 : 1);

			const params = [
				[],
				[128, 3, 0.45], // mode 1
				[128, 4, 0.225], // mode 2
				[96, 6, 0.225], // mode 3
				[80, 6, 0.225], // mode 4
				[80, 6, 0.125], // mode 5
				[64, 6, 0.125], // mode 6
				[48, 8, 0.125], // mode 7
				[24, 16, 0.125], // mode 8
			];

			// use custom LED parameters if set, or the default parameters for the current mode
			const customParams = this._ledParams;
			const [maxLeds, spaceVRatio, spaceHRatio] = customParams || params[_mode];

			let ledCount = 0;
			let maxHeight = analyzerHeight;

			if (customParams) {
				const minHeight = 2 * dPR;
				let blockHeight: number;
				ledCount = maxLeds + 1;
				do {
					ledCount--;
					blockHeight = maxHeight / ledCount / (1 + spaceVRatio);
					spaceV = blockHeight * spaceVRatio;
				} while (
					(blockHeight < minHeight || spaceV < minHeight) &&
					ledCount > 1
				);
			} else {
				// calculate vertical spacing - aim for the reference ratio, but make sure it's at least 2px
				const refRatio = 540 / spaceVRatio;
				spaceV = Math.min(
					spaceVRatio * dPR,
					Math.max(2, (maxHeight / refRatio + 0.1) | 0),
				);
			}

			// remove the extra spacing below the last line of LEDs
			if (noLedGap) maxHeight += spaceV;

			// recalculate the number of leds, considering the effective spaceV
			if (!customParams)
				ledCount = Math.min(maxLeds, (maxHeight / (spaceV * 2)) | 0);

			spaceH = spaceHRatio >= 1 ? spaceHRatio : barWidth * spaceHRatio;

			this._leds = [
				ledCount,
				spaceH,
				spaceV,
				maxHeight / ledCount - spaceV, // ledHeight
			];
		}

		// COMPUTE ADDITIONAL BAR POSITIONING, ACCORDING TO THE CURRENT SETTINGS
		// uses: _barSpace, barWidth, spaceH

		const barSpacePx = Math.min(
			barWidth - 1,
			_barSpace * (_barSpace > 0 && _barSpace < 1 ? barWidth : 1),
		);

		if (isBands) barWidth -= Math.max(isLeds ? spaceH : 0, barSpacePx);

		bars.forEach((bar, index) => {
			let posX = bar.posX;
			let width = barWidth;

			// in bands modes we need to update bar.posX to account for bar/led spacing

			if (isBands) {
				if (_barSpace === 0 && !isLeds) {
					// when barSpace == 0 use integer values for perfect gapless positioning
					posX |= 0;
					width |= 0;
					if (
						index > 0 &&
						posX > bars[index - 1].posX + bars[index - 1].width
					) {
						posX--;
						width++;
					}
				} else posX += Math.max(isLeds ? spaceH : 0, barSpacePx) / 2;

				bar.posX = posX; // update
			}

			bar.barCenter = posX + (barWidth === 1 ? 0 : width / 2);
			bar.width = width;
		});

		// COMPUTE CHANNEL COORDINATES (uses spaceV)

		const channelCoords = [];
		for (const channel of [0, 1]) {
			const channelTop =
				_chLayout === CHANNEL_VERTICAL
					? (channelHeight + channelGap) * channel
					: 0;
			const channelBottom = channelTop + channelHeight;
			const analyzerBottom =
				channelTop + analyzerHeight - (!isLeds || noLedGap ? 0 : spaceV);

			channelCoords.push({ channelTop, channelBottom, analyzerBottom });
		}

		// SAVE INTERNAL PROPERTIES

		this._aux = {
			analyzerHeight,
			analyzerWidth,
			centerX,
			centerY,
			channelCoords,
			channelHeight,
			channelGap,
			initialX,
			innerRadius,
			outerRadius,
			scaleMin,
			unitWidth,
		};
		this._flg = {
			isAlpha,
			isBands,
			isLeds,
			isLumi,
			isOctaves,
			isOutline,
			isRound,
			noLedGap,
		};

		// generate the X-axis and radial scales
		this._createScales();
	}

	/**
	 * Generate the X-axis and radial scales in auxiliary canvases
	 */
	_createScales() {
		if (!this._ready) return;

		const { analyzerWidth, initialX, innerRadius, scaleMin, unitWidth } =
			this._aux;
		const {
			canvas,
			_frequencyScale,
			_mirror,
			_noteLabels,
			_radial,
			_scaleX,
			_scaleR,
		} = this;
		const canvasX = _scaleX.canvas;
		const canvasR = _scaleR.canvas;
		const freqLabels: (number | [number, string])[] = [];
		const isDualHorizontal = this._chLayout === CHANNEL_HORIZONTAL;
		const isDualVertical = this._chLayout === CHANNEL_VERTICAL;
		const minDimension = Math.min(canvas.width, canvas.height);
		const scale = [
			"C",
			undefined,
			"D",
			undefined,
			"E",
			"F",
			undefined,
			"G",
			undefined,
			"A",
			undefined,
			"B",
		]; // for note labels (no sharp notes)
		const scaleHeight = (minDimension / 34) | 0; // circular scale height (radial mode)
		const fontSizeX = canvasX.height >> 1;
		const fontSizeR = scaleHeight >> 1;
		const labelWidthX = fontSizeX * (_noteLabels ? 0.7 : 1.5);
		const labelWidthR = fontSizeR * (_noteLabels ? 1 : 2);
		const root12 = 2 ** (1 / 12);

		if (!_noteLabels && (this._ansiBands || _frequencyScale !== SCALE_LOG)) {
			freqLabels.push(16, 31.5, 63, 125, 250, 500, 1e3, 2e3, 4e3);
			if (_frequencyScale === SCALE_LINEAR)
				freqLabels.push(6e3, 8e3, 10e3, 12e3, 14e3, 16e3, 18e3, 20e3, 22e3);
			else freqLabels.push(8e3, 16e3);
		} else {
			let freq = C_1;
			for (let octave = -1; octave < 11; octave++) {
				for (let note = 0; note < 12; note++) {
					if (freq >= this._minFreq && freq <= this._maxFreq) {
						const pitch = scale[note];
						const isC = pitch === "C";
						if ((pitch && _noteLabels && !_mirror && !isDualHorizontal) || isC)
							freqLabels.push(
								_noteLabels ? [freq, pitch + (isC ? octave : "")] : freq,
							);
					}
					freq *= root12;
				}
			}
		}

		// in radial dual-vertical layout, the scale is positioned exactly between both channels, by making the canvas a bit larger than the inner diameter
		canvasR.width = canvasR.height = Math.max(
			minDimension * 0.15,
			(innerRadius << 1) + Number(isDualVertical) * scaleHeight,
		);

		const centerR = canvasR.width >> 1;
		const radialY = centerR - scaleHeight * 0.7; // vertical position of text labels in the circular scale

		// helper function
		const radialLabel = (x: number, label: string | number) => {
			const angle = TAU * (x / canvas.width);
			const adjAng = angle - HALF_PI; // rotate angles so 0 is at the top
			const posX = radialY * Math.cos(adjAng);
			const posY = radialY * Math.sin(adjAng);

			_scaleR.save();
			_scaleR.translate(centerR + posX, centerR + posY);
			_scaleR.rotate(angle);
			_scaleR.fillText(label.toString(), 0, 0);
			_scaleR.restore();
		};

		// clear scale canvas
		canvasX.width |= 0;

		_scaleX.fillStyle = _scaleR.strokeStyle = SCALEX_BACKGROUND_COLOR;
		_scaleX.fillRect(0, 0, canvasX.width, canvasX.height);

		_scaleR.arc(centerR, centerR, centerR - scaleHeight / 2, 0, TAU);
		_scaleR.lineWidth = scaleHeight;
		_scaleR.stroke();

		_scaleX.fillStyle = _scaleR.fillStyle = SCALEX_LABEL_COLOR;
		_scaleX.font = `${fontSizeX}px ${FONT_FAMILY}`;
		_scaleR.font = `${fontSizeR}px ${FONT_FAMILY}`;
		_scaleX.textAlign = _scaleR.textAlign = "center";

		let prevX = -labelWidthX / 4;
		let prevR = -labelWidthR;

		for (const item of freqLabels) {
			const [freq, label] = Array.isArray(item)
				? item
				: [item, item < 1e3 ? item | 0 : `${((item / 100) | 0) / 10}k`];
			const x = unitWidth * (this._freqScaling(freq) - scaleMin);
			const y = canvasX.height * 0.75;
			const isC = typeof label === "string" && label[0] === "C";
			const maxW =
				fontSizeX *
				(_noteLabels && !_mirror && !isDualHorizontal ? (isC ? 1.2 : 0.6) : 3);

			// set label color - no highlight when mirror effect is active (only Cs displayed)
			_scaleX.fillStyle = _scaleR.fillStyle =
				isC && !_mirror && !isDualHorizontal
					? SCALEX_HIGHLIGHT_COLOR
					: SCALEX_LABEL_COLOR;

			// prioritizes which note labels are displayed, due to the restricted space on some ranges/scales
			if (_noteLabels) {
				const isLog = _frequencyScale === SCALE_LOG;
				const isLinear = _frequencyScale === SCALE_LINEAR;

				const allowedLabels = ["C"];

				if (
					isLog ||
					freq > 2e3 ||
					(!isLinear && freq > 250) ||
					((!_radial || isDualVertical) &&
						((!isLinear && freq > 125) || freq > 1e3))
				)
					allowedLabels.push("G");
				if (
					isLog ||
					freq > 4e3 ||
					(!isLinear && freq > 500) ||
					((!_radial || isDualVertical) &&
						((!isLinear && freq > 250) || freq > 2e3))
				)
					allowedLabels.push("E");
				if (
					(isLinear && freq > 4e3) ||
					((!_radial || isDualVertical) &&
						(isLog || freq > 2e3 || (!isLinear && freq > 500)))
				)
					allowedLabels.push("D", "F", "A", "B");
				if (!allowedLabels.includes((label as string)[0])) continue; // skip this label
			}

			// linear scale
			if (x >= prevX + labelWidthX / 2 && x <= analyzerWidth) {
				_scaleX.fillText(
					label.toString(),
					isDualHorizontal && _mirror === -1 ? analyzerWidth - x : initialX + x,
					y,
					maxW,
				);
				if (isDualHorizontal || (_mirror && (x > labelWidthX || _mirror === 1)))
					_scaleX.fillText(
						label.toString(),
						isDualHorizontal && _mirror !== 1
							? analyzerWidth + x
							: (initialX || canvas.width) - x,
						y,
						maxW,
					);
				prevX =
					x + Math.min(maxW, _scaleX.measureText(label.toString()).width) / 2;
			}

			// radial scale
			if (x >= prevR + labelWidthR && x < analyzerWidth - labelWidthR) {
				// avoid overlapping the last label over the first one
				radialLabel(
					isDualHorizontal && _mirror === 1 ? analyzerWidth - x : x,
					label,
				);
				if (isDualHorizontal || (_mirror && (x > labelWidthR || _mirror === 1)))
					// avoid overlapping of first labels on mirror mode
					radialLabel(
						isDualHorizontal && _mirror !== -1 ? analyzerWidth + x : -x,
						label,
					);
				prevR = x;
			}
		}
	}

	/**
	 * Redraw the canvas
	 * this is called 60 times per second by requestAnimationFrame()
	 */
	_draw(timestamp: number) {
		// schedule next canvas update
		this._runId = requestAnimationFrame((timestamp) => this._draw(timestamp));

		// frame rate control
		const elapsed = timestamp - this._time; // time since last FPS computation
		const frameTime = timestamp - this._last; // time since last rendered frame
		const targetInterval = this._maxFPS ? 975 / this._maxFPS : 0; // small tolerance for best results

		if (frameTime < targetInterval) return;

		this._last = timestamp - (targetInterval ? frameTime % targetInterval : 0); // thanks https://stackoverflow.com/a/19772220/2370385
		this._frames++;

		if (elapsed >= 1000) {
			// update FPS every second
			this._fps = (this._frames / elapsed) * 1000;
			this._frames = 0;
			this._time = timestamp;
		}

		// initialize local constants

		const {
			isAlpha,
			isBands,
			isLeds,
			isLumi,
			isOctaves,
			isOutline,
			isRound,
			noLedGap,
		} = this._flg;
		const {
			analyzerHeight,
			centerX,
			centerY,
			channelCoords,
			channelHeight,
			channelGap,
			initialX,
			innerRadius,
			outerRadius,
		} = this._aux;
		const {
			_bars,
			canvas,
			_canvasGradients,
			_chLayout,
			_colorMode,
			_ctx,
			_energy,
			_fadePeaks,
			fillAlpha,
			_fps,
			_linearAmplitude,
			_lineWidth,
			maxDecibels,
			minDecibels,
			_mirror,
			_mode,
			overlay,
			_radial,
			showBgColor,
			showPeaks,
			useCanvas,
			_weightingFilter,
		} = this;
		const canvasX = this._scaleX.canvas;
		const canvasR = this._scaleR.canvas;
		const fadeFrames = (_fps * this._peakFadeTime) / 1e3;
		const fpsSquared = _fps ** 2;
		const gravity = this._gravity * 1e3;
		const holdFrames = (_fps * this._peakHoldTime) / 1e3;
		const isDualCombined = _chLayout === CHANNEL_COMBINED;
		const isDualHorizontal = _chLayout === CHANNEL_HORIZONTAL;
		const isDualVertical = _chLayout === CHANNEL_VERTICAL;
		const isSingle = _chLayout === CHANNEL_SINGLE;
		const isTrueLeds =
			isLeds && this._trueLeds && _colorMode === COLOR_GRADIENT;
		const analyzerWidth = _radial ? canvas.width : this._aux.analyzerWidth;
		const finalX = initialX + analyzerWidth;
		const showPeakLine = showPeaks && this._peakLine && _mode === MODE_GRAPH;
		const maxBarHeight = _radial ? outerRadius - innerRadius : analyzerHeight;
		const nominalMaxHeight = maxBarHeight / this._pixelRatio; // for consistent gravity on lo-res or hi-dpi
		const dbRange = maxDecibels - minDecibels;
		const [ledCount, ledSpaceH, ledSpaceV, ledHeight] = this._leds || [];

		if (_energy.val > 0 && _fps > 0)
			this._spinAngle += (this._spinSpeed * TAU) / 60 / _fps; // spinSpeed * angle increment per frame for 1 RPM

		/* HELPER FUNCTIONS */

		// create Reflex effect
		const doReflex = (channel: number) => {
			if (this._reflexRatio > 0 && !isLumi && !_radial) {
				let posY: number;
				let height: number;
				if (this.reflexFit || isDualVertical) {
					// always fit reflex in vertical stereo mode
					posY =
						isDualVertical && channel === 0 ? channelHeight + channelGap : 0;
					height = channelHeight - analyzerHeight;
				} else {
					posY = canvas.height - analyzerHeight * 2;
					height = analyzerHeight;
				}

				_ctx.save();

				// set alpha and brightness for the reflection
				_ctx.globalAlpha = this.reflexAlpha;
				if (this.reflexBright !== 1)
					_ctx.filter = `brightness(${this.reflexBright})`;

				// create the reflection
				_ctx.setTransform(1, 0, 0, -1, 0, canvas.height);
				_ctx.drawImage(
					canvas,
					0,
					channelCoords[channel].channelTop,
					canvas.width,
					analyzerHeight,
					0,
					posY,
					canvas.width,
					height,
				);

				_ctx.restore();
			}
		};

		// draw scale on X-axis
		const drawScaleX = () => {
			if (this.showScaleX) {
				if (_radial) {
					_ctx.save();
					_ctx.translate(centerX, centerY);
					if (this._spinSpeed) _ctx.rotate(this._spinAngle + HALF_PI);
					_ctx.drawImage(canvasR, -canvasR.width >> 1, -canvasR.width >> 1);
					_ctx.restore();
				} else _ctx.drawImage(canvasX, 0, canvas.height - canvasX.height);
			}
		};

		// returns the gain (in dB) for a given frequency, considering the currently selected weighting filter
		const weightingdB = (freq: number) => {
			const f2 = freq ** 2;
			const SQ20_6 = 424.36;
			const SQ107_7 = 11599.29;
			const SQ158_5 = 25122.25;
			const SQ737_9 = 544496.41;
			const SQ12194 = 148693636;
			const linearTodB = (value: number) => 20 * Math.log10(value);

			switch (_weightingFilter) {
				case FILTER_A: {
					// A-weighting https://en.wikipedia.org/wiki/A-weighting
					const rA =
						(SQ12194 * f2 ** 2) /
						((f2 + SQ20_6) *
							Math.sqrt((f2 + SQ107_7) * (f2 + SQ737_9)) *
							(f2 + SQ12194));
					return 2 + linearTodB(rA);
				}

				case FILTER_B: {
					const rB =
						(SQ12194 * f2 * freq) /
						((f2 + SQ20_6) * Math.sqrt(f2 + SQ158_5) * (f2 + SQ12194));
					return 0.17 + linearTodB(rB);
				}

				case FILTER_C: {
					const rC = (SQ12194 * f2) / ((f2 + SQ20_6) * (f2 + SQ12194));
					return 0.06 + linearTodB(rC);
				}

				case FILTER_D: {
					const h =
						((1037918.48 - f2) ** 2 + 1080768.16 * f2) /
						((9837328 - f2) ** 2 + 11723776 * f2);
					const rD =
						(freq / 6.8966888496476e-5) *
						Math.sqrt(h / ((f2 + 79919.29) * (f2 + 1345600)));
					return linearTodB(rD);
				}

				case FILTER_468: {
					// ITU-R 468 https://en.wikipedia.org/wiki/ITU-R_468_noise_weighting
					const h1 =
						-4.737338981378384e-24 * freq ** 6 +
						2.043828333606125e-15 * freq ** 4 -
						1.363894795463638e-7 * f2 +
						1;
					const h2 =
						1.306612257412824e-19 * freq ** 5 -
						2.118150887518656e-11 * freq ** 3 +
						5.559488023498642e-4 * freq;
					const rI = (1.246332637532143e-4 * freq) / Math.hypot(h1, h2);
					return 18.2 + linearTodB(rI);
				}
			}

			return 0; // unknown filter
		};

		// draws (stroke) a bar from x,y1 to x,y2
		const strokeBar = (x: number, y1: number, y2: number) => {
			_ctx.beginPath();
			_ctx.moveTo(x, y1);
			_ctx.lineTo(x, y2);
			_ctx.stroke();
		};

		// conditionally strokes current path on canvas
		const strokeIf = (flag?: boolean) => {
			if (flag && _lineWidth) {
				const alpha = _ctx.globalAlpha;
				_ctx.globalAlpha = 1;
				_ctx.stroke();
				_ctx.globalAlpha = alpha;
			}
		};

		// converts a value in [0;1] range to a height in pixels that fits into the current LED elements
		const ledPosY = (value: number) =>
			Math.max(
				0,
				((value * ledCount) | 0) * (ledHeight + ledSpaceV) - ledSpaceV,
			);

		// update energy information
		const updateEnergy = (newVal: number) => {
			_energy.val = newVal;
			if (_energy.peak > 0) {
				_energy.hold--;
				if (_energy.hold < 0)
					_energy.peak +=
						((_energy.hold * gravity) / fpsSquared / canvas.height) *
						this._pixelRatio;
				// TO-DO: replace `canvas.height * this._pixelRatio` with `maxNominalHeight` when implementing dual-channel energy
			}
			if (newVal >= _energy.peak) {
				_energy.peak = newVal;
				_energy.hold = holdFrames;
			}
		};

		/* MAIN FUNCTION */

		if (overlay) _ctx.clearRect(0, 0, canvas.width, canvas.height);

		let currentEnergy = 0;

		const nBars = _bars.length;
		const nChannels = isSingle ? 1 : 2;

		for (let channel = 0; channel < nChannels; channel++) {
			const { channelTop, channelBottom, analyzerBottom } =
				channelCoords[channel];
			const channelGradient = this._gradients[this._selectedGrads[channel]];
			const colorStops = channelGradient.colorStops;
			const colorCount = colorStops.length;
			const bgColor =
				!showBgColor || (isLeds && !overlay) ? "#000" : channelGradient.bgColor;
			const radialDirection = isDualVertical && _radial && channel ? -1 : 1; // 1 = outwards, -1 = inwards
			const invertedChannel =
				(!channel && _mirror === -1) || (channel && _mirror === 1);
			const radialOffsetX =
				!isDualHorizontal || (channel && _mirror !== 1)
					? 0
					: analyzerWidth >> Number(channel || !invertedChannel);
			const angularDirection = isDualHorizontal && invertedChannel ? -1 : 1; // 1 = clockwise, -1 = counterclockwise
			/*
			Expanded logic for radialOffsetX and angularDirection:

			let radialOffsetX = 0,
				angularDirection = 1;

			if ( isDualHorizontal ) {
				if ( channel == 0 ) { // LEFT channel
					if ( _mirror == -1 ) {
						radialOffsetX = analyzerWidth;
						angularDirection = -1;
					}
					else
						radialOffsetX = analyzerWidth >> 1;
				}
				else {                // RIGHT channel
					if ( _mirror == 1 ) {
						radialOffsetX = analyzerWidth >> 1;
						angularDirection = -1;
					}
				}
			}
*/
			// draw scale on Y-axis (uses: channel, channelTop)
			const drawScaleY = () => {
				const scaleWidth = canvasX.height;
				const fontSize = scaleWidth >> 1;
				const max = _linearAmplitude ? 100 : maxDecibels;
				const min = _linearAmplitude ? 0 : minDecibels;
				const incr = _linearAmplitude ? 20 : 5;
				const interval = analyzerHeight / (max - min);
				const atStart =
					_mirror !== -1 &&
					(!isDualHorizontal || channel === 0 || _mirror === 1);
				const atEnd =
					_mirror !== 1 && (!isDualHorizontal || channel !== _mirror);

				_ctx.save();
				_ctx.fillStyle = SCALEY_LABEL_COLOR;
				_ctx.font = `${fontSize}px ${FONT_FAMILY}`;
				_ctx.textAlign = "right";
				_ctx.lineWidth = 1;

				for (let val = max; val > min; val -= incr) {
					const posY = channelTop + (max - val) * interval;
					const even = Number(val % 2 === 0) | 0;

					if (even) {
						const labelY = posY + fontSize * (posY === channelTop ? 0.8 : 0.35);
						if (atStart)
							_ctx.fillText(val.toString(), scaleWidth * 0.85, labelY);
						if (atEnd)
							_ctx.fillText(
								val.toString(),
								(isDualHorizontal ? analyzerWidth : canvas.width) -
									scaleWidth * 0.1,
								labelY,
							);
						_ctx.strokeStyle = SCALEY_LABEL_COLOR;
						_ctx.setLineDash([2, 4]);
						_ctx.lineDashOffset = 0;
					} else {
						_ctx.strokeStyle = SCALEY_MIDLINE_COLOR;
						_ctx.setLineDash([2, 8]);
						_ctx.lineDashOffset = 1;
					}

					_ctx.beginPath();
					_ctx.moveTo(
						initialX + scaleWidth * even * Number(atStart),
						~~posY + 0.5,
					); // for sharp 1px line (https://stackoverflow.com/a/13879402/2370385)
					_ctx.lineTo(finalX - scaleWidth * even * Number(atEnd), ~~posY + 0.5);
					_ctx.stroke();
				}
				_ctx.restore();
			};

			// FFT bin data interpolation (uses fftData)
			const interpolate = (bin: number, ratio: number) => {
				const value =
					fftData[bin] +
					(bin < fftData.length - 1
						? (fftData[bin + 1] - fftData[bin]) * ratio
						: 0);
				return Number.isNaN(value) ? Number.NEGATIVE_INFINITY : value;
			};

			// converts a given X-coordinate to its corresponding angle in radial mode (uses angularDirection)
			const getAngle = (x: number, dir = angularDirection) =>
				dir * TAU * ((x + radialOffsetX) / canvas.width) + this._spinAngle;

			// converts planar X,Y coordinates to radial coordinates (uses: getAngle(), radialDirection)
			const radialXY = (
				x: number,
				y: number,
				dir?: number,
			): [number, number] => {
				const height = innerRadius + y * radialDirection;
				const angle = getAngle(x, dir);
				return [
					centerX + height * Math.cos(angle),
					centerY + height * Math.sin(angle),
				];
			};

			// draws a polygon of width `w` and height `h` at (x,y) in radial mode (uses: angularDirection, radialDirection)
			const radialPoly = (
				x: number,
				y: number,
				w: number,
				h: number,
				stroke?: boolean,
			) => {
				_ctx.beginPath();
				for (const dir of _mirror && !isDualHorizontal
					? [1, -1]
					: [angularDirection]) {
					const [startAngle, endAngle] = isRound
						? [getAngle(x, dir), getAngle(x + w, dir)]
						: [];
					_ctx.moveTo(...radialXY(x, y, dir));
					_ctx.lineTo(...radialXY(x, y + h, dir));
					if (isRound)
						_ctx.arc(
							centerX,
							centerY,
							innerRadius + (y + h) * radialDirection,
							startAngle as number,
							endAngle as number,
							dir !== 1,
						);
					else _ctx.lineTo(...radialXY(x + w, y + h, dir));
					_ctx.lineTo(...radialXY(x + w, y, dir));
					if (isRound && !stroke)
						// close the bottom line only when not in outline mode
						_ctx.arc(
							centerX,
							centerY,
							innerRadius + y * radialDirection,
							endAngle as number,
							startAngle as number,
							dir === 1,
						);
				}
				strokeIf(stroke);
				_ctx.fill();
			};

			// set fillStyle and strokeStyle according to current colorMode (uses: channel, colorStops, colorCount)
			const setBarColor = (value = 0, barIndex = 0) => {
				let color: CanvasGradient | string;
				// for graph mode, always use the channel gradient (ignore colorMode)
				if (
					(_colorMode === COLOR_GRADIENT && !isTrueLeds) ||
					_mode === MODE_GRAPH
				)
					color = _canvasGradients[channel];
				else {
					const selectedIndex =
						_colorMode === COLOR_BAR_INDEX
							? barIndex % colorCount
							: colorStops.findLastIndex((item) =>
									isLeds
										? ledPosY(value) <= ledPosY(item.level)
										: value <= item.level,
								);
					color = colorStops[selectedIndex].color;
				}
				_ctx.fillStyle = _ctx.strokeStyle = color;
			};

			// CHANNEL START

			if (useCanvas) {
				// set transform (horizontal flip and translation) for dual-horizontal layout
				if (isDualHorizontal && !_radial) {
					const translateX =
						analyzerWidth * (channel + Number(invertedChannel));
					const flipX = invertedChannel ? -1 : 1;

					_ctx.setTransform(flipX, 0, 0, 1, translateX, 0);
				}

				// fill the analyzer background if needed (not overlay or overlay + showBgColor)
				if (!overlay || showBgColor) {
					if (overlay) _ctx.globalAlpha = this.bgAlpha;

					_ctx.fillStyle = bgColor;

					// exclude the reflection area when overlay is true and reflexAlpha == 1 (avoids alpha over alpha difference, in case bgAlpha < 1)
					if (channel === 0 || (!_radial && !isDualCombined))
						_ctx.fillRect(
							initialX,
							channelTop - channelGap,
							analyzerWidth,
							(overlay && this.reflexAlpha === 1
								? analyzerHeight
								: channelHeight) + channelGap,
						);

					_ctx.globalAlpha = 1;
				}

				// draw dB scale (Y-axis) - avoid drawing it twice on 'dual-combined' channel layout
				if (
					this.showScaleY &&
					!isLumi &&
					!_radial &&
					(channel === 0 || !isDualCombined)
				)
					drawScaleY();

				// set line width and dash for LEDs effect
				if (isLeds) {
					_ctx.setLineDash([ledHeight, ledSpaceV]);
					_ctx.lineWidth = _bars[0].width;
				} // for outline effect ensure linewidth is not greater than half the bar width
				else
					_ctx.lineWidth = isOutline
						? Math.min(_lineWidth, _bars[0].width / 2)
						: _lineWidth;

				// set clipping region
				_ctx.save();
				if (!_radial) {
					const region = new Path2D();
					region.rect(0, channelTop, canvas.width, analyzerHeight);
					_ctx.clip(region);
				}
			} // if ( useCanvas )

			// get a new array of data from the FFT
			let fftData = this._fftData[channel];
			this._analyzer[channel].getFloatFrequencyData(fftData);

			// apply weighting
			if (_weightingFilter)
				fftData = fftData.map(
					(val, idx) => val + weightingdB(this._binToFreq(idx)),
				);

			// start drawing path (for graph mode)
			_ctx.beginPath();

			// store line graph points to create mirror effect in radial mode
			let points: number[][] = [];

			// draw bars / lines

			for (let barIndex = 0; barIndex < nBars; barIndex++) {
				const bar = _bars[barIndex];
				const { posX, barCenter, width, freq, binLo, binHi, ratioLo, ratioHi } =
					bar;

				let barValue = Math.max(
					interpolate(binLo, ratioLo),
					interpolate(binHi, ratioHi),
				);

				// check additional bins (if any) for this bar and keep the highest value
				for (let j = binLo + 1; j < binHi; j++) {
					if (fftData[j] > barValue) barValue = fftData[j];
				}

				// normalize bar amplitude in [0;1] range
				barValue = this._normalizedB(barValue);

				bar.value[channel] = barValue;
				currentEnergy += barValue;

				// update bar peak
				if (bar.peak[channel] > 0 && bar.alpha[channel] > 0) {
					bar.hold[channel]--;
					// if hold is negative, start peak drop or fade out
					if (bar.hold[channel] < 0) {
						if (_fadePeaks && !showPeakLine) {
							const initialAlpha =
								!isAlpha || (isOutline && _lineWidth > 0)
									? 1
									: isAlpha
										? bar.peak[channel]
										: fillAlpha;
							bar.alpha[channel] =
								initialAlpha * (1 + bar.hold[channel] / fadeFrames); // hold is negative, so this is <= 1
						} else
							bar.peak[channel] +=
								(bar.hold[channel] * gravity) / fpsSquared / nominalMaxHeight;
						// make sure the peak value is reset when using fadePeaks
						if (bar.alpha[channel] <= 0) bar.peak[channel] = 0;
					}
				}

				// check if it's a new peak for this bar
				if (barValue >= bar.peak[channel]) {
					bar.peak[channel] = barValue;
					bar.hold[channel] = holdFrames;
					// check whether isAlpha or isOutline are active to start the peak alpha with the proper value
					bar.alpha[channel] =
						!isAlpha || (isOutline && _lineWidth > 0)
							? 1
							: isAlpha
								? barValue
								: fillAlpha;
				}

				// if not using the canvas, move earlier to the next bar
				if (!useCanvas) continue;

				// set opacity for bar effects
				_ctx.globalAlpha =
					isLumi || isAlpha ? barValue : isOutline ? fillAlpha : 1;

				// set fillStyle and strokeStyle for the current bar
				setBarColor(barValue, barIndex);

				// compute actual bar height on screen
				const barHeight = isLumi
					? maxBarHeight
					: isLeds
						? ledPosY(barValue)
						: (barValue * maxBarHeight) | 0;

				// Draw current bar or line segment

				if (_mode === MODE_GRAPH) {
					// compute the average between the initial bar (barIndex==0) and the next one
					// used to smooth the curve when the initial posX is off the screen, in mirror and radial modes
					const nextBarAvg = barIndex
						? 0
						: (this._normalizedB(fftData[_bars[1].binLo]) * maxBarHeight +
								barHeight) /
							2;

					if (_radial) {
						if (barIndex === 0) {
							if (isDualHorizontal) _ctx.moveTo(...radialXY(0, 0));
							_ctx.lineTo(...radialXY(0, posX < 0 ? nextBarAvg : barHeight));
						}
						// draw line to the current point, avoiding overlapping wrap-around frequencies
						if (posX >= 0) {
							const point: [number, number] = [posX, barHeight];
							_ctx.lineTo(...radialXY(...point));
							points.push(point);
						}
					} else {
						// Linear
						if (barIndex === 0) {
							// start the line off-screen using the previous FFT bin value as the initial amplitude
							if (_mirror === -1 && !isDualHorizontal)
								_ctx.moveTo(
									initialX,
									analyzerBottom - (posX < initialX ? nextBarAvg : barHeight),
								);
							else {
								const prevFFTData = binLo
									? this._normalizedB(fftData[binLo - 1]) * maxBarHeight
									: barHeight; // use previous FFT bin value, when available
								_ctx.moveTo(
									initialX - _lineWidth,
									analyzerBottom - prevFFTData,
								);
							}
						}
						// draw line to the current point
						// avoid X values lower than the origin when mirroring left, otherwise draw them for best graph accuracy
						if (isDualHorizontal || _mirror !== -1 || posX >= initialX)
							_ctx.lineTo(posX, analyzerBottom - barHeight);
					}
				} else {
					if (isLeds) {
						// draw "unlit" leds - avoid drawing it twice on 'dual-combined' channel layout
						if (showBgColor && !overlay && (channel === 0 || !isDualCombined)) {
							const alpha = _ctx.globalAlpha;
							_ctx.strokeStyle = LEDS_UNLIT_COLOR;
							_ctx.globalAlpha = 1;
							strokeBar(barCenter, channelTop, analyzerBottom);
							// restore properties
							_ctx.strokeStyle = _ctx.fillStyle;
							_ctx.globalAlpha = alpha;
						}
						if (isTrueLeds) {
							// ledPosY() is used below to fit one entire led height into the selected range
							const colorIndex = isLumi
								? 0
								: colorStops.findLastIndex(
										(item) => ledPosY(barValue) <= ledPosY(item.level),
									);
							let last = analyzerBottom;
							for (let i = colorCount - 1; i >= colorIndex; i--) {
								_ctx.strokeStyle = colorStops[i].color;
								const y =
									analyzerBottom -
									(i === colorIndex ? barHeight : ledPosY(colorStops[i].level));
								strokeBar(barCenter, last, y);
								last = y - ledSpaceV;
							}
						} else
							strokeBar(barCenter, analyzerBottom, analyzerBottom - barHeight);
					} else if (posX >= initialX) {
						if (_radial) radialPoly(posX, 0, width, barHeight, isOutline);
						else if (isRound) {
							const halfWidth = width / 2;
							const y = analyzerBottom + halfWidth; // round caps have an additional height of half bar width

							_ctx.beginPath();
							_ctx.moveTo(posX, y);
							_ctx.lineTo(posX, y - barHeight);
							_ctx.arc(barCenter, y - barHeight, halfWidth, PI, TAU);
							_ctx.lineTo(posX + width, y);
							strokeIf(isOutline);
							_ctx.fill();
						} else {
							const offset = isOutline ? _ctx.lineWidth : 0;
							_ctx.beginPath();
							_ctx.rect(
								posX,
								analyzerBottom + offset,
								width,
								-barHeight - offset,
							);
							strokeIf(isOutline);
							_ctx.fill();
						}
					}
				}

				// Draw peak
				const peakValue = bar.peak[channel];
				const peakAlpha = bar.alpha[channel];

				if (
					peakValue > 0 &&
					peakAlpha > 0 &&
					showPeaks &&
					!showPeakLine &&
					!isLumi &&
					posX >= initialX &&
					posX < finalX
				) {
					// set opacity for peak
					if (_fadePeaks) _ctx.globalAlpha = peakAlpha;
					else if (isOutline && _lineWidth > 0)
						// when lineWidth == 0 ctx.globalAlpha remains set to `fillAlpha`
						_ctx.globalAlpha = 1;
					else if (isAlpha)
						// isAlpha (alpha based on peak value) supersedes fillAlpha if lineWidth == 0
						_ctx.globalAlpha = peakValue;

					// select the peak color for 'bar-level' colorMode or 'trueLeds'
					if (_colorMode === COLOR_BAR_LEVEL || isTrueLeds)
						setBarColor(peakValue);

					// render peak according to current mode / effect
					if (isLeds) {
						const ledPeak = ledPosY(peakValue);
						if (ledPeak >= ledSpaceV)
							// avoid peak below first led
							_ctx.fillRect(posX, analyzerBottom - ledPeak, width, ledHeight);
					} else if (!_radial)
						_ctx.fillRect(
							posX,
							analyzerBottom - peakValue * maxBarHeight,
							width,
							2,
						);
					else if (_mode !== MODE_GRAPH) {
						// radial (peaks for graph mode are done by the peakLine code)
						const y = peakValue * maxBarHeight;
						radialPoly(
							posX,
							y,
							width,
							!this._radialInvert || isDualVertical || y + innerRadius >= 2
								? -2
								: 2,
						);
					}
				}
			} // for ( let barIndex = 0; barIndex < nBars; barIndex++ )

			// if not using the canvas, move earlier to the next channel
			if (!useCanvas) continue;

			// restore global alpha
			_ctx.globalAlpha = 1;

			// Fill/stroke drawing path for graph mode
			if (_mode === MODE_GRAPH) {
				setBarColor(); // select channel gradient

				if (_radial && !isDualHorizontal) {
					if (_mirror) {
						let p: number[] | undefined;
						while (points.length > 0) {
							p = points.pop();
							_ctx.lineTo(...radialXY(...(p as [number, number]), -1));
						}
					}
					_ctx.closePath();
				}

				if (_lineWidth > 0) _ctx.stroke();

				if (fillAlpha > 0) {
					if (_radial) {
						// exclude the center circle from the fill area
						const start = isDualHorizontal ? getAngle(analyzerWidth >> 1) : 0;
						const end = isDualHorizontal ? getAngle(analyzerWidth) : TAU;
						_ctx.moveTo(
							...radialXY(isDualHorizontal ? analyzerWidth >> 1 : 0, 0),
						);
						_ctx.arc(
							centerX,
							centerY,
							innerRadius,
							start,
							end,
							isDualHorizontal ? !invertedChannel : true,
						);
					} else {
						// close the fill area
						_ctx.lineTo(finalX, analyzerBottom);
						_ctx.lineTo(initialX, analyzerBottom);
					}

					_ctx.globalAlpha = fillAlpha;
					_ctx.fill();
					_ctx.globalAlpha = 1;
				}

				// draw peak line (and standard peaks on radial)
				if (showPeakLine || (_radial && showPeaks)) {
					points = []; // for mirror line on radial
					_ctx.beginPath();
					_bars.forEach((b, i) => {
						let x = b.posX;
						let h = b.peak[channel];
						const m = i ? "lineTo" : "moveTo";
						if (_radial && x < 0) {
							const nextBar = _bars[i + 1];
							h = findY(x, h, nextBar.posX, nextBar.peak[channel], 0);
							x = 0;
						}
						h *= maxBarHeight;
						if (showPeakLine) {
							_ctx[m](
								...((_radial ? radialXY(x, h) : [x, analyzerBottom - h]) as [
									number,
									number,
								]),
							);
							if (_radial && _mirror && !isDualHorizontal) points.push([x, h]);
						} else if (h > 0) radialPoly(x, h, 1, -2); // standard peaks (also does mirror)
					});
					if (showPeakLine) {
						let p: number[] | undefined;
						while (points.length > 0) {
							p = points.pop();
							_ctx.lineTo(...radialXY(...(p as [number, number]), -1));
						} // mirror line points
						_ctx.lineWidth = 1;
						_ctx.stroke(); // stroke peak line
					}
				}
			}

			_ctx.restore(); // restore clip region

			if (isDualHorizontal && !_radial) _ctx.setTransform(1, 0, 0, 1, 0, 0);

			// create Reflex effect - for dual-combined and dual-horizontal do it only once, after channel 1
			if ((!isDualHorizontal && !isDualCombined) || channel) doReflex(channel);
		} // for ( let channel = 0; channel < nChannels; channel++ ) {

		updateEnergy(currentEnergy / (nBars << (nChannels - 1)));

		if (useCanvas) {
			// Mirror effect
			if (_mirror && !_radial && !isDualHorizontal) {
				_ctx.setTransform(-1, 0, 0, 1, canvas.width - initialX, 0);
				_ctx.drawImage(
					canvas,
					initialX,
					0,
					centerX,
					canvas.height,
					0,
					0,
					centerX,
					canvas.height,
				);
				_ctx.setTransform(1, 0, 0, 1, 0, 0);
			}

			// restore solid lines
			_ctx.setLineDash([]);

			// draw frequency scale (X-axis)
			drawScaleX();
		}

		// display current frame rate
		if (this.showFPS) {
			const size = canvasX.height;
			_ctx.font = `bold ${size}px ${FONT_FAMILY}`;
			_ctx.fillStyle = FPS_COLOR;
			_ctx.textAlign = "right";
			_ctx.fillText(Math.round(_fps).toString(), canvas.width - size, size * 2);
		}

		// call callback function, if defined
		if (this.onCanvasDraw) {
			_ctx.save();
			_ctx.fillStyle = _ctx.strokeStyle = _canvasGradients[0];
			this.onCanvasDraw(this, { timestamp, canvasGradients: _canvasGradients });
			_ctx.restore();
		}
	}

	/**
	 * Return scaled frequency according to the selected scale
	 */
	_freqScaling(freq: number) {
		switch (this._frequencyScale) {
			case SCALE_LOG:
				return Math.log2(freq);
			case SCALE_BARK:
				return (26.81 * freq) / (1960 + freq) - 0.53;
			case SCALE_MEL:
				return Math.log2(1 + freq / 700);
			case SCALE_LINEAR:
				return freq;
		}
	}

	/**
	 * Return the FFT data bin (array index) which represents a given frequency
	 */
	_freqToBin(freq: number, method: "floor" | "round" = "round") {
		const max = this._analyzer[0].frequencyBinCount - 1;
		const bin = Math[method]((freq * this.fftSize) / this.audioCtx.sampleRate);

		return bin < max ? bin : max;
	}

	/**
	 * Generate currently selected gradient
	 */
	_makeGrad() {
		if (!this._ready) return;

		const { canvas, _ctx, _radial, _reflexRatio } = this;
		const {
			analyzerWidth,
			centerX,
			centerY,
			initialX,
			innerRadius,
			outerRadius,
		} = this._aux;
		const { isLumi } = this._flg;
		const isDualVertical = this._chLayout === CHANNEL_VERTICAL;
		const analyzerRatio = 1 - _reflexRatio;
		const gradientHeight = isLumi
			? canvas.height
			: (canvas.height * (1 - _reflexRatio * Number(!isDualVertical))) | 0;
		// for vertical stereo we keep the full canvas height and handle the reflex areas while generating the color stops

		for (const channel of [0, 1]) {
			const currGradient = this._gradients[this._selectedGrads[channel]];
			const colorStops = currGradient.colorStops;
			const isHorizontal = currGradient.dir === "h";

			let grad: CanvasGradient;

			if (_radial)
				grad = _ctx.createRadialGradient(
					centerX,
					centerY,
					outerRadius,
					centerX,
					centerY,
					innerRadius - (outerRadius - innerRadius) * Number(isDualVertical),
				);
			else
				grad = _ctx.createLinearGradient(
					...(isHorizontal
						? ([initialX, 0, initialX + analyzerWidth, 0] as [
								number,
								number,
								number,
								number,
							])
						: ([0, 0, 0, gradientHeight] as [number, number, number, number])),
				);

			if (colorStops) {
				const dual =
					isDualVertical && !this._splitGradient && (!isHorizontal || _radial);

				for (
					let channelArea = 0;
					channelArea < 1 + Number(dual);
					channelArea++
				) {
					const maxIndex = colorStops.length - 1;

					colorStops.forEach((item, index) => {
						let colorStop = item;
						let offset = colorStop.pos;

						// in dual mode (not split), use half the original offset for each channel
						if (dual) offset /= 2;

						// constrain the offset within the useful analyzer areas (avoid reflex areas)
						if (isDualVertical && !isLumi && !_radial && !isHorizontal) {
							offset *= analyzerRatio;
							// skip the first reflex area in split mode
							if (!dual && offset > 0.5 * analyzerRatio)
								offset += 0.5 * _reflexRatio;
						}

						// only for dual-vertical non-split gradient (creates full gradient on both halves of the canvas)
						if (channelArea === 1) {
							// add colors in reverse order if radial or lumi are active
							if (_radial || isLumi) {
								const revIndex = maxIndex - index;
								colorStop = colorStops[revIndex];
								offset = 1 - colorStop.pos / 2;
							} else {
								// if the first offset is not 0, create an additional color stop to prevent bleeding from the first channel
								if (index === 0 && offset > 0)
									grad.addColorStop(0.5, colorStop.color);
								// bump the offset to the second half of the gradient
								offset += 0.5;
							}
						}

						// add gradient color stop
						grad.addColorStop(offset, colorStop.color);

						// create additional color stop at the end of first channel to prevent bleeding
						if (isDualVertical && index === maxIndex && offset < 0.5)
							grad.addColorStop(0.5, colorStop.color);
					});
				} // for ( let channelArea = 0; channelArea < 1 + dual; channelArea++ )
			}

			this._canvasGradients[channel] = grad;
		} // for ( const channel of [0,1] )
	}

	/**
	 * Normalize a dB value in the [0;1] range
	 */
	_normalizedB(value: number) {
		const isLinear = this._linearAmplitude;
		const boost = isLinear ? 1 / this._linearBoost : 1;
		const clamp = (val: number, min: number, max: number) =>
			val <= min ? min : val >= max ? max : val;
		const dBToLinear = (val: number) => 10 ** (val / 20);

		let maxValue = this.maxDecibels;
		let minValue = this.minDecibels;
		let newValue = value;

		if (isLinear) {
			maxValue = dBToLinear(maxValue);
			minValue = dBToLinear(minValue);
			newValue = dBToLinear(newValue) ** boost;
		}

		return clamp((newValue - minValue) / (maxValue - minValue) ** boost, 0, 1);
	}

	/**
	 * Internal function to change canvas dimensions on demand
	 */
	_setCanvas(reason: Reason) {
		if (!this._ready) return;

		const { canvas, _ctx } = this;
		const canvasX = this._scaleX.canvas;
		const pixelRatio = window.devicePixelRatio / (Number(this._loRes) + 1);

		let screenWidth = window.screen.width * pixelRatio;
		let screenHeight = window.screen.height * pixelRatio;

		// Fix for iOS Safari - swap width and height when in landscape
		if (
			Math.abs(window.screen.orientation.angle) === 90 &&
			screenWidth < screenHeight
		)
			[screenWidth, screenHeight] = [screenHeight, screenWidth];

		const isFullscreen = this.isFullscreen;
		const isCanvasFs = isFullscreen && this._fsEl === canvas;
		const newWidth = isCanvasFs
			? screenWidth
			: ((this._width || this._container.clientWidth || this._defaultWidth) *
					pixelRatio) |
				0;
		const newHeight = isCanvasFs
			? screenHeight
			: ((this._height || this._container.clientHeight || this._defaultHeight) *
					pixelRatio) |
				0;

		// set/update object properties
		this._pixelRatio = pixelRatio;
		this._fsWidth = screenWidth;
		this._fsHeight = screenHeight;

		// if this is not the constructor call and canvas dimensions haven't changed, quit
		if (
			reason !== REASON_CREATE &&
			canvas.width === newWidth &&
			canvas.height === newHeight
		)
			return;

		// apply new dimensions
		canvas.width = newWidth;
		canvas.height = newHeight;

		// if not in overlay mode, paint the canvas black
		if (!this.overlay) {
			_ctx.fillStyle = "#000";
			_ctx.fillRect(0, 0, newWidth, newHeight);
		}

		// set lineJoin property for area fill mode (this is reset whenever the canvas size changes)
		_ctx.lineJoin = "bevel";

		// update dimensions of the scale canvas
		canvasX.width = newWidth;
		canvasX.height = Math.max(
			20 * pixelRatio,
			(Math.min(newWidth, newHeight) / 32) | 0,
		);

		// calculate bar positions and led options
		this._calcBars();

		// (re)generate gradient
		this._makeGrad();

		// detect fullscreen changes (for Safari)

		this._fsStatus = isFullscreen;

		// call the callback function, if defined
		if (this.onCanvasResize)
			this.onCanvasResize(
				this._fsStatus !== undefined && this._fsStatus !== isFullscreen
					? REASON_FSCHANGE
					: reason,
				this,
			);
	}

	/**
	 * Select a gradient for one or both channels
	 *
	 * @param {string} name gradient name
	 * @param [{number}] desired channel (0 or 1) - if empty or invalid, sets both channels
	 */
	_setGradient(name: string, channelParam?: number) {
		let channel = channelParam;
		if (!(name in this._gradients))
			throw new AudioMotionError(ERR_UNKNOWN_GRADIENT, name);

		if (!channelParam || ![0, 1].includes(channelParam)) {
			this._selectedGrads[1] = name;
			channel = 0;
		}

		this._selectedGrads[channel || 0] = name;
		this._makeGrad();
	}
}

export default AudioMotionAnalyzer;
