/**
 * audioMotion-analyzer multi-instance demo
 *
 * https://github.com/hvianna/audioMotion-analyzer
 */

import AudioMotionAnalyzer from '../dist/audioMotion-analyzer.js';

// for the demo's sensitivity presets
const mindB = [ -70, -80, -85, -90, -100 ],
	  maxdB = [ -10, -20, -25, -30, -40 ];

const audioEl = document.getElementById('audio');

var audioMotion = [],
	selectedAnalyzer = 0,
	audioCtx,
	audioSource;

// Create three audioMotion-analyzer instances and connect them to the audio element

try {
	// create the audio context that will be shared by all instances
	let AudioContext = window.AudioContext || window.webkitAudioContext;
	audioCtx = new AudioContext();

	for ( let i = 0; i < 3; i++ ) {
		audioMotion[ i ] = new AudioMotionAnalyzer(
			document.getElementById( `container${i}` ),
			{
				audioCtx,
				onCanvasDraw: displayCanvasMsg,
				onCanvasResize: ( reason, instance ) => { if ( reason == 'fschange' ) updateUI(); }
			}
		);

		// after creating the first instance, we connect the audio element and get the audioSource reference
		// we then connect the audioSource to the other instances' analyzers
		if ( i == 0 )
			audioSource = audioMotion[0].connectAudio( audioEl );
		else
			audioSource.connect( audioMotion[ i ].analyzer );
	}
}
catch( err ) {
	document.getElementById('container0').innerHTML = `<p>audioMotion-analyzer failed with error: <em>${err}</em></p>`;
}

// display package version in the footer
document.getElementById('version').innerText = audioMotion[0].version;

// Set options for each instance
// a custom property 'showLogo' is added to each instance, to store the logo display preference

audioMotion[0].setOptions({
	mode: 3,
	showLeds: true,
	showFPS: true,
	barSpace: 0.5,
	width: 640,
	height: 270
});
audioMotion[0].showLogo = true;

audioMotion[1].setOptions({
	mode: 10,
	gradient: 'rainbow',
	minFreq: 30,
	maxFreq: 16000,
	showScale: false,
	showPeaks: false,
	lineWidth: 2,
	fillAlpha: .3,
	width: 320,
	height: 145
});
audioMotion[1].showLogo = false;

audioMotion[2].setOptions({
	mode: 2,
	gradient: 'prism',
	minFreq: 30,
	maxFreq: 16000,
	showBgColor: false,
	showScale: false,
	showPeaks: false,
	lumiBars: true,
	minDecibels: -80,
	maxDecibels: -20,
	width: 320,
	height: 145
});
audioMotion[2].showLogo = false;

// Analyzer selector

document.querySelectorAll('[name="analyzer"]').forEach( el => {
	el.addEventListener( 'click', () => {
		selectedAnalyzer = document.querySelector('[name="analyzer"]:checked').value;
		updateUI();
	});
});

// user can also select an analyzer by clicking on it
document.querySelectorAll('canvas').forEach( el => {
	el.addEventListener( 'click', () => {
		selectedAnalyzer = el.parentNode.id.slice(-1);
		document.querySelector(`[name="analyzer"][value="${selectedAnalyzer}"`).checked = true;
		updateUI();
	});
});

// Event listeners for UI controls

document.querySelectorAll('button[data-prop]').forEach( el => {
	el.addEventListener( 'click', () => {
		if ( el.dataset.func )
			audioMotion[ selectedAnalyzer ][ el.dataset.func ]();
		else
			audioMotion[ selectedAnalyzer ][ el.dataset.prop ] = ! audioMotion[ selectedAnalyzer ][ el.dataset.prop ];
		el.classList.toggle( 'active' );
	});
});

document.querySelectorAll('[data-setting]').forEach( el => {
	el.addEventListener( 'change', () => {
		audioMotion[ selectedAnalyzer ][ el.dataset.setting ] = el.value;
		if ( el.dataset.setting == 'mode' ) {
			document.getElementById('area_options').disabled = ( audioMotion[ selectedAnalyzer ].mode != 10 );
			document.getElementById('bar_options').disabled = ( audioMotion[ selectedAnalyzer ].mode == 0 || audioMotion[ selectedAnalyzer ].mode == 10 );
		}
	});
});

document.getElementById('range').addEventListener( 'change', e => {
	let selected = e.target[ e.target.selectedIndex ];
	audioMotion[ selectedAnalyzer ].setFreqRange( selected.dataset.min, selected.dataset.max );
});

document.getElementById('sensitivity').addEventListener( 'change', e => audioMotion[ selectedAnalyzer ].setSensitivity( mindB[ e.target.value ], maxdB[ e.target.value ] ) );

// Display value of ranged input elements
document.querySelectorAll('input[type="range"]').forEach( el => el.addEventListener( 'change', () => updateRangeElement( el ) ) );

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
	if ( audioMotion[0].audioCtx.state == 'suspended' )
		audioMotion[0].audioCtx.resume();
});

// The callback function is used here to draw the pulsating logo on the canvas

function displayCanvasMsg( instance ) {
	if ( ! instance.showLogo )
		return;

	let size = 20 * instance.pixelRatio;
	if ( instance.isFullscreen )
		size *= 2;

	// find the data array index for 140Hz
	let idx = Math.round( 140 * instance.analyzer.fftSize / instance.audioCtx.sampleRate );

	// use the 140Hz amplitude to increase the font size and make the logo pulse to the beat
	instance.canvasCtx.font = `${size + instance.dataArray[ idx ] / 16 * instance.pixelRatio}px Orbitron,sans-serif`;

	instance.canvasCtx.fillStyle = '#fff8';
	instance.canvasCtx.textAlign = 'center';
	instance.canvasCtx.fillText( 'audioMotion', instance.canvas.width - size * 8, size * 2 );
}

// Load song from user's computer

function loadSong( el ) {
	let reader = new FileReader();

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

// Update UI elements to reflect the selected analyzer's current settings

function updateUI() {
	document.querySelectorAll('canvas').forEach( el => el.classList.toggle( 'selected', el.parentNode.id.slice(-1) == selectedAnalyzer ) );

	document.querySelectorAll('[data-setting]').forEach( el => el.value = audioMotion[ selectedAnalyzer ][ el.dataset.setting ] );

	document.getElementById('area_options').disabled = ( audioMotion[ selectedAnalyzer ].mode != 10 );
	document.getElementById('bar_options').disabled = ( audioMotion[ selectedAnalyzer ].mode == 0 || audioMotion[ selectedAnalyzer ].mode == 10 );

	document.getElementById('range').selectedIndex = [20,30,100].indexOf( audioMotion[ selectedAnalyzer ].minFreq );
	document.getElementById('sensitivity').value = maxdB.indexOf( audioMotion[ selectedAnalyzer ].maxDecibels );

	document.querySelectorAll('input[type="range"]').forEach( el => updateRangeElement( el ) );
	document.querySelectorAll('button[data-prop]').forEach( el => {
		let p = audioMotion[ selectedAnalyzer ][ el.dataset.prop ];
		el.classList.toggle( 'active', el.dataset.prop == 'isOn' ? ! p : p );
	});
}
