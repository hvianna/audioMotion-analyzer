/**
 * audioMotion-analyzer demo
 *
 * https://github.com/hvianna/audioMotion-analyzer
 */

import AudioMotionAnalyzer from '../dist/audioMotion-analyzer.js';

var audioEl = document.getElementById('audio'),
	showLogo = true;

// Create audioMotion-analyzer object

try {
	var audioMotion = new AudioMotionAnalyzer(
		document.getElementById('container'),
		{
			source: audioEl, // main source is the HTML audio element
			showFPS: true,
			onCanvasDraw: displayCanvasMsg, // callback function to add custom content to the canvas
			onCanvasResize: logCanvasResize
		}
	);
}
catch( err ) {
	document.getElementById('container').innerHTML = `<p>audioMotion-analyzer failed with error: <em>${err}</em></p>`;
}

// Create oscillator and gain nodes, and connect them to the analyzer

var audioCtx = audioMotion.audioCtx,
	oscillator = audioCtx.createOscillator(),
	gainNode = audioCtx.createGain();

oscillator.frequency.setValueAtTime( 0, audioCtx.currentTime );
oscillator.connect( gainNode );
oscillator.start();
gainNode.connect( audioMotion.analyzer );

// Event listeners for UI buttons

document.getElementById('btn_fullscr').addEventListener( 'click', () => audioMotion.toggleFullscreen() );
document.getElementById('btn_bgcolor').addEventListener( 'click', () => audioMotion.showBgColor = ! audioMotion.showBgColor );
document.getElementById('btn_peaks').addEventListener( 'click', () => audioMotion.showPeaks = ! audioMotion.showPeaks );
document.getElementById('btn_leds').addEventListener( 'click', () => audioMotion.showLeds = ! audioMotion.showLeds );
document.getElementById('btn_lumi').addEventListener( 'click', () => audioMotion.lumiBars = ! audioMotion.lumiBars );
document.getElementById('btn_scale').addEventListener( 'click', () => audioMotion.showScale = ! audioMotion.showScale );
document.getElementById('btn_lores').addEventListener( 'click', () => audioMotion.loRes = ! audioMotion.loRes );
document.getElementById('btn_fps').addEventListener( 'click', () => audioMotion.showFPS = ! audioMotion.showFPS );
document.getElementById('btn_logo').addEventListener( 'click', () => showLogo = ! showLogo );
document.getElementById('btn_freeze').addEventListener( 'click', () => audioMotion.toggleAnalyzer() );

document.getElementById('fft').addEventListener( 'change', e => audioMotion.fftSize = e.target.value );
document.getElementById('mode').addEventListener( 'change', e => {
	audioMotion.mode = e.target.value;
	document.getElementById('area_options').disabled = ( audioMotion.mode != 10 );
});
document.getElementById('gradient').addEventListener( 'change', e => audioMotion.gradient = e.target.value );
document.getElementById('range').addEventListener( 'change', e => {
	let selected = e.target[ e.target.selectedIndex ];
	audioMotion.setFreqRange( selected.dataset.min, selected.dataset.max );
});
document.getElementById('smoothing').addEventListener( 'change', e => audioMotion.smoothing = e.target.value );
document.getElementById('line_width').addEventListener( 'change', e => audioMotion.lineWidth = e.target.value );
document.getElementById('fill_alpha').addEventListener( 'change', e => audioMotion.fillAlpha = e.target.value );
document.getElementById('sensitivity').addEventListener( 'change', e => {
	switch ( e.target.value ) {
		case '0':
			audioMotion.setSensitivity( -70, -10 );
			break;
		case '1':
			audioMotion.setSensitivity( -80, -20 );
			break;
		case '2':
			audioMotion.setSensitivity( -85, -25 );
			break;
		case '3':
			audioMotion.setSensitivity( -90, -30 );
			break;
		case '4':
			audioMotion.setSensitivity( -100, -40 );
			break;
	}
});

// value divs for range input elements
document.querySelectorAll('input[type="range"]').forEach( el => el.addEventListener( 'change', () => updateRangeElement( el ) ) );

document.querySelectorAll('.tones').forEach( el =>
	el.addEventListener( 'click', e => {
		oscillator.type = e.target.dataset.wave;
		oscillator.frequency.setValueAtTime( e.target.dataset.freq, audioCtx.currentTime );
		gainNode.gain.setValueAtTime( .2, audioCtx.currentTime );
	})
);

document.getElementById('btn_soundoff').addEventListener( 'click', () => gainNode.gain.setValueAtTime( 0, audioCtx.currentTime ) );

document.getElementById('uploadFile').addEventListener( 'change', e => loadSong( e.target ) );
document.getElementById('loadFromURL').addEventListener( 'click', () => {
	audioEl.src = document.getElementById('remoteURL').value;
	audioEl.play();
});

// initialize UI elements
updateUI();

// Resume audio context if in suspended state (browsers' autoplay policy)

window.addEventListener( 'click', () => {
	if ( audioMotion.audioCtx.state == 'suspended' )
		audioMotion.audioCtx.resume();
});

// The callback function is used here to draw the pulsating logo on the canvas

function displayCanvasMsg() {
	if ( ! showLogo )
		return;

	var size = 20 * audioMotion.pixelRatio;
	if ( audioMotion.isFullscreen )
		size *= 2;

	// find the data array index for 140Hz
	var idx = Math.round( 140 * audioMotion.analyzer.fftSize / audioMotion.audioCtx.sampleRate );

	// use the 140Hz amplitude to increase the font size and make the logo pulse to the beat
	audioMotion.canvasCtx.font = `${size + audioMotion.dataArray[ idx ] / 16 * audioMotion.pixelRatio}px Orbitron,sans-serif`;

	audioMotion.canvasCtx.fillStyle = '#fff8';
	audioMotion.canvasCtx.textAlign = 'center';
	audioMotion.canvasCtx.fillText( 'audioMotion', audioMotion.canvas.width - size * 8, size * 2 );
}

// Load song from user's computer

function loadSong( el ) {
	var reader = new FileReader();

	reader.readAsDataURL( el.files[0] );
	reader.onload = () => {
		audioEl.src = reader.result;
		audioEl.play();
	};
}

// Update value div of range input elements

function updateRangeElement( el ) {
	let s = el.nextElementSibling;
	if ( s && s.className == 'value' )
		s.innerText = el.value;
}

// Update UI elements to reflect the analyzer's current settings

function updateUI() {
	document.getElementById('fft').value = audioMotion.fftSize;
	document.getElementById('mode').value = audioMotion.mode;
	document.getElementById('gradient').value = audioMotion.gradient;
	document.getElementById('smoothing').value = audioMotion.smoothing;

	document.getElementById('area_options').disabled = ( audioMotion.mode != 10 );
	document.getElementById('line_width').value = audioMotion.lineWidth;
	document.getElementById('fill_alpha').value = audioMotion.fillAlpha;

	switch ( audioMotion.minFreq ) {
		case 20:
			document.getElementById('range').selectedIndex = 0;
			break;
		case 30:
			document.getElementById('range').selectedIndex = 1;
			break;
		case 100:
			document.getElementById('range').selectedIndex = 2;
	}

	switch ( audioMotion.maxDecibels ) {
		case -10:
			document.getElementById('sensitivity').value = 0;
			break;
		case -20:
			document.getElementById('sensitivity').value = 1;
			break;
		case -25:
			document.getElementById('sensitivity').value = 2;
			break;
		case -30:
			document.getElementById('sensitivity').value = 3;
			break;
		case -40:
			document.getElementById('sensitivity').value = 4;
	}

	document.querySelectorAll('input[type="range"]').forEach( el => updateRangeElement( el ) );
}

// Log canvas size changes to the JavaScript console

function logCanvasResize( reason, instance ) {
	console.log( `[${reason}] set: ${instance.width} x ${instance.height} | actual: ${instance.canvas.width} x ${instance.canvas.height}` );
}