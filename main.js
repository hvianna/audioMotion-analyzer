import * as audioMotion from './audioMotion-analyzer.js';

audioMotion.create(
	document.getElementById('container'),
	{
		audioElement: document.getElementById('audio'),
		mode: 4
	}
);

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

document.getElementById('btn_discrete').addEventListener( 'click', () => audioMotion.setMode( 0 ) );
document.getElementById('btn_octaves').addEventListener( 'click', () => audioMotion.setMode( 24 ) );
document.getElementById('btn_half').addEventListener( 'click', () => audioMotion.setMode( 12 ) );
document.getElementById('btn_3rd').addEventListener( 'click', () => audioMotion.setMode( 8 ) );
document.getElementById('btn_6th').addEventListener( 'click', () => audioMotion.setMode( 4 ) );
document.getElementById('btn_12th').addEventListener( 'click', () => audioMotion.setMode( 2 ) );
document.getElementById('btn_24th').addEventListener( 'click', () => audioMotion.setMode( 1 ) );
