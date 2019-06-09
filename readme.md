
### Read only variables:

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

`highSens` *boolean*

High sensitivity mode active?

`showPeaks` *boolean*

Show amplitude peaks for each frequency?

`loRes` *boolean*

Use low resolution canvas?

`fMin` *number*

Lowest frequency represented in the X axis

`fMax` *number*

Highest frequency represented in the X axis


### Functions:

`create( container, [ options ] )`

Constructor function. Initializes the analyzer and inserts the canvas in the *container* element.

```
options = {
	audioElement: <HTMLAudioElement>
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

Set the number of samples for the FFT performed by the analyzer node.
Valid values for *samples* are 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, and 32768. Defaults to **8192**.

`setFreqRange( [ min ], [ max ] )`

Set desired frequency range. *min* defaults to **20**, and *max* defaults to **22000** (Hz).

`setSmoothing( [ value ] )`

Set the analyzer's smoothing time constant. *value* must be a float between 0 and 1. Defaults to **0.5**.

`setGradient( [ gradient ] )`

Select gradient for visualization. *gradient* must be the key (string) of a registered gradient. Defaults to **classic**.

`setPeaks( [ boolean ] )`

Set show peaks preference. Defaults to **true**.

`setBgColor( [ boolean ] )`

Set background color preference. If *true* (default), uses the background color defined by the active gradient; otherwise uses black.

`setLeds( [ boolean ] )`

Set LED effect. Defaults to **false**.

`setScale ( [ boolean ] )`

Set frequency scale labels on/off. Defaults to **true**.

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
