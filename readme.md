### Interface objects:

`audioCtx` *AudioContext object*

The [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) object used by audioMotion. You can use this to create additional audio sources, like oscillator nodes and media streams, to be connected to the analyzer.

`analyzer` *AnalyserNode object*

The [AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode) object user by audioMotion. This is where you should connect any additional audio sources to be displayed in the graphic analyzer.

`canvas` *HTMLCanvasElement object*

Canvas element created by audioMotion.

`canvasCtx` *CanvasRenderingContext2D object*

2D rendering context for drawing in audioMotion's canvas.

### Read only variables:

`pixelRatio` *number*

Current [devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio). You can refer to this value to adjust any additional drawings in do in the canvas. When running in low-resolution mode (`loRes` option set to *true*) *pixelRatio* is halved, i.e. **0.5** for standard displays and **1** for retina/Hi-DPI.

`mode` *number*

Current visualization mode. See [setMode()](#set-mode) for valid values.

`gradient` *string*

Key to currently selected gradient

`showBgColor` *boolean*

*true* means background color is defined by current gradient; *false* means black background.

`showLeds` *boolean*

Use LED display effect?

`showScale` *boolean*

Frequency labels being displayed in the X axis?

`showPeaks` *boolean*

Show amplitude peaks for each frequency?

`highSens` *boolean*

High sensitivity mode active?

`loRes` *boolean*

Use low resolution canvas?


### Functions:

`create( container, [ options ] )`

Constructor function. Initializes the analyzer and inserts the canvas in the *container* element.

```
options = {
	fftSize: <number> (8192)
	freqMin: <number> (20)
	freqMax: <number> (22000)
	gradient: <string> ('classic')
	highSens: <boolean> (false)
	loRes: <boolean> (false)
	mode: <number> (0)
	showBgColor: <boolean> (true)
	showLeds: <boolean> (false)
	showPeaks: <boolean> (true)
	showScale: <boolean> (true)
	smoothing: <number> (0.5)
	source: <HTMLMediaElement>
	start: <boolean> (true)
}
```

<a name="set-mode"></a>`setMode( [ mode ] )`

Set visualization mode. Valid values are:

| Value | Mode |
|-------|------|
| 0 | Discrete frequencies |
| 1 | 1/24th-octave bands |
| 2 | 1/12th-octave bands |
| 4 | 1/6th-octave bands |
| 8 | 1/3rd-octave bands |
| 12 | half-octave bands |
| 24 | full-octave bands |

Defaults to **0** (discrete frequencies).

`setFFTsize( [ samples ] )`

Sets the number of samples used for the FFT performed by the analyzer node.
Valid values for *samples* are 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, and 32768. Defaults to **8192**.

`setFreqRange( [ min ], [ max ] )`

Sets the desired frequency range. *min* defaults to **20**, and *max* defaults to **22000** (Hz).

`setSmoothing( [ value ] )`

Sets the analyzer's [smoothingTimeConstant](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/smoothingTimeConstant). *value* must be a float between 0 and 1. Defaults to **0.5**.

`setGradient( [ gradient ] )`

Selects gradient for visualization. *gradient* must be the key (string) of a registered gradient. Defaults to **'classic'**.

`boolean togglePeaks( [ boolean ] )`

Toggles the display of amplitude peaks for each frequency. If no argument provided, inverts the current status. Returns the status after the change.

`boolean toggleBgColor( [ boolean ] )`

Toggles the display of background color. If *true*, uses the background color defined by the active gradient; if *false* sets background to black. If no argument provided, inverts the current status. Returns the status after the change.

`boolean setLeds( [ boolean ] )`

Toggles LED display effect. If no argument provided, inverts the current status. Returns the status after the change.

`boolean setScale ( [ boolean ] )`

Toggles display of frequency scale in the X axis. If no argument provided, inverts the current status. Returns the status after the change.

`setSensitivity( [ min ], [ max ] )`

Adjust the analyzer's sensitivity. If *min* is a boolean, set high sensitivity mode on (*true*) or off (*false*).
Custom values can be specified in decibels. For reference see [AnalyserNode.minDecibels @MDN](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/minDecibels).

*min* defaults to **-85** and *max* defaults to **-25**. These are the same values set by calling `setSensitivity( false )` which is the normal sensitivity mode.

`toggleFullscreen()`

Toggles full-screen mode.

`connectAudio( element )`

Connect an [HTML audio element](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement) to the analyzer.
Returns a [MediaElementAudioSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/MediaElementAudioSourceNode) which can be used for later disconnection.

`start()`

Starts canvas animation. Animation is started by default on `create()`, unless you specify `start: false` in the options.

`stop()`

Stops canvas animation.
