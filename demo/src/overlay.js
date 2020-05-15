/**
 * audioMotion-analyzer Overlay demo
 *
 * https://github.com/hvianna/audioMotion-analyzer
 */

import AudioMotionAnalyzer from '../../dist/audioMotion-analyzer.js';

const videoEl = document.getElementById('video'),
	  container = document.getElementById('container'),
	  presetSelection = document.getElementById('presets');

// Visualization presets
const presets = [
	{
		name: 'Classic LEDs',
		options: {
			mode: 3,
			barSpace: .5,
			bgAlpha: .2,
			gradient: 'classic',
			lumiBars: false,
			reflexRatio: 0,
			showBgColor: false,
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
			gradient: 'custom',
			lineWidth: 2,
			lumiBars: false,
			reflexAlpha: 1,
			reflexRatio: .5,
			showBgColor: false,
			showPeaks: false,
			overlay: true
		}
	},
	{
		name: 'Reflex Bars',
		options: {
			mode: 5,
			barSpace: .25,
			bgAlpha: .8,
			lumiBars: false,
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
	var audioMotion = new AudioMotionAnalyzer(
		container,
		{
			source: videoEl,
			maxFreq: 16000,
			overlay: true,
			showScale: false
		}
	);
}
catch( err ) {
	container.innerHTML = `<p>audioMotion-analyzer failed with error: <em>${err}</em></p>`;
}

// Register custom gradient
audioMotion.registerGradient( 'custom', {
	bgColor: '#011a35',
	colorStops: [ '#ff0080', '#02235e' ]
});

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
	el.addEventListener( 'change', () => {
		audioMotion[ el.dataset.setting ] = el.value;
		if ( el.dataset.setting == 'mode' ) {
			document.getElementById('area_options').disabled = ( audioMotion.mode != 10 );
			document.getElementById('bar_options').disabled = ( audioMotion.mode == 0 || audioMotion.mode == 10 );
		}
	});
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
audioMotion.setOptions( presets[1].options );
presetSelection.value = 1;
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

	document.getElementById('area_options').disabled = ( audioMotion.mode != 10 );
	document.getElementById('bar_options').disabled = ( audioMotion.mode == 0 || audioMotion.mode == 10 );

	document.querySelectorAll('input[type="range"]').forEach( el => updateRangeElement( el ) );
	document.querySelectorAll('button[data-prop]').forEach( el => {
		const p = audioMotion[ el.dataset.prop ];
		el.classList.toggle( 'active', el.dataset.prop == 'isOn' ? ! p : p );
	});
}
