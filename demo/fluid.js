/**
 * audioMotion-analyzer fluid layout demo
 *
 * https://github.com/hvianna/audioMotion-analyzer
 */

import {
	AudioMotionAnalyzer,
	COLORMODE_GRADIENT,
	COLORMODE_LEVEL,
	ENERGY_BASS,
	ENERGY_HIGHMID,
	ENERGY_LOWMID,
	ENERGY_MIDRANGE,
	ENERGY_PEAK,
	ENERGY_TREBLE,
	FILTER_D,
	FILTER_TILT3,
	LEDS_MODERN,
	LEDS_OFF,
	LEDS_VINTAGE,
	LABELS_X_FREQS,
	LABELS_X_OFF,
	LABELS_Y_DB,
	LABELS_Y_OFF,
	LAYOUT_COMBINED,
	LAYOUT_HORIZONTAL,
	LAYOUT_SINGLE,
	LAYOUT_VERTICAL,
	MIRROR_LEFT,
	MIRROR_OFF,
	MIRROR_RIGHT,
	MODE_BARS,
	MODE_GRAPH,
	PEAKS_DROP,
	PEAKS_FADE,
	PEAKS_OFF,
	RADIAL_OFF,
	RADIAL_OUTWARD,
	SCALE_BARK,
	SCALE_LOG
} from '../src/audioMotion-analyzer.js';

import {
	addUIEventListeners,
	loadSong,
	populateControls,
	populateThemeSelections,
	setPresets,
	updateUI
} from './functions.js';

const audioEl             = document.getElementById('audio'),
	  backgroundSelection = document.getElementById('bgColor'),
	  container           = document.getElementById('container');

// container background options
const bgOptions = [
	[ 'Black', '#000' ],
	[ 'Dark',  'transparent' ],
	[ 'Light', '#ccc' ],
	[ 'Gray',  'dimgray' ],
	[ 'Image', 'url(media/synthwave.jpg) center/contain' ]
];

// Visualization presets
const presets = [
	{
		name: 'Reset to defaults',
		options: null,
		theme: null,
		ledProps: null
	},
	{
		name: 'Classic LED bars',
		options: {
			mode: MODE_BARS,
			alphaBars: false,
			ansiBands: true,
			bandResolution: 3,
			barSpace: .5,
			channelLayout: LAYOUT_SINGLE,
			colorMode: COLORMODE_GRADIENT,
			frequencyScale: SCALE_LOG,
			ledBars: LEDS_VINTAGE,
			linearAmplitude: true,
			linearBoost: 1.8,
			lumiBars: false,
			maxFreq: 20000,
			minFreq: 25,
			mirror: MIRROR_OFF,
			radial: RADIAL_OFF,
			reflexRatio: 0,
			showLedMask: true,
			showPeaks: PEAKS_DROP,
			weightingFilter: FILTER_TILT3
		},
		theme: 'classic',
		ledProps: { ledHeight: null, gapHeight: null } // reset LED format, but keep any customized mask values
	},
	{
		name: 'Square LEDs',
		options: {
			mode: MODE_BARS,
			alphaBars: false,
			ansiBands: true,
			bandResolution: 7,
			barSpace: .25,
			channelLayout: LAYOUT_SINGLE,
			colorMode: COLORMODE_GRADIENT,
			frequencyScale: SCALE_LOG,
			ledBars: LEDS_MODERN,
			linearAmplitude: false,
			lumiBars: false,
			maxFreq: 20000,
			minFreq: 25,
			mirror: MIRROR_OFF,
			radial: RADIAL_OFF,
			reflexRatio: 0,
			showLedMask: false,
			showPeaks: PEAKS_FADE,
			weightingFilter: FILTER_TILT3
		},
		theme: 'rainbow',
		ledProps: { ledHeight: 0, gapHeight: 0 } // make square LEDs, but keep any customized mask values
	},
	{
		name: 'Mirror wave',
		options: {
			mode: MODE_GRAPH,
			bandResolution: 0,
			channelLayout: LAYOUT_SINGLE,
			fillAlpha: .6,
			lineWidth: 1.5,
			maxFreq: 20000,
			minFreq: 30,
			mirror: MIRROR_LEFT,
			peakLine: 0,
			radial: RADIAL_OFF,
			reflexAlpha: 1,
			reflexBright: 1,
			reflexRatio: .5,
			showPeaks: PEAKS_OFF,
			showScaleX: LABELS_X_OFF
		},
		theme: { name: 'rainbow', modifiers: { horizontal: true } }
	},
	{
		name: 'Radial spectrum',
		options: {
			mode: MODE_BARS,
			bandResolution: 4,
			barSpace: .1,
			channelLayout: LAYOUT_SINGLE,
			ledBars: LEDS_OFF,
			maxFreq: 20000,
			minFreq: 20,
			mirror: MIRROR_OFF,
			radial: RADIAL_OUTWARD,
			showPeaks: PEAKS_DROP,
			spinSpeed: 1
		},
		theme: 'rainbow'
	},
	{
		name: 'Bark scale + Reflex',
		options: {
			mode: MODE_BARS,
			bandResolution: 0,
			channelLayout: LAYOUT_SINGLE,
			frequencyScale: SCALE_BARK,
			linearAmplitude: true,
			linearBoost: 1.8,
			maxFreq: 20000,
			minFreq: 20,
			mirror: MIRROR_OFF,
			radial: RADIAL_OFF,
			reflexAlpha: .25,
			reflexBright: 1,
			reflexFit: true,
			reflexRatio: .25,
			showPeaks: PEAKS_DROP,
			showScaleX: LABELS_X_FREQS,
			weightingFilter: FILTER_TILT3
		},
		theme: { name: 'rainbow', modifiers: { horizontal: true } }
	},
	{
		name: 'Dual channel combined',
		options: {
			mode: MODE_GRAPH,
			bandResolution: 0,
			channelLayout: LAYOUT_COMBINED,
			fillAlpha: .25,
			frequencyScale: SCALE_LOG,
			linearAmplitude: true,
			linearBoost: 1.8,
			lineWidth: 1.5,
			maxFreq: 20000,
			minFreq: 20,
			mirror: MIRROR_OFF,
			peakLine: .5,
			radial: RADIAL_OFF,
			reflexRatio: 0,
			showPeaks: PEAKS_DROP,
			weightingFilter: FILTER_TILT3
		},
		theme: [ 'steelblue', 'orangered' ]
	},
	{
		name: 'roundBars + bar-level',
		options: {
			mode: MODE_BARS,
			bandResolution: 7,
			alphaBars: false,
			ansiBands: false,
			barSpace: .25,
			channelLayout: LAYOUT_SINGLE,
			colorMode: COLORMODE_LEVEL,
			frequencyScale: SCALE_LOG,
			ledBars: LEDS_OFF,
			linearAmplitude: true,
			linearBoost: 1.6,
			lumiBars: false,
			maxFreq: 16000,
			minFreq: 30,
			mirror: MIRROR_OFF,
			radial: RADIAL_OFF,
			reflexRatio: .5,
			reflexAlpha: 1,
			roundBars: true,
			showPeaks: PEAKS_OFF,
			showScaleX: LABELS_X_OFF,
			smoothing: .7,
			weightingFilter: FILTER_TILT3
		},
		theme: 'rainbow'
	},
	{
		name: 'Testing config 1',
		options: {
			mode: MODE_GRAPH,
			bandResolution: 0,
			channelLayout: LAYOUT_SINGLE,
			linearAmplitude: false,
			reflexRatio: .4,
			showPeaks: PEAKS_DROP,
			showScaleX: LABELS_X_OFF,
			mirror: MIRROR_LEFT,
			maxFreq: 8000,
			minFreq: 20,
			lineWidth: 2,
			fillAlpha: .2,
			peakLine: 0
		},
		theme: 'rainbow'
	},
	{
		name: 'Testing config 2',
		options: {
			mode: MODE_BARS,
			bandResolution: 7,
			alphaBars: false,
			ansiBands: false,
			barSpace: .1,
			channelLayout: LAYOUT_VERTICAL,
			ledBars: LEDS_MODERN,
			lumiBars: false,
			radial: RADIAL_OFF,
			reflexRatio: 0,
			showPeaks: PEAKS_DROP,
			showScaleX: LABELS_X_OFF,
			mirror: MIRROR_OFF,
			maxFreq: 16000,
			minFreq: 20
		},
		theme: [ 'steelblue', 'orangered' ],
		ledProps: null
	},
	{
		// gradient sample images for docs are created with a 27.5 Hz square wave (volume: 1) in the oscillator
		name: 'Testing config 3',
		options: {
			mode: MODE_BARS,
			bandResolution: 3,
			alphaBars: false,
			ansiBands: false,
			barSpace: .4,
			channelLayout: LAYOUT_SINGLE,
			frequencyScale: SCALE_LOG,
			ledBars: LEDS_OFF,
			linearAmplitude: true,
			linearBoost: 1,
			lumiBars: false,
			maxDecibels: -35,
			minDecibels: -85,
			maxFreq: 12000,
			minFreq: 60,
			mirror: MIRROR_OFF,
			radial: RADIAL_OFF,
			reflexRatio: 0,
			showPeaks: PEAKS_OFF,
			showScaleX: LABELS_X_OFF,
			weightingFilter: FILTER_D
		}
	},
	{
		// use with 16kHz test tone to compare two gradients side by side
		// bar-level sample images created with a C2 (65.41 Hz) sawtooth wave (volume: 0.65)
		name: 'Testing config 4',
		options: {
			ansiBands: true,
			bandResolution: 4,
			barSpace: .25,
			channelLayout: LAYOUT_HORIZONTAL,
			colorMode: COLORMODE_GRADIENT,
			frequencyScale: SCALE_LOG,
			horizontalGradient: false,
			ledBars: LEDS_VINTAGE,
			linearAmplitude: true,
			lumiBars: false,
			maxFreq: 20000,
			minFreq: 20,
			mirror: MIRROR_RIGHT,
			mode: MODE_BARS,
			outlineBars: false,
			radial: RADIAL_OFF,
			reflexRatio: 0,
			showLedMask: true,
			showPeaks: PEAKS_DROP,
			showScaleX: LABELS_X_FREQS,
			showScaleY: LABELS_Y_DB,
			spreadGradient: false
		},
		ledProps: null
	}
];

// Demo-specific features
const features = {
	canvasHover: true,
	energyMeter: false,
	showLogo: true,
	songProgress: false
}

let mouseX, mouseY;

// Create audioMotion-analyzer object

try {
	var audioMotion = new AudioMotionAnalyzer(
		container,
		{
			source: audioEl, // main audio source is the HTML <audio> element
			fsElement: container, // element to be rendered in fullscreen (defaults to the canvas, here we use the container to take the background to fullscreen as well)
//			height: 200,
			onCanvasDraw: drawCallback, // callback function used to add custom features for this demo
			onCanvasResize: ( reason, instance ) => {
				console.log( `onCanvasResize called. Reason: ${reason}\nCanvas size is: ${instance.canvas.width} x ${instance.canvas.height}` );
				if ( reason != 'create' )
					updateUI( () => instance );
			}
		}
	);
}
catch( err ) {
	const msg = `audioMotion-analyzer failed with error: ${ err.code ? '<em>' + err.message + '</em> (code: ' + err.code + ')' : err }`;
	container.innerHTML = `<div class="warn">${ msg }</div>`;
	throw new Error( err ); // stop script
}

// Display package version at the footer
document.getElementById('version').innerText = AudioMotionAnalyzer.version;

// Create oscillator, gain and stereoPanner nodes in audioMotion's AudioContext
const audioCtx   = audioMotion.audioCtx,
	  oscillator = audioCtx.createOscillator(),
	  gainNode   = audioCtx.createGain(),
	  panNode    = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : false; // Safari >= 14.1; iOS Safari >= 14.5

gainNode.gain.value = 0;
oscillator.start();

// Connect audio nodes: oscillator -> panNode -> gainNode
if ( panNode ) {
	oscillator.connect( panNode );
	panNode.connect( gainNode );
}
else
	oscillator.connect( gainNode );

// Connect gainNode to audioMotion's input
audioMotion.connectInput( gainNode );

// Event listeners for UI controls
setPresets( presets, () => audioMotion );
addUIEventListeners( () => audioMotion );
populateThemeSelections( audioMotion );
populateControls();

// add custom scale labels
audioMotion.setScaleProps({
	xAxis: {
//		backgroundColor: '#0008',
//		color: '#fff',
//		fontSize: .15,
//		highlightColor: 'orangered',
		labels: [
			800,
			[ 3000, '|', true ],
			[ 440, 'A4', true ],
		],
//		overlay: true
	},
	yAxis: {
//		color           : '#888',
//		compositing     : 'screen',
//		dbInterval      : 6,
//		fontSize        : .15,
//		lineDash        : [2,4],
//		percentInterval : 20,
//		showSubdivisions: true,
//		showUnit        : true,
//		subLineColor    : '#555',
//		subLineDash     : [2,8]
	}
});

// handle selection of custom demo features
document.querySelectorAll('[data-feature]').forEach( el => {
	el.addEventListener( 'click', () => {
		features[ el.dataset.feature ] = ! features[ el.dataset.feature ];
		el.classList.toggle( 'active' );
	});
});

bgOptions.forEach( ( [ text, value ] ) => backgroundSelection.append( new Option( text, value ) ) );
backgroundSelection.addEventListener( 'change', () => setBackground() );
setBackground(); // initialize background

audioMotion.canvas.addEventListener( 'mousemove', evt => {
	mouseX = evt.offsetX;
	mouseY = evt.offsetY;
});

audioMotion.canvas.addEventListener( 'mouseout', evt => {
	mouseX = null;
	mouseY = null;
});

// play/pause audio on spacebar press
window.addEventListener( 'keyup', evt => {
	if ( evt.code != 'Space' )
		return;

	if ( audioEl.src ) {
		if ( audioEl.paused )
			audioEl.play();
		else
			audioEl.stop();
	}

	if ( elFreq.value ) {
		if ( gainNode.gain.value )
			playTone();
		else
			playTone( elFreq.value );
	}
});

// Create an 88-key piano keyboard

const ROOT12 = 2 ** ( 1 / 12 ),
	  scale = [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B' ];

let html   = '',
	freq   = 27.50, // A0 (first key)
	octave = 0,
	note   = 9;

do {
	const key     = scale[ note ],
		  isSharp = key.endsWith('#');

	html += `
		${ isSharp ? '' : '<div class="key">' }
		<div class="${ isSharp ? 'black' : 'white' }${ octave == 4 && note == 0 ? ' c4' : '' }" data-freq="${ freq.toFixed(2) }" title="${ key + octave }"></div>
		${ isSharp || key == 'E' || key == 'B' ? '</div>' : '' }
	`;

	freq *= ROOT12;
	note++;
	if ( note > 11 ) {
		note = 0;
		octave++;
	}
} while ( freq < 4200 ); // go up to C8 (4186 Hz)

document.getElementById('piano').innerHTML = html;

let keyDown = false;
document.querySelectorAll('.black, .white').forEach( key => {
	key.addEventListener( 'mousedown', () => {
		keyDown = true;
		playTone( key.dataset.freq );
	});
	key.addEventListener( 'mouseover', () => {
		if ( keyDown )
			playTone( key.dataset.freq );
	});
	key.addEventListener( 'mouseup', () => {
		keyDown = false;
		playTone();
	});
});

// Test tones playback

const elNote = document.getElementById('note'),
	  elFreq = document.getElementById('frequency'),
	  elVol  = document.getElementById('volume');

[ elNote, elFreq ].forEach( el => {
	el.addEventListener( 'input', () => {
		if ( el == elFreq )
			elNote.selectedIndex = 0;
		document.getElementById('btn_play').dispatchEvent( new Event('click') );
	});
});

document.getElementById('wave').addEventListener( 'change', e => oscillator.type = e.target.value );

document.getElementById('pan').addEventListener( 'change', e => {
	if ( panNode )
		panNode.pan.setValueAtTime( e.target.value, audioCtx.currentTime );
});

elVol.addEventListener( 'input', () => {
	if ( gainNode.gain.value )
		gainNode.gain.value = elVol.value;
});

document.getElementById('btn_play').addEventListener( 'click', () => playTone( elNote.value || elFreq.value ) );

document.getElementById('btn_soundoff').addEventListener( 'click', () => playTone() );

// File upload
document.getElementById('uploadFile').addEventListener( 'change', e => loadSong( e.target ) );

// Microphone and disconnectOutput (mute) buttons
const micButton  = document.getElementById('btn_mic'),
	  muteButton = document.getElementById('btn_mute');

let micStream,
	isMute = false;

micButton.addEventListener( 'click', () => {
	if ( micStream ) {
		audioMotion.disconnectInput( micStream, true ); // disconnect mic stream (also stops it)
		toggleMute( false );
		micButton.className = '';
		micStream = null;
	}
	else {
		navigator.mediaDevices.getUserMedia( { audio: true } )
		.then( stream => {
			audioMotion.connectInput( stream );
			toggleMute( true ); // mute the speakers to avoid feedback loop from the microphone
			micButton.className = 'active';
			micStream = stream; // save stream reference for disconnection
		})
		.catch( err => console.log( 'Error accessing user microphone.', err ) );
	}
});

muteButton.addEventListener( 'click', () => toggleMute() );

// getBars() button
document.getElementById('btn_getBars').addEventListener( 'click', () => console.log( 'getBars(): ', audioMotion.getBars() ) );

// getOptions() button
document.getElementById('btn_getOptions').addEventListener( 'click', () => {
	const options = audioMotion.getOptions();
	console.log( 'getOptions(): ', options );
	navigator.clipboard.writeText( JSON.stringify( options, null, 2 ) )
		.then( () => console.warn( 'Options object content copied to clipboard.' ) );
});

// getThemeData() button
document.getElementById('btn_getThemeData').addEventListener( 'click', () => {
	const theme0 = audioMotion.getTheme(0),
		  theme1 = audioMotion.getTheme(1);
	console.log( `getThemeData('${theme0}'): `, audioMotion.getThemeData( theme0 ) );
	if ( theme1 != theme0 )
		console.log( `getThemeData('${theme1}'): `, audioMotion.getThemeData( theme1 ) );
});

// Initialize UI elements
updateUI( () => audioMotion );
document.querySelectorAll('button[data-feature]').forEach( el => el.classList.toggle( 'active', !! features[ el.dataset.feature ] ) );


/** Functions **/

// set container background
function setBackground() {
	container.style.background = backgroundSelection.value;
}

// Play tone on oscillator
function playTone( freq ) {
	if ( freq ) {
		elFreq.value = freq;
		oscillator.frequency.setValueAtTime( freq, audioCtx.currentTime );
		gainNode.gain.setValueAtTime( elVol.value, audioCtx.currentTime );
	}
	else // fade-out in 0.1 second
		gainNode.gain.linearRampToValueAtTime( 0, audioCtx.currentTime + .1 );
}

// Connect or disconnect output to speakers
function toggleMute( status ) {
	isMute = ( status === undefined ) ? ! isMute : !! status;
	if ( isMute )
		audioMotion.disconnectOutput();
	else
		audioMotion.connectOutput();
	muteButton.classList.toggle( 'active', isMute );
}

// Callback function used to add custom features for this demo

function drawCallback( instance, { timestamp, themes } ) {

	const canvas     = audioMotion.canvas,
		  ctx        = audioMotion.canvasCtx,
		  pixelRatio = audioMotion.pixelRatio, // for scaling the size of things drawn on canvas, on Hi-DPI screens or loRes mode
		  baseSize   = Math.max( 20 * pixelRatio, canvas.height / 27 | 0 ),
		  fontSize   = 16 * pixelRatio,
		  centerX    = canvas.width >> 1,
		  centerY    = canvas.height >> 1;

	if ( features.energyMeter ) {
		const energy     = audioMotion.getEnergy(),
			  peakEnergy = audioMotion.getEnergy( ENERGY_PEAK );

		// overall energy peak
		const width = 50 * pixelRatio;
		const peakY = -canvas.height * ( peakEnergy - 1 );
		ctx.fillStyle = '#f008';
		ctx.fillRect( width, peakY, width, 2 );

		ctx.font = `${ fontSize }px sans-serif`;
		ctx.textAlign = 'left';
		ctx.fillText( peakEnergy.toFixed(4), width, peakY - 4 );

		// overall energy bar
		ctx.fillStyle = '#fff8';
		ctx.fillRect( width, canvas.height, width, -canvas.height * energy );

		// bass, midrange and treble meters

		const drawLight = ( posX, color, alpha ) => {
			const halfWidth   = width >> 1,
				  doubleWidth = width << 1;

			const grad = ctx.createLinearGradient( 0, 0, 0, canvas.height );
			grad.addColorStop( 0, color );
			grad.addColorStop( .75, `${color}0` );

			ctx.beginPath();
			ctx.moveTo( posX - halfWidth, 0 );
			ctx.lineTo( posX - doubleWidth, canvas.height );
			ctx.lineTo( posX + doubleWidth, canvas.height );
			ctx.lineTo( posX + halfWidth, 0 );

			ctx.save();
			ctx.fillStyle = grad;
			ctx.shadowColor = color;
			ctx.shadowBlur = 40;
			ctx.globalCompositeOperation = 'screen';
			ctx.globalAlpha = alpha;
			ctx.fill();
			ctx.restore();
		}

		ctx.textAlign = 'center';
		const growSize = baseSize * 4;

		const bassEnergy = audioMotion.getEnergy( ENERGY_BASS );
		ctx.font = `bold ${ baseSize + growSize * bassEnergy }px sans-serif`;
		ctx.fillText( 'BASS', canvas.width * .15, centerY );
		drawLight( canvas.width * .15, '#f00', bassEnergy );

		drawLight( canvas.width * .325, '#f80', audioMotion.getEnergy( ENERGY_LOWMID ) );

		const midEnergy = audioMotion.getEnergy( ENERGY_MIDRANGE );
		ctx.font = `bold ${ baseSize + growSize * midEnergy }px sans-serif`;
		ctx.fillText( 'MIDRANGE', centerX, centerY );
		drawLight( centerX, '#ff0', midEnergy );

		drawLight( canvas.width * .675, '#0f0', audioMotion.getEnergy( ENERGY_HIGHMID ) );

		const trebleEnergy = audioMotion.getEnergy( ENERGY_TREBLE );
		ctx.font = `bold ${ baseSize + growSize * trebleEnergy }px sans-serif`;
		ctx.fillText( 'TREBLE', canvas.width * .85, centerY );
		drawLight( canvas.width * .85, '#0ff', trebleEnergy );
	}

/*
	// DEBUG: visualize generated gradients for each channel
	for ( const ch of [0,1] ) {
		let x, y, w, h;

		if ( audioMotion.getThemeModifiers( 'horizontal', ch ) ) {
			x = 0;
			y = 50 * ch + 25;
			w = canvas.width;
			h = 25;
		}
		else {
			x = 75 * ch + 50;
			y = 0;
			w = 50;
			h = canvas.height;
		}

		ctx.fillStyle = themes[ ch ].gradient;
		ctx.fillRect( x, y, w, h );
	}
*/

	if ( features.showLogo ) {
		// the overall energy provides a simple way to sync a pulsating text/image to the beat
		// it usually works best than specific frequency ranges, for a wider range of music styles
		ctx.font = `${ baseSize + audioMotion.getEnergy() * 25 * pixelRatio }px Orbitron, sans-serif`;

		ctx.fillStyle = '#fff8';
		ctx.textAlign = 'center';
		ctx.fillText( 'audioMotion', canvas.width - baseSize * 8, baseSize * 2 );
	}

	if ( features.songProgress ) {
		const lineWidth = canvas.height / 40,
			  posY = lineWidth >> 1;

		ctx.beginPath();
		ctx.moveTo( 0, posY );
		ctx.lineTo( canvas.width * audioEl.currentTime / audioEl.duration, posY );
		ctx.lineCap = 'round';
		ctx.lineWidth = lineWidth;
		ctx.globalAlpha = .5;
		ctx.strokeStyle = themes[0].gradient;      // use left channel color gradient to draw the progress bar
		ctx.stroke();
	}

	if ( features.canvasHover ) {
		// show band data on mouse hover - TO-DO: handle dual channel layouts!
		if ( mouseX != null && audioMotion.channelLayout == LAYOUT_SINGLE && ! audioMotion.radial ) {
			const bar = instance.getBars().findLast( b => mouseX >= b.posX );
			if ( bar ) {
				ctx.font = `${ fontSize }px monospace`;
				ctx.textAlign = mouseX < 150 ? 'left' : 'right';
				const x = mouseX + ( mouseX < 150 ? fontSize : -fontSize ),
					  left = x - fontSize * ( mouseX < 150 ? 1.25 : 7.25 );

				ctx.fillStyle = '#0008';
				ctx.fillRect( left, mouseY - fontSize * 1.75, fontSize * 8.5, fontSize * 6 );

				ctx.fillStyle = '#fff';
				ctx.fillText( bar.freq.toFixed(2) + 'Hz', x, mouseY );
				ctx.fillText( 'p: ' + bar.peak[0].toFixed(6), x, mouseY + fontSize * 1.5 );
				ctx.fillText( 'v: ' + bar.value[0].toFixed(6), x, mouseY + fontSize * 3 );
			}
		}
	}
}
