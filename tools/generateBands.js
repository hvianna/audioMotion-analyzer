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

	const steps = [0,1,2,3,4,6,8,12,24][ mode ], // number of notes grouped per band for each mode
		  rootN = 2 ** ( steps / 48 ); // 2N-th root of 2, where N is 1/steps (3 for 1/3rd bands and so on)

	let analyzerBars = [];

	// generate a 11-octave 24-tone equal tempered scale

	for ( let octave = 0; octave < 11; octave++ ) {
		for ( let note = 0; note < 24; note += steps ) {

			const freq   = C0 * ROOT24 ** ( octave * 24 + note ), // center frequency for this band
				  freqLo = freq / rootN, // lower edge frequency
				  freqHi = freq * rootN, // upper edge frequency
				  [ binLo, ratioLo ] = calcRatio( freqLo ),
				  [ binHi, ratioHi ] = calcRatio( freqHi );

			if ( binHi >= fftSize / 2 )
				break;

			// for viewer tool only
			const disabled = freq < minFreq || freq > maxFreq,  // center frequency out of selected range
				  clamped  = disabled ? ''
				  				: freqLo < minFreq ? 'l'		// lower edge clamped by minFreq
				  					: freqHi > maxFreq ? 'u'	// upper edge clamped by maxFreq
				  						: '';

			analyzerBars.push( { octave, note: scale[ note ], freq, freqLo, freqHi, binLo, ratioLo, binHi, ratioHi, disabled, clamped } );
		}
	}

	return analyzerBars;
}
