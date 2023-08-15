Changelog
=========

## version 4.1.1 (2023-08-14)

+ Fix a rendering bug when `roundBars` is combined with `mirror` and `radial`;
+ Add a polyfill for `Array.findLastIndex()` to restore compatibility with not-so-recent browsers.


## version 4.1.0 (2023-07-30)

### Added: <!-- {docsify-ignore} -->

+ [`colorMode`](README.md#colormode-string) - additional options for coloring analyzer bars: by bar amplitude (level) or bar position (index);
+ [`roundBars`](README.md#roundbars-boolean) - rounded corner analyzer bars;
+ [`isRoundBars`](README.md#isroundbars-boolean-read-only) read-only property;
+ [`trueLeds`](README.md#trueleds-boolean) - your LED bars now more vintage than ever!
+ New `level` property for [registered gradients](README.md#registergradient-name-options-)

### Fixed: <!-- {docsify-ignore} -->

+ Avoid drawing the Y-axis scale and unlit LEDs twice, in 'dual-combined' channel layout.

### Improved: <!-- {docsify-ignore} -->

+ Improved frequency scales labeling (especially for `noteLabels`) - label sizes were slightly reduced in fullscreen;
+ Code cleanup and optimizations.


## version 4.0.0 (2023-03-26)

### 🚨 BREAKING CHANGES: <!-- {docsify-ignore} -->

+ Removed deprecated properties:
  + ~`energy`~ - use [`getEnergy()`](README.md#getenergy-preset-startfreq-endfreq-) instead
  + ~`isLedDisplay`~ - use [`isLedBars`](README.md#isledbars-boolean-read-only) instead
  + ~`peakEnergy`~ - use [`getEnergy('peak')`](README.md#getenergy-preset-startfreq-endfreq-) instead
  + ~`showLeds`~ - use [`ledBars`](README.md#ledbars-boolean) instead

+ [`getBars()`](README.md#getbars) now includes an additional `freq` property for each element, representing the center frequency of the band.
In addition, the range of each band has been adjusted so that frequencies that were previously at the lower edge (`freqLo`) are now located at the center of the band.

+ **`stereo` has been DEPRECATED** and will be removed in version 5 - use [`channelLayout`](README.md#channellayout-string) instead.

### Added: <!-- {docsify-ignore} -->

+ [`ansiBands`](README.md#ansibands-boolean) - use ANSI/IEC preferred frequencies for the octave bands;
+ [`channelLayout`](README.md#channellayout-string) - adds option for dual channel combined spectrum, with both channel graphs overlaid;
+ [`frequencyScale`](README.md#frequencyscale-string) - adds linear and perceptual (Bark/Mel) frequency scales;
+ [`gradientLeft`](README.md#gradientleft-string) and [`gradientRight`](README.md#gradientright-string) - allow to select different gradients for each channel;
+ [`isBandsMode`](README.md#isbandsmode-boolean-read-only) read-only property;
+ [`linearAmplitude`](README.md#linearamplitude-boolean) - use linear values instead of dB for spectrum amplitudes;
+ [`linearBoost`](README.md#linearboost-number) - amplify low energy values when using linear amplitude;
+ [`noteLabels`](README.md#notelabels-boolean) - display musical note labels instead of frequency values on the X-axis;
+ [`weightingFilter`](README.md#weightingfilter-string) - select from five different weighting filters for improved spectrum visualization;
+ Two new built-in [gradients](README.md#gradient-string): _orangered_ and _steelblue_.

Thank you **@jonathan-annett** [(#28)](https://github.com/hvianna/audioMotion.js/issues/28) and **@TF3RDL** ([#30](https://github.com/hvianna/audioMotion-analyzer/issues/30) and [#38](https://github.com/hvianna/audioMotion-analyzer/issues/38))
for the suggestions that led to the implementation of several of these new features.

### Fixed: <!-- {docsify-ignore} -->

+ LED peaks showing below zero level when `reflexRatio` > 0.

### Changed and improved: <!-- {docsify-ignore} -->

+ Optimized generation of octave bands, with more accurate ranges and center frequencies;
+ Frequency labels on the X-axis now show different values depending on the value of [`ansiBands`](README.md#ansibands-boolean), to properly match the bands' center frequencies;
+ The [`onCanvasDraw`](README.md#oncanvasdraw-function) callback is now passed an additional object with timestamp and gradients information;
+ The _prism_ and _rainbow_ gradients were recreated using the beautiful [12-bit rainbow palette](https://iamkate.com/data/12-bit-rainbow/) by Kate Morley - If you need the old colors [check this post](https://github.com/hvianna/audioMotion-analyzer/discussions/44);
+ Custom gradients can now register a single color;
+ [`splitGradient`](README.md#splitgradient-boolean) now works for horizontal gradients in [`radial`](README.md#radial-boolean) visualization;
+ [`maxFreq`](README.md#maxfreq-number) is now capped to half the AudioContext's sample rate (Nyquist frequency);
+ Export additional types and interfaces in the TypeScript definition file;
+ Code optimizations, minor fixes and clean-up;
+ Revised and improved demos and documentation.


## version 3.6.1 (2022-12-09)

+ Minor update to fix wrong property names in the `LedParameters` interface in the TS definition file;
+ Improved documentation of [`registerGradient()`](README.md#registergradient-name-options-) usage in TypeScript projects [(#37)](https://github.com/hvianna/audioMotion-analyzer/issues/37).


## version 3.6.0 (2021-10-10)

### Added: <!-- {docsify-ignore} -->

+ [`alphaBars`](README.md#alphabars-boolean) effect, which is similar to `lumiBars` but preserves bars' amplitudes and also works on discrete frequencies mode and radial visualization;
+ [`outlineBars`](README.md#outlinebars-boolean) effect, which extends the usage of `lineWidth` and `fillAlpha` to octave bands modes;
+ [`isAlphaBars`](README.md#isalphabars-boolean-read-only) and [`isOutlineBars`](README.md#isoutlinebars-boolean-read-only) read-only properties.

### Changed: <!-- {docsify-ignore} -->

+ `showLeds` and `isLedDisplay` **have been deprecated** in favor of [`ledBars`](README.md#ledbars-boolean) and [`isLedBars`](README.md#isledbars-boolean-read-only), for consistent naming of effects.

### Fixed: <!-- {docsify-ignore} -->

+ [`getEnergy()`](README.md#getenergy-preset-startfreq-endfreq-) would not accept a fractionary initial frequency.

### Improved: <!-- {docsify-ignore} -->

+ Regenerate the current gradient if/when it is re-registered [(#21)](https://github.com/hvianna/audioMotion-analyzer/issues/21);
+ The [fluid demo](/demo/fluid.html) now shows the status of read-only flags, for better visualization of interactions between different properties.


## version 3.5.1 (2021-09-10)

+ Removed named tuples from the TS type definitions file, for improved compatibility [(#20)](https://github.com/hvianna/audioMotion-analyzer/issues/20).


## version 3.5.0 (2021-07-15)

### Added: <!-- {docsify-ignore} -->

+ [`getBars()`](README.md#getbars) method, which provides real-time analyzer data;
+ [`useCanvas`](README.md#usecanvas-boolean) property to disable rendering to the canvas - thanks **@davay42** for [suggesting this feature](https://github.com/hvianna/audioMotion-analyzer/issues/19);
+ A tool to view/debug the generated octave bands - see the `/tools` folder.

### Improved: <!-- {docsify-ignore} -->

+ Fine-tuned generation of octave bands;
+ Improved FFT data interpolation;
+ Improved peak rendering when changing visualization modes;
+ Added a simple piano keyboard to the test tones section of the "fluid" demo;
+ Added search funcionality to the documentation website.


## version 3.4.0 (2021-05-29)

### Added: <!-- {docsify-ignore} -->

+ [`fsElement`](README.md#fselement-htmlelement-object) constructor option, for easily handling fullscreen on any element.

### Fixed and improved: <!-- {docsify-ignore} -->

+ Fixed radial analyzer too wide in vertical containers;
+ Fixed out of bounds bar in mode 0 (discrete frequencies) with `mirror` set to -1;
+ Improved fullscreen rendering in portrait orientation displays;
+ Improved font size adjustment for scale labels and FPS display on vertical containers.


## version 3.3.0 (2021-05-03)

### Added: <!-- {docsify-ignore} -->

+ New horizontal mirroring effect; see [`mirror`](README.md#mirror-number) property - thanks **@lexterror** for [suggesting this feature](https://github.com/hvianna/audioMotion-analyzer/issues/16).

### Improvements: <!-- {docsify-ignore} -->

+ `colorStops` type definition updated for improved compatibility ([see #17](https://github.com/hvianna/audioMotion-analyzer/pull/17)) - props to [@Staijn1](https://github.com/Staijn1).


## version 3.2.1 (2021-04-03)

+ Fixes an undefined property error.


## version 3.2.0 (2021-04-03)

### Added: <!-- {docsify-ignore} -->

+ [`getEnergy()`](README.md#getenergy-preset-startfreq-endfreq-) method - see it in action on [this pen](https://codepen.io/hvianna/pen/poNmVYo) - thanks **@Staijn1** for [suggesting this feature](https://github.com/hvianna/audioMotion.js/issues/12#issuecomment-733045035);
+ [`setLedParams()`](README.md#setledparams-params-) method, which allows you to customize the look of the LEDs - you can try it in the [fluid demo](https://audiomotion.dev/demo/fluid.html);
+ [`connectSpeakers`](README.md#connectspeakers-boolean) constructor option - thanks **@evoyy** for the [suggestion](https://github.com/hvianna/audioMotion-analyzer/issues/13);
+ [`connectedTo`](README.md#connectedto-array-read-only) read only property.

### Improvements: <!-- {docsify-ignore} -->

+ When passing an AudioNode in the `source` property of constructor, it's no longer necessary to explicitly provide the `audioCtx`, as it will be inferred from the source node - thanks [@evoyy](https://github.com/evoyy) for this idea;
+ Disconnecting the output from the speakers no longer prevents the analyzer from working on Chromium-based browsers;
+ Expose the `GradientOptions` TypeScript interface for user scripts (props to [@Staijn1](https://github.com/Staijn1));
+ Improved the look of the LEDs effect in very small containers (like in the [multi-instance demo](https://audiomotion.dev/demo/multi.html)), especially when `loRes` is active;
+ Refactored some code for improved legibility, performance and file size (still below 20kB minified! :sunglasses:);
+ Added compatibility with *standardized-audio-context* library - thanks [@richclingman](https://github.com/richclingman) for reporting this issue.

### Changed: <!-- {docsify-ignore} -->

+ `energy` and `peakEnergy` properties have been **deprecated and will be removed in the next major release** - use `getEnergy()` and `getEnergy('peak')` instead;
+ FPS display font size is now scaled relatively to the canvas height;
+ `pixelRatio` is now correctly reported for HiDPI devices with screen height <= 1080px.


## version 3.1.0 (2021-02-27)

### Added: <!-- {docsify-ignore} -->

+ TypeScript definition file (props to [@alex-greff](https://github.com/alex-greff)).

### Improvements: <!-- {docsify-ignore} -->

+ Generate only the currently selected gradient on mode/gradient changes.


## version 3.0.0 (2020-11-28)

### BREAKING CHANGES: <!-- {docsify-ignore} -->

+ The `analyzer` object is no longer exposed - use the new [`connectInput()`](README.md#connectinput-source-) method to connect all audio sources and [`connectOutput()`](README.md#connectoutput-node-) to connect the analyzer output to other nodes;
+ `audioSource` property has been renamed to [`connectedSources`](README.md#connectedsources-array), which now returns an **array** of all connected audio sources;
+ `binToFreq()` and `freqToBin()` methods have been removed;
+ `connectAudio()` method has been replaced by [`connectInput()`](README.md#connectinput-source-), which now accepts either an HTML media element or any instance of AudioNode;
+ `dataArray` property is no longer exposed;
+ `showScale` property has been renamed to [`showScaleX`](README.md#showscalex-boolean);
+ `version` is now a **static** property and should always be accessed as [`AudioMotionAnalyzer.version`](README.md#audiomotionanalyzerversion-string-read-only).

### New features: <!-- {docsify-ignore} -->

+ Dual channel (stereo) analyzer option;
+ Built-in volume control;
+ New methods for easy connection/disconnection of input and output nodes:
  + [`connectInput()`](README.md#connectinput-source-)
  + [`disconnectInput()`](README.md#disconnectinput-node-)
  + [`connectOutput()`](README.md#connectoutput-node-)
  + [`disconnectOutput()`](README.md#disconnectoutput-node-)
+ New properties:
  + [`isOctaveBands`](README.md#isoctavebands-boolean-read-only) (read only)
  + [`isLedDisplay`](README.md#isleddisplay-boolean-read-only) (read only)
  + [`isLumiBars`](README.md#islumibars-boolean-read-only) (read only)
  + [`stereo`](README.md#stereo-boolean)
  + [`splitGradient`](README.md#splitgradient-boolean)
  + [`volume`](README.md#volume-number)

### Improvements: <!-- {docsify-ignore} -->

+ Automatically unlock/resume the AudioContext on first user click, so you don't need to handle this in your code anymore;
+ Improved FFT data interpolation on low frequencies (especially noticeable in 1/12th and 1/24th octave bands);
+ Corrected initial amplitude of line / area graph.

### Fixed: <!-- {docsify-ignore} -->

+ A compatibility issue that could cause `reflexRatio` not to work in some environments.


## version 2.5.0 (2020-10-07)

### Improvements: <!-- {docsify-ignore} -->

+ Behavior of the [`onCanvasResize`](README.md#oncanvasresize-function) callback is now consistent across different browsers. Changes worth of note:
  1. on fullscreen changes, **only a `'fschange'` *reason* will be reported** to the callback function - no more redundant `'resize'` calls;
  2. the callback function is now executed **only when canvas dimensions effectively change** from the previous state - for example,
  setting [`loRes`](README.md#lores-boolean) or [`width`](README.md#width-number) to the same value they already have won't trigger a callback;
+ Canvas dimensions are now properly updated whenever the container element is resized, not only on window resize;
+ [`audioSource`](README.md#audiosource-mediaelementaudiosourcenode-object) now returns the first audio source connected via [`connectAudio()`](README.md#connectaudio-element-)
  method, if no source was provided during instantiation;
+ Size of scale labels on both axes is now scaled relatively to the canvas height;
+ Added a [new demo](https://audiomotion.dev/demo) with only the minimal code required to use audioMotion-analyzer;
+ Demo scripts are now loaded as native ES6 modules and no longer require bundling. See the [README file](demo/README.md) for instructions on running the demos locally.


## version 2.4.0 (2020-07-18)

### Added: <!-- {docsify-ignore} -->

+ New **Radial** visualization - see [`radial`](README.md#radial-boolean) and [`spinSpeed`](README.md#spinspeed-number) properties and try them in the [demos](https://audiomotion.dev/demo)! - thanks **@inglesuniversal** for [suggesting this feature](https://github.com/hvianna/audioMotion.js/issues/6);
+ [`showScaleY`](README.md#showscaley-boolean) property for displaying the level (dB) scale on the analyzer's vertical axis;
+ [`energy`](README.md#energy-number-read-only) and [`peakEnergy`](README.md#peakenergy-number-read-only) read-only properties;
+ [Known issues](README.md#known-issues) section added to the documentation.

### Changed: <!-- {docsify-ignore} -->

+ [`setOptions()`](README.md#setoptions-options-) called with no argument now **resets all configuration options to their default values** (it used to raise an error);
+ The LED effect code has been refactored to improve appearance and compatibility with other (future) effects;
+ "Unlit" LEDs are no longer displayed in **overlay mode** - see the notice in [`showBgColor`](README.md#showbgcolor-boolean) documentation;
+ Canvas `fillStyle` and `strokeStyle` properties are now set with the current gradient before calling the [`onCanvasDraw`](README.md#oncanvasdraw-function) callback function;
+ Updated all [demos](https://audiomotion.dev/demo) with more straightforward access to configuration options.


## version 2.3.0 (2020-06-08)

### Added: <!-- {docsify-ignore} -->

+ [`binToFreq()`](README.md#bintofreq-bin-) and [`freqToBin()`](README.md#freqtobin-frequency-rounding-) methods;
+ [`reflexBright`](README.md#reflexbright-number) property, which allows to adjust the brightness of the reflected image.

### Changed: <!-- {docsify-ignore} -->

+ Reverted the change to `reflexAlpha` introduced in [v2.2.1](https://github.com/hvianna/audioMotion-analyzer/releases/tag/2.2.1)
+ Removed the forced black layer off the reflection background.


## version 2.2.1 (2020-05-31)

### Changed: <!-- {docsify-ignore} -->

+ ~~Improved the Reflex effect in [`overlay`](README.md#overlay-boolean) mode - the [`reflexAlpha`](README.md#reflexalpha-number) property is
now used to adjust the opacity of a dark layer applied *over* the reflection area, which prevents undesired transparency of the reflection itself
and creates a consistent effect, whether overlay mode is on or off~~ **(reverted in v2.3.0)**;

+ The package source code has been moved from the `dist` to the `src` folder.

### Fixed: <!-- {docsify-ignore} -->

+ Prevent showing leds below the 0 level, when both reflex and overlay are active.


## version 2.2.0 (2020-05-19)

### Added: <!-- {docsify-ignore} -->

+ New [`overlay`](README.md#overlay-boolean) and [`bgAlpha`](README.md#bgalpha-number) properties allow displaying the analyzer over other contents.
[Check out the new demo!](https://audiomotion.dev/demo/overlay.html)

### Changed: <!-- {docsify-ignore} -->

+ Corrected the documentation for the [`registerGradient()`](README.md#registergradient-name-options-) method, which stated the `bgColor` property was required (it has always been optional).


## version 2.1.0 (2020-04-06)

### Added: <!-- {docsify-ignore} -->

+ Customizable Reflex effect - see [`reflexRatio`](README.md#reflexratio-number) and try it in the [demo](https://audiomotion.dev/demo/fluid.html).


## version 2.0.0 (2020-03-24)

### Added: <!-- {docsify-ignore} -->

+ New [`lineWidth`](README.md#linewidth-number) and [`fillAlpha`](README.md#fillalpha-number) properties for [mode 10](README.md#mode-number) customization, so it can now work as an area graph (default), a line graph or a combination of both;
+ New [`barSpace`](README.md#barspace-number) property for customizable bar spacing in octave bands modes;
+ You can now provide an external AudioContext via `audioCtx` property in the [constructor's `options`](README.md#constructor), allowing you to share the same context among different instances;
+ Custom [error codes](README.md#custom-errors);
+ New [`version`](README.md#version-string-read-only) property;

### Changed: <!-- {docsify-ignore} -->

+ Increased default spacing between bars in octave bands modes - to get the previous look, set [`barSpace`](README.md#barspace-number) to **1**;
+ Improved accuracy when positioning the X-axis scale labels in octave bands modes;
+ Slightly improved vertical usage of canvas when the LED effect is active (removed the black line at the bottom of the screen);
+ Canvas context is now saved before calling the user callback function and restored afterwards, to avoid undesirable changes;
+ Several functions were refactored for improved legibility, memory usage and performance;
+ Improved documentation and demos;

### Fixed: <!-- {docsify-ignore} -->

+ The multi-instance demo should now work on browsers other than Firefox (it now uses a shared audio context);
+ `isFullscreen` property now correctly reads `false` (instead of `undefined`) when the analyzer is not in fullscreen (*potentially breaking change*);
+ Setting one of the callback functions to `undefined` with `setOptions()` now properly unregisters the callback (*potentially breaking change*);

### API breaking changes: <!-- {docsify-ignore} -->

+ `audioCtx`, `analyzer`, `canvas` and `canvasCtx` objects are now read-only (`canvasCtx` properties may be safely modified while inside the callback for `onCanvasDraw`);
+ `frame` and `time` properties are not exposed anymore, as they are intended for internal use only;
+ `registerGradient()` method now enforces the `name` argument being a non-empty `string` (throws an [error](README.md#custom-errors) otherwise);
+ Errors now return a custom object and some error messages have changed - use the new [`code` property](README.md#custom-errors) to identify errors in a reliable way.


## version 1.2.0 (2019-12-19)

+ Improves the look of bars at lower frequencies in octave bands modes (especially 1/12th and 1/24th);
+ Minor tweak to the "Rainbow" gradient to make cyan and blue shades a little more balanced.


## version 1.1.0 (2019-12-08)

+ New **Area fill** visualization mode (`mode: 10`), which uses the same full-frequency data of the *discrete frequencies* mode, but generates a brighter filled shape;
+ New **Luminance Bars** option (`lumiBars: <boolean>`) for octave bands modes, which displays analyzer bars always at full-height, with varying luminance instead.


## version 1.0.1 (2019-10-22)

+ Minor cleanup to optimize npm package size.


## version 1.0.0 (2019-10-07)

+ First stable release.
