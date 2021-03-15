/**
 * audioMotion-analyzer fluid layout demo
 *
 * https://github.com/hvianna/audioMotion-analyzer
 */

import AudioMotionAnalyzer from '../src/audioMotion-analyzer.js';

const audioEl = document.getElementById('audio');


// Create audioMotion-analyzer object

try {
	var audioMotion = new AudioMotionAnalyzer(
		document.getElementById('container'),
		{
			source: audioEl, // main audio source is the HTML <audio> element
			mode: 8,
			showLeds: true,
			onCanvasResize: reason => {
				if ( reason != 'create' ) {
					updateUI();
					console.log( audioMotion._ledAtts );
				}
			}
		}
	);
}
catch( err ) {
	document.getElementById('container').innerHTML = `<p>audioMotion-analyzer failed with error: <em>${err}</em></p>`;
}

// Display package version at the footer
document.getElementById('version').innerText = AudioMotionAnalyzer.version;

// Event listeners for UI controls

document.querySelectorAll('[data-prop]').forEach( el => {
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
		if ( el.dataset.setting == 'mode' )
			console.log( audioMotion._ledAtts );
	});
});

document.querySelectorAll('[data-custom]').forEach( el => {
	el.addEventListener( 'change', () => {
		const active      = document.getElementById('customLeds').checked,
			  maxLeds     = document.getElementById('maxLeds').value,
			  maxSpaceV   = document.getElementById('maxSpaceV').value,
			  ledRatio    = document.getElementById('heightRatio').value,
			  spaceHRatio = document.getElementById('spaceHRatio').value;
//		audioMotion.setLedParams( active ? { maxLeds, maxSpaceV, spaceHRatio } : undefined );
		audioMotion.setLedParams( active ? { maxLeds, maxSpaceV, ledRatio, spaceHRatio } : undefined );
		console.log( audioMotion._ledParams, audioMotion._ledAtts );
	});
});

// Display value of ranged input elements
document.querySelectorAll('input[type="range"]').forEach( el => el.addEventListener( 'change', () => updateRangeElement( el ) ) );

// File upload
document.getElementById('uploadFile').addEventListener( 'change', e => loadSong( e.target ) );

// Initialize UI elements
updateUI();

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

// Update UI elements to reflect the analyzer's current settings
function updateUI() {
	document.querySelectorAll('[data-setting]').forEach( el => el.value = audioMotion[ el.dataset.setting ] );
	document.querySelectorAll('input[type="range"]').forEach( el => updateRangeElement( el ) );
	document.querySelectorAll('button[data-prop]').forEach( el => el.classList.toggle( 'active', audioMotion[ el.dataset.prop ] ) );
}
