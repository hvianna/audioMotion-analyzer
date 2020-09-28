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
		name: 'Defaults',
		options: undefined
	},
	{
		name: 'Classic LEDs',
		options: {
			mode: 3,
			barSpace: .4,
			gradient: 'classic',
			lumiBars: false,
			radial: false,
			reflexRatio: 0,
			showBgColor: true,
			showLeds: true,
			showPeaks: true
		}
	},
	{
		name: 'Mirror wave',
		options: {
			mode: 10,
			fillAlpha: .6,
			gradient: 'rainbow',
			lineWidth: 2,
			radial: false,
			reflexAlpha: 1,
			reflexBright: 1,
			reflexRatio: .5,
			showPeaks: false
		}
	},
	{
		name: 'Radial overlay',
		options: {
			mode: 5,
			barSpace: .1,
			gradient: 'prism',
			radial: true,
			showBgColor: true,
			showLeds: false,
			showPeaks: true,
			spinSpeed: 1,
			overlay: true
		}
	},
	{
		name: 'Reflex Bars',
		options: {
			mode: 5,
			barSpace: .25,
			gradient: 'rainbow',
			lumiBars: false,
			radial: false,
			reflexAlpha: .25,
			reflexBright: 1,
			reflexFit: true,
			reflexRatio: .3,
			showBgColor: false,
			showLeds: false,
			showPeaks: true,
			overlay: false
		}
	}
];

// Demo-specific features
const features = {
	showLogo: false,
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
				console.log( `[${reason}] canvas size is: ${instance.canvas.width} x ${instance.canvas.height}` );
				if ( reason != 'create' )
					updateUI();
			}
		}
	);
}
catch( err ) {
	document.getElementById('container').innerHTML = `<p>audioMotion-analyzer failed with error: <em>${err}</em></p>`;
}

// Display package version in the footer
document.getElementById('version').innerText = audioMotion.version;

// Create oscillator and gain nodes, and connect them to the analyzer

const audioCtx = audioMotion.audioCtx,
	  oscillator = audioCtx.createOscillator(),
	  gainNode = audioCtx.createGain();

oscillator.frequency.setValueAtTime( 0, audioCtx.currentTime );
oscillator.connect( gainNode );
oscillator.start();
gainNode.connect( audioMotion.analyzer );

// Event listeners for UI controls

document.querySelectorAll('[data-prop]').forEach( el => {
	el.addEventListener( 'click', () => {
		if ( el.dataset.func )
			audioMotion[ el.dataset.func ]();
		else
			audioMotion[ el.dataset.prop ] = ! audioMotion[ el.dataset.prop ];
		el.classList.toggle( 'active' );
	});
});

document.querySelectorAll('[data-feature]').forEach( el => {
	el.addEventListener( 'click', () => {
		features[ el.dataset.feature ] = ! features[ el.dataset.feature ];
		el.classList.toggle( 'active' );
	});
});

document.querySelectorAll('[data-setting]').forEach( el => {
	el.addEventListener( 'change', () => audioMotion[ el.dataset.setting ] = el.value );
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

// Test tones playback

document.querySelectorAll('#wave, #note, #frequency').forEach( el => {
	el.addEventListener( 'input', () => {
		if ( el.id == 'frequency' )
			document.getElementById('note').selectedIndex = 0;
		document.getElementById('btn_play').dispatchEvent( new Event('click') );
	});
});

document.getElementById('btn_play').addEventListener( 'click', () => {
	oscillator.type = document.getElementById('wave').value;
	oscillator.frequency.setValueAtTime( document.getElementById('note').value || document.getElementById('frequency').value, audioCtx.currentTime );
	gainNode.gain.setValueAtTime( .2, audioCtx.currentTime );
});

document.getElementById('btn_soundoff').addEventListener( 'click', () => gainNode.gain.setValueAtTime( 0, audioCtx.currentTime ) );

// File upload
document.getElementById('uploadFile').addEventListener( 'change', e => loadSong( e.target ) );

// Initialize UI elements
updateUI();

// Resume audio context if in suspended state (browsers' autoplay policy)
window.addEventListener( 'click', () => {
	if ( audioMotion.audioCtx.state == 'suspended' )
		audioMotion.audioCtx.resume();
});

// Load song from user's computer
function loadSong( el ) {
	const fileBlob = el.files[0];

	if ( fileBlob ) {
		audioEl.src = URL.createObjectURL( fileBlob );
		audioEl.play();
	}
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
	document.querySelectorAll('button[data-prop]').forEach( el => {
		const p = audioMotion[ el.dataset.prop ];
		el.classList.toggle( 'active', el.dataset.prop == 'isOn' ? ! p : p );
	});

	document.querySelectorAll('button[data-feature]').forEach( el => el.classList.toggle( 'active', features[ el.dataset.feature ] ) );
}

// Callback function used to add custom features for this demo

function drawCallback() {

	const canvas   = audioMotion.canvas,
		  ctx      = audioMotion.canvasCtx,
		  gradient = ctx.fillStyle; // save the current gradient

	if ( features.energyMeter ) {
		ctx.fillStyle = '#fff8';
		ctx.fillRect( 50, canvas.height, 50, -canvas.height * audioMotion.energy );

		ctx.fillStyle = '#f008';
		ctx.fillRect( 50, canvas.height - canvas.height * audioMotion.peakEnergy, 50, 2 );

		ctx.font = '16px sans-serif';
		ctx.textAlign = 'left';
		ctx.fillText( audioMotion.peakEnergy, 50, canvas.height - 4 - canvas.height * audioMotion.peakEnergy);
	}

	if ( features.showLogo ) {
		const baseSize = ( audioMotion.isFullscreen ? 40 : 20 ) * audioMotion.pixelRatio;

		// use the 'energy' value to increase the font size and make the logo pulse to the beat
		ctx.font = `${ baseSize + audioMotion.energy * 25 * audioMotion.pixelRatio }px Orbitron, sans-serif`;

		ctx.fillStyle = '#fff8';
		ctx.textAlign = 'center';
		ctx.fillText( 'audioMotion', canvas.width - baseSize * 8, baseSize * 2 );
	}

	if ( features.songProgress && audioMotion.radial ) {
		const lineWidth = canvas.height / 60,
			  radius    = canvas.height / 8 - lineWidth / 2 - ( audioMotion.showScale ? canvas.height * .03 : 0 ),
			  centerX   = canvas.width / 2,
			  centerY   = canvas.height / 2,
			  angle     = ( 2 * Math.PI * audioEl.currentTime / audioEl.duration ) - Math.PI / 2;

		ctx.beginPath();
		ctx.arc( centerX, centerY, radius, -Math.PI / 2, angle );
		ctx.fillStyle = gradient;
		ctx.lineWidth = lineWidth;
		ctx.globalAlpha = audioMotion.energy;
		ctx.stroke();
	}

}
