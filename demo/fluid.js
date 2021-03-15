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

// Display package version at the footer
document.getElementById('version').innerText = AudioMotionAnalyzer.version;

// Create oscillator, gain and stereoPanner nodes in audioMotion's AudioContext
const audioCtx   = audioMotion.audioCtx,
	  oscillator = audioCtx.createOscillator(),
	  gainNode   = audioCtx.createGain(),
	  panNode    = audioCtx.createStereoPanner();

oscillator.frequency.setValueAtTime( 0, audioCtx.currentTime );
oscillator.start();

// Connect audio nodes: oscillator -> panNode -> gainNode
oscillator.connect( panNode );
panNode.connect( gainNode );

// Connect gainNode to audioMotion's input
audioMotion.connectInput( gainNode );

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

// Stereo pan for test tones
document.getElementById('pan').addEventListener( 'change', e => panNode.pan.setValueAtTime( e.target.value, audioCtx.currentTime ) );

// File upload
document.getElementById('uploadFile').addEventListener( 'change', e => loadSong( e.target ) );

// Initialize UI elements
updateUI();

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
	document.querySelectorAll('button[data-prop]').forEach( el => el.classList.toggle( 'active', audioMotion[ el.dataset.prop ] ) );
	document.querySelectorAll('button[data-feature]').forEach( el => el.classList.toggle( 'active', features[ el.dataset.feature ] ) );
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
