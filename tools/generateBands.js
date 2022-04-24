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

	// helper functions
	const freqToBin = ( freq, rounding = 'round' ) => {
		const max = fftSize / 2 - 1,
			  bin = Math[ rounding ]( freq * fftSize / sampleRate );
		return bin < max ? bin : max;
	}
	const binToFreq = bin => bin * sampleRate / fftSize || 1; // returns 1 for bin 0

	/*
		A simple linear interpolation is used to obtain an approximate amplitude value for any given frequency,
		from available FFT data. We find the FFT bin which closer matches the desired frequency and interpolate
		its value with that of the next adjacent bin, like so:

			v = v0 + ( v1 - v0 ) * ( f - f0 ) / ( f1 - f0 )
			                       \______________________/
			                                   |
			                                 ratio
			where:

			f  - desired frequency
			v  - amplitude (volume) of desired frequency
			f0 - frequency represented by the selected FFT bin
			f1 - frequency represented by the next FFT bin
			v0 - amplitude of f0
			v1 - amplitude of f1

		ratio is calculated in advance here, to reduce the computational complexity during real-time rendering.
	*/

	// helper function to calculate FFT bin and interpolation ratio for a given frequency
	const calcRatio = freq => {
		const bin      = freqToBin( freq, 'floor' ), // find closest FFT bin
			  thisFreq = binToFreq( bin ),
			  nextFreq = binToFreq( bin + 1 ),
			  ratio    = ( freq - thisFreq ) / ( nextFreq - thisFreq );

		return [ bin, ratio ];
	}

	const bands = [0,24,12,8,6,4,3,2,1][ mode ], // bands per octave for each mode
		  bandWidth = 2 ** ( 1 / bands ), // Nth root of 2, where N is number of bands
		  halfBand  = bandWidth ** .5;    // 2N-th root of 2

	let analyzerBars = [],
		freq = 8.1758; // C -1

	do {
		const freqLo = freq / halfBand, // lower edge frequency
			  freqHi = freq * halfBand, // upper edge frequency
			  [ binLo, ratioLo ] = calcRatio( freqLo ),
			  [ binHi, ratioHi ] = calcRatio( freqHi );

		// for viewer tool only
		const clamped = freqLo < minFreq ? 'l' // lower edge clamped by minFreq
		  					: freqHi > maxFreq || ratioHi > 1 ? 'u' // upper edge clamped by maxFreq (or sample rate)
		  						: '';

		if ( freq >= minFreq )
			analyzerBars.push( { freq, freqLo, freqHi, binLo, ratioLo, binHi, ratioHi: Math.min( ratioHi, 1 ), clamped } );

		freq *= bandWidth;
	} while ( freq <= maxFreq );

	return analyzerBars;
}
