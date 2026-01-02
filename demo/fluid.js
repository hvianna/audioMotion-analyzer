/**
 * audioMotion-analyzer fluid layout demo
 *
 * https://github.com/hvianna/audioMotion-analyzer
 */

import {
	AudioMotionAnalyzer,
	ENERGY_BASS,
	ENERGY_HIGHMID,
	ENERGY_LOWMID,
	ENERGY_MIDRANGE,
	ENERGY_PEAK,
	ENERGY_TREBLE,
	LEDS_MODERN,
	LEDS_OFF,
	LEDS_VINTAGE
} from '../src/audioMotion-analyzer.js';

const audioEl             = document.getElementById('audio'),
	  backgroundSelection = document.getElementById('bgColor'),
	  container           = document.getElementById('container'),
	  presetSelection     = document.getElementById('presets');

// container background options
const bgOptions = [
	[ 'Dark',  'transparent' ],
	[ 'Light', '#ccc' ],
	[ 'Gray',  'dimgray' ],
	[ 'Image', 'url(media/synthwave.jpg) center/contain' ]
];

// Visualization presets
const presets = [
	{
		name: 'Reset to defaults',
		options: undefined,
		theme: { name: 'classic', modifiers: {} } // clear modifiers
	},
	{
		name: 'Classic LED bars',
		options: {
			mode: 'bars',
			alphaBars: false,
			ansiBands: true,
			bandResolution: 3,
			barSpace: .5,
			channelLayout: 'single',
			colorMode: 'gradient',
			frequencyScale: 'log',
			ledBars: LEDS_VINTAGE,
			lumiBars: false,
			maxFreq: 20000,
			minFreq: 25,
			mirror: 0,
			radial: false,
			reflexRatio: 0,
			showLedMask: true,
			showPeaks: true
		},
		theme: { name: 'classic', modifiers: {} }
	},
	{
		name: 'Mirror wave',
		options: {
			mode: 'graph',
			bandResolution: 0,
			channelLayout: 'single',
			fillAlpha: .6,
			lineWidth: 1.5,
			maxFreq: 20000,
			minFreq: 30,
			mirror: -1,
			radial: false,
			reflexAlpha: 1,
			reflexBright: 1,
			reflexRatio: .5,
			showPeaks: false,
			showScaleX: false
		},
		theme: 'rainbow'
	},
	{
		name: 'Radial spectrum',
		options: {
			mode: 'bars',
			bandResolution: 4,
			barSpace: .1,
			channelLayout: 'single',
			ledBars: LEDS_OFF,
			maxFreq: 20000,
			minFreq: 20,
			mirror: 0,
			radial: true,
			showPeaks: true,
			spinSpeed: 1
		},
		theme: 'rainbow'
	},
	{
		name: 'Bark scale + Linear level',
		options: {
			mode: 'bars',
			bandResolution: 0,
			channelLayout: 'single',
			frequencyScale: 'bark',
			linearAmplitude: true,
			linearBoost: 1.8,
			maxFreq: 20000,
			minFreq: 20,
			mirror: 0,
			radial: false,
			reflexAlpha: .25,
			reflexBright: 1,
			reflexFit: true,
			reflexRatio: .25,
			showPeaks: true,
			showScaleX: true,
			weightingFilter: 'D'
		},
		theme: { name: 'rainbow', modifiers: { horizontal: true } }
	},
	{
		name: 'Dual channel combined',
		options: {
			mode: 'graph',
			bandResolution: 0,
			channelLayout: 'dual-combined',
			fillAlpha: .25,
			frequencyScale: 'bark',
			linearAmplitude: true,
			linearBoost: 1.8,
			lineWidth: 1.5,
			maxFreq: 20000,
			minFreq: 20,
			mirror: 0,
			radial: false,
			reflexRatio: 0,
			showPeaks: false,
			weightingFilter: 'D'
		},
		theme: [ 'steelblue', 'orangered' ]
	},
	{
		name: 'roundBars + bar-level',
		options: {
			mode: 'bars',
			bandResolution: 7,
			alphaBars: false,
			ansiBands: false,
			barSpace: .25,
			channelLayout: 'single',
			colorMode: 'bar-level',
			frequencyScale: 'log',
			ledBars: LEDS_OFF,
			linearAmplitude: true,
			linearBoost: 1.6,
			lumiBars: false,
			maxFreq: 16000,
			minFreq: 30,
			mirror: 0,
			radial: false,
			reflexRatio: .5,
			reflexAlpha: 1,
			roundBars: true,
			showPeaks: false,
			showScaleX: false,
			smoothing: .7,
			weightingFilter: 'D'
		},
		theme: 'rainbow'
	},
	{
		name: 'Testing config 1',
		options: {
			mode: 'graph',
			bandResolution: 0,
			channelLayout: 'single',
			linearAmplitude: false,
			reflexRatio: .4,
			showPeaks: true,
			showScaleX: false,
			mirror: -1,
			maxFreq: 8000,
			minFreq: 20,
			lineWidth: 2,
			fillAlpha: .2
		},
		theme: { name: 'rainbow', modifiers: {} }
	},
	{
		name: 'Testing config 2',
		options: {
			mode: 'bars',
			bandResolution: 7,
			alphaBars: false,
			ansiBands: false,
			barSpace: .1,
			channelLayout: 'dual-vertical',
			ledBars: LEDS_MODERN,
			lumiBars: false,
			radial: false,
			reflexRatio: 0,
			showPeaks: true,
			showScaleX: false,
			mirror: 0,
			maxFreq: 16000,
			minFreq: 20
		},
		theme: [ { name: 'steelblue', modifiers: {} }, { name: 'orangered', modifiers: {} } ]
	},
	{
		// gradient sample images for docs are created with a 27.5 Hz square wave (volume: 1) in the oscillator
		name: 'Testing config 3',
		options: {
			mode: 'bars',
			bandResolution: 3,
			alphaBars: false,
			ansiBands: false,
			barSpace: .4,
			channelLayout: 'single',
			frequencyScale: 'log',
			ledBars: LEDS_OFF,
			linearAmplitude: true,
			linearBoost: 1,
			lumiBars: false,
			maxDecibels: -35,
			minDecibels: -85,
			maxFreq: 12000,
			minFreq: 60,
			mirror: 0,
			radial: false,
			reflexRatio: 0,
			showPeaks: false,
			showScaleX: false,
			weightingFilter: 'D'
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
			channelLayout: 'dual-horizontal',
			colorMode: 'gradient',
			flipColors: false,
			frequencyScale: 'log',
			horizontalGradient: false,
			ledBars: LEDS_VINTAGE,
			linearAmplitude: true,
			lumiBars: false,
			maxFreq: 20000,
			minFreq: 20,
			mirror: 1,
			mode: 'bars',
			outlineBars: false,
			radial: false,
			reflexRatio: 0,
			showLedMask: true,
			showPeaks: true,
			showScaleX: true,
			showScaleY: true,
			splitGradient: false
		}
	}
];

// Demo-specific features
const features = {
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
					updateUI();
			}
		}
	);
}
catch( err ) {
	const msg = `audioMotion-analyzer failed with error: ${ err.code ? '<em>' + err.message + '</em> (code: ' + err.code + ')' : err }`;
	container.innerHTML = `<div class="warn">${ msg }</div>`;
	throw new Error( err ); // stop script
}

/*
// tests with invalid options

console.log( 'reflexRatio', audioMotion.reflexRatio );

audioMotion.reflexRatio = 1;

audioMotion.theme = 'mono';
audioMotion.themeRight = 'prism';

audioMotion.themeLeft = 'xoxo';
audioMotion.themeRight = 'hauhahua';

audioMotion.maxFreq = 20000;

audioMotion.setFreqRange( 60, -1 );
audioMotion.setFreqRange( 'a', 'b' );
audioMotion.setFreqRange( '16000', '60' );

audioMotion.registerTheme('a', {});
*/

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

document.querySelectorAll('[data-prop]').forEach( el => {
	el.addEventListener( 'click', () => {
		if ( el.dataset.func ) {
			const [ funcName, args ] = parseDatasetFunction( el.dataset.func, el.value );
			audioMotion[ funcName ]( ...args );
		}
		else
			audioMotion[ el.dataset.prop ] = ! audioMotion[ el.dataset.prop ];
		updateUI();
	});
});

document.querySelectorAll('[data-feature]').forEach( el => {
	el.addEventListener( 'click', () => {
		features[ el.dataset.feature ] = ! features[ el.dataset.feature ];
		el.classList.toggle( 'active' );
	});
});

document.querySelectorAll('[data-setting]').forEach( el => {
	el.addEventListener( 'input', () => {
		if ( el.dataset.func ) {
			const [ funcName, args ] = parseDatasetFunction( el.dataset.func, el.value );
			audioMotion[ funcName ]( ...args );
		}
		else
			audioMotion[ el.dataset.setting ] = el.value;
		updateUI();
	});
});

document.querySelectorAll('[data-custom]').forEach( el => {
	el.addEventListener( 'input', () => {
		const active    = document.getElementById('customLeds').checked,
			  ledHeight = document.getElementById('ledHeight').value,
			  gapHeight = document.getElementById('gapHeight').value;
		audioMotion.setLeds( ...( active ? [ ledHeight, gapHeight ] : [] ) );
	});
});

// Display value of ranged input elements
document.querySelectorAll('input[type="range"]').forEach( el => el.addEventListener( 'input', () => updateRangeElement( el, audioMotion ) ) );

// Add custom themes
audioMotion.registerTheme( 'classic-A', {
    colorStops: [ 'red', 'yellow', 'lime' ] // automatic color distribution
});

audioMotion.registerTheme( 'classic-B', {
    colorStops: [                       // custom levels, but auto gradient positions
        { color: 'red' },               // top color is always assigned level: 1 (amplitude up to 100%)
        { color: 'yellow', level: .9 }, // use this color for level ≤ 90% (but > 60%)
        { color: 'lime', level: .6 }    // use this color for level ≤ 60%
    ]
});

audioMotion.registerTheme( 'bluey-A', {
    colorStops: [                       // only colors are defined, so automatic distribution is done
        { color: 'red' },
        { color: '#1ea1df' }
    ]
});

audioMotion.registerTheme( 'bluey-B', {
    colorStops: [                                // note that level and pos are inversely proportional
        { color: 'red' },                        // this will be auto-assigned level: 1, pos: 0
        { color: '#1ea1df', level: .9, pos: .15 } // sets level and gradient position, for similar look
    ]
});


audioMotion.theme = 'classic-A';
audioMotion.unregisterTheme('classic');


audioMotion.registerTheme( 'prism-new', {
	colorStops: [ '#a35', '#c66', '#e94', '#ed0', '#9d5', '#4d8', '#2cb', '#0bc', '#09c', '#36b', '#639', '#817' ]
});

audioMotion.setXAxis({
	addLabels: true,
	labels: [
		800,
		[ 3000, '|' ],
		[ 440, 'A4', true ],
	],
//	overlay: true,
//	height: 40
});

audioMotion.setYAxis({
	linearInterval: 10,
//	color: '#8888',
//	lineDash: [2,4],
//	midLineColor: '#5558',
//	midLineDash: [2,8],
//	showSubdivisions: false,
//	operation: 'screen',
//	showUnit: false,
//	width: 25
});


// Populate UI select elements and add event listeners

presets.forEach( ( preset, index ) => {
	const option = new Option( preset.name, index );
	presetSelection.append( option );
});

presetSelection.addEventListener( 'change', () => {
	const { options, theme } = presets[ presetSelection.value ];
	audioMotion.setOptions( options );
	if ( theme )
		audioMotion.setTheme( theme );
	updateUI();
});

bgOptions.forEach( ( [ text, value ] ) => backgroundSelection.append( new Option( text, value ) ) );
setBackground(); // initialize background

backgroundSelection.addEventListener( 'change', () => setBackground() );

populateThemeSelections( audioMotion );

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
		audioMotion.disconnectInput( micStream, true ); // disconnect mic stream and release audio track
		toggleMute( false );
		micButton.className = '';
		micStream = null;
	}
	else {
		navigator.mediaDevices.getUserMedia( { audio: true } )
		.then( stream => {
			micStream = audioMotion.audioCtx.createMediaStreamSource( stream );
			toggleMute( true ); // mute the speakers to avoid feedback loop from the microphone
			audioMotion.connectInput( micStream );
			micButton.className = 'active';
		})
		.catch( err => console.log('Error accessing user microphone.') );
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
updateUI();


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

// Load song from user's computer
function loadSong( el ) {
	const fileBlob = el.files[0];

	if ( fileBlob ) {
		audioEl.src = URL.createObjectURL( fileBlob );
		audioEl.play();
	}
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

// Update UI elements to reflect the analyzer's current settings
function updateUI() {
	if ( audioMotion.isDestroyed )
		container.innerHTML = '<div class="warn">audioMotion instance has been destroyed. Reload the page to start again.</div>';

	document.querySelectorAll('[data-setting]').forEach( el => {
		if ( el.dataset.setting.indexOf('(') >= 0 ) { // it's a function
			const [ funcName, args ] = parseDatasetFunction( el.dataset.setting );
			el.value = audioMotion[ funcName ]( ...args );
		}
		else
			el.value = audioMotion[ el.dataset.setting ];
	});
	document.querySelectorAll('input[type="range"]').forEach( el => updateRangeElement( el, audioMotion ) );
	document.querySelectorAll('button[data-prop]').forEach( el => {
		let ret;
		if ( el.dataset.prop.indexOf('(') >= 0 ) { // it's a function
			const [ funcName, args ] = parseDatasetFunction( el.dataset.prop );
			ret = audioMotion[ funcName ]( ...args );
		}
		else
			ret = audioMotion[ el.dataset.prop ];

		el.classList.toggle( 'active', !! ret );
	});
	document.querySelectorAll('button[data-feature]').forEach( el => el.classList.toggle( 'active', !! features[ el.dataset.feature ] ) );
	document.querySelectorAll('[data-flag]').forEach( el => el.classList.toggle( 'active', !! audioMotion[ el.dataset.flag ] ) );
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

		if ( mouseX != null ) {
			const bar = instance.getBars().findLast( b => mouseX >= b.posX );
			if ( bar ) {
				ctx.fillStyle = '#fff';
				ctx.font = `${ fontSize }px sans-serif`;
				ctx.textAlign = mouseX < 100 ? 'left' : 'right';
				const x = mouseX + ( mouseX < 100 ? fontSize : -fontSize );

				ctx.fillText( bar.freq.toFixed(2) + 'Hz', x, mouseY );
				ctx.fillText( bar.value[0], x, mouseY + fontSize * 1.5 );
			}
		}
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
		ctx.globalAlpha = audioMotion.getEnergy(); // use song energy to control the bar opacity
		ctx.strokeStyle = themes[0].gradient;      // use left channel color gradient to draw the progress bar
		ctx.stroke();
	}

}
