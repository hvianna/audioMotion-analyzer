audioMotion-analyzer
====================

High-resolution real-time graphic audio spectrum analyzer JavaScript module with no dependencies.

This is the graphic spectrum analyzer I originally wrote for [audioMotion](https://audiomotion.me), here in a standalone module for you to use in your own JavaScript projects.

## Online demo

[▶ audioMotion.dev/demo](https://audiomotion.dev/demo/)

![demo-animation](demo/demo.gif)

## Features

+ High-resolution (retina / HiDPI ready) real-time audio spectrum analyzer with fullscreen support
+ Logarithmic frequency scale with customizable range
+ 10 visualization modes: choose between discrete frequencies or octave bands based on the equal tempered scale
+ Optional vintage LED effect and variable luminance bars for octave bands modes
+ Customizable Web Audio API parameters: FFT size, sensitivity and time-smoothing constant
+ Comes with 3 predefined color gradients - easily add your own!
+ No dependencies, less than 20kB minified

## Usage

Install with npm:

```
npm install audiomotion-analyzer
```

ES6 import:

```
import AudioMotionAnalyzer from 'audiomotion-analyzer';
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

This will insert the analyzer canvas inside the *#container* element and start the visualization of audio coming from the *#audio* element.

## Constructor

`new AudioMotionAnalyzer( [container], [{options}] )`

Creates a new instance of audioMotion-analyzer. A canvas element will be created and inserted into the *container* element. If *container* is undefined, the canvas is appended to the document's body.

Available options with default values shown inside parentheses:

options = {<br>
&emsp;&emsp;[barSpace](#barspace-number): *number* (2),<br>
&emsp;&emsp;[fftSize](#fftsize-number): *number* (8192),<br>
&emsp;&emsp;[fillAlpha](#fillalpha-number): *number* (1),<br>
&emsp;&emsp;[gradient](#gradient-string): *string* ('classic'),<br>
&emsp;&emsp;[height](#height-number-width-number): *number*,<br>
&emsp;&emsp;[lineWidth](#linewidth-number): *number* (0),<br>
&emsp;&emsp;[loRes](#lores-boolean): *boolean* (false),<br>
&emsp;&emsp;[lumiBars](#lumibars-boolean): *boolean* (false),<br>
&emsp;&emsp;[maxDecibels](#maxdecibels-number-mindecibels-number): *number* (-25),<br>
&emsp;&emsp;[maxFreq](#maxfreq-number-minfreq-number): *number* (22000),<br>
&emsp;&emsp;[minDecibels](#maxdecibels-number-mindecibels-number): *number* (-85),<br>
&emsp;&emsp;[minFreq](#maxfreq-number-minfreq-number): *number* (20),<br>
&emsp;&emsp;[mode](#mode-number): *number* (0),<br>
&emsp;&emsp;[onCanvasDraw](#oncanvasdraw-function): *function*,<br>
&emsp;&emsp;[onCanvasResize](#oncanvasresize-function): *function*,<br>
&emsp;&emsp;[showBgColor](#showbgcolor-boolean): *boolean* (true),<br>
&emsp;&emsp;[showFPS](#showfps-boolean): *boolean* (false),<br>
&emsp;&emsp;[showLeds](#showleds-boolean): *boolean* (false),<br>
&emsp;&emsp;[showPeaks](#showpeaks-boolean): *boolean* (true),<br>
&emsp;&emsp;[showScale](#showscale-boolean): *boolean* (true),<br>
&emsp;&emsp;[smoothing](#smoothing-number): *number* (0.5),<br>
&emsp;&emsp;**source**: *HTMLMediaElement*,<br>
&emsp;&emsp;**start**: *boolean* (true),<br>
&emsp;&emsp;[width](#height-number-width-number): *number*<br>
}


If `source` is specified, the provided media element will be connected to the analyzer. You can later disconnect it by referring to the [audioSource](#audiosource-mediaelementaudiosourcenode-object) object.

You can also connect audio sources later with the [connectAudio()](#connectaudio-element-) method.

If `start: false` is specified, the analyzer will be created stopped. You can then start it with the [toggleAnalyzer()](#toggleanalyzer-boolean-) method.


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

### `barSpace` *number*

*Available since v1.3.0*

Customize the spacing between bars in [octave bands modes](#mode-number).

Use a value between 0 and 1 for spacing proportional to the bar width. Values >= 1 will be considered as a literal number of pixels.

For example, `barSpace = 0.5` will use half of the bar width for spacing, while `barSpace = 2` will set a fixed spacing of 2 pixels, independent of the width of bars.
Prefer proportional spacing to obtain consistent results among different resolutions and screen sizes.

`barSpace = 0` will effectively show contiguous bars, except when the [LED effect](#showleds-boolean) is on, in which case a minimum spacing is enforced.

Defaults to **0.1**.

### `dataArray` *[UInt8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) array* *(Read only)*

Data array returned by the analyzer's [`getByteFrequencyData()`](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData).
Array size is half the current FFT size, with element values ranging from 0 to 255.

Each array element represents a specific value in the frequency domain, such that: `frequency = i * audioCtx.sampleRate / fftSize`, where *i* is the array index.

The data is updated on every animation frame (ideally 60 times per second).

### `fftSize` *number*

Number of samples used for the FFT performed by the analyzer node. It must be a power of 2 between 32 and 32768, so valid values are: 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, and 32768.

Higher values provide more detail in the frequency domain, but less detail in the time domain. Defaults to **8192**.

### `fillAlpha` *number*

*Available since v1.3.0*

Opacity for the **Area fill** mode. Must be a float between 0 (completely transparent) and 1 (completely opaque).

Defaults to **1**.

See also [`lineWidth`](#linewidth-number).

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

You can set both values at once using the [setCanvasSize()](#setcanvassize-width-height-) method.

If you want the actual canvas dimensions, use `audioMotion.canvas.width` and `audioMotion.canvas.height`.

### `isFullscreen` *boolean* *(Read only)*

*true* when the analyzer is being displayed in fullscreen, or *false* otherwise.

### `isOn` *boolean* *(Read only)*

*true* if the analyzer canvas animation is running, or *false* if it's stopped.

### `lineWidth` *number*

*Available since v1.3.0*

Line width for the **Area fill** mode.

Defaults to **0**. For the line to be distinguishable, set also [`fillAlpha`](#fillalpha-number) < 1.

### `loRes` *boolean*

*true* for low resolution mode. Defaults to **false**.

Low resolution mode halves the effective pixel ratio, resulting in four times less pixels to render. This may improve performance significantly, especially in 4K+ monitors.

See [this note](demo/README.md#additional-notes) on using this feature interactively.

### `lumiBars` *boolean*

*Available since v1.1.0*

*true* to always display full-height bars and vary their luminance instead. Only effective for [visualization modes](#mode-number) 1 to 8 (octave bands). Defaults to **false**.

### `maxDecibels` *number*, `minDecibels` *number*

Highest and lowest decibel values represented in the Y-axis of the analyzer. The loudest volume possible is **0**. *maxDecibels* defaults to **-25** and *minDecibels* defaults to **-85**.

You can set both values at once using the [`setSensitivity()`](#setsensitivity-mindecibels-maxdecibels-) method.

For more info, see [AnalyserNode.minDecibels](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/minDecibels).

### `maxFreq` *number*, `minFreq` *number*

Highest and lowest frequencies represented in the X-axis of the analyzer. Values in Hertz. *maxFreq* defaults to **22000** and *minFreq* defaults to **20**.

You can set both values at once using the [`setFreqRange()`](#setfreqrange-minfreq-maxfreq-) method.

### `mode` *number*

Current visualization mode.

+ **Discrete frequencies** mode provides the highest resolution, allowing you to visualize individual frequencies provided by the [FFT](https://en.wikipedia.org/wiki/Fast_Fourier_transform);
+ **Octave bands** modes display wider vertical bars, each one representing the *n*th part of an octave, based on a [24-tone equal tempered scale](https://en.wikipedia.org/wiki/Quarter_tone);
+ **Area fill** mode uses the discrete frequencies data to draw a filled shape and/or a continuous line (see [fillAlpha](#fillalpha-number) and [lineWidth](#linewidth-number) properties).

Valid values are:

| Value | Mode | Available since |
|-------|------|-----------------|
| 0 | Discrete frequencies | |
| 1 | 1/24th octave bands | |
| 2 | 1/12th octave bands | |
| 3 | 1/8th octave bands | |
| 4 | 1/6th octave bands | |
| 5 | 1/4th octave bands | |
| 6 | 1/3rd octave bands | |
| 7 | half octave bands | |
| 8 | full octave bands | |
| 9 | *reserved* (not valid) | |
| 10 | Area fill | v1.1.0 |

Defaults to **0**.

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

*true* to use background color defined by current gradient; *false* for black background. Defaults to **true**.

### `showFPS` *boolean*

*true* to display the current frame rate. Defaults to **false**.

### `showLeds` *boolean*

*true* to activate LED display effect. Only effective for [visualization modes](#mode-number) 1 to 8 (octave bands). Defaults to **false**.

### `showPeaks` *boolean*

*true* to show amplitude peaks for each frequency. Defaults to **true**.

### `showScale` *boolean*

*true* to display frequency labels in the X axis. Defaults to **true**.

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

### `setCanvasSize( width, height )`

Sets the analyzer nominal dimensions in pixels. See [height and width](#height-number-width-number) properties for details.

### `setFreqRange( minFreq, maxFreq )`

Sets the desired frequency range. Values are expressed in Hz (Hertz).

### `setOptions( {options} )`

Shorthand method for setting several options at once.

`options` is an object with the same structure used in the class [constructor](#constructor), except for the `source` option which is only available at construction time.

### `setSensitivity( minDecibels, maxDecibels )`

Adjust the analyzer's sensitivity. See [maxDecibels and minDecibels](#maxdecibels-number-mindecibels-number) properties.

### `toggleAnalyzer( [boolean] )`

Starts (*true*) or stops (*false*) the analyzer animation. If no argument provided, inverts the current status. Returns the resulting status.
The analyzer is started by default upon [object construction](#constructor), unless you specify `start: false` in the options.

### `toggleFullscreen()`

Toggles fullscreen mode. As per [API specification](https://fullscreen.spec.whatwg.org/), fullscreen requests must be triggered by user activation, so you must call this function from within an event handler or otherwise the request will be denied.


## License

audioMotion-analyzer copyright (c) 2018-2020 Henrique Avila Vianna<br>
Licensed under the [GNU Affero General Public License, version 3 or later](https://www.gnu.org/licenses/agpl.html).
