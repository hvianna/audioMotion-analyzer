/**
 * audioMotion-analyzer Video overlay demo
 *
 * https://github.com/hvianna/audioMotion-analyzer
 */

import AudioMotionAnalyzer from '../src/audioMotion-analyzer.js';

const videoEl = document.getElementById('video'),
	  container = document.getElementById('container'),
	  presetSelection = document.getElementById('presets');

// Visualization presets
const presets = [
	{
		name: 'Defaults',
		options: undefined
	},
	{
		name: 'Classic LEDs',
		options: {
			mode: 'bars',
			bandResolution: 6,
			barSpace: .5,
			colorMode: 'gradient',
			gradient: 'classic',
			ledBars: true,
			lumiBars: false,
			maxFreq: 16000,
			radial: false,
			reflexRatio: 0,
			showLedMask: true,
			showPeaks: true
		}
	},
	{
		name: 'Mirror wave',
		options: {
			mode: 'graph',
			bandResolution: 0,
			fillAlpha: .6,
			gradient: 'rainbow',
			lineWidth: 2,
			lumiBars: false,
			maxFreq: 16000,
			radial: false,
			reflexAlpha: 1,
			reflexBright: 1,
			reflexRatio: .5,
			showPeaks: false
		}
	},
	{
		name: 'Radial inverse',
		options: {
			mode: 'bars',
			bandResolution: 6,
			barSpace: .25,
			fillAlpha: .5,
			gradient: 'prism',
			ledBars: false,
			linearAmplitude: true,
			linearBoost: 1.8,
			lineWidth: 1.5,
			maxDecibels: -30,
			maxFreq: 16000,
			radial: true,
			radialInvert: true,
			showPeaks: true,
			spinSpeed: 2,
			outlineBars: true,
			weightingFilter: 'D'
		}
	},
	{
		name: 'Reflex Bars',
		options: {
			mode: 'bars',
			bandResolution: 4,
			barSpace: .25,
			colorMode: 'bar-level',
			gradient: 'prism',
			ledBars: false,
			lumiBars: false,
			maxFreq: 16000,
			radial: false,
			reflexAlpha: .5,
			reflexFit: true,
			reflexRatio: .3,
			showPeaks: true,
			outlineBars: false
		}
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
		if ( el.dataset.func )
			audioMotion[ el.dataset.func ]();
		else
			audioMotion[ el.dataset.prop ] = ! audioMotion[ el.dataset.prop ];
		el.classList.toggle( 'active', audioMotion[ el.dataset.prop ] );
	});
});

document.querySelectorAll('[data-setting]').forEach( el => {
	el.addEventListener( 'change', () => audioMotion[ el.dataset.setting ] = el.value );
});

presetSelection.addEventListener( 'change', () => {
	audioMotion.setOptions( presets[ presetSelection.value ].options );
	updateUI();
});

// Display value of ranged input elements
document.querySelectorAll('input[type="range"]').forEach( el => el.addEventListener( 'change', () => updateRangeElement( el ) ) );

// Populate the UI presets select element
presets.forEach( ( preset, index ) => {
	const option = new Option( preset.name, index );
	presetSelection.append( option );
});

// Initialize settings with options from a preset
presetSelection.value = 3;
audioMotion.setOptions( presets[ presetSelection.value ].options );
updateUI();

// Update value div of range input elements
function updateRangeElement( el ) {
	const s = el.nextElementSibling;
	if ( s && s.className == 'value' ) {
		let text = el.value;
		if ( el.dataset.setting == 'bandResolution' ) {
			text = `[${text}] `;
			if ( el.value == 0 )
				text += 'FFT freqs.';
			else if ( audioMotion.isOctaveBands )
				text += ['','octaves','half','1/3rd','1/4th','1/6th','1/8th','1/12th','1/24th'][ el.value ] + ( el.value > 1 ? ' octs.' : '' );
			else
				text += ['','10','20','30','40','60','80','120','240'][ el.value ] + ' bands';
		}
		s.innerText = text;
	}
}

// Update UI elements to reflect the analyzer's current settings
function updateUI() {
	document.querySelectorAll('[data-setting]').forEach( el => el.value = audioMotion[ el.dataset.setting ] );

	document.querySelectorAll('input[type="range"]').forEach( el => updateRangeElement( el ) );
	document.querySelectorAll('button[data-prop]').forEach( el => el.classList.toggle( 'active', !! audioMotion[ el.dataset.prop ] ) );
}
