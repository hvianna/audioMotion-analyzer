/**
 * audioMotion-analyzer
 * High-resolution real-time graphic audio spectrum analyzer JS module
 *
 * @author  Henrique Avila Vianna <hvianna@gmail.com> <https://henriquevianna.com>
 * @license AGPL-3.0-or-later
 */

export default class AudioMotionAnalyzer {

/*
	TO DO:

	use public and private class fields and methods when they become standard?
	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Class_fields
*/

/**
 * CONSTRUCTOR
 *
 * @param {object} [container] DOM element where to insert the analyzer; if undefined, uses the document body
 * @param {object} [options]
 * @returns {object} AudioMotionAnalyzer object
 */
	constructor( container, options = {} ) {

		this._initDone = false;

		// Settings defaults

		let defaults = {
			mode        : 0,
			fftSize     : 8192,
			minFreq     : 20,
			maxFreq     : 22000,
			smoothing   : 0.5,
			gradient    : 'classic',
			minDecibels : -85,
			maxDecibels : -25,
			showBgColor : true,
			showLeds    : false,
			showScale   : true,
			showPeaks   : true,
			showFPS     : false,
			lumiBars    : false,
			loRes       : false,
			lineWidth   : 0,
			fillAlpha   : 1,
			barSpace    : 0.1,
			start       : true
		};

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
					'hsl( 240, 100%, 50% )',
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

		// Create audio context

		var AudioContext = window.AudioContext || window.webkitAudioContext;

		try {
			this.audioCtx = new AudioContext();
		}
		catch( err ) {
			throw 'Could not create audio context. Web Audio API not supported?';
		}

		// Create analyzer node, connect audio source (if provided) and connect it to the destination

		this.analyzer = this.audioCtx.createAnalyser();
		this._audioSource = ( options.source ) ? this.connectAudio( options.source ) : undefined;
		this.analyzer.connect( this.audioCtx.destination );

		// Create canvases

		// main spectrum analyzer canvas
		this.canvas = document.createElement('canvas');
		this.canvas.style = 'max-width: 100%;';
		this._container.appendChild( this.canvas );
		this.canvasCtx = this.canvas.getContext( '2d', { alpha: false } );

		// auxiliary canvas for the LED mask
		this._ledsMask = document.createElement('canvas');
		this._ledsCtx = this._ledsMask.getContext('2d');

		// auxiliary canvas for the X-axis scale labels
		this._labels = document.createElement('canvas');
		this._labelsCtx = this._labels.getContext('2d');

		// adjust canvas on window resize
		window.addEventListener( 'resize', () => {
			if ( ! this._width || ! this._height ) // fluid width or height
				this._setCanvas('resize');
		});

		// adjust canvas size on fullscreen change
		this.canvas.addEventListener( 'fullscreenchange', () => this._setCanvas('fschange') );

		// Set configuration options, using defaults for any missing properties

		this._setProperties( options, defaults );

		// Finish canvas setup

		this._initDone = true;
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
		this._barSpace = Number( value );
		this._calculateBarSpacePx();
		this._createLedMask();
	}

	// FFT size

	get fftSize() {
		return this.analyzer.fftSize;
	}
	set fftSize( value ) {
		this.analyzer.fftSize = value;
		this._dataArray = new Uint8Array( this.analyzer.frequencyBinCount );
		this._precalculateBarPositions();
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
		let mode = Number( value );
		if ( mode >= 0 && mode <= 10 && mode != 9 ) {
			this._mode = mode;
			this._precalculateBarPositions();
		}
		else
			throw `Invalid mode: ${mode}`;
	}

	// Low-resolution mode

	get loRes() {
		return this._loRes;
	}
	set loRes( value ) {
		this._loRes = Boolean( value );
		this._setCanvas('lores');
	}

	// Current frequency range

	get minFreq() {
		return this._minFreq;
	}
	set minFreq( value ) {
		this._minFreq = value;
		this._precalculateBarPositions();
	}
	get maxFreq() {
		return this._maxFreq;
	}
	set maxFreq( value ) {
		this._maxFreq = value;
		this._precalculateBarPositions();
	}

	// Analyzer's sensitivity

	get minDecibels() {
		return this.analyzer.minDecibels;
	}
	set minDecibels( value ) {
		this.analyzer.minDecibels = value;
	}
	get maxDecibels() {
		return this.analyzer.maxDecibels;
	}
	set maxDecibels( value ) {
		this.analyzer.maxDecibels = value;
	}

	// Analyzer's smoothing time constant

	get smoothing() {
		return this.analyzer.smoothingTimeConstant;
	}
	set smoothing( value ) {
		this.analyzer.smoothingTimeConstant = value;
	}

	// Read only properties

	get audioSource() {
		return this._audioSource;
	}
	get dataArray() {
		return this._dataArray;
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
		if ( document.fullscreenElement )
			return document.fullscreenElement === this.canvas;
		else if ( document.webkitFullscreenElement )
			return document.webkitFullscreenElement === this.canvas;
		else
			return false;
	}
	get isOn() {
		return this._animationReq !== undefined;
	}
	get pixelRatio() {
		return this._pixelRatio;
	}

	/**
	 * ==========================================================================
     *
	 * PUBLIC METHODS
	 *
	 * ==========================================================================
	 */

	/**
	 * Connect HTML audio element to analyzer
	 *
	 * @param {object} element HTML audio element
	 * @returns {object} a MediaElementAudioSourceNode object
	 */
	connectAudio( element ) {
		var audioSource = this.audioCtx.createMediaElementSource( element );
		audioSource.connect( this.analyzer );
		return audioSource;
	}

	/**
	 * Registers a custom gradient
	 *
	 * @param {string} name
	 * @param {object} options
	 */
	registerGradient( name, options ) {
		if ( typeof options !== 'object' )
			throw 'Custom gradient options must be an object';

		if ( options.colorStops === undefined || options.colorStops.length < 2 )
			throw 'Custom gradient must define at least two colors!';

		this._gradients[ name ] = {};

		if ( options.bgColor !== undefined )
			this._gradients[ name ].bgColor = options.bgColor;
		else
			this._gradients[ name ].bgColor = '#111';

		if ( options.dir !== undefined )
			this._gradients[ name ].dir = options.dir;

		this._gradients[ name ].colorStops = options.colorStops;

		this._generateGradients();
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
		this._minFreq = Math.min( min, max );
		this._maxFreq = Math.max( min, max );
		this._precalculateBarPositions();
	}

	/**
	 * Shorthand function for setting several options at once
	 *
	 * @param {object} options
	 */
	setOptions( options ) {
		this._setProperties( options );
	}

	/**
	 * Adjust the analyzer's sensitivity
	 *
	 * @param {number} min minimum decibels value
	 * @param {number} max maximum decibels value
	 */
	setSensitivity( min, max ) {
		this.analyzer.minDecibels = Math.min( min, max );
		this.analyzer.maxDecibels = Math.max( min, max );
	}

	/**
	 * Start / stop canvas animation
	 *
	 * @param {boolean} [value] if undefined, inverts the current status
	 * @returns {boolean} resulting status after the change
	 */
	toggleAnalyzer( value ) {
		var started = this.isOn;
		if ( value === undefined )
			value = ! started;

		if ( started && ! value ) {
			cancelAnimationFrame( this._animationReq );
			this._animationReq = undefined;
		}
		else if ( ! started && value ) {
			this.frame = this._fps = 0;
			this.time = performance.now();
			this._animationReq = requestAnimationFrame( () => this._draw() );
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
			if ( this.canvas.requestFullscreen )
				this.canvas.requestFullscreen();
			else if ( this.canvas.webkitRequestFullscreen )
				this.canvas.webkitRequestFullscreen();
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
	 * Calculate bar spacing in pixels
	 */
	_calculateBarSpacePx() {
		this._barSpacePx = Math.min( this._barWidth - 1, ( this._barSpace > 0 && this._barSpace < 1 ) ? this._barWidth * this._barSpace : this._barSpace );
	}

	/**
	 * Create mask for vintage LED effect on auxiliary canvas
	 */
	_createLedMask() {
		// no need for this if in discrete frequencies or area fill modes
		if ( this._mode % 10 == 0 )
			return;

		// calculates the best attributes for the LEDs effect, based on the visualization mode and canvas resolution

		let nLeds,
			spaceV = Math.min( 6, this.canvas.height / ( 90 * this._pixelRatio ) | 0 ); // for modes 3, 4, 5 and 6

		switch ( this._mode ) {
			case 8:
				spaceV = Math.min( 16, this.canvas.height / ( 33 * this._pixelRatio ) | 0 );
				nLeds = 24;
				break;
			case 7:
				spaceV = Math.min( 8, this.canvas.height / ( 67 * this._pixelRatio ) | 0 );
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
				spaceV = Math.min( 4, this.canvas.height / ( 135 * this._pixelRatio ) | 0 );
				nLeds = 128;
				break;
			case 1:
				spaceV = Math.min( 3, Math.max( 2, this.canvas.height / ( 180 * this._pixelRatio ) | 0 ) );
				nLeds = 128;
		}

		spaceV *= this._pixelRatio;
		nLeds = Math.min( nLeds, ( this.canvas.height + spaceV ) / ( spaceV * 2 ) | 0 );

		this._ledOptions = {
			nLeds,
			spaceH: this._barWidth * ( this._mode == 1 ? .45 : this._mode < 5 ? .225 : .125 ),
			spaceV,
			ledHeight: ( this.canvas.height + spaceV ) / nLeds - spaceV
		};

		// use either the LEDs default horizontal space or the user selected bar space, whichever is larger
		const spacing = Math.max( this._ledOptions.spaceH, this._barSpacePx );

		// clear the auxiliary canvas
		this._ledsMask.width |= 0;

		// add a vertical black line to the left of each bar to create the LED columns
		this._analyzerBars.forEach( bar => this._ledsCtx.fillRect( bar.posX - spacing / 2, 0, spacing, this.canvas.height ) );

		// add a vertical black line in the mask canvas after the last led column
		this._ledsCtx.fillRect( this._analyzerBars[ this._analyzerBars.length - 1 ].posX + this._barWidth - spacing / 2, 0, spacing, this.canvas.height );

		// add horizontal black lines to create the LED rows
		for ( let i = this._ledOptions.ledHeight; i < this.canvas.height; i += this._ledOptions.ledHeight + this._ledOptions.spaceV )
			this._ledsCtx.fillRect( 0, i, this.canvas.width, this._ledOptions.spaceV );
	}

	/**
	 * Redraw the canvas
	 * this is called 60 times per second by requestAnimationFrame()
	 */
	_draw() {

		var i, j, l, bar, barHeight, size, posX, width,
			isLedDisplay = ( this.showLeds && this._mode > 0 && this._mode < 10 ),
			isLumiBars   = ( this.lumiBars && this._mode > 0 && this._mode < 10 );

		if ( ! this.showBgColor )	// use black background
			this.canvasCtx.fillStyle = '#000';
		else
			if ( isLedDisplay )
				this.canvasCtx.fillStyle = '#111';
			else
				this.canvasCtx.fillStyle = this._gradients[ this.gradient ].bgColor; // use background color defined by gradient

		// clear the canvas
		this.canvasCtx.fillRect( 0, 0, this.canvas.width, this.canvas.height );

		// get a new array of data from the FFT
		this.analyzer.getByteFrequencyData( this._dataArray );

		// set selected gradient
		this.canvasCtx.fillStyle = this._gradients[ this.gradient ].gradient;

		// if in "area fill" mode, start the drawing path
		if ( this._mode == 10 ) {
			this.canvasCtx.beginPath();
			this.canvasCtx.moveTo( -this.lineWidth, this.canvas.height );
		}

		// compute the effective bar width, considering the selected bar spacing
		// if led effect is active, ensure at least the spacing defined by the led options
		width = this._barWidth - ( ! ( this._mode % 10 ) ? 0 : Math.max( isLedDisplay ? this._ledOptions.spaceH : 0, this._barSpacePx ) );

		// if no bar spacing is required, make sure width is integer for pixel accurate calculation
		if ( this._barSpace == 0 && ! isLedDisplay )
			width |= 0;

		// draw bars / lines
		l = this._analyzerBars.length;
		for ( i = 0; i < l; i++ ) {

			bar = this._analyzerBars[ i ];

			if ( bar.endIdx == 0 ) { // single FFT bin
				barHeight = this._dataArray[ bar.dataIdx ];
				// apply smoothing factor when several bars share the same bin
				if ( bar.factor )
					barHeight += ( this._dataArray[ bar.dataIdx + 1 ] - barHeight ) * bar.factor;
			}
			else { 					// range of bins
				barHeight = 0;
				// use the highest value in the range
				for ( j = bar.dataIdx; j <= bar.endIdx; j++ )
					barHeight = Math.max( barHeight, this._dataArray[ j ] );
			}

			// set opacity for lumi bars before barHeight value is normalized
			if ( isLumiBars )
				this.canvasCtx.globalAlpha = barHeight / 255;

			if ( isLedDisplay ) // normalize barHeight to match one of the "led" elements
				barHeight = ( barHeight / 255 * this._ledOptions.nLeds | 0 ) * ( this._ledOptions.ledHeight + this._ledOptions.spaceV ) - this._ledOptions.spaceV;
			else
				barHeight = barHeight / 255 * this.canvas.height | 0;

			if ( barHeight >= bar.peak ) {
				bar.peak = barHeight;
				bar.hold = 30; // set peak hold time to 30 frames (0.5s)
				bar.accel = 0;
			}

			posX = bar.posX;
			let adjWidth = width; // bar width may need small adjustments for some bars, when barSpace == 0

			// Draw line / bar
			if ( this._mode == 10 ) {
				this.canvasCtx.lineTo( bar.posX, this.canvas.height - barHeight );
			}
			else {
				if ( this._mode > 0 ) {
					if ( isLedDisplay )
						posX += Math.max( this._ledOptions.spaceH / 2, this._barSpacePx / 2 );
					else {
						if ( this._barSpace == 0 ) {
							posX |= 0;
							if ( i > 0 && posX > this._analyzerBars[ i - 1 ].posX + width ) {
								posX--;
								adjWidth++;
							}
						}
						else
							posX += this._barSpacePx / 2;
					}
				}

				if ( isLumiBars ) {
					this.canvasCtx.fillRect( posX, 0, adjWidth, this.canvas.height );
					this.canvasCtx.globalAlpha = 1;
				}
				else
					this.canvasCtx.fillRect( posX, this.canvas.height, adjWidth, -barHeight );
			}

			// Draw peak
			if ( bar.peak > 0 ) {
				if ( this.showPeaks && ! isLumiBars ) {
					if ( isLedDisplay ) {
						this.canvasCtx.fillRect(
							posX,
							( this._ledOptions.nLeds - bar.peak / ( this.canvas.height + this._ledOptions.spaceV ) * this._ledOptions.nLeds | 0 ) * ( this._ledOptions.ledHeight + this._ledOptions.spaceV ),
							width,
							this._ledOptions.ledHeight
						);
					}
					else
						this.canvasCtx.fillRect( posX, this.canvas.height - bar.peak, adjWidth, 2 );
				}

				if ( bar.hold )
					bar.hold--;
				else {
					bar.accel++;
					bar.peak -= bar.accel;
				}
			}
		} // for ( i = 0; i < l; i++ )

		if ( this._mode == 10 ) { // fill area
			this.canvasCtx.lineTo( bar.posX + this.lineWidth, this.canvas.height );

			if ( this.lineWidth > 0 ) {
				this.canvasCtx.lineWidth = this.lineWidth;
				this.canvasCtx.strokeStyle = this.canvasCtx.fillStyle;
				this.canvasCtx.stroke();
			}

			if ( this.fillAlpha > 0 ) {
				this.canvasCtx.globalAlpha = this.fillAlpha;
				this.canvasCtx.fill();
				this.canvasCtx.globalAlpha = 1;
			}
		}
		else if ( isLedDisplay ) // applies LEDs mask over the canvas
			this.canvasCtx.drawImage( this._ledsMask, 0, 0 );

		if ( this.showScale )
			this.canvasCtx.drawImage( this._labels, 0, this.canvas.height - this._labels.height );

		this.frame++;
		var now = performance.now();
		var elapsed = now - this.time;
		if ( elapsed >= 1000 ) {
			this._fps = this.frame / ( elapsed / 1000 );
			this.frame = 0;
			this.time = now;
		}
		if ( this.showFPS ) {
			size = 20 * this._pixelRatio;
			this.canvasCtx.font = `bold ${size}px sans-serif`;
			this.canvasCtx.fillStyle = '#0f0';
			this.canvasCtx.textAlign = 'right';
			this.canvasCtx.fillText( Math.round( this._fps ), this.canvas.width - size, size * 2 );
		}

		if ( this.onCanvasDraw ) {
			this.canvasCtx.save();
			this.onCanvasDraw( this );
			this.canvasCtx.restore();
		}

		// schedule next canvas update
		this._animationReq = requestAnimationFrame( () => this._draw() );
	}

	/**
	 * Generate gradients
	 */
	_generateGradients() {
		let grad;

		Object.keys( this._gradients ).forEach( key => {
			if ( this._gradients[ key ].dir && this._gradients[ key ].dir == 'h' )
				grad = this.canvasCtx.createLinearGradient( 0, 0, this.canvas.width, 0 );
			else
				grad = this.canvasCtx.createLinearGradient( 0, 0, 0, this.canvas.height );

			if ( this._gradients[ key ].colorStops ) {
				this._gradients[ key ].colorStops.forEach( ( colorInfo, index ) => {
					if ( typeof colorInfo == 'object' )
						grad.addColorStop( colorInfo.pos, colorInfo.color );
					else
						grad.addColorStop( index / ( this._gradients[ key ].colorStops.length - 1 ), colorInfo );
				});
			}

			this._gradients[ key ].gradient = grad; // save the generated gradient back into the gradients array
		});
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
	 *                              |-------------|<--- bandWidth --->|--------------------------|
	 *                  minFreq--> 20                   (pixels)                                22K <--maxFreq
	 *                          (10^1.3)                                                     (10^4.34)
	 *                           minLog
	 */
	_precalculateBarPositions() {

		if ( ! this._initDone )
			return;

		const minLog = Math.log10( this._minFreq ),
			  bandWidth = this.canvas.width / ( Math.log10( this._maxFreq ) - minLog );

		this._analyzerBars = [];

		if ( this._mode % 10 == 0 ) {
		// Discrete frequencies or area fill modes
			this._barWidth = 1;

			const minIndex = Math.floor( this._minFreq * this.analyzer.fftSize / this.audioCtx.sampleRate ),
			      maxIndex = Math.min( Math.round( this._maxFreq * this.analyzer.fftSize / this.audioCtx.sampleRate ), this.analyzer.frequencyBinCount - 1 );

	 		let lastPos = -999;

			for ( let i = minIndex; i <= maxIndex; i++ ) {
				let freq = i * this.audioCtx.sampleRate / this.analyzer.fftSize; // frequency represented in this bin
				let pos = Math.round( bandWidth * ( Math.log10( freq ) - minLog ) ); // avoid fractionary pixel values

				// if it's on a different X-coordinate, create a new bar for this frequency
				if ( pos > lastPos ) {
					this._analyzerBars.push( { posX: pos, dataIdx: i, endIdx: 0, factor: 0, peak: 0, hold: 0, accel: 0 } );
					lastPos = pos;
				} // otherwise, add this frequency to the last bar's range
				else if ( this._analyzerBars.length )
					this._analyzerBars[ this._analyzerBars.length - 1 ].endIdx = i;
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
			const root24 = 2 ** ( 1 / 24 ),
				  c0 = 440 * root24 ** -114;

			let temperedScale = [],
				i = 0,
				freq;

			while ( ( freq = c0 * root24 ** i ) <= this._maxFreq ) {
				if ( freq >= this._minFreq && i % groupNotes == 0 )
					temperedScale.push( freq );
				i++;
			}

			// divide canvas space by the number of frequencies (bars) to display
			this._barWidth = this.canvas.width / temperedScale.length;
			this._calculateBarSpacePx();

			let prevBin = 0,  // last bin included in previous frequency band
				prevIdx = -1, // previous bar FFT array index
				nBars   = 0;  // count of bars with the same index

			temperedScale.forEach( ( freq, index ) => {
				// which FFT bin represents this frequency?
				let bin = Math.round( freq * this.analyzer.fftSize / this.audioCtx.sampleRate );

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
					// update previous bars using the same index with a smoothing factor
					if ( nBars > 1 ) {
						for ( let i = 1; i <= nBars; i++ )
							this._analyzerBars[ this._analyzerBars.length - i ].factor = ( nBars - i ) / nBars;
					}
					prevIdx = idx;
					nBars = 1;
				}

				prevBin = nextBin = bin;
				// check if there's another band after this one
				if ( temperedScale[ index + 1 ] !== undefined ) {
					nextBin = Math.round( temperedScale[ index + 1 ] * this.analyzer.fftSize / this.audioCtx.sampleRate );
					// and use half the bins in between for this band
					if ( nextBin - bin > 1 )
						prevBin += Math.round( ( nextBin - bin ) / 2 );
				}

				this._analyzerBars.push( {
					posX: index * this._barWidth,
					dataIdx: idx,
					endIdx: prevBin - idx > 0 ? prevBin : 0,
					factor: 0,
					peak: 0,
					hold: 0,
					accel: 0
				} );

			} );
		}

		this._createLedMask();

		// Create the X-axis scale in the auxiliary canvas

		this._labels.width |= 0; // clear canvas
		this._labelsCtx.fillStyle = '#000c';
		this._labelsCtx.fillRect( 0, 0, this._labels.width, this._labels.height );

		this._labelsCtx.fillStyle = '#fff';
		this._labelsCtx.font = `${ this._labels.height / 2 }px sans-serif`;
		this._labelsCtx.textAlign = 'center';

		let freqLabels = [ 16, 31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000 ];

		for ( let freq of freqLabels ) {
			this._labelsCtx.fillText(
				( freq >= 1000 ) ? `${ freq / 1000 }k` : freq,
				bandWidth * ( Math.log10( freq ) - minLog ),
				this._labels.height * .75
			);
		}
	}

	/**
	 * Internal function to change canvas dimensions on demand
	 */
	_setCanvas( reason ) {
		if ( ! this._initDone )
			return;

		this._pixelRatio = window.devicePixelRatio; // for Retina / HiDPI devices

		if ( this._loRes )
			this._pixelRatio /= 2;

		this._fsWidth = Math.max( window.screen.width, window.screen.height ) * this._pixelRatio;
		this._fsHeight = Math.min( window.screen.height, window.screen.width ) * this._pixelRatio;

		if ( this.isFullscreen ) {
			this.canvas.width = this._fsWidth;
			this.canvas.height = this._fsHeight;
		}
		else {
			this.canvas.width = ( this._width || this._container.clientWidth || this._defaultWidth ) * this._pixelRatio;
			this.canvas.height = ( this._height || this._container.clientHeight || this._defaultHeight ) * this._pixelRatio;
		}

		// workaround for wrong dPR reported on Android TV
		if ( this._pixelRatio == 2 && window.screen.height <= 540 )
			this._pixelRatio = 1;

		// clear the canvas
		this.canvasCtx.fillStyle = '#000';
		this.canvasCtx.fillRect( 0, 0, this.canvas.width, this.canvas.height );

		// set lineJoin property for area fill mode (this is reset whenever the canvas size changes)
		this.canvasCtx.lineJoin = 'bevel';

		// (re)generate gradients
		this._generateGradients();

		// update LED mask canvas dimensions
		this._ledsMask.width = this.canvas.width;
		this._ledsMask.height = this.canvas.height;

		// update labels canvas dimensions
		this._labels.width = this.canvas.width;
		this._labels.height = this._pixelRatio * ( this.isFullscreen ? 40 : 20 );

		// calculate bar positions and led options
		this._precalculateBarPositions();

		// call callback function, if defined
		if ( this.onCanvasResize )
			this.onCanvasResize( reason, this );
	}

	/**
	 * Set object properties
	 */
	_setProperties( options, defaults ) {

		let callbacks = [ 'onCanvasDraw', 'onCanvasResize' ];

		if ( defaults ) {
			for ( let prop of Object.keys( defaults ) ) {
				if ( ! options.hasOwnProperty( prop ) )
					options[ prop ] = defaults[ prop ];
			}
		}

		for ( let prop of Object.keys( options ) ) {
			// check for invalid callback
			if ( callbacks.indexOf( prop ) !== -1 && typeof options[ prop ] !== 'function' )
				this[ prop ] = undefined;
			else if ( prop !== 'start' ) // we deal with this after all other options are set
				this[ prop ] = options[ prop ];
		}

		if ( options.start !== undefined )
			this.toggleAnalyzer( options.start );
	}

}
