import * as audioMotion from './audioMotion-analyzer.js';

audioMotion.create(
	document.getElementById('container'),
	{
		source: document.getElementById('audio'),
		mode: 4,
		freqMin: 30,
		freqMax: 16000
	}
);

var audioCtx = audioMotion.audioCtx,
	oscillator = audioCtx.createOscillator();

oscillator.frequency.setValueAtTime( 0, audioCtx.currentTime );
oscillator.connect( audioMotion.analyzer );
oscillator.start();

document.getElementById('btn_fullscr').addEventListener( 'click', () => audioMotion.toggleFullscreen() );

document.getElementById('btn_bgcolor').addEventListener( 'click', () => audioMotion.toggleBgColor() );
document.getElementById('btn_peaks').addEventListener( 'click', () => audioMotion.togglePeaks() );
document.getElementById('btn_leds').addEventListener( 'click', () => audioMotion.toggleLeds() );
document.getElementById('btn_scale').addEventListener( 'click', () => audioMotion.toggleScale() );

document.getElementById('btn_classic').addEventListener( 'click', () => audioMotion.setGradient('classic') );
document.getElementById('btn_prism').addEventListener( 'click', () => audioMotion.setGradient('prism') );
document.getElementById('btn_rainbow').addEventListener( 'click', () => audioMotion.setGradient('rainbow') );

document.getElementById('btn_freq1').addEventListener( 'click', () => audioMotion.setFreqRange( 20, 22000 ) );
document.getElementById('btn_freq2').addEventListener( 'click', () => audioMotion.setFreqRange( 30, 16000 ) );

document.getElementById('btn_start').addEventListener( 'click', () => audioMotion.start() );
document.getElementById('btn_stop').addEventListener( 'click', () => audioMotion.stop() );

document.getElementById('btn_discrete').addEventListener( 'click', () => audioMotion.setMode( 0 ) );
document.getElementById('btn_octaves').addEventListener( 'click', () => audioMotion.setMode( 24 ) );
document.getElementById('btn_half').addEventListener( 'click', () => audioMotion.setMode( 12 ) );
document.getElementById('btn_3rd').addEventListener( 'click', () => audioMotion.setMode( 8 ) );
document.getElementById('btn_6th').addEventListener( 'click', () => audioMotion.setMode( 4 ) );
document.getElementById('btn_12th').addEventListener( 'click', () => audioMotion.setMode( 2 ) );
document.getElementById('btn_24th').addEventListener( 'click', () => audioMotion.setMode( 1 ) );

document.getElementById('btn_B2').addEventListener( 'click', () => {
	oscillator.type = 'square';
	oscillator.frequency.setValueAtTime( 123.47, audioCtx.currentTime );
});

document.getElementById('btn_C4').addEventListener( 'click', () => {
	oscillator.type = 'sawtooth';
	oscillator.frequency.setValueAtTime( 261.63, audioCtx.currentTime );
});

document.getElementById('btn_A4').addEventListener( 'click', () => {
	oscillator.type = 'sine';
	oscillator.frequency.setValueAtTime( 440, audioCtx.currentTime );
});

document.getElementById('btn_G6').addEventListener( 'click', () => {
	oscillator.type = 'triangle';
	oscillator.frequency.setValueAtTime( 1567.98, audioCtx.currentTime );
});

document.getElementById('btn_A7').addEventListener( 'click', () => {
	oscillator.type = 'sine';
	oscillator.frequency.setValueAtTime( 3520, audioCtx.currentTime );
});

document.getElementById('btn_silence').addEventListener( 'click', () => {
	oscillator.frequency.setValueAtTime( 0, audioCtx.currentTime );
});
