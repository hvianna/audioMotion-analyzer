
## About

**audioMotion-analyzer** is a high-resolution real-time audio spectrum analyzer in a vanilla JavaScript module
with no dependencies. It's highly customizable and optimized for small size and high performance.

I originally wrote this for my [**audioMotion**](https://audiomotion.me) spectrum analyzer and music player. Check it out too!

## Features

+ High-resolution (retina / HiDPI ready) real-time audio spectrum analyzer with fullscreen support
+ Logarithmic frequency scale with customizable range
+ Visualize discrete frequencies with full FFT resolution, or octave bands based on the equal tempered scale
+ Optional effects: vintage LEDs, luminance bars, customizable reflection, radial visualization
+ Customizable Web Audio API parameters: FFT size, sensitivity and time-smoothing constant
+ Comes with 3 predefined color gradients - easily add your own!
+ No dependencies, less than 20kB minified

## Online demos

[![demo-animation](demo/media/demo.gif)](https://audiomotion.dev/demo/)

?> https://audiomotion.dev/demo/

## Usage

### Using npm and webpack

Install with npm:

```console
$ npm install audiomotion-analyzer
```

Use ES6 import syntax:

```js
import AudioMotionAnalyzer from 'audiomotion-analyzer';
```

### As a native JavaScript module (ESM)

Simply copy the `audioMotion-analyzer.js` file from the `src` folder to your project folder and add the line below to your HTML file:

```html
<body>
  .
  .
	<script src="main.js" type="module"></script>
</body>
```

And in your `main.js` file, use:

```js
import AudioMotionAnalyzer from './audiomotion-analyzer.js';
```

Please note that JavaScript security requirements don't allow loading modules via `file://` URLs.
You'll need a web server, such as [http-server](https://github.com/http-party/http-server), to test files locally.

## Constructor

`new AudioMotionAnalyzer( [container], [{options}] )`

Creates a new instance of audioMotion-analyzer.

The analyzer canvas will be created and appended to the HTML element referenced by `container`.

If `container` is undefined, the canvas will be appended to the document's body.

Usage example:

```js
const audioMotion = new AudioMotionAnalyzer(
	document.getElementById('container'),
	{
		source: document.getElementById('audio')
	}
);
```

This will insert the analyzer canvas inside the *#container* element and start the visualization of audio coming from the *#audio* element.

### Options

Available options and default values:

options = {<br>
&emsp;&emsp;[audioCtx](#audioctx-audiocontext-object): *undefined*,<br>
&emsp;&emsp;[barSpace](#barspace-number): **0.1**,<br>
&emsp;&emsp;[bgAlpha](#bgalpha-number): **0.7**,<br>
&emsp;&emsp;[fftSize](#fftsize-number): **8192**,<br>
&emsp;&emsp;[fillAlpha](#fillalpha-number): **1**,<br>
&emsp;&emsp;[gradient](#gradient-string): **'classic'**,<br>
&emsp;&emsp;[height](#height-number): *undefined*,<br>
&emsp;&emsp;[lineWidth](#linewidth-number): **0**,<br>
&emsp;&emsp;[loRes](#lores-boolean): **false**,<br>
&emsp;&emsp;[lumiBars](#lumibars-boolean): **false**,<br>
&emsp;&emsp;[maxDecibels](#maxdecibels-number): **-25**,<br>
&emsp;&emsp;[maxFreq](#maxfreq-number): **22000**,<br>
&emsp;&emsp;[minDecibels](#mindecibels-number): **-85**,<br>
&emsp;&emsp;[minFreq](#minfreq-number): **20**,<br>
&emsp;&emsp;[mode](#mode-number): **0**,<br>
&emsp;&emsp;[onCanvasDraw](#oncanvasdraw-function): *undefined*,<br>
&emsp;&emsp;[onCanvasResize](#oncanvasresize-function): *undefined*,<br>
&emsp;&emsp;[overlay](#overlay-boolean): **false**,<br>
&emsp;&emsp;[radial](#radial-boolean): **false**,<br>
&emsp;&emsp;[reflexAlpha](#reflexalpha-number): **0.15**,<br>
&emsp;&emsp;[reflexBright](#reflexbright-number): **1**,<br>
&emsp;&emsp;[reflexFit](#reflexfit-boolean): **true**,<br>
&emsp;&emsp;[reflexRatio](#reflexratio-number): **0**,<br>
&emsp;&emsp;[showBgColor](#showbgcolor-boolean): **true**,<br>
&emsp;&emsp;[showFPS](#showfps-boolean): **false**,<br>
&emsp;&emsp;[showLeds](#showleds-boolean): **false**,<br>
&emsp;&emsp;[showPeaks](#showpeaks-boolean): **true**,<br>
&emsp;&emsp;[showScale](#showscale-boolean): **true**,<br>
&emsp;&emsp;[showScaleY](#showscaley-boolean): **false**,<br>
&emsp;&emsp;[smoothing](#smoothing-number): **0.5**,<br>
&emsp;&emsp;[source](#source-htmlmediaelement-object): *undefined*,<br>
&emsp;&emsp;[spinSpeed](#spinspeed-number): **0**,<br>
&emsp;&emsp;[start](#start-boolean): **true**,<br>
&emsp;&emsp;[width](#width-number): *undefined*<br>
}

### `source` *HTMLMediaElement object*

If `source` is specified, the media element (`<audio>` or `<video>`) referenced by the object will be connected to the analyzer.

You can later disconnect it by referring to the [`audioSource`](#audiosource-mediaelementaudiosourcenode-object) object.

At least one audio source is required for the analyzer to work. You can also connect audio sources with the [`connectAudio()`](#connectaudio-element-) method.

Object reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement

### `start` *boolean*

If `start: false` is specified, the analyzer will be created stopped. You can then start it with the [`toggleAnalyzer()`](#toggleanalyzer-boolean-) method.

Defaults to **true**, so the analyzer will start running right after initialization.


## Interface objects *(read only)*

### `analyzer` *AnalyserNode object*

Connect any additional audio sources to this object, so their output is displayed in the graphic analyzer.

Object reference: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode

### `audioCtx` *AudioContext object*

AudioContext used by audioMotion-analyzer. If not provided by the user in the [constructor](#constructor) options, it will be created automatically.

Use this object to create additional audio sources to be connected to the analyzer, like oscillator nodes, gain nodes and media streams.

The code fragment below creates an oscillator and a gain node using audioMotion's audioContext, and then connects them to the analyzer:

```js
const audioMotion = new AudioMotionAnalyzer( document.getElementById('container') ),
      audioCtx    = audioMotion.audioCtx,
      oscillator  = audioCtx.createOscillator(),
      gainNode    = audioCtx.createGain();

oscillator.frequency.setValueAtTime( 440, audioCtx.currentTime ); // play 440Hz tone
oscillator.connect( gainNode );

gainNode.gain.setValueAtTime( .5, audioCtx.currentTime );
gainNode.connect( audioMotion.analyzer );

oscillator.start();
```

Object reference: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext

### `audioSource` *MediaElementAudioSourceNode object*

Object representing the HTML media element connected using the [`source`](#source-htmlmediaelement-object) property in the [constructor](#constructor) options,
or, if that was not provided, **the first** media element connected via the [`connectAudio()`](#connectaudio-element-) method.

Object reference: https://developer.mozilla.org/en-US/docs/Web/API/MediaElementAudioSourceNode

### `canvas` *HTMLCanvasElement object*

Canvas element created by audioMotion.

Object reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement

### `canvasCtx` *CanvasRenderingContext2D object*

2D rendering context for drawing in audioMotion's canvas.

Object reference: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D


## Properties

### `barSpace` *number*

*Available since v2.0.0*

Customize the spacing between bars in [octave bands modes](#mode-number).

Use a value between 0 and 1 for spacing proportional to the bar width. Values >= 1 will be considered as a literal number of pixels.

For example, `barSpace = 0.5` will use half of the bar width for spacing, while `barSpace = 2` will set a fixed spacing of 2 pixels, independent of the width of bars.
Prefer proportional spacing to obtain consistent results among different resolutions and screen sizes.

`barSpace = 0` will effectively show contiguous bars, except when [`showLeds`](#showleds-boolean) is *true*, in which case a minimum spacing is enforced.

Defaults to **0.1**.

### `bgAlpha` *number*

*Available since v2.2.0*

Controls the opacity of the background, when [`overlay`](#overlay-boolean) and [`showBgColor`](#showbgcolor-boolean) are both set to *true*.

It must be a number between 0 (completely transparent) and 1 (completely opaque).

Defaults to **0.7**.

### `dataArray` *UInt8Array array* *(Read only)*

Data array updated by the analyzer's [`getByteFrequencyData()`](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData) method on every animation frame (ideally 60 times per second).

Array size is defined by `analyzer.frequencyBinCount` (which should be half the current [FFT size](#fftsize-number)), with element values ranging from 0 to 255.

Each array element represents a discrete value in the frequency domain, such that: *frequency = index * [audioCtx](#audioctx-audiocontext-object).sampleRate / fftSize*.

See also [`binToFreq()`](#bintofreq-bin-) and [`freqToBin()`](#freqtobin-frequency-rounding-) methods.

### `energy` *number* *(Read only)*

*Available since v2.4.0*

Returns a number between 0 and 1, representing the instant "energy" of the frequency spectrum. Updated on every animation frame.

The energy value is obtained by a simple average of the amplitudes of currently displayed frequency bands, and roughly represents how loud/busy the spectrum is at a given moment.

You can use this inside your callback function to create additional visual effects. For usage example see the [*onCanvasDraw* documentation](#oncanvasdraw-function).

See also [`peakEnergy`](#peakenergy-number-read-only).

### `fftSize` *number*

Number of samples used for the FFT performed by the analyzer node. It must be a power of 2 between 32 and 32768, so valid values are: 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, and 32768.

Higher values provide more detail in the frequency domain, but less detail in the time domain (slower response), so you may need to adjust [`smoothing`](#smoothing-number) accordingly.

Defaults to **8192**.

### `fillAlpha` *number*

*Available since v2.0.0*

Opacity of the area fill in **Line / Area graph** visualization ([`mode`](#mode-number) 10).

It must be a number between 0 (completely transparent) and 1 (completely opaque).

Please note that this affects only the area fill. The line (when [`lineWidth`](#linewidth-number) > 0) is always drawn at full opacity.

Defaults to **1**.

!> [See related known issue](#fillalpha-and-radial-mode-on-firefox)

### `fps` *number* *(Read only)*

Current frame rate.

### `fsHeight` *number* *(Read only)*
### `fsWidth` *number* *(Read only)*

Canvas dimensions used during fullscreen mode. These take the current pixel ratio into account and will change accordingly when [low-resolution mode](#lores-boolean) is set.

### `gradient` *string*

Currently selected color gradient used for analyzer graphics.

It must be the name of a built-in or [registered](#registergradient-name-options-) gradient. Built-in gradients are *'classic'*, *'prism'* and *'rainbow'*.

Defaults to **'classic'**.

### `height` *number*
### `width` *number*

Nominal dimensions of the analyzer.

If one or both of these are `undefined`, the analyzer will try to adjust to the container's width and/or height.
If the container's width and/or height are 0 (inline elements), a reference size of **640 x 270 pixels** will be used to replace the missing dimension(s).
This should be considered the minimum dimensions for proper visualization of all available modes with the [LED effect](#showleds-boolean) on.

You can set both values at once using the [`setCanvasSize()`](#setcanvassize-width-height-) method.

?> You can read the actual canvas dimensions at any time directly from the [`canvas`](#canvas-htmlcanvaselement-object) object.

### `isFullscreen` *boolean* *(Read only)*

*true* when the analyzer is being displayed in fullscreen, or *false* otherwise.

See [`toggleFullscreen()`](#togglefullscreen).

### `isOn` *boolean* *(Read only)*

*true* if the analyzer canvas animation is running, or *false* if it's stopped.

See [`toggleAnalyzer()`](#toggleanalyzer-boolean-).

### `lineWidth` *number*

*Available since v2.0.0*

Line width for the **Line / Area graph** visualization ([`mode`](#mode-number) 10).

For the line to be distinguishable, set also [`fillAlpha`](#fillalpha-number) < 1.

Defaults to **0**.

### `loRes` *boolean*

*true* for low resolution mode. Defaults to **false**.

Low resolution mode halves the effective pixel ratio, resulting in four times less pixels to render. This may improve performance significantly, especially in 4K+ monitors.

?> If you want to allow users to interactively toggle low resolution mode, you may need to set a fixed size for the canvas via CSS, like so:

```css
#container canvas {
    width: 100%;
}
```

This will prevent the canvas size from changing, when switching the low resolution mode on and off.

### `lumiBars` *boolean*

*Available since v1.1.0*

This is only effective for [visualization modes](#mode-number) 1 to 8 (octave bands).

When set to *true* all analyzer bars will be displayed at full height with varying luminance (opacity, actually) instead.

Defaults to **false**.

### `maxDecibels` *number*
### `minDecibels` *number*

Highest and lowest decibel values represented in the Y-axis of the analyzer. The loudest volume possible is **0**.

*maxDecibels* defaults to **-25** and *minDecibels* defaults to **-85**.

You can set both values at once using the [`setSensitivity()`](#setsensitivity-mindecibels-maxdecibels-) method.

For more info, see [AnalyserNode.minDecibels](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/minDecibels).

### `maxFreq` *number*
### `minFreq` *number*

Highest and lowest frequencies represented in the X-axis of the analyzer. Values in Hertz. *maxFreq* defaults to **22000** and *minFreq* defaults to **20**.

The minimum allowed value is **1**. Trying to set a lower value will throw an `ERR_FREQUENCY_TOO_LOW` [error](#custom-errors).

The maximum practical value is half the sampling rate ([`audioCtx.sampleRate`](#audioctx-audiocontext-object)), although this is not enforced by audioMotion-analyzer.

It is preferable to use the [`setFreqRange()`](#setfreqrange-minfreq-maxfreq-) method and set both values at once, to prevent `minFreq` being higher than the current `maxFreq` or vice-versa at a given moment.

### `mode` *number*

Current visualization mode.

+ **Discrete frequencies** mode provides the highest resolution, allowing you to visualize individual frequencies provided by the [FFT](https://en.wikipedia.org/wiki/Fast_Fourier_transform);
+ **Octave bands** modes display wider vertical bars, each one representing the *n*th part of an octave, based on a [24-tone equal tempered scale](https://en.wikipedia.org/wiki/Quarter_tone);
+ **Line / Area graph** mode uses the discrete frequencies data to draw a filled shape and/or a continuous line (see [`fillAlpha`](#fillalpha-number) and [`lineWidth`](#linewidth-number) properties).

mode | description | notes
------:|:-------------:|------
0 | Discrete frequencies |
1 | 1/24th octave bands |
2 | 1/12th octave bands |
3 | 1/8th octave bands |
4 | 1/6th octave bands |
5 | 1/4th octave bands |
6 | 1/3rd octave bands |
7 | Half octave bands |
8 | Full octave bands |
9 | *(not valid)* | *reserved*
10 | Line / Area graph | *added in v1.1.0*

Defaults to **0**.

### `radial` *boolean*

*Available since v2.4.0*

When *true*, the spectrum analyzer is rendered as a circle, with radial frequency bars spreading from the center of the canvas.

When radial mode is active, [`lumiBars`](#lumibars-boolean) and [`showLeds`](#showleds-boolean) have no effect, and
also [`showPeaks`](#showpeaks-boolean) has no effect in **Line / Area graph** mode.

See also [`spinSpeed`](#spinspeed-number).

Defaults to **false**.

!> [See related known issue](#fillalpha-and-radial-mode-on-firefox)

### `overlay` *boolean*

*Available since v2.2.0*

Allows the analyzer to be displayed over other content, by making the canvas background transparent, when set to *true*.

When [`showBgColor`](#showbgcolor-boolean) is also *true*, [`bgAlpha`](#bgalpha-number) controls the background opacity.

Defaults to **false**.

### `peakEnergy` *number* *(Read only)*

*Available since v2.4.0*

Returns a number between 0 and 1, representing the peak [energy](#energy-number-read-only) value of the last 30 frames (approximately 0.5s). Updated on every animation frame.

### `pixelRatio` *number* *(Read only)*

Current [devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio).
This is usually **1** for standard displays and **2** for retina / Hi-DPI screens.

You can refer to this value to adjust any additional drawings done in the canvas (via [callback function](#oncanvasdraw-function)).

When [`loRes`](#lores-boolean) is *true* `pixelRatio` is halved, i.e. **0.5** for standard displays and **1** for retina / Hi-DPI.

### `reflexAlpha` *number*

*Available since v2.1.0*

Reflection opacity (when [`reflexRatio`](#reflexratio-number) > 0).

It must be a number between 0 (completely transparent) and 1 (completely opaque).

Defaults to **0.15**.

### `reflexBright` *number*

*Available since v2.3.0*

Reflection brightness (when [`reflexRatio`](#reflexratio-number) > 0).

It must be a number. Values below 1 darken the reflection and above 1 make it brighter.
A value of 0 will render the reflected image completely black, while a value of 1 will preserve the original brightness.

Defaults to **1**.

!> [See related known issue](#reflexbright-wont-work-on-some-browsers)

### `reflexFit` *boolean*

*Available since v2.1.0*

When *true*, the reflection will be adjusted (stretched or shrinked) to fit the canvas. If set to *false* the reflected image may be cut at the bottom (when [`reflexRatio`](#reflexratio-number) < 0.5) or not fill the entire canvas (when [`reflexRatio`](#reflexratio-number) > 0.5).

Defaults to **true**.

### `reflexRatio` *number*

*Available since v2.1.0*

Percentage of canvas height used for reflection. It must be a number greater than or equal to 0, and less than 1. Trying to set a value out of this range will throw an `ERR_REFLEX_OUT_OF_RANGE` [error](#custom-errors).

For a perfect mirrored effect, set `reflexRatio` to 0.5 and both [`reflexAlpha`](#reflexalpha-number) and [`reflexBright`](#reflexbright-number) to 1.

This has no effect when [`lumiBars`](#lumibars-boolean) is *true*.

Defaults to **0** (no reflection).

### `showBgColor` *boolean*

Determines whether the canvas background should be painted.

If ***true***, the background color defined by the current gradient will be used.
Opacity can be adjusted via [`bgAlpha`](#bgalpha-number) property, when [`overlay`](#overlay-boolean) is ***true***.

If ***false***, the canvas background will be painted black when [`overlay`](#overlay-boolean) is ***false***,
or transparent when [`overlay`](#overlay-boolean) is ***true***.

?> Please note that when [`overlay`](#overlay-boolean) is ***false*** and [`showLeds`](#showleds-boolean) is ***true***, the background color will always be black
and setting `showBgColor` to ***true*** will make the "unlit" LEDs visible instead.

Defaults to **true**.

### `showFPS` *boolean*

*true* to display the current frame rate. Defaults to **false**.

### `showLeds` *boolean*

*true* to activate LED display effect. Only effective for [visualization modes](#mode-number) 1 to 8 (octave bands). Defaults to **false**.

### `showPeaks` *boolean*

*true* to show amplitude peaks for each frequency. Defaults to **true**.

### `showScale` *boolean*

*true* to display the frequency (Hz) scale on the X axis. Defaults to **true**.

### `showScaleY` *boolean*

*Available since v2.4.0*

*true* to display the level (dB) scale on the Y axis. Defaults to **false**.

This option has no effect when [`radial`](#radial-boolean) or [`lumiBars`](#lumibars-boolean) are set to *true*.

### `smoothing` *number*

Sets the analyzer's [smoothingTimeConstant](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/smoothingTimeConstant).

It must be a number between 0 and 1. Lower values make the analyzer respond faster to changes.

Defaults to **0.5**.

### `spinSpeed` *number*

*Available since v2.4.0*

When [`radial`](#radial-boolean) is *true*, this property defines the analyzer rotation speed, in revolutions per minute.

Positive values will make the analyzer rotate clockwise, while negative values will make it rotate counterclockwise. A value of 0 results in no rotation.

Defaults to **0**.

### `version` *string* *(Read only)*

*Available since v2.0.0*

Returns the version of the **audioMotion-analyzer** package.


## Callback functions

### `onCanvasDraw` *function*

If defined, this function will be called after rendering each frame.

The audioMotion object will be passed as an argument to the callback function.

Canvas properties `fillStyle` and `strokeStyle` will be set to the current gradient when the function is called.

Usage example:

```js
const audioMotion = new AudioMotionAnalyzer(
    document.getElementById('container'),
    {
        source: document.getElementById('audio'),
        onCanvasDraw: drawCallback
    }
);

function drawCallback( instance ) {
	const ctx      = instance.canvasCtx,
    	  baseSize = ( instance.isFullscreen ? 40 : 20 ) * instance.pixelRatio;

    // use the 'energy' value to increase the font size and make the logo pulse to the beat
    ctx.font = `${ baseSize + instance.energy * 25 * instance.pixelRatio }px Orbitron, sans-serif`;

    ctx.fillStyle = '#fff8';
    ctx.textAlign = 'center';
    ctx.fillText( 'audioMotion', instance.canvas.width - baseSize * 8, baseSize * 2 );
}
```

For more examples, see the fluid demo [source code](https://github.com/hvianna/audioMotion-analyzer/blob/master/demo/src/fluid.js#L221).

### `onCanvasResize` *function*

If defined, this function will be called whenever the canvas is resized.

Two arguments are passed: a string with the reason why the function was called (see below) and the audioMotion object.

Reason | Description
-------|------------
`'create'` | canvas created by the audioMotion-analyzer [constructor](#constructor)
`'fschange'` | analyzer entered or left fullscreen mode
`'lores'` | [low resolution option](#lores-boolean) toggled on or off
`'resize'` | browser window or canvas container element were resized
`'user'` | canvas dimensions changed by user script, via [`height`](#height-number) and [`width`](#width-number) properties, [`setCanvasSize()`](#setcanvassize-width-height-) or [`setOptions()`](#setoptions-options-) methods

?> As of [version 2.5.0](https://github.com/hvianna/audioMotion-analyzer/releases/tag/2.5.0), a callback is triggered only when canvas dimensions *effectively* change
from the previous state, and the `'resize'` reason is no longer sent on fullscreen changes (except on Safari, see below).

!> On **Safari**, fullscreen changes will be reported as `'resize'` to the callback and `'fschange'` will never be issued, due to lack of support for the [*fullscreenchange* event](https://developer.mozilla.org/en-US/docs/Web/API/Element/fullscreenchange_event).

Usage example:

```js
const audioMotion = new AudioMotionAnalyzer(
    document.getElementById('container'),
    {
        source: document.getElementById('audio'),
        onCanvasResize: ( reason, instance ) => {
            console.log( `[${reason}] canvas size is: ${instance.canvas.width} x ${instance.canvas.height}` );
        }
    }
);
```

## Methods

### `binToFreq( bin )`

*Available since v2.3.0*

Returns the frequency (in hertz) represented by a given FFT bin (a [`dataArray`](#dataarray-uint8array-array-read-only) index).

`bin` must be a **number** equal or greater than 0 and less than `analyzer.frequencyBinCount` (the same as `dataArray.length`).

### `connectAudio( element )`

Connects an [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement) (`<audio>` or `<video>` HTML element) to the analyzer.

Returns a [MediaElementAudioSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/MediaElementAudioSourceNode) which can be used for later disconnection.

For connecting other audio sources, like oscillators and streams, use the [`audioCtx`](#audioctx-audiocontext-object) and [`analyzer`](#analyzer-analysernode-object) objects.

### `freqToBin( frequency, [rounding] )`

*Available since v2.3.0*

Returns the [`dataArray`](#dataarray-uint8array-array-read-only) index which more closely corresponds to a given frequency.

`frequency` must be a **number** equal or greater than zero, representing a frequency in hertz.

`rounding` is an optional **string** indicating the method to be used for rounding the index value to an integer.
Valid options are `'floor'`, `'round'` (default) and `'ceil'`.

See [Math static methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math#Static_methods).

Please note that the returned value will cap at the highest valid index (`analyzer.frequencyBinCount - 1`) for any frequency higher
than **half** the current sampling rate (`audioCtx.sampleRate`).

### `registerGradient( name, options )`

Registers a custom color gradient.

`name` must be a non-empty *string* that will be used when setting the [`gradient`](#gradient-string) property. `options` must be an object as shown below:

```js
const options = {
    bgColor: '#011a35', // background color (optional) - defaults to '#111'
    dir: 'h',           // add this property to create a horizontal gradient (optional)
    colorStops: [       // list your gradient colors in this array (at least 2 entries are required)
        'red',                      // colors may be defined in any valid CSS format
        { pos: .6, color: '#ff0' }, // use an object to adjust the position (0 to 1) of a color
        'hsl( 120, 100%, 50% )'     // colors may be defined in any valid CSS format
    ]
}

audioMotion.registerGradient( 'my-grad', options );
```

Additional information about [gradient color-stops](https://developer.mozilla.org/en-US/docs/Web/API/CanvasGradient/addColorStop).

### `setCanvasSize( width, height )`

Sets the analyzer nominal dimensions in pixels. See [`height`](#height-number) and [`width`](#width-number) properties for details.

### `setFreqRange( minFreq, maxFreq )`

Sets the desired frequency range. Values are expressed in Hz (Hertz).

### `setOptions( [options] )`

Shorthand method for setting several options at once.

`options` should be an object as defined in the class [constructor](#options), except for the `audioCtx` and `source` properties.

**If called with no argument (or `options` is *undefined*), resets all configuration options to their default values.**

### `setSensitivity( minDecibels, maxDecibels )`

Adjust the analyzer's sensitivity. See [`maxDecibels`](#maxdecibels-number) and [`minDecibels`](#mindecibels-number) properties.

### `toggleAnalyzer( [boolean] )`

Starts (*true*) or stops (*false*) the analyzer animation. If no argument provided, inverts the current status.

Returns the resulting status.

The analyzer is started by default after initialization, unless you specify [`start: false`](#start-boolean) in the [constructor](#constructor) options.

### `toggleFullscreen()`

Toggles fullscreen mode on / off.

Please note that fullscreen requests must be triggered by user action, like a key press or mouse click,
so you must call this method from within a user-generated event handler.

Also, if you're displaying the analyzer over other content in [overlay](#overlay-boolean) mode,
you'll probably want to handle fullscreen on the container element instead, using your own code.
See the [overlay demo](/demo/overlay.html) for an example.

## Custom Errors

*Available since v2.0.0*

audioMotion-analyzer uses a custom error object to throw errors for some critical operations.

The `code` property is a string label that can be checked to identify the specific error in a reliable way.

code                       | Error description
---------------------------|--------------------
ERR_AUDIO_CONTEXT_FAIL     | Could not create audio context. The user agent may lack support for the Web Audio API.
ERR_INVALID_AUDIO_CONTEXT  | [Audio context](#audioctx-audiocontext-object) provided by user is not valid.
ERR_INVALID_MODE           | User tried to set the visualization [`mode`](#mode-number) to an invalid value.
ERR_FREQUENCY_TOO_LOW      | User tried to set the [`minFreq`](#minfreq-number) or [`maxFreq`](#maxfreq-number) properties to a value lower than 1.
ERR_GRADIENT_INVALID_NAME  | The `name` parameter for [`registerGradient()`](#registergradient-name-options-) must be a non-empty string.
ERR_GRADIENT_NOT_AN_OBJECT | The `options` parameter for [`registerGradient()`](#registergradient-name-options-) must be an object.
ERR_GRADIENT_MISSING_COLOR | The `options` parameter for [`registerGradient()`](#registergradient-name-options-) must define at least two color-stops.
ERR_REFLEX_OUT_OF_RANGE    | Tried to assign a value < 0 or >= 1 to [`reflexRatio`](#reflexratio-number) property.
ERR_UNKNOWN_GRADIENT       | User tried to [select a gradient](#gradient-string) not previously registered.

## Known Issues

### reflexBright won't work on some browsers {docsify-ignore}

[`reflexBright`](#reflexbright-number) feature relies on the [`filter`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter) property of the Canvas API,
which is [currently not supported in some browsers](https://caniuse.com/#feat=mdn-api_canvasrenderingcontext2d_filter) (notably, Opera and Safari).

### fillAlpha and radial mode on Firefox {docsify-ignore}

On Firefox, [`fillAlpha`](#fillalpha-number) may not work properly for [`radial`](#radial-boolean) visualization, due to [this bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1164912).

## References and acknowledgments

* Thanks to [Yuji Koike](http://www.ykcircus.com) for his awesome [Soniq Viewer for iOS](https://itunes.apple.com/us/app/soniq-viewer/id448343005), which inspired me to create **audioMotion**
* [HTML Canvas Reference @W3Schools](https://www.w3schools.com/tags/ref_canvas.asp)
* [Web Audio API documentation @MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
* [What does the FFT data in the Web Audio API correspond to?](https://stackoverflow.com/a/14789992/2370385)
* [Equations for equal-tempered scale frequencies](http://pages.mtu.edu/~suits/NoteFreqCalcs.html)
* [Making Audio Reactive Visuals](https://www.airtightinteractive.com/2013/10/making-audio-reactive-visuals/)
* The font used in audioMotion's logo is [Orbitron](https://fonts.google.com/specimen/Orbitron) by Matt McInerney
* This documentation website is powered by [GitHub Pages](https://pages.github.com/), [docsify](https://docsify.js.org/) and [docsify-themeable](https://jhildenbiddle.github.io/docsify-themeable).

## Changelog

See [Changelog.md](Changelog.md)

## Get in touch!

If you create something cool with this project, or simply think it's useful, I would like to know! Please drop me an e-mail at hvianna@gmail.com

If you have a feature request or code suggestion, please see [CONTRIBUTING.md](CONTRIBUTING.md)

And if you're feeling generous you can [buy me a coffee on Ko-fi](https://ko-fi.com/Q5Q6157GZ) :grin::coffee:

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Q5Q6157GZ)

## License

audioMotion-analyzer copyright (c) 2018-2020 [Henrique Avila Vianna](https://henriquevianna.com)<br>
Licensed under the [GNU Affero General Public License, version 3 or later](https://www.gnu.org/licenses/agpl.html).
