/**
 * audioMotion-analyzer Overlay demo
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
			mode: 3,
			barSpace: .5,
			bgAlpha: .7,
			gradient: 'classic',
			lumiBars: false,
			radial: false,
			reflexRatio: 0,
			showBgColor: true,
			showLeds: true,
			showPeaks: true,
			overlay: true
		}
	},
	{
		name: 'Mirror wave',
		options: {
			mode: 10,
			bgAlpha: .7,
			fillAlpha: .6,
			gradient: 'rainbow',
			lineWidth: 2,
			lumiBars: false,
			radial: false,
			reflexAlpha: 1,
			reflexBright: 1,
			reflexRatio: .5,
			showBgColor: false,
			showPeaks: false,
			overlay: true
		}
	},
	{
		name: 'Radial',
		options: {
			mode: 3,
			barSpace: .1,
			bgAlpha: .5,
			gradient: 'prism',
			maxFreq: 16000,
			radial: true,
			showBgColor: true,
			showLeds: false,
			showPeaks: true,
			spinSpeed: 2,
			overlay: true
		}
	},
	{
		name: 'Reflex Bars',
		options: {
			mode: 5,
			barSpace: .25,
			bgAlpha: .5,
			lumiBars: false,
			radial: false,
			reflexAlpha: .5,
			reflexFit: true,
			reflexRatio: .3,
			showBgColor: false,
			showLeds: false,
			showPeaks: true,
			overlay: true
		}
	}
];

// Create audioMotion-analyzer object

try {
	var audioMotion = new AudioMotionAnalyzer( container, {	source: videoEl	} );
}
catch( err ) {
	container.innerHTML = `<p>audioMotion-analyzer failed with error: <em>${err}</em></p>`;
}

// Display package version in the footer
document.getElementById('version').innerText = audioMotion.version;

// Event listeners for UI controls

document.querySelectorAll('button[data-prop]').forEach( el => {
	el.addEventListener( 'click', () => {
		if ( el.dataset.func )
			audioMotion[ el.dataset.func ]();
		else
			audioMotion[ el.dataset.prop ] = ! audioMotion[ el.dataset.prop ];
		el.classList.toggle( 'active' );
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

// Handle fullscreen mode for container element
document.getElementById('btn_fullscr').addEventListener( 'click', () => {
	if ( document.fullscreenElement ) {
		if ( document.exitFullscreen )
			document.exitFullscreen();
		else if ( document.webkitExitFullscreen )
			document.webkitExitFullscreen();
	}
	else {
		if ( container.requestFullscreen )
			container.requestFullscreen();
		else if ( container.webkitRequestFullscreen )
			container.webkitRequestFullscreen();
	}
});

// Populate the UI presets select element
presets.forEach( ( preset, index ) => {
	const option = new Option( preset.name, index );
	presetSelection.append( option );
});

// Initialize settings with options from a preset
presetSelection.value = 3;
audioMotion.setOptions( presets[ presetSelection.value ].options );
updateUI();

// Resume audio context if in suspended state (browsers' autoplay policy)
window.addEventListener( 'click', () => {
	if ( audioMotion.audioCtx.state == 'suspended' )
		audioMotion.audioCtx.resume();
});

// Update value div of range input elements
function updateRangeElement( el ) {
	const s = el.nextElementSibling;
	if ( s && s.className == 'value' )
		s.innerText = el.value;
}

// Update UI elements to reflect the analyzer's current settings
function updateUI() {
	document.querySelectorAll('[data-setting]').forEach( el => el.value = audioMotion[ el.dataset.setting ] );

	document.querySelectorAll('input[type="range"]').forEach( el => updateRangeElement( el ) );
	document.querySelectorAll('button[data-prop]').forEach( el => {
		const p = audioMotion[ el.dataset.prop ];
		el.classList.toggle( 'active', el.dataset.prop == 'isOn' ? ! p : p );
	});
}
