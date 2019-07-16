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

// current visualization settings
export var mode, minFreq, maxFreq, gradient, showBgColor, showLeds, showScale, showPeaks, highSens, loRes, showFPS;

// data for drawing the analyzer bars and scale-related variables
var analyzerBars, barWidth, ledOptions, freqLabels;

// Web Audio API related variables
export var audioCtx, analyzer, dataArray;

// canvas-related variables
export var canvas, canvasCtx, pixelRatio, width, height, fsWidth, fsHeight, fps;

var animationReq, drawCallback, ledsMask, ledsCtx, time, frame, canvasResizeCallback;

// gradient definitions
var	gradients = {
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

/**
 * Settings defaults
 */
var defaults = {
	mode        : 0,
	fftSize     : 8192,
	minFreq     : 20,
	maxFreq     : 22000,
	smoothing   : 0.5,
	gradient    : 'classic',
	showBgColor : true,
	showLeds    : false,
	showScale   : true,
	highSens    : false,
	showPeaks   : true,
	showFPS     : false,
	loRes       : false,
	width       : 640,
	height      : 270
};


/**
 * Checks if the analyzer is being displayed in fullscreen mode
 *
 * @returns {boolean}
 */
export function isFullscreen() {
	if ( document.fullscreenElement )
		return document.fullscreenElement === canvas;
	else if ( document.webkitFullscreenElement )
		return document.webkitFullscreenElement === canvas;
}
/**
 * Checks if the analyzer canvas animation is running or not
 *
 * @returns {boolean}
 */
export function isOn() {
	return animationReq !== undefined;
}

/**
 * Set dimensions of analyzer's canvas
 *
 * @param {number} [w] width in pixels
 * @param {number} [h] height in pixels
 */
export function setCanvasSize( w = defaults.width, h = defaults.height ) {
	width = w;
	height = h;
	setCanvas('user');
}

/**
 * Set callback function for canvas draw
 *
 * @param {function} [func] if undefined or not a function, clears any previously set function
 */
export function setCanvasDrawCallback( func ) {
	if ( typeof func == 'function' )
		drawCallback = func;
	else
		drawCallback = undefined;
}

/**
 * Set callback function for canvas resize
 *
 * @param {function} [func] if undefined or not a function, clears any previously set function
 */
export function setCanvasResizeCallback( func ) {
	if ( typeof func == 'function' )
		canvasResizeCallback = func;
	else
		canvasResizeCallback = undefined;
}

/**
 * Set visualization mode
 *
 * @param {number} [value]
 */
export function setMode( value = defaults.mode ) {
	mode = Number( value );
	preCalcPosX();
}

/**
 * Set the size of the FFT performed by the analyzer node
 *
 * @param {number} [value]
 */
export function setFFTSize( value = defaults.fftSize ) {
	analyzer.fftSize = value;
	dataArray = new Uint8Array( analyzer.frequencyBinCount );
	preCalcPosX();
}

/**
 * Set desired frequency range
 *
 * @param {number} [min] lowest frequency represented in the x-axis
 * @param {number} [max] highest frequency represented in the x-axis
 */
export function setFreqRange( min = defaults.minFreq, max = defaults.maxFreq ) {
	minFreq = Math.min( min, max );
	maxFreq = Math.max( min, max );
	preCalcPosX();
}

/**
 * Set the analyzer's smoothing time constant
 *
 * @param {number} [value] float value from 0 to 1
 */
export function setSmoothing( value = defaults.smoothing ) {
	analyzer.smoothingTimeConstant = value;
}

/**
 * Select gradient
 *
 * @param {string} [name] name of a built-in or previously registered gradient
 */
export function setGradient( name = defaults.gradient ) {
	gradient = name;
}

/**
 * Toggle peaks on/off
 *
 * @param {boolean} [value] if undefined, inverts the current status
 * @returns {boolean} resulting status after the change
 */
export function togglePeaks( value ) {
	return showPeaks = value === undefined ? ! showPeaks : value;
}

/**
 * Toggle background color on/off
 *
 * @param {boolean} [value] if undefined, inverts the current status
 * @returns {boolean} resulting status after the change
 */
export function toggleBgColor( value ) {
	return showBgColor = value === undefined ? ! showBgColor : value;
}

/**
 * Toggle FPS display
 *
 * @param {boolean} [value] if undefined, inverts the current status
 * @returns {boolean} resulting status after the change
 */
export function toggleFPS( value ) {
	return showFPS = value === undefined ? ! showFPS : value;
}

/**
 * Toggle LED effect on/off
 *
 * @param {boolean} [value] if undefined, inverts the current status
 * @returns {boolean} resulting status after the change
 */
export function toggleLeds( value ) {
	return showLeds = value === undefined ? ! showLeds : value;
}

/**
 * Toggle scale on/off
 *
 * @param {boolean} [value] if undefined, inverts the current status
 * @returns {boolean} resulting status after the change
 */
export function toggleScale ( value ) {
	return showScale = value === undefined ? ! showScale : value;
}

/**
 * Toggle low-resolution mode on/off
 *
 * @param {boolean} [value] if undefined, inverts the current status
 * @returns {boolean} resulting status after the change
 */
export function toggleLoRes ( value ) {
	loRes = value === undefined ? ! loRes : value;
	setCanvas('lores');
	return loRes;
}

/**
 * Adjust the analyzer's sensitivity
 *
 * @param {(boolean|number)} [min=-85] min decibels or true for high sensitivity, false for low sensitivity
 * @param {number}           [max=-25] max decibels
 */
export function setSensitivity( min = -85, max = -25 ) {
	if ( min === true ) {
		analyzer.minDecibels = -100;
		analyzer.maxDecibels = -30;
	}
	else if ( min === false ) {
		analyzer.minDecibels = -85;
		analyzer.maxDecibels = -25;
	}
	else {
		analyzer.minDecibels = Math.min( min, max );
		analyzer.maxDecibels = Math.max( min, max );
	}
}

/**
 * Shorthand to setting several options at once
 *
 * @param {object} options
 */
export function setOptions( options ) {

	if ( options.mode !== undefined )
		mode = Number( options.mode );

	if ( options.minFreq !== undefined )
		minFreq = options.minFreq;

	if ( options.maxFreq !== undefined )
		maxFreq = options.maxFreq;

	if ( options.gradient !== undefined )
		gradient = options.gradient;

	if ( options.showBgColor !== undefined )
		showBgColor = options.showBgColor;

	if ( options.showLeds !== undefined )
		showLeds = options.showLeds;

	if ( options.showScale !== undefined )
		showScale = options.showScale;

	if ( options.highSens !== undefined )
		highSens = options.highSens;

	if ( options.showPeaks !== undefined )
		showPeaks = options.showPeaks;

	if ( options.showFPS !== undefined )
		showFPS = options.showFPS;

	if ( options.loRes !== undefined )
		loRes = options.loRes;

	if ( options.fftSize !== undefined )
		analyzer.fftSize = options.fftSize;

	if ( options.smoothing !== undefined )
		analyzer.smoothingTimeConstant = options.smoothing;

	if ( typeof options.onCanvasDraw == 'function' )
		drawCallback = options.onCanvasDraw;

	if ( typeof options.onCanvasResize == 'function' )
		canvasResizeCallback = options.onCanvasDraw;

	if ( options.width !== undefined )
		width = options.width;

	if ( options.height !== undefined )
		height = options.height;

	setSensitivity( highSens );

	dataArray = new Uint8Array( analyzer.frequencyBinCount );

	setCanvas('user');
}

/**
 * Registers a custom gradient
 *
 * @param {string} name
 * @param {object} options
 */
export function registerGradient( name, options ) {
	if ( typeof options !== 'object' )
		throw 'Custom gradient options must be an object';

	if ( options.colorStops === undefined || options.colorStops.length < 2 )
		throw 'Custom gradient must define at least two colors!';

	gradients[ name ] = {};

	if ( options.bgColor !== undefined )
		gradients[ name ].bgColor = options.bgColor;
	else
		gradients[ name ].bgColor = '#111';

	if ( options.dir !== undefined )
		gradients[ name ].dir = options.dir;

	gradients[ name ].colorStops = options.colorStops;

	generateGradients();
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
function preCalcPosX() {

	var i, freq,
		minLog = Math.log10( minFreq ),
		bandWidth = canvas.width / ( Math.log10( maxFreq ) - minLog );

	analyzerBars = [];

	if ( mode == 0 ) { // discrete frequencies mode
		barWidth = 1;

 		var pos,
 			lastPos = -1,
			minIndex = Math.floor( minFreq * analyzer.fftSize / audioCtx.sampleRate ),
		    maxIndex = Math.min( Math.round( maxFreq * analyzer.fftSize / audioCtx.sampleRate ), analyzer.frequencyBinCount - 1 );

		for ( i = minIndex; i <= maxIndex; i++ ) {
			freq = i * audioCtx.sampleRate / analyzer.fftSize; // frequency represented in this bin
			pos = Math.round( bandWidth * ( Math.log10( freq ) - minLog ) ); // avoid fractionary pixel values

			// if it's on a different X-coordinate, create a new bar for this frequency
			if ( pos > lastPos ) {
				analyzerBars.push( { posX: pos, dataIdx: i, endIdx: 0, average: false, peak: 0, hold: 0, accel: 0 } );
				lastPos = pos;
			} // otherwise, add this frequency to the last bar's range
			else if ( analyzerBars.length )
				analyzerBars[ analyzerBars.length - 1 ].endIdx = i;
		}
	}
	else { // octave bands modes

		// calculates the best attributes for the LEDs effect, based on the visualization mode and canvas resolution
		var spaceV;

		switch ( mode ) {
			case 24:
				spaceV = Math.min( 16, canvas.height / ( 33 * pixelRatio ) | 0 );
				ledOptions = {
					nLeds: 24,
					spaceH: Math.min( 24, canvas.width / ( 40 * pixelRatio ) | 0 )
				};
				break;

			case 12:
				spaceV = Math.min( 8, canvas.height / ( 67 * pixelRatio ) | 0 );
				ledOptions = {
					nLeds: 48,
					spaceH: Math.min( 16, canvas.width / ( 60 * pixelRatio ) | 0 )
				};
				break;

			case  8:
				spaceV = Math.min( 6, canvas.height / ( 90 * pixelRatio ) | 0 );
				ledOptions = {
					nLeds: 64,
					spaceH: Math.min( 10, canvas.width / ( 96 * pixelRatio ) | 0 )
				};
				break;

			case  4:
				spaceV = Math.min( 6, canvas.height / ( 90 * pixelRatio ) | 0 );
				ledOptions = {
					nLeds: 80,
					spaceH: Math.min( 8, canvas.width / ( 120 * pixelRatio ) | 0 )
				};
				break;

			case  2:
				spaceV = Math.min( 4, canvas.height / ( 135 * pixelRatio ) | 0 );
				ledOptions = {
					nLeds: 128,
					spaceH: Math.min( 4, canvas.width / ( 240 * pixelRatio ) | 0 )
				};
				break;

			default:
				spaceV = Math.min( 3, Math.max( 2, canvas.height / ( 180 * pixelRatio ) | 0 ) );
				ledOptions = {
					nLeds: 128,
					spaceH: Math.min( 4, canvas.width / ( 320 * pixelRatio ) | 0 )
				};
		}

		ledOptions.spaceH *= pixelRatio;
		ledOptions.spaceV = spaceV * pixelRatio;
		ledOptions.nLeds = Math.min( ledOptions.nLeds, canvas.height / ( ledOptions.spaceV * 2 ) | 0 );
		ledOptions.ledHeight = canvas.height / ledOptions.nLeds - ledOptions.spaceV;

		// generate a table of frequencies based on the equal tempered scale
		var root24 = 2 ** ( 1 / 24 ); // for 1/24th-octave bands
		var c0 = 440 * root24 ** -114;
		var temperedScale = [];
		var prevBin = 0;

		i = 0;
		while ( ( freq = c0 * root24 ** i ) <= maxFreq ) {
			if ( freq >= minFreq && i % mode == 0 )
				temperedScale.push( freq );
			i++;
		}

		// divide canvas space by the number of frequencies to display, allowing at least one pixel between bars
		barWidth = Math.floor( canvas.width / temperedScale.length ) - 1;

		// the space remaining from the integer division is split equally among the bars as separator
		var barSpace = ( canvas.width - barWidth * temperedScale.length ) / ( temperedScale.length - 1 );

		ledsMask.width |= 0; // clear LEDs mask canvas

		temperedScale.forEach( function( freq, index ) {
			// which FFT bin represents this frequency?
			var bin = Math.round( freq * analyzer.fftSize / audioCtx.sampleRate );

			var idx, nextBin, avg = false;
			// start from the last used FFT bin
			if ( prevBin > 0 && prevBin + 1 <= bin )
				idx = prevBin + 1;
			else
				idx = bin;

			prevBin = nextBin = bin;
			// check if there's another band after this one
			if ( temperedScale[ index + 1 ] !== undefined ) {
				nextBin = Math.round( temperedScale[ index + 1 ] * analyzer.fftSize / audioCtx.sampleRate );
				// and use half the bins in between for this band
				if ( nextBin - bin > 1 )
					prevBin += Math.round( ( nextBin - bin ) / 2 );
				else if ( nextBin - bin == 1 ) {
				// for low frequencies the FFT may not provide as many coefficients as we need, so more than one band will use the same FFT data
				// in these cases, we set a flag to perform an average to smooth the transition between adjacent bands
					if ( analyzerBars.length > 0 && idx == analyzerBars[ analyzerBars.length - 1 ].dataIdx ) {
						avg = true;
						prevBin += Math.round( ( nextBin - bin ) / 2 );
					}
				}
			}

			analyzerBars.push( {
				posX: index * ( barWidth + barSpace ),
				dataIdx: idx,
				endIdx: prevBin - idx > 0 ? prevBin : 0,
				average: avg,
				peak: 0,
				hold: 0,
				accel: 0
			} );

			// adds a vertical black line to the left of this bar in the mask canvas, to separate the LED columns
			ledsCtx.fillRect( analyzerBars[ analyzerBars.length - 1 ].posX - ledOptions.spaceH / 2, 0, ledOptions.spaceH, canvas.height );

		} );
	}

	if ( mode > 0 ) {
		// adds a vertical black line in the mask canvas after the last led column
		ledsCtx.fillRect( analyzerBars[ analyzerBars.length - 1 ].posX + barWidth - ledOptions.spaceH / 2 + ( mode < 8 ? 2 : 1 ), 0, ledOptions.spaceH, canvas.height );

		// adds horizontal black lines in the mask canvas, to separate the LED rows
		for ( i = ledOptions.ledHeight; i < canvas.height; i += ledOptions.ledHeight + ledOptions.spaceV )
			ledsCtx.fillRect( 0, i, canvas.width, ledOptions.spaceV );
	}

	// calculate the position of the labels (octaves center frequencies) for the X-axis scale
	freqLabels = [
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

	freqLabels.forEach( label => {
		label.posX = bandWidth * ( Math.log10( label.freq ) - minLog );
		if ( label.freq >= 1000 )
			label.freq = ( label.freq / 1000 ) + 'k';
	});
}

/**
 * Redraw the canvas
 * this is called 60 times per second by requestAnimationFrame()
 */
function draw() {

	var i, j, l, bar, barHeight, size,
		isLedDisplay = ( showLeds && mode > 0 );

	if ( ! showBgColor )	// use black background
		canvasCtx.fillStyle = '#000';
	else
		if ( isLedDisplay )
			canvasCtx.fillStyle = '#111';
		else
			canvasCtx.fillStyle = gradients[ gradient ].bgColor; // use background color defined by gradient

	// clear the canvas
	canvasCtx.fillRect( 0, 0, canvas.width, canvas.height );

	// get a new array of data from the FFT
	analyzer.getByteFrequencyData( dataArray );

	l = analyzerBars.length;
	for ( i = 0; i < l; i++ ) {

		bar = analyzerBars[ i ];

		if ( bar.endIdx == 0 ) 	// single FFT bin
			barHeight = dataArray[ bar.dataIdx ];
		else { 					// range of bins
			barHeight = 0;
			if ( bar.average ) {
				// use the average value of the range
				for ( j = bar.dataIdx; j <= bar.endIdx; j++ )
					barHeight += dataArray[ j ];
				barHeight = barHeight / ( bar.endIdx - bar.dataIdx + 1 );
			}
			else {
				// use the highest value in the range
				for ( j = bar.dataIdx; j <= bar.endIdx; j++ )
					barHeight = Math.max( barHeight, dataArray[ j ] );
			}
		}

		if ( isLedDisplay ) // normalize barHeight to match one of the "led" elements
			barHeight = ( barHeight / 255 * ledOptions.nLeds | 0 ) * ( ledOptions.ledHeight + ledOptions.spaceV );
		else
			barHeight = barHeight / 255 * canvas.height | 0;

		if ( barHeight >= bar.peak ) {
			bar.peak = barHeight;
			bar.hold = 30; // set peak hold time to 30 frames (0.5s)
			bar.accel = 0;
		}

		canvasCtx.fillStyle = gradients[ gradient ].gradient;
		if ( isLedDisplay )
			canvasCtx.fillRect( bar.posX + ledOptions.spaceH / 2, canvas.height, barWidth, -barHeight );
		else
			canvasCtx.fillRect( bar.posX, canvas.height, barWidth, -barHeight );

		if ( bar.peak > 0 ) {
			if ( showPeaks )
				if ( isLedDisplay )
					canvasCtx.fillRect( bar.posX + ledOptions.spaceH / 2, ( ledOptions.nLeds - ( bar.peak / canvas.height * ledOptions.nLeds | 0 ) ) * ( ledOptions.ledHeight + ledOptions.spaceV ), barWidth, ledOptions.ledHeight );
				else
					canvasCtx.fillRect( bar.posX, canvas.height - bar.peak, barWidth, 2 );

			if ( bar.hold )
				bar.hold--;
			else {
				bar.accel++;
				bar.peak -= bar.accel;
			}
		}
	}

	if ( isLedDisplay ) // applies LEDs mask over the canvas
		canvasCtx.drawImage( ledsMask, 0, 0 );

	if ( showScale ) {
		size = 5 * pixelRatio;

		if ( isFullscreen() )
			size *= 2;

		canvasCtx.fillStyle = '#000c';
		canvasCtx.fillRect( 0, canvas.height - size * 4, canvas.width, size * 4 );

		canvasCtx.fillStyle = '#fff';
		canvasCtx.font = ( size * 2 ) + 'px sans-serif';
		canvasCtx.textAlign = 'center';

		freqLabels.forEach( label => canvasCtx.fillText( label.freq, label.posX, canvas.height - size ) );
	}

	frame++;
	var now = performance.now();
	var elapsed = now - time;
	if ( elapsed >= 1000 ) {
		fps = frame / ( elapsed / 1000 );
		frame = 0;
		time = now;
	}
	if ( showFPS ) {
		size = 20 * pixelRatio;
		canvasCtx.font = `bold ${size}px sans-serif`;
		canvasCtx.fillStyle = '#0f0';
		canvasCtx.textAlign = 'right';
		canvasCtx.fillText( fps.toFixed(), canvas.width - size, size * 2 );
	}

	if ( drawCallback )
		drawCallback( canvas, canvasCtx, pixelRatio );

	// schedule next canvas update
	animationReq = requestAnimationFrame( draw );
}

/**
 * Generate gradients
 */
function generateGradients() {
	var grad, i;

	Object.keys( gradients ).forEach( function( key ) {
		if ( gradients[ key ].dir && gradients[ key ].dir == 'h' )
			grad = canvasCtx.createLinearGradient( 0, 0, canvas.width, 0 );
		else
			grad = canvasCtx.createLinearGradient( 0, 0, 0, canvas.height );

		if ( gradients[ key ].colorStops ) {
			gradients[ key ].colorStops.forEach( ( colorInfo, index ) => {
				if ( typeof colorInfo == 'object' )
					grad.addColorStop( colorInfo.pos, colorInfo.color );
				else
					grad.addColorStop( index / ( gradients[ key ].colorStops.length - 1 ), colorInfo );
			});
		}

		gradients[ key ].gradient = grad; // save the generated gradient back into the gradients array
	});
}


/**
 * Internal function to change canvas dimensions on the fly
 */
function setCanvas( reason ) {
	pixelRatio = window.devicePixelRatio; // for Retina / HiDPI devices

	if ( loRes )
		pixelRatio /= 2;

	fsWidth = Math.max( window.screen.width, window.screen.height ) * pixelRatio;
	fsHeight = Math.min( window.screen.height, window.screen.width ) * pixelRatio;

	if ( isFullscreen() ) {
		canvas.width = fsWidth;
		canvas.height = fsHeight;
	}
	else {
		canvas.width = width * pixelRatio;
		canvas.height = height * pixelRatio;
	}

	// workaround for wrong dPR reported on Android TV
	if ( pixelRatio == 2 && window.screen.height <= 540 )
		pixelRatio = 1;

	// clear the canvas
	canvasCtx.fillStyle = '#000';
	canvasCtx.fillRect( 0, 0, canvas.width, canvas.height );

	// (re)generate gradients
	generateGradients();

	// create an auxiliary canvas for the LED effect mask
	ledsMask = canvas.cloneNode();
	ledsCtx = ledsMask.getContext('2d');
	ledsCtx.fillStyle = '#000';

	preCalcPosX();

	if ( canvasResizeCallback )
		canvasResizeCallback( reason, canvas.width, canvas.height, isFullscreen(), loRes, pixelRatio );
}

/**
 * Toggles canvas full-screen mode
 */
export function toggleFullscreen() {
	if ( isFullscreen() ) {
		if ( document.exitFullscreen )
			document.exitFullscreen();
		else if ( document.webkitExitFullscreen )
			document.webkitExitFullscreen();
	}
	else {
		if ( canvas.requestFullscreen )
			canvas.requestFullscreen();
		else if ( canvas.webkitRequestFullscreen )
			canvas.webkitRequestFullscreen();
	}
}

/**
 * Connect HTML audio element to analyzer
 *
 * @param {object} element HTML audio element
 * @returns {object} a MediaElementAudioSourceNode object
 */
export function connectAudio( element ) {
	var audioSource = audioCtx.createMediaElementSource( element );
	audioSource.connect( analyzer );
	return audioSource;
}

/**
 * Start / stop canvas animation
 *
 * @param {boolean} [value] if undefined, inverts the current status
 * @returns {boolean} resulting status after the change
 */
export function toggleAnalyzer( value ) {
	var started = isOn();
	if ( value === undefined )
		value = ! started;

	if ( started && ! value ) {
		cancelAnimationFrame( animationReq );
		animationReq = undefined;
	}
	else if ( ! started && value ) {
		frame = fps = 0;
		time = performance.now();
		animationReq = requestAnimationFrame( draw );
	}

	return isOn();
}

/**
 * Constructor
 *
 * @param {object} [container] DOM element where to insert the analyzer; if undefined, uses the document body
 * @param {object} [options]
 * @returns {object} MediaElementAudioSourceNode object to connected audio source
 */
export function create( container, options = {} ) {

	if ( ! container )
		container = document.body;

	// Create audio context

	var AudioContext = window.AudioContext || window.webkitAudioContext;

	try {
		audioCtx = new AudioContext();
	}
	catch( err ) {
		throw 'Could not create audio context. Web Audio API not supported?';
	}

	// Create analyzer node and connect to destination

	analyzer = audioCtx.createAnalyser();

	var audioSource;
	if ( options.source )
		audioSource = connectAudio( options.source );

	analyzer.connect( audioCtx.destination );

	// Adjust settings

	defaults.width  = container.clientWidth  || defaults.width;
	defaults.height = container.clientHeight || defaults.height;

	mode        = options.mode        === undefined ? defaults.mode        : Number( options.mode );
	minFreq     = options.minFreq     === undefined ? defaults.minFreq     : options.minFreq;
	maxFreq     = options.maxFreq     === undefined ? defaults.maxFreq     : options.maxFreq;
	gradient    = options.gradient    === undefined ? defaults.gradient    : options.gradient;
	showBgColor = options.showBgColor === undefined ? defaults.showBgColor : options.showBgColor;
	showLeds    = options.showLeds    === undefined ? defaults.showLeds    : options.showLeds;
	showScale   = options.showScale   === undefined ? defaults.showScale   : options.showScale;
	highSens    = options.highSens    === undefined ? defaults.highSens    : options.highSens;
	showPeaks   = options.showPeaks   === undefined ? defaults.showPeaks   : options.showPeaks;
	showFPS     = options.showFPS     === undefined ? defaults.showFPS     : options.showFPS;
	loRes       = options.loRes       === undefined ? defaults.loRes       : options.loRes;
	width       = options.width       === undefined ? defaults.width       : options.width;
	height      = options.height      === undefined ? defaults.height      : options.height;

	analyzer.fftSize               = options.fftSize   === undefined ? defaults.fftSize   : options.fftSize;
	analyzer.smoothingTimeConstant = options.smoothing === undefined ? defaults.smoothing : options.smoothing;
	dataArray = new Uint8Array( analyzer.frequencyBinCount );

	if ( typeof options.onCanvasDraw == 'function' )
		drawCallback = options.onCanvasDraw;

	if ( typeof options.onCanvasResize == 'function' )
		canvasResizeCallback = options.onCanvasResize;

	setSensitivity( highSens );

	// Create canvas

	canvas = document.createElement('canvas');
	canvas.style = 'max-width: 100%;';
	container.appendChild( canvas );
	canvasCtx = canvas.getContext( '2d', { alpha: false } );
	setCanvas('create');

	// adjust canvas on window resize / fullscreen change
	window.addEventListener( 'resize', () => {
		width = options.width || container.clientWidth || defaults.width;
		height = options.height || container.clientHeight || defaults.height;
		setCanvas('resize');
	});

	// Start analyzer
	if ( options.start === undefined || options.start !== false )
		toggleAnalyzer( true );

	// Return connected audio source
	return audioSource;
}
