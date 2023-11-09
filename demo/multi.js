/**
 * audioMotion-analyzer multi-instance demo
 *
 * https://github.com/hvianna/audioMotion-analyzer
 */

import AudioMotionAnalyzer from '../src/audioMotion-analyzer.js';

let audioMotion = [],
	selectedAnalyzer = 0;

// Creating three audioMotion-analyzer instances that share the same input:
//
// A media element (<audio> or <video> tag) can only be connected to a single AudioNode, but the node
// itself can be connected to multiple other nodes.
//
// In the loop below, the first instance of audioMotion-analyzer takes the <audio> element as source,
// creating an audio node which is stored in connectedSources[0].
// The 2nd and 3rd instances will then take the created audio node as source.
//
// Only the first instance is connected to the speakers, to avoid unintended output amplification.

try {
	for ( let i = 0; i < 3; i++ ) {
		const isFirst = ( i == 0 );

		audioMotion[ i ] = new AudioMotionAnalyzer(	document.getElementById( `container${i}` ), {
			source: isFirst ? document.getElementById('audio') : audioMotion[0].connectedSources[0],
			connectSpeakers: isFirst,
			height: isFirst ? 340 : 160,

			onCanvasResize: ( reason, instance ) => {
				const instNo = instance.canvas.parentElement.id.slice(-1); // get instance number from container id
				console.log( `[#${instNo}] ${reason}: ${instance.canvas.width} x ${instance.canvas.height}` );
				if ( reason != 'create' )
					updateUI();
			}
		});
	}
}
catch( err ) {
	document.getElementById('container0').innerHTML = `<p>audioMotion-analyzer failed with error: ${ err.code ? '<strong>' + err.code + '</strong>' : '' } <em>${ err.code ? err.message : err }</em></p>`;
}

// Display package version at the footer
document.getElementById('version').innerText = AudioMotionAnalyzer.version;

// Set options for each instance

// main analyzer
audioMotion[0].setOptions({
	mode: 6,
	barSpace: .4,
	frequencyScale: 'bark',
	ledBars: true,
	linearAmplitude: true,
	linearBoost: 1.6,
	maxFreq: 20000,
	minFreq: 30,
	reflexRatio: .1,
	reflexAlpha: .25,
	weightingFilter: 'D'
});

// top right
audioMotion[1].setOptions({
	mode: 10,
	channelLayout: 'dual-combined',
	fillAlpha: .3,
	gradientLeft: 'steelblue',
	gradientRight: 'orangered',
	linearAmplitude: true,
	linearBoost: 1.2,
	lineWidth: 0,
	maxFreq: 16000,
	minFreq: 30,
	peakLine: true,
	showScaleX: false,
	showPeaks: true,
	weightingFilter: 'D'
});

// bottom right
audioMotion[2].setOptions({
	mode: 2,
	barSpace: .1,
	gradient: 'prism',
	lumiBars: true,
	minDecibels: -60,
	maxDecibels: -30,
	maxFreq: 16000,
	minFreq: 30,
	showBgColor: false,
	showPeaks: false,
	showScaleX: false,
	weightingFilter: 'D'
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
		el.classList.toggle( 'active', audioMotion[ selectedAnalyzer ][ el.dataset.prop ] );
	});
});

document.querySelectorAll('[data-setting]').forEach( el => {
	el.addEventListener( 'change', () => audioMotion[ selectedAnalyzer ][ el.dataset.setting ] = el.value );
});

// Display value of ranged input elements
document.querySelectorAll('input[type="range"]').forEach( el => el.addEventListener( 'change', () => updateRangeElement( el ) ) );

// File upload
document.getElementById('uploadFile').addEventListener( 'change', e => loadSong( e.target ) );

// Initialize UI elements
updateUI();

// Load song from user's computer
function loadSong( el ) {
	const fileBlob = el.files[0],
		  audioEl  = document.getElementById('audio');

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

	document.querySelectorAll('input[type="range"]').forEach( el => updateRangeElement( el ) );
	document.querySelectorAll('button[data-prop]').forEach( el => el.classList.toggle( 'active', audioMotion[ selectedAnalyzer ][ el.dataset.prop ] ) );
}
