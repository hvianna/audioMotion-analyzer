/**
 * audioMotion-analyzer.js
 * High-resolution real-time graphic audio spectrum analyzer JS module
 *
 * https://github.com/hvianna/audioMotion.js
 *
 * @author    Henrique Vianna <hvianna@gmail.com>
 * @copyright (c) 2018-2019 Henrique Avila Vianna
 * @license   AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

export default class AudioMotionAnalyzer {

/*
	TO DO:

	use public and private class fields..
	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Class_fields

	// current visualization settings
	mode, minFreq, maxFreq, gradient, showBgColor, showLeds, showScale, showPeaks, loRes, showFPS;

	// Web Audio API related variables
	audioCtx, analyzer, dataArray;

	// data for drawing the analyzer bars and scale-related variables
	#analyzerBars, #barWidth, #ledOptions, #freqLabels;

	// canvas-related variables
	canvas, canvasCtx, pixelRatio, width, height, fsWidth, fsHeight, fps;
	#animationReq, #drawCallback, #ledsMask, #ledsCtx, #time, #frame, #canvasResizeCallback;

	// settings defaults and gradient definitions
	#defaults, #gradients;

*/

/**
 * Constructor
 *
 * @param {object} [container] DOM element where to insert the analyzer; if undefined, uses the document body
 * @param {object} [options]
 * @returns {object} MediaElementAudioSourceNode object to connected audio source
 */
	constructor( container, options = {} ) {

		// Settings defaults

		this.defaults = {
			mode        : 0,
			fftSize     : 8192,
			minFreq     : 20,
			maxFreq     : 22000,
			smoothing   : 0.5,
			gradient    : 'classic',
			minDb       : -85,
			maxDb       : -25,
			showBgColor : true,
			showLeds    : false,
			showScale   : true,
			showPeaks   : true,
			showFPS     : false,
			loRes       : false,
			width       : 640,
			height      : 270
		};

		// Gradient definitions

		this.gradients = {
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
					'hsl( 180, 100%, 50% )',
					'hsl( 240, 100%, 50% )',
					'hsl( 300, 100%, 50% )',
					'hsl( 360, 100%, 50% )'
				]
			},
		};

		// Container defaults to document body

		if ( ! container )
			container = document.body;

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
		this.audioSource = ( options.source ) ? this.connectAudio( options.source ) : undefined;
		this.analyzer.connect( this.audioCtx.destination );

		// Adjust settings

		this.defaults.width  = container.clientWidth  || this.defaults.width;
		this.defaults.height = container.clientHeight || this.defaults.height;

		this.mode        = options.mode        === undefined ? this.defaults.mode        : Number( options.mode );
		this.minFreq     = options.minFreq     === undefined ? this.defaults.minFreq     : options.minFreq;
		this.maxFreq     = options.maxFreq     === undefined ? this.defaults.maxFreq     : options.maxFreq;
		this.gradient    = options.gradient    === undefined ? this.defaults.gradient    : options.gradient;
		this.showBgColor = options.showBgColor === undefined ? this.defaults.showBgColor : options.showBgColor;
		this.showLeds    = options.showLeds    === undefined ? this.defaults.showLeds    : options.showLeds;
		this.showScale   = options.showScale   === undefined ? this.defaults.showScale   : options.showScale;
		this.showPeaks   = options.showPeaks   === undefined ? this.defaults.showPeaks   : options.showPeaks;
		this.showFPS     = options.showFPS     === undefined ? this.defaults.showFPS     : options.showFPS;
		this.loRes       = options.loRes       === undefined ? this.defaults.loRes       : options.loRes;
		this.width       = options.width       === undefined ? this.defaults.width       : options.width;
		this.height      = options.height      === undefined ? this.defaults.height      : options.height;

		this.analyzer.fftSize               = options.fftSize   === undefined ? this.defaults.fftSize   : options.fftSize;
		this.analyzer.smoothingTimeConstant = options.smoothing === undefined ? this.defaults.smoothing : options.smoothing;
		this.analyzer.minDecibels           = options.minDb     === undefined ? this.defaults.minDb     : options.minDb;
		this.analyzer.maxDecibels           = options.maxDb     === undefined ? this.defaults.maxDb     : options.maxDb;

		this.dataArray = new Uint8Array( this.analyzer.frequencyBinCount );

		this.drawCallback = ( typeof options.onCanvasDraw == 'function' ) ? options.onCanvasDraw : undefined;
		this.canvasResizeCallback = ( typeof options.onCanvasResize == 'function' ) ? options.onCanvasResize : undefined;

		// Create canvas

		this.canvas = document.createElement('canvas');
		this.canvas.style = 'max-width: 100%;';
		container.appendChild( this.canvas );
		this.canvasCtx = this.canvas.getContext( '2d', { alpha: false } );
		this.setCanvas('create');

		// adjust canvas on window resize / fullscreen change
		window.addEventListener( 'resize', () => {
			this.width = options.width || container.clientWidth || this.defaults.width;
			this.height = options.height || container.clientHeight || this.defaults.height;
			this.setCanvas('resize');
		});

		this.canvas.addEventListener( 'fullscreenchange', () => this.setCanvas('resize') ); // required for Firefox Android TV

		// Start analyzer
		if ( options.start !== false )
			this.toggleAnalyzer( true );

	}


	/**
	 * Checks if the analyzer is being displayed in fullscreen mode
	 *
	 * @returns {boolean}
	 */
	isFullscreen() {
		if ( document.fullscreenElement )
			return document.fullscreenElement === this.canvas;
		else if ( document.webkitFullscreenElement )
			return document.webkitFullscreenElement === this.canvas;
	}

	/**
	 * Checks if the analyzer canvas animation is running or not
	 *
	 * @returns {boolean}
	 */
	isOn() {
		return this.animationReq !== undefined;
	}

	/**
	 * Set dimensions of analyzer's canvas
	 *
	 * @param {number} [w] width in pixels
	 * @param {number} [h] height in pixels
	 */
	setCanvasSize( w = this.defaults.width, h = this.defaults.height ) {
		this.width = w;
		this.height = h;
		this.setCanvas('user');
	}

	/**
	 * Set callback function for canvas draw
	 *
	 * @param {function} [func] if undefined or not a function, clears any previously set function
	 */
	setCanvasDrawCallback( func ) {
		this.drawCallback = ( typeof func == 'function' ) ? func : undefined;
	}

	/**
	 * Set callback function for canvas resize
	 *
	 * @param {function} [func] if undefined or not a function, clears any previously set function
	 */
	setCanvasResizeCallback( func ) {
		this.canvasResizeCallback = ( typeof func == 'function' ) ? func : undefined;
	}

	/**
	 * Set visualization mode
	 *
	 * @param {number} [value]
	 */
	setMode( value = this.defaults.mode ) {
		this.mode = Number( value );
		this.preCalcPosX();
	}

	/**
	 * Set the size of the FFT performed by the analyzer node
	 *
	 * @param {number} [value]
	 */
	setFFTSize( value = this.defaults.fftSize ) {
		this.analyzer.fftSize = value;
		this.dataArray = new Uint8Array( this.analyzer.frequencyBinCount );
		this.preCalcPosX();
	}

	/**
	 * Set desired frequency range
	 *
	 * @param {number} [min] lowest frequency represented in the x-axis
	 * @param {number} [max] highest frequency represented in the x-axis
	 */
	setFreqRange( min = this.defaults.minFreq, max = this.defaults.maxFreq ) {
		this.minFreq = Math.min( min, max );
		this.maxFreq = Math.max( min, max );
		this.preCalcPosX();
	}

	/**
	 * Set the analyzer's smoothing time constant
	 *
	 * @param {number} [value] float value from 0 to 1
	 */
	setSmoothing( value = this.defaults.smoothing ) {
		this.analyzer.smoothingTimeConstant = value;
	}

	/**
	 * Select gradient
	 *
	 * @param {string} [name] name of a built-in or previously registered gradient
	 */
	setGradient( name = this.defaults.gradient ) {
		this.gradient = name;
	}

	/**
	 * Toggle peaks on/off
	 *
	 * @param {boolean} [value] if undefined, inverts the current status
	 * @returns {boolean} resulting status after the change
	 */
	togglePeaks( value ) {
		return this.showPeaks = ( value === undefined ) ? ! this.showPeaks : value;
	}

	/**
	 * Toggle background color on/off
	 *
	 * @param {boolean} [value] if undefined, inverts the current status
	 * @returns {boolean} resulting status after the change
	 */
	toggleBgColor( value ) {
		return this.showBgColor = ( value === undefined ) ? ! this.showBgColor : value;
	}

	/**
	 * Toggle FPS display
	 *
	 * @param {boolean} [value] if undefined, inverts the current status
	 * @returns {boolean} resulting status after the change
	 */
	toggleFPS( value ) {
		return this.showFPS = ( value === undefined ) ? ! this.showFPS : value;
	}

	/**
	 * Toggle LED effect on/off
	 *
	 * @param {boolean} [value] if undefined, inverts the current status
	 * @returns {boolean} resulting status after the change
	 */
	toggleLeds( value ) {
		return this.showLeds = ( value === undefined ) ? ! this.showLeds : value;
	}

	/**
	 * Toggle scale on/off
	 *
	 * @param {boolean} [value] if undefined, inverts the current status
	 * @returns {boolean} resulting status after the change
	 */
	toggleScale ( value ) {
		return this.showScale = ( value === undefined ) ? ! this.showScale : value;
	}

	/**
	 * Toggle low-resolution mode on/off
	 *
	 * @param {boolean} [value] if undefined, inverts the current status
	 * @returns {boolean} resulting status after the change
	 */
	toggleLoRes ( value ) {
		this.loRes = ( value === undefined ) ? ! this.loRes : value;
		this.setCanvas('lores');
		return this.loRes;
	}

	/**
	 * Adjust the analyzer's sensitivity
	 *
	 * @param {number} [min] min decibels value
	 * @param {number} [max] max decibels value
	 */
	setSensitivity( min = this.defaults.minDb, max = this.defaults.maxDb ) {
		this.analyzer.minDecibels = Math.min( min, max );
		this.analyzer.maxDecibels = Math.max( min, max );
	}

	/**
	 * Shorthand to setting several options at once
	 *
	 * @param {object} options
	 */
	setOptions( options ) {

		if ( options.mode !== undefined )
			this.mode = Number( options.mode );

		if ( options.minFreq !== undefined )
			this.minFreq = options.minFreq;

		if ( options.maxFreq !== undefined )
			this.maxFreq = options.maxFreq;

		if ( options.gradient !== undefined )
			this.gradient = options.gradient;

		if ( options.showBgColor !== undefined )
			this.showBgColor = options.showBgColor;

		if ( options.showLeds !== undefined )
			this.showLeds = options.showLeds;

		if ( options.showScale !== undefined )
			this.showScale = options.showScale;

		if ( options.minDb !== undefined )
			this.analyzer.minDecibels = options.minDb;

		if ( options.maxDb !== undefined )
			this.analyzer.maxDecibels = options.maxDb;

		if ( options.showPeaks !== undefined )
			this.showPeaks = options.showPeaks;

		if ( options.showFPS !== undefined )
			this.showFPS = options.showFPS;

		if ( options.loRes !== undefined )
			this.loRes = options.loRes;

		if ( options.fftSize !== undefined )
			this.analyzer.fftSize = options.fftSize;

		if ( options.smoothing !== undefined )
			this.analyzer.smoothingTimeConstant = options.smoothing;

		if ( typeof options.onCanvasDraw == 'function' )
			this.drawCallback = options.onCanvasDraw;

		if ( typeof options.onCanvasResize == 'function' )
			this.canvasResizeCallback = options.onCanvasDraw;

		if ( options.width !== undefined )
			this.width = options.width;

		if ( options.height !== undefined )
			this.height = options.height;

		this.dataArray = new Uint8Array( this.analyzer.frequencyBinCount );

		this.setCanvas('user');
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

		this.gradients[ name ] = {};

		if ( options.bgColor !== undefined )
			this.gradients[ name ].bgColor = options.bgColor;
		else
			this.gradients[ name ].bgColor = '#111';

		if ( options.dir !== undefined )
			this.gradients[ name ].dir = options.dir;

		this.gradients[ name ].colorStops = options.colorStops;

		this.generateGradients();
	}

	/**
	 * Pre-calculate the actual X-coordinate on screen for each analyzer bar
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
	preCalcPosX() {

		var i, freq,
			minLog = Math.log10( this.minFreq ),
			bandWidth = this.canvas.width / ( Math.log10( this.maxFreq ) - minLog );

		this.analyzerBars = [];

		if ( this.mode == 0 ) { // discrete frequencies mode
			this.barWidth = 1;

	 		var pos,
	 			lastPos = -1,
				minIndex = Math.floor( this.minFreq * this.analyzer.fftSize / this.audioCtx.sampleRate ),
			    maxIndex = Math.min( Math.round( this.maxFreq * this.analyzer.fftSize / this.audioCtx.sampleRate ), this.analyzer.frequencyBinCount - 1 );

			for ( i = minIndex; i <= maxIndex; i++ ) {
				freq = i * this.audioCtx.sampleRate / this.analyzer.fftSize; // frequency represented in this bin
				pos = Math.round( bandWidth * ( Math.log10( freq ) - minLog ) ); // avoid fractionary pixel values

				// if it's on a different X-coordinate, create a new bar for this frequency
				if ( pos > lastPos ) {
					this.analyzerBars.push( { posX: pos, dataIdx: i, endIdx: 0, average: false, peak: 0, hold: 0, accel: 0 } );
					lastPos = pos;
				} // otherwise, add this frequency to the last bar's range
				else if ( this.analyzerBars.length )
					this.analyzerBars[ this.analyzerBars.length - 1 ].endIdx = i;
			}
		}
		else { // octave bands modes

			var spaceV = Math.min( 6, this.canvas.height / ( 90 * this.pixelRatio ) | 0 ), // for modes 3, 4, 5 and 6
				groupnotes = this.mode; // for modes 1, 2, 3 and 4

			// calculates the best attributes for the LEDs effect, based on the visualization mode and canvas resolution

			switch ( this.mode ) {
				case 8:
					groupnotes = 24;
					spaceV = Math.min( 16, this.canvas.height / ( 33 * this.pixelRatio ) | 0 );
					this.ledOptions = {
						nLeds: 24,
						spaceH: Math.min( 24, this.canvas.width / ( 40 * this.pixelRatio ) | 0 )
					};
					break;

				case 7:
					groupnotes = 12;
					spaceV = Math.min( 8, this.canvas.height / ( 67 * this.pixelRatio ) | 0 );
					this.ledOptions = {
						nLeds: 48,
						spaceH: Math.min( 16, this.canvas.width / ( 60 * this.pixelRatio ) | 0 )
					};
					break;

				case 6:
					groupnotes = 8;
					this.ledOptions = {
						nLeds: 64,
						spaceH: Math.min( 10, this.canvas.width / ( 96 * this.pixelRatio ) | 0 )
					};
					break;

				case 5:
					groupnotes = 6;
				case 4:
					this.ledOptions = {
						nLeds: 80,
						spaceH: Math.min( 8, this.canvas.width / ( 120 * this.pixelRatio ) | 0 )
					};
					break;

				case 3:
					this.ledOptions = {
						nLeds: 96,
						spaceH: Math.min( 6, this.canvas.width / ( 160 * this.pixelRatio ) | 0 )
					};
					break;

				case 2:
					spaceV = Math.min( 4, this.canvas.height / ( 135 * this.pixelRatio ) | 0 );
					this.ledOptions = {
						nLeds: 128,
						spaceH: Math.min( 4, this.canvas.width / ( 240 * this.pixelRatio ) | 0 )
					};
					break;

				default:
					mode = groupnotes = 1; // convert any invalid mode to mode 1
					spaceV = Math.min( 3, Math.max( 2, this.canvas.height / ( 180 * this.pixelRatio ) | 0 ) );
					this.ledOptions = {
						nLeds: 128,
						spaceH: Math.min( 4, this.canvas.width / ( 320 * this.pixelRatio ) | 0 )
					};
			}

			this.ledOptions.spaceH *= this.pixelRatio;
			this.ledOptions.spaceV = spaceV * this.pixelRatio;
			this.ledOptions.nLeds = Math.min( this.ledOptions.nLeds, this.canvas.height / ( this.ledOptions.spaceV * 2 ) | 0 );
			this.ledOptions.ledHeight = this.canvas.height / this.ledOptions.nLeds - this.ledOptions.spaceV;

			// generate a table of frequencies based on the equal tempered scale
			var root24 = 2 ** ( 1 / 24 ); // for 1/24th-octave bands
			var c0 = 440 * root24 ** -114;
			var temperedScale = [];
			var prevBin = 0;

			i = 0;
			while ( ( freq = c0 * root24 ** i ) <= this.maxFreq ) {
				if ( freq >= this.minFreq && i % groupnotes == 0 )
					temperedScale.push( freq );
				i++;
			}

			// divide canvas space by the number of frequencies to display, allowing at least one pixel between bars
			this.barWidth = Math.floor( this.canvas.width / temperedScale.length ) - 1;

			// the space remaining from the integer division is split equally among the bars as separator
			var barSpace = ( this.canvas.width - this.barWidth * temperedScale.length ) / ( temperedScale.length - 1 );

			this.ledsMask.width |= 0; // clear LEDs mask canvas

			temperedScale.forEach( ( freq, index ) => {
				// which FFT bin represents this frequency?
				var bin = Math.round( freq * this.analyzer.fftSize / this.audioCtx.sampleRate );

				var idx, nextBin, avg = false;
				// start from the last used FFT bin
				if ( prevBin > 0 && prevBin + 1 <= bin )
					idx = prevBin + 1;
				else
					idx = bin;

				prevBin = nextBin = bin;
				// check if there's another band after this one
				if ( temperedScale[ index + 1 ] !== undefined ) {
					nextBin = Math.round( temperedScale[ index + 1 ] * this.analyzer.fftSize / this.audioCtx.sampleRate );
					// and use half the bins in between for this band
					if ( nextBin - bin > 1 )
						prevBin += Math.round( ( nextBin - bin ) / 2 );
					else if ( nextBin - bin == 1 ) {
					// for low frequencies the FFT may not provide as many coefficients as we need, so more than one band will use the same FFT data
					// in these cases, we set a flag to perform an average to smooth the transition between adjacent bands
						if ( this.analyzerBars.length > 0 && idx == this.analyzerBars[ this.analyzerBars.length - 1 ].dataIdx ) {
							avg = true;
							prevBin += Math.round( ( nextBin - bin ) / 2 );
						}
					}
				}

				this.analyzerBars.push( {
					posX: index * ( this.barWidth + barSpace ),
					dataIdx: idx,
					endIdx: prevBin - idx > 0 ? prevBin : 0,
					average: avg,
					peak: 0,
					hold: 0,
					accel: 0
				} );

				// adds a vertical black line to the left of this bar in the mask canvas, to separate the LED columns
				this.ledsCtx.fillRect( this.analyzerBars[ this.analyzerBars.length - 1 ].posX - this.ledOptions.spaceH / 2, 0, this.ledOptions.spaceH, this.canvas.height );

			} );
		}

		if ( this.mode > 0 ) {
			// adds a vertical black line in the mask canvas after the last led column
			this.ledsCtx.fillRect( this.analyzerBars[ this.analyzerBars.length - 1 ].posX + this.barWidth - this.ledOptions.spaceH / 2 + ( this.mode < 5 ? 2 : 1 ), 0, this.ledOptions.spaceH, this.canvas.height );

			// adds horizontal black lines in the mask canvas, to separate the LED rows
			for ( i = this.ledOptions.ledHeight; i < this.canvas.height; i += this.ledOptions.ledHeight + this.ledOptions.spaceV )
				this.ledsCtx.fillRect( 0, i, this.canvas.width, this.ledOptions.spaceV );
		}

		// calculate the position of the labels (octaves center frequencies) for the X-axis scale
		this.freqLabels = [
			{ freq: 16 },
			{ freq: 31 },
			{ freq: 63 },
			{ freq: 125 },
			{ freq: 250 },
			{ freq: 500 },
			{ freq: 1000 },
			{ freq: 2000 },
			{ freq: 4000 },
			{ freq: 8000 },
			{ freq: 16000 }
		];

		this.freqLabels.forEach( label => {
			label.posX = bandWidth * ( Math.log10( label.freq ) - minLog );
			if ( label.freq >= 1000 )
				label.freq = ( label.freq / 1000 ) + 'k';
		});
	}

	/**
	 * Redraw the canvas
	 * this is called 60 times per second by requestAnimationFrame()
	 */
	draw() {

		var i, j, l, bar, barHeight, size,
			isLedDisplay = ( this.showLeds && this.mode > 0 );

		if ( ! this.showBgColor )	// use black background
			this.canvasCtx.fillStyle = '#000';
		else
			if ( isLedDisplay )
				this.canvasCtx.fillStyle = '#111';
			else
				this.canvasCtx.fillStyle = this.gradients[ this.gradient ].bgColor; // use background color defined by gradient

		// clear the canvas
		this.canvasCtx.fillRect( 0, 0, this.canvas.width, this.canvas.height );

		// get a new array of data from the FFT
		this.analyzer.getByteFrequencyData( this.dataArray );

		l = this.analyzerBars.length;
		for ( i = 0; i < l; i++ ) {

			bar = this.analyzerBars[ i ];

			if ( bar.endIdx == 0 ) 	// single FFT bin
				barHeight = this.dataArray[ bar.dataIdx ];
			else { 					// range of bins
				barHeight = 0;
				if ( bar.average ) {
					// use the average value of the range
					for ( j = bar.dataIdx; j <= bar.endIdx; j++ )
						barHeight += this.dataArray[ j ];
					barHeight = barHeight / ( bar.endIdx - bar.dataIdx + 1 );
				}
				else {
					// use the highest value in the range
					for ( j = bar.dataIdx; j <= bar.endIdx; j++ )
						barHeight = Math.max( barHeight, this.dataArray[ j ] );
				}
			}

			if ( isLedDisplay ) // normalize barHeight to match one of the "led" elements
				barHeight = ( barHeight / 255 * this.ledOptions.nLeds | 0 ) * ( this.ledOptions.ledHeight + this.ledOptions.spaceV );
			else
				barHeight = barHeight / 255 * this.canvas.height | 0;

			if ( barHeight >= bar.peak ) {
				bar.peak = barHeight;
				bar.hold = 30; // set peak hold time to 30 frames (0.5s)
				bar.accel = 0;
			}

			this.canvasCtx.fillStyle = this.gradients[ this.gradient ].gradient;
			if ( isLedDisplay )
				this.canvasCtx.fillRect( bar.posX + this.ledOptions.spaceH / 2, this.canvas.height, this.barWidth, -barHeight );
			else
				this.canvasCtx.fillRect( bar.posX, this.canvas.height, this.barWidth, -barHeight );

			if ( bar.peak > 0 ) {
				if ( this.showPeaks )
					if ( isLedDisplay )
						this.canvasCtx.fillRect( bar.posX + this.ledOptions.spaceH / 2, ( this.ledOptions.nLeds - ( bar.peak / this.canvas.height * this.ledOptions.nLeds | 0 ) ) * ( this.ledOptions.ledHeight + this.ledOptions.spaceV ), this.barWidth, this.ledOptions.ledHeight );
					else
						this.canvasCtx.fillRect( bar.posX, this.canvas.height - bar.peak, this.barWidth, 2 );

				if ( bar.hold )
					bar.hold--;
				else {
					bar.accel++;
					bar.peak -= bar.accel;
				}
			}
		}

		if ( isLedDisplay ) // applies LEDs mask over the canvas
			this.canvasCtx.drawImage( this.ledsMask, 0, 0 );

		if ( this.showScale ) {
			size = 5 * this.pixelRatio;

			if ( this.isFullscreen() )
				size *= 2;

			this.canvasCtx.fillStyle = '#000c';
			this.canvasCtx.fillRect( 0, this.canvas.height - size * 4, this.canvas.width, size * 4 );

			this.canvasCtx.fillStyle = '#fff';
			this.canvasCtx.font = ( size * 2 ) + 'px sans-serif';
			this.canvasCtx.textAlign = 'center';

			this.freqLabels.forEach( label => this.canvasCtx.fillText( label.freq, label.posX, this.canvas.height - size ) );
		}

		this.frame++;
		var now = performance.now();
		var elapsed = now - this.time;
		if ( elapsed >= 1000 ) {
			this.fps = this.frame / ( elapsed / 1000 );
			this.frame = 0;
			this.time = now;
		}
		if ( this.showFPS ) {
			size = 20 * this.pixelRatio;
			this.canvasCtx.font = `bold ${size}px sans-serif`;
			this.canvasCtx.fillStyle = '#0f0';
			this.canvasCtx.textAlign = 'right';
			this.canvasCtx.fillText( Math.round( this.fps ), this.canvas.width - size, size * 2 );
		}

		if ( this.drawCallback )
			this.drawCallback( this );

		// schedule next canvas update
		this.animationReq = requestAnimationFrame( () => this.draw() );
	}

	/**
	 * Generate gradients
	 */
	generateGradients() {
		var grad, i;

		Object.keys( this.gradients ).forEach( key => {
			if ( this.gradients[ key ].dir && this.gradients[ key ].dir == 'h' )
				grad = this.canvasCtx.createLinearGradient( 0, 0, this.canvas.width, 0 );
			else
				grad = this.canvasCtx.createLinearGradient( 0, 0, 0, this.canvas.height );

			if ( this.gradients[ key ].colorStops ) {
				this.gradients[ key ].colorStops.forEach( ( colorInfo, index ) => {
					if ( typeof colorInfo == 'object' )
						grad.addColorStop( colorInfo.pos, colorInfo.color );
					else
						grad.addColorStop( index / ( this.gradients[ key ].colorStops.length - 1 ), colorInfo );
				});
			}

			this.gradients[ key ].gradient = grad; // save the generated gradient back into the gradients array
		});
	}

	/**
	 * Internal function to change canvas dimensions on the fly
	 */
	setCanvas( reason ) {
		this.pixelRatio = window.devicePixelRatio; // for Retina / HiDPI devices

		if ( this.loRes )
			this.pixelRatio /= 2;

		this.fsWidth = Math.max( window.screen.width, window.screen.height ) * this.pixelRatio;
		this.fsHeight = Math.min( window.screen.height, window.screen.width ) * this.pixelRatio;

		if ( this.isFullscreen() ) {
			this.canvas.width = this.fsWidth;
			this.canvas.height = this.fsHeight;
		}
		else {
			this.canvas.width = this.width * this.pixelRatio;
			this.canvas.height = this.height * this.pixelRatio;
		}

		// workaround for wrong dPR reported on Android TV
		if ( this.pixelRatio == 2 && window.screen.height <= 540 )
			this.pixelRatio = 1;

		// clear the canvas
		this.canvasCtx.fillStyle = '#000';
		this.canvasCtx.fillRect( 0, 0, this.canvas.width, this.canvas.height );

		// (re)generate gradients
		this.generateGradients();

		// create an auxiliary canvas for the LED effect mask
		this.ledsMask = this.canvas.cloneNode();
		this.ledsCtx = this.ledsMask.getContext('2d');
		this.ledsCtx.fillStyle = '#000';

		this.preCalcPosX();

		if ( this.canvasResizeCallback )
			this.canvasResizeCallback( reason, this.canvas.width, this.canvas.height, this.isFullscreen(), this.loRes, this.pixelRatio );
	}

	/**
	 * Toggles canvas full-screen mode
	 */
	toggleFullscreen() {
		if ( this.isFullscreen() ) {
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
	 * Start / stop canvas animation
	 *
	 * @param {boolean} [value] if undefined, inverts the current status
	 * @returns {boolean} resulting status after the change
	 */
	toggleAnalyzer( value ) {
		var started = this.isOn();
		if ( value === undefined )
			value = ! started;

		if ( started && ! value ) {
			cancelAnimationFrame( this.animationReq );
			this.animationReq = undefined;
		}
		else if ( ! started && value ) {
			this.frame = this.fps = 0;
			this.time = performance.now();
			this.animationReq = requestAnimationFrame( () => this.draw() );
		}

		return this.isOn();
	}

}
