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
import AudioMotionAnalyzer from 'audioMotion-analyzer';
```

Minimal constructor:

```
var audioMotion = new AudioMotionAnalyzer(
	document.getElementById('container'),
	{
		source: document.getElementById('audio')
	}
);
```

This will insert the analyzer canvas inside the *#container* element and start the visualization of audio coming from the *#audio* element. You can connect additional audio sources via the `connectAudio()` method or directly to the `audioCtx` object exposed by audioMotion.

See the [demo folder](demo/) for more comprehensive examples. See [Methods](#methods) for additional configuration options and other ways to interact with the analyzer.


## Constructor

`new AudioMotionAnalyzer( [container], [{options}] )`

Creates an instance of the audioMotion analyzer. A canvas element will be created and inserted into the *container* element. If *container* is undefined, the canvas is appended to the document's body.

If `source` is specified in the *options*, it will be connected to the analyzer. You can later disconnect it by referring to the [audioSource](#audiosource-mediaelementaudiosourcenode-object) object.

```
options = {
	fftSize: <number> (8192)
	gradient: <string> ('classic')
	height: <number> (container.clientHeight || 270)
	loRes: <boolean> (false)
	maxDecibels: <number> (-25)
	maxFreq: <number> (22000)
	minDecibels: <number> (-85)
	minFreq: <number> (20)
	mode: <number> (0)
	onCanvasDraw: <function>
	onCanvasResize: <function>
	showBgColor: <boolean> (true)
	showFPS: <boolean> (false)
	showLeds: <boolean> (false)
	showPeaks: <boolean> (true)
	showScale: <boolean> (true)
	smoothing: <number> (0.5)
	source: <HTMLMediaElement>
	start: <boolean> (true)
	width: <number> (container.clientWidth || 640)
}
```


## Interface objects

See the [demo folder](demo/) for code examples of interaction with the objects below.

### `analyzer` *[AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode) object*

Connect any additional audio sources to this object, so their output is displayed in the graphic analyzer.

### `audioCtx` *[AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) object*

Use this object to create additional audio sources to be connected to the analyzer, like oscillator nodes, gain nodes and media streams.

### `audioSource` *[MediaElementAudioSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/MediaElementAudioSourceNode) object*

Object representing the HTML media element connected using the `source` option of the class [constructor](#constructor). See also the [`connectAudio()`](#connectaudio-element-) method.

### `canvas` *HTMLCanvasElement object*

Canvas element created by audioMotion.

### `canvasCtx` *CanvasRenderingContext2D object*

2D rendering context for drawing in audioMotion's canvas.


## Properties

### `dataArray` *[UInt8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) array* *(Read only)*

Data array returned by the analyzer's [`getByteFrequencyData()`](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData).
Array size is half the current FFT size, with element values ranging from 0 to 255.

Each array element represents a specific value in the frequency domain, such that: `frequency = i * audioCtx.sampleRate / fftSize`, where *i* is the array index.

The data is updated on every animation frame (ideally 60 times per second).

### `fftSize` *number*

Number of samples used for the FFT performed by the analyzer node. *samples* must be a power of 2 between 32 and 32768, so valid values are: 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, and 32768.

Higher values provide more detail in the frequency domain, but less detail in the time domain. Defaults to **8192**.

### `fps` *number* *(Read only)*

Current frame rate.

### `fsHeight` *number* *(Read only)*, `fsWidth` *number* *(Read only)*

Canvas dimensions used during fullscreen mode. These take the current pixel ratio into account and will change accordingly when [low-resolution mode](#lores-boolean) is set.

### `gradient` *string*

Currently selected gradient. *gradient* must be the name of a built-in or [registered](#registergradient-name-options-) gradient. Built-in gradients are *'classic'*, *'prism'* and *'rainbow'*. Defaults to **'classic'**.

### `height` *number*, `width` *number*

Nominal dimensions of the analyzer.

If one or both of these are `undefined`, the analyzer will try to adjust to the container's width and/or height.
If the container's width and/or height are 0 (inline elements), a reference size of **640 x 270 pixels** will be used to replace the missing dimension(s).
This should be considered the minimum dimensions for proper visualization of all available modes with the LED effect on.

You can set both values at once using the [setCanvasSize](#setcanvassize-width-height-) method.

If you want the actual canvas dimensions, use `audioMotion.canvas.width` and `audioMotion.canvas.height`.

### `isFullscreen` *boolean* *(Read only)*

*true* when the analyzer is being displayed in fullscreen, or *false* otherwise.

### `isOn` *boolean* *(Read only)*

*true* if the analyzer canvas animation is running, or *false* if it's stopped.

### `loRes` *boolean*

*true* for low resolution mode.

Low resolution mode halves the effective pixel ratio, resulting in four times less pixels to render. This may improving performance significantly, especially in 4K+ monitors.

See [this note](demo/README.md#additional-notes) on using this feature interactively.

### `maxDecibels` *number*, `minDecibels` *number*

Highest and lowest decibel values represented in the Y-axis of the analyzer. Default values are **-25** for *maxDecibels* and **-85** for *maxDecibels*. **0** is the loudest volume possible.

You can set both values at once using the [`setSensitivity()`](#setsensitivity-min-max-) method.

For more info, see [AnalyserNode.minDecibels](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/minDecibels).

### `maxFreq` *number*, `minFreq` *number*

Highest and lowest frequencies represented in the X-axis of the analyzer. You can set both values at once using the [`setFreqRange()`](#setfreqrange-min-max-) method.

### `mode` *number*

Current visualization mode. Valid values are:

| Value | Mode |
|-------|------|
| 0 | Discrete frequencies |
| 1 | 1/24th octave bands |
| 2 | 1/12th octave bands |
| 3 | 1/8th octave bands |
| 4 | 1/6th octave bands |
| 5 | 1/4th octave bands |
| 6 | 1/3rd octave bands |
| 7 | half octave bands |
| 8 | full octave bands |

Defaults to **0** (discrete frequencies).

### `onCanvasDraw` *function*

Function to be called after audioMotion finishes rendering a frame on the canvas. The audioMotion object will be passed as an argument to the callback function.

### `onCanvasResize` *function*

Function to be called whenever the canvas is resized.
Two arguments will be passed to the callback function: a string with the reason why the function was called (see below) and the audioMotion object.

Reason | Description
-------|------------
`'create'` | canvas created by the class constructor
`'fschange'` | analyzer entered or left fullscreen mode
`'lores'` | low resolution mode toggled on or off
`'resize'` | browser window resized (only when [width and/or height](#height-number-width-number) are undefined)
`'user'` | canvas dimensions changed by the user, via `setCanvasSize()` or `setOptions()` methods

### `pixelRatio` *number* *(Read only)*

Current [devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio).
This is usually **1** for standard displays and **2** for retina / Hi-DPI screens. You can refer to this value to adjust any additional drawings done in the canvas.
When [low-resolution mode](#lores-boolean) is active *pixelRatio* is halved, i.e. **0.5** for standard displays and **1** for retina / Hi-DPI.

### `showBgColor` *boolean*

*true* to use background color defined by current gradient; *false* for black background.

### `showFPS` *boolean*

*true* to display the current frame rate.

### `showLeds` *boolean*

*true* to activate LED display effect. It has no effect when [visualization mode](#mode-number) is 0 (discrete frequencies).

### `showPeaks` *boolean*

*true* to show amplitude peaks for each frequency.

### `showScale` *boolean*

*true* to display frequency labels in the X axis.

### `smoothing` *number*

Sets the analyzer's [smoothingTimeConstant](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/smoothingTimeConstant). *value* must be a float between 0 and 1.

Lower values make the analyzer respond faster to changes. Defaults to **0.5**.


## Methods

### `connectAudio( element )`

Connects an [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement) (`<audio>` or `<video>` HTML element) to the analyzer.
Returns a [MediaElementAudioSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/MediaElementAudioSourceNode) which can be used for later disconnection.

For connecting other audio sources, like oscillators and streams, use the [`audioCtx`](#audioctx-audiocontext-object) and [`analyzer`](#analyzer-analysernode-object) objects. See [this example](demo/README.md#connecting-additional-audio-nodes).

### `registerGradient( name, options )`

Registers a custom gradient. *name* is a string that will be used for the [`gradient`](#gradient-string) property.

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

### `setCanvasSize( [width], [height] )`

Sets the analyzer nominal dimensions in pixels. See [height and width](#height-number-width-number) properties for details.

### `setFreqRange( [min], [max] )`

Sets the desired frequency range. Values are expressed in Hz (Hertz). *min* defaults to **20**, and *max* defaults to **22000**.

### `setOptions( {options} )`

Shorthand method for setting several options at once. *options* is an object with the same structure used in the class [constructor](#constructor), except for the `source` option which is only available at construction time.

### `setSensitivity( [min], [max] )`

Adjust the analyzer's sensitivity. See [maxDecibels and minDecibels](#maxdecibels-number-mindecibels-number) properties.

### `toggleAnalyzer( [boolean] )`

Starts (*true*) or stops (*false*) the analyzer animation. If no argument provided, inverts the current status. Returns the resulting status.
The analyzer is started by default upon [creation](#constructor), unless you specify `start: false` in the options.

### `toggleFullscreen()`

Toggles fullscreen mode. As per [API specification](https://fullscreen.spec.whatwg.org/), fullscreen requests must be triggered by user activation, so you must call this function from within an event handler or otherwise the request will be denied.


## License

audioMotion-analyzer copyright (c) 2018-2019 Henrique Avila Vianna<br>
Licensed under the [GNU Affero General Public License, version 3 or later](https://www.gnu.org/licenses/agpl.html).
