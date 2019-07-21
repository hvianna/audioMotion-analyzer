audioMotion-analyzer demo
=========================

The demo allows you to interactively test almost every functionality of audioMotion-analyzer. [See it online.](https://hvianna.github.io/audioMotion-analyzer)

Note: the script is bundled/compressed with [webpack](https://webpack.js.org/). Source code is in the project's [`src/` folder](../src/).

### Creating the analyzer element with some initial settings:

```
try {
	audioMotion.create(
		document.getElementById('container'),
		{
			mode: 4, // visualization mode: 1/6th-octave bands
			source: document.getElementById('audio'), // HTML audio element
			freqMin: 30,    // lowest frequency represented on X-axis
			freqMax: 16000, // highest frequency represented on X-axis
			showFPS: true,  // show framerate
			onCanvasDraw: displayCanvasMsg  // callback function (called after rendering each frame)
		}
	);
}
catch( err ) {
	document.getElementById('container').innerHTML = `<p>audioMotion failed with error: <em>${err}</em></p>`;
}
```

Right now, audioMotion-analyzer throws only one custom exception, if it fails to create an audio context.

### Connection of the analyzer with additional audio nodes, like a frequency oscillator and a gain node:

```
var audioCtx = audioMotion.audioCtx,
	oscillator = audioCtx.createOscillator(),
	gainNode = audioCtx.createGain();

oscillator.frequency.setValueAtTime( 0, audioCtx.currentTime );
oscillator.connect( gainNode );
oscillator.start();
gainNode.connect( audioMotion.analyzer );
```

### The usage of a callback function to draw additional content the analyzer canvas is illustrated here:

```
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
```

The demo script reads the `dataArray` variable exposed by audioMotion-analyzer and uses the amplitude of the first low frequency bin to change the size of the text, making the audioMotion logo pulsate to the rhythm of the music.


## Additional notes:

If you plan on allowing your application users to interactively toggle the low resolution mode, like shown in the demo, you may want to fix the canvas size via CSS:

```
#container canvas {
	width: 100%;
}
```

Otherwise the canvas will shrink and grow when changing the resolution mode.