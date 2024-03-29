/**
 * Adapted from audioMotion-analyzer's internal function.
 *
 * @author  Henrique Avila Vianna <hvianna@gmail.com> <https://henriquevianna.com>
 * @license AGPL-3.0-or-later
 */

'use strict';

function weightingdB( freq, filter ) {

	const f2 = freq ** 2,
		  SQ20_6  = 424.36,
		  SQ107_7 = 11599.29,
		  SQ158_5 = 25122.25,
		  SQ737_9 = 544496.41,
		  SQ12194 = 148693636,
		  linearTodB = value => 20 * Math.log10( value );

	switch ( filter ) {
		case 'A' : // A-weighting https://en.wikipedia.org/wiki/A-weighting
			const rA = ( SQ12194 * f2 ** 2 ) / ( ( f2 + SQ20_6 ) * Math.sqrt( ( f2 + SQ107_7 ) * ( f2 + SQ737_9 ) ) * ( f2 + SQ12194 ) );
			return 2 + linearTodB( rA );

		case 'B' :
			const rB = ( SQ12194 * f2 * freq ) / ( ( f2 + SQ20_6 ) * Math.sqrt( f2 + SQ158_5 ) * ( f2 + SQ12194 ) );
			return .17 + linearTodB( rB );

		case 'C' :
			const rC = ( SQ12194 * f2 ) / ( ( f2 + SQ20_6 ) * ( f2 + SQ12194 ) );
			return .06 + linearTodB( rC );

		case 'D' :
			const h = ( ( 1037918.48 - f2 ) ** 2 + 1080768.16 * f2 ) / ( ( 9837328 - f2 ) ** 2 + 11723776 * f2 ),
				  rD = ( freq / 6.8966888496476e-5 ) * Math.sqrt( h / ( ( f2 + 79919.29 ) * ( f2 + 1345600 ) ) );
			return linearTodB( rD );

		case '468' : // ITU-R 468 https://en.wikipedia.org/wiki/ITU-R_468_noise_weighting
			const h1 = -4.737338981378384e-24 * freq ** 6 + 2.043828333606125e-15 * freq ** 4 - 1.363894795463638e-7 * f2 + 1,
				  h2 = 1.306612257412824e-19 * freq ** 5 - 2.118150887518656e-11 * freq ** 3 + 5.559488023498642e-4 * freq,
				  rI = 1.246332637532143e-4 * freq / Math.hypot( h1, h2 );
			return 18.2 + linearTodB( rI );
	}

	return 0; // unknown filter
}
