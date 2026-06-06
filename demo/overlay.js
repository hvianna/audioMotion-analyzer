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

const videoEl = document.getElementById('video'),
	  container = document.getElementById('container'),
	  presetSelection = document.getElementById('presets');

// Visualization presets
const presets = [
	{
		name: 'Defaults',
		options: undefined,
		theme: { name: 'classic', modifiers: {} } // clear modifiers
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
		theme: { name: 'classic', modifiers: {} }
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

// Display package version at the footer
document.getElementById('version').innerText = AudioMotionAnalyzer.version;

// Event listeners for UI controls

document.querySelectorAll('button[data-prop]').forEach( el => {
	el.addEventListener( 'click', () => {
		if ( el.dataset.func ) {
			const [ funcName, args ] = parseDatasetFunction( el.dataset.func, el.value );
			audioMotion[ funcName ]( ...args );
		}
		else
			audioMotion[ el.dataset.prop ] = ! audioMotion[ el.dataset.prop ];
		el.classList.toggle( 'active', audioMotion[ el.dataset.prop ] );
	});
});

document.querySelectorAll('[data-setting]').forEach( el => {
	el.addEventListener( 'input', () => {
		if ( el.dataset.func ) {
			const [ funcName, args ] = parseDatasetFunction( el.dataset.func, el.value );
			audioMotion[ funcName ]( ...args );
		}
		else
			audioMotion[ el.dataset.setting ] = el.value;
		updateUI();
	});
});

presetSelection.addEventListener( 'change', () => {
	const { options, theme } = presets[ presetSelection.value ];
	audioMotion.setOptions( options );
	if ( theme )
		audioMotion.setTheme( theme );
	updateUI();
});

// Display value of ranged input elements
document.querySelectorAll('input[type="range"]').forEach( el => el.addEventListener( 'input', () => updateRangeElement( el, audioMotion ) ) );

// Populate the UI presets select element
presets.forEach( ( preset, index ) => {
	const option = new Option( preset.name, index );
	presetSelection.append( option );
});

populateThemeSelections( audioMotion );

// Initialize settings with options from a preset
presetSelection.value = 3;
audioMotion.setOptions( presets[ presetSelection.value ].options );
updateUI();

// Update UI elements to reflect the analyzer's current settings
function updateUI() {
	document.querySelectorAll('[data-setting]').forEach( el => {
		if ( el.dataset.setting.indexOf('(') >= 0 ) { // it's a function
			const [ funcName, args ] = parseDatasetFunction( el.dataset.setting );
			el.value = audioMotion[ funcName ]( ...args );
		}
		else
			el.value = audioMotion[ el.dataset.setting ];
	});

	document.querySelectorAll('input[type="range"]').forEach( el => updateRangeElement( el, audioMotion ) );
	document.querySelectorAll('button[data-prop]').forEach( el => {
		let ret;
		if ( el.dataset.prop.indexOf('(') >= 0 ) { // it's a function
			const [ funcName, args ] = parseDatasetFunction( el.dataset.prop );
			ret = audioMotion[ funcName ]( ...args );
		}
		else
			ret = audioMotion[ el.dataset.prop ];

		el.classList.toggle( 'active', !! ret );
	});
}
