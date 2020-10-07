/**
 * audioMotion-analyzer multi-instance demo
 *
 * https://github.com/hvianna/audioMotion-analyzer
 */

import AudioMotionAnalyzer from '../src/audioMotion-analyzer.js';

const mindB = [ -70, -80, -85, -90, -100 ], // for sensitivity presets
	  maxdB = [ -10, -20, -25, -30, -40 ],
	  audioEl = document.getElementById('audio');

var audioMotion = [],
	selectedAnalyzer = 0,
	audioCtx,
	audioSource;

// Create three audioMotion-analyzer instances and connect them to the audio element

try {
	// create the audio context that will be shared by all instances
	const AudioContext = window.AudioContext || window.webkitAudioContext;
	audioCtx = new AudioContext();

	for ( let i = 0; i < 3; i++ ) {
		audioMotion[ i ] = new AudioMotionAnalyzer(
			document.getElementById( `container${i}` ),
			{
				audioCtx,
				onCanvasResize: ( reason, instance ) => {
					console.log( `[${instance.canvas.parentElement.id.slice(-1)}] ${reason}: ${instance.canvas.width} x ${instance.canvas.height}` );
					if ( reason != 'create' )
						updateUI();
				}
			}
		);

		// after creating the first instance, we connect the audio element to it and get the audioSource reference
		if ( i == 0 )
			audioSource = audioMotion[0].connectAudio( audioEl );
		// we then connect the audioSource to the other instances' analyzers
		else
			audioSource.connect( audioMotion[ i ].analyzer );
	}
}
catch( err ) {
	document.getElementById('container0').innerHTML = `<p>audioMotion-analyzer failed with error: <em>${err}</em></p>`;
}

// Display package version in the footer
document.getElementById('version').innerText = audioMotion[0].version;

// Set options for each instance

audioMotion[0].setOptions({
	mode: 3,
	showLeds: true,
	showScaleY: true,
	barSpace: 0.5,
	width: 640,
	height: 270
});

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
		selectedAnalyzer = el.parentElement.id.slice(-1);
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
	el.addEventListener( 'change', () => audioMotion[ selectedAnalyzer ][ el.dataset.setting ] = el.value );
});

document.getElementById('range').addEventListener( 'change', e => {
	const selected = e.target[ e.target.selectedIndex ];
	audioMotion[ selectedAnalyzer ].setFreqRange( selected.dataset.min, selected.dataset.max );
});

document.getElementById('sensitivity').addEventListener( 'change', e => audioMotion[ selectedAnalyzer ].setSensitivity( mindB[ e.target.value ], maxdB[ e.target.value ] ) );

// Display value of ranged input elements
document.querySelectorAll('input[type="range"]').forEach( el => el.addEventListener( 'change', () => updateRangeElement( el ) ) );

// File upload
document.getElementById('uploadFile').addEventListener( 'change', e => loadSong( e.target ) );

// Initialize UI elements
updateUI();

// Resume audio context if in suspended state (browsers' autoplay policy)
window.addEventListener( 'click', () => {
	if ( audioMotion[0].audioCtx.state == 'suspended' )
		audioMotion[0].audioCtx.resume();
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

// Update UI elements to reflect the selected analyzer's current settings
function updateUI() {
	document.querySelectorAll('canvas').forEach( el => el.classList.toggle( 'selected', el.parentElement.id.slice(-1) == selectedAnalyzer ) );

	document.querySelectorAll('[data-setting]').forEach( el => el.value = audioMotion[ selectedAnalyzer ][ el.dataset.setting ] );

	document.getElementById('range').selectedIndex = [20,30,100].indexOf( audioMotion[ selectedAnalyzer ].minFreq );
	document.getElementById('sensitivity').value = maxdB.indexOf( audioMotion[ selectedAnalyzer ].maxDecibels );

	document.querySelectorAll('input[type="range"]').forEach( el => updateRangeElement( el ) );
	document.querySelectorAll('button[data-prop]').forEach( el => {
		const p = audioMotion[ selectedAnalyzer ][ el.dataset.prop ];
		el.classList.toggle( 'active', el.dataset.prop == 'isOn' ? ! p : p );
	});
}
