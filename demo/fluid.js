/**
 * audioMotion-analyzer fluid layout demo
 *
 * https://github.com/hvianna/audioMotion-analyzer
 */

import AudioMotionAnalyzer from '../src/audioMotion-analyzer.js';

const audioEl = document.getElementById('audio'),
	  presetSelection = document.getElementById('presets');

// Visualization presets
const presets = [
	{
		name: 'Reset to defaults',
		options: undefined
	},
	{
		name: 'Classic LED bars',
		options: {
			mode: 6,
			alphaBars: false,
			ansiBands: true,
			barSpace: .5,
			channelLayout: 'single',
			colorMode: 'gradient',
			frequencyScale: 'log',
			gradient: 'classic',
			ledBars: true,
			lumiBars: false,
			maxFreq: 20000,
			minFreq: 25,
			mirror: 0,
			radial: false,
			reflexRatio: 0,
			showBgColor: true,
			showPeaks: true,
			trueLeds: true
		}
	},
	{
		name: 'Mirror wave',
		options: {
			mode: 10,
			channelLayout: 'single',
			fillAlpha: .6,
			gradient: 'rainbow',
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
		}
	},
	{
		name: 'Radial spectrum + Overlay',
		options: {
			mode: 5,
			barSpace: .1,
			channelLayout: 'single',
			gradient: 'prism',
			ledBars: false,
			maxFreq: 20000,
			minFreq: 20,
			mirror: 0,
			radial: true,
			showBgColor: true,
			showPeaks: true,
			spinSpeed: 1,
			overlay: true
		}
	},
	{
		name: 'Bark scale + Linear amplitude',
		options: {
			mode: 0,
			channelLayout: 'single',
			frequencyScale: 'bark',
			gradient: 'rainbow',
			linearAmplitude: true,
			linearBoost: 1.8,
			maxFreq: 20000,
			minFreq: 20,
			mirror: 0,
			overlay: false,
			radial: false,
			reflexAlpha: .25,
			reflexBright: 1,
			reflexFit: true,
			reflexRatio: .3,
			showPeaks: true,
			showScaleX: true,
			weightingFilter: 'D'
		}
	},
	{
		name: 'Dual channel combined',
		options: {
			mode: 10,
			channelLayout: 'dual-combined',
			fillAlpha: .25,
			frequencyScale: 'bark',
			gradientLeft: 'steelblue',
			gradientRight: 'orangered',
			linearAmplitude: true,
			linearBoost: 1.8,
			lineWidth: 1.5,
			maxFreq: 20000,
			minFreq: 20,
			mirror: 0,
			overlay: false,
			radial: false,
			reflexRatio: 0,
			showPeaks: false,
			weightingFilter: 'D'
		}
	},
	{
		name: 'roundBars + "bar-level" colorMode',
		options: {
			mode: 2,
			alphaBars: false,
			ansiBands: false,
			barSpace: .25,
			channelLayout: 'single',
			colorMode: 'bar-level',
			frequencyScale: 'log',
			gradient: 'prism',
			ledBars: false,
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
		}
	},
	{
		name: 'Testing config 1 (reflex + mirror)',
		options: {
			mode: 10,
			channelLayout: 'single',
			gradient: 'rainbow',
			linearAmplitude: false,
			reflexRatio: .4,
			showBgColor: true,
			showPeaks: true,
			showScaleX: false,
			mirror: -1,
			maxFreq: 8000,
			minFreq: 20,
			overlay: true,
			lineWidth: 2,
			fillAlpha: .2
		}
	},
	{
		name: 'Testing config 2 (dual LED bars)',
		options: {
			mode: 2,
			alphaBars: false,
			ansiBands: false,
			barSpace: .1,
			channelLayout: 'dual-vertical',
			gradientLeft: 'steelblue',
			gradientRight: 'orangered',
			ledBars: true,
			lumiBars: false,
			radial: false,
			reflexRatio: 0,
			showPeaks: true,
			showScaleX: false,
			mirror: 0,
			maxFreq: 16000,
			minFreq: 20,
			overlay: false,
		}
	},
	{
		// gradient sample images for docs are created with a 27.5Hz square wave (volume: 1) in the oscillator
		name: 'Testing config 3 (gradient samples)',
		options: {
			mode: 6,
			alphaBars: false,
			ansiBands: false,
			barSpace: .4,
			channelLayout: 'single',
			frequencyScale: 'log',
			ledBars: false,
			linearAmplitude: true,
			linearBoost: 1,
			lumiBars: false,
			maxDecibels: -35,
			minDecibels: -85,
			maxFreq: 12000,
			minFreq: 60,
			mirror: 0,
			overlay: false,
			radial: false,
			reflexRatio: 0,
			showPeaks: false,
			showScaleX: false,
			weightingFilter: 'D'
		}
	}
];

// Demo-specific features
const features = {
	showLogo: true,
	energyMeter: false,
	songProgress: false
}

// Create audioMotion-analyzer object

try {
	var audioMotion = new AudioMotionAnalyzer(
		document.getElementById('container'),
		{
			source: audioEl, // main audio source is the HTML <audio> element
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
	document.getElementById('container').innerHTML = `<p>audioMotion-analyzer failed with error: ${ err.code ? '<strong>' + err.code + '</strong>' : '' } <em>${ err.code ? err.message : err }</em></p>`;
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

document.querySelectorAll('[data-prop]').forEach( el => {
	el.addEventListener( 'click', () => {
		if ( el.dataset.func )
			audioMotion[ el.dataset.func ]();
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
	el.addEventListener( 'change', () => {
		audioMotion[ el.dataset.setting ] = el.value;
		updateUI();
	});
});

document.querySelectorAll('[data-custom]').forEach( el => {
	el.addEventListener( 'change', () => {
		const active  = document.getElementById('customLeds').checked,
			  maxLeds = document.getElementById('maxLeds').value,
			  spaceV  = document.getElementById('spaceV').value,
			  spaceH  = document.getElementById('spaceH').value;
		audioMotion.setLedParams( active ? { maxLeds, spaceV, spaceH } : undefined );
	});
});

// Display value of ranged input elements
document.querySelectorAll('input[type="range"]').forEach( el => el.addEventListener( 'change', () => updateRangeElement( el ) ) );

// Populate the UI presets select element

presets.forEach( ( preset, index ) => {
	const option = new Option( preset.name, index );
	presetSelection.append( option );
});

presetSelection.addEventListener( 'change', () => {
	audioMotion.setOptions( presets[ presetSelection.value ].options );
	updateUI();
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

elVol.addEventListener( 'change', () => {
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

// Initialize UI elements
updateUI();


/** Functions **/

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

// Update value div of range input elements
function updateRangeElement( el ) {
	const s = el.nextElementSibling;
	if ( s && s.className == 'value' )
		s.innerText = el.value;
}

// Update UI elements to reflect the analyzer's current settings
function updateUI() {
	document.querySelectorAll('[data-setting]').forEach( el => el.value = audioMotion[ el.dataset.setting ] );
	document.querySelectorAll('input[type="range"]').forEach( el => updateRangeElement( el ) );
	document.querySelectorAll('button[data-prop]').forEach( el => el.classList.toggle( 'active', audioMotion[ el.dataset.prop ] ) );
	document.querySelectorAll('button[data-feature]').forEach( el => el.classList.toggle( 'active', features[ el.dataset.feature ] ) );
	document.querySelectorAll('[data-flag]').forEach( el => el.classList.toggle( 'active', audioMotion[ el.dataset.flag ] ) );
}

// Callback function used to add custom features for this demo

function drawCallback() {

	const canvas     = audioMotion.canvas,
		  ctx        = audioMotion.canvasCtx,
		  pixelRatio = audioMotion.pixelRatio, // for scaling the size of things drawn on canvas, on Hi-DPI screens or loRes mode
		  baseSize   = Math.max( 20 * pixelRatio, canvas.height / 27 | 0 ),
		  centerX    = canvas.width >> 1,
		  centerY    = canvas.height >> 1;

	if ( features.energyMeter ) {
		const energy     = audioMotion.getEnergy(),
			  peakEnergy = audioMotion.getEnergy('peak');

		// overall energy peak
		const width = 50 * pixelRatio;
		const peakY = -canvas.height * ( peakEnergy - 1 );
		ctx.fillStyle = '#f008';
		ctx.fillRect( width, peakY, width, 2 );

		ctx.font = `${ 16 * pixelRatio }px sans-serif`;
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

		const bassEnergy = audioMotion.getEnergy('bass');
		ctx.font = `bold ${ baseSize + growSize * bassEnergy }px sans-serif`;
		ctx.fillText( 'BASS', canvas.width * .15, centerY );
		drawLight( canvas.width * .15, '#f00', bassEnergy );

		drawLight( canvas.width * .325, '#f80', audioMotion.getEnergy('lowMid') );

		const midEnergy = audioMotion.getEnergy('mid');
		ctx.font = `bold ${ baseSize + growSize * midEnergy }px sans-serif`;
		ctx.fillText( 'MIDRANGE', centerX, centerY );
		drawLight( centerX, '#ff0', midEnergy );

		drawLight( canvas.width * .675, '#0f0', audioMotion.getEnergy('highMid') );

		const trebleEnergy = audioMotion.getEnergy('treble');
		ctx.font = `bold ${ baseSize + growSize * trebleEnergy }px sans-serif`;
		ctx.fillText( 'TREBLE', canvas.width * .85, centerY );
		drawLight( canvas.width * .85, '#0ff', trebleEnergy );
	}

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
		ctx.globalAlpha = audioMotion.getEnergy(); // use the song energy to control the bar opacity
		ctx.stroke();
	}

}
