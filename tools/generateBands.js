/**
 * This function is adapted from audioMotion-analyzer's _calcBars() internal method,
 * for use in the viewer tool.
 *
 * @author  Henrique Avila Vianna <hvianna@gmail.com> <https://henriquevianna.com>
 * @license AGPL-3.0-or-later
 */

'use strict';

function generateBands( options ) {

	const { fftSize, sampleRate, mode, minFreq, maxFreq, ansiBands } = options;

	// helper functions
	const freqToBin = ( freq, method = 'round' ) => {
		const max = fftSize / 2 - 1,
			  bin = Math[ method ]( freq * fftSize / sampleRate );
		return bin < max ? bin : max;
	}
	const binToFreq = bin => bin * sampleRate / fftSize || 1; // returns 1 for bin 0

	/*
		A simple interpolation is used to obtain an approximate amplitude value for any given frequency,
		from the available FFT data. We find the FFT bin which closer matches the desired frequency	and
		interpolate its value with that of the next adjacent bin, like so:

			v = v0 + ( v1 - v0 ) * ( log2( f / f0 ) / log2( f1 / f0 ) )
			                       \__________________________________/
			                                        |
			                                      ratio
			where:

			f  - desired frequency
			v  - amplitude (volume) of desired frequency
			f0 - frequency represented by the lower FFT bin
			f1 - frequency represented by the upper FFT bin
			v0 - amplitude of f0
			v1 - amplitude of f1

		ratio is calculated in advance here, to reduce computational complexity during real-time rendering.
	*/

	// helper function to calculate FFT bin and interpolation ratio for a given frequency
	const calcRatio = freq => {
		const bin   = freqToBin( freq, 'floor' ), // find closest FFT bin
			  lower = binToFreq( bin ),
			  upper = binToFreq( bin + 1 ),
			  ratio = Math.log2( freq / lower ) / Math.log2( upper / lower );

		return [ bin, ratio ];
	}

	// helper function to round a value to the specified number of significant digits
	// `atLeast` set to true prevents reducing the number of integer significant digits
	const roundSD = ( value, digits, atLeast ) => {
		const pow = Math.log10( value ) | 0,
			  sd  = Math.max( digits, atLeast ? pow + 1 : digits ),
			  exp = 10 ** ( sd - pow - 1 );
		return Math.round( value * exp ) / exp;
	}

	// helper function to find the nearest preferred number (Renard series) for a given value
	const nearestPreferred = value => {
		// R20 series provides closer approximations for 1/2 octave bands (non-standard)
		const preferred = [ 1, 1.12, 1.25, 1.4, 1.6, 1.8, 2, 2.24, 2.5, 2.8, 3.15, 3.55, 4, 4.5, 5, 5.6, 6.3, 7.1, 8, 9, 10 ],
			  power = Math.log10( value ) | 0,
			  normalized = value / 10 ** power;

		let i = 1;
		while ( i < preferred.length && normalized > preferred[ i ] )
			i++;

		if ( normalized - preferred[ i - 1 ] < preferred[ i ] - normalized )
			i--;

		return ( preferred[ i ] * 10 ** ( power + 5 ) | 0 ) / 1e5; // keep 5 significant digits
	}

	// ANSI standard octave bands use the base-10 frequency ratio, as preferred by [ANSI S1.11-2004, p.2]
	// The equal-tempered scale uses the base-2 ratio
	const bands = [0,24,12,8,6,4,3,2,1][ mode ],
		  bandWidth = ansiBands ? 10 ** ( 3 / ( bands * 10 ) ) : 2 ** ( 1 / bands ), // 10^(3/10N) or 2^(1/N)
		  halfBand  = bandWidth ** .5;

	let analyzerBars = [],
		currFreq = ansiBands ? 7.94328235 / ( bands % 2 ? 1 : halfBand ) : 8.17579892; // C -1
		// For ANSI bands with even denominators (all except 1/1 and 1/3), the reference frequency (1 kHz)
		// must fall on the edges of a pair of adjacent bands, instead of midband [ANSI S1.11-2004, p.2]
		// In the equal-tempered scale, all midband frequencies represent a musical note or quarter-tone.

	do {
		let freq = currFreq; // midband frequency

		const freqLo = roundSD( freq / halfBand, 4, true ), // lower edge frequency
			  freqHi = roundSD( freq * halfBand, 4, true ), // upper edge frequency
			  [ binLo, ratioLo ] = calcRatio( freqLo ),
			  [ binHi, ratioHi ] = calcRatio( freqHi );

		// for ANSI 1/1, 1/2 and 1/3 bands, use the preferred numbers to find the nominal midband frequency
		// for ANSI 1/4 to 1/24, round to 2 or 3 significant digits, depending on the MSD [ANSI S1.11-2004, p.12]
		if ( ansiBands )
			freq = bands < 4 ? nearestPreferred( freq ) : roundSD( freq, freq.toString()[0] < 5 ? 3 : 2 );
		else
			freq = roundSD( freq, 4, true );

		// for viewer tool only
		const clamped = freqLo < minFreq
						? 'l' // lower edge clamped by minFreq
		  				: freqHi > maxFreq || ratioHi > 1
		  				  ? 'u' // upper edge clamped by maxFreq (or sample rate)
		  				  : '';

		if ( freq >= minFreq )
			analyzerBars.push( { freq, freqLo, freqHi, binLo, ratioLo, binHi, ratioHi: Math.min( ratioHi, 1 ), clamped } );

		currFreq *= bandWidth;
	} while ( currFreq <= maxFreq );

	return analyzerBars;
}
