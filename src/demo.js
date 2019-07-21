import * as audioMotion from '../dist/audioMotion-analyzer.js';

var audioEl = document.getElementById('audio'),
	showLogo = true;

// Create audioMotion analyzer

try {
	audioMotion.create(
		document.getElementById('container'),
		{
			mode: 4, // 1/6th-octave bands
			source: audioEl, // main source is the HTML audio element
			minFreq: 30,
			maxFreq: 16000,
			showFPS: true,
			onCanvasDraw: displayCanvasMsg // custom callback function (see below)
		}
	);
}
catch( err ) {
	document.getElementById('container').innerHTML = `<p>audioMotion failed with error: <em>${err}</em></p>`;
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
document.getElementById('btn_bgcolor').addEventListener( 'click', () => audioMotion.toggleBgColor() );
document.getElementById('btn_peaks').addEventListener( 'click', () => audioMotion.togglePeaks() );
document.getElementById('btn_leds').addEventListener( 'click', () => audioMotion.toggleLeds() );
document.getElementById('btn_scale').addEventListener( 'click', () => audioMotion.toggleScale() );
document.getElementById('btn_lores').addEventListener( 'click', () => audioMotion.toggleLoRes() );
document.getElementById('btn_fps').addEventListener( 'click', () => audioMotion.toggleFPS() );
document.getElementById('btn_logo').addEventListener( 'click', () => showLogo = ! showLogo );
document.getElementById('btn_freeze').addEventListener( 'click', () => audioMotion.toggleAnalyzer() );

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

document.getElementById('mode').addEventListener( 'change', e => audioMotion.setMode( e.target.value ) );
document.getElementById('gradient').addEventListener( 'change', e => audioMotion.setGradient( e.target.value ) );
document.getElementById('range').addEventListener( 'change', e => {
	let selected = e.target[ e.target.selectedIndex ];
	audioMotion.setFreqRange( selected.dataset.min, selected.dataset.max );
});

document.querySelectorAll('.tones').forEach( el =>
	el.addEventListener( 'click', e => {
		oscillator.type = e.target.dataset.wave;
		oscillator.frequency.setValueAtTime( e.target.dataset.freq, audioCtx.currentTime );
		gainNode.gain.setValueAtTime( .2, audioCtx.currentTime );
	})
);

document.getElementById('btn_soundoff').addEventListener( 'click', () => gainNode.gain.setValueAtTime( 0, audioCtx.currentTime ) );

document.getElementById('uploadFile').addEventListener( 'change', e => loadSong( e.target ) );

// Resume audio context if in suspended state (autoplay policy)

window.addEventListener( 'click', () => {
	if ( audioMotion.audioCtx.state == 'suspended' )
		audioMotion.audioCtx.resume();
});

// Callback function to add custom content to the canvas

function displayCanvasMsg( canvas, canvasCtx, pixelRatio ) {
	if ( ! showLogo )
		return;
	var size = 20 * pixelRatio;
	if ( audioMotion.isFullscreen() )
		size *= 2;
	canvasCtx.font = `${size}px Orbitron,sans-serif`;
	var w = canvasCtx.measureText('audioMotion').width / 2;

	canvasCtx.font = `${size + audioMotion.dataArray[ 1 ] / 16 * pixelRatio}px Orbitron,sans-serif`;
	canvasCtx.fillStyle = '#fff8';
	canvasCtx.textAlign = 'center';
	canvasCtx.fillText( 'audioMotion', canvas.width - w - size * 4, size * 2 );
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
