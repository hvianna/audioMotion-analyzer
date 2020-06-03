/**
 * audioMotion-analyzer fluid layout demo
 *
 * https://github.com/hvianna/audioMotion-analyzer
 */

import AudioMotionAnalyzer from '../../src/audioMotion-analyzer.js';

const mindB = [ -70, -80, -85, -90, -100 ], // for sensitivity presets
	  maxdB = [ -10, -20, -25, -30, -40 ],
	  audioEl = document.getElementById('audio');

// Create audioMotion-analyzer object

try {
	var audioMotion = new AudioMotionAnalyzer(
		document.getElementById('container'),
		{
			source: audioEl, // main source is the HTML audio element
			showFPS: true,
			onCanvasDraw: displayCanvasMsg, // callback function to add custom content to the canvas
			onCanvasResize: ( reason, instance ) => {
				console.log( `[${reason}] set: ${instance.width} x ${instance.height} | actual: ${instance.canvas.width} x ${instance.canvas.height}` );
				if ( reason == 'fschange' )
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

// Add a custom property to store the logo display preference
// this is a feature added by this demo, not part of audioMotion-analyzer
audioMotion.showLogo = true;

// Create oscillator and gain nodes, and connect them to the analyzer

const audioCtx = audioMotion.audioCtx,
	  oscillator = audioCtx.createOscillator(),
	  gainNode = audioCtx.createGain();

oscillator.frequency.setValueAtTime( 0, audioCtx.currentTime );
oscillator.connect( gainNode );
oscillator.start();
gainNode.connect( audioMotion.analyzer );

// Event listeners for UI controls

document.querySelectorAll('button[data-prop]').forEach( el => {
	el.addEventListener( 'click', () => {
		if ( el.dataset.func )
			audioMotion[ el.dataset.func ]();
		else
			audioMotion[ el.dataset.prop ] = ! audioMotion[ el.dataset.prop ];
		el.classList.toggle( 'active' );
	});
});

document.querySelectorAll('[data-setting]').forEach( el => {
	el.addEventListener( 'change', () => {
		audioMotion[ el.dataset.setting ] = el.value;
		if ( el.dataset.setting == 'mode' ) {
			document.getElementById('area_options').disabled = ( audioMotion.mode != 10 );
			document.getElementById('bar_options').disabled = ( audioMotion.mode == 0 || audioMotion.mode == 10 );
		}
	});
});

document.getElementById('range').addEventListener( 'change', e => {
	const selected = e.target[ e.target.selectedIndex ];
	audioMotion.setFreqRange( selected.dataset.min, selected.dataset.max );
});

document.getElementById('sensitivity').addEventListener( 'change', e => audioMotion.setSensitivity( mindB[ e.target.value ], maxdB[ e.target.value ] ) );

// Display value of ranged input elements
document.querySelectorAll('input[type="range"]').forEach( el => el.addEventListener( 'change', () => updateRangeElement( el ) ) );

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

// File and URL loading
document.getElementById('uploadFile').addEventListener( 'change', e => loadSong( e.target ) );
document.getElementById('loadFromURL').addEventListener( 'click', () => {
	audioEl.src = document.getElementById('remoteURL').value;
	audioEl.play();
});

// Initialize UI elements
updateUI();

// Resume audio context if in suspended state (browsers' autoplay policy)
window.addEventListener( 'click', () => {
	if ( audioMotion.audioCtx.state == 'suspended' )
		audioMotion.audioCtx.resume();
});

// The callback function is used here to draw the pulsating logo on the canvas
function displayCanvasMsg() {
	if ( ! audioMotion.showLogo )
		return;

	let size = 20 * audioMotion.pixelRatio;
	if ( audioMotion.isFullscreen )
		size *= 2;

	// find the data array index for 140Hz
	const idx = audioMotion.freqToBin(140);

	// use the 140Hz amplitude to increase the font size and make the logo pulse to the beat
	audioMotion.canvasCtx.font = `${size + audioMotion.dataArray[ idx ] / 16 * audioMotion.pixelRatio}px Orbitron,sans-serif`;

	audioMotion.canvasCtx.fillStyle = '#fff8';
	audioMotion.canvasCtx.textAlign = 'center';
	audioMotion.canvasCtx.fillText( 'audioMotion', audioMotion.canvas.width - size * 8, size * 2 );
}

// Load song from user's computer
function loadSong( el ) {
	const reader = new FileReader();

	reader.readAsDataURL( el.files[0] );
	reader.onload = () => {
		audioEl.src = reader.result;
		audioEl.play();
	};
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

	document.getElementById('area_options').disabled = ( audioMotion.mode != 10 );
	document.getElementById('bar_options').disabled = ( audioMotion.mode == 0 || audioMotion.mode == 10 );

	document.getElementById('range').selectedIndex = [20,30,100].indexOf( audioMotion.minFreq );
	document.getElementById('sensitivity').value = maxdB.indexOf( audioMotion.maxDecibels );

	document.querySelectorAll('input[type="range"]').forEach( el => updateRangeElement( el ) );
	document.querySelectorAll('button[data-prop]').forEach( el => {
		const p = audioMotion[ el.dataset.prop ];
		el.classList.toggle( 'active', el.dataset.prop == 'isOn' ? ! p : p );
	});
}
