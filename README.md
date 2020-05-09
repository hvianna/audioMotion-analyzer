
## About

I originally wrote this as part of my [audioMotion](https://audiomotion.me) spectrum analyzer and music player.

This package provides only the graphic spectrum analyzer, as a standalone module, for you to use in your own JavaScript projects.

## Online demo

[![demo-animation](demo/demo.gif)](https://audiomotion.dev/demo/)

?> https://audiomotion.dev/demo/

## Features

+ High-resolution (retina / HiDPI ready) real-time audio spectrum analyzer with fullscreen support
+ Logarithmic frequency scale with customizable range
+ 10 visualization modes: choose between discrete frequencies or octave bands based on the equal tempered scale
+ Optional vintage LED effect and variable luminance bars for octave bands modes
+ Optional customizable reflection effect
+ Customizable Web Audio API parameters: FFT size, sensitivity and time-smoothing constant
+ Comes with 3 predefined color gradients - easily add your own!
+ No dependencies, less than 20kB minified

## Usage

Install with npm:

```console
$ npm install audiomotion-analyzer
```

ES6 import:

```js
import AudioMotionAnalyzer from 'audiomotion-analyzer';
```

Minimal constructor:

```js
const audioMotion = new AudioMotionAnalyzer(
	document.getElementById('container'),
	{
		source: document.getElementById('audio')
	}
);
```

This will insert the analyzer canvas inside the *#container* element and start the visualization of audio coming from the *#audio* element.

## Constructor

`new AudioMotionAnalyzer( [container], [{options}] )`

Creates a new instance of audioMotion-analyzer. A canvas element will be created and inserted into the `container` element. If `container` is undefined, the canvas is appended to the document's body.

Available options with default values shown inside parentheses:

options = {<br>
&emsp;&emsp;[audioCtx](#audioctx-audiocontext-object): *AudioContext object*,<br>
&emsp;&emsp;[barSpace](#barspace-number): *number* (2),<br>
&emsp;&emsp;[fftSize](#fftsize-number): *number* (8192),<br>
&emsp;&emsp;[fillAlpha](#fillalpha-number): *number* (1),<br>
&emsp;&emsp;[gradient](#gradient-string): *string* ('classic'),<br>
&emsp;&emsp;[height](#height-number): *number*,<br>
&emsp;&emsp;[lineWidth](#linewidth-number): *number* (0),<br>
&emsp;&emsp;[loRes](#lores-boolean): *boolean* (false),<br>
&emsp;&emsp;[lumiBars](#lumibars-boolean): *boolean* (false),<br>
&emsp;&emsp;[maxDecibels](#maxdecibels-number): *number* (-25),<br>
&emsp;&emsp;[maxFreq](#maxfreq-number): *number* (22000),<br>
&emsp;&emsp;[minDecibels](#mindecibels-number): *number* (-85),<br>
&emsp;&emsp;[minFreq](#minfreq-number): *number* (20),<br>
&emsp;&emsp;[mode](#mode-number): *number* (0),<br>
&emsp;&emsp;[onCanvasDraw](#oncanvasdraw-function): *function*,<br>
&emsp;&emsp;[onCanvasResize](#oncanvasresize-function): *function*,<br>
&emsp;&emsp;[reflexAlpha](#reflexalpha-number): *number* (0.15),<br>
&emsp;&emsp;[reflexFit](#reflexfit-boolean): *boolean* (true),<br>
&emsp;&emsp;[reflexRatio](#reflexratio-number): *number* (0),<br>
&emsp;&emsp;[showBgColor](#showbgcolor-boolean): *boolean* (true),<br>
&emsp;&emsp;[showFPS](#showfps-boolean): *boolean* (false),<br>
&emsp;&emsp;[showLeds](#showleds-boolean): *boolean* (false),<br>
&emsp;&emsp;[showPeaks](#showpeaks-boolean): *boolean* (true),<br>
&emsp;&emsp;[showScale](#showscale-boolean): *boolean* (true),<br>
&emsp;&emsp;[smoothing](#smoothing-number): *number* (0.5),<br>
&emsp;&emsp;**source**: *HTMLMediaElement*,<br>
&emsp;&emsp;**start**: *boolean* (true),<br>
&emsp;&emsp;[width](#width-number): *number*<br>
}

`audioCtx` allows you to provide an external AudioContext object, but you usually don't need to specify this, as audioMotion-analyzer will create its own.

If `source` is specified, the provided media element will be connected to the analyzer. You can later disconnect it by referring to the [`audioSource`](#audiosource-mediaelementaudiosourcenode-object) object.

At least one audio source is required for the analyzer to work. You can also connect audio sources with the [`connectAudio()`](#connectaudio-element-) method.

If `start: false` is specified, the analyzer will be created stopped. You can then start it with the [`toggleAnalyzer()`](#toggleanalyzer-boolean-) method.


## Interface objects

### `analyzer` *AnalyserNode object*

Connect any additional audio sources to this object, so their output is displayed in the graphic analyzer.

Reference: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode

### `audioCtx` *AudioContext object*

AudioContext object created by audioMotion-analyzer or provided by the user in the [constructor](#constructor) options.

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

Reference: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext

### `audioSource` *MediaElementAudioSourceNode object*

Object representing the HTML media element connected using the `source` property in the class [constructor](#constructor) options. See also the [`connectAudio()`](#connectaudio-element-) method.

Reference: https://developer.mozilla.org/en-US/docs/Web/API/MediaElementAudioSourceNode

### `canvas` *HTMLCanvasElement object*

Canvas element created by audioMotion.

Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement

### `canvasCtx` *CanvasRenderingContext2D object*

2D rendering context for drawing in audioMotion's canvas.

Reference: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D


## Properties

### `barSpace` *number*

*Available since v2.0.0*

Customize the spacing between bars in [octave bands modes](#mode-number).

Use a value between 0 and 1 for spacing proportional to the bar width. Values >= 1 will be considered as a literal number of pixels.

For example, `barSpace = 0.5` will use half of the bar width for spacing, while `barSpace = 2` will set a fixed spacing of 2 pixels, independent of the width of bars.
Prefer proportional spacing to obtain consistent results among different resolutions and screen sizes.

`barSpace = 0` will effectively show contiguous bars, except when the [LED effect](#showleds-boolean) is on, in which case a minimum spacing is enforced.

Defaults to **0.1**.

### `dataArray` *UInt8Array array* *(Read only)*

Data array returned by the analyzer's [`getByteFrequencyData()`](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData).
Array size is half the current FFT size, with element values ranging from 0 to 255.

Each array element represents a specific value in the frequency domain, such that: `frequency = i * audioCtx.sampleRate / fftSize`, where *i* is the array index.

The data is updated on every animation frame (ideally 60 times per second).

### `fftSize` *number*

Number of samples used for the FFT performed by the analyzer node. It must be a power of 2 between 32 and 32768, so valid values are: 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, and 32768.

Higher values provide more detail in the frequency domain, but less detail in the time domain. Defaults to **8192**.

### `fillAlpha` *number*

*Available since v2.0.0*

Opacity for the **Line / Area graph** mode. Must be a float between 0 (completely transparent) and 1 (completely opaque).

Defaults to **1**.

See also [`lineWidth`](#linewidth-number).

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

### `isOn` *boolean* *(Read only)*

*true* if the analyzer canvas animation is running, or *false* if it's stopped.

### `lineWidth` *number*

*Available since v2.0.0*

Line width for the **Line / Area graph** mode.

Defaults to **0**. For the line to be distinguishable, set also [`fillAlpha`](#fillalpha-number) < 1.

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

*true* to always display full-height bars and vary their luminance instead. Only effective for [visualization modes](#mode-number) 1 to 8 (octave bands). Defaults to **false**.

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

Valid values are:

Value | Mode | Available since
------|------|----------------
0 | Discrete frequencies | v1.0.0
1 | 1/24th octave bands | v1.0.0
2 | 1/12th octave bands | v1.0.0
3 | 1/8th octave bands | v1.0.0
4 | 1/6th octave bands | v1.0.0
5 | 1/4th octave bands | v1.0.0
6 | 1/3rd octave bands | v1.0.0
7 | half octave bands | v1.0.0
8 | full octave bands | v1.0.0
9 | *reserved* (not valid) | -
10 | Line / Area graph | v1.1.0

Defaults to **0**.

### `pixelRatio` *number* *(Read only)*

Current [devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio).
This is usually **1** for standard displays and **2** for retina / Hi-DPI screens.

You can refer to this value to adjust any additional drawings done in the canvas (via [callback function](#oncanvasdraw-function)).

When [low-resolution mode](#lores-boolean) is active *pixelRatio* is halved, i.e. **0.5** for standard displays and **1** for retina / Hi-DPI.

### `reflexAlpha` *number*

*Available since v2.1.0*

Reflection opacity (when [`reflexRatio`](#reflexratio-number) > 0).

Must be a float between 0 (completely transparent) and 1 (completely opaque).

Defaults to **0.15**.

### `reflexFit` *boolean*

*Available since v2.1.0*

When *true* the reflection will be adjusted (stretched or shrinked) to fit the canvas. If set to *false* the reflected image may be cut at the bottom (when [`reflexRatio`](#reflexratio-number) < 0.5) or not fill the entire canvas (when [`reflexRatio`](#reflexratio-number) > 0.5).

Defaults to **true**.

### `reflexRatio` *number*

*Available since v2.1.0*

Percentage of canvas height used for reflection. Must be a float greater than or equal to 0, and less than 1. Trying to set a value out of this range will throw an `ERR_REFLEX_OUT_OF_RANGE` [error](#custom-errors).

For a perfect mirrored effect, set `reflexRatio` to 0.5 and [`reflexAlpha`](#reflexalpha-number) to 1.

This has no effect when [`lumiBars`](#lumibars-boolean) is active.

Defaults to **0** (no reflection).

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

Sets the analyzer's [smoothingTimeConstant](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/smoothingTimeConstant).

Its value must be a float between 0 and 1. Lower values make the analyzer respond faster to changes.

Defaults to **0.5**.

### `version` *string* *(Read only)*

*Available since v2.0.0*

Returns the version of the **audioMotion-analyzer** package.


## Callback functions

### `onCanvasDraw` *function*

If defined, this function will be called after rendering each frame.

The audioMotion object will be passed as an argument to the callback function.

Example usage:

```js
const audioMotion = new AudioMotionAnalyzer(
    document.getElementById('container'),
    {
        source: document.getElementById('audio'),
        onCanvasDraw: displayCanvasMsg
    }
);

function displayCanvasMsg( instance ) {
    let size = 20 * instance.pixelRatio;
    if ( instance.isFullscreen )
        size *= 2;

    // find the data array index for 140Hz
    const idx = Math.round( 140 * instance.analyzer.fftSize / instance.audioCtx.sampleRate );

    // use the 140Hz amplitude to increase the font size and make the logo pulse to the beat
    instance.canvasCtx.font = `${size + instance.dataArray[ idx ] / 16 * instance.pixelRatio}px Orbitron,sans-serif`;

    instance.canvasCtx.fillStyle = '#fff8';
    instance.canvasCtx.textAlign = 'center';
    instance.canvasCtx.fillText( 'audioMotion', instance.canvas.width - size * 8, size * 2 );
}
```

### `onCanvasResize` *function*

If defined, this function will be called whenever the canvas is resized.

Two arguments are passed: a string with the reason why the function was called (see below) and the audioMotion object.

Reason | Description
-------|------------
`'create'` | canvas created by the class constructor
`'fschange'` | analyzer entered or left fullscreen mode
`'lores'` | low resolution mode toggled on or off
`'resize'` | browser window resized (only when [`width`](#width-number) and/or [`height`](#height-number) are undefined)
`'user'` | canvas dimensions changed by user script, via [`height`](#height-number) and [`width`](#width-number) properties, [`setCanvasSize()`](#setcanvassize-width-height-) or [`setOptions()`](#setoptions-options-) methods

Example usage:

```js
const audioMotion = new AudioMotionAnalyzer(
    document.getElementById('container'),
    {
        source: document.getElementById('audio'),
        onCanvasResize: ( reason, instance ) => {
            console.log( `[${reason}] set: ${instance.width} x ${instance.height} | actual: ${instance.canvas.width} x ${instance.canvas.height}` );
        }
    }
);
````

## Methods

### `connectAudio( element )`

Connects an [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement) (`<audio>` or `<video>` HTML element) to the analyzer.

Returns a [MediaElementAudioSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/MediaElementAudioSourceNode) which can be used for later disconnection.

For connecting other audio sources, like oscillators and streams, use the [`audioCtx`](#audioctx-audiocontext-object) and [`analyzer`](#analyzer-analysernode-object) objects.

### `registerGradient( name, options )`

Registers a custom color gradient.

`name` must be a non-empty *string* that will be used when setting the [`gradient`](#gradient-string) property. `options` must be an object as shown below:

```js
const options = {
    bgColor: '#111', // background color (required)
    dir: 'h',        // add this to create a horizontal gradient (optional)
    colorStops: [    // list your gradient colors in this array (at least 2 entries are required)
        'red',                      // colors may be defined in any CSS valid format
        { pos: .6, color: '#ff0' }, // use an object to adjust the position (0 to 1) of a color
        'hsl( 120, 100%, 50% )'     // colors may be defined in any CSS valid format
    ]
}

audioMotion.registerGradient( 'my-grad', options );
```

Additional information about [gradient color-stops](https://developer.mozilla.org/en-US/docs/Web/API/CanvasGradient/addColorStop).

### `setCanvasSize( width, height )`

Sets the analyzer nominal dimensions in pixels. See [`height`](#height-number) and [`width`](#width-number) properties for details.

### `setFreqRange( minFreq, maxFreq )`

Sets the desired frequency range. Values are expressed in Hz (Hertz).

### `setOptions( {options} )`

Shorthand method for setting several options at once.

`options` is an object with the same structure used in the class [constructor](#constructor), except for the `audioCtx` and `source` options which are only available at construction time.

### `setSensitivity( minDecibels, maxDecibels )`

Adjust the analyzer's sensitivity. See [`maxDecibels`](#maxdecibels-number) and [`minDecibels`](#mindecibels-number) properties.

### `toggleAnalyzer( [boolean] )`

Starts (*true*) or stops (*false*) the analyzer animation. If no argument provided, inverts the current status. Returns the resulting status.
The analyzer is started by default upon [object construction](#constructor), unless you specify `start: false` in the options.

### `toggleFullscreen()`

Toggles fullscreen mode. As per [API specification](https://fullscreen.spec.whatwg.org/), fullscreen requests must be triggered by user activation, so you must call this function from within an event handler or otherwise the request will be denied.


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

## Changelog

See [Changelog.md](Changelog.md)

## Acknowledgments

* Thanks to [Yuji Koike](http://www.ykcircus.com) for his awesome [Soniq Viewer for iOS](https://itunes.apple.com/us/app/soniq-viewer/id448343005), which inspired me to create **audioMotion**
* [HTML Canvas Reference @W3Schools](https://www.w3schools.com/tags/ref_canvas.asp)
* [Web Audio API documentation @MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
* [What does the FFT data in the Web Audio API correspond to?](https://stackoverflow.com/a/14789992/2370385)
* [Equations for equal-tempered scale frequencies](http://pages.mtu.edu/~suits/NoteFreqCalcs.html)
* The font used in audioMotion's logo is [Orbitron](https://fonts.google.com/specimen/Orbitron) designed by Matt McInerney
* This documentation website is powered by [GitHub Pages](https://pages.github.com/), [docsify](https://docsify.js.org/) and [docsify-themeable](https://jhildenbiddle.github.io/docsify-themeable).

## Donate

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Q5Q6157GZ)

## License

audioMotion-analyzer copyright (c) 2018-2020 [Henrique Avila Vianna](https://henriquevianna.com)<br>
Licensed under the [GNU Affero General Public License, version 3 or later](https://www.gnu.org/licenses/agpl.html).
