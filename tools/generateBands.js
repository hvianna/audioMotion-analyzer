/**
 * This function is adapted from audioMotion-analyzer's _calcBars() internal method,
 * for use in the viewer tool.
 *
 * @author  Henrique Avila Vianna <hvianna@gmail.com> <https://henriquevianna.com>
 * @license AGPL-3.0-or-later
 */

'use strict';

function generateBands( options ) {

	const { fftSize, sampleRate, mode, minFreq, maxFreq } = options;

	const scale = [ 'C', 'C𝄱', 'C♯', 'C𝄰', 'D', 'D𝄱', 'D♯', 'D𝄰', 'E', 'E𝄱', 'F', 'F𝄱', 'F♯', 'F𝄰', 'G', 'G𝄱', 'G♯', 'G𝄰', 'A', 'A𝄱', 'A♯', 'A𝄰', 'B', 'B𝄱' ];

	const ROOT24 = 2 ** ( 1 / 24 ),      // 24th root of 2
		  C0     = 440 * ROOT24 ** -114; // ~16.35 Hz

	// helper functions
	const freqToBin = ( freq, method = 'round' ) => Math[ method ]( freq * fftSize / sampleRate );
	const binToFreq = bin => bin * sampleRate / fftSize || 1; // returns 1 for bin 0

	// generate a 11-octave 24-tone equal tempered scale

	/*
		A simple linear interpolation is used to obtain an approximate amplitude value for the desired frequency
		from available FFT data, like so:

		h = hLo + ( hHi - hLo ) * ( f - fLo ) / ( fHi - fLo )
		                         \___________________________/
		                                       |
		                                     ratio
		where:

		f   - desired frequency
		h   - amplitude of desired frequency
		fLo - frequency represented by the lower FFT bin
		fHi - frequency represented by the higher FFT bin
		hLo - amplitude of fLo
		hHi - amplitude of fHi

		ratio is calculated in advance here, to reduce computational complexity during real-time rendering
	*/

	let temperedScale = [];

	for ( let octave = 0; octave < 11; octave++ ) {
		for ( let note = 0; note < 24; note++ ) {

			const freq       = C0 * ROOT24 ** ( octave * 24 + note ),
				  bin        = freqToBin( freq, 'floor' ),
				  binFreq    = binToFreq( bin ),
				  nextFreq   = binToFreq( bin + 1 ),
				  ratio      = ( freq - binFreq ) / ( nextFreq - binFreq );

			temperedScale.push( { octave, note: scale[ note ], freq, bin, ratio, range: [ binFreq, nextFreq ] } );
		}
	}

	// generate the frequency bands according to user's selected parameters

	const steps = [0,1,2,3,4,6,8,12,24][ mode ]; // number of notes grouped per band for each mode

	let analyzerBars = [];

	for ( let index = 0; index < temperedScale.length; index += steps ) {
		let { octave, freq: freqLo, bin: binLo, ratio: ratioLo } = temperedScale[ index ],     // band start
			{ freq: freqHi, bin: binHi, ratio: ratioHi } = temperedScale[ index + steps - 1 ]; // band end

		const nBars   = analyzerBars.length,
			  prevBar = analyzerBars[ nBars - 1 ];

		// if the ending frequency is out of range, we're done here
		if ( freqHi > maxFreq || binHi >= fftSize / 2 ) {
			prevBar.binHi++;     // add an extra bin to the last bar, to fully include the last valid band
			prevBar.ratioHi = 0; // disable interpolation
			prevBar.freqHi = binToFreq( prevBar.binHi ); // update ending frequency
			break;
		}

		// is the starting frequency in the selected range?
		if ( freqLo >= minFreq ) {
			if ( nBars > 0 ) {
				const diff = binLo - prevBar.binHi;

				// check if we skipped any available FFT bins since the last bar
				if ( diff > 1 ) {
					// allocate half of the unused bins to the previous bar
					prevBar.binHi = binLo - ( diff >> 1 );
					prevBar.ratioHi = 0;
					prevBar.freqHi = binToFreq( prevBar.binHi ); // update ending frequency

					// if the previous bar doesn't share any bins with other bars, no need for interpolation
					if ( nBars > 1 && prevBar.binHi > prevBar.binLo && prevBar.binLo > analyzerBars[ nBars - 2 ].binHi ) {
						prevBar.ratioLo = 0;
						prevBar.freqLo = binToFreq( prevBar.binLo ); // update starting frequency
					}

					// start the current bar at the bin following the last allocated bin
					binLo = prevBar.binHi + 1;
				}

				// if the lower bin is not shared with the ending frequency nor the previous bar, no need to interpolate it
				if ( binHi > binLo && binLo > prevBar.binHi ) {
					ratioLo = 0;
					freqLo = binToFreq( binLo );
				}
			}

			analyzerBars.push( { octave, binLo, binHi, freqLo, freqHi, ratioLo, ratioHi } );
		}

	}

	return { temperedScale, analyzerBars };
}
