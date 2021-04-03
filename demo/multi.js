/**
 * audioMotion-analyzer multi-instance demo
 *
 * https://github.com/hvianna/audioMotion-analyzer
 */

import AudioMotionAnalyzer from '../src/audioMotion-analyzer.js';

const mindB = [ -70, -80, -85, -90, -100 ], // for sensitivity presets
	  maxdB = [ -10, -20, -25, -30, -40 ];

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
	document.getElementById('container0').innerHTML = `<p>audioMotion-analyzer failed with error: <em>${err}</em></p>`;
}

// Display package version at the footer
document.getElementById('version').innerText = AudioMotionAnalyzer.version;

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
	showScaleX: false,
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
	showScaleX: false,
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
		el.classList.toggle( 'active', audioMotion[ selectedAnalyzer ][ el.dataset.prop ] );
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

	document.getElementById('range').selectedIndex = [20,30,100].indexOf( audioMotion[ selectedAnalyzer ].minFreq );
	document.getElementById('sensitivity').value = maxdB.indexOf( audioMotion[ selectedAnalyzer ].maxDecibels );

	document.querySelectorAll('input[type="range"]').forEach( el => updateRangeElement( el ) );
	document.querySelectorAll('button[data-prop]').forEach( el => el.classList.toggle( 'active', audioMotion[ selectedAnalyzer ][ el.dataset.prop ] ) );
}
