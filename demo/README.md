audioMotion-analyzer demos
==========================

## [Fluid layout demo](https://hvianna.github.io/audioMotion-analyzer/demo/fluid.html)

+ Allows you to interactively test all functionalities of audioMotion-analyzer
+ The analyzer canvas will adjust to the container's size (set via CSS)
+ Demonstrates the use of the `onCanvasResize` - try resizing the window and check the messages logged to the JavaScript console
+ The `onCanvasDraw` callback is used to add custom content to the canvas, the audioMotion logo pulsating to the song beats!
+ Load a song from your computer, or open a remote file or stream via URL
+ Demonstrates the [connection with other audio sources](#connecting-additional-audio-nodes), by using a frequency oscillator to generate test tones

## [Multiple instances demo](https://hvianna.github.io/audioMotion-analyzer/demo/multi.html)

+ Shows multiple instances of audioMotion-analyzer working simultaneously

## Code tips

Note: the demo scripts are bundled/compressed with [webpack](https://webpack.js.org/). Source code is in the project's [`src/` folder](../src/).

### Creating the analyzer element

This creates the audioMotion-analyzer element, sets some initial options, and checks for any errors:

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

### Connecting additional audio nodes

This shows how to create an oscillator and a gain node, and connect them to the analyzer:

```
var audioCtx = audioMotion.audioCtx,
    oscillator = audioCtx.createOscillator(),
    gainNode = audioCtx.createGain();

oscillator.frequency.setValueAtTime( 0, audioCtx.currentTime );
oscillator.connect( gainNode );
oscillator.start();
gainNode.connect( audioMotion.analyzer );
```

### onCanvasDraw callback

The audioMotion logo is drawn over the analyzer by this callback function:

```
function displayCanvasMsg( canvas, canvasCtx, pixelRatio ) {
    if ( ! showLogo )
        return;
    var size = 20 * pixelRatio;
    if ( audioMotion.isFullscreen() )
        size *= 2;
    canvasCtx.font = `${size}px Orbitron,sans-serif`;
    var w = canvasCtx.measureText('audioMotion').width / 2;

    canvasCtx.font = `${size + audioMotion.dataArray[ 1 ] / 16 * pixelRatio}px Orbitron,sans-serif`;
    canvasCtx.fillStyle = '#fff8';
    canvasCtx.textAlign = 'center';
    canvasCtx.fillText( 'audioMotion', canvas.width - w - size * 4, size * 2 );
}
```

The demo script reads the `dataArray` variable exposed by audioMotion-analyzer and uses the amplitude of the first low frequency bin to change the size of the text, making the audioMotion logo pulsate to the rhythm of the music.


## Additional notes

If you plan on allowing users to interactively toggle the [low resolution mode](../README.md#lores-boolean), you may want to set a fixed size for the canvas via CSS, like so:

```
#container canvas {
    width: 100%;
}
```

This will prevent the canvas external size from changing when switching the low resolution mode.