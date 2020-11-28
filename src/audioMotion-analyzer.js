/**!
 * audioMotion-analyzer
 * High-resolution real-time graphic audio spectrum analyzer JS module
 *
 * @version 3.0.0
 * @author  Henrique Avila Vianna <hvianna@gmail.com> <https://henriquevianna.com>
 * @license AGPL-3.0-or-later
 */

const _VERSION = '3.0.0';

export default class AudioMotionAnalyzer {

/**
 * CONSTRUCTOR
 *
 * @param {object} [container] DOM element where to insert the analyzer; if undefined, uses the document body
 * @param {object} [options]
 * @returns {object} AudioMotionAnalyzer object
 */
	constructor( container, options = {} ) {

		this._ready = false;

		// Gradient definitions

		this._gradients = {
			classic: {
				bgColor: '#111',
				colorStops: [
					'hsl( 0, 100%, 50% )',
					{ pos: .6, color: 'hsl( 60, 100%, 50% )' },
					'hsl( 120, 100%, 50% )'
				]
			},
			prism:   {
				bgColor: '#111',
				colorStops: [
					'hsl( 0, 100%, 50% )',
					'hsl( 60, 100%, 50% )',
					'hsl( 120, 100%, 50% )',
					'hsl( 180, 100%, 50% )',
					'hsl( 240, 100%, 50% )'
				]
			},
			rainbow: {
				bgColor: '#111',
				dir: 'h',
				colorStops: [
					'hsl( 0, 100%, 50% )',
					'hsl( 60, 100%, 50% )',
					'hsl( 120, 100%, 50% )',
					'hsl( 180, 100%, 47% )',
					'hsl( 240, 100%, 58% )',
					'hsl( 300, 100%, 50% )',
					'hsl( 360, 100%, 50% )'
				]
			},
		};

		// Set container
		this._container = container || document.body;

		// Make sure we have minimal width and height dimensions in case of an inline container
		this._defaultWidth  = this._container.clientWidth  || 640;
		this._defaultHeight = this._container.clientHeight || 270;

		// Use audio context provided by user, or create a new one

		const AudioContext = window.AudioContext || window.webkitAudioContext;

		if ( options.hasOwnProperty( 'audioCtx' ) ) {
			if ( options.audioCtx instanceof AudioContext )
				this._audioCtx = options.audioCtx;
			else
				throw new AudioMotionError( 'ERR_INVALID_AUDIO_CONTEXT', 'Provided audio context is not valid' );
		}
		else {
			try {
				this._audioCtx = new AudioContext();
			}
			catch( err ) {
				throw new AudioMotionError( 'ERR_AUDIO_CONTEXT_FAIL', 'Could not create audio context. Web Audio API not supported?' );
			}
		}

		/*
			Connection routing:
			===================

			for STEREO:                              +--->  analyzer[0]  ---+
		    	                                     |                      |
			(source) --->  input  --->  splitter  ---+                      +--->  merger  --->  output  ---> (destination)
		    	                                     |                      |
		        	                                 +--->  analyzer[1]  ---+

			for MONO:

			(source) --->  input  ----------------------->  analyzer[0]  --------------------->  output  ---> (destination)

		*/

		// create the analyzer nodes, channel splitter and merger, and gain nodes for input/output connections
		this._analyzer = [ this._audioCtx.createAnalyser(), this._audioCtx.createAnalyser() ];
		this._splitter = this._audioCtx.createChannelSplitter(2);
 		this._merger   = this._audioCtx.createChannelMerger(2);
 		this._input    = this._audioCtx.createGain();
 		this._output   = this._audioCtx.createGain();

 		// initialize sources array and connect audio source if provided in the options
		this._sources = [];
		if ( options.source )
			this.connectInput( options.source );

 		// connect splitter -> analyzers -> merger
		for ( let i = 0; i < 2; i++ ) {
			this._splitter.connect( this._analyzer[ i ], i );
			this._analyzer[ i ].connect( this._merger, 0, i );
		}

		// connect merger -> output
		this._merger.connect( this._output );

		// connect output -> destination (speakers)
		this.connectOutput();

		// initialize object to save energy
		this._energy = { val: 0, peak: 0, hold: 0 };

		// create analyzer canvas
		this._canvas = document.createElement('canvas');
		this._canvas.style = 'max-width: 100%;';
		this._container.appendChild( this._canvas );
		this._canvasCtx = this._canvas.getContext('2d');

		// create auxiliary canvases for the X-axis and circular scale labels
		this._scaleX = document.createElement('canvas');
		this._scaleR = document.createElement('canvas');

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
						this._setCanvas('resize');
						this._fsTimeout = 0;
					}
				}, 60 );
			}
		}

		// if browser supports ResizeObserver, listen for resize on the container
		if ( window.ResizeObserver ) {
			const resizeObserver = new ResizeObserver( onResize );
			resizeObserver.observe( this._container );
		}

		// listen for resize events on the window - required for fullscreen on iPadOS
		window.addEventListener( 'resize', onResize );

		// listen for fullscreenchange events on the canvas - not available on Safari
		this._canvas.addEventListener( 'fullscreenchange', () => {
			// set flag to indicate a fullscreen change in progress
			this._fsChanging = true;

			// if there is a scheduled resize event, clear it
			if ( this._fsTimeout )
				window.clearTimeout( this._fsTimeout );

			// update the canvas
			this._setCanvas('fschange');

			// delay clearing the flag to prevent any shortly following resize event
			this._fsTimeout = window.setTimeout( () => {
				this._fsChanging = false;
				this._fsTimeout = 0;
			}, 60 );
		});

		// Resume audio context if in suspended state (browsers' autoplay policy)
		const unlockContext = () => {
			if ( this._audioCtx.state == 'suspended' )
				this._audioCtx.resume();
			window.removeEventListener( 'click', unlockContext );
		}
		window.addEventListener( 'click', unlockContext );

		// initialize internal variables
		this._calcAux();

		// Set configuration options and use defaults for any missing properties
		this._setProps( options, true );

		// Finish canvas setup
		this._ready = true;
		this._setCanvas('create');
	}

	/**
	 * ==========================================================================
	 *
	 * PUBLIC PROPERTIES GETTERS AND SETTERS
	 *
	 * ==========================================================================
	 */

	// Bar spacing (for octave bands modes)

	get barSpace() {
		return this._barSpace;
	}
	set barSpace( value ) {
		this._barSpace = Number( value ) || 0;
		this._calcAux();
	}

	// FFT size

	get fftSize() {
		return this._analyzer[0].fftSize;
	}
	set fftSize( value ) {
		for ( let i = 0; i < 2; i++ )
			this._analyzer[ i ].fftSize = value;
		this._dataArray = new Uint8Array( this._analyzer[0].frequencyBinCount );
		this._calcBars();
	}

	// Gradient

	get gradient() {
		return this._gradient;
	}
	set gradient( value ) {
		if ( this._gradients.hasOwnProperty( value ) )
			this._gradient = value;
		else
			throw new AudioMotionError( 'ERR_UNKNOWN_GRADIENT', `Unknown gradient: '${value}'` );
	}

	// Canvas size

	get height() {
		return this._height;
	}
	set height( h ) {
		this._height = h;
		this._setCanvas('user');
	}
	get width() {
		return this._width;
	}
	set width( w ) {
		this._width = w;
		this._setCanvas('user');
	}

	// Visualization mode

	get mode() {
		return this._mode;
	}
	set mode( value ) {
		const mode = value | 0;
		if ( mode >= 0 && mode <= 10 && mode != 9 ) {
			this._mode = mode;
			this._calcAux();
			this._calcBars();
			this._makeGrads();
		}
		else
			throw new AudioMotionError( 'ERR_INVALID_MODE', `Invalid mode: ${value}` );
	}

	// Low-resolution mode

	get loRes() {
		return this._loRes;
	}
	set loRes( value ) {
		this._loRes = !! value;
		this._setCanvas('lores');
	}

	// Luminance bars

	get lumiBars() {
		return this._lumiBars;
	}
	set lumiBars( value ) {
		this._lumiBars = !! value;
		this._calcAux();
		this._calcLeds();
		this._makeGrads();
	}

	// Radial mode

	get radial() {
		return this._radial;
	}
	set radial( value ) {
		this._radial = !! value;
		this._calcAux();
		this._calcLeds();
		this._makeGrads();
	}

	// Radial spin speed

	get spinSpeed() {
		return this._spinSpeed;
	}
	set spinSpeed( value ) {
		value = Number( value ) || 0;
		if ( this._spinSpeed === undefined || value == 0 )
			this._spinAngle = -Math.PI / 2; // initialize or reset the rotation angle
		this._spinSpeed = value;
	}

	// Reflex

	get reflexRatio() {
		return this._reflexRatio;
	}
	set reflexRatio( value ) {
		value = Number( value ) || 0;
		if ( value < 0 || value >= 1 )
			throw new AudioMotionError( 'ERR_REFLEX_OUT_OF_RANGE', `Reflex ratio must be >= 0 and < 1` );
		else {
			this._reflexRatio = value;
			this._calcAux();
			this._makeGrads();
			this._calcLeds();
		}
	}

	// Current frequency range

	get minFreq() {
		return this._minFreq;
	}
	set minFreq( value ) {
		if ( value < 1 )
			throw new AudioMotionError( 'ERR_FREQUENCY_TOO_LOW', `Frequency values must be >= 1` );
		else {
			this._minFreq = value;
			this._calcBars();
		}
	}
	get maxFreq() {
		return this._maxFreq;
	}
	set maxFreq( value ) {
		if ( value < 1 )
			throw new AudioMotionError( 'ERR_FREQUENCY_TOO_LOW', `Frequency values must be >= 1` );
		else {
			this._maxFreq = value;
			this._calcBars();
		}
	}

	// Analyzer's sensitivity

	get minDecibels() {
		return this._analyzer[0].minDecibels;
	}
	set minDecibels( value ) {
		for ( let i = 0; i < 2; i++ )
			this._analyzer[ i ].minDecibels = value;
	}
	get maxDecibels() {
		return this._analyzer[0].maxDecibels;
	}
	set maxDecibels( value ) {
		for ( let i = 0; i < 2; i++ )
			this._analyzer[ i ].maxDecibels = value;
	}

	// LEDs effect

	get showLeds() {
		return this._showLeds;
	}
	set showLeds( value ) {
		this._showLeds = !! value;
		this._calcAux();
	}

	// Analyzer's smoothing time constant

	get smoothing() {
		return this._analyzer[0].smoothingTimeConstant;
	}
	set smoothing( value ) {
		for ( let i = 0; i < 2; i++ )
			this._analyzer[ i ].smoothingTimeConstant = value;
	}

	// Split gradient (in stereo mode)

	get splitGradient() {
		return this._splitGradient;
	}
	set splitGradient( value ) {
		this._splitGradient = !! value;
		this._makeGrads();
	}

	// Stereo

	get stereo() {
		return this._stereo;
	}
	set stereo( value ) {
		this._stereo = !! value;

		// update node connections
		this._input.disconnect();
		this._analyzer[0].disconnect();
		this._input.connect( this._stereo ? this._splitter : this._analyzer[0] );
		this._analyzer[0].connect( this._stereo ? this._merger : this._output );

		// update properties affected by stereo
		this._calcAux();
		this._createScales();
		this._calcLeds();
		this._makeGrads();
	}

	// Volume

	get volume() {
		return this._output.gain.value;
	}
	set volume( value ) {
		this._output.gain.value = value;
	}

	// Read only properties

	get audioCtx() {
		return this._audioCtx;
	}
	get canvas() {
		return this._canvas;
	}
	get canvasCtx() {
		return this._canvasCtx;
	}
	get connectedSources() {
		return this._sources;
	}
	get energy() {
		return this._energy.val;
	}
	get fsWidth() {
		return this._fsWidth;
	}
	get fsHeight() {
		return this._fsHeight;
	}
	get fps() {
		return this._fps;
	}
	get isFullscreen() {
		return ( document.fullscreenElement || document.webkitFullscreenElement ) === this._canvas;
	}
	get isOctaveBands() {
		return this._isOctaveBands;
	}
	get isLedDisplay() {
		return this._isLedDisplay;
	}
	get isLumiBars() {
		return this._isLumiBars;
	}
	get isOn() {
		return this._runId !== undefined;
	}
	get peakEnergy() {
		return this._energy.peak;
	}
	get pixelRatio() {
		return this._pixelRatio;
	}
	static get version() {
		return _VERSION;
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

		if ( ! ( isHTML || source instanceof AudioNode ) )
			throw new AudioMotionError( 'ERR_INVALID_AUDIO_SOURCE', 'Audio source must be an instance of HTMLMediaElement or AudioNode' );

		// if source is an HTML element, create an audio node for it; otherwise, use the provided audio node
		const node = isHTML ? this._audioCtx.createMediaElementSource( source ) : source;

		if ( ! this._sources.includes( node ) ) {
			node.connect( this._input );
			this._sources.push( node );
		}

		return node;
	}

	/**
	 * Disconnects audio sources from the analyzer
	 *
	 * @param [{object|array}] a connected AudioNode object or an array of such objects; if undefined, all connected nodes are disconnected
	 */
	disconnectInput( sources ) {
		if ( ! sources )
			sources = Array.from( this._sources );
		else if ( ! Array.isArray( sources ) )
			sources = [ sources ];

		for ( const node of sources ) {
			const idx = this._sources.indexOf( node );
			if ( idx >= 0 ) {
				node.disconnect( this._input );
				this._sources.splice( idx, 1 );
			}
		}
	}

	/**
	 * Connects the analyzer output to another audio node
	 *
	 * @param [{object}] an AudioNode; if undefined, the output is connected to the audio context destination (speakers)
	 */
	connectOutput( node = this._audioCtx.destination ) {
	 	this._output.connect( node );
	}

	/**
	 * Disconnects the analyzer output from other audio nodes
	 *
	 * @param [{object}] a connected AudioNode object; if undefined, all connected nodes are disconnected
	 */
	disconnectOutput( node ) {
	 	this._output.disconnect( node );
	}

	/**
	 * Registers a custom gradient
	 *
	 * @param {string} name
	 * @param {object} options
	 */
	registerGradient( name, options ) {
		if ( typeof name !== 'string' || name.trim().length == 0 )
			throw new AudioMotionError( 'ERR_GRADIENT_INVALID_NAME', 'Gradient name must be a non-empty string' );

		if ( typeof options !== 'object' )
			throw new AudioMotionError( 'ERR_GRADIENT_NOT_AN_OBJECT', 'Gradient options must be an object' );

		if ( options.colorStops === undefined || options.colorStops.length < 2 )
			throw new AudioMotionError( 'ERR_GRADIENT_MISSING_COLOR', 'Gradient must define at least two colors' );

		this._gradients[ name ] = {};

		if ( options.bgColor !== undefined )
			this._gradients[ name ].bgColor = options.bgColor;
		else
			this._gradients[ name ].bgColor = '#111';

		if ( options.dir !== undefined )
			this._gradients[ name ].dir = options.dir;

		this._gradients[ name ].colorStops = options.colorStops;

		this._makeGrads();
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
		this._setCanvas('user');
	}

	/**
	 * Set desired frequency range
	 *
	 * @param {number} min lowest frequency represented in the x-axis
	 * @param {number} max highest frequency represented in the x-axis
	 */
	setFreqRange( min, max ) {
		if ( min < 1 || max < 1 )
			throw new AudioMotionError( 'ERR_FREQUENCY_TOO_LOW', `Frequency values must be >= 1` );
		else {
			this._minFreq = Math.min( min, max );
			this._maxFreq = Math.max( min, max );
			this._calcBars();
		}
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
		for ( let i = 0; i < 2; i++ ) {
			this._analyzer[ i ].minDecibels = Math.min( min, max );
			this._analyzer[ i ].maxDecibels = Math.max( min, max );
		}
	}

	/**
	 * Start / stop canvas animation
	 *
	 * @param {boolean} [value] if undefined, inverts the current status
	 * @returns {boolean} resulting status after the change
	 */
	toggleAnalyzer( value ) {
		const started = this.isOn;

		if ( value === undefined )
			value = ! started;

		if ( started && ! value ) {
			cancelAnimationFrame( this._runId );
			this._runId = undefined;
		}
		else if ( ! started && value ) {
			this._frame = this._fps = 0;
			this._time = performance.now();
			this._runId = requestAnimationFrame( timestamp => this._draw( timestamp ) );
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
			if ( this._canvas.requestFullscreen )
				this._canvas.requestFullscreen();
			else if ( this._canvas.webkitRequestFullscreen )
				this._canvas.webkitRequestFullscreen();
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
	 * Calculate auxiliary values and flags
	 */
	_calcAux() {
		this._radius         = this._canvas.height * ( this._stereo ? .375 : .125 ) | 0;
		this._barSpacePx     = Math.min( this._barWidth - 1, ( this._barSpace > 0 && this._barSpace < 1 ) ? this._barWidth * this._barSpace : this._barSpace );
		this._isOctaveBands  = ( this._mode % 10 != 0 );
		this._isLedDisplay   = ( this._showLeds && this._isOctaveBands && ! this._radial );
		this._isLumiBars     = ( this._lumiBars && this._isOctaveBands && ! this._radial );
		this._maximizeLeds   = ! this._stereo || this._reflexRatio > 0 && ! this._isLumiBars;

		const isDual = this._stereo && ! this._radial;
		this._channelHeight  = this._canvas.height - ( isDual && ! this._isLedDisplay ? .5 : 0 ) >> isDual;
		this._analyzerHeight = this._channelHeight * ( this._isLumiBars || this._radial ? 1 : 1 - this._reflexRatio ) | 0;

		// channelGap is **0** if isLedDisplay == true (LEDs already have spacing); **1** if canvas height is odd (windowed); **2** if it's even
		// TODO: improve this, make it configurable?
		this._channelGap     = isDual ? this._canvas.height - this._channelHeight * 2 : 0;
	}

	/**
	 * Calculate attributes for the vintage LEDs effect, based on visualization mode and canvas resolution
	 */
	_calcLeds() {
		if ( ! this._isOctaveBands || ! this._ready )
			return;

		let analyzerHeight = this._analyzerHeight;

		let spaceV = Math.min( 6, analyzerHeight / ( 90 * this._pixelRatio ) | 0 ); // for modes 3, 4, 5 and 6
		let nLeds;

		switch ( this._mode ) {
			case 8:
				spaceV = Math.min( 16, analyzerHeight / ( 33 * this._pixelRatio ) | 0 );
				nLeds = 24;
				break;
			case 7:
				spaceV = Math.min( 8, analyzerHeight / ( 67 * this._pixelRatio ) | 0 );
				nLeds = 48;
				break;
			case 6:
				nLeds = 64;
				break;
			case 5:
				// fall through
			case 4:
				nLeds = 80;
				break;
			case 3:
				nLeds = 96;
				break;
			case 2:
				spaceV = Math.min( 4, analyzerHeight / ( 135 * this._pixelRatio ) | 0 );
				nLeds = 128;
				break;
			case 1:
				spaceV = Math.min( 3, Math.max( 2, analyzerHeight / ( 180 * this._pixelRatio ) | 0 ) );
				nLeds = 128;
		}

		// make sure spaceV is at least 1px
		spaceV = Math.max( spaceV, 1 ) * this._pixelRatio;

		// remove the extra spacing at the bottom when single channel or stereo with reflex
		if ( this._maximizeLeds )
			analyzerHeight += spaceV;

		// recalculate the number of leds, considering the effective spaceV
		nLeds = Math.min( nLeds, analyzerHeight / ( spaceV * 2 ) | 0 );

		this._leds = {
			nLeds,
			spaceH: this._barWidth * ( this._mode == 1 ? .45 : this._mode < 5 ? .225 : .125 ),
			spaceV,
			ledHeight: analyzerHeight / nLeds - spaceV
		};
	}

	/**
	 * Redraw the canvas
	 * this is called 60 times per second by requestAnimationFrame()
	 */
	_draw( timestamp ) {
		const canvas         = this._canvas,
			  ctx            = this._canvasCtx,
			  isOctaveBands  = this._isOctaveBands,
			  isLedDisplay   = this._isLedDisplay,
			  isLumiBars     = this._isLumiBars,
			  channelHeight  = this._channelHeight,
			  channelGap     = this._channelGap,
			  analyzerHeight = this._analyzerHeight;

		// radial related constants
		const centerX        = canvas.width >> 1,
			  centerY        = canvas.height >> 1,
			  radius         = this._radius,
			  tau            = 2 * Math.PI;

		if ( this._energy.val > 0 )
			this._spinAngle += this._spinSpeed * tau / 3600;

		// helper function - convert planar X,Y coordinates to radial coordinates
		const radialXY = ( x, y ) => {
			const height = radius + y,
				  angle  = tau * ( x / canvas.width ) + this._spinAngle;

			return [ centerX + height * Math.cos( angle ), centerY + height * Math.sin( angle ) ];
		}

		// helper function - draw a polygon of width `w` and height `h` at (x,y) in radial mode
		const radialPoly = ( x, y, w, h ) => {
			ctx.moveTo( ...radialXY( x, y ) );
			ctx.lineTo( ...radialXY( x, y + h ) );
			ctx.lineTo( ...radialXY( x + w, y + h ) );
			ctx.lineTo( ...radialXY( x + w, y ) );
		}

		// select background color
		const bgColor = ( ! this.showBgColor || isLedDisplay && ! this.overlay ) ? '#000' : this._gradients[ this._gradient ].bgColor;

		// compute the effective bar width, considering the selected bar spacing
		// if led effect is active, ensure at least the spacing from led definitions
		let width = this._barWidth - ( ! isOctaveBands ? 0 : Math.max( isLedDisplay ? this._leds.spaceH : 0, this._barSpacePx ) );

		// make sure width is integer for pixel accurate calculation, when no bar spacing is required
		if ( this._barSpace == 0 && ! isLedDisplay )
			width |= 0;

		let energy = 0;

		const nBars = this._bars.length;

		for ( let channel = 0; channel < this._stereo + 1; channel++ ) {

			const channelTop     = channelHeight * channel + channelGap * channel,
				  channelBottom  = channelTop + channelHeight,
				  analyzerBottom = channelTop + analyzerHeight - ( isLedDisplay && ! this._maximizeLeds ? this._leds.spaceV : 0 );

			// clear the channel area, if in overlay mode
			// this is done per channel to clear any residue below 0 off the top channel (especially in line graph mode with lineWidth > 1)
			if ( this.overlay )
				ctx.clearRect( 0, channelTop - channelGap, canvas.width, channelHeight + channelGap );

			// fill the analyzer background if needed (not overlay or overlay + showBgColor)
			if ( ! this.overlay || this.showBgColor ) {
				if ( this.overlay )
					ctx.globalAlpha = this.bgAlpha;

				ctx.fillStyle = bgColor;

				// exclude the reflection area when overlay is true and reflexAlpha == 1 (avoids alpha over alpha difference, in case bgAlpha < 1)
				if ( ! this._radial || channel == 0 )
					ctx.fillRect( 0, channelTop - channelGap, canvas.width, ( this.overlay && this.reflexAlpha == 1 ? analyzerHeight : channelHeight ) + channelGap );

				ctx.globalAlpha = 1;
			}

			// draw dB scale (Y-axis)
			if ( this.showScaleY && ! isLumiBars && ! this._radial ) {
				const scaleWidth = this._scaleX.height,
					  fontSize   = scaleWidth >> 1,
					  interval   = analyzerHeight / ( this._analyzer[0].maxDecibels - this._analyzer[0].minDecibels );

				ctx.fillStyle = '#888';
				ctx.font = `${fontSize}px sans-serif`;
				ctx.textAlign = 'right';
				ctx.lineWidth = 1;

				for ( let db = this._analyzer[0].maxDecibels; db > this._analyzer[0].minDecibels; db -= 5 ) {
					const posY = channelTop + ( this._analyzer[0].maxDecibels - db ) * interval,
						  even = ( db % 2 == 0 ) | 0;

					if ( even ) {
						const labelY = posY + fontSize * ( posY == channelTop ? .8 : .35 );
						ctx.fillText( db, scaleWidth * .85, labelY );
						ctx.fillText( db, canvas.width - scaleWidth * .1, labelY );
						ctx.strokeStyle = '#888';
						ctx.setLineDash([2,4]);
						ctx.lineDashOffset = 0;
					}
					else {
						ctx.strokeStyle = '#555';
						ctx.setLineDash([2,8]);
						ctx.lineDashOffset = 1;
					}

					ctx.beginPath();
					ctx.moveTo( scaleWidth * even, ~~posY + .5 ); // for sharp 1px line (https://stackoverflow.com/a/13879402/2370385)
					ctx.lineTo( canvas.width - scaleWidth * even, ~~posY + .5 );
					ctx.stroke();
				}
				// restore line properties
				ctx.setLineDash([]);
				ctx.lineDashOffset = 0;
			}

			// set line width and dash for LEDs effect
			if ( isLedDisplay ) {
				ctx.setLineDash( [ this._leds.ledHeight, this._leds.spaceV ] );
				ctx.lineWidth = width;
			}

			// set selected gradient for fill and stroke
			ctx.fillStyle = ctx.strokeStyle = this._gradients[ this._gradient ].gradient;

			// get a new array of data from the FFT
			this._analyzer[ channel ].getByteFrequencyData( this._dataArray );

			// start drawing path
			ctx.beginPath();

			// draw bars / lines

			for ( let i = 0; i < nBars; i++ ) {

				let bar = this._bars[ i ],
					barHeight = 0;

				if ( bar.endIdx == 0 ) { // single FFT bin
					barHeight = this._dataArray[ bar.dataIdx ];
					// perform value interpolation when several bars share the same bin, to generate a smooth curve
					if ( bar.factor ) {
						const prevBar = bar.dataIdx ? this._dataArray[ bar.dataIdx - 1 ] : barHeight;
						barHeight = prevBar + ( barHeight - prevBar ) * bar.factor;
					}
				}
				else { 					// range of bins
					// use the highest value in the range
					for ( let j = bar.dataIdx; j <= bar.endIdx; j++ )
						barHeight = Math.max( barHeight, this._dataArray[ j ] );
				}

				barHeight /= 255;
				energy += barHeight;

				// set opacity for lumi bars before barHeight value is normalized
				if ( isLumiBars )
					ctx.globalAlpha = barHeight;

				if ( isLedDisplay ) { // normalize barHeight to match one of the "led" elements
					barHeight = ( barHeight * this._leds.nLeds | 0 ) * ( this._leds.ledHeight + this._leds.spaceV ) - this._leds.spaceV;
					if ( barHeight < 0 )
						barHeight = 0; // prevent showing leds below 0 when overlay and reflex are active
				}
				else
					barHeight = barHeight * ( this._radial ? centerY - radius : analyzerHeight ) | 0;

				if ( barHeight >= bar.peak[ channel ] ) {
					bar.peak[ channel ] = barHeight;
					bar.hold[ channel ] = 30; // set peak hold time to 30 frames (0.5s)
					bar.accel[ channel ] = 0;
				}

				if ( this._radial && channel == 1 )
					barHeight *= -1;

				let posX = bar.posX;
				let adjWidth = width; // bar width may need small adjustments for some bars, when barSpace == 0

				// Draw current bar or line segment

				if ( this._mode == 10 ) {
					if ( this._radial ) {
						// in radial graph mode, use value of previous FFT bin (if available) as the initial amplitude
						if ( i == 0 && bar.dataIdx && bar.posX )
							ctx.lineTo( ...radialXY( 0, this._dataArray[ bar.dataIdx - 1 ] / 255 * ( centerY - radius ) * ( channel == 1 ? -1 : 1 ) ) );
						// draw line to current point, avoiding overlapping wrap-around frequencies
						if ( bar.posX >= 0 )
							ctx.lineTo( ...radialXY( bar.posX, barHeight ) );
					}
					else {
						if ( i == 0 ) {
							// in linear mode, start the line off screen
							ctx.moveTo( -this.lineWidth, analyzerBottom );
							// use value of previous FFT bin
							if ( bar.dataIdx )
								ctx.lineTo( -this.lineWidth, analyzerBottom - this._dataArray[ bar.dataIdx - 1 ] / 255 * analyzerHeight );
						}
						// draw line to current point
						ctx.lineTo( bar.posX, analyzerBottom - barHeight );
					}
				}
				else {
					if ( this._mode > 0 ) {
						if ( isLedDisplay )
							posX += Math.max( this._leds.spaceH / 2, this._barSpacePx / 2 );
						else {
							if ( this._barSpace == 0 ) {
								posX |= 0;
								if ( i > 0 && posX > this._bars[ i - 1 ].posX + width ) {
									posX--;
									adjWidth++;
								}
							}
							else
								posX += this._barSpacePx / 2;
						}
					}

					if ( isLedDisplay ) {
						const x = posX + width / 2;
						// draw "unlit" leds
						if ( this.showBgColor && ! this.overlay ) {
							const alpha = ctx.globalAlpha;
							ctx.beginPath();
							ctx.moveTo( x, channelTop );
							ctx.lineTo( x, analyzerBottom );
							ctx.strokeStyle = '#7f7f7f22';
							ctx.globalAlpha = 1;
							ctx.stroke();
							// restore properties
							ctx.strokeStyle = ctx.fillStyle;
							ctx.globalAlpha = alpha;
						}
						ctx.beginPath();
						ctx.moveTo( x, isLumiBars ? channelTop : analyzerBottom );
						ctx.lineTo( x, isLumiBars ? channelBottom : analyzerBottom - barHeight );
						ctx.stroke();
					}
					else if ( ! this._radial ) {
						ctx.fillRect( posX, isLumiBars ? channelTop : analyzerBottom, adjWidth, isLumiBars ? channelBottom : -barHeight );
					}
					else if ( bar.posX >= 0 ) {
						radialPoly( posX, 0, adjWidth, barHeight );
					}
				}

				// Draw peak
				if ( bar.peak[ channel ] > 1 ) { // avoid half "negative" peaks on top channel (peak height is 2px)
					if ( this.showPeaks && ! isLumiBars ) {
						if ( isLedDisplay ) {
							// convert the bar height to the position of the corresponding led element
							const fullLeds = bar.peak[ channel ] / ( analyzerHeight + this._leds.spaceV ) * this._leds.nLeds | 0,
								  posY = ( this._leds.nLeds - fullLeds - 1 ) * ( this._leds.ledHeight + this._leds.spaceV );

							ctx.fillRect( posX,	channelTop + posY, width, this._leds.ledHeight );
						}
						else if ( ! this._radial ) {
							ctx.fillRect( posX, analyzerBottom - bar.peak[ channel ], adjWidth, 2 );
						}
						else if ( this.mode != 10 && bar.posX >= 0 ) { // radial - no peaks for mode 10 or wrap-around frequencies
							radialPoly( posX, bar.peak[ channel ] * ( channel == 1 ? -1 : 1 ), adjWidth, -2 );
						}
					}

					if ( bar.hold[ channel ] )
						bar.hold[ channel ]--;
					else {
						bar.accel[ channel ]++;
						bar.peak[ channel ] -= bar.accel[ channel ];
					}
				}
			} // for ( let i = 0; i < nBars; i++ )

			// restore global alpha
			ctx.globalAlpha = 1;

			// Fill/stroke drawing path for mode 10 and radial
			if ( this._mode == 10 ) {
				if ( this._radial )
					ctx.closePath();
				else
					ctx.lineTo( canvas.width + this.lineWidth, analyzerBottom );

				if ( this.lineWidth > 0 ) {
					ctx.lineWidth = this.lineWidth;
					ctx.stroke();
				}

				if ( this.fillAlpha > 0 ) {
					if ( this._radial ) {
						// exclude the center circle from the fill area
						ctx.moveTo( centerX + radius, centerY );
						ctx.arc( centerX, centerY, radius, 0, tau, true );
					}
					ctx.globalAlpha = this.fillAlpha;
					ctx.fill();
					ctx.globalAlpha = 1;
				}
			}
			else if ( this._radial ) {
				ctx.fill();
			}

			// Reflex effect
			if ( this._reflexRatio > 0 && ! isLumiBars ) {
				let posY, height;
				if ( this.reflexFit || this._stereo ) { // always fit reflex in stereo mode
					posY   = this._stereo && channel == 0 ? channelHeight + channelGap : 0;
					height = channelHeight - analyzerHeight;
				}
				else {
					posY   = canvas.height - analyzerHeight * 2;
					height = analyzerHeight;
				}

				// set alpha and brightness for the reflection
				ctx.globalAlpha = this.reflexAlpha;
				if ( this.reflexBright != 1 )
					ctx.filter = `brightness(${this.reflexBright})`;

				// create the reflection
				ctx.setTransform( 1, 0, 0, -1, 0, canvas.height );
				ctx.drawImage( canvas, 0, channelTop, canvas.width, analyzerHeight, 0, posY, canvas.width, height );

				// reset changed properties
				ctx.setTransform( 1, 0, 0, 1, 0, 0 );
				ctx.filter = 'none';
				ctx.globalAlpha = 1;
			}

		} // for ( let channel = 0; channel < this._stereo + 1; channel++ ) {

		// Update energy
		this._energy.val = energy / ( nBars << this._stereo );
		if ( this._energy.val >= this._energy.peak ) {
			this._energy.peak = this._energy.val;
			this._energy.hold = 30;
		}
		else {
			if ( this._energy.hold > 0 )
				this._energy.hold--;
			else if ( this._energy.peak > 0 )
				this._energy.peak *= ( 30 + this._energy.hold-- ) / 30; // decay (drops to zero in 30 frames)
		}

		// restore solid lines
		ctx.setLineDash([]);

		// draw frequency scale (X-axis)
		if ( this.showScaleX ) {
			if ( this._radial ) {
				ctx.save();
				ctx.translate( centerX, centerY );
				if ( this._spinSpeed != 0 )
					ctx.rotate( this._spinAngle + Math.PI / 2 );
				ctx.drawImage( this._scaleR, -this._scaleR.width >> 1, -this._scaleR.width >> 1 );
				ctx.restore();
			}
			else
				ctx.drawImage( this._scaleX, 0, canvas.height - this._scaleX.height );
		}

		// calculate and update current frame rate

		this._frame++;
		const elapsed = timestamp - this._time;

		if ( elapsed >= 1000 ) {
			this._fps = this._frame / ( elapsed / 1000 );
			this._frame = 0;
			this._time = timestamp;
		}
		if ( this.showFPS ) {
			const size = 20 * this._pixelRatio;
			ctx.font = `bold ${size}px sans-serif`;
			ctx.fillStyle = '#0f0';
			ctx.textAlign = 'right';
			ctx.fillText( Math.round( this._fps ), canvas.width - size, size * 2 );
		}

		// call callback function, if defined
		if ( this.onCanvasDraw ) {
			ctx.save();
			ctx.fillStyle = ctx.strokeStyle = this._gradients[ this._gradient ].gradient;
			this.onCanvasDraw( this );
			ctx.restore();
		}

		// schedule next canvas update
		this._runId = requestAnimationFrame( timestamp => this._draw( timestamp ) );
	}

	/**
	 * Generate gradients
	 */
	_makeGrads() {

		const isOctaveBands  = this._isOctaveBands,
			  isLumiBars     = this._isLumiBars,
			  gradientHeight = isLumiBars ? this._canvas.height : this._canvas.height * ( 1 - this._reflexRatio * ! this._stereo ) | 0,
			  					// for stereo we keep the full canvas height and handle the reflex areas while generating the color stops
			  analyzerRatio  = 1 - this._reflexRatio;

		// for radial mode
		const centerX = this._canvas.width >> 1,
			  centerY = this._canvas.height >> 1,
			  radius  = this._radius;

		Object.keys( this._gradients ).forEach( key => {

			const isHorizontal = this._gradients[ key ].dir == 'h';
			let grad;

			if ( this._radial )
				grad = this._canvasCtx.createRadialGradient( centerX, centerY, centerY, centerX, centerY, radius - ( centerY - radius ) * this._stereo );
			else
				grad = this._canvasCtx.createLinearGradient( 0, 0, isHorizontal ? this._canvas.width : 0, isHorizontal ? 0 : gradientHeight );

			const colorStops = this._gradients[ key ].colorStops;

			if ( colorStops ) {
				const dual = this._stereo && ! this._splitGradient && ! isHorizontal;

				// helper function
				const addColorStop = ( offset, colorInfo ) => grad.addColorStop( offset, typeof colorInfo == 'object' ? colorInfo.color : colorInfo );

				for ( let channel = 0; channel < 1 + dual; channel++ ) {
					colorStops.forEach( ( colorInfo, index ) => {

						const maxIndex = colorStops.length - 1;

						let offset = colorInfo.pos !== undefined ? colorInfo.pos : index / maxIndex;

						// in dual mode (not split), use half the original offset for each channel
						if ( dual )
							offset /= 2;

						// constrain the offset within the useful analyzer areas (avoid reflex areas)
						if ( this._stereo && ! isLumiBars && ! this._radial && ! isHorizontal ) {
							offset *= analyzerRatio;
							// skip the first reflex area in split mode
							if ( ! dual && offset > .5 * analyzerRatio )
								offset += .5 * this._reflexRatio;
						}

						// only for split mode
						if ( channel == 1 ) {
							// add colors in reverse order if radial or lumi are active
							if ( this._radial || isLumiBars ) {
								const revIndex = maxIndex - index;
								colorInfo = colorStops[ revIndex ];
								offset = 1 - ( colorInfo.pos !== undefined ? colorInfo.pos : revIndex / maxIndex ) / 2;
							}
							else {
								// if the first offset is not 0, create an additional color stop to prevent bleeding from the first channel
								if ( index == 0 && offset > 0 )
									addColorStop( .5, colorInfo );
								// bump the offset to the second half of the gradient
								offset += .5;
							}
						}

						// add gradient color stop
						addColorStop( offset, colorInfo );

						// create additional color stop at the end of first channel to prevent bleeding
						if ( this._stereo && index == maxIndex && offset < .5 )
							addColorStop( .5, colorInfo );
					});
				}
			}

			this._gradients[ key ].gradient = grad; // save the generated gradient back into the gradients array
		});
	}

	/**
	 * Generate the X-axis and radial scales in auxiliary canvases
	 */
	_createScales() {
		const tau         = 2 * Math.PI,
			  freqLabels  = [ 16, 31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000 ],
			  ctxScaleX   = this._scaleX.getContext('2d'),
			  ctxScaleR   = this._scaleR.getContext('2d'),
			  scaleHeight = this._canvas.height * .03 | 0; // circular scale height (radial mode)

		// in radial stereo mode, the scale is positioned exactly between both channels, by making the canvas a bit larger than the central diameter
		this._scaleR.width = this._scaleR.height = ( this._radius << 1 ) + ( this._stereo * scaleHeight );

		const radius  = this._scaleR.width >> 1, // this is also used as the center X and Y coordinates of the circular scale canvas
			  radialY = radius - scaleHeight * .7;	// vertical position of text labels in the circular scale

		// clear scale canvas
		this._scaleX.width |= 0;

		ctxScaleX.fillStyle = ctxScaleR.strokeStyle = '#000c';
		ctxScaleX.fillRect( 0, 0, this._scaleX.width, this._scaleX.height );

		ctxScaleR.arc( radius, radius, radius - scaleHeight / 2, 0, tau );
		ctxScaleR.lineWidth = scaleHeight;
		ctxScaleR.stroke();

		ctxScaleX.fillStyle = ctxScaleR.fillStyle = '#fff';
		ctxScaleX.font = `${ this._scaleX.height >> 1 }px sans-serif`;
		ctxScaleR.font = `${ scaleHeight >> 1 }px sans-serif`;
		ctxScaleX.textAlign = ctxScaleR.textAlign = 'center';

		for ( const freq of freqLabels ) {
			const label = ( freq >= 1000 ) ? `${ freq / 1000 }k` : freq,
				  x     = this._logWidth * ( Math.log10( freq ) - this._minLog );

			ctxScaleX.fillText( label, x, this._scaleX.height * .75 );

			// avoid overlapping wrap-around labels in the circular scale
			if ( x > 0 && x < this._canvas.width ) {
				const angle  = tau * ( x / this._canvas.width ),
					  adjAng = angle - Math.PI / 2, // rotate angles so 0 is at the top
					  posX   = radialY * Math.cos( adjAng ),
					  posY   = radialY * Math.sin( adjAng );

				ctxScaleR.save();
				ctxScaleR.translate( radius + posX, radius + posY );
				ctxScaleR.rotate( angle );
				ctxScaleR.fillText( label, 0, 0 );
				ctxScaleR.restore();
			}
		}
	}

	/**
	 * Precalculate the actual X-coordinate on screen for each analyzer bar
	 *
	 * Since the frequency scale is logarithmic, each position in the X-axis actually represents a power of 10.
	 * To improve performace, the position of each frequency is calculated in advance and stored in an array.
	 * Canvas space usage is optimized to accommodate exactly the frequency range the user needs.
	 * Positions need to be recalculated whenever the frequency range, FFT size or canvas size change.
	 *
	 *                              +-------------------------- canvas --------------------------+
	 *                              |                                                            |
	 *    |-------------------|-----|-------------|-------------------!-------------------|------|------------|
	 *    1                  10     |            100                  1K                 10K     |           100K (Hz)
	 * (10^0)              (10^1)   |          (10^2)               (10^3)              (10^4)   |          (10^5)
	 *                              |-------------|<--- logWidth ---->|--------------------------|
	 *                  minFreq--> 20                   (pixels)                                22K <--maxFreq
	 *                          (10^1.3)                                                     (10^4.34)
	 *                           minLog
	 */
	_calcBars() {

		if ( ! this._ready )
			return;

		// helper functions
		const binToFreq = bin => bin * this._audioCtx.sampleRate / this._analyzer[0].fftSize;
		const freqToBin = ( freq, rounding = 'round' ) => {
			const bin = Math[ rounding ]( freq * this._analyzer[0].fftSize / this._audioCtx.sampleRate );
			return bin < this._analyzer[0].frequencyBinCount ? bin : this._analyzer[0].frequencyBinCount - 1;
		}

		let minLog, logWidth;

		this._bars = [];

		if ( ! this._isOctaveBands ) {
		// Discrete frequencies or area fill modes
			this._barWidth = 1;

			minLog = Math.log10( this._minFreq );
			logWidth = this._canvas.width / ( Math.log10( this._maxFreq ) - minLog );

			const minIndex = freqToBin( this._minFreq, 'floor' );
			const maxIndex = freqToBin( this._maxFreq );

	 		let lastPos = -999;

			for ( let i = minIndex; i <= maxIndex; i++ ) {
				const freq = binToFreq( i ); // frequency represented by this index
				const pos  = Math.round( logWidth * ( Math.log10( freq ) - minLog ) ); // avoid fractionary pixel values

				// if it's on a different X-coordinate, create a new bar for this frequency
				if ( pos > lastPos ) {
					this._bars.push( { posX: pos, dataIdx: i, endIdx: 0, factor: 0, peak: [0,0], hold: [], accel: [] } );
					lastPos = pos;
				} // otherwise, add this frequency to the last bar's range
				else if ( this._bars.length )
					this._bars[ this._bars.length - 1 ].endIdx = i;
			}
		}
		else {
		// Octave bands modes

			// how many notes grouped in each band?
			let groupNotes;

			if ( this._mode == 8 )
				groupNotes = 24;
			else if ( this._mode == 7 )
				groupNotes = 12;
			else if ( this._mode == 6 )
				groupNotes = 8;
			else if ( this._mode == 5 )
				groupNotes = 6;
			else
				groupNotes = this._mode; // for modes 1, 2, 3 and 4

			// generate a table of frequencies based on the equal tempered scale

			const root24 = 2 ** ( 1 / 24 );
			const c0 = 440 * root24 ** -114; // ~16.35 Hz

			let temperedScale = [];
			let i = 0;
			let freq;

			while ( ( freq = c0 * root24 ** i ) <= this._maxFreq ) {
				if ( freq >= this._minFreq && i % groupNotes == 0 )
					temperedScale.push( freq );
				i++;
			}

			minLog = Math.log10( temperedScale[0] );
			logWidth = this._canvas.width / ( Math.log10( temperedScale[ temperedScale.length - 1 ] ) - minLog );

			// divide canvas space by the number of frequencies (bars) to display
			this._barWidth = this._canvas.width / temperedScale.length;

			let prevBin = 0;  // last bin included in previous frequency band
			let prevIdx = -1; // previous bar FFT array index
			let nBars   = 0;  // count of bars with the same index

			temperedScale.forEach( ( freq, index ) => {
				// which FFT bin best represents this frequency?
				const bin = freqToBin( freq );

				let idx, nextBin;
				// start from the last used FFT bin
				if ( prevBin > 0 && prevBin + 1 <= bin )
					idx = prevBin + 1;
				else
					idx = bin;

				// FFT does not provide many coefficients for low frequencies, so several bars may end up using the same data
				if ( idx == prevIdx ) {
					nBars++;
				}
				else {
					// update previous bars using the same index with a interpolation factor
					if ( nBars > 1 ) {
						for ( let i = 0; i < nBars; i++ )
							this._bars[ this._bars.length - nBars + i ].factor = ( i + 1 ) / nBars;
					}
					prevIdx = idx;
					nBars = 1;
				}

				prevBin = nextBin = bin;
				// check if there's another band after this one
				if ( temperedScale[ index + 1 ] !== undefined ) {
					nextBin = freqToBin( temperedScale[ index + 1 ] );
					// and use half the bins in between for this band
					if ( nextBin - bin > 1 )
						prevBin += Math.round( ( nextBin - bin ) / 2 );
				}

				const endIdx = prevBin - idx > 0 ? prevBin : 0;

				this._bars.push( {
					posX: index * this._barWidth,
					dataIdx: idx,
					endIdx,
//					freq, // nominal frequency for this band
//					range: [ binToFreq( idx ), binToFreq( endIdx || idx ) ], // actual range of frequencies
					factor: 0,
					peak: [0,0],
					hold: [],
					accel: []
				} );

			} );
		}

		// save these for scale generation
		this._minLog = minLog;
		this._logWidth = logWidth;

		// update internal variables
		this._calcAux();

		// generate the X-axis and radial scales
		this._createScales();

		// update LED properties
		this._calcLeds();
	}

	/**
	 * Internal function to change canvas dimensions on demand
	 */
	_setCanvas( reason ) {
		// if initialization is not finished, quit
		if ( ! this._ready )
			return;

		this._pixelRatio = window.devicePixelRatio; // for Retina / HiDPI devices

		if ( this._loRes )
			this._pixelRatio /= 2;

		this._fsWidth = Math.max( window.screen.width, window.screen.height ) * this._pixelRatio;
		this._fsHeight = Math.min( window.screen.height, window.screen.width ) * this._pixelRatio;

		const isFullscreen = this.isFullscreen,
			  newWidth  = isFullscreen ? this._fsWidth  : ( this._width  || this._container.clientWidth  || this._defaultWidth )  * this._pixelRatio | 0,
			  newHeight = isFullscreen ? this._fsHeight : ( this._height || this._container.clientHeight || this._defaultHeight ) * this._pixelRatio | 0;

		// workaround for wrong dPR reported on Android TV
		if ( this._pixelRatio == 2 && window.screen.height <= 540 )
			this._pixelRatio = 1;

		// if canvas dimensions haven't changed, quit
		if ( this._canvas.width == newWidth && this._canvas.height == newHeight )
			return;

		// apply new dimensions
		this._canvas.width  = newWidth;
		this._canvas.height = newHeight;

		// update internal variables
		this._calcAux();

		// if not in overlay mode, paint the canvas black
		if ( ! this.overlay ) {
			this._canvasCtx.fillStyle = '#000';
			this._canvasCtx.fillRect( 0, 0, this._canvas.width, this._canvas.height );
		}

		// set lineJoin property for area fill mode (this is reset whenever the canvas size changes)
		this._canvasCtx.lineJoin = 'bevel';

		// update dimensions of the scale canvas
		this._scaleX.width = this._canvas.width;
		this._scaleX.height = Math.max( 20 * this._pixelRatio, this._canvas.height / 27 | 0 );

		// (re)generate gradients
		this._makeGrads();

		// calculate bar positions and led options
		this._calcBars();

		// detect fullscreen changes (for Safari)
		if ( this._fsStatus !== undefined && this._fsStatus !== isFullscreen )
			reason = 'fschange';
		this._fsStatus = isFullscreen;

		// call the callback function, if defined
		if ( this.onCanvasResize )
			this.onCanvasResize( reason, this );
	}

	/**
	 * Set object properties
	 */
	_setProps( options, useDefaults ) {

		// settings defaults
		const defaults = {
			mode         : 0,
			fftSize      : 8192,
			minFreq      : 20,
			maxFreq      : 22000,
			smoothing    : 0.5,
			gradient     : 'classic',
			minDecibels  : -85,
			maxDecibels  : -25,
			showBgColor  : true,
			showLeds     : false,
			showScaleX   : true,
			showScaleY   : false,
			showPeaks    : true,
			showFPS      : false,
			lumiBars     : false,
			loRes        : false,
			reflexRatio  : 0,
			reflexAlpha  : 0.15,
			reflexBright : 1,
			reflexFit    : true,
			lineWidth    : 0,
			fillAlpha    : 1,
			barSpace     : 0.1,
			overlay      : false,
			bgAlpha      : 0.7,
			radial		 : false,
			spinSpeed    : 0,
			stereo       : false,
			splitGradient: false,
			start        : true,
			volume       : 1
		};

		// callback functions properties
		const callbacks = [ 'onCanvasDraw', 'onCanvasResize' ];

		// audioCtx is set only at initialization; we handle 'start' after setting all other properties
		const ignore = [ 'audioCtx', 'start' ];

		if ( useDefaults || options === undefined )
			options = Object.assign( defaults, options );

		for ( const prop of Object.keys( options ) ) {
			if ( callbacks.indexOf( prop ) !== -1 && typeof options[ prop ] !== 'function' ) // check invalid callback
				this[ prop ] = undefined;
			else if ( ignore.indexOf( prop ) === -1 ) // skip ignored properties
				this[ prop ] = options[ prop ];
		}

		if ( options.start !== undefined )
			this.toggleAnalyzer( options.start );
	}

}

/* Custom error class */

class AudioMotionError extends Error {
	constructor( code, message ) {
		super( message );
		this.name = 'AudioMotionError';
		this.code = code;
	}
}
