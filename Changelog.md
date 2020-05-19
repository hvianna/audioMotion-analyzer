Changelog
=========

## version 2.2.0 - released 2020-05-19 :mask:

### Added: {docsify-ignore}

+ New [`overlay`](#README.md#overlay-boolean) and [`bgAlpha`](#README.md#bgalpha-number) properties allow displaying the analyzer over other contents.
[Check out the new demo!](https://audiomotion.dev/demo/overlay.html)

### Changed: {docsify-ignore}

+ Corrected the documentation for the [`registerGradient()`](README.md#registergradient-name-options-) method, which stated the `bgColor` property was required (it has always been optional).


## version 2.1.0 - released 2020-04-06 :mask:

### Added: {docsify-ignore}

+ Customizable Reflex effect - see [`reflexRatio`](README.md#reflexratio-number) and try it in the [demo](https://audiomotion.dev/demo/fluid.html).


## version 2.0.0 - released 2020-03-24 :mask:

### Added: {docsify-ignore}

+ New [`lineWidth`](README.md#linewidth-number) and [`fillAlpha`](README.md#fillalpha-number) properties for [mode 10](README.md#mode-number) customization, so it can now work as an area graph (default), a line graph or a combination of both;
+ New [`barSpace`](README.md#barspace-number) property for customizable bar spacing in octave bands modes;
+ You can now provide an external AudioContext via `audioCtx` property in the [constructor's `options`](README.md#constructor), allowing you to share the same context among different instances;
+ Custom [error codes](README.md#custom-errors);
+ New [`version`](README.md#version-string-read-only) property;

### Changed: {docsify-ignore}

+ Increased default spacing between bars in octave bands modes - to get the previous look, set [`barSpace`](README.md#barspace-number) to **1**;
+ Improved accuracy when positioning the X-axis scale labels in octave bands modes;
+ Slightly improved vertical usage of canvas when the LED effect is active (removed the black line at the bottom of the screen);
+ Canvas context is now saved before calling the user callback function and restored afterwards, to avoid undesirable changes;
+ Several functions were refactored for improved legibility, memory usage and performance;
+ Improved documentation and demos;

### Fixed: {docsify-ignore}

+ The multi-instance demo should now work on browsers other than Firefox (it now uses a shared audio context);
+ `isFullscreen` property now correctly reads `false` (instead of `undefined`) when the analyzer is not in fullscreen (*potentially breaking change*);
+ Setting one of the callback functions to `undefined` with `setOptions()` now properly unregisters the callback (*potentially breaking change*);

### API breaking changes: {docsify-ignore}

+ `audioCtx`, `analyzer`, `canvas` and `canvasCtx` objects are now read-only (`canvasCtx` properties may be safely modified while inside the callback for `onCanvasDraw`);
+ `frame` and `time` properties are not exposed anymore, as they are intended for internal use only;
+ `registerGradient()` method now enforces the `name` argument being a non-empty `string` (throws an [error](README.md#custom-errors) otherwise);
+ Errors now return a custom object and some error messages have changed - use the new [`code` property](README.md#custom-errors) to identify errors in a reliable way.


## version 1.2.0 - released 2019-12-19

+ Improves the look of bars at lower frequencies in octave bands modes (especially 1/12th and 1/24th);
+ Minor tweak to the "Rainbow" gradient to make cyan and blue shades a little more balanced.


## version 1.1.0 - released 2019-12-08

+ New **Area fill** visualization mode (`mode: 10`), which uses the same full-frequency data of the *discrete frequencies* mode, but generates a brighter filled shape;
+ New **Luminance Bars** option (`lumiBars: <boolean>`) for octave bands modes, which displays analyzer bars always at full-height, with varying luminance instead.


## version 1.0.1 - released 2019-10-22

+ Minor cleanup to optimize npm package size.


## version 1.0.0 - released 2019-10-07

+ First stable release.


## version 1.0.0-rc.1 - released 2019-10-05

+ Release candidate for v1.0.0
