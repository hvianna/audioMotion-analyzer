/**
 * audioMotion-analyzer multi-instance demo
 *
 * https://github.com/hvianna/audioMotion-analyzer
 */

import AudioMotionAnalyzer from '../dist/audioMotion-analyzer.js';

var audioEl = document.getElementById('audio'),
	audioMotion = [],
	selectedAnalyzer = 0;

// Create three audioMotion-analyzer instances and connect them to the audio element

try {
	for ( let i = 0; i < 3; i++ ) {
		audioMotion[ i ] = new AudioMotionAnalyzer(
			document.getElementById( `container${i}` ),
			{
				source: audioEl,
				onCanvasDraw: displayCanvasMsg
			}
		);
	}
}
catch( err ) {
	document.getElementById('container0').innerHTML = `<p>audioMotion-analyzer failed with error: <em>${err}</em></p>`;
}

// Set options for each instance

audioMotion[0].setOptions({
	mode: 3,
	showLeds: true,
	showFPS: true,
	width: 640,
	height: 270
});
// we add a custom property to the object, so we can save the logo display preference for each analyzer
audioMotion[0].showLogo = true;

audioMotion[1].setOptions({
	mode: 10,
	fftSize: 4096,
	gradient: 'rainbow',
	minFreq: 30,
	maxFreq: 16000,
	showScale: false,
	showPeaks: false,
	width: 320,
	height: 145
});
audioMotion[1].showLogo = false;

audioMotion[2].setOptions({
	mode: 7,
	fftSize: 2048,
	gradient: 'prism',
	minFreq: 30,
	maxFreq: 16000,
	showScale: false,
	showPeaks: false,
	smoothing: .8,
	minDecibels: -90,
	maxDecibels: -30,
	width: 320,
	height: 145
});
audioMotion[2].showLogo = false;

updateUI();

// Analyzer selector

document.querySelectorAll('[name="analyzer"]').forEach( el => {
	el.addEventListener( 'click', () => {
		selectedAnalyzer = document.querySelector('[name="analyzer"]:checked').value;
		updateUI();
	});
});

// user can also select an analyzer by clicking on its canvas
document.querySelectorAll('canvas').forEach( el => {
	el.addEventListener( 'click', () => {
		selectedAnalyzer = el.parentNode.id.slice(-1);
		document.querySelector(`[name="analyzer"][value="${selectedAnalyzer}"`).checked = true;
		updateUI();
	});
});

// Event listeners for UI controls

document.getElementById('btn_fullscr').addEventListener( 'click', () => audioMotion[ selectedAnalyzer ].toggleFullscreen() );
document.getElementById('btn_bgcolor').addEventListener( 'click', () => audioMotion[ selectedAnalyzer ].showBgColor = ! audioMotion[ selectedAnalyzer ].showBgColor );
document.getElementById('btn_peaks').addEventListener( 'click', () => audioMotion[ selectedAnalyzer ].showPeaks = ! audioMotion[ selectedAnalyzer ].showPeaks );
document.getElementById('btn_leds').addEventListener( 'click', () => audioMotion[ selectedAnalyzer ].showLeds = ! audioMotion[ selectedAnalyzer ].showLeds );
document.getElementById('btn_scale').addEventListener( 'click', () => audioMotion[ selectedAnalyzer ].showScale = ! audioMotion[ selectedAnalyzer ].showScale );
document.getElementById('btn_lores').addEventListener( 'click', () => audioMotion[ selectedAnalyzer ].loRes = ! audioMotion[ selectedAnalyzer ].loRes );
document.getElementById('btn_fps').addEventListener( 'click', () => audioMotion[ selectedAnalyzer ].showFPS = ! audioMotion[ selectedAnalyzer ].showFPS );
document.getElementById('btn_logo').addEventListener( 'click', () => audioMotion[ selectedAnalyzer ].showLogo = ! audioMotion[ selectedAnalyzer ].showLogo );
document.getElementById('btn_freeze').addEventListener( 'click', () => audioMotion[ selectedAnalyzer ].toggleAnalyzer() );

document.getElementById('fft').addEventListener( 'change', e => audioMotion[ selectedAnalyzer ].fftSize = e.target.value );
document.getElementById('mode').addEventListener( 'change', e => audioMotion[ selectedAnalyzer ].mode = e.target.value );
document.getElementById('gradient').addEventListener( 'change', e => audioMotion[ selectedAnalyzer ].gradient = e.target.value );
document.getElementById('range').addEventListener( 'change', e => {
	let selected = e.target[ e.target.selectedIndex ];
	audioMotion[ selectedAnalyzer ].setFreqRange( selected.dataset.min, selected.dataset.max );
});
document.getElementById('smoothing').addEventListener( 'change', e => audioMotion[ selectedAnalyzer ].smoothing = e.target.value );
document.getElementById('sensitivity').addEventListener( 'change', e => {
	switch ( e.target.value ) {
		case '0':
			audioMotion[ selectedAnalyzer ].setSensitivity( -70, -10 );
			break;
		case '1':
			audioMotion[ selectedAnalyzer ].setSensitivity( -80, -20 );
			break;
		case '2':
			audioMotion[ selectedAnalyzer ].setSensitivity( -85, -25 );
			break;
		case '3':
			audioMotion[ selectedAnalyzer ].setSensitivity( -90, -30 );
			break;
		case '4':
			audioMotion[ selectedAnalyzer ].setSensitivity( -100, -40 );
			break;
	}
});

document.getElementById('uploadFile').addEventListener( 'change', e => loadSong( e.target ) );
document.getElementById('loadFromURL').addEventListener( 'click', () => {
	audioEl.src = document.getElementById('remoteURL').value;
	audioEl.play();
});

// Resume audio context if in suspended state (browsers' autoplay policy)

window.addEventListener( 'click', () => {
	if ( audioMotion[0].audioCtx.state == 'suspended' )
		audioMotion[0].audioCtx.resume();
});

// The callback function is used here to draw the pulsating logo on the canvas

function displayCanvasMsg( instance ) {
	if ( ! instance.showLogo )
		return;

	var size = 20 * instance.pixelRatio;
	if ( instance.isFullscreen )
		size *= 2;

	// find the data array index for 140Hz
	var idx = Math.round( 140 * instance.analyzer.fftSize / instance.audioCtx.sampleRate );

	// use the 140Hz amplitude to increase the font size and make the logo pulse to the beat
	instance.canvasCtx.font = `${size + instance.dataArray[ idx ] / 16 * instance.pixelRatio}px Orbitron,sans-serif`;

	instance.canvasCtx.fillStyle = '#fff8';
	instance.canvasCtx.textAlign = 'center';
	instance.canvasCtx.fillText( 'audioMotion', instance.canvas.width - size * 8, size * 2 );
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

// Update UI elements to reflect the selected analyzer's current settings

function updateUI() {
	document.querySelectorAll('canvas').forEach( el => el.classList.remove('selected') );
	document.querySelector(`#container${selectedAnalyzer} canvas`).classList.add('selected');

	document.getElementById('fft').value = audioMotion[ selectedAnalyzer ].fftSize;
	document.getElementById('mode').value = audioMotion[ selectedAnalyzer ].mode;
	document.getElementById('gradient').value = audioMotion[ selectedAnalyzer ].gradient;
	document.getElementById('smoothing').value = audioMotion[ selectedAnalyzer ].smoothing;

	switch ( audioMotion[ selectedAnalyzer ].minFreq ) {
		case 20:
			document.getElementById('range').selectedIndex = 1;
			break;
		case 30:
			document.getElementById('range').selectedIndex = 2;
			break;
		case 100:
			document.getElementById('range').selectedIndex = 3;
	}

	switch ( audioMotion[ selectedAnalyzer ].maxDecibels ) {
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
}
