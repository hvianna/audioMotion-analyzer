/**
 * audioMotion-analyzer multi-instance demo
 *
 * https://github.com/hvianna/audioMotion-analyzer
 */

import {
	AudioMotionAnalyzer,
	ALPHABARS_FULL,
	BANDS_FFT,
	BANDS_OCTAVE_FULL,
	BANDS_OCTAVE_HALF,
	BANDS_OCTAVE_3RD,
	BANDS_OCTAVE_4TH,
	BANDS_OCTAVE_6TH,
	BANDS_OCTAVE_8TH,
	BANDS_OCTAVE_12TH,
	BANDS_OCTAVE_24TH,
	FILTER_D,
	FILTER_TILT3,
	LABELS_X_OFF,
	LABELS_Y_DB,
	LEDS_MODERN,
	LAYOUT_COMBINED,
	MODE_BARS,
	MODE_GRAPH,
	PEAKS_DROP,
	PEAKS_OFF
} from '../src/audioMotion-analyzer.js';

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
					updateUI( el => audioMotion[ el.dataset.setting == 'volume' ? 0 : selectedAnalyzer ] );
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
	mode: MODE_BARS,
	bandResolution: BANDS_OCTAVE_3RD,
	barSpace: .3,
	ledBars: LEDS_MODERN,
	linearAmplitude: true,
	linearBoost: 1.8,
	maxFreq: 20000,
	minFreq: 30,
	showScaleY: LABELS_Y_DB,
	weightingFilter: FILTER_TILT3
});

audioMotion[0].setLeds( 6, 5 ); // thinner leds look better in a small canvas :)

// top right
audioMotion[1].setOptions({
	mode: MODE_GRAPH,
	bandResolution: BANDS_FFT,
	channelLayout: LAYOUT_COMBINED,
	fillAlpha: .3,
	linearAmplitude: true,
	linearBoost: 1.2,
	lineWidth: 0,
	maxFreq: 16000,
	minFreq: 30,
	peakLine: true,
	showScaleX: LABELS_X_OFF,
	showPeaks: PEAKS_DROP,
	weightingFilter: FILTER_D
});

audioMotion[1].setTheme( [ 'steelblue', 'orangered' ] );

// bottom right
audioMotion[2].setOptions({
	mode: MODE_BARS,
	alphaBars: ALPHABARS_FULL,
	bandResolution: BANDS_OCTAVE_12TH,
	barSpace: .1,
	minDecibels: -60,
	maxDecibels: -30,
	maxFreq: 16000,
	minFreq: 30,
	showPeaks: PEAKS_OFF,
	showScaleX: LABELS_X_OFF,
	weightingFilter: FILTER_D
});

audioMotion[2].setTheme('rainbow');

// Returns active instance - note: volume is always set/read from the first instance
const getInstance = el => audioMotion[ el && el.dataset.setting == 'volume' ? 0 : selectedAnalyzer ];

// Analyzer selector

const highlightSelectedAnalyzer = () => document.querySelectorAll('canvas').forEach( el => el.classList.toggle( 'selected', el.parentElement.id.slice(-1) == selectedAnalyzer ) );

document.querySelectorAll('[name="analyzer"]').forEach( el => {
	el.addEventListener( 'click', () => {
		selectedAnalyzer = document.querySelector('[name="analyzer"]:checked').value;
		updateUI( getInstance );
		highlightSelectedAnalyzer();
	});
});

document.querySelectorAll('canvas').forEach( el => {
	el.addEventListener( 'click', () => {
		selectedAnalyzer = el.parentElement.id.slice(-1);
		document.querySelector(`[name="analyzer"][value="${selectedAnalyzer}"`).checked = true;
		updateUI( getInstance );
		highlightSelectedAnalyzer();
	});
});

// set event listeners for UI controls
addUIEventListeners( getInstance );
populateThemeSelections( audioMotion[0] );

// File upload
document.getElementById('uploadFile').addEventListener( 'change', e => loadSong( e.target ) );

// getOptions() button
document.getElementById('btn_getOptions').addEventListener( 'click', () => {
	const options = audioMotion[ selectedAnalyzer ].getOptions(['width','height','useCanvas']); // ignore some options
	console.log( 'getOptions(): ', options );
	navigator.clipboard.writeText( JSON.stringify( options, null, 2 ) )
		.then( () => console.log( 'Options object copied to clipboard.' ) );
});

// Initialize UI elements
updateUI( getInstance );
highlightSelectedAnalyzer();
