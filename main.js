import * as audioMotion from './src/audioMotion-analyzer.js';

function displayCanvasMsg( canvas, canvasCtx, pixelRatio ) {
	var size = 20 * pixelRatio;
	if ( audioMotion.isFullscreen() )
		size *= 2;
	canvasCtx.font = `${size}px Orbitron,sans-serif`;
	var w = canvasCtx.measureText('audioMotion').width / 2;

	canvasCtx.font = `${size + audioMotion.dataArray[ 1 ] / 16 * pixelRatio}px Orbitron,sans-serif`;
	canvasCtx.fillStyle = '#fff8';
	canvasCtx.textAlign = 'center';
	canvasCtx.fillText( 'audioMotion', size + w, size * 2 );
}

try {
	audioMotion.create(
		document.getElementById('container'),
		{
			mode: 4,
			source: document.getElementById('audio'),
			freqMin: 30,
			freqMax: 16000,
			showFPS: true,
			drawCallback: displayCanvasMsg
		}
	);
}
catch( err ) {
	document.getElementById('container').innerHTML = `<p>audioMotion failed with error: <em>${err}</em></p>`;
}

var audioCtx = audioMotion.audioCtx,
	oscillator = audioCtx.createOscillator(),
	gainNode = audioCtx.createGain();

oscillator.frequency.setValueAtTime( 0, audioCtx.currentTime );
oscillator.connect( gainNode );
oscillator.start();
gainNode.connect( audioMotion.analyzer );

document.getElementById('btn_fullscr').addEventListener( 'click', () => audioMotion.toggleFullscreen() );
document.getElementById('btn_bgcolor').addEventListener( 'click', () => audioMotion.toggleBgColor() );
document.getElementById('btn_peaks').addEventListener( 'click', () => audioMotion.togglePeaks() );
document.getElementById('btn_leds').addEventListener( 'click', () => audioMotion.toggleLeds() );
document.getElementById('btn_scale').addEventListener( 'click', () => audioMotion.toggleScale() );
document.getElementById('btn_lores').addEventListener( 'click', () => audioMotion.toggleLoRes() );
document.getElementById('btn_fps').addEventListener( 'click', () => audioMotion.toggleFPS() );
document.getElementById('btn_freeze').addEventListener( 'click', () => audioMotion.toggleAnalyzer() );

document.getElementById('mode').addEventListener( 'change', ( e ) => audioMotion.setMode( e.target.value ) );
document.getElementById('gradient').addEventListener( 'change', ( e ) => audioMotion.setGradient( e.target.value ) );
document.getElementById('range').addEventListener( 'change', ( e ) => {
	let selected = e.target[ e.target.selectedIndex ];
	audioMotion.setFreqRange( selected.dataset.min, selected.dataset.max );
});

document.querySelectorAll('.tones').forEach( el =>
	el.addEventListener( 'click', ( e ) => {
		oscillator.type = e.target.dataset.wave;
		oscillator.frequency.setValueAtTime( e.target.dataset.freq, audioCtx.currentTime );
		gainNode.gain.setValueAtTime( .2, audioCtx.currentTime );
	})
);

document.getElementById('btn_soundoff').addEventListener( 'click', () => gainNode.gain.setValueAtTime( 0, audioCtx.currentTime ) );
