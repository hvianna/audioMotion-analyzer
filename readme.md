audioMotion-analyzer
====================

High-resolution real-time graphic audio spectrum analyzer JavaScript module with no dependencies.

This is the just the spectrum analyzer module written for my [audioMotion](https://github.com/hvianna/audioMotion.js) project, a full-featured audio player and graphic spectrum analyzer.

## Usage

Using npm:

```
npm install audioMotion-analyzer
```

ES6 import:

```
import * as audioMotion from 'audioMotion-analyzer';
```

Minimal constructor:

```
audioMotion.create(
	document.getElementById('container'), {
		source: document.getElementById('audio')
	}
);
```

This will insert the analyzer canvas inside the *#container* element and start the visualization of audio coming from the *#audio* element. You can connect additional audio sources via the `connectAudio()` function or directly to the `audioCtx` object exposed by audioMotion.

See the [demo folder](demo/) for more comprehensive examples. See [functions](#functions) for additional configuration options and other ways to interact with the analyzer.


## Interface objects

#### `audioCtx` *[AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) object*

Use this object to create additional audio sources to be connected to the analyzer, like oscillator nodes, gain nodes and media streams.

#### `analyzer` *[AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode) object*

Connect any additional audio sources to this object, so their output is displayed in the graphic analyzer.

#### `canvas` *HTMLCanvasElement object*

Canvas element created by audioMotion.

#### `canvasCtx` *CanvasRenderingContext2D object*

2D rendering context for drawing in audioMotion's canvas.


## Read only variables

#### `dataArray` *[UInt8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) array*

Data array returned by the analyzer's [`getByteFrequencyData()`](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData).
The array size is half the current FFT size, with element values ranging from 0 to 255. Each element represents the amplitude of a specific frequency,
like so: `frequency = arrayIndex * audioCtx.sampleRate / analyzer.fftSize`

The data is updated on every animation frame (ideally 60 times per second).

#### `fps` *number*

Current frame rate.

#### `fsHeight` *number*, `fsWidth` *number*

Canvas dimensions used during fullscreen mode. These take the current pixel ratio into account and will change accordingly when low-resolution mode is set.

#### `gradient` *string*

Key to currently selected gradient.

#### `height` *number*, `width` *number*

Nominal dimensions of the analyzer container. Actual canvas dimensions may differ from these, depending on the current pixel ratio and fullscreen status.
For the current canvas dimensions use `audioMotion.canvas.width` and `audioMotion.canvas.height`.

#### `highSens` *boolean*

*true* when high sensitivity mode is active.

#### `loRes` *boolean*

*true* when canvas is set to low resolution (half the original width and height).

#### `maxFreq` *number*

Highest frequency represented in the X-axis of the analyzer.
This can be set when [creating](#create-container-options) the analyzer, or with the [`setFreqRange()`](#setfreqrange-min-max) function.

#### `minFreq` *number*

Lowest frequency represented in the X-axis of the analyzer.
This can be set when [creating](#create-container-options) the analyzer, or with the [`setFreqRange()`](#setfreqrange-min-max) function.

#### `mode` *number*

Current visualization mode. See [setMode()](#setmode-mode) for valid values.

#### `pixelRatio` *number*

Current [devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio).
This is usually **1** for standard displays and **2** for retina / Hi-DPI screens. You can refer to this value to adjust any additional drawings done in the canvas.
When low-resolution mode is active (`loRes` option set to *true*) *pixelRatio* is halved, i.e. **0.5** for standard displays and **1** for retina / Hi-DPI.

#### `showBgColor` *boolean*

*true* when using background color defined by current gradient; *false* for black background.

#### `showLeds` *boolean*

*true* when LED display effect is active.

#### `showPeaks` *boolean*

*true* when amplitude peaks for each frequency are being displayed.

#### `showScale` *boolean*

*true* when frequency labels are being displayed in the X axis.


## Functions

#### `create( [container], [{options}] )`

Constructor function. Initializes the analyzer and inserts the canvas into the *container* element. If *container* is undefined, the canvas is added to the document's body.

If `source` is specified in the *options*, returns a [MediaElementAudioSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/MediaElementAudioSourceNode) object to the connected audio element.

```
options = {
	drawCallback: <function>
	fftSize: <number> (8192)
	gradient: <string> ('classic')
	height: <number> (container.clientHeight || 270px)
	highSens: <boolean> (false)
	loRes: <boolean> (false)
	maxFreq: <number> (22000)
	minFreq: <number> (20)
	mode: <number> (0)
	showBgColor: <boolean> (true)
	showFPS: <boolean> (false)
	showLeds: <boolean> (false)
	showPeaks: <boolean> (true)
	showScale: <boolean> (true)
	smoothing: <number> (0.5)
	source: <HTMLMediaElement>
	start: <boolean> (true)
	width: <number> (container.clientWidth || 640px)
}
```

#### `connectAudio( element )`

Connects an [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement) (`<audio>` or `<video>` HTML element) to the analyzer.
Returns a [MediaElementAudioSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/MediaElementAudioSourceNode) which can be used for later disconnection.

#### `isFullscreen()`

Returns *true* if the analyzer is being displayed in fullscreen, or *false* otherwise.

#### `isOn()`

Returns *true* if the analyzer canvas animation is running, or *false* if it's stopped.

#### `registerGradient( name, options )`

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

#### `setCanvasSize( [width], [height] )`

Sets the canvas' nominal dimensions in pixels (see [`height, width`](#height-number-width-number)). *width* defaults to the container's width, or **640** if container's width is 0. *height* defaults to the container's height, or **270**.
These will be automatically multiplied by the current pixel ratio to set actual canvas dimensions, so values will be doubled for HiDPI / retina displays, or halved when low-resolution mode is on.

#### `setDrawCallback( func )`

Sets a function to be called after audioMotion finishes rendering each frame of the canvas. If *func* is undefined or not a function, clears any function previously set.

For convenience, `canvas`, `canvasCtx` and `pixelRatio` are passed as arguments to the callback function.

#### `setMode( [mode] )`

Set visualization mode. Valid values for *mode* are:

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

#### `setFFTSize( [samples] )`

Sets the number of samples used for the FFT performed by the analyzer node. *samples* must be a power of 2 between 32 and 32768, so valid values are: 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, and 32768.

Higher values provide more detail in the frequency domain, but less detail in the time domain. Defaults to **8192**.

#### `setFreqRange( [min], [max] )`

Sets the desired frequency range. Values are expressed in Hz (Hertz). *min* defaults to **20**, and *max* defaults to **22000**.

#### `setGradient( [gradient] )`

Selects gradient for visualization. *gradient* must be the name of a built-in or [registered](#registergradient-name-options) gradient. Built-in gradients are *'classic'*, *'prism'* and *'rainbow'*. Defaults to **'classic'**.

#### `setOptions( {options} )`

Shorthand function for setting several options at once. *options* is an object with the same structure as in the [`create()`](#create-container-options) function.

#### `setSensitivity( [min], [max] )`

Adjust the analyzer's sensitivity. If *min* is a boolean, sets high sensitivity mode on (*true*) or off (*false*).
Custom values can be specified in dB (decibels). For reference values, see [AnalyserNode.minDecibels](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/minDecibels).

*min* defaults to **-85** and *max* defaults to **-25**. These are the same values set by calling `setSensitivity( false )` which is the normal sensitivity mode.

#### `setSmoothing( [value] )`

Sets the analyzer's [smoothingTimeConstant](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/smoothingTimeConstant). *value* must be a float between 0 and 1.

Lower values make the analyzer respond faster to changes. Defaults to **0.5**.

#### `toggleAnalyzer( [boolean] )`

Starts (*true*) or stops (*false*) the analyzer and returns the resulting status.
The analyzer is started by default on `create()`, unless you specify `start: false` in the options.

#### `toggleBgColor( [boolean] )`

Toggles the display of background color. If *true*, uses the background color defined by the active gradient; if *false* sets background to black.
If no argument provided, inverts the current status. Returns the resulting status after the change.

#### `toggleFPS( [boolean] )`

Toggles display of current frame rate on (*true*) or off (*false*). If no argument provided, inverts the current status. Returns the resulting status after the change.

#### `toggleFullscreen()`

Toggles full-screen mode. As per [API specification](https://fullscreen.spec.whatwg.org/), fullscreen requests must be triggered by user activation, so you must call this function from within an event handler or otherwise the request will be denied.

#### `toggleLeds( [boolean] )`

Toggles LED display effect on (*true*) or off (*false*). If no argument provided, inverts the current status. Returns the resulting status after the change.

#### `togglePeaks( [boolean] )`

Toggles the display of amplitude peaks for each frequency on (*true*) or off (*false*). If no argument provided, inverts the current status. Returns the resulting status after the change.

#### `toggleScale ( [boolean] )`

Toggles display of frequency scale in the X-axis on (*true*) or off (*false*). If no argument provided, inverts the current status. Returns the resulting status after the change.

## License

audioMotion-analyzer copyright (c) 2018-2019 Henrique Avila Vianna<br>
Licensed under the [GNU Affero General Public License, version 3 or later](https://www.gnu.org/licenses/agpl.html).
