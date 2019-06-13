### Interface objects:

`audioCtx` *[AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) object*

You can use this object to create additional audio sources to be connected to the analyzer, like oscillator nodes and media streams.

`analyzer` *[AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode) object*

Connect any additional audio sources to this object, for them to be displayed in the graphic analyzer.

`canvas` *HTMLCanvasElement object*

Canvas element created by audioMotion.

`canvasCtx` *CanvasRenderingContext2D object*

2D rendering context for drawing in audioMotion's canvas.

### Read only variables:

`dataArray` *array*

Data array returned by [`getByteFrequencyData`](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData).

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

`width`, `height` *number*

Nominal dimensions of the analyzer. Please note that the actual canvas dimensions may differ from these, depending on the device pixel ratio and during fullscreen mode.


### Functions:

<a name="create"></a>`create( container, [ options ] )`

Constructor function. Initializes the analyzer and inserts the canvas in the *container* element.

```
options = {
	drawCallback: <function>
	fftSize: <number> (8192)
	freqMin: <number> (20)
	freqMax: <number> (22000)
	gradient: <string> ('classic')
	height: <number> (container.clientHeight || 270px)
	highSens: <boolean> (false)
	loRes: <boolean> (false)
	mode: <number> (0)
	scaleSize: <number> (1)
	showBgColor: <boolean> (true)
	showLeds: <boolean> (false)
	showPeaks: <boolean> (true)
	showScale: <boolean> (true)
	smoothing: <number> (0.5)
	source: <HTMLMediaElement>
	start: <boolean> (true)
	width: <number> (container.clientWidth || 640px)
}
```

`connectAudio( element )`

Connect an [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement) (`<audio>` or `<video>` HTML element) to the analyzer.
Returns a [MediaElementAudioSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/MediaElementAudioSourceNode) which can be used for later disconnection.

`boolean isFullscreen()`

Returns *true* if the analyzer is being displayed in fullscreen, or *false* otherwise.

`boolean isOn()`

Returns *true* if the analyzer is running, or *false* if it's stopped.

<a name="register-gradient"></a>`registerGradient( name, options )`

Registers a custom gradient. *name* is a string to be used with `setGradient()`.

```
options = {
	bgColor: '#111', // background color (required)
	dir: 'h',        // add this for a horizontal gradient (optional)
	colorStops: [
		'#f00',                     // list your gradient colors here (at least 2 colors are required)
		{ pos: .6, color: '#ff0' }, // use an object to specify the position (0 to 1) of a color
		'hsl( 120, 100%, 50% )'     // colors may be defined in any HTML valid format
	]
}
```

`setCanvasSize( [ width ], [ height ] )`

Sets canvas dimensions in pixels. *width* defaults to the container's width, or **640** if container's width is 0. *height* defaults to the container's height, or **270**.

`setDrawCallback( func )`

Sets a function to be called after audioMotion finishes rendering the canvas. If *func* is undefined or not a function, clears any function previously set.

For convenience, `canvas`, `canvasCtx` and `pixelRatio` are passed as arguments to the callback function.

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

`setFFTSize( [ samples ] )`

Sets the number of samples used for the FFT performed by the analyzer node.
Valid values for *samples* are 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, and 32768. Defaults to **8192**.

`setFreqRange( [ min ], [ max ] )`

Sets the desired frequency range. *min* defaults to **20**, and *max* defaults to **22000** (Hz).

`setScaleSize( [ value ] )`

Adjusts the size of the frequency scale shown in the X axis (when `showScale` is *true*). *value* may be a float. Defaults to **1**.

`setSmoothing( [ value ] )`

Sets the analyzer's [smoothingTimeConstant](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/smoothingTimeConstant). *value* must be a float between 0 and 1. Defaults to **0.5**.

`setGradient( [ gradient ] )`

Selects gradient for visualization. *gradient* must be the name of a built-in or [registered](#register-gradient) gradient. Built-in gradients are *'classic'*, *'prism'* and *'rainbow'*. Defaults to **'classic'**.

`setOptions( options )`

Shorthand function for setting several options at once. *options* is an object with the same structure as in the [`create()`](#create) function.

`setSensitivity( [ min ], [ max ] )`

Adjust the analyzer's sensitivity. If *min* is a boolean, set high sensitivity mode on (*true*) or off (*false*).
Custom values can be specified in decibels. For reference see [AnalyserNode.minDecibels @MDN](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/minDecibels).

*min* defaults to **-85** and *max* defaults to **-25**. These are the same values set by calling `setSensitivity( false )` which is the normal sensitivity mode.

`boolean toggleBgColor( [ boolean ] )`

Toggles the display of background color. If *true*, uses the background color defined by the active gradient; if *false* sets background to black. If no argument provided, inverts the current status. Returns the status after the change.

`toggleFullscreen()`

Toggles full-screen mode.

`boolean toggleLeds( [ boolean ] )`

Toggles LED display effect. If no argument provided, inverts its current status. Returns the resulting status.

`boolean togglePeaks( [ boolean ] )`

Toggles the display of amplitude peaks for each frequency. If no argument provided, inverts its current status. Returns the resulting status.

`boolean toggleScale ( [ boolean ] )`

Toggles display of frequency scale in the X axis. If no argument provided, inverts its current status. Returns the resulting status.

`boolean toggleAnalyzer( [ boolean ] )`

Starts or stops the analyzer and returns the resulting status. The analyzer is started by default on `create()`, unless you specify `start: false` in the options.

