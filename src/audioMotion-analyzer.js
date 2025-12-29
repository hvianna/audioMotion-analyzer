/**!
 * audioMotion-analyzer
 * High-resolution real-time graphic audio spectrum analyzer JS module
 *
 * @version 5.0.0-alpha
 * @author  Henrique Avila Vianna <hvianna@gmail.com> <https://henriquevianna.com>
 * @license AGPL-3.0-or-later
 */

const VERSION = '5.0.0-alpha';

// internal constants
const PI      = Math.PI,
	  TAU     = 2 * PI,
	  HALF_PI = PI / 2,
	  C_1     = 8.17579892;  // frequency for C -1

const DEBOUNCE_TIMEOUT         = 60,
	  EVENT_CLICK              = 'click',
	  EVENT_FULLSCREENCHANGE   = 'fullscreenchange',
	  EVENT_RESIZE             = 'resize',
	  FONT_FAMILY              = 'sans-serif',
	  FPS_COLOR                = '#0f0',
	  LED_MASK_ALPHA           = .2, // .5 ?
	  LED_MASK_COLOR           = '#7f7f7f22',
	  LED_MASK_LIGHTNESS       = 20, // TO-DO: use this instead of alpha?? (clean-up)
	  LED_MASK_SATURATION      = 20, // 40 ?
	  LED_PARAMETERS           = [ 6, 7 ],
	  MIN_AXIS_DIMENSION       = 20;

// exported constants
export const BANDS_FFT                 = 0,
			 BANDS_OCTAVE_FULL         = 1,
			 BANDS_OCTAVE_HALF         = 2,
			 BANDS_OCTAVE_3RD          = 3,
			 BANDS_OCTAVE_4TH          = 4,
			 BANDS_OCTAVE_6TH          = 5,
			 BANDS_OCTAVE_8TH          = 6,
			 BANDS_OCTAVE_12TH         = 7,
			 BANDS_OCTAVE_24TH         = 8,
			 COLORMODE_GRADIENT        = 'gradient',
			 COLORMODE_INDEX           = 'bar-index',
			 COLORMODE_LEVEL           = 'bar-level',
			 ENERGY_BASS               = 'bass',
			 ENERGY_HIGHMID            = 'highMid',
			 ENERGY_LOWMID             = 'lowMid',
			 ENERGY_MIDRANGE           = 'mid',
			 ENERGY_PEAK               = 'peak',
			 ENERGY_TREBLE             = 'treble',
			 ERR_AUDIO_CONTEXT_FAIL    = 1,
			 ERR_INVALID_AUDIO_CONTEXT = 2,
			 ERR_INVALID_AUDIO_SOURCE  = 3,
			 FILTER_NONE               = '',
			 FILTER_A                  = 'A',
			 FILTER_B                  = 'B',
			 FILTER_C                  = 'C',
			 FILTER_D                  = 'D',
			 FILTER_468                = '468',
			 LAYOUT_COMBINED           = 'dual-combined',
			 LAYOUT_HORIZONTAL         = 'dual-horizontal',
			 LAYOUT_SINGLE             = 'single',
			 LAYOUT_VERTICAL           = 'dual-vertical',
			 MODE_BARS                 = 'bars',
			 MODE_GRAPH                = 'graph',
			 REASON_CREATE             = 'create',
			 REASON_FULLSCREENCHANGE   = EVENT_FULLSCREENCHANGE,
			 REASON_LORES              = 'lores',
			 REASON_RESIZE             = EVENT_RESIZE,
			 REASON_USER               = 'user',
			 SCALE_BARK                = 'bark',
			 SCALE_LINEAR              = 'linear',
			 SCALE_LOG                 = 'log',
			 SCALE_MEL                 = 'mel';

// built-in color themes
const PRISM = [ '#a35', '#c66', '#e94', '#ed0', '#9d5', '#4d8', '#2cb', '#0bc', '#09c', '#36b' ],
	  THEMES = [
	  [ 'classic', {
			colorStops: [
				'red',
				{ color: 'yellow', level: .9, pos: .6 },
				{ color: 'lime', level: .6 }
			]
	  }],
	  [ 'mono', {
	  		colorStops: [ '#eee' ],
	  		peakColor: 'red'
	  }],
	  [ 'prism', {
			colorStops: PRISM
	  }],
	  [ 'rainbow', {
			colorStops: [ '#817', ...PRISM, '#639' ]
	  }],
	  [ 'orangered', {
	  		colorStops: [ 'OrangeRed' ]
	  }],
	  [ 'steelblue', {
	  		colorStops: [ 'SteelBlue' ]
	  }]
];

// settings defaults
const DEFAULT_SETTINGS = {
	alphaBars      : false,
	ansiBands      : false,
	bandResolution : BANDS_FFT,
	barSpace       : 0.1,
	channelLayout  : LAYOUT_SINGLE,
	colorMode      : COLORMODE_GRADIENT,
	fadePeaks      : false,
	fftSize        : 8192,
	fillAlpha      : 1,
	frequencyScale : SCALE_LOG,
	height         : undefined,
	ledBars        : false,
	linearAmplitude: false,
	linearBoost    : 1,
	lineWidth      : 0,
	loRes          : false,
	lumiBars       : false,
	maxDecibels    : -25,
	maxFPS         : 0,
	maxFreq        : 22000,
	minDecibels    : -85,
	minFreq        : 20,
	mirror         : 0,
	mode           : MODE_BARS,
	noteLabels     : false,
	outlineBars    : false,
	peakDecayTime  : 750,
	peakHoldTime   : 500,
	peakLine       : false,
	radial		   : false,
	radialInvert   : false,
	radius         : 0.3,
	reflexAlpha    : 0.15,
	reflexBright   : 1,
	reflexFit      : true,
	reflexRatio    : 0,
	roundBars      : false,
	showFPS        : false,
	showLedMask    : true,
	showPeaks      : true,
	showScaleX     : true,
	showScaleY     : false,
	smoothing      : 0.5,
	spinSpeed      : 0,
	spreadGradient : false,
	trueLeds       : false,
	useCanvas      : true,
	volume         : 1,
	weightingFilter: FILTER_NONE,
	width          : undefined
};

const DEFAULT_THEME_MODIFIERS = {
	horizontal: false,
	reverse: false
};

// custom error messages
const ERROR_MESSAGE = {
	[ ERR_AUDIO_CONTEXT_FAIL ]:    'Could not create audio context. Web Audio API not supported?',
	[ ERR_INVALID_AUDIO_CONTEXT ]: 'Provided audio context is not valid',
	[ ERR_INVALID_AUDIO_SOURCE ]:  'Audio source must be an instance of HTMLMediaElement or AudioNode'
};

class AudioMotionError extends Error {
	constructor( code, value ) {
		super( ERROR_MESSAGE[ code ] + ( value !== undefined ? `: ${value}` : '' ) );
		this.name = 'AudioMotionError';
		this.code = code;
	}
}

/* helper functions */

// clamp a given value between `min` and `max`
const clamp = ( val, min, max ) => val <= min ? min : val >= max ? max : val; // TO-DO: handle +val == NaN

// convert any CSS color format to HSL format
const cssColorToHSL = color => {
	const ctx = document.createElement('canvas').getContext('2d'); // use a canvas to convert any CSS color to RGB format
	ctx.fillStyle = color;

	const computedColor = ctx.fillStyle, // hex string (#ffffff) - TO-DO: if original color has alpha channel this will be in rgba() format
		  [ r, g, b ]   = computedColor.match( /[^#]{2}/g ).map( n => parseInt( n, 16 ) / 255 ),
		  max           = Math.max( r, g, b ),
		  min           = Math.min( r, g, b );

	let h, s, l = ( max + min ) / 2;

	if ( max === min )
		h = s = 0; // achromatic
	else {
		const d = max - min;
		s = l > 0.5 ? d / ( 2 - max - min ) : d / ( max + min );
		switch ( max ) {
			case r: h = ( ( g - b ) / d + ( g < b ? 6 : 0 ) ); break;
			case g: h = ( ( b - r ) / d + 2 ); break;
			case b: h = ( ( r - g ) / d + 4 );
		}
		h *= 60;
	}

	return [ h, Math.round( s * 100 ), Math.round( l * 100 ) ];
}

// deep clone object
const deepCloneObject = obj => JSON.parse( JSON.stringify( obj ) );

// output deprecation warning message on console
const deprecate = ( name, alternative ) => console.warn( `${name} is deprecated. Use ${alternative} instead.` );

// find the Y-coordinate of a point located between two other points, given its X-coordinate
const findY = ( x1, y1, x2, y2, x ) => y1 + ( y2 - y1 ) * ( x - x1 ) / ( x2 - x1 );

// shorthand for Array.isArray()
const { isArray } = Array;

// check if a given object is empty (also returns `true` on null, undefined or any non-object value)
const isEmpty = obj => {
	for ( const p in obj )
		return false;
	return true;
}

// check if given value is numeric
const isNumeric = val => ! isArray( val ) && val == +val; // note: +[] == []

// check if given value is an object (not null or array, which are also considered objects)
const isObject = val => typeof val == 'object' && !! val && ! isArray( val );

// check if given value is a valid channel number
const isValidChannel = channel => isNumeric( channel ) && [0,1].includes( +channel );

// validate a given value with an array of strings (by default, all lowercase)
// returns the validated value, or the first element of `list` if `value` is not found in the array
const validateFromList = ( value, list, modifier = 'toLowerCase' ) => list[ Math.max( 0, list.indexOf( ( '' + value )[ modifier ]() ) ) ];

// returns an array with the given channel number if valid, or [0,1] otherwise
const validateChannelArray = channel => isValidChannel( channel ) ? [ +channel ] : [0,1];

// output invalid value warning message on console
const warnInvalid = ( name, value ) => console.warn( `${name}: ignoring invalid value (${value})` );

// Polyfill for Array.findLastIndex()
if ( ! Array.prototype.findLastIndex ) {
	Array.prototype.findLastIndex = function( callback ) {
		let index = this.length;
		while ( index-- > 0 ) {
			if ( callback( this[ index ] ) )
				return index;
		}
		return -1;
	}
}

/* *********************************** class AudioMotionAnalyzer ************************************ */

class AudioMotionAnalyzer {

/**
 * CONSTRUCTOR
 *
 * @param {object} [container] DOM element where to insert the analyzer; if undefined, uses the document body
 * @param {object} [options]
 * @returns {object} AudioMotionAnalyzer object
 */
	constructor( container, options = {} ) {

		this._ready = false;

		// Initialize internal objects
		this._aux = {};				// auxiliary variables
		this._activeThemes = [];	// currently active themes for channels 0 and 1 (refer to _makeGrad() for object structure)
		this._bars = [];
		this._destroyed = false;
		this._energy = { val: 0, peak: 0, hold: 0 };
		this._flg = {};				// flags
		this._fps = 0;
		this._last = 0;				// timestamp of last rendered frame
		this._leds = [];			// current led attributes: ledCount, ledHeight, ledGap
		this._outNodes = [];		// output nodes
		this._ownContext = false;
		this._sources = [];			// input nodes
		this._themes = {}; 			// registered color themes
		this._xAxis = {};			// X-axis label parameters
		this._yAxis = {};			// Y-axis label parameters

		// Check if options object passed as first argument
		if ( ! ( container instanceof Element ) ) {
			if ( isEmpty( options ) && ! isEmpty( container ) )
				options = container;
			container = null;
		}

		this._ownCanvas = ! ( options.canvas instanceof HTMLCanvasElement );

		// Create a new canvas or use the one provided by the user
		const canvas = this._ownCanvas ? document.createElement('canvas') : options.canvas;
		canvas.style = 'max-width: 100%;';
		this._ctx = canvas.getContext('2d');

		// Register built-in color themes
		for ( const [ name, options ] of THEMES )
			this.registerTheme( name, options );

		// Set container
		this._container = container || ( ! this._ownCanvas && canvas.parentElement ) || document.body;

		// Make sure we have minimal width and height dimensions in case of an inline container
		this._defaultWidth  = this._container.clientWidth  || 640;
		this._defaultHeight = this._container.clientHeight || 270;

		// Use audio context provided by user, or create a new one

		let audioCtx;

		if ( options.source && ( audioCtx = options.source.context ) ) {
			// get audioContext from provided source audioNode
		}
		else if ( audioCtx = options.audioCtx ) {
			// use audioContext provided by user
		}
		else {
			try {
				audioCtx = new ( window.AudioContext || window.webkitAudioContext )();
				this._ownContext = true;
			}
			catch( err ) {
				throw new AudioMotionError( ERR_AUDIO_CONTEXT_FAIL );
			}
		}

		// make sure audioContext is valid
		if ( ! audioCtx.createGain )
			throw new AudioMotionError( ERR_INVALID_AUDIO_CONTEXT );

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
		const analyzer = this._analyzer = [ audioCtx.createAnalyser(), audioCtx.createAnalyser() ];
		const splitter = this._splitter = audioCtx.createChannelSplitter(2);
 		const merger   = this._merger   = audioCtx.createChannelMerger(2);
 		this._input    = audioCtx.createGain();
 		this._output   = audioCtx.createGain();

 		// connect audio source if provided in the options
		if ( options.source )
			this.connectInput( options.source );

 		// connect splitter -> analyzers
 		for ( const i of [0,1] )
			splitter.connect( analyzer[ i ], i );

		// connect merger -> output
		merger.connect( this._output );

		// connect output -> destination (speakers)
		if ( options.connectSpeakers !== false )
			this.connectOutput();

		// create auxiliary canvases for the X-axis and radial scale labels
		for ( const ctx of [ '_scaleX', '_scaleR' ] )
			this[ ctx ] = document.createElement('canvas').getContext('2d');

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
			if ( ! this._fsTimeout ) {
				// delay the resize to prioritize a possible following `fullscreenchange` event
				this._fsTimeout = window.setTimeout( () => {
					if ( ! this._fsChanging ) {
						this._setCanvas( REASON_RESIZE );
						this._fsTimeout = 0;
					}
				}, DEBOUNCE_TIMEOUT );
			}
		}

		// if browser supports ResizeObserver, listen for resize on the container
		if ( window.ResizeObserver ) {
			this._observer = new ResizeObserver( onResize );
			this._observer.observe( this._container );
		}

		// create an AbortController to remove event listeners on destroy()
		this._controller = new AbortController();
		const signal = this._controller.signal;

		// listen for resize events on the window - required for fullscreen on iPadOS
		window.addEventListener( EVENT_RESIZE, onResize, { signal } );

		// listen for fullscreenchange events on the canvas - not available on Safari
		canvas.addEventListener( EVENT_FULLSCREENCHANGE, () => {
			// set flag to indicate a fullscreen change in progress
			this._fsChanging = true;

			// if there is a scheduled resize event, clear it
			if ( this._fsTimeout )
				window.clearTimeout( this._fsTimeout );

			// update the canvas
			this._setCanvas( REASON_FULLSCREENCHANGE );

			// delay clearing the flag to prevent any shortly following resize event
			this._fsTimeout = window.setTimeout( () => {
				this._fsChanging = false;
				this._fsTimeout = 0;
			}, DEBOUNCE_TIMEOUT );
		}, { signal } );

		// Resume audio context if in suspended state (browsers' autoplay policy)
		const unlockContext = () => {
			if ( audioCtx.state == 'suspended' )
				audioCtx.resume().then( () => window.removeEventListener( EVENT_CLICK, unlockContext ) );
		}
		window.addEventListener( EVENT_CLICK, unlockContext );

		// reset FPS-related variables when window becomes visible (avoid FPS drop due to frames not rendered while hidden)
		document.addEventListener( 'visibilitychange', () => {
			if ( document.visibilityState != 'hidden' ) {
				this._frames = 0;
				this._time = performance.now();
			}
		}, { signal } );

		// Set default parameters for X- and Y-axis labels
		this.setXAxis();
		this.setYAxis();

		// Set configuration options and use defaults for any missing properties
		this._setProps( options, true );
		this.setTheme();

		// Start the analyzer, unless `start` is explicitly set to false in the options
		this.toggleAnalyzer( options.start !== false );

		// Add canvas to the container (only when canvas not provided by user)
		if ( this.useCanvas && this._ownCanvas )
			this._container.appendChild( canvas );

		// Finish canvas setup
		this._ready = true;
		this._setCanvas( REASON_CREATE );
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
	set alphaBars( value ) {
		this._alphaBars = !! value;
		this._calcBars();
	}

	get ansiBands() {
		return this._ansiBands;
	}
	set ansiBands( value ) {
		this._ansiBands = !! value;
		this._calcBars();
	}

	get bandResolution() {
		return this._bandRes;
	}
	set bandResolution( value ) {
		this._bandRes = clamp( value | 0, 0, 8 );
		this._calcBars();
	}

	get barSpace() {
		return this._barSpace;
	}
	set barSpace( value ) {
		this._barSpace = +value || 0;
		this._calcBars();
	}

	get channelLayout() {
		return this._chLayout;
	}
	set channelLayout( value ) {
		this._chLayout = validateFromList( value, [ LAYOUT_SINGLE, LAYOUT_HORIZONTAL, LAYOUT_VERTICAL, LAYOUT_COMBINED ] );

		// update node connections
		this._input.disconnect();
		this._input.connect( this._chLayout != LAYOUT_SINGLE ? this._splitter : this._analyzer[0] );
		this._analyzer[0].disconnect();
		if ( this._outNodes.length ) // connect analyzer only if the output is connected to other nodes
			this._analyzer[0].connect( this._chLayout != LAYOUT_SINGLE ? this._merger : this._output );

		this._calcBars();
		this._makeGrad();
	}

	get colorMode() {
		return this._colorMode;
	}
	set colorMode( value ) {
		this._colorMode = validateFromList( value, [ COLORMODE_GRADIENT, COLORMODE_INDEX, COLORMODE_LEVEL ] );
	}

	get fadePeaks() {
		return this._fadePeaks;
	}
	set fadePeaks( value ) {
		this._fadePeaks = !! value;
	}

	get fftSize() {
		return this._analyzer[0].fftSize;
	}
	set fftSize( value ) {
		for ( const i of [0,1] )
			this._analyzer[ i ].fftSize = value;
		const binCount = this._analyzer[0].frequencyBinCount;
		this._fftData = [ new Float32Array( binCount ), new Float32Array( binCount ) ];
		this._calcBars();
	}

	get frequencyScale() {
		return this._frequencyScale;
	}
	set frequencyScale( value ) {
		this._frequencyScale = validateFromList( value, [ SCALE_LOG, SCALE_BARK, SCALE_MEL, SCALE_LINEAR ] );
		this._calcBars();
	}

	get height() {
		return this._height;
	}
	set height( h ) {
		this._height = h;
		this._setCanvas( REASON_USER );
	}

	get ledBars() {
		return this._showLeds;
	}
	set ledBars( value ) {
		this._showLeds = !! value;
		this._calcBars();
	}

	get linearAmplitude() {
		return this._linearAmplitude;
	}
	set linearAmplitude( value ) {
		this._linearAmplitude = !! value;
	}

	get linearBoost() {
		return this._linearBoost;
	}
	set linearBoost( value ) {
		this._linearBoost = value >= 1 ? +value : 1;
	}

	get lineWidth() {
		return this._lineWidth;
	}
	set lineWidth( value ) {
		this._lineWidth = +value || 0;
	}

	get loRes() {
		return this._loRes;
	}
	set loRes( value ) {
		this._loRes = !! value;
		this._setCanvas( REASON_LORES );
	}

	get lumiBars() {
		return this._lumiBars;
	}
	set lumiBars( value ) {
		this._lumiBars = !! value;
		this._calcBars();
		this._makeGrad();
	}

	get maxDecibels() {
		return this._analyzer[0].maxDecibels;
	}
	set maxDecibels( value ) {
		for ( const i of [0,1] )
			this._analyzer[ i ].maxDecibels = value;
	}

	get maxFPS() {
		return this._maxFPS;
	}
	set maxFPS( value ) {
		this._maxFPS = value < 0 ? 0 : +value || 0;
	}

	get maxFreq() {
		return this._maxFreq;
	}
	set maxFreq( value ) {
		if ( ! ( value > 0 ) ) { // should catch all 'falsy' and negative values (`value <= 0` would fail on NaN or undefined)
			warnInvalid( 'maxFreq', value );
			value = this._maxFreq || DEFAULT_SETTINGS.maxFreq; // keep previous value, if any
		}

		this._maxFreq = Math.min( value, this.audioCtx.sampleRate / 2 );
		this._calcBars();
	}

	get minDecibels() {
		return this._analyzer[0].minDecibels;
	}
	set minDecibels( value ) {
		for ( const i of [0,1] )
			this._analyzer[ i ].minDecibels = value;
	}

	get minFreq() {
		return this._minFreq;
	}
	set minFreq( value ) {
		if ( ! ( value > 0 ) ) { // should catch all 'falsy' and negative values (`value <= 0` would fail on NaN or undefined)
			warnInvalid( 'minFreq', value );
			value = this._minFreq || DEFAULT_SETTINGS.minFreq;
		}

		this._minFreq = +value;
		this._calcBars();
	}

	get mirror() {
		return this._mirror;
	}
	set mirror( value ) {
		this._mirror = Math.sign( value ) | 0; // ensure only -1, 0 or 1
		this._calcBars();
		this._makeGrad();
	}

	get mode() {
		return this._mode;
	}
	set mode( value ) {
		this._mode = validateFromList( value, [ MODE_BARS, MODE_GRAPH ] );
		this._calcBars();
		this._makeGrad();
	}

	get noteLabels() {
		return this._noteLabels;
	}
	set noteLabels( value ) {
		this._noteLabels = !! value;
		this._createScales();
	}

	get outlineBars() {
		return this._outlineBars;
	}
	set outlineBars( value ) {
		this._outlineBars = !! value;
		this._calcBars();
	}

	get peakDecayTime() {
		return this._peakDecayTime * 1e3;
	}
	set peakDecayTime( value ) {
		// note: time is stored in seconds to reduce the number of operations during rendering
		this._peakDecayTime = ( value >= 0 ? +value : this._peakDecayTime || DEFAULT_SETTINGS.peakDecayTime ) / 1e3;
	}

	get peakHoldTime() {
		return this._peakHoldTime * 1e3;
	}
	set peakHoldTime( value ) {
		// note: time is stored in seconds to reduce the number of operations during rendering
		this._peakHoldTime = +value / 1e3 || 0;
	}

	get peakLine() {
		return this._peakLine;
	}
	set peakLine( value ) {
		this._peakLine = !! value;
	}

	get radial() {
		return this._radial;
	}
	set radial( value ) {
		this._radial = !! value;
		this._calcBars();
		this._makeGrad();
	}

	get radialInvert() {
		return this._radialInvert;
	}
	set radialInvert( value ) {
		this._radialInvert = !! value;
		this._calcBars();
		this._makeGrad();
	}

	get radius() {
		return this._radius;
	}
	set radius( value ) {
		this._radius = +value || 0;
		this._calcBars();
		this._makeGrad();
	}

	get reflexRatio() {
		return this._reflexRatio;
	}
	set reflexRatio( value ) {
		if ( ! ( value >= 0 && value < 1 ) ) { // also catches undefined and strings that evaluate to NaN
			warnInvalid( 'reflexRatio', value );
			value = this._reflexRatio || DEFAULT_SETTINGS.reflexRatio;
		}

		this._reflexRatio = +value;
		this._calcBars();
		this._makeGrad();
	}

	get roundBars() {
		return this._roundBars;
	}
	set roundBars( value ) {
		this._roundBars = !! value;
		this._calcBars();
	}

	get showScaleX() {
		return this._sxshow;
	}
	set showScaleX( value ) {
		this._sxshow = !! value;
		this._calcBars();
		this._makeGrad();
	}

	get smoothing() {
		return this._analyzer[0].smoothingTimeConstant;
	}
	set smoothing( value ) {
		for ( const i of [0,1] )
			this._analyzer[ i ].smoothingTimeConstant = value;
	}

	get spinSpeed() {
		return this._spinSpeed;
	}
	set spinSpeed( value ) {
		value = +value || 0;
		if ( this._spinSpeed === undefined || value == 0 )
			this._spinAngle = -HALF_PI; // initialize or reset the rotation angle
		this._spinSpeed = value;
	}

	get spreadGradient() {
		return this._spread;
	}
	set spreadGradient( value ) {
		this._spread = !! value;
		this._makeGrad();
	}

	get trueLeds() {
		return this._trueLeds;
	}
	set trueLeds( value ) {
		this._trueLeds = !! value;
	}

	get volume() {
		return this._output.gain.value;
	}
	set volume( value ) {
		this._output.gain.value = value;
	}

	get weightingFilter() {
		return this._weightingFilter;
	}
	set weightingFilter( value ) {
		this._weightingFilter = validateFromList( value, [ FILTER_NONE, FILTER_A, FILTER_B, FILTER_C, FILTER_D, FILTER_468 ], 'toUpperCase' );
	}

	get width() {
		return this._width;
	}
	set width( w ) {
		this._width = w;
		this._setCanvas( REASON_USER );
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
		return this._fsEl && ( document.fullscreenElement || document.webkitFullscreenElement ) === this._fsEl;
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
		return !! this._runId;
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
	connectInput( source ) {
		const isHTML = source instanceof HTMLMediaElement;

		if ( ! ( isHTML || source.connect ) )
			throw new AudioMotionError( ERR_INVALID_AUDIO_SOURCE );

		// if source is an HTML element, create an audio node for it; otherwise, use the provided audio node
		const node = isHTML ? this.audioCtx.createMediaElementSource( source ) : source;

		if ( ! this._sources.includes( node ) ) {
			node.connect( this._input );
			this._sources.push( node );
		}

		return node;
	}

	/**
	 * Connects the analyzer output to another audio node
	 *
	 * @param [{object}] an AudioNode; if undefined, the output is connected to the audio context destination (speakers)
	 */
	connectOutput( node = this.audioCtx.destination ) {
		if ( this._outNodes.includes( node ) )
			return;

		this._output.connect( node );
		this._outNodes.push( node );

		// when connecting the first node, also connect the analyzer nodes to the merger / output nodes
		if ( this._outNodes.length == 1 ) {
			for ( const i of [0,1] )
				this._analyzer[ i ].connect( ( this._chLayout == LAYOUT_SINGLE && ! i ? this._output : this._merger ), 0, i );
		}
	}

	/**
	 * Destroys instance
	 */
	destroy() {
		if ( ! this._ready )
			return;

		const { audioCtx, canvas, _controller, _input, _merger, _observer, _ownCanvas, _ownContext, _splitter } = this;

		this._destroyed = true;
		this._ready = false;
		this.stop();

		// remove event listeners
		_controller.abort();
		if ( _observer )
			_observer.disconnect();

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
		if ( _ownContext )
			audioCtx.close();

		// remove canvas from the DOM (if not provided by the user)
		if ( _ownCanvas )
			canvas.remove();

		// reset flags
		this._calcBars();
	}

	/**
	 * Disconnects audio sources from the analyzer
	 *
	 * @param [{object|array}] a connected AudioNode object or an array of such objects; if falsy, all connected nodes are disconnected
	 * @param [{boolean}] if true, stops/releases audio tracks from disconnected media streams (e.g. microphone)
	 */
	disconnectInput( sources, stopTracks ) {
		if ( ! sources )
			sources = Array.from( this._sources );
		else if ( ! isArray( sources ) )
			sources = [ sources ];

		for ( const node of sources ) {
			const idx = this._sources.indexOf( node );
			if ( stopTracks && node.mediaStream ) {
				for ( const track of node.mediaStream.getAudioTracks() ) {
					track.stop();
				}
			}
			if ( idx >= 0 ) {
				node.disconnect( this._input );
				this._sources.splice( idx, 1 );
			}
		}
	}

	/**
	 * Disconnects the analyzer output from other audio nodes
	 *
	 * @param [{object}] a connected AudioNode object; if undefined, all connected nodes are disconnected
	 */
	disconnectOutput( node ) {
		if ( node && ! this._outNodes.includes( node ) )
			return;

		this._output.disconnect( node );
		this._outNodes = node ? this._outNodes.filter( e => e !== node ) : [];

		// if disconnected from all nodes, also disconnect the analyzer nodes so they keep working on Chromium
		// see https://github.com/hvianna/audioMotion-analyzer/issues/13#issuecomment-808764848
		if ( this._outNodes.length == 0 ) {
			for ( const i of [0,1] )
				this._analyzer[ i ].disconnect();
		}
	}

	/**
	 * Returns analyzer bars data
     *
	 * @returns {array}
	 */
	getBars() {
		return Array.from( this._bars, ( { posX, freq, freqLo, freqHi, hold, peak, value } ) => ( { posX, freq, freqLo, freqHi, hold, peak, value } ) );
	}

	/**
	 * Returns the energy of a frequency, or average energy of a range of frequencies
	 *
	 * @param [{number|string}] single or initial frequency (Hz), or preset name; if undefined, returns the overall energy
	 * @param [{number}] ending frequency (Hz)
	 * @returns {number|null} energy value (0 to 1) or null, if the specified preset is unknown
	 */
	getEnergy( startFreq, endFreq ) {
		if ( startFreq === undefined )
			return this._energy.val;

		// if startFreq is a string, check for presets
		if ( startFreq != +startFreq ) {
			if ( startFreq == ENERGY_PEAK )
				return this._energy.peak;

			const presets = {
				[ ENERGY_BASS     ]: [  20,  250 ],
				[ ENERGY_LOWMID   ]: [ 250,  500 ],
				[ ENERGY_MIDRANGE ]: [ 500,  2e3 ],
				[ ENERGY_HIGHMID  ]: [ 2e3,  4e3 ],
				[ ENERGY_TREBLE   ]: [ 4e3, 16e3 ]
			}

			if ( ! presets[ startFreq ] )
				return null;

			[ startFreq, endFreq ] = presets[ startFreq ];
		}

		const startBin = this._freqToBin( startFreq ),
		      endBin   = endFreq ? this._freqToBin( endFreq ) : startBin,
		      chnCount = this._chLayout == LAYOUT_SINGLE ? 1 : 2;

		let energy = 0;
		for ( let channel = 0; channel < chnCount; channel++ ) {
			for ( let i = startBin; i <= endBin; i++ )
				energy += this._normalizedB( this._fftData[ channel ][ i ] );
		}

		return energy / ( endBin - startBin + 1 ) / chnCount;
	}

	/**
	 * Returns current analyzer settings in object format
	 *
	 * @param [{string|array}] a property name or an array of property names to not include in the returned object
	 * @returns {object} Options object
	 */
	getOptions( ignore ) {
		if ( ! isArray( ignore ) )
			ignore = [ ignore ];
		let options = {};
		for ( const prop of Object.keys( DEFAULT_SETTINGS ) ) {
			if ( ! ignore.includes( prop ) )
				options[ prop ] = this[ prop ];
		}
		return options;
	}

	/**
	 * Returns the selected theme for the given channel
	 *
	 * @param [{number}] channel - if undefined or invalid, considers channel 0
	 * @param [{boolean}] `true` to include modifiers
	 * @returns {string|object} theme name, or object with `name` and `modifiers`
	 */
	getTheme( channel, includeModifiers ) {
		if ( channel === true ) {
			channel = 0;
			includeModifiers = true;
		}
		else if ( ! isValidChannel( channel ) )
			channel = 0;

		const { name } = this._activeThemes[ channel ];

		return includeModifiers ? { name, modifiers: this.getThemeModifiers( channel ) } : name;
	}

	/**
	 * Returns data for the theme with the given name
	 *
	 * @param {string} theme name
	 * @returns {object|null} theme object or null if name is invalid
	 */
	getThemeData( name ) {
		return this.getThemeList().includes( name ) ? deepCloneObject( this._themes[ name ] ) : null;
	}

	/**
	 * Returns the names of available themes
	 *
	 * @returns {array}
	 */
	getThemeList() {
		return Object.keys( this._themes );
	}

	/**
	 * Returns the current state of theme modifiers for the given channel
	 *
	 * @param [{string}] desired modifier - if undefined, returns all modifiers
	 * @param [{number}] channel - if undefined or invalid, considers channel 0
	 * @returns {boolean|object} value of requested modifier, or object with all modifiers
	 */
	getThemeModifiers( modifier, channel ) {
		if ( isNumeric( modifier ) ) {
			channel = modifier;
			modifier = null;
		}

		if ( ! isValidChannel( channel ) )
			channel = 0;

		const { modifiers } = this._activeThemes[ channel ];
		return modifier ? modifiers[ modifier ] : { ...modifiers };
	}

	/**
	 * Registers a custom color theme
	 *
	 * @param {string} name
	 * @param {object} options
	 * @returns {boolean} true on success or false on error
	 */
	registerTheme( name, options ) {
		const fail = msg => {
			console.warn(`Cannot register theme "${ name }": ${ msg }`);
			return false;
		};

		if ( typeof name != 'string' || name.trim().length == 0 )
			return fail('name must be a non-empty string');

		if ( ! isObject( options ) )
			return fail('options must be an object');

		const { colorStops, peakColor } = deepCloneObject( options ); // avoid modifying user's original object (see discussion #58)

		if ( ! isArray( colorStops ) || ! colorStops.length )
			return fail( 'colorStops must be a non-empty array');

		const count     = colorStops.length,
			  isInvalid = val => +val != clamp( val, 0, 1 );

		// normalize all colorStops as objects with `color`, `level` and `pos` properties
		colorStops.forEach( ( colorStop, index ) => {
			const pos = index / Math.max( 1, count - 1 );
			if ( ! isObject( colorStop ) ) // only color string was defined
				colorStops[ index ] = {	color: colorStop, pos };
			else if ( isInvalid( colorStop.pos ) )
				colorStop.pos = pos;

			if ( isInvalid( colorStop.level ) )
				colorStops[ index ].level = 1 - index / count;
		});

		// important: ensure colorStops is in descending `level` order and the first colorStop has `level: 1`
		colorStops.sort( ( a, b ) => b.level - a.level );
		colorStops[0].level = 1;

		// generate the muted colorstops for the led mask
		const mutedColorStops = deepCloneObject( colorStops );
		for ( let i = 0; i < count; i++ ) {
			const cs = mutedColorStops[ i ],
				  [ h, s, l ] = cssColorToHSL( cs.color );

			cs.color = `hsla( ${h}, ${ LED_MASK_SATURATION }%, ${l}%, ${ LED_MASK_ALPHA } )`;
		}

		this._themes[ name ] = {
			colorStops,
			muted: {
				colorStops: mutedColorStops
			},
			peakColor
		};

		// if the registered theme is one of the currently selected ones, regenerate the gradients
		if ( this._activeThemes.some( theme => theme.name == name ) )
			this._makeGrad();

		return true;
	}

	/**
	 * Set dimensions of analyzer's canvas
	 *
	 * @param {number} w width in pixels
	 * @param {number} h height in pixels
	 */
	setCanvasSize( w, h ) {
		this._width = w;
		this._height = h;
		this._setCanvas( REASON_USER );
	}

	/**
	 * Set desired frequency range
	 *
	 * @param {number} min lowest frequency represented in the x-axis
	 * @param {number} max highest frequency represented in the x-axis
	 */
	setFreqRange( min, max ) {
		if ( ! ( min > 0 && max > 0 ) ) // also catches undefined and strings that evaluate to NaN
			warnInvalid( 'setFreqRange', [ min, max ] );
		else {
			this._minFreq = Math.min( min, max );
			this.maxFreq  = Math.max( min, max ); // use the setter for maxFreq
		}
	}

	/**
	 * Set custom parameters for LED effect
	 * If called with no arguments or if any property is invalid, clears any previous custom parameters
	 *
	 * @param {number} height of each led element (in pixels)
	 * @param {number} gap between led elements (in pixels)
	 */
	setLeds( ledHeight, ledGap ) {
		// coerce parameters to Number; `NaN` results are rejected in the condition below
		ledHeight = +ledHeight;
		ledGap = +ledGap;

		this._ledParams = ledHeight > 0 && ledGap > 0 ? [ ledHeight, ledGap ] : undefined;
		this._calcBars();
	}

	/**
	 * Shorthand function for setting several options at once
	 *
	 * @param {object} options
	 */
	setOptions( options ) {
		this._setProps( options );
	}

	/**
	 * Adjust the analyzer's sensitivity
	 *
	 * @param {number} min minimum decibels value
	 * @param {number} max maximum decibels value
	 */
	setSensitivity( min, max ) {
		for ( const i of [0,1] ) {
			this._analyzer[ i ].minDecibels = Math.min( min, max );
			this._analyzer[ i ].maxDecibels = Math.max( min, max );
		}
	}

	/**
	 * Set color theme
	 *
	 * @param {string|object|array} theme name, theme object as returned by getTheme(), or array of such types
	 * @param [{object}] theme modifiers, as returned by getThemeModifiers() (only when first argument is a string)
	 * @param [{number}] desired channel (0 or 1) - if empty or invalid, sets both channels (ignored when first argument is an array)
	 */
	setTheme( ...args ) {
		// if first argument is an array, make recursive calls for each channel
		if ( isArray( args[0] ) ) {
			for ( let ch = 0; ch < Math.max( 2, args[0].length ); ch++ )
				this.setTheme( args[0][ ch ], ch );
			return;
		}

		const { name, modifiers } = isObject( args[0] ) ? args[0] : { name: args[0], modifiers: isObject( args[1] ) ? args[1] : null },
			  channel             = args[2] ?? args[1],
			  themeNames          = this.getThemeList(),
			  isNameValid         = themeNames.includes( name );

		for ( const ch of validateChannelArray( channel ) ) {
			if ( ! this._activeThemes[ ch ] )
				this._activeThemes[ ch ] = { modifiers: { ...DEFAULT_THEME_MODIFIERS } }; // creates new entry (during constructor initialization)

			this._activeThemes[ ch ].name = isNameValid ? name : this._activeThemes[ ch ].name || themeNames[0];
		}

		if ( modifiers )
			this.setThemeModifiers( modifiers, channel );
		else
			this._makeGrad();
	}

	/**
	 * Set theme modifiers
	 *
	 * @param [{string|object}] modifier name or modifiers object; if null or undefined resets to defaults
	 * @param [{boolean}] desired value when setting a single modifier
	 * @param [{number}] channel (0 or 1) - if empty or invalid, sets modifiers on both channels
	 */
	setThemeModifiers( modifier, value, channel ) {
		const validKeys = Object.keys( DEFAULT_THEME_MODIFIERS );

		if ( modifier === null || modifier === undefined ) {
			modifier = {};   // will reset to defaults
			channel = value; // optional
		}
		else if ( isNumeric( modifier ) ) {
			channel = modifier; // only channel passed
			modifier = {};      // will reset to defaults
		}
		else if ( isObject( modifier ) ) {
			channel = value;
			modifier = deepCloneObject( modifier ); // make a copy, so we don't change user's original object

			// remove invalid modifiers and ensure all values are boolean
			for ( const key of Object.keys( modifier ) ) {
				if ( validKeys.includes( key ) )
					modifier[ key ] = !! modifier[ key ];
				else
					delete modifier[ key ];
			}
		}
		else if ( ! validKeys.includes( modifier ) ) // validates single modifier
			return;

		for ( const ch of validateChannelArray( channel ) ) {
			const activeThemeData = this._activeThemes[ ch ];
			if ( isObject( modifier ) ) {
				// when passed an object, any modifier not present will be reset to its default value!
				activeThemeData.modifiers = { ...DEFAULT_THEME_MODIFIERS, ...modifier };
			}
			else
				activeThemeData.modifiers[ modifier ] = !! value;
		}

		this._makeGrad();
	}

	/**
	 * Customize X-Axis display
	 *
	 * @param {object} options
	 */
	setXAxis( options ) {
		const defaultOptions = {
			addLabels      : false,
			backgroundColor: '#0008',
			color          : '#fff',
			height         : .03,
			highlightColor : '#4f4',
			labels         : [],
			overlay        : false
		};

		this._xAxis = {
			...defaultOptions,
			// if `options` is valid, add its properties on top of current settings; otherwise keep just the defaults
			...( isObject( options ) ? { ...this._xAxis, ...options } : [] )
		};

		this._calcBars(); // note that changes to `height` and `overlay` affect usable canvas height
		this._makeGrad();
	}

	/**
	 * Customize Y-axis display
	 *
	 * @param {object} options
	 */
	setYAxis( options ) {
		const defaultOptions = {
			color           : '#888',
			dbInterval      : 10,
			linearInterval  : 20,
			lineDash        : [2,4],
			operation       : 'destination-over',
			showSubdivisions: true,
			showUnit        : true,
			subLineColor    : '#555',
			subLineDash     : [2,8],
			width           : .03
		};

		this._yAxis = {
			...defaultOptions,
			// if `options` is valid, add its properties on top of current settings; otherwise keep just the defaults
			...( isObject( options ) ? { ...this._yAxis, ...options } : [] )
		}

		this._calcBars(); // only to compute yAxisWidth - TO-DO: improve this?
	}

	/**
	 * Start the analyzer
	 */
	start() {
		this.toggleAnalyzer( true );
	}

	/**
	 * Stop the analyzer
	 */
	stop() {
		this.toggleAnalyzer( false );
	}

	/**
	 * Start / stop canvas animation
	 *
	 * @param {boolean} [force] if undefined, inverts the current state
	 * @returns {boolean} resulting state after the change
	 */
	toggleAnalyzer( force ) {
		const hasStarted = this.isOn;

		if ( force === undefined )
			force = ! hasStarted;

		if ( hasStarted && ! force ) {
			// Stop the analyzer if it was already running and must be disabled
			this._runId = cancelAnimationFrame( this._runId );
		}
		else if ( ! hasStarted && force && ! this._destroyed ) {
			// Start the analyzer if it was stopped and must be enabled
			this._frames = 0;
			this._time = performance.now();
			this._runId = requestAnimationFrame( timestamp => this._draw( timestamp ) ); // arrow function preserves the scope of *this*
		}

		return this.isOn;
	}

	/**
	 * Toggles canvas full-screen mode
	 */
	toggleFullscreen() {
		if ( this.isFullscreen ) {
			if ( document.exitFullscreen )
				document.exitFullscreen();
			else if ( document.webkitExitFullscreen )
				document.webkitExitFullscreen();
		}
		else {
			const fsEl = this._fsEl;
			if ( ! fsEl )
				return;
			if ( fsEl.requestFullscreen )
				fsEl.requestFullscreen();
			else if ( fsEl.webkitRequestFullscreen )
				fsEl.webkitRequestFullscreen();
		}
	}

	/**
	 * Toggle a theme modifier
	 *
	 * @param {string} modifier name
	 * @param [{number}] channel (0 or 1) - if empty or invalid, toggles modifier on both channels
	 */
	toggleThemeModifier( modifier, channel ) {
		for ( const ch of validateChannelArray( channel ) )
			this.setThemeModifiers( modifier, ! this.getThemeModifiers( modifier, channel ), channel );
	}

	/**
	 * Unregisters a color theme
	 *
	 * @param {string} name
	 * @return {boolean} `true` on success or `false` if theme is not registered or in use
	 */
	unregisterTheme( name ) {
		if ( ! this.getThemeList().includes( name ) || this._activeThemes.some( theme => theme.name == name ) )
			return false;

		return delete this._themes[ name ];
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
	_binToFreq( bin ) {
		return bin * this.audioCtx.sampleRate / this.fftSize || 1; // returns 1 for bin 0
	}

	/**
	 * Compute all internal data required for the analyzer, based on its current settings
	 */
	_calcBars() {
		if ( ! this._ready )
			return;

		const { _ansiBands, _bandRes, _barSpace, canvas, _chLayout, _maxFreq, _minFreq, _mirror, _mode,
			    _pixelRatio, _radial, _radialInvert, _reflexRatio, _xAxis, _yAxis } = this,
			  bars               = [],
			  centerX            = canvas.width >> 1,
			  centerY            = canvas.height >> 1,
			  isDualVertical     = _chLayout == LAYOUT_VERTICAL && ! _radial,
			  isDualHorizontal   = _chLayout == LAYOUT_HORIZONTAL,
			  minCanvasDimension = Math.min( canvas.width, canvas.height ),
			  xAxisHeight        = Math.max( MIN_AXIS_DIMENSION * _pixelRatio, _xAxis.height * ( _xAxis.height > 1 ? _pixelRatio : minCanvasDimension ) | 0 ),
			  yAxisWidth         = Math.max( MIN_AXIS_DIMENSION * _pixelRatio, _yAxis.width  * ( _yAxis.width  > 1 ? _pixelRatio : minCanvasDimension ) | 0 ),
			  scaleGap           = xAxisHeight * ( ! _xAxis.overlay && this._sxshow ),

			  // COMPUTE FLAGS

			  isBands     = _bandRes > 0,
			  isOctaves   = isBands && this._frequencyScale == SCALE_LOG,
			  isLeds      = this._showLeds && isBands && ! _radial && _mode != MODE_GRAPH,
			  isLumi      = this._lumiBars && isBands && ! _radial && _mode != MODE_GRAPH,
			  isAlpha     = this._alphaBars && ! isLumi && _mode != MODE_GRAPH,
			  isOutline   = this._outlineBars && isBands && ! isLumi && ! isLeds,
			  isRound     = this._roundBars && isBands && ! isLumi && ! isLeds,
			  noLedGap    = _chLayout != LAYOUT_VERTICAL || _reflexRatio > 0 && ! isLumi || scaleGap > 0,

			  // COMPUTE AUXILIARY VALUES

			  // channelHeight is the total canvas height dedicated to each channel, including the reflex area, if any)
			  channelHeight  = canvas.height - ( isDualVertical && ! isLeds ? .5 : 0 ) >> isDualVertical,
			  // analyzerHeight is the effective height used to render the analyzer, excluding the reflex area
			  analyzerHeight = ( ( channelHeight - scaleGap ) * ( isLumi || _radial ? 1 : 1 - _reflexRatio ) ) | 0,

			  analyzerWidth  = canvas.width - centerX * ( isDualHorizontal || _mirror != 0 ),

			  // channelGap is **0** if isLedDisplay == true (LEDs already have spacing); **1** if canvas height is odd (windowed); **2** if it's even
			  // TO-DO: improve this, make it configurable?
			  channelGap     = isDualVertical ? canvas.height - channelHeight * 2 : 0,

			  initialX       = centerX * ( _mirror == -1 && ! isDualHorizontal && ! _radial );

		let innerRadius = minCanvasDimension * .375 * ( _chLayout == LAYOUT_VERTICAL ? 1 : this._radius ) | 0,
			outerRadius = Math.min( centerX, centerY );

		if ( _radialInvert && _chLayout != LAYOUT_VERTICAL )
			[ innerRadius, outerRadius ] = [ outerRadius, innerRadius ];

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
		const barsPush = args => bars.push( { ...args, peak: [0,0], hold: [0], alpha: [0], value: [0] } );

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
		const calcRatio = freq => {
			const bin   = this._freqToBin( freq, 'floor' ), // find closest FFT bin
				  lower = this._binToFreq( bin ),
				  upper = this._binToFreq( bin + 1 ),
				  ratio = Math.log2( freq / lower ) / Math.log2( upper / lower );

			return [ bin, ratio ];
		}

		let barWidth, scaleMin, unitWidth;

		if ( isOctaves ) {
			// helper function to round a value to a given number of significant digits
			// `atLeast` set to true prevents reducing the number of integer significant digits
			const roundSD = ( value, digits, atLeast ) => +value.toPrecision( atLeast ? Math.max( digits, 1 + Math.log10( value ) | 0 ) : digits );

			// helper function to find the nearest preferred number (Renard series) for a given value
			const nearestPreferred = value => {
				// R20 series is used here, as it provides closer approximations for 1/2 octave bands (non-standard)
				const preferred = [ 1, 1.12, 1.25, 1.4, 1.6, 1.8, 2, 2.24, 2.5, 2.8, 3.15, 3.55, 4, 4.5, 5, 5.6, 6.3, 7.1, 8, 9, 10 ],
					  power = Math.log10( value ) | 0,
					  normalized = value / 10 ** power;

				let i = 1;
				while ( i < preferred.length && normalized > preferred[ i ] )
					i++;

				if ( normalized - preferred[ i - 1 ] < preferred[ i ] - normalized )
					i--;

				return ( preferred[ i ] * 10 ** ( power + 5 ) | 0 ) / 1e5; // keep 5 significant digits
			}

			// ANSI standard octave bands use the base-10 frequency ratio, as preferred by [ANSI S1.11-2004, p.2]
			// The equal-tempered scale uses the base-2 ratio
			const bands = [0,1,2,3,4,6,8,12,24][ _bandRes ],
				  bandWidth = _ansiBands ? 10 ** ( 3 / ( bands * 10 ) ) : 2 ** ( 1 / bands ), // 10^(3/10N) or 2^(1/N)
				  halfBand  = bandWidth ** .5;

			let analyzerBars = [],
				currFreq = _ansiBands ? 7.94328235 / ( bands % 2 ? 1 : halfBand ) : C_1;
				// For ANSI bands with even denominators (all except 1/1 and 1/3), the reference frequency (1 kHz)
				// must fall on the edges of a pair of adjacent bands, instead of midband [ANSI S1.11-2004, p.2]
				// In the equal-tempered scale, all midband frequencies represent a musical note or quarter-tone.

			do {
				let freq = currFreq; // midband frequency

				const freqLo = roundSD( freq / halfBand, 4, true ), // lower edge frequency
					  freqHi = roundSD( freq * halfBand, 4, true ), // upper edge frequency
					  [ binLo, ratioLo ] = calcRatio( freqLo ),
					  [ binHi, ratioHi ] = calcRatio( freqHi );

				// for 1/1, 1/2 and 1/3 ANSI bands, use the preferred numbers to find the nominal midband frequency
				// for 1/4 to 1/24, round to 2 or 3 significant digits, according to the MSD [ANSI S1.11-2004, p.12]
				if ( _ansiBands )
					freq = bands < 4 ? nearestPreferred( freq ) : roundSD( freq, freq.toString()[0] < 5 ? 3 : 2 );
				else
					freq = roundSD( freq, 4, true );

				if ( freq >= _minFreq )
					barsPush( { posX: 0, freq, freqLo, freqHi, binLo, binHi, ratioLo, ratioHi } );

				currFreq *= bandWidth;
			} while ( currFreq <= _maxFreq );

			barWidth = analyzerWidth / bars.length;

			bars.forEach( ( bar, index ) => bar.posX = initialX + index * barWidth );

			const firstBar = bars[0],
				  lastBar  = bars[ bars.length - 1 ];

			scaleMin = this._freqScaling( firstBar.freqLo );
			unitWidth = analyzerWidth / ( this._freqScaling( lastBar.freqHi ) - scaleMin );

			// clamp edge frequencies to minFreq / maxFreq, if necessary
			// this is done after computing scaleMin and unitWidth, for the proper positioning of labels on the X-axis
			if ( firstBar.freqLo < _minFreq ) {
				firstBar.freqLo = _minFreq;
				[ firstBar.binLo, firstBar.ratioLo ] = calcRatio( _minFreq );
			}

			if ( lastBar.freqHi > _maxFreq ) {
				lastBar.freqHi = _maxFreq;
				[ lastBar.binHi, lastBar.ratioHi ] = calcRatio( _maxFreq );
			}
		}
		else if ( isBands ) { // a bands mode is selected, but frequency scale is not logarithmic

			const bands = [0,1,2,3,4,6,8,12,24][ _bandRes ] * 10;

			const invFreqScaling = x => {
				switch ( this._frequencyScale ) {
					case SCALE_BARK :
						return 1960 / ( 26.81 / ( x + .53 ) - 1 );
					case SCALE_MEL :
						return 700 * ( 2 ** x - 1 );
					case SCALE_LINEAR :
						return x;
				}
			}

			barWidth = analyzerWidth / bands;

			scaleMin = this._freqScaling( _minFreq );
			unitWidth = analyzerWidth / ( this._freqScaling( _maxFreq ) - scaleMin );

			for ( let i = 0, posX = 0; i < bands; i++, posX += barWidth ) {
				const freqLo = invFreqScaling( scaleMin + posX / unitWidth ),
					  freq   = invFreqScaling( scaleMin + ( posX + barWidth / 2 ) / unitWidth ),
					  freqHi = invFreqScaling( scaleMin + ( posX + barWidth ) / unitWidth ),
					  [ binLo, ratioLo ] = calcRatio( freqLo ),
					  [ binHi, ratioHi ] = calcRatio( freqHi );

				barsPush( { posX: initialX + posX, freq, freqLo, freqHi, binLo, binHi, ratioLo, ratioHi } );
			}

		}
		else {	// Discrete frequencies modes
			barWidth = 1;

			scaleMin = this._freqScaling( _minFreq );
			unitWidth = analyzerWidth / ( this._freqScaling( _maxFreq ) - scaleMin );

			const minIndex = this._freqToBin( _minFreq, 'floor' ),
				  maxIndex = this._freqToBin( _maxFreq );

	 		let lastPos = -999;

			for ( let i = minIndex; i <= maxIndex; i++ ) {
				const freq = this._binToFreq( i ), // frequency represented by this index
					  posX = initialX + Math.round( unitWidth * ( this._freqScaling( freq ) - scaleMin ) ); // avoid fractionary pixel values

				// if it's on a different X-coordinate, create a new bar for this frequency
				if ( posX > lastPos ) {
					barsPush( { posX, freq, freqLo: freq, freqHi: freq, binLo: i, binHi: i, ratioLo: 0, ratioHi: 0 } );
					lastPos = posX;
				} // otherwise, add this frequency to the last bar's range
				else if ( bars.length ) {
					const lastBar = bars[ bars.length - 1 ];
					lastBar.binHi = i;
					lastBar.freqHi = freq;
					lastBar.freq = ( lastBar.freqLo * freq ) ** .5; // compute center frequency (geometric mean)
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
		 *		this._leds
		 */

		if ( isLeds ) {
			// adjustment for high pixel-ratio values on low-resolution screens (Android TV)
			const dPR = _pixelRatio / ( window.devicePixelRatio > 1 && window.screen.height <= 540 ? 2 : 1 );

			let [ ledHeight, ledGap ] = ( this._ledParams || LED_PARAMETERS ).map( v => v * dPR ),
				maxHeight  = analyzerHeight + ( noLedGap ? ledGap : 0 ), // increase maxHeight to avoid extra spacing below last line of LEDs (noLedGap)
				unitHeight = ledHeight + ledGap,
				gapRatio   = ledGap / unitHeight,
				ledCount   = maxHeight / unitHeight | 0; // make sure we have an integer number of led elements

			// recalculate ledHeight and ledGap to fit channel height exactly
			unitHeight = maxHeight / ledCount;
			ledGap     = unitHeight * gapRatio;
			ledHeight  = unitHeight * ( 1 - gapRatio );

			this._leds = [ ledCount, ledHeight, ledGap ];
		}

		// COMPUTE ADDITIONAL BAR POSITIONING, ACCORDING TO THE CURRENT SETTINGS
		// uses: _barSpace, barWidth

		const barSpacePx = Math.min( barWidth - 1, _barSpace * ( _barSpace > 0 && _barSpace < 1 ? barWidth : 1 ) );

		if ( isBands )
			barWidth -= Math.max( 0, barSpacePx );

		bars.forEach( ( bar, index ) => {
			let posX  = bar.posX,
				width = barWidth;

			// in bands modes we need to update bar.posX to account for bar/led spacing

			if ( isBands ) {
				if ( _barSpace == 0 && ! isLeds ) {
					// when barSpace == 0 use integer values for perfect gapless positioning
					posX |= 0;
					width |= 0;
					if ( index > 0 && posX > bars[ index - 1 ].posX + bars[ index - 1 ].width ) {
						posX--;
						width++;
					}
				}
				else
					posX += Math.max( 0, barSpacePx ) / 2;

				bar.posX = posX; // update
			}

			bar.barCenter = posX + ( barWidth == 1 ? 0 : width / 2 );
			bar.width = width;
		});

		// COMPUTE CHANNEL COORDINATES

		const channelCoords = [],
			  [,, ledGap ]  = this._leds;

		for ( const channel of [0,1] ) {
			const channelTop     = _chLayout == LAYOUT_VERTICAL ? ( channelHeight + channelGap ) * channel : 0,
				  channelBottom  = channelTop + channelHeight,
				  analyzerBottom = channelTop + analyzerHeight - ( ! isLeds || noLedGap ? 0 : ledGap );

			channelCoords.push( { channelTop, channelBottom, analyzerBottom } );
		}

		// SAVE INTERNAL PROPERTIES
		this._bars = bars;

		this._aux = { analyzerHeight, analyzerWidth, centerX, centerY, channelCoords, channelHeight, channelGap,
					  initialX, innerRadius, outerRadius, scaleMin, unitWidth, xAxisHeight, yAxisWidth };
		this._flg = { isAlpha, isBands, isLeds, isLumi, isOctaves, isOutline, isRound, noLedGap };

		// generate X-axis and radial scale labels
		this._createScales();
	}

	/**
	 * Generate the X-axis and radial scales in auxiliary canvases
	 */
	_createScales() {
		if ( ! this._ready )
			return;

		const { analyzerWidth, initialX, innerRadius, scaleMin, unitWidth, xAxisHeight } = this._aux,
			  { canvas, _frequencyScale, _mirror, _noteLabels, _radial, _scaleX, _scaleR, _xAxis } = this,
			  canvasX            = _scaleX.canvas,
			  canvasR            = _scaleR.canvas,
			  freqLabels         = isArray( _xAxis.labels ) && ! _noteLabels ? [ ..._xAxis.labels ] : [],
			  isDualHorizontal   = this._chLayout == LAYOUT_HORIZONTAL,
			  isDualVertical     = this._chLayout == LAYOUT_VERTICAL,
			  minCanvasDimension = Math.min( canvas.width, canvas.height ),
			  scale              = [ 'C',, 'D',, 'E', 'F',, 'G',, 'A',, 'B' ], // for note labels (no sharp notes)
			  radialScaleHeight  = minCanvasDimension / 34 | 0, // circular scale height (radial mode)
			  fontSizeR          = radialScaleHeight >> 1,
			  fontSizeX          = xAxisHeight >> 1,
			  labelWidthR        = fontSizeR * ( _noteLabels ? 1 : 2 ),
			  labelWidthX        = fontSizeX * ( _noteLabels ? .7 : 1.5 ),
		  	  root12             = 2 ** ( 1 / 12 );

		// helper function - format a value using compact engineering notation (e.g.: 1000 -> 1k, 16700 -> 16k7)
		const formatLabel = f => f < 1e3 ? f | 0 : ( f / 1e3 ).toFixed(1).replace( /([\.])([\d])$/, ( m, p1, p2 ) => 'k' + ( +p2 || '' ) );

		// generate labels if not customized via setXAxis()
		if ( ! freqLabels.length || _xAxis.addLabels ) {
			if ( ! _noteLabels && ( this._ansiBands || _frequencyScale != SCALE_LOG ) ) {
				freqLabels.push( 16, 31.5, 63, 125, 250, 500, 1e3, 2e3, 4e3 );
				if ( _frequencyScale == SCALE_LINEAR )
					freqLabels.push( 6e3, 8e3, 10e3, 12e3, 14e3, 16e3, 18e3, 20e3, 22e3 );
				else
					freqLabels.push( 8e3, 16e3 );
			}
			else {
				let freq = C_1;
				for ( let octave = -1; octave < 11; octave++ ) {
					for ( let note = 0; note < 12; note++ ) {
						if ( freq >= this._minFreq && freq <= this._maxFreq ) {
							const pitch = scale[ note ],
								  isC   = pitch == 'C';
							if ( ( pitch && _noteLabels && ! _mirror && ! isDualHorizontal ) || isC ) {
								const highlight = isC && ! _mirror && ! isDualHorizontal;
								freqLabels.push( _noteLabels ? [ freq, pitch + ( isC ? octave : '' ), highlight ] : freq );
							}
						}
						freq *= root12;
					}
				}
			}
		}

		// make sure labels added via setXAxis() are in asceding order
		freqLabels.sort( ( a, b ) => ( isArray( a ) ? a[0] : a ) - ( isArray( b ) ? b[0] : b ) );

		// in radial dual-vertical layout, the scale is positioned exactly between both channels, by making the canvas a bit larger than the inner diameter
		canvasR.width = canvasR.height = Math.max( minCanvasDimension * .15, ( innerRadius << 1 ) + ( isDualVertical * radialScaleHeight ) );

		const centerR = canvasR.width >> 1,
			  radialY = centerR - radialScaleHeight * .7;	// vertical position of text labels in the circular scale

		// helper function
		const radialLabel = ( x, label ) => {
			const angle  = TAU * ( x / canvas.width ),
				  adjAng = angle - HALF_PI, // rotate angles so 0 is at the top
				  posX   = radialY * Math.cos( adjAng ),
				  posY   = radialY * Math.sin( adjAng );

			_scaleR.save();
			_scaleR.translate( centerR + posX, centerR + posY );
			_scaleR.rotate( angle );
			_scaleR.fillText( label, 0, 0 );
			_scaleR.restore();
		}

		// update scale canvas dimensions and clear it
		canvasX.width  = canvas.width;
		canvasX.height = xAxisHeight;

		if ( _xAxis.backgroundColor ) {
			_scaleX.fillStyle = _scaleR.strokeStyle = _xAxis.backgroundColor;
			_scaleX.fillRect( 0, 0, canvasX.width, canvasX.height );

			_scaleR.arc( centerR, centerR, centerR - radialScaleHeight / 2, 0, TAU );
			_scaleR.lineWidth = radialScaleHeight;
			_scaleR.stroke();
		}

		_scaleX.fillStyle = _scaleR.fillStyle = _xAxis.color;
		_scaleX.font = `${ fontSizeX }px ${FONT_FAMILY}`;
		_scaleR.font = `${ fontSizeR }px ${FONT_FAMILY}`;
		_scaleX.textAlign = _scaleR.textAlign = 'center';

		let prevX = -labelWidthX / 4,
			prevR = -labelWidthR;

		for ( const item of freqLabels ) {
			const [ freq, label, highlight ] = isArray( item ) ? item : [ item, formatLabel( item ) ],
				  x    = unitWidth * ( this._freqScaling( freq ) - scaleMin ),
				  y    = canvasX.height * .75,
				  isC  = label[0] == 'C',
	  			  maxW = fontSizeX * ( _noteLabels && ! _mirror && ! isDualHorizontal ? ( isC ? 1.2 : .6 ) : 3 );

	  		// set label color - no highlight when mirror effect is active (only Cs displayed)
			_scaleX.fillStyle = _scaleR.fillStyle = highlight ? _xAxis.highlightColor : _xAxis.color;

			// prioritizes which note labels are displayed, due to the restricted space on some ranges/scales
			if ( _noteLabels ) {
				const isLog = _frequencyScale == SCALE_LOG,
					  isLinear = _frequencyScale == SCALE_LINEAR;

				let allowedLabels = ['C'];

				if ( isLog || freq > 2e3 || ( ! isLinear && freq > 250 ) ||
					 ( ( ! _radial || isDualVertical ) && ( ! isLinear && freq > 125 || freq > 1e3 ) ) )
					allowedLabels.push('G');
				if ( isLog || freq > 4e3 || ( ! isLinear && freq > 500 ) ||
					 ( ( ! _radial || isDualVertical ) && ( ! isLinear && freq > 250 || freq > 2e3 ) ) )
					allowedLabels.push('E');
				if ( isLinear && freq > 4e3 ||
					 ( ( ! _radial || isDualVertical ) && ( isLog || freq > 2e3 || ( ! isLinear && freq > 500 ) ) ) )
					allowedLabels.push('D','F','A','B');
				if ( ! allowedLabels.includes( label[0] ) )
					continue; // skip this label
			}

			// linear scale
			if ( x >= prevX + labelWidthX / 2 && x <= analyzerWidth ) {
				_scaleX.fillText( label, isDualHorizontal && _mirror == -1 ? analyzerWidth - x : initialX + x, y, maxW );
				if ( isDualHorizontal || ( _mirror && ( x > labelWidthX || _mirror == 1 ) ) )
					_scaleX.fillText( label, isDualHorizontal && _mirror != 1 ? analyzerWidth + x : ( initialX || canvas.width ) - x, y, maxW );
				prevX = x + Math.min( maxW, _scaleX.measureText( label ).width ) / 2;
			}

			// radial scale
			if ( x >= prevR + labelWidthR && x < analyzerWidth - labelWidthR ) { // avoid overlapping the last label over the first one
				radialLabel( isDualHorizontal && _mirror == 1 ? analyzerWidth - x : x, label );
				if ( isDualHorizontal || ( _mirror && ( x > labelWidthR || _mirror == 1 ) ) ) // avoid overlapping of first labels on mirror mode
					radialLabel( isDualHorizontal && _mirror != -1 ? analyzerWidth + x : -x, label );
				prevR = x;
			}
		}
	}

	/**
	 * Redraw the canvas
	 * this is called 60 times per second by requestAnimationFrame()
	 */
	_draw( timestamp ) {
		// schedule next canvas update
		this._runId = requestAnimationFrame( timestamp => this._draw( timestamp ) );

		// frame rate control
		const elapsed        = timestamp - this._time, // time since last FPS computation
			  frameTime      = timestamp - this._last, // time since last rendered frame
			  targetInterval = this._maxFPS ? 975 / this._maxFPS : 0; // small tolerance for best results

		if ( frameTime < targetInterval )
			return;

		this._last = timestamp - ( targetInterval ? frameTime % targetInterval : 0 ); // thanks https://stackoverflow.com/a/19772220/2370385
		this._frames++;

		if ( elapsed >= 1000 ) { // update FPS every second
			this._fps = this._frames / elapsed * 1000;
			this._frames = 0;
			this._time = timestamp;
		}

		// initialize local constants

		const { isAlpha,
			    isLeds,
			    isLumi,
			    isOutline,
			    isRound }      = this._flg,

			  { analyzerHeight,
			    centerX,
			    centerY,
			    channelCoords,
			    channelHeight,
			    channelGap,
			    initialX,
			    innerRadius,
			    outerRadius,
			    xAxisHeight,
			    yAxisWidth }   = this._aux,

			  { _activeThemes,
			  	_bars,
			    canvas,
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
			    _radial,
			    showLedMask,
			    showPeaks,
			    _sxshow,
			    useCanvas,
			    _weightingFilter,
			    _xAxis,
			    _yAxis }       = this,

			  [ ledCount, ledHeight, ledGap ] = this._leds,
			  canvasX          = this._scaleX.canvas,
			  canvasR          = this._scaleR.canvas,
			  holdFrames       = _fps * this._peakHoldTime,
			  isDualCombined   = _chLayout == LAYOUT_COMBINED,
			  isDualHorizontal = _chLayout == LAYOUT_HORIZONTAL,
			  isDualVertical   = _chLayout == LAYOUT_VERTICAL,
			  isSingle         = _chLayout == LAYOUT_SINGLE,
			  isTrueLeds       = isLeds && this._trueLeds && _colorMode == COLORMODE_GRADIENT,
			  analyzerWidth    = _radial ? canvas.width : this._aux.analyzerWidth,
			  finalX           = initialX + analyzerWidth,
			  showPeakLine     = showPeaks && this._peakLine && _mode == MODE_GRAPH,
			  maxBarHeight     = _radial ? outerRadius - innerRadius : analyzerHeight,
			  dbRange 		   = maxDecibels - minDecibels,
			  decayRate        = 2 / this._peakDecayTime ** 2 / _fps ** 2,
			  ledUnitHeight    = ledHeight + ledGap;

		if ( _energy.val > 0 && _fps > 0 )
			this._spinAngle += this._spinSpeed * TAU / 60 / _fps; // spinSpeed * angle increment per frame for 1 RPM

		/* HELPER FUNCTIONS */

		// create Reflex effect
		const doReflex = channel => {
			if ( this._reflexRatio > 0 && ! isLumi && ! _radial ) {
				const scaleHeight = xAxisHeight * ( ! _xAxis.overlay && _sxshow );
				let posY, height;
				if ( this.reflexFit || isDualVertical ) { // always fit reflex in dual-vertical mode
					posY   = isDualVertical && channel == 0 ? channelHeight + channelGap : 0;
					height = channelHeight - analyzerHeight - scaleHeight;
				}
				else {
					posY   = canvas.height - analyzerHeight * 2 - scaleHeight;
					height = analyzerHeight;
				}

				_ctx.save();

				// set alpha and brightness for the reflection
				_ctx.globalAlpha = this.reflexAlpha;
				if ( this.reflexBright != 1 )
					_ctx.filter = `brightness(${this.reflexBright})`;

				// create the reflection
				_ctx.setTransform( 1, 0, 0, -1, 0, canvas.height - scaleHeight );
				_ctx.drawImage( canvas, 0, channelCoords[ channel ].channelTop, canvas.width, analyzerHeight, 0, posY, canvas.width, height );

				_ctx.restore();
			}
		}

		// draw scale on X-axis
		const drawScaleX = () => {
			if ( _sxshow ) {
				if ( _radial ) {
					_ctx.save();
					_ctx.translate( centerX, centerY );
					if ( this._spinSpeed )
						_ctx.rotate( this._spinAngle + HALF_PI );
					_ctx.drawImage( canvasR, -canvasR.width >> 1, -canvasR.width >> 1 );
					_ctx.restore();
				}
				else {
					_ctx.drawImage( canvasX, 0, canvas.height - canvasX.height );
					if ( isDualVertical )
						_ctx.drawImage( canvasX, 0, ( canvas.height >> 1 ) - canvasX.height );
				}
			}
		}

		// draw scale on Y-axis - TO-DO: handle reflex!
		const drawScaleY = () => {
			if ( ! this.showScaleY || isLumi || _radial )
				return;

			const { color, dbInterval, linearInterval, lineDash, operation, showSubdivisions, showUnit, subLineColor, subLineDash } = _yAxis,
				  fontSize   = yAxisWidth >> 1,
				  increment  = ( _linearAmplitude ? linearInterval : dbInterval ) / ( showSubdivisions ? 2 : 1 ),
				  left       = yAxisWidth * .85,
				  max        = _linearAmplitude ? 100 : maxDecibels,
				  min        = _linearAmplitude ? 0 : minDecibels,
				  right      = canvas.width - yAxisWidth * .1,
				  unit       = _linearAmplitude ? '%' : 'dB',
				  unitHeight = analyzerHeight / ( max - min );

			_ctx.save();
			_ctx.globalCompositeOperation = operation;
			_ctx.fillStyle = color;
			_ctx.font = `${fontSize}px ${FONT_FAMILY}`;
			_ctx.textAlign = 'right';
			_ctx.lineWidth = 1;

			for ( let channel = 0; channel < 1 + isDualVertical; channel++ ) {
				const { channelTop } = channelCoords[ channel ];
				for ( let val = max, minor = false; val > min; val -= increment ) {
					const posY = channelTop + ( max - val ) * unitHeight;

					if ( minor && showSubdivisions ) {
						_ctx.strokeStyle = subLineColor;
						_ctx.setLineDash( subLineDash );
						_ctx.lineDashOffset = 1;
					}
					else {
						let labelY = posY + fontSize * ( posY == channelTop ? .8 : .35 );

						_ctx.fillText( val, left, labelY );
						_ctx.fillText( val, right, labelY );

						if ( showUnit && val - increment * ( showSubdivisions ? 2 : 1 ) <= min ) {
							// display unit (dB or %) below the bottom label on both sides
							labelY += fontSize * 1.5;
							_ctx.fillText( unit, left, labelY );
							_ctx.fillText( unit, right, labelY );
						}

						_ctx.strokeStyle = color;
						_ctx.setLineDash( lineDash );
						_ctx.lineDashOffset = 0;
					}

					_ctx.beginPath();
					_ctx.moveTo( yAxisWidth * ! minor, ~~posY + .5 ); // for sharp 1px line (https://stackoverflow.com/a/13879402/2370385)
					_ctx.lineTo( canvas.width - yAxisWidth * ! minor, ~~posY + .5 );
					_ctx.stroke();

					if ( showSubdivisions )
						minor = ! minor;
				}
			}
			_ctx.restore();
		}

		// returns the gain (in dB) for a given frequency, considering the currently selected weighting filter
		const weightingdB = freq => {
			const f2 = freq ** 2,
				  SQ20_6  = 424.36,
				  SQ107_7 = 11599.29,
				  SQ158_5 = 25122.25,
				  SQ737_9 = 544496.41,
				  SQ12194 = 148693636,
				  linearTodB = value => 20 * Math.log10( value );

			switch ( _weightingFilter ) {
				case FILTER_A : // A-weighting https://en.wikipedia.org/wiki/A-weighting
					const rA = ( SQ12194 * f2 ** 2 ) / ( ( f2 + SQ20_6 ) * Math.sqrt( ( f2 + SQ107_7 ) * ( f2 + SQ737_9 ) ) * ( f2 + SQ12194 ) );
					return 2 + linearTodB( rA );

				case FILTER_B :
					const rB = ( SQ12194 * f2 * freq ) / ( ( f2 + SQ20_6 ) * Math.sqrt( f2 + SQ158_5 ) * ( f2 + SQ12194 ) );
					return .17 + linearTodB( rB );

				case FILTER_C :
					const rC = ( SQ12194 * f2 ) / ( ( f2 + SQ20_6 ) * ( f2 + SQ12194 ) );
					return .06 + linearTodB( rC );

				case FILTER_D :
					const h = ( ( 1037918.48 - f2 ) ** 2 + 1080768.16 * f2 ) / ( ( 9837328 - f2 ) ** 2 + 11723776 * f2 ),
						  rD = ( freq / 6.8966888496476e-5 ) * Math.sqrt( h / ( ( f2 + 79919.29 ) * ( f2 + 1345600 ) ) );
					return linearTodB( rD );

				case FILTER_468 : // ITU-R 468 https://en.wikipedia.org/wiki/ITU-R_468_noise_weighting
					const h1 = -4.737338981378384e-24 * freq ** 6 + 2.043828333606125e-15 * freq ** 4 - 1.363894795463638e-7 * f2 + 1,
						  h2 = 1.306612257412824e-19 * freq ** 5 - 2.118150887518656e-11 * freq ** 3 + 5.559488023498642e-4 * freq,
						  rI = 1.246332637532143e-4 * freq / Math.hypot( h1, h2 );
					return 18.2 + linearTodB( rI );
			}

			return 0; // unknown filter
		}

		// draws (stroke) a bar from x,y1 to x,y2
		const strokeBar = ( x, y1, y2 ) => {
			_ctx.beginPath();
			_ctx.moveTo( x, y1 );
			_ctx.lineTo( x, y2 );
			_ctx.stroke();
		}

		// conditionally strokes current path on canvas
		const strokeIf = flag => {
			if ( flag && _lineWidth ) {
				const alpha = _ctx.globalAlpha;
				_ctx.globalAlpha = 1;
				_ctx.stroke();
				_ctx.globalAlpha = alpha;
			}
		}

		// converts an amplitude value (0-1) to an integer number of LED elements
		const ledUnits = value => Math.round( clamp( value, 0, 1 ) * ledCount );

		// converts an amplitude value (0-1) to a height that, when subtracted from `analyzerBottom`, matches the top position of a LED element
		const ledPosY = value => Math.max( 0, ledUnits( value ) * ledUnitHeight - ledGap );

		// update energy information
		const updateEnergy = newVal => {
			_energy.val = newVal;
			if ( _energy.peak > 0 ) {
				_energy.hold--;
				if ( _energy.hold < 0 )
					_energy.peak += _energy.hold * decayRate;
			}
			if ( newVal >= _energy.peak ) {
				_energy.peak = newVal;
				_energy.hold = holdFrames;
			}
		}

		/* MAIN FUNCTION */

		// clear canvas
		_ctx.clearRect( 0, 0, canvas.width, canvas.height );

		let currentEnergy = 0;

		const nBars     = _bars.length,
			  nChannels = isSingle ? 1 : 2;

		for ( let channel = 0; channel < nChannels; channel++ ) {

			const theme            = _activeThemes[ channel ],
				  { colorStops, gradient, muted } = theme,
				  { channelTop, channelBottom, analyzerBottom } = channelCoords[ channel ],
				  colorCount       = colorStops.length,
				  radialDirection  = isDualVertical && _radial && channel ? -1 : 1, // 1 = outwards, -1 = inwards
				  invertedChannel  = ( ! channel && _mirror == -1 ) || ( channel && _mirror == 1 ),
				  radialOffsetX    = ! isDualHorizontal || ( channel && _mirror != 1 ) ? 0 : analyzerWidth >> ( channel || ! invertedChannel ),
				  angularDirection = isDualHorizontal && invertedChannel ? -1 : 1;  // 1 = clockwise, -1 = counterclockwise
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

			// FFT bin data interpolation (uses fftData)
			const interpolate = ( bin, ratio ) => {
				const value = fftData[ bin ] + ( bin < fftData.length - 1 ? ( fftData[ bin + 1 ] - fftData[ bin ] ) * ratio : 0 );
				return isNaN( value ) ? -Infinity : value;
			}

			// converts a given X-coordinate to its corresponding angle in radial mode (uses angularDirection)
			const getAngle = ( x, dir = angularDirection ) => dir * TAU * ( ( x + radialOffsetX ) / canvas.width ) + this._spinAngle;

			// converts planar X,Y coordinates to radial coordinates (uses: getAngle(), radialDirection)
			const radialXY = ( x, y, dir ) => {
				const height = innerRadius + y * radialDirection,
					  angle  = getAngle( x, dir );
				return [ centerX + height * Math.cos( angle ), centerY + height * Math.sin( angle ) ];
			}

			// draws a polygon of width `w` and height `h` at (x,y) in radial mode (uses: angularDirection, radialDirection)
			const radialPoly = ( x, y, w, h, stroke ) => {
				_ctx.beginPath();
				for ( const dir of ( _mirror && ! isDualHorizontal ? [1,-1] : [ angularDirection ] ) ) {
					const [ startAngle, endAngle ] = isRound ? [ getAngle( x, dir ), getAngle( x + w, dir ) ] : [];
					_ctx.moveTo( ...radialXY( x, y, dir ) );
					_ctx.lineTo( ...radialXY( x, y + h, dir ) );
					if ( isRound )
						_ctx.arc( centerX, centerY, innerRadius + ( y + h ) * radialDirection, startAngle, endAngle, dir != 1 );
					else
						_ctx.lineTo( ...radialXY( x + w, y + h, dir ) );
					_ctx.lineTo( ...radialXY( x + w, y, dir ) );
					if ( isRound && ! stroke ) // close the bottom line only when not in outline mode
						_ctx.arc( centerX, centerY, innerRadius + y * radialDirection, endAngle, startAngle, dir == 1 );
				}
				strokeIf( stroke );
				_ctx.fill();
			}

			// render a bar of LEDs where each element has a single color (uses: analyzerBottom, isLumi)
			const renderTrueLeds = ( colorStops, barCenter, barHeight, barValue ) => {
				const colorIndex       = isLumi ? 0 : colorStops.findLastIndex( item => ledUnits( barValue ) <= ledUnits( item.level ) ),
					  savedStrokeStyle = _ctx.strokeStyle;

				let last = analyzerBottom;

				for ( let i = colorCount - 1; i >= colorIndex; i-- ) {
					_ctx.strokeStyle = colorStops[ i ].color;
					let y = analyzerBottom - ( i == colorIndex ? barHeight : ledPosY( colorStops[ i ].level ) );
					strokeBar( barCenter, last, y );
					last = y - ledGap;
				}

				_ctx.strokeStyle = savedStrokeStyle;
			}

			// set fillStyle and strokeStyle according to current colorMode (uses: colorStops, colorCount, gradient)
			const setBarColor = ( colorStops, value = 0, barIndex = 0 ) => {
				let color;
				// for graph mode, always use the channel gradient (ignore colorMode)
				if ( ( _colorMode == COLORMODE_GRADIENT && ! isTrueLeds ) || _mode == MODE_GRAPH )
					color = gradient;
				else {
					const selectedIndex = _colorMode == COLORMODE_INDEX ? barIndex % colorCount : colorStops.findLastIndex( item => isLeds ? ledUnits( value ) <= ledUnits( item.level ) : value <= item.level );
					color = colorStops[ selectedIndex ].color;
				}
				_ctx.fillStyle = _ctx.strokeStyle = color;
			}

			// CHANNEL START

			if ( useCanvas ) {
				// set transform (horizontal flip and translation) for dual-horizontal layout
				if ( isDualHorizontal && ! _radial ) {
				  	const translateX = analyzerWidth * ( channel + invertedChannel ),
				  		  flipX      = invertedChannel ? -1 : 1;

					_ctx.setTransform( flipX, 0, 0, 1, translateX, 0 );
				}

				// set line width and dash for LEDs effect
				if ( isLeds ) {
					_ctx.setLineDash( [ ledHeight, ledGap ] );
					_ctx.lineWidth = _bars[0].width;
				}
				else // for outline effect ensure linewidth is not greater than half the bar width
					_ctx.lineWidth = isOutline ? Math.min( _lineWidth, _bars[0].width / 2 ) : _lineWidth;

				// set clipping region
				_ctx.save();
				if ( ! _radial ) {
					const region = new Path2D();
					region.rect( 0, channelTop, canvas.width, analyzerHeight );
					_ctx.clip( region );
				}

			} // if ( useCanvas )

			// get a new array of data from the FFT
			let fftData = this._fftData[ channel ];
			this._analyzer[ channel ].getFloatFrequencyData( fftData );

			// apply weighting
			if ( _weightingFilter )
				fftData = fftData.map( ( val, idx ) => val + weightingdB( this._binToFreq( idx ) ) );

			// start drawing path (for graph mode)
			_ctx.beginPath();

			// store line graph points to create mirror effect in radial mode
			let points = [];

			// draw bars / lines

			for ( let barIndex = 0; barIndex < nBars; barIndex++ ) {

				const bar = _bars[ barIndex ],
					  { posX, barCenter, width, freq, binLo, binHi, ratioLo, ratioHi } = bar;

				let barValue = Math.max( interpolate( binLo, ratioLo ), interpolate( binHi, ratioHi ) );

				// check additional bins (if any) for this bar and keep the highest value
				for ( let j = binLo + 1; j < binHi; j++ ) {
					if ( fftData[ j ] > barValue )
						barValue = fftData[ j ];
				}

				// normalize bar amplitude in [0;1] range
				barValue = this._normalizedB( barValue );

				bar.value[ channel ] = barValue;
				currentEnergy += barValue;

				// update bar peak
				if ( bar.peak[ channel ] > 0 && bar.alpha[ channel ] > 0 ) {
					bar.hold[ channel ]--;
					// if hold is negative, start peak drop or fade out
					if ( bar.hold[ channel ] < 0 ) {
						const acceleration = bar.hold[ channel ] * decayRate;
						if ( _fadePeaks && ! showPeakLine )
							bar.alpha[ channel ] += acceleration;
						else
							bar.peak[ channel ] += acceleration;
						// make sure the peak value is reset when using fadePeaks
						if ( bar.alpha[ channel ] <= 0 )
							bar.peak[ channel ] = 0;
					}
				}

				// check if it's a new peak for this bar
				if ( barValue >= bar.peak[ channel ] ) {
					bar.peak[ channel ] = barValue;
					bar.hold[ channel ] = holdFrames;
					// check whether isAlpha or isOutline are active to start the peak alpha with the proper value
					bar.alpha[ channel ] = ! isAlpha || ( isOutline && _lineWidth > 0 ) ? 1 : isAlpha ? barValue : fillAlpha;
				}

				// if not using the canvas, move earlier to the next bar
				if ( ! useCanvas )
					continue;

				// set opacity for bar effects
				_ctx.globalAlpha = ( isLumi || isAlpha ) ? barValue : ( isOutline ) ? fillAlpha : 1;

				// set fillStyle and strokeStyle for the current bar
				setBarColor( colorStops, barValue, barIndex );

				// compute actual bar height on screen
				const barHeight = isLumi ? maxBarHeight : isLeds ? ledPosY( barValue ) : barValue * maxBarHeight | 0;

				// Draw current bar or line segment

				if ( _mode == MODE_GRAPH ) {
					// compute the average between the initial bar (barIndex==0) and the next one
					// used to smooth the curve when the initial posX is off the screen, in mirror and radial modes
					const nextBarAvg = barIndex ? 0 : ( this._normalizedB( fftData[ _bars[1].binLo ] ) * maxBarHeight + barHeight ) / 2;

					if ( _radial ) {
						if ( barIndex == 0 ) {
							if ( isDualHorizontal )
								_ctx.moveTo( ...radialXY( 0, 0 ) );
							_ctx.lineTo( ...radialXY( 0, ( posX < 0 ? nextBarAvg : barHeight ) ) );
						}
						// draw line to the current point, avoiding overlapping wrap-around frequencies
						if ( posX >= 0 ) {
							const point = [ posX, barHeight ];
							_ctx.lineTo( ...radialXY( ...point ) );
							points.push( point );
						}
					}
					else { // Linear
						if ( barIndex == 0 ) {
							// start the line off-screen using the previous FFT bin value as the initial amplitude
							if ( _mirror == -1 && ! isDualHorizontal )
								_ctx.moveTo( initialX, analyzerBottom - ( posX < initialX ? nextBarAvg : barHeight ) );
							else {
								const prevFFTData = binLo ? this._normalizedB( fftData[ binLo - 1 ] ) * maxBarHeight : barHeight; // use previous FFT bin value, when available
								_ctx.moveTo( initialX - _lineWidth, analyzerBottom - prevFFTData );
							}
						}
						// draw line to the current point
						// avoid X values lower than the origin when mirroring left, otherwise draw them for best graph accuracy
						if ( isDualHorizontal || _mirror != -1 || posX >= initialX )
							_ctx.lineTo( barCenter, analyzerBottom - barHeight );
					}
				}
				else {
					if ( isLeds ) {
						// draw led mask - avoid drawing it twice on 'dual-combined' channel layout
						if ( showLedMask && ( ! isDualCombined || channel == 0 ) ) {
							const savedAlpha = _ctx.globalAlpha;
							_ctx.globalAlpha = 1; // TO-DO: maybe set the led mask alpha here, instead of doing it in each color?
							if ( isTrueLeds )
								renderTrueLeds( muted.colorStops, barCenter, maxBarHeight, 1 );
							else {
								const savedColor = _ctx.fillStyle;
								if ( _colorMode == COLORMODE_GRADIENT )
									_ctx.strokeStyle = muted.gradient;
								else
									setBarColor( muted.colorStops, 0, barIndex );
								strokeBar( barCenter, channelTop, analyzerBottom );
								_ctx.fillStyle = _ctx.strokeStyle = savedColor;
							}
							_ctx.globalAlpha = savedAlpha;
						}
						if ( isTrueLeds )
							renderTrueLeds( colorStops, barCenter, barHeight, barValue );
						else
							strokeBar( barCenter, analyzerBottom, analyzerBottom - barHeight );
					}
					else if ( posX >= initialX ) {
						if ( _radial )
							radialPoly( posX, 0, width, barHeight, isOutline );
						else if ( isRound ) {
							const halfWidth = width / 2,
								  y = analyzerBottom + halfWidth; // round caps have an additional height of half bar width

							_ctx.beginPath();
							_ctx.moveTo( posX, y );
							_ctx.lineTo( posX, y - barHeight );
							_ctx.arc( barCenter, y - barHeight, halfWidth, PI, TAU );
							_ctx.lineTo( posX + width, y );
							strokeIf( isOutline );
							_ctx.fill();
						}
						else {
							const offset = isOutline ? _ctx.lineWidth : 0;
							_ctx.beginPath();
							_ctx.rect( posX, analyzerBottom + offset, width, -barHeight - offset );
							strokeIf( isOutline );
							_ctx.fill();
						}
					}
				}

				// Draw peak
				const peakValue = bar.peak[ channel ],
					  peakAlpha = bar.alpha[ channel ];

				if ( peakValue > 0 && peakAlpha > 0 && showPeaks && ! showPeakLine && ! isLumi && posX >= initialX && posX < finalX ) {
					// set opacity for peak
					if ( _fadePeaks )
						_ctx.globalAlpha = peakAlpha;
					else if ( isOutline && _lineWidth > 0 ) // when lineWidth == 0 ctx.globalAlpha remains set to `fillAlpha`
						_ctx.globalAlpha = 1;
					else if ( isAlpha )						// isAlpha (alpha based on peak value) supersedes fillAlpha if lineWidth == 0
						_ctx.globalAlpha = peakValue;

					// use peakColor when defined by the theme in use
					if ( theme.peakColor ) {
						_ctx.fillStyle = _ctx.strokeStyle = theme.peakColor;
					}
					else if ( _colorMode == COLORMODE_LEVEL || isTrueLeds ) {
						// select the proper peak color for 'bar-level' colorMode or 'trueLeds'
						setBarColor( colorStops, peakValue );
					}

					// render peak according to current mode / effect
					if ( isLeds ) {
						const ledPeak = ledPosY( peakValue );
						if ( ledPeak >= ledGap ) // avoid peak below first led
							_ctx.fillRect( posX, analyzerBottom - ledPeak, width, ledHeight );
					}
					else if ( ! _radial )
						_ctx.fillRect( posX, analyzerBottom - peakValue * maxBarHeight, width, 2 );
					else if ( _mode != MODE_GRAPH ) { // radial (peaks for graph mode are done by the peakLine code)
						const y = peakValue * maxBarHeight;
						radialPoly( posX, y, width, ! this._radialInvert || isDualVertical || y + innerRadius >= 2 ? -2 : 2 );
					}
				}

			} // for ( let barIndex = 0; barIndex < nBars; barIndex++ )

			// if not using the canvas, move earlier to the next channel
			if ( ! useCanvas )
				continue;

			// restore global alpha
			_ctx.globalAlpha = 1;

			// Fill/stroke drawing path for graph mode
			if ( _mode == MODE_GRAPH ) {
				setBarColor(); // select channel gradient

				if ( _radial && ! isDualHorizontal ) {
					if ( _mirror ) {
						let p;
						while ( p = points.pop() )
							_ctx.lineTo( ...radialXY( ...p, -1 ) );
					}
					_ctx.closePath();
				}

				if ( _lineWidth > 0 )
					_ctx.stroke();

				if ( fillAlpha > 0 ) {
					if ( _radial ) {
						// exclude the center circle from the fill area
						const start = isDualHorizontal ? getAngle( analyzerWidth >> 1 ) : 0,
							  end   = isDualHorizontal ? getAngle( analyzerWidth ) : TAU;
						_ctx.moveTo( ...radialXY( isDualHorizontal ? analyzerWidth >> 1 : 0, 0 ) );
						_ctx.arc( centerX, centerY, innerRadius, start, end, isDualHorizontal ? ! invertedChannel : true );
					}
					else {
						// close the fill area
						_ctx.lineTo( finalX, analyzerBottom );
						_ctx.lineTo( initialX, analyzerBottom );
					}

					_ctx.globalAlpha = fillAlpha;
					_ctx.fill();
					_ctx.globalAlpha = 1;
				}

				// draw peak line (and standard peaks on radial)
				if ( showPeakLine || ( _radial && showPeaks ) ) {
					points = []; // for mirror line on radial
					_ctx.beginPath();
					_bars.forEach( ( b, i ) => {
						let x = b.posX,
							h = b.peak[ channel ],
							m = i ? 'lineTo' : 'moveTo';
						if ( _radial && x < 0 ) {
							const nextBar = _bars[ i + 1 ];
							h = findY( x, h, nextBar.posX, nextBar.peak[ channel ], 0 );
							x = 0;
						}
						h *= maxBarHeight;
						if ( showPeakLine ) {
							_ctx[ m ]( ...( _radial ? radialXY( x, h ) : [ x, analyzerBottom - h ] ) );
							if ( _radial && _mirror && ! isDualHorizontal )
								points.push( [ x, h ] );
						}
						else if ( h > 0 )
							radialPoly( x, h, 1, -2 ); // standard peaks (also does mirror)
					});
					if ( showPeakLine ) {
						let p;
						while ( p = points.pop() )
							_ctx.lineTo( ...radialXY( ...p, -1 ) ); // mirror line points
						_ctx.lineWidth = 1;
						_ctx.stroke(); // stroke peak line
					}
				}
			}

			_ctx.restore(); // restore clip region

			if ( isDualHorizontal && ! _radial )
				_ctx.setTransform( 1, 0, 0, 1, 0, 0 );

			// create Reflex effect - for dual-combined and dual-horizontal do it only once, after channel 1
			if ( ( ! isDualHorizontal && ! isDualCombined ) || channel )
				doReflex( channel );

		} // for ( let channel = 0; channel < nChannels; channel++ ) {

		updateEnergy( currentEnergy / ( nBars << ( nChannels - 1 ) ) );

		if ( useCanvas ) {
			// Mirror effect
			if ( _mirror && ! _radial && ! isDualHorizontal ) {
				_ctx.setTransform( -1, 0, 0, 1, canvas.width - initialX, 0 );
				_ctx.drawImage( canvas, initialX, 0, centerX, canvas.height, 0, 0, centerX, canvas.height );
				_ctx.setTransform( 1, 0, 0, 1, 0, 0 );
			}

			// restore solid lines
			_ctx.setLineDash([]);

			// draw scales
			drawScaleY();
			drawScaleX();
		}

		// display current frame rate
		if ( this.showFPS ) {
			const size = canvasX.height;
			_ctx.font = `bold ${size}px ${FONT_FAMILY}`;
			_ctx.fillStyle = FPS_COLOR;
			_ctx.textAlign = 'right';
			_ctx.fillText( Math.round( _fps ), canvas.width - size, size * 2 );
		}

		// call callback function, if defined
		if ( this.onCanvasDraw ) {
			_ctx.save();
			this.onCanvasDraw( this, { timestamp, themes: _activeThemes } );
			_ctx.restore();
		}
	}

	/**
	 * Return scaled frequency according to the selected scale
	 */
	_freqScaling( freq ) {
		switch ( this._frequencyScale ) {
			case SCALE_LOG :
				return Math.log2( freq );
			case SCALE_BARK :
				return ( 26.81 * freq ) / ( 1960 + freq ) - .53;
			case SCALE_MEL :
				return Math.log2( 1 + freq / 700 );
			case SCALE_LINEAR :
				return freq;
		}
	}

	/**
	 * Return the FFT data bin (array index) which represents a given frequency
	 */
	_freqToBin( freq, method = 'round' ) {
		const max = this._analyzer[0].frequencyBinCount - 1,
			  bin = Math[ method ]( freq * this.fftSize / this.audioCtx.sampleRate );

		return bin < max ? bin : max;
	}

	/**
	 * Generates canvas gradients and updates _activeThemes properties
	 *
	 * 	_activeThemes = [
	 *		// one object per channel:
	 *		{
	 *			// theme name and modifiers are set by setTheme()
	 *			name: <string>,
	 * 			modifiers: {
	 *	 			horizontal: <boolean>,
	 * 				reverse: <boolean>
	 *			},
	 *
	 * 			// colorStops and peakColor come from the theme registration
	 *			colorStops: <array>,
	 *			peakColor: <string>,
	 *
	 *			// gradient and muted.gradient are generated here
	 *			gradient: <CanvasGradient>,
	 *			muted: {
	 *				colorStops: <array>,
	 *				gradient: <CanvasGradient>
	 *			}
	 *		}
	 *	]
	 *
	 */
	_makeGrad() {
		if ( ! this._ready )
			return;

		const { canvas, _chLayout, _ctx, _horizGrad, _mirror, _radial, _reflexRatio, _spread, _xAxis } = this,
			  { analyzerHeight, analyzerWidth, centerX, centerY, channelHeight, initialX, innerRadius, outerRadius, xAxisHeight } = this._aux,
			  { isLumi }        = this._flg,
			  isDualVertical    = _chLayout == LAYOUT_VERTICAL,
			  isDualHorizontal  = _chLayout == LAYOUT_HORIZONTAL;

		for ( const channel of [0,1] ) {
			const { name, modifiers }   = this._activeThemes[ channel ],
				  analyzerRatio         = _radial || modifiers.horizontal ? 1 : analyzerHeight / channelHeight,
				  sourceTheme           = deepCloneObject( this._themes[ name ] ),
				  { colorStops, muted } = sourceTheme,
				  mutedColorStops       = muted.colorStops,
				  maxIndex              = colorStops.length - 1;

			// compute start and end coordinates for the gradient on each channel

			let [ startX, endX, startY, endY, outer, inner ] = [ 0, 0, 0, 0, outerRadius, innerRadius ];

			if ( _radial ) {
				// handle radial
				if ( isDualVertical ) {
					// on dual-vertical radial, innerRadius is actually the center radius between both channels
					// so we need to compute the actual innermost gradient radius
					if ( _spread )
						inner -= outer - inner;
					else if ( channel == 1 )
						outer = inner - ( outer - inner ); // top of channel 1 (outer < inner, so inverts gradient)
				}
			}
			else if ( _spread && ( isDualHorizontal && modifiers.horizontal || isDualVertical && ! modifiers.horizontal ) ) {
				// handle spread gradient (both horizontal and vertical)
				if ( modifiers.horizontal ) {
					// on dual-horizontal layout, both channels only use the *first half* of the gradient, due to flip and translation
					// for spread on channel 1 we need to start of the gradient halfway off-screen, so as to use the second half of it
					startX = channel == 1 ? -analyzerWidth : 0;
					endX = startX + analyzerWidth * 2;
				}
				else
					endY = canvas.height;
			}
			else {
				if ( modifiers.horizontal ) {
					startX = ( isDualHorizontal && channel == 1 ) || _mirror == -1 ? initialX : 0;
					endX   = startX + analyzerWidth;
				}
				else {
					startY = isDualVertical && channel == 1 ? channelHeight : 0;
					endY   = startY + analyzerHeight;
				}
			}

			// helper function
			const createNewGradient = _ => _ctx.createLinearGradient( startX, startY, endX, endY );

			if ( modifiers.reverse ) {
				// reverse colors only (preserve offsets and level thresholds of each colorstop)
				for ( let i = 0; i <= maxIndex >> 1; i++ ) {
					[ colorStops[ i ].color, colorStops[ maxIndex - i ].color ] = [ colorStops[ maxIndex - i ].color, colorStops[ i ].color ];
					[ mutedColorStops[ i ].color, mutedColorStops[ maxIndex - i ].color ] = [ mutedColorStops[ maxIndex - i ].color, mutedColorStops[ i ].color ]
				}
			}

			let gradient      = _radial	? _ctx.createRadialGradient( centerX, centerY, outer, centerX, centerY, inner ) : createNewGradient(),
				mutedGradient = _radial ? null : createNewGradient(); // no LEDs in radial

			colorStops.forEach( ( colorStop, index ) => {
				let offset = colorStop.pos;

				// additional offset processing to account for spread gradient combined with reflex and/or X-axis display on dual-vertical layout
				// TO-DO: add support for no scale overlay on radial too? Requires changes to outerRadius and innerRadius computation in calcBars()
				if ( ! _radial && _spread && isDualVertical && ! modifiers.horizontal ) {
					// "shrink" each offset to fit into the usable analyzer area
					offset *= analyzerRatio;

					// skip top reflex + X-axis areas, on all offsets below it (>.5)
					if ( offset > .5 * analyzerRatio )
						offset += ( 1 - analyzerRatio ) / 2;
				}

				// add computed color stop to the gradient
				gradient.addColorStop( clamp( offset, 0, 1 ), colorStop.color );
				if ( mutedGradient )
					mutedGradient.addColorStop( clamp( offset, 0, 1 ), mutedColorStops[ index ].color );
			});

			this._activeThemes[ channel ] = {
				name,			// set by setTheme()
				modifiers,
				...sourceTheme, // preserves properties from the source theme, not changed here, like `peakColor`
				colorStops,		// from the source theme, but modified by this method if `flipGrad` is on
				gradient,		// generated by this method
				muted: {
					...sourceTheme.muted,        // preserves any original properties (future-proof!)
					colorStops: mutedColorStops, // from the source theme, but modified by this method if `flipGrad` is on
					gradient: mutedGradient      // generated by this method
				}
			};

		} // for ( const channel of [0,1] )
	}

	/**
	 * Normalize a dB value in the [0;1] range
	 */
	_normalizedB( value ) {
		const isLinear   = this._linearAmplitude,
			  boost      = isLinear ? 1 / this._linearBoost : 1,
			  dBToLinear = val => 10 ** ( val / 20 );

		let maxValue = this.maxDecibels,
			minValue = this.minDecibels;

		if ( isLinear ) {
			maxValue = dBToLinear( maxValue );
			minValue = dBToLinear( minValue );
			value = dBToLinear( value ) ** boost;
		}

		return clamp( ( value - minValue ) / ( maxValue - minValue ) ** boost, 0, 1 );
	}

	/**
	 * Internal function to change canvas dimensions on demand
	 */
	_setCanvas( reason ) {
		if ( ! this._ready )
			return;

		const { canvas, _ctx } = this,
			  pixelRatio = window.devicePixelRatio / ( this._loRes + 1 );

		let screenWidth  = window.screen.width  * pixelRatio,
			screenHeight = window.screen.height * pixelRatio;

		// Fix for iOS Safari - swap width and height when in landscape
		if ( Math.abs( window.orientation ) == 90 && screenWidth < screenHeight )
			[ screenWidth, screenHeight ] = [ screenHeight, screenWidth ];

		const isFullscreen = this.isFullscreen,
			  isCanvasFs   = isFullscreen && this._fsEl == canvas,
			  newWidth     = isCanvasFs ? screenWidth  : ( this._width  || this._container.clientWidth  || this._defaultWidth  ) * pixelRatio | 0,
			  newHeight    = isCanvasFs ? screenHeight : ( this._height || this._container.clientHeight || this._defaultHeight ) * pixelRatio | 0;

		// set/update object properties
		this._pixelRatio = pixelRatio;
		this._fsWidth    = screenWidth;
		this._fsHeight   = screenHeight;

		// if this is not the constructor call and canvas dimensions haven't changed, quit
		if ( reason != REASON_CREATE && canvas.width == newWidth && canvas.height == newHeight )
			return;

		// apply new dimensions
		canvas.width  = newWidth;
		canvas.height = newHeight;

		// set lineJoin property for area fill mode (this is reset whenever the canvas size changes)
		_ctx.lineJoin = 'bevel';

		// calculate bar positions and led options
		this._calcBars();

		// (re)generate gradients
		this._makeGrad();

		// detect fullscreen changes (for Safari)
		if ( this._fsStatus !== undefined && this._fsStatus !== isFullscreen )
			reason = REASON_FULLSCREENCHANGE;
		this._fsStatus = isFullscreen;

		// call the callback function, if defined
		if ( this.onCanvasResize )
			this.onCanvasResize( reason, this );
	}

	/**
	 * Set object properties
	 */
	_setProps( options, useDefaults ) {
		// callback functions properties
		const callbacks = [ 'onCanvasDraw', 'onCanvasResize' ];

		// allow other properties not in the defaults
		const extraProps = [ 'themeLeft', 'themeRight' ];

		// build an array of valid properties
		const validProps = Object.keys( DEFAULT_SETTINGS ).concat( callbacks, extraProps );

		if ( useDefaults || options === undefined )
			options = { ...DEFAULT_SETTINGS, ...options }; // merge options with defaults

		for ( const prop of Object.keys( options ) ) {
			if ( callbacks.includes( prop ) && typeof options[ prop ] !== 'function' ) // check invalid callback
				this[ prop ] = undefined;
			else if ( validProps.includes( prop ) ) // set only valid properties
				this[ prop ] = options[ prop ];
		}
	}
}

export { AudioMotionAnalyzer };
export default AudioMotionAnalyzer;
