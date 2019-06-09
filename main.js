import * as audioMotion from './audioMotion-analyzer.js';

audioMotion.create(
	document.getElementById('container'),
	{
		audioElement: document.getElementById('audio'),
		mode: 4,
		start: false
	}
);

document.getElementById('btn_start').addEventListener( 'click', () => audioMotion.start() );
document.getElementById('btn_stop').addEventListener( 'click', () => audioMotion.stop() );
document.getElementById('btn_fullscr').addEventListener( 'click', () => audioMotion.toggleFullscreen() );

document.getElementById('btn_classic').addEventListener( 'click', () => audioMotion.setGradient('classic') );
document.getElementById('btn_prism').addEventListener( 'click', () => audioMotion.setGradient('prism') );
document.getElementById('btn_rainbow').addEventListener( 'click', () => audioMotion.setGradient('rainbow') );

document.getElementById('btn_freq1').addEventListener( 'click', () => audioMotion.setFreqRange( 20, 22000 ) );
document.getElementById('btn_freq2').addEventListener( 'click', () => audioMotion.setFreqRange( 30, 16000 ) );
