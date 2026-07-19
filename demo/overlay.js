/**
 * audioMotion-analyzer Video overlay demo
 *
 * https://github.com/hvianna/audioMotion-analyzer
 */

import {
	AudioMotionAnalyzer,
	ALPHABARS_FULL,
	ALPHABARS_OFF,
	BANDS_FFT,
	BANDS_OCTAVE_FULL,
	BANDS_OCTAVE_HALF,
	BANDS_OCTAVE_3RD,
	BANDS_OCTAVE_4TH,
	BANDS_OCTAVE_6TH,
	BANDS_OCTAVE_8TH,
	BANDS_OCTAVE_12TH,
	BANDS_OCTAVE_24TH,
	COLORMODE_GRADIENT,
	COLORMODE_LEVEL,
	FILTER_D,
	FILTER_TILT3,
	LEDS_MODERN,
	LEDS_OFF,
	MODE_BARS,
	MODE_GRAPH,
	PEAKS_DROP,
	PEAKS_OFF,
	RADIAL_INWARD,
	RADIAL_OFF
} from '../src/audioMotion-analyzer.js';

import {
	addUIEventListeners,
	loadSong,
	populateControls,
	populateThemeSelections,
	setPresets,
	updateUI
} from './functions.js';

const videoEl = document.getElementById('video'),
	  container = document.getElementById('container'),
	  presetSelection = document.getElementById('presets');

// Visualization presets
const presets = [
	{
		name: 'Defaults',
		options: null,
		theme: null
	},
	{
		name: 'Classic LEDs',
		options: {
			mode: MODE_BARS,
			alphaBars: ALPHABARS_OFF,
			bandResolution: BANDS_OCTAVE_3RD,
			barSpace: .25,
			colorMode: COLORMODE_GRADIENT,
			ledBars: LEDS_MODERN,
			maxFreq: 16000,
			radial: RADIAL_OFF,
			reflexRatio: 0,
			showLedMask: true,
			showPeaks: PEAKS_DROP,
			weightingFilter: FILTER_TILT3
		},
		theme: 'classic'
	},
	{
		name: 'Mirror wave',
		options: {
			mode: MODE_GRAPH,
			alphaBars: ALPHABARS_OFF,
			bandResolution: BANDS_FFT,
			fillAlpha: .6,
			lineWidth: 2,
			maxFreq: 16000,
			radial: RADIAL_OFF,
			reflexAlpha: 1,
			reflexBright: 1,
			reflexRatio: .5,
			showPeaks: PEAKS_OFF
		},
		theme: { name: 'rainbow', modifiers: { horizontal: true } }
	},
	{
		name: 'Radial inverse',
		options: {
			mode: MODE_BARS,
			bandResolution: BANDS_OCTAVE_8TH,
			barSpace: .25,
			fillAlpha: .5,
			ledBars: LEDS_OFF,
			linearAmplitude: true,
			linearBoost: 1.8,
			lineWidth: 1.5,
			maxDecibels: -30,
			maxFreq: 16000,
			radial: RADIAL_INWARD,
			showPeaks: PEAKS_DROP,
			spinSpeed: 2,
			outlineBars: true,
			weightingFilter: FILTER_D
		},
		theme: 'rainbow'
	},
	{
		name: 'Reflex Bars',
		options: {
			mode: MODE_BARS,
			alphaBars: ALPHABARS_OFF,
			bandResolution: BANDS_OCTAVE_4TH,
			barSpace: .25,
			colorMode: COLORMODE_LEVEL,
			ledBars: LEDS_OFF,
			maxFreq: 16000,
			outlineBars: false,
			radial: RADIAL_OFF,
			reflexAlpha: .5,
			reflexFit: true,
			reflexRatio: .3,
			showPeaks: PEAKS_DROP
		},
		theme: 'rainbow'
	}
];

// Create audioMotion-analyzer object

try {
	var audioMotion = new AudioMotionAnalyzer( container, {
		source: videoEl,
		fsElement: container
	});
}
catch( err ) {
	container.innerHTML = `<p>audioMotion-analyzer failed with error: ${ err.code ? '<strong>' + err.code + '</strong>' : '' } <em>${ err.code ? err.message : err }</em></p>`;
}

audioMotion.setScaleProps({ xAxis: { overlay: true } });

// Display package version at the footer
document.getElementById('version').innerText = AudioMotionAnalyzer.version;

// Set event listeners for UI controls

populateThemeSelections( audioMotion );
populateControls();
addUIEventListeners( () => audioMotion );
setPresets( presets, () => audioMotion, 3 ); // initialize with preset 3
