/**!
 * audioMotion-analyzer
 * High-resolution real-time graphic audio spectrum analyzer JS module
 *
 * @version 4.4.0
 * @author  Henrique Avila Vianna <hvianna@gmail.com> <https://henriquevianna.com>
 * @license AGPL-3.0-or-later
 */ const $66c44939985500ce$var$VERSION = "4.4.0";
// internal constants
const $66c44939985500ce$var$PI = Math.PI, $66c44939985500ce$var$TAU = 2 * $66c44939985500ce$var$PI, $66c44939985500ce$var$HALF_PI = $66c44939985500ce$var$PI / 2, $66c44939985500ce$var$C_1 = 8.17579892; // frequency for C -1
const $66c44939985500ce$var$CANVAS_BACKGROUND_COLOR = "#000", $66c44939985500ce$var$CHANNEL_COMBINED = "dual-combined", $66c44939985500ce$var$CHANNEL_HORIZONTAL = "dual-horizontal", $66c44939985500ce$var$CHANNEL_SINGLE = "single", $66c44939985500ce$var$CHANNEL_VERTICAL = "dual-vertical", $66c44939985500ce$var$COLOR_BAR_INDEX = "bar-index", $66c44939985500ce$var$COLOR_BAR_LEVEL = "bar-level", $66c44939985500ce$var$COLOR_GRADIENT = "gradient", $66c44939985500ce$var$DEBOUNCE_TIMEOUT = 60, $66c44939985500ce$var$EVENT_CLICK = "click", $66c44939985500ce$var$EVENT_FULLSCREENCHANGE = "fullscreenchange", $66c44939985500ce$var$EVENT_RESIZE = "resize", $66c44939985500ce$var$GRADIENT_DEFAULT_BGCOLOR = "#111", $66c44939985500ce$var$FILTER_NONE = "", $66c44939985500ce$var$FILTER_A = "A", $66c44939985500ce$var$FILTER_B = "B", $66c44939985500ce$var$FILTER_C = "C", $66c44939985500ce$var$FILTER_D = "D", $66c44939985500ce$var$FILTER_468 = "468", $66c44939985500ce$var$FONT_FAMILY = "sans-serif", $66c44939985500ce$var$FPS_COLOR = "#0f0", $66c44939985500ce$var$LEDS_UNLIT_COLOR = "#7f7f7f22", $66c44939985500ce$var$MODE_GRAPH = 10, $66c44939985500ce$var$REASON_CREATE = "create", $66c44939985500ce$var$REASON_FSCHANGE = "fschange", $66c44939985500ce$var$REASON_LORES = "lores", $66c44939985500ce$var$REASON_RESIZE = $66c44939985500ce$var$EVENT_RESIZE, $66c44939985500ce$var$REASON_USER = "user", $66c44939985500ce$var$SCALEX_BACKGROUND_COLOR = "#000c", $66c44939985500ce$var$SCALEX_LABEL_COLOR = "#fff", $66c44939985500ce$var$SCALEX_HIGHLIGHT_COLOR = "#4f4", $66c44939985500ce$var$SCALEY_LABEL_COLOR = "#888", $66c44939985500ce$var$SCALEY_MIDLINE_COLOR = "#555", $66c44939985500ce$var$SCALE_BARK = "bark", $66c44939985500ce$var$SCALE_LINEAR = "linear", $66c44939985500ce$var$SCALE_LOG = "log", $66c44939985500ce$var$SCALE_MEL = "mel";
// built-in gradients
const $66c44939985500ce$var$PRISM = [
    "#a35",
    "#c66",
    "#e94",
    "#ed0",
    "#9d5",
    "#4d8",
    "#2cb",
    "#0bc",
    "#09c",
    "#36b"
], $66c44939985500ce$var$GRADIENTS = [
    [
        "classic",
        {
            colorStops: [
                "red",
                {
                    color: "yellow",
                    level: .85,
                    pos: .6
                },
                {
                    color: "lime",
                    level: .475
                }
            ]
        }
    ],
    [
        "prism",
        {
            colorStops: $66c44939985500ce$var$PRISM
        }
    ],
    [
        "rainbow",
        {
            dir: "h",
            colorStops: [
                "#817",
                ...$66c44939985500ce$var$PRISM,
                "#639"
            ]
        }
    ],
    [
        "orangered",
        {
            bgColor: "#3e2f29",
            colorStops: [
                "OrangeRed"
            ]
        }
    ],
    [
        "steelblue",
        {
            bgColor: "#222c35",
            colorStops: [
                "SteelBlue"
            ]
        }
    ]
];
// settings defaults
const $66c44939985500ce$var$DEFAULT_SETTINGS = {
    alphaBars: false,
    ansiBands: false,
    barSpace: 0.1,
    bgAlpha: 0.7,
    channelLayout: $66c44939985500ce$var$CHANNEL_SINGLE,
    colorMode: $66c44939985500ce$var$COLOR_GRADIENT,
    fftSize: 8192,
    fillAlpha: 1,
    frequencyScale: $66c44939985500ce$var$SCALE_LOG,
    gradient: $66c44939985500ce$var$GRADIENTS[0][0],
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
    weightingFilter: $66c44939985500ce$var$FILTER_NONE,
    width: undefined
};
// custom error messages
const $66c44939985500ce$var$ERR_AUDIO_CONTEXT_FAIL = [
    "ERR_AUDIO_CONTEXT_FAIL",
    "Could not create audio context. Web Audio API not supported?"
], $66c44939985500ce$var$ERR_INVALID_AUDIO_CONTEXT = [
    "ERR_INVALID_AUDIO_CONTEXT",
    "Provided audio context is not valid"
], $66c44939985500ce$var$ERR_UNKNOWN_GRADIENT = [
    "ERR_UNKNOWN_GRADIENT",
    "Unknown gradient"
], $66c44939985500ce$var$ERR_FREQUENCY_TOO_LOW = [
    "ERR_FREQUENCY_TOO_LOW",
    "Frequency values must be >= 1"
], $66c44939985500ce$var$ERR_INVALID_MODE = [
    "ERR_INVALID_MODE",
    "Invalid mode"
], $66c44939985500ce$var$ERR_REFLEX_OUT_OF_RANGE = [
    "ERR_REFLEX_OUT_OF_RANGE",
    "Reflex ratio must be >= 0 and < 1"
], $66c44939985500ce$var$ERR_INVALID_AUDIO_SOURCE = [
    "ERR_INVALID_AUDIO_SOURCE",
    "Audio source must be an instance of HTMLMediaElement or AudioNode"
], $66c44939985500ce$var$ERR_GRADIENT_INVALID_NAME = [
    "ERR_GRADIENT_INVALID_NAME",
    "Gradient name must be a non-empty string"
], $66c44939985500ce$var$ERR_GRADIENT_NOT_AN_OBJECT = [
    "ERR_GRADIENT_NOT_AN_OBJECT",
    "Gradient options must be an object"
], $66c44939985500ce$var$ERR_GRADIENT_MISSING_COLOR = [
    "ERR_GRADIENT_MISSING_COLOR",
    "Gradient colorStops must be a non-empty array"
];
class $66c44939985500ce$var$AudioMotionError extends Error {
    constructor(error, value){
        const [code, message] = error;
        super(message + (value !== undefined ? `: ${value}` : ""));
        this.name = "AudioMotionError";
        this.code = code;
    }
}
// helper function - output deprecation warning message on console
const $66c44939985500ce$var$deprecate = (name, alternative)=>console.warn(`${name} is deprecated. Use ${alternative} instead.`);
// helper function - check if a given object is empty (also returns `true` on null, undefined or any non-object value)
const $66c44939985500ce$var$isEmpty = (obj)=>{
    for(const p in obj)return false;
    return true;
};
// helper function - validate a given value with an array of strings (by default, all lowercase)
// returns the validated value, or the first element of `list` if `value` is not found in the array
const $66c44939985500ce$var$validateFromList = (value, list, modifier = "toLowerCase")=>list[Math.max(0, list.indexOf(("" + value)[modifier]()))];
// helper function - find the Y-coordinate of a point located between two other points, given its X-coordinate
const $66c44939985500ce$var$findY = (x1, y1, x2, y2, x)=>y1 + (y2 - y1) * (x - x1) / (x2 - x1);
// Polyfill for Array.findLastIndex()
if (!Array.prototype.findLastIndex) Array.prototype.findLastIndex = function(callback) {
    let index = this.length;
    while(index-- > 0){
        if (callback(this[index])) return index;
    }
    return -1;
};
class $66c44939985500ce$export$2e2bcd8739ae039 {
    /**
 * CONSTRUCTOR
 *
 * @param {object} [container] DOM element where to insert the analyzer; if undefined, uses the document body
 * @param {object} [options]
 * @returns {object} AudioMotionAnalyzer object
 */ constructor(container, options = {}){
        this._ready = false;
        // Initialize internal objects
        this._aux = {}; // auxiliary variables
        this._canvasGradients = []; // CanvasGradient objects for channels 0 and 1
        this._destroyed = false;
        this._energy = {
            val: 0,
            peak: 0,
            hold: 0
        };
        this._flg = {}; // flags
        this._fps = 0;
        this._gradients = {}; // registered gradients
        this._last = 0; // timestamp of last rendered frame
        this._outNodes = []; // output nodes
        this._ownContext = false;
        this._selectedGrads = []; // names of the currently selected gradients for channels 0 and 1
        this._sources = []; // input nodes
        // Check if options object passed as first argument
        if (!(container instanceof Element)) {
            if ($66c44939985500ce$var$isEmpty(options) && !$66c44939985500ce$var$isEmpty(container)) options = container;
            container = null;
        }
        this._ownCanvas = !(options.canvas instanceof HTMLCanvasElement);
        // Create a new canvas or use the one provided by the user
        const canvas = this._ownCanvas ? document.createElement("canvas") : options.canvas;
        canvas.style = "max-width: 100%;";
        this._ctx = canvas.getContext("2d");
        // Register built-in gradients
        for (const [name, options] of $66c44939985500ce$var$GRADIENTS)this.registerGradient(name, options);
        // Set container
        this._container = container || !this._ownCanvas && canvas.parentElement || document.body;
        // Make sure we have minimal width and height dimensions in case of an inline container
        this._defaultWidth = this._container.clientWidth || 640;
        this._defaultHeight = this._container.clientHeight || 270;
        // Use audio context provided by user, or create a new one
        let audioCtx;
        if (options.source && (audioCtx = options.source.context)) ;
        else if (audioCtx = options.audioCtx) ;
        else try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this._ownContext = true;
        } catch (err) {
            throw new $66c44939985500ce$var$AudioMotionError($66c44939985500ce$var$ERR_AUDIO_CONTEXT_FAIL);
        }
        // make sure audioContext is valid
        if (!audioCtx.createGain) throw new $66c44939985500ce$var$AudioMotionError($66c44939985500ce$var$ERR_INVALID_AUDIO_CONTEXT);
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

		*/ // create the analyzer nodes, channel splitter and merger, and gain nodes for input/output connections
        const analyzer = this._analyzer = [
            audioCtx.createAnalyser(),
            audioCtx.createAnalyser()
        ];
        const splitter = this._splitter = audioCtx.createChannelSplitter(2);
        const merger = this._merger = audioCtx.createChannelMerger(2);
        this._input = audioCtx.createGain();
        this._output = audioCtx.createGain();
        // connect audio source if provided in the options
        if (options.source) this.connectInput(options.source);
        // connect splitter -> analyzers
        for (const i of [
            0,
            1
        ])splitter.connect(analyzer[i], i);
        // connect merger -> output
        merger.connect(this._output);
        // connect output -> destination (speakers)
        if (options.connectSpeakers !== false) this.connectOutput();
        // create auxiliary canvases for the X-axis and radial scale labels
        for (const ctx of [
            "_scaleX",
            "_scaleR"
        ])this[ctx] = document.createElement("canvas").getContext("2d");
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
        const onResize = ()=>{
            if (!this._fsTimeout) // delay the resize to prioritize a possible following `fullscreenchange` event
            this._fsTimeout = window.setTimeout(()=>{
                if (!this._fsChanging) {
                    this._setCanvas($66c44939985500ce$var$REASON_RESIZE);
                    this._fsTimeout = 0;
                }
            }, $66c44939985500ce$var$DEBOUNCE_TIMEOUT);
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
        window.addEventListener($66c44939985500ce$var$EVENT_RESIZE, onResize, {
            signal: signal
        });
        // listen for fullscreenchange events on the canvas - not available on Safari
        canvas.addEventListener($66c44939985500ce$var$EVENT_FULLSCREENCHANGE, ()=>{
            // set flag to indicate a fullscreen change in progress
            this._fsChanging = true;
            // if there is a scheduled resize event, clear it
            if (this._fsTimeout) window.clearTimeout(this._fsTimeout);
            // update the canvas
            this._setCanvas($66c44939985500ce$var$REASON_FSCHANGE);
            // delay clearing the flag to prevent any shortly following resize event
            this._fsTimeout = window.setTimeout(()=>{
                this._fsChanging = false;
                this._fsTimeout = 0;
            }, $66c44939985500ce$var$DEBOUNCE_TIMEOUT);
        }, {
            signal: signal
        });
        // Resume audio context if in suspended state (browsers' autoplay policy)
        const unlockContext = ()=>{
            if (audioCtx.state == "suspended") audioCtx.resume();
            window.removeEventListener($66c44939985500ce$var$EVENT_CLICK, unlockContext);
        };
        window.addEventListener($66c44939985500ce$var$EVENT_CLICK, unlockContext);
        // reset FPS-related variables when window becomes visible (avoid FPS drop due to frames not rendered while hidden)
        document.addEventListener("visibilitychange", ()=>{
            if (document.visibilityState != "hidden") {
                this._frames = 0;
                this._time = performance.now();
            }
        }, {
            signal: signal
        });
        // Set configuration options and use defaults for any missing properties
        this._setProps(options, true);
        // Add canvas to the container (only when canvas not provided by user)
        if (this.useCanvas && this._ownCanvas) this._container.appendChild(canvas);
        // Finish canvas setup
        this._ready = true;
        this._setCanvas($66c44939985500ce$var$REASON_CREATE);
    }
    /**
	 * ==========================================================================
	 *
	 * PUBLIC PROPERTIES GETTERS AND SETTERS
	 *
	 * ==========================================================================
	 */ get alphaBars() {
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
        this._chLayout = $66c44939985500ce$var$validateFromList(value, [
            $66c44939985500ce$var$CHANNEL_SINGLE,
            $66c44939985500ce$var$CHANNEL_HORIZONTAL,
            $66c44939985500ce$var$CHANNEL_VERTICAL,
            $66c44939985500ce$var$CHANNEL_COMBINED
        ]);
        // update node connections
        this._input.disconnect();
        this._input.connect(this._chLayout != $66c44939985500ce$var$CHANNEL_SINGLE ? this._splitter : this._analyzer[0]);
        this._analyzer[0].disconnect();
        if (this._outNodes.length) this._analyzer[0].connect(this._chLayout != $66c44939985500ce$var$CHANNEL_SINGLE ? this._merger : this._output);
        this._calcBars();
        this._makeGrad();
    }
    get colorMode() {
        return this._colorMode;
    }
    set colorMode(value) {
        this._colorMode = $66c44939985500ce$var$validateFromList(value, [
            $66c44939985500ce$var$COLOR_GRADIENT,
            $66c44939985500ce$var$COLOR_BAR_INDEX,
            $66c44939985500ce$var$COLOR_BAR_LEVEL
        ]);
    }
    get fftSize() {
        return this._analyzer[0].fftSize;
    }
    set fftSize(value) {
        for (const i of [
            0,
            1
        ])this._analyzer[i].fftSize = value;
        const binCount = this._analyzer[0].frequencyBinCount;
        this._fftData = [
            new Float32Array(binCount),
            new Float32Array(binCount)
        ];
        this._calcBars();
    }
    get frequencyScale() {
        return this._frequencyScale;
    }
    set frequencyScale(value) {
        this._frequencyScale = $66c44939985500ce$var$validateFromList(value, [
            $66c44939985500ce$var$SCALE_LOG,
            $66c44939985500ce$var$SCALE_BARK,
            $66c44939985500ce$var$SCALE_MEL,
            $66c44939985500ce$var$SCALE_LINEAR
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
    get height() {
        return this._height;
    }
    set height(h) {
        this._height = h;
        this._setCanvas($66c44939985500ce$var$REASON_USER);
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
        this._setCanvas($66c44939985500ce$var$REASON_LORES);
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
        for (const i of [
            0,
            1
        ])this._analyzer[i].maxDecibels = value;
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
        if (value < 1) throw new $66c44939985500ce$var$AudioMotionError($66c44939985500ce$var$ERR_FREQUENCY_TOO_LOW);
        else {
            this._maxFreq = Math.min(value, this.audioCtx.sampleRate / 2);
            this._calcBars();
        }
    }
    get minDecibels() {
        return this._analyzer[0].minDecibels;
    }
    set minDecibels(value) {
        for (const i of [
            0,
            1
        ])this._analyzer[i].minDecibels = value;
    }
    get minFreq() {
        return this._minFreq;
    }
    set minFreq(value) {
        if (value < 1) throw new $66c44939985500ce$var$AudioMotionError($66c44939985500ce$var$ERR_FREQUENCY_TOO_LOW);
        else {
            this._minFreq = +value;
            this._calcBars();
        }
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
        if (mode >= 0 && mode <= 10 && mode != 9) {
            this._mode = mode;
            this._calcBars();
            this._makeGrad();
        } else throw new $66c44939985500ce$var$AudioMotionError($66c44939985500ce$var$ERR_INVALID_MODE, value);
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
        value = +value || 0;
        if (value < 0 || value >= 1) throw new $66c44939985500ce$var$AudioMotionError($66c44939985500ce$var$ERR_REFLEX_OUT_OF_RANGE);
        else {
            this._reflexRatio = value;
            this._calcBars();
            this._makeGrad();
        }
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
        for (const i of [
            0,
            1
        ])this._analyzer[i].smoothingTimeConstant = value;
    }
    get spinSpeed() {
        return this._spinSpeed;
    }
    set spinSpeed(value) {
        value = +value || 0;
        if (this._spinSpeed === undefined || value == 0) this._spinAngle = -$66c44939985500ce$var$HALF_PI; // initialize or reset the rotation angle
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
        $66c44939985500ce$var$deprecate("stereo", "channelLayout");
        return this._chLayout != $66c44939985500ce$var$CHANNEL_SINGLE;
    }
    set stereo(value) {
        $66c44939985500ce$var$deprecate("stereo", "channelLayout");
        this.channelLayout = value ? $66c44939985500ce$var$CHANNEL_VERTICAL : $66c44939985500ce$var$CHANNEL_SINGLE;
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
        this._weightingFilter = $66c44939985500ce$var$validateFromList(value, [
            $66c44939985500ce$var$FILTER_NONE,
            $66c44939985500ce$var$FILTER_A,
            $66c44939985500ce$var$FILTER_B,
            $66c44939985500ce$var$FILTER_C,
            $66c44939985500ce$var$FILTER_D,
            $66c44939985500ce$var$FILTER_468
        ], "toUpperCase");
    }
    get width() {
        return this._width;
    }
    set width(w) {
        this._width = w;
        this._setCanvas($66c44939985500ce$var$REASON_USER);
    }
    // Read only properties
    get audioCtx() {
        return this._input.context;
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
        return this._fsEl && (document.fullscreenElement || document.webkitFullscreenElement) === this._fsEl;
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
        return $66c44939985500ce$var$VERSION;
    }
    /**
	 * ==========================================================================
     *
	 * PUBLIC METHODS
	 *
	 * ==========================================================================
	 */ /**
	 * Connects an HTML media element or audio node to the analyzer
	 *
	 * @param {object} an instance of HTMLMediaElement or AudioNode
	 * @returns {object} a MediaElementAudioSourceNode object if created from HTML element, or the same input object otherwise
	 */ connectInput(source) {
        const isHTML = source instanceof HTMLMediaElement;
        if (!(isHTML || source.connect)) throw new $66c44939985500ce$var$AudioMotionError($66c44939985500ce$var$ERR_INVALID_AUDIO_SOURCE);
        // if source is an HTML element, create an audio node for it; otherwise, use the provided audio node
        const node = isHTML ? this.audioCtx.createMediaElementSource(source) : source;
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
	 */ connectOutput(node = this.audioCtx.destination) {
        if (this._outNodes.includes(node)) return;
        this._output.connect(node);
        this._outNodes.push(node);
        // when connecting the first node, also connect the analyzer nodes to the merger / output nodes
        if (this._outNodes.length == 1) for (const i of [
            0,
            1
        ])this._analyzer[i].connect(this._chLayout == $66c44939985500ce$var$CHANNEL_SINGLE && !i ? this._output : this._merger, 0, i);
    }
    /**
	 * Destroys instance
	 */ destroy() {
        if (!this._ready) return;
        const { audioCtx: audioCtx, canvas: canvas, _controller: _controller, _input: _input, _merger: _merger, _observer: _observer, _ownCanvas: _ownCanvas, _ownContext: _ownContext, _splitter: _splitter } = this;
        this._destroyed = true;
        this._ready = false;
        this.stop();
        // remove event listeners
        _controller.abort();
        if (_observer) _observer.disconnect();
        // clear callbacks and fullscreen element
        this.onCanvasResize = null;
        this.onCanvasDraw = null;
        this._fsEl = null;
        // disconnect audio nodes
        this.disconnectInput();
        this.disconnectOutput(); // also disconnects analyzer nodes
        _input.disconnect();
        _splitter.disconnect();
        _merger.disconnect();
        // if audio context is our own (not provided by the user), close it
        if (_ownContext) audioCtx.close();
        // remove canvas from the DOM (if not provided by the user)
        if (_ownCanvas) canvas.remove();
        // reset flags
        this._calcBars();
    }
    /**
	 * Disconnects audio sources from the analyzer
	 *
	 * @param [{object|array}] a connected AudioNode object or an array of such objects; if falsy, all connected nodes are disconnected
	 * @param [{boolean}] if true, stops/releases audio tracks from disconnected media streams (e.g. microphone)
	 */ disconnectInput(sources, stopTracks) {
        if (!sources) sources = Array.from(this._sources);
        else if (!Array.isArray(sources)) sources = [
            sources
        ];
        for (const node of sources){
            const idx = this._sources.indexOf(node);
            if (stopTracks && node.mediaStream) for (const track of node.mediaStream.getAudioTracks())track.stop();
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
	 */ disconnectOutput(node) {
        if (node && !this._outNodes.includes(node)) return;
        this._output.disconnect(node);
        this._outNodes = node ? this._outNodes.filter((e)=>e !== node) : [];
        // if disconnected from all nodes, also disconnect the analyzer nodes so they keep working on Chromium
        // see https://github.com/hvianna/audioMotion-analyzer/issues/13#issuecomment-808764848
        if (this._outNodes.length == 0) for (const i of [
            0,
            1
        ])this._analyzer[i].disconnect();
    }
    /**
	 * Returns analyzer bars data
     *
	 * @returns {array}
	 */ getBars() {
        return Array.from(this._bars, ({ posX: posX, freq: freq, freqLo: freqLo, freqHi: freqHi, hold: hold, peak: peak, value: value })=>({
                posX: posX,
                freq: freq,
                freqLo: freqLo,
                freqHi: freqHi,
                hold: hold,
                peak: peak,
                value: value
            }));
    }
    /**
	 * Returns the energy of a frequency, or average energy of a range of frequencies
	 *
	 * @param [{number|string}] single or initial frequency (Hz), or preset name; if undefined, returns the overall energy
	 * @param [{number}] ending frequency (Hz)
	 * @returns {number|null} energy value (0 to 1) or null, if the specified preset is unknown
	 */ getEnergy(startFreq, endFreq) {
        if (startFreq === undefined) return this._energy.val;
        // if startFreq is a string, check for presets
        if (startFreq != +startFreq) {
            if (startFreq == "peak") return this._energy.peak;
            const presets = {
                bass: [
                    20,
                    250
                ],
                lowMid: [
                    250,
                    500
                ],
                mid: [
                    500,
                    2e3
                ],
                highMid: [
                    2e3,
                    4e3
                ],
                treble: [
                    4e3,
                    16e3
                ]
            };
            if (!presets[startFreq]) return null;
            [startFreq, endFreq] = presets[startFreq];
        }
        const startBin = this._freqToBin(startFreq), endBin = endFreq ? this._freqToBin(endFreq) : startBin, chnCount = this._chLayout == $66c44939985500ce$var$CHANNEL_SINGLE ? 1 : 2;
        let energy = 0;
        for(let channel = 0; channel < chnCount; channel++)for(let i = startBin; i <= endBin; i++)energy += this._normalizedB(this._fftData[channel][i]);
        return energy / (endBin - startBin + 1) / chnCount;
    }
    /**
	 * Returns current analyzer settings in object format
	 *
	 * @param [{string|array}] a property name or an array of property names to not include in the returned object
	 * @returns {object} Options object
	 */ getOptions(ignore) {
        if (!Array.isArray(ignore)) ignore = [
            ignore
        ];
        let options = {};
        for (const prop of Object.keys($66c44939985500ce$var$DEFAULT_SETTINGS))if (!ignore.includes(prop)) {
            if (prop == "gradient" && this.gradientLeft != this.gradientRight) {
                options.gradientLeft = this.gradientLeft;
                options.gradientRight = this.gradientRight;
            } else if (prop != "start") options[prop] = this[prop];
        }
        return options;
    }
    /**
	 * Registers a custom gradient
	 *
	 * @param {string} name
	 * @param {object} options
	 */ registerGradient(name, options) {
        if (typeof name != "string" || name.trim().length == 0) throw new $66c44939985500ce$var$AudioMotionError($66c44939985500ce$var$ERR_GRADIENT_INVALID_NAME);
        if (typeof options != "object") throw new $66c44939985500ce$var$AudioMotionError($66c44939985500ce$var$ERR_GRADIENT_NOT_AN_OBJECT);
        const { colorStops: colorStops } = options;
        if (!Array.isArray(colorStops) || !colorStops.length) throw new $66c44939985500ce$var$AudioMotionError($66c44939985500ce$var$ERR_GRADIENT_MISSING_COLOR);
        const count = colorStops.length, isInvalid = (val)=>+val != val || val < 0 || val > 1;
        // normalize all colorStops as objects with `pos`, `color` and `level` properties
        colorStops.forEach((colorStop, index)=>{
            const pos = index / Math.max(1, count - 1);
            if (typeof colorStop != "object") colorStops[index] = {
                pos: pos,
                color: colorStop
            };
            else if (isInvalid(colorStop.pos)) colorStop.pos = pos;
            if (isInvalid(colorStop.level)) colorStops[index].level = 1 - index / count;
        });
        // make sure colorStops is in descending `level` order and that the first one has `level == 1`
        // this is crucial for proper operation of 'bar-level' colorMode!
        colorStops.sort((a, b)=>a.level < b.level ? 1 : a.level > b.level ? -1 : 0);
        colorStops[0].level = 1;
        this._gradients[name] = {
            bgColor: options.bgColor || $66c44939985500ce$var$GRADIENT_DEFAULT_BGCOLOR,
            dir: options.dir,
            colorStops: colorStops
        };
        // if the registered gradient is one of the currently selected gradients, regenerate them
        if (this._selectedGrads.includes(name)) this._makeGrad();
    }
    /**
	 * Set dimensions of analyzer's canvas
	 *
	 * @param {number} w width in pixels
	 * @param {number} h height in pixels
	 */ setCanvasSize(w, h) {
        this._width = w;
        this._height = h;
        this._setCanvas($66c44939985500ce$var$REASON_USER);
    }
    /**
	 * Set desired frequency range
	 *
	 * @param {number} min lowest frequency represented in the x-axis
	 * @param {number} max highest frequency represented in the x-axis
	 */ setFreqRange(min, max) {
        if (min < 1 || max < 1) throw new $66c44939985500ce$var$AudioMotionError($66c44939985500ce$var$ERR_FREQUENCY_TOO_LOW);
        else {
            this._minFreq = Math.min(min, max);
            this.maxFreq = Math.max(min, max); // use the setter for maxFreq
        }
    }
    /**
	 * Set custom parameters for LED effect
	 * If called with no arguments or if any property is invalid, clears any previous custom parameters
	 *
	 * @param {object} [params]
	 */ setLedParams(params) {
        let maxLeds, spaceV, spaceH;
        // coerce parameters to Number; `NaN` results are rejected in the condition below
        if (params) maxLeds = params.maxLeds | 0, spaceV = +params.spaceV, spaceH = +params.spaceH;
        this._ledParams = maxLeds > 0 && spaceV > 0 && spaceH >= 0 ? [
            maxLeds,
            spaceV,
            spaceH
        ] : undefined;
        this._calcBars();
    }
    /**
	 * Shorthand function for setting several options at once
	 *
	 * @param {object} options
	 */ setOptions(options) {
        this._setProps(options);
    }
    /**
	 * Adjust the analyzer's sensitivity
	 *
	 * @param {number} min minimum decibels value
	 * @param {number} max maximum decibels value
	 */ setSensitivity(min, max) {
        for (const i of [
            0,
            1
        ]){
            this._analyzer[i].minDecibels = Math.min(min, max);
            this._analyzer[i].maxDecibels = Math.max(min, max);
        }
    }
    /**
	 * Start the analyzer
	 */ start() {
        this.toggleAnalyzer(true);
    }
    /**
	 * Stop the analyzer
	 */ stop() {
        this.toggleAnalyzer(false);
    }
    /**
	 * Start / stop canvas animation
	 *
	 * @param {boolean} [force] if undefined, inverts the current state
	 * @returns {boolean} resulting state after the change
	 */ toggleAnalyzer(force) {
        const hasStarted = this.isOn;
        if (force === undefined) force = !hasStarted;
        // Stop the analyzer if it was already running and must be disabled
        if (hasStarted && !force) {
            cancelAnimationFrame(this._runId);
            this._runId = 0;
        } else if (!hasStarted && force && !this._destroyed) {
            this._frames = 0;
            this._time = performance.now();
            this._runId = requestAnimationFrame((timestamp)=>this._draw(timestamp)); // arrow function preserves the scope of *this*
        }
        return this.isOn;
    }
    /**
	 * Toggles canvas full-screen mode
	 */ toggleFullscreen() {
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
	 */ /**
	 * Return the frequency (in Hz) for a given FFT bin
	 */ _binToFreq(bin) {
        return bin * this.audioCtx.sampleRate / this.fftSize || 1; // returns 1 for bin 0
    }
    /**
	 * Compute all internal data required for the analyzer, based on its current settings
	 */ _calcBars() {
        const bars = this._bars = []; // initialize object property
        if (!this._ready) {
            this._flg = {
                isAlpha: false,
                isBands: false,
                isLeds: false,
                isLumi: false,
                isOctaves: false,
                isOutline: false,
                isRound: false,
                noLedGap: false
            };
            return;
        }
        const { _ansiBands: _ansiBands, _barSpace: _barSpace, canvas: canvas, _chLayout: _chLayout, _maxFreq: _maxFreq, _minFreq: _minFreq, _mirror: _mirror, _mode: _mode, _radial: _radial, _radialInvert: _radialInvert, _reflexRatio: _reflexRatio } = this, centerX = canvas.width >> 1, centerY = canvas.height >> 1, isDualVertical = _chLayout == $66c44939985500ce$var$CHANNEL_VERTICAL && !_radial, isDualHorizontal = _chLayout == $66c44939985500ce$var$CHANNEL_HORIZONTAL, // COMPUTE FLAGS
        isBands = _mode % 10 != 0, isOctaves = isBands && this._frequencyScale == $66c44939985500ce$var$SCALE_LOG, isLeds = this._showLeds && isBands && !_radial, isLumi = this._lumiBars && isBands && !_radial, isAlpha = this._alphaBars && !isLumi && _mode != $66c44939985500ce$var$MODE_GRAPH, isOutline = this._outlineBars && isBands && !isLumi && !isLeds, isRound = this._roundBars && isBands && !isLumi && !isLeds, noLedGap = _chLayout != $66c44939985500ce$var$CHANNEL_VERTICAL || _reflexRatio > 0 && !isLumi, // COMPUTE AUXILIARY VALUES
        // channelHeight is the total canvas height dedicated to each channel, including the reflex area, if any)
        channelHeight = canvas.height - (isDualVertical && !isLeds ? .5 : 0) >> isDualVertical, // analyzerHeight is the effective height used to render the analyzer, excluding the reflex area
        analyzerHeight = channelHeight * (isLumi || _radial ? 1 : 1 - _reflexRatio) | 0, analyzerWidth = canvas.width - centerX * (isDualHorizontal || _mirror != 0), // channelGap is **0** if isLedDisplay == true (LEDs already have spacing); **1** if canvas height is odd (windowed); **2** if it's even
        // TODO: improve this, make it configurable?
        channelGap = isDualVertical ? canvas.height - channelHeight * 2 : 0, initialX = centerX * (_mirror == -1 && !isDualHorizontal && !_radial);
        let innerRadius = Math.min(canvas.width, canvas.height) * .375 * (_chLayout == $66c44939985500ce$var$CHANNEL_VERTICAL ? 1 : this._radius) | 0, outerRadius = Math.min(centerX, centerY);
        if (_radialInvert && _chLayout != $66c44939985500ce$var$CHANNEL_VERTICAL) [innerRadius, outerRadius] = [
            outerRadius,
            innerRadius
        ];
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
		 */ // helper function
        // bar object: { posX, freq, freqLo, freqHi, binLo, binHi, ratioLo, ratioHi, peak, hold, value }
        const barsPush = (args)=>bars.push({
                ...args,
                peak: [
                    0,
                    0
                ],
                hold: [
                    0
                ],
                value: [
                    0
                ]
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
		*/ // helper function to calculate FFT bin and interpolation ratio for a given frequency
        const calcRatio = (freq)=>{
            const bin = this._freqToBin(freq, "floor"), lower = this._binToFreq(bin), upper = this._binToFreq(bin + 1), ratio = Math.log2(freq / lower) / Math.log2(upper / lower);
            return [
                bin,
                ratio
            ];
        };
        let barWidth, scaleMin, unitWidth;
        if (isOctaves) {
            // helper function to round a value to a given number of significant digits
            // `atLeast` set to true prevents reducing the number of integer significant digits
            const roundSD = (value, digits, atLeast)=>+value.toPrecision(atLeast ? Math.max(digits, 1 + Math.log10(value) | 0) : digits);
            // helper function to find the nearest preferred number (Renard series) for a given value
            const nearestPreferred = (value)=>{
                // R20 series is used here, as it provides closer approximations for 1/2 octave bands (non-standard)
                const preferred = [
                    1,
                    1.12,
                    1.25,
                    1.4,
                    1.6,
                    1.8,
                    2,
                    2.24,
                    2.5,
                    2.8,
                    3.15,
                    3.55,
                    4,
                    4.5,
                    5,
                    5.6,
                    6.3,
                    7.1,
                    8,
                    9,
                    10
                ], power = Math.log10(value) | 0, normalized = value / 10 ** power;
                let i = 1;
                while(i < preferred.length && normalized > preferred[i])i++;
                if (normalized - preferred[i - 1] < preferred[i] - normalized) i--;
                return (preferred[i] * 10 ** (power + 5) | 0) / 1e5; // keep 5 significant digits
            };
            // ANSI standard octave bands use the base-10 frequency ratio, as preferred by [ANSI S1.11-2004, p.2]
            // The equal-tempered scale uses the base-2 ratio
            const bands = [
                0,
                24,
                12,
                8,
                6,
                4,
                3,
                2,
                1
            ][_mode], bandWidth = _ansiBands ? 10 ** (3 / (bands * 10)) : 2 ** (1 / bands), halfBand = bandWidth ** .5;
            let analyzerBars = [], currFreq = _ansiBands ? 7.94328235 / (bands % 2 ? 1 : halfBand) : $66c44939985500ce$var$C_1;
            // For ANSI bands with even denominators (all except 1/1 and 1/3), the reference frequency (1 kHz)
            // must fall on the edges of a pair of adjacent bands, instead of midband [ANSI S1.11-2004, p.2]
            // In the equal-tempered scale, all midband frequencies represent a musical note or quarter-tone.
            do {
                let freq = currFreq; // midband frequency
                const freqLo = roundSD(freq / halfBand, 4, true), freqHi = roundSD(freq * halfBand, 4, true), [binLo, ratioLo] = calcRatio(freqLo), [binHi, ratioHi] = calcRatio(freqHi);
                // for 1/1, 1/2 and 1/3 ANSI bands, use the preferred numbers to find the nominal midband frequency
                // for 1/4 to 1/24, round to 2 or 3 significant digits, according to the MSD [ANSI S1.11-2004, p.12]
                if (_ansiBands) freq = bands < 4 ? nearestPreferred(freq) : roundSD(freq, freq.toString()[0] < 5 ? 3 : 2);
                else freq = roundSD(freq, 4, true);
                if (freq >= _minFreq) barsPush({
                    posX: 0,
                    freq: freq,
                    freqLo: freqLo,
                    freqHi: freqHi,
                    binLo: binLo,
                    binHi: binHi,
                    ratioLo: ratioLo,
                    ratioHi: ratioHi
                });
                currFreq *= bandWidth;
            }while (currFreq <= _maxFreq);
            barWidth = analyzerWidth / bars.length;
            bars.forEach((bar, index)=>bar.posX = initialX + index * barWidth);
            const firstBar = bars[0], lastBar = bars[bars.length - 1];
            scaleMin = this._freqScaling(firstBar.freqLo);
            unitWidth = analyzerWidth / (this._freqScaling(lastBar.freqHi) - scaleMin);
            // clamp edge frequencies to minFreq / maxFreq, if necessary
            // this is done after computing scaleMin and unitWidth, for the proper positioning of labels on the X-axis
            if (firstBar.freqLo < _minFreq) {
                firstBar.freqLo = _minFreq;
                [firstBar.binLo, firstBar.ratioLo] = calcRatio(_minFreq);
            }
            if (lastBar.freqHi > _maxFreq) {
                lastBar.freqHi = _maxFreq;
                [lastBar.binHi, lastBar.ratioHi] = calcRatio(_maxFreq);
            }
        } else if (isBands) {
            const bands = [
                0,
                24,
                12,
                8,
                6,
                4,
                3,
                2,
                1
            ][_mode] * 10;
            const invFreqScaling = (x)=>{
                switch(this._frequencyScale){
                    case $66c44939985500ce$var$SCALE_BARK:
                        return 1960 / (26.81 / (x + .53) - 1);
                    case $66c44939985500ce$var$SCALE_MEL:
                        return 700 * (2 ** x - 1);
                    case $66c44939985500ce$var$SCALE_LINEAR:
                        return x;
                }
            };
            barWidth = analyzerWidth / bands;
            scaleMin = this._freqScaling(_minFreq);
            unitWidth = analyzerWidth / (this._freqScaling(_maxFreq) - scaleMin);
            for(let i = 0, posX = 0; i < bands; i++, posX += barWidth){
                const freqLo = invFreqScaling(scaleMin + posX / unitWidth), freq = invFreqScaling(scaleMin + (posX + barWidth / 2) / unitWidth), freqHi = invFreqScaling(scaleMin + (posX + barWidth) / unitWidth), [binLo, ratioLo] = calcRatio(freqLo), [binHi, ratioHi] = calcRatio(freqHi);
                barsPush({
                    posX: initialX + posX,
                    freq: freq,
                    freqLo: freqLo,
                    freqHi: freqHi,
                    binLo: binLo,
                    binHi: binHi,
                    ratioLo: ratioLo,
                    ratioHi: ratioHi
                });
            }
        } else {
            barWidth = 1;
            scaleMin = this._freqScaling(_minFreq);
            unitWidth = analyzerWidth / (this._freqScaling(_maxFreq) - scaleMin);
            const minIndex = this._freqToBin(_minFreq, "floor"), maxIndex = this._freqToBin(_maxFreq);
            let lastPos = -999;
            for(let i = minIndex; i <= maxIndex; i++){
                const freq = this._binToFreq(i), posX = initialX + Math.round(unitWidth * (this._freqScaling(freq) - scaleMin)); // avoid fractionary pixel values
                // if it's on a different X-coordinate, create a new bar for this frequency
                if (posX > lastPos) {
                    barsPush({
                        posX: posX,
                        freq: freq,
                        freqLo: freq,
                        freqHi: freq,
                        binLo: i,
                        binHi: i,
                        ratioLo: 0,
                        ratioHi: 0
                    });
                    lastPos = posX;
                } else if (bars.length) {
                    const lastBar = bars[bars.length - 1];
                    lastBar.binHi = i;
                    lastBar.freqHi = freq;
                    lastBar.freq = (lastBar.freqLo * freq) ** .5; // compute center frequency (geometric mean)
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
		 */ let spaceH = 0, spaceV = 0;
        if (isLeds) {
            // adjustment for high pixel-ratio values on low-resolution screens (Android TV)
            const dPR = this._pixelRatio / (window.devicePixelRatio > 1 && window.screen.height <= 540 ? 2 : 1);
            const params = [
                [],
                [
                    128,
                    3,
                    .45
                ],
                [
                    128,
                    4,
                    .225
                ],
                [
                    96,
                    6,
                    .225
                ],
                [
                    80,
                    6,
                    .225
                ],
                [
                    80,
                    6,
                    .125
                ],
                [
                    64,
                    6,
                    .125
                ],
                [
                    48,
                    8,
                    .125
                ],
                [
                    24,
                    16,
                    .125
                ]
            ];
            // use custom LED parameters if set, or the default parameters for the current mode
            const customParams = this._ledParams, [maxLeds, spaceVRatio, spaceHRatio] = customParams || params[_mode];
            let ledCount, maxHeight = analyzerHeight;
            if (customParams) {
                const minHeight = 2 * dPR;
                let blockHeight;
                ledCount = maxLeds + 1;
                do {
                    ledCount--;
                    blockHeight = maxHeight / ledCount / (1 + spaceVRatio);
                    spaceV = blockHeight * spaceVRatio;
                }while ((blockHeight < minHeight || spaceV < minHeight) && ledCount > 1);
            } else {
                // calculate vertical spacing - aim for the reference ratio, but make sure it's at least 2px
                const refRatio = 540 / spaceVRatio;
                spaceV = Math.min(spaceVRatio * dPR, Math.max(2, maxHeight / refRatio + .1 | 0));
            }
            // remove the extra spacing below the last line of LEDs
            if (noLedGap) maxHeight += spaceV;
            // recalculate the number of leds, considering the effective spaceV
            if (!customParams) ledCount = Math.min(maxLeds, maxHeight / (spaceV * 2) | 0);
            spaceH = spaceHRatio >= 1 ? spaceHRatio : barWidth * spaceHRatio;
            this._leds = [
                ledCount,
                spaceH,
                spaceV,
                maxHeight / ledCount - spaceV // ledHeight
            ];
        }
        // COMPUTE ADDITIONAL BAR POSITIONING, ACCORDING TO THE CURRENT SETTINGS
        // uses: _barSpace, barWidth, spaceH
        const barSpacePx = Math.min(barWidth - 1, _barSpace * (_barSpace > 0 && _barSpace < 1 ? barWidth : 1));
        if (isBands) barWidth -= Math.max(isLeds ? spaceH : 0, barSpacePx);
        bars.forEach((bar, index)=>{
            let posX = bar.posX, width = barWidth;
            // in bands modes we need to update bar.posX to account for bar/led spacing
            if (isBands) {
                if (_barSpace == 0 && !isLeds) {
                    // when barSpace == 0 use integer values for perfect gapless positioning
                    posX |= 0;
                    width |= 0;
                    if (index > 0 && posX > bars[index - 1].posX + bars[index - 1].width) {
                        posX--;
                        width++;
                    }
                } else posX += Math.max(isLeds ? spaceH : 0, barSpacePx) / 2;
                bar.posX = posX; // update
            }
            bar.barCenter = posX + (barWidth == 1 ? 0 : width / 2);
            bar.width = width;
        });
        // COMPUTE CHANNEL COORDINATES (uses spaceV)
        const channelCoords = [];
        for (const channel of [
            0,
            1
        ]){
            const channelTop = _chLayout == $66c44939985500ce$var$CHANNEL_VERTICAL ? (channelHeight + channelGap) * channel : 0, channelBottom = channelTop + channelHeight, analyzerBottom = channelTop + analyzerHeight - (!isLeds || noLedGap ? 0 : spaceV);
            channelCoords.push({
                channelTop: channelTop,
                channelBottom: channelBottom,
                analyzerBottom: analyzerBottom
            });
        }
        // SAVE INTERNAL PROPERTIES
        this._aux = {
            analyzerHeight: analyzerHeight,
            analyzerWidth: analyzerWidth,
            centerX: centerX,
            centerY: centerY,
            channelCoords: channelCoords,
            channelHeight: channelHeight,
            channelGap: channelGap,
            initialX: initialX,
            innerRadius: innerRadius,
            outerRadius: outerRadius,
            scaleMin: scaleMin,
            unitWidth: unitWidth
        };
        this._flg = {
            isAlpha: isAlpha,
            isBands: isBands,
            isLeds: isLeds,
            isLumi: isLumi,
            isOctaves: isOctaves,
            isOutline: isOutline,
            isRound: isRound,
            noLedGap: noLedGap
        };
        // generate the X-axis and radial scales
        this._createScales();
    }
    /**
	 * Generate the X-axis and radial scales in auxiliary canvases
	 */ _createScales() {
        if (!this._ready) return;
        const { analyzerWidth: analyzerWidth, initialX: initialX, innerRadius: innerRadius, scaleMin: scaleMin, unitWidth: unitWidth } = this._aux, { canvas: canvas, _frequencyScale: _frequencyScale, _mirror: _mirror, _noteLabels: _noteLabels, _radial: _radial, _scaleX: _scaleX, _scaleR: _scaleR } = this, canvasX = _scaleX.canvas, canvasR = _scaleR.canvas, freqLabels = [], isDualHorizontal = this._chLayout == $66c44939985500ce$var$CHANNEL_HORIZONTAL, isDualVertical = this._chLayout == $66c44939985500ce$var$CHANNEL_VERTICAL, minDimension = Math.min(canvas.width, canvas.height), scale = [
            "C",
            ,
            "D",
            ,
            "E",
            "F",
            ,
            "G",
            ,
            "A",
            ,
            "B"
        ], scaleHeight = minDimension / 34 | 0, fontSizeX = canvasX.height >> 1, fontSizeR = scaleHeight >> 1, labelWidthX = fontSizeX * (_noteLabels ? .7 : 1.5), labelWidthR = fontSizeR * (_noteLabels ? 1 : 2), root12 = 2 ** (1 / 12);
        if (!_noteLabels && (this._ansiBands || _frequencyScale != $66c44939985500ce$var$SCALE_LOG)) {
            freqLabels.push(16, 31.5, 63, 125, 250, 500, 1e3, 2e3, 4e3);
            if (_frequencyScale == $66c44939985500ce$var$SCALE_LINEAR) freqLabels.push(6e3, 8e3, 10e3, 12e3, 14e3, 16e3, 18e3, 20e3, 22e3);
            else freqLabels.push(8e3, 16e3);
        } else {
            let freq = $66c44939985500ce$var$C_1;
            for(let octave = -1; octave < 11; octave++)for(let note = 0; note < 12; note++){
                if (freq >= this._minFreq && freq <= this._maxFreq) {
                    const pitch = scale[note], isC = pitch == "C";
                    if (pitch && _noteLabels && !_mirror && !isDualHorizontal || isC) freqLabels.push(_noteLabels ? [
                        freq,
                        pitch + (isC ? octave : "")
                    ] : freq);
                }
                freq *= root12;
            }
        }
        // in radial dual-vertical layout, the scale is positioned exactly between both channels, by making the canvas a bit larger than the inner diameter
        canvasR.width = canvasR.height = Math.max(minDimension * .15, (innerRadius << 1) + isDualVertical * scaleHeight);
        const centerR = canvasR.width >> 1, radialY = centerR - scaleHeight * .7; // vertical position of text labels in the circular scale
        // helper function
        const radialLabel = (x, label)=>{
            const angle = $66c44939985500ce$var$TAU * (x / canvas.width), adjAng = angle - $66c44939985500ce$var$HALF_PI, posX = radialY * Math.cos(adjAng), posY = radialY * Math.sin(adjAng);
            _scaleR.save();
            _scaleR.translate(centerR + posX, centerR + posY);
            _scaleR.rotate(angle);
            _scaleR.fillText(label, 0, 0);
            _scaleR.restore();
        };
        // clear scale canvas
        canvasX.width |= 0;
        _scaleX.fillStyle = _scaleR.strokeStyle = $66c44939985500ce$var$SCALEX_BACKGROUND_COLOR;
        _scaleX.fillRect(0, 0, canvasX.width, canvasX.height);
        _scaleR.arc(centerR, centerR, centerR - scaleHeight / 2, 0, $66c44939985500ce$var$TAU);
        _scaleR.lineWidth = scaleHeight;
        _scaleR.stroke();
        _scaleX.fillStyle = _scaleR.fillStyle = $66c44939985500ce$var$SCALEX_LABEL_COLOR;
        _scaleX.font = `${fontSizeX}px ${$66c44939985500ce$var$FONT_FAMILY}`;
        _scaleR.font = `${fontSizeR}px ${$66c44939985500ce$var$FONT_FAMILY}`;
        _scaleX.textAlign = _scaleR.textAlign = "center";
        let prevX = -labelWidthX / 4, prevR = -labelWidthR;
        for (const item of freqLabels){
            const [freq, label] = Array.isArray(item) ? item : [
                item,
                item < 1e3 ? item | 0 : `${(item / 100 | 0) / 10}k`
            ], x = unitWidth * (this._freqScaling(freq) - scaleMin), y = canvasX.height * .75, isC = label[0] == "C", maxW = fontSizeX * (_noteLabels && !_mirror && !isDualHorizontal ? isC ? 1.2 : .6 : 3);
            // set label color - no highlight when mirror effect is active (only Cs displayed)
            _scaleX.fillStyle = _scaleR.fillStyle = isC && !_mirror && !isDualHorizontal ? $66c44939985500ce$var$SCALEX_HIGHLIGHT_COLOR : $66c44939985500ce$var$SCALEX_LABEL_COLOR;
            // prioritizes which note labels are displayed, due to the restricted space on some ranges/scales
            if (_noteLabels) {
                const isLog = _frequencyScale == $66c44939985500ce$var$SCALE_LOG, isLinear = _frequencyScale == $66c44939985500ce$var$SCALE_LINEAR;
                let allowedLabels = [
                    "C"
                ];
                if (isLog || freq > 2e3 || !isLinear && freq > 250 || (!_radial || isDualVertical) && (!isLinear && freq > 125 || freq > 1e3)) allowedLabels.push("G");
                if (isLog || freq > 4e3 || !isLinear && freq > 500 || (!_radial || isDualVertical) && (!isLinear && freq > 250 || freq > 2e3)) allowedLabels.push("E");
                if (isLinear && freq > 4e3 || (!_radial || isDualVertical) && (isLog || freq > 2e3 || !isLinear && freq > 500)) allowedLabels.push("D", "F", "A", "B");
                if (!allowedLabels.includes(label[0])) continue; // skip this label
            }
            // linear scale
            if (x >= prevX + labelWidthX / 2 && x <= analyzerWidth) {
                _scaleX.fillText(label, isDualHorizontal && _mirror == -1 ? analyzerWidth - x : initialX + x, y, maxW);
                if (isDualHorizontal || _mirror && (x > labelWidthX || _mirror == 1)) _scaleX.fillText(label, isDualHorizontal && _mirror != 1 ? analyzerWidth + x : (initialX || canvas.width) - x, y, maxW);
                prevX = x + Math.min(maxW, _scaleX.measureText(label).width) / 2;
            }
            // radial scale
            if (x >= prevR + labelWidthR && x < analyzerWidth - labelWidthR) {
                radialLabel(isDualHorizontal && _mirror == 1 ? analyzerWidth - x : x, label);
                if (isDualHorizontal || _mirror && (x > labelWidthR || _mirror == 1)) radialLabel(isDualHorizontal && _mirror != -1 ? analyzerWidth + x : -x, label);
                prevR = x;
            }
        }
    }
    /**
	 * Redraw the canvas
	 * this is called 60 times per second by requestAnimationFrame()
	 */ _draw(timestamp) {
        // schedule next canvas update
        this._runId = requestAnimationFrame((timestamp)=>this._draw(timestamp));
        // frame rate control
        const elapsed = timestamp - this._time, frameTime = timestamp - this._last, targetInterval = this._maxFPS ? 975 / this._maxFPS : 0; // small tolerance for best results
        if (frameTime < targetInterval) return;
        this._last = timestamp - (targetInterval ? frameTime % targetInterval : 0); // thanks https://stackoverflow.com/a/19772220/2370385
        this._frames++;
        if (elapsed >= 1000) {
            this._fps = this._frames / elapsed * 1000;
            this._frames = 0;
            this._time = timestamp;
        }
        // initialize local constants
        const { isAlpha: isAlpha, isBands: isBands, isLeds: isLeds, isLumi: isLumi, isOctaves: isOctaves, isOutline: isOutline, isRound: isRound, noLedGap: noLedGap } = this._flg, { analyzerHeight: analyzerHeight, centerX: centerX, centerY: centerY, channelCoords: channelCoords, channelHeight: channelHeight, channelGap: channelGap, initialX: initialX, innerRadius: innerRadius, outerRadius: outerRadius } = this._aux, { _bars: _bars, canvas: canvas, _canvasGradients: _canvasGradients, _chLayout: _chLayout, _colorMode: _colorMode, _ctx: _ctx, _energy: _energy, fillAlpha: fillAlpha, _fps: _fps, _linearAmplitude: _linearAmplitude, _lineWidth: _lineWidth, maxDecibels: maxDecibels, minDecibels: minDecibels, _mirror: _mirror, _mode: _mode, overlay: overlay, _radial: _radial, showBgColor: showBgColor, showPeaks: showPeaks, useCanvas: useCanvas, _weightingFilter: _weightingFilter } = this, canvasX = this._scaleX.canvas, canvasR = this._scaleR.canvas, holdFrames = _fps >> 1, isDualCombined = _chLayout == $66c44939985500ce$var$CHANNEL_COMBINED, isDualHorizontal = _chLayout == $66c44939985500ce$var$CHANNEL_HORIZONTAL, isDualVertical = _chLayout == $66c44939985500ce$var$CHANNEL_VERTICAL, isSingle = _chLayout == $66c44939985500ce$var$CHANNEL_SINGLE, isTrueLeds = isLeds && this._trueLeds && _colorMode == $66c44939985500ce$var$COLOR_GRADIENT, analyzerWidth = _radial ? canvas.width : this._aux.analyzerWidth, finalX = initialX + analyzerWidth, showPeakLine = showPeaks && this._peakLine && _mode == $66c44939985500ce$var$MODE_GRAPH, maxBarHeight = _radial ? outerRadius - innerRadius : analyzerHeight, dbRange = maxDecibels - minDecibels, [ledCount, ledSpaceH, ledSpaceV, ledHeight] = this._leds || [];
        if (_energy.val > 0 && _fps > 0) this._spinAngle += this._spinSpeed * $66c44939985500ce$var$TAU / 60 / _fps; // spinSpeed * angle increment per frame for 1 RPM
        /* HELPER FUNCTIONS */ // create Reflex effect
        const doReflex = (channel)=>{
            if (this._reflexRatio > 0 && !isLumi && !_radial) {
                let posY, height;
                if (this.reflexFit || isDualVertical) {
                    posY = isDualVertical && channel == 0 ? channelHeight + channelGap : 0;
                    height = channelHeight - analyzerHeight;
                } else {
                    posY = canvas.height - analyzerHeight * 2;
                    height = analyzerHeight;
                }
                _ctx.save();
                // set alpha and brightness for the reflection
                _ctx.globalAlpha = this.reflexAlpha;
                if (this.reflexBright != 1) _ctx.filter = `brightness(${this.reflexBright})`;
                // create the reflection
                _ctx.setTransform(1, 0, 0, -1, 0, canvas.height);
                _ctx.drawImage(canvas, 0, channelCoords[channel].channelTop, canvas.width, analyzerHeight, 0, posY, canvas.width, height);
                _ctx.restore();
            }
        };
        // draw scale on X-axis
        const drawScaleX = ()=>{
            if (this.showScaleX) {
                if (_radial) {
                    _ctx.save();
                    _ctx.translate(centerX, centerY);
                    if (this._spinSpeed) _ctx.rotate(this._spinAngle + $66c44939985500ce$var$HALF_PI);
                    _ctx.drawImage(canvasR, -canvasR.width >> 1, -canvasR.width >> 1);
                    _ctx.restore();
                } else _ctx.drawImage(canvasX, 0, canvas.height - canvasX.height);
            }
        };
        // returns the gain (in dB) for a given frequency, considering the currently selected weighting filter
        const weightingdB = (freq)=>{
            const f2 = freq ** 2, SQ20_6 = 424.36, SQ107_7 = 11599.29, SQ158_5 = 25122.25, SQ737_9 = 544496.41, SQ12194 = 148693636, linearTodB = (value)=>20 * Math.log10(value);
            switch(_weightingFilter){
                case $66c44939985500ce$var$FILTER_A:
                    const rA = SQ12194 * f2 ** 2 / ((f2 + SQ20_6) * Math.sqrt((f2 + SQ107_7) * (f2 + SQ737_9)) * (f2 + SQ12194));
                    return 2 + linearTodB(rA);
                case $66c44939985500ce$var$FILTER_B:
                    const rB = SQ12194 * f2 * freq / ((f2 + SQ20_6) * Math.sqrt(f2 + SQ158_5) * (f2 + SQ12194));
                    return .17 + linearTodB(rB);
                case $66c44939985500ce$var$FILTER_C:
                    const rC = SQ12194 * f2 / ((f2 + SQ20_6) * (f2 + SQ12194));
                    return .06 + linearTodB(rC);
                case $66c44939985500ce$var$FILTER_D:
                    const h = ((1037918.48 - f2) ** 2 + 1080768.16 * f2) / ((9837328 - f2) ** 2 + 11723776 * f2), rD = freq / 6.8966888496476e-5 * Math.sqrt(h / ((f2 + 79919.29) * (f2 + 1345600)));
                    return linearTodB(rD);
                case $66c44939985500ce$var$FILTER_468:
                    const h1 = -0.000000000000000000000004737338981378384 * freq ** 6 + 2.043828333606125e-15 * freq ** 4 - 1.363894795463638e-7 * f2 + 1, h2 = 1.306612257412824e-19 * freq ** 5 - 2.118150887518656e-11 * freq ** 3 + 5.559488023498642e-4 * freq, rI = 1.246332637532143e-4 * freq / Math.hypot(h1, h2);
                    return 18.2 + linearTodB(rI);
            }
            return 0; // unknown filter
        };
        // draws (stroke) a bar from x,y1 to x,y2
        const strokeBar = (x, y1, y2)=>{
            _ctx.beginPath();
            _ctx.moveTo(x, y1);
            _ctx.lineTo(x, y2);
            _ctx.stroke();
        };
        // conditionally strokes current path on canvas
        const strokeIf = (flag)=>{
            if (flag && _lineWidth) {
                const alpha = _ctx.globalAlpha;
                _ctx.globalAlpha = 1;
                _ctx.stroke();
                _ctx.globalAlpha = alpha;
            }
        };
        // converts a value in [0;1] range to a height in pixels that fits into the current LED elements
        const ledPosY = (value)=>Math.max(0, (value * ledCount | 0) * (ledHeight + ledSpaceV) - ledSpaceV);
        // update energy information
        const updateEnergy = (newVal)=>{
            _energy.val = newVal;
            if (_energy.peak > 0) {
                _energy.hold--;
                if (_energy.hold < 0) _energy.peak += _energy.hold / (holdFrames * holdFrames / 2);
            }
            if (newVal >= _energy.peak) {
                _energy.peak = newVal;
                _energy.hold = holdFrames;
            }
        };
        /* MAIN FUNCTION */ if (overlay) _ctx.clearRect(0, 0, canvas.width, canvas.height);
        let currentEnergy = 0;
        const nBars = _bars.length, nChannels = isSingle ? 1 : 2;
        for(let channel = 0; channel < nChannels; channel++){
            const { channelTop: channelTop, channelBottom: channelBottom, analyzerBottom: analyzerBottom } = channelCoords[channel], channelGradient = this._gradients[this._selectedGrads[channel]], colorStops = channelGradient.colorStops, colorCount = colorStops.length, bgColor = !showBgColor || isLeds && !overlay ? "#000" : channelGradient.bgColor, radialDirection = isDualVertical && _radial && channel ? -1 : 1, invertedChannel = !channel && _mirror == -1 || channel && _mirror == 1, radialOffsetX = !isDualHorizontal || channel && _mirror != 1 ? 0 : analyzerWidth >> (channel || !invertedChannel), angularDirection = isDualHorizontal && invertedChannel ? -1 : 1; // 1 = clockwise, -1 = counterclockwise
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
*/ // draw scale on Y-axis (uses: channel, channelTop)
            const drawScaleY = ()=>{
                const scaleWidth = canvasX.height, fontSize = scaleWidth >> 1, max = _linearAmplitude ? 100 : maxDecibels, min = _linearAmplitude ? 0 : minDecibels, incr = _linearAmplitude ? 20 : 5, interval = analyzerHeight / (max - min), atStart = _mirror != -1 && (!isDualHorizontal || channel == 0 || _mirror == 1), atEnd = _mirror != 1 && (!isDualHorizontal || channel != _mirror);
                _ctx.save();
                _ctx.fillStyle = $66c44939985500ce$var$SCALEY_LABEL_COLOR;
                _ctx.font = `${fontSize}px ${$66c44939985500ce$var$FONT_FAMILY}`;
                _ctx.textAlign = "right";
                _ctx.lineWidth = 1;
                for(let val = max; val > min; val -= incr){
                    const posY = channelTop + (max - val) * interval, even = val % 2 == 0 | 0;
                    if (even) {
                        const labelY = posY + fontSize * (posY == channelTop ? .8 : .35);
                        if (atStart) _ctx.fillText(val, scaleWidth * .85, labelY);
                        if (atEnd) _ctx.fillText(val, (isDualHorizontal ? analyzerWidth : canvas.width) - scaleWidth * .1, labelY);
                        _ctx.strokeStyle = $66c44939985500ce$var$SCALEY_LABEL_COLOR;
                        _ctx.setLineDash([
                            2,
                            4
                        ]);
                        _ctx.lineDashOffset = 0;
                    } else {
                        _ctx.strokeStyle = $66c44939985500ce$var$SCALEY_MIDLINE_COLOR;
                        _ctx.setLineDash([
                            2,
                            8
                        ]);
                        _ctx.lineDashOffset = 1;
                    }
                    _ctx.beginPath();
                    _ctx.moveTo(initialX + scaleWidth * even * atStart, ~~posY + .5); // for sharp 1px line (https://stackoverflow.com/a/13879402/2370385)
                    _ctx.lineTo(finalX - scaleWidth * even * atEnd, ~~posY + .5);
                    _ctx.stroke();
                }
                _ctx.restore();
            };
            // FFT bin data interpolation (uses fftData)
            const interpolate = (bin, ratio)=>{
                const value = fftData[bin] + (bin < fftData.length - 1 ? (fftData[bin + 1] - fftData[bin]) * ratio : 0);
                return isNaN(value) ? -Infinity : value;
            };
            // converts a given X-coordinate to its corresponding angle in radial mode (uses angularDirection)
            const getAngle = (x, dir = angularDirection)=>dir * $66c44939985500ce$var$TAU * ((x + radialOffsetX) / canvas.width) + this._spinAngle;
            // converts planar X,Y coordinates to radial coordinates (uses: getAngle(), radialDirection)
            const radialXY = (x, y, dir)=>{
                const height = innerRadius + y * radialDirection, angle = getAngle(x, dir);
                return [
                    centerX + height * Math.cos(angle),
                    centerY + height * Math.sin(angle)
                ];
            };
            // draws a polygon of width `w` and height `h` at (x,y) in radial mode (uses: angularDirection, radialDirection)
            const radialPoly = (x, y, w, h, stroke)=>{
                _ctx.beginPath();
                for (const dir of _mirror && !isDualHorizontal ? [
                    1,
                    -1
                ] : [
                    angularDirection
                ]){
                    const [startAngle, endAngle] = isRound ? [
                        getAngle(x, dir),
                        getAngle(x + w, dir)
                    ] : [];
                    _ctx.moveTo(...radialXY(x, y, dir));
                    _ctx.lineTo(...radialXY(x, y + h, dir));
                    if (isRound) _ctx.arc(centerX, centerY, innerRadius + (y + h) * radialDirection, startAngle, endAngle, dir != 1);
                    else _ctx.lineTo(...radialXY(x + w, y + h, dir));
                    _ctx.lineTo(...radialXY(x + w, y, dir));
                    if (isRound && !stroke) _ctx.arc(centerX, centerY, innerRadius + y * radialDirection, endAngle, startAngle, dir == 1);
                }
                strokeIf(stroke);
                _ctx.fill();
            };
            // set fillStyle and strokeStyle according to current colorMode (uses: channel, colorStops, colorCount)
            const setBarColor = (value = 0, barIndex = 0)=>{
                let color;
                // for graph mode, always use the channel gradient (ignore colorMode)
                if (_colorMode == $66c44939985500ce$var$COLOR_GRADIENT && !isTrueLeds || _mode == $66c44939985500ce$var$MODE_GRAPH) color = _canvasGradients[channel];
                else {
                    const selectedIndex = _colorMode == $66c44939985500ce$var$COLOR_BAR_INDEX ? barIndex % colorCount : colorStops.findLastIndex((item)=>isLeds ? ledPosY(value) <= ledPosY(item.level) : value <= item.level);
                    color = colorStops[selectedIndex].color;
                }
                _ctx.fillStyle = _ctx.strokeStyle = color;
            };
            // CHANNEL START
            if (useCanvas) {
                // set transform (horizontal flip and translation) for dual-horizontal layout
                if (isDualHorizontal && !_radial) {
                    const translateX = analyzerWidth * (channel + invertedChannel), flipX = invertedChannel ? -1 : 1;
                    _ctx.setTransform(flipX, 0, 0, 1, translateX, 0);
                }
                // fill the analyzer background if needed (not overlay or overlay + showBgColor)
                if (!overlay || showBgColor) {
                    if (overlay) _ctx.globalAlpha = this.bgAlpha;
                    _ctx.fillStyle = bgColor;
                    // exclude the reflection area when overlay is true and reflexAlpha == 1 (avoids alpha over alpha difference, in case bgAlpha < 1)
                    if (channel == 0 || !_radial && !isDualCombined) _ctx.fillRect(initialX, channelTop - channelGap, analyzerWidth, (overlay && this.reflexAlpha == 1 ? analyzerHeight : channelHeight) + channelGap);
                    _ctx.globalAlpha = 1;
                }
                // draw dB scale (Y-axis) - avoid drawing it twice on 'dual-combined' channel layout
                if (this.showScaleY && !isLumi && !_radial && (channel == 0 || !isDualCombined)) drawScaleY();
                // set line width and dash for LEDs effect
                if (isLeds) {
                    _ctx.setLineDash([
                        ledHeight,
                        ledSpaceV
                    ]);
                    _ctx.lineWidth = _bars[0].width;
                } else _ctx.lineWidth = isOutline ? Math.min(_lineWidth, _bars[0].width / 2) : _lineWidth;
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
            if (_weightingFilter) fftData = fftData.map((val, idx)=>val + weightingdB(this._binToFreq(idx)));
            // start drawing path (for graph mode)
            _ctx.beginPath();
            // store line graph points to create mirror effect in radial mode
            let points = [];
            // draw bars / lines
            for(let barIndex = 0; barIndex < nBars; barIndex++){
                const bar = _bars[barIndex], { posX: posX, barCenter: barCenter, width: width, freq: freq, binLo: binLo, binHi: binHi, ratioLo: ratioLo, ratioHi: ratioHi } = bar;
                let barValue = Math.max(interpolate(binLo, ratioLo), interpolate(binHi, ratioHi));
                // check additional bins (if any) for this bar and keep the highest value
                for(let j = binLo + 1; j < binHi; j++)if (fftData[j] > barValue) barValue = fftData[j];
                // normalize bar amplitude in [0;1] range
                barValue = this._normalizedB(barValue);
                bar.value[channel] = barValue;
                currentEnergy += barValue;
                // update bar peak
                if (bar.peak[channel] > 0) {
                    bar.hold[channel]--;
                    // if hold is negative, it becomes the "acceleration" for peak drop
                    if (bar.hold[channel] < 0) bar.peak[channel] += bar.hold[channel] / (holdFrames * holdFrames / 2);
                }
                // check if it's a new peak for this bar
                if (barValue >= bar.peak[channel]) {
                    bar.peak[channel] = barValue;
                    bar.hold[channel] = holdFrames;
                }
                // if not using the canvas, move earlier to the next bar
                if (!useCanvas) continue;
                // set opacity for bar effects
                if (isLumi || isAlpha) _ctx.globalAlpha = barValue;
                else if (isOutline) _ctx.globalAlpha = fillAlpha;
                // set fillStyle and strokeStyle for the current bar
                setBarColor(barValue, barIndex);
                // compute actual bar height on screen
                const barHeight = isLumi ? maxBarHeight : isLeds ? ledPosY(barValue) : barValue * maxBarHeight | 0;
                // Draw current bar or line segment
                if (_mode == $66c44939985500ce$var$MODE_GRAPH) {
                    // compute the average between the initial bar (barIndex==0) and the next one
                    // used to smooth the curve when the initial posX is off the screen, in mirror and radial modes
                    const nextBarAvg = barIndex ? 0 : (this._normalizedB(fftData[_bars[1].binLo]) * maxBarHeight + barHeight) / 2;
                    if (_radial) {
                        if (barIndex == 0) {
                            if (isDualHorizontal) _ctx.moveTo(...radialXY(0, 0));
                            _ctx.lineTo(...radialXY(0, posX < 0 ? nextBarAvg : barHeight));
                        }
                        // draw line to the current point, avoiding overlapping wrap-around frequencies
                        if (posX >= 0) {
                            const point = [
                                posX,
                                barHeight
                            ];
                            _ctx.lineTo(...radialXY(...point));
                            points.push(point);
                        }
                    } else {
                        if (barIndex == 0) {
                            // start the line off-screen using the previous FFT bin value as the initial amplitude
                            if (_mirror == -1 && !isDualHorizontal) _ctx.moveTo(initialX, analyzerBottom - (posX < initialX ? nextBarAvg : barHeight));
                            else {
                                const prevFFTData = binLo ? this._normalizedB(fftData[binLo - 1]) * maxBarHeight : barHeight; // use previous FFT bin value, when available
                                _ctx.moveTo(initialX - _lineWidth, analyzerBottom - prevFFTData);
                            }
                        }
                        // draw line to the current point
                        // avoid X values lower than the origin when mirroring left, otherwise draw them for best graph accuracy
                        if (isDualHorizontal || _mirror != -1 || posX >= initialX) _ctx.lineTo(posX, analyzerBottom - barHeight);
                    }
                } else {
                    if (isLeds) {
                        // draw "unlit" leds - avoid drawing it twice on 'dual-combined' channel layout
                        if (showBgColor && !overlay && (channel == 0 || !isDualCombined)) {
                            const alpha = _ctx.globalAlpha;
                            _ctx.strokeStyle = $66c44939985500ce$var$LEDS_UNLIT_COLOR;
                            _ctx.globalAlpha = 1;
                            strokeBar(barCenter, channelTop, analyzerBottom);
                            // restore properties
                            _ctx.strokeStyle = _ctx.fillStyle;
                            _ctx.globalAlpha = alpha;
                        }
                        if (isTrueLeds) {
                            // ledPosY() is used below to fit one entire led height into the selected range
                            const colorIndex = isLumi ? 0 : colorStops.findLastIndex((item)=>ledPosY(barValue) <= ledPosY(item.level));
                            let last = analyzerBottom;
                            for(let i = colorCount - 1; i >= colorIndex; i--){
                                _ctx.strokeStyle = colorStops[i].color;
                                let y = analyzerBottom - (i == colorIndex ? barHeight : ledPosY(colorStops[i].level));
                                strokeBar(barCenter, last, y);
                                last = y - ledSpaceV;
                            }
                        } else strokeBar(barCenter, analyzerBottom, analyzerBottom - barHeight);
                    } else if (posX >= initialX) {
                        if (_radial) radialPoly(posX, 0, width, barHeight, isOutline);
                        else if (isRound) {
                            const halfWidth = width / 2, y = analyzerBottom + halfWidth; // round caps have an additional height of half bar width
                            _ctx.beginPath();
                            _ctx.moveTo(posX, y);
                            _ctx.lineTo(posX, y - barHeight);
                            _ctx.arc(barCenter, y - barHeight, halfWidth, $66c44939985500ce$var$PI, $66c44939985500ce$var$TAU);
                            _ctx.lineTo(posX + width, y);
                            strokeIf(isOutline);
                            _ctx.fill();
                        } else {
                            const offset = isOutline ? _ctx.lineWidth : 0;
                            _ctx.beginPath();
                            _ctx.rect(posX, analyzerBottom + offset, width, -barHeight - offset);
                            strokeIf(isOutline);
                            _ctx.fill();
                        }
                    }
                }
                // Draw peak
                const peak = bar.peak[channel];
                if (peak > 0 && showPeaks && !showPeakLine && !isLumi && posX >= initialX && posX < finalX) {
                    // set opacity
                    if (isOutline && _lineWidth > 0) _ctx.globalAlpha = 1;
                    else if (isAlpha) _ctx.globalAlpha = peak;
                    // select the peak color for 'bar-level' colorMode or 'trueLeds'
                    if (_colorMode == $66c44939985500ce$var$COLOR_BAR_LEVEL || isTrueLeds) setBarColor(peak);
                    // render peak according to current mode / effect
                    if (isLeds) {
                        const ledPeak = ledPosY(peak);
                        if (ledPeak >= ledSpaceV) _ctx.fillRect(posX, analyzerBottom - ledPeak, width, ledHeight);
                    } else if (!_radial) _ctx.fillRect(posX, analyzerBottom - peak * maxBarHeight, width, 2);
                    else if (_mode != $66c44939985500ce$var$MODE_GRAPH) {
                        const y = peak * maxBarHeight;
                        radialPoly(posX, y, width, !this._radialInvert || isDualVertical || y + innerRadius >= 2 ? -2 : 2);
                    }
                }
            } // for ( let barIndex = 0; barIndex < nBars; barIndex++ )
            // if not using the canvas, move earlier to the next channel
            if (!useCanvas) continue;
            // restore global alpha
            _ctx.globalAlpha = 1;
            // Fill/stroke drawing path for graph mode
            if (_mode == $66c44939985500ce$var$MODE_GRAPH) {
                setBarColor(); // select channel gradient
                if (_radial && !isDualHorizontal) {
                    if (_mirror) {
                        let p;
                        while(p = points.pop())_ctx.lineTo(...radialXY(...p, -1));
                    }
                    _ctx.closePath();
                }
                if (_lineWidth > 0) _ctx.stroke();
                if (fillAlpha > 0) {
                    if (_radial) {
                        // exclude the center circle from the fill area
                        const start = isDualHorizontal ? getAngle(analyzerWidth >> 1) : 0, end = isDualHorizontal ? getAngle(analyzerWidth) : $66c44939985500ce$var$TAU;
                        _ctx.moveTo(...radialXY(isDualHorizontal ? analyzerWidth >> 1 : 0, 0));
                        _ctx.arc(centerX, centerY, innerRadius, start, end, isDualHorizontal ? !invertedChannel : true);
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
                if (showPeakLine || _radial && showPeaks) {
                    points = []; // for mirror line on radial
                    _ctx.beginPath();
                    _bars.forEach((b, i)=>{
                        let x = b.posX, h = b.peak[channel], m = i ? "lineTo" : "moveTo";
                        if (_radial && x < 0) {
                            const nextBar = _bars[i + 1];
                            h = $66c44939985500ce$var$findY(x, h, nextBar.posX, nextBar.peak[channel], 0);
                            x = 0;
                        }
                        h *= maxBarHeight;
                        if (showPeakLine) {
                            _ctx[m](..._radial ? radialXY(x, h) : [
                                x,
                                analyzerBottom - h
                            ]);
                            if (_radial && _mirror && !isDualHorizontal) points.push([
                                x,
                                h
                            ]);
                        } else if (h > 0) radialPoly(x, h, 1, -2); // standard peaks (also does mirror)
                    });
                    if (showPeakLine) {
                        let p;
                        while(p = points.pop())_ctx.lineTo(...radialXY(...p, -1)); // mirror line points
                        _ctx.lineWidth = 1;
                        _ctx.stroke(); // stroke peak line
                    }
                }
            }
            _ctx.restore(); // restore clip region
            if (isDualHorizontal && !_radial) _ctx.setTransform(1, 0, 0, 1, 0, 0);
            // create Reflex effect - for dual-combined and dual-horizontal do it only once, after channel 1
            if (!isDualHorizontal && !isDualCombined || channel) doReflex(channel);
        } // for ( let channel = 0; channel < nChannels; channel++ ) {
        updateEnergy(currentEnergy / (nBars << nChannels - 1));
        if (useCanvas) {
            // Mirror effect
            if (_mirror && !_radial && !isDualHorizontal) {
                _ctx.setTransform(-1, 0, 0, 1, canvas.width - initialX, 0);
                _ctx.drawImage(canvas, initialX, 0, centerX, canvas.height, 0, 0, centerX, canvas.height);
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
            _ctx.font = `bold ${size}px ${$66c44939985500ce$var$FONT_FAMILY}`;
            _ctx.fillStyle = $66c44939985500ce$var$FPS_COLOR;
            _ctx.textAlign = "right";
            _ctx.fillText(Math.round(_fps), canvas.width - size, size * 2);
        }
        // call callback function, if defined
        if (this.onCanvasDraw) {
            _ctx.save();
            _ctx.fillStyle = _ctx.strokeStyle = _canvasGradients[0];
            this.onCanvasDraw(this, {
                timestamp: timestamp,
                canvasGradients: _canvasGradients
            });
            _ctx.restore();
        }
    }
    /**
	 * Return scaled frequency according to the selected scale
	 */ _freqScaling(freq) {
        switch(this._frequencyScale){
            case $66c44939985500ce$var$SCALE_LOG:
                return Math.log2(freq);
            case $66c44939985500ce$var$SCALE_BARK:
                return 26.81 * freq / (1960 + freq) - .53;
            case $66c44939985500ce$var$SCALE_MEL:
                return Math.log2(1 + freq / 700);
            case $66c44939985500ce$var$SCALE_LINEAR:
                return freq;
        }
    }
    /**
	 * Return the FFT data bin (array index) which represents a given frequency
	 */ _freqToBin(freq, method = "round") {
        const max = this._analyzer[0].frequencyBinCount - 1, bin = Math[method](freq * this.fftSize / this.audioCtx.sampleRate);
        return bin < max ? bin : max;
    }
    /**
	 * Generate currently selected gradient
	 */ _makeGrad() {
        if (!this._ready) return;
        const { canvas: canvas, _ctx: _ctx, _radial: _radial, _reflexRatio: _reflexRatio } = this, { analyzerWidth: analyzerWidth, centerX: centerX, centerY: centerY, initialX: initialX, innerRadius: innerRadius, outerRadius: outerRadius } = this._aux, { isLumi: isLumi } = this._flg, isDualVertical = this._chLayout == $66c44939985500ce$var$CHANNEL_VERTICAL, analyzerRatio = 1 - _reflexRatio, gradientHeight = isLumi ? canvas.height : canvas.height * (1 - _reflexRatio * !isDualVertical) | 0;
        // for vertical stereo we keep the full canvas height and handle the reflex areas while generating the color stops
        for (const channel of [
            0,
            1
        ]){
            const currGradient = this._gradients[this._selectedGrads[channel]], colorStops = currGradient.colorStops, isHorizontal = currGradient.dir == "h";
            let grad;
            if (_radial) grad = _ctx.createRadialGradient(centerX, centerY, outerRadius, centerX, centerY, innerRadius - (outerRadius - innerRadius) * isDualVertical);
            else grad = _ctx.createLinearGradient(...isHorizontal ? [
                initialX,
                0,
                initialX + analyzerWidth,
                0
            ] : [
                0,
                0,
                0,
                gradientHeight
            ]);
            if (colorStops) {
                const dual = isDualVertical && !this._splitGradient && (!isHorizontal || _radial);
                for(let channelArea = 0; channelArea < 1 + dual; channelArea++){
                    const maxIndex = colorStops.length - 1;
                    colorStops.forEach((colorStop, index)=>{
                        let offset = colorStop.pos;
                        // in dual mode (not split), use half the original offset for each channel
                        if (dual) offset /= 2;
                        // constrain the offset within the useful analyzer areas (avoid reflex areas)
                        if (isDualVertical && !isLumi && !_radial && !isHorizontal) {
                            offset *= analyzerRatio;
                            // skip the first reflex area in split mode
                            if (!dual && offset > .5 * analyzerRatio) offset += .5 * _reflexRatio;
                        }
                        // only for dual-vertical non-split gradient (creates full gradient on both halves of the canvas)
                        if (channelArea == 1) {
                            // add colors in reverse order if radial or lumi are active
                            if (_radial || isLumi) {
                                const revIndex = maxIndex - index;
                                colorStop = colorStops[revIndex];
                                offset = 1 - colorStop.pos / 2;
                            } else {
                                // if the first offset is not 0, create an additional color stop to prevent bleeding from the first channel
                                if (index == 0 && offset > 0) grad.addColorStop(.5, colorStop.color);
                                // bump the offset to the second half of the gradient
                                offset += .5;
                            }
                        }
                        // add gradient color stop
                        grad.addColorStop(offset, colorStop.color);
                        // create additional color stop at the end of first channel to prevent bleeding
                        if (isDualVertical && index == maxIndex && offset < .5) grad.addColorStop(.5, colorStop.color);
                    });
                } // for ( let channelArea = 0; channelArea < 1 + dual; channelArea++ )
            }
            this._canvasGradients[channel] = grad;
        } // for ( const channel of [0,1] )
    }
    /**
	 * Normalize a dB value in the [0;1] range
	 */ _normalizedB(value) {
        const isLinear = this._linearAmplitude, boost = isLinear ? 1 / this._linearBoost : 1, clamp = (val, min, max)=>val <= min ? min : val >= max ? max : val, dBToLinear = (val)=>10 ** (val / 20);
        let maxValue = this.maxDecibels, minValue = this.minDecibels;
        if (isLinear) {
            maxValue = dBToLinear(maxValue);
            minValue = dBToLinear(minValue);
            value = dBToLinear(value) ** boost;
        }
        return clamp((value - minValue) / (maxValue - minValue) ** boost, 0, 1);
    }
    /**
	 * Internal function to change canvas dimensions on demand
	 */ _setCanvas(reason) {
        if (!this._ready) return;
        const { canvas: canvas, _ctx: _ctx } = this, canvasX = this._scaleX.canvas, pixelRatio = window.devicePixelRatio / (this._loRes + 1);
        let screenWidth = window.screen.width * pixelRatio, screenHeight = window.screen.height * pixelRatio;
        // Fix for iOS Safari - swap width and height when in landscape
        if (Math.abs(window.orientation) == 90 && screenWidth < screenHeight) [screenWidth, screenHeight] = [
            screenHeight,
            screenWidth
        ];
        const isFullscreen = this.isFullscreen, isCanvasFs = isFullscreen && this._fsEl == canvas, newWidth = isCanvasFs ? screenWidth : (this._width || this._container.clientWidth || this._defaultWidth) * pixelRatio | 0, newHeight = isCanvasFs ? screenHeight : (this._height || this._container.clientHeight || this._defaultHeight) * pixelRatio | 0;
        // set/update object properties
        this._pixelRatio = pixelRatio;
        this._fsWidth = screenWidth;
        this._fsHeight = screenHeight;
        // if this is not the constructor call and canvas dimensions haven't changed, quit
        if (reason != $66c44939985500ce$var$REASON_CREATE && canvas.width == newWidth && canvas.height == newHeight) return;
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
        canvasX.height = Math.max(20 * pixelRatio, Math.min(newWidth, newHeight) / 32 | 0);
        // calculate bar positions and led options
        this._calcBars();
        // (re)generate gradient
        this._makeGrad();
        // detect fullscreen changes (for Safari)
        if (this._fsStatus !== undefined && this._fsStatus !== isFullscreen) reason = $66c44939985500ce$var$REASON_FSCHANGE;
        this._fsStatus = isFullscreen;
        // call the callback function, if defined
        if (this.onCanvasResize) this.onCanvasResize(reason, this);
    }
    /**
	 * Select a gradient for one or both channels
	 *
	 * @param {string} name gradient name
	 * @param [{number}] desired channel (0 or 1) - if empty or invalid, sets both channels
	 */ _setGradient(name, channel) {
        if (!this._gradients.hasOwnProperty(name)) throw new $66c44939985500ce$var$AudioMotionError($66c44939985500ce$var$ERR_UNKNOWN_GRADIENT, name);
        if (![
            0,
            1
        ].includes(channel)) {
            this._selectedGrads[1] = name;
            channel = 0;
        }
        this._selectedGrads[channel] = name;
        this._makeGrad();
    }
    /**
	 * Set object properties
	 */ _setProps(options, useDefaults) {
        // callback functions properties
        const callbacks = [
            "onCanvasDraw",
            "onCanvasResize"
        ];
        // properties not in the defaults (`stereo` is deprecated)
        const extraProps = [
            "gradientLeft",
            "gradientRight",
            "stereo"
        ];
        // build an array of valid properties; `start` is not an actual property and is handled after setting everything else
        const validProps = Object.keys($66c44939985500ce$var$DEFAULT_SETTINGS).filter((e)=>e != "start").concat(callbacks, extraProps);
        if (useDefaults || options === undefined) options = {
            ...$66c44939985500ce$var$DEFAULT_SETTINGS,
            ...options
        }; // merge options with defaults
        for (const prop of Object.keys(options)){
            if (callbacks.includes(prop) && typeof options[prop] !== "function") this[prop] = undefined;
            else if (validProps.includes(prop)) this[prop] = options[prop];
        }
        // deprecated - move this to the constructor in the next major release (`start` should be constructor-specific)
        if (options.start !== undefined) this.toggleAnalyzer(options.start);
    }
}


export {$66c44939985500ce$export$2e2bcd8739ae039 as default};
