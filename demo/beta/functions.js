import {
	ALPHABARS_FULL,
	ALPHABARS_OFF,
	ALPHABARS_ON,
	COLORMODE_GRADIENT,
	COLORMODE_INDEX,
	COLORMODE_LEVEL,
	FILTER_NONE,
	FILTER_A,
	FILTER_B,
	FILTER_C,
	FILTER_D,
	FILTER_468,
	FILTER_TILT3,
	FILTER_TILT45,
	LABELS_X_CUSTOM,
	LABELS_X_FREQS,
	LABELS_X_FREQS_CUSTOM,
	LABELS_X_NOTES,
	LABELS_X_OFF,
	LABELS_Y_DB,
	LABELS_Y_PERCENT,
	LABELS_Y_OFF,
	LAYOUT_COMBINED,
	LAYOUT_HORIZONTAL,
	LAYOUT_SINGLE,
	LAYOUT_VERTICAL,
	LEDS_MODERN,
	LEDS_OFF,
	LEDS_VINTAGE,
	MIRROR_LEFT,
	MIRROR_OFF,
	MIRROR_RIGHT,
	MODE_BARS,
	MODE_GRAPH,
	PEAKS_DROP,
	PEAKS_FADE,
	PEAKS_OFF,
	RADIAL_INWARD,
	RADIAL_OFF,
	RADIAL_OUTWARD,
	SCALE_BARK,
	SCALE_LINEAR,
	SCALE_LOG,
	SCALE_MEL
} from './audioMotion-analyzer.js';

// Set event listeners for UI controls
export function addUIEventListeners( getInstance ) {
	document.querySelectorAll('[data-prop],[data-setter]').forEach( el => {

		const isToggle = el.tagName == 'BUTTON';

		el.addEventListener( isToggle ? 'click' : 'input', () => {
			const newValue = isToggle ? ! el.classList.contains('active') : el.value;

			if ( el.dataset.setter ) { // value is set via a function
				const args = [],
					  { channel, prop } = el.dataset;

				if ( channel )
					args.push( channel );

				args.push( prop && ! prop.startsWith('is') ? { [prop]: newValue } : newValue );
				getInstance( el )[ el.dataset.setter ]( ...args );
			}
			else
				getInstance( el )[ el.dataset.prop ] = newValue;
			updateUI( getInstance );
		});
	});
}

// Load song from user's computer
export function loadSong( el ) {
	const fileBlob = el.files[0],
		  audioEl  = document.getElementById('audio');

	if ( fileBlob ) {
		audioEl.src = URL.createObjectURL( fileBlob );
		audioEl.play();
	}
}

// Populate controls
export function populateControls() {
	populateSelect( 'alphaBars', [ ALPHABARS_OFF, ALPHABARS_ON, ALPHABARS_FULL ] );
	populateSelect( 'channelLayout', [ LAYOUT_SINGLE, LAYOUT_COMBINED, LAYOUT_HORIZONTAL, LAYOUT_VERTICAL ] );
	populateSelect( 'colorMode', [ COLORMODE_GRADIENT, COLORMODE_INDEX, COLORMODE_LEVEL ] );
	populateSelect( 'frequencyScale', [ SCALE_BARK, SCALE_LINEAR, SCALE_LOG, SCALE_MEL ] );
	populateSelect( 'ledBars', [ LEDS_OFF, LEDS_MODERN, LEDS_VINTAGE ] );
	populateSelect( 'mode', [ MODE_BARS, MODE_GRAPH ] );
	populateSelect( 'showPeaks', [ PEAKS_OFF, PEAKS_DROP, PEAKS_FADE ] );
	populateSelect( 'showScaleX', [ LABELS_X_OFF, LABELS_X_CUSTOM, LABELS_X_FREQS, LABELS_X_FREQS_CUSTOM, LABELS_X_NOTES ] );
	populateSelect( 'showScaleY', [ LABELS_Y_OFF, LABELS_Y_DB, LABELS_Y_PERCENT ] );
	populateSelect( 'weightingFilter', [ FILTER_NONE, FILTER_A, FILTER_B, FILTER_C, FILTER_D, FILTER_468, FILTER_TILT3, FILTER_TILT45 ] );
}

// Populate a select element
function populateSelect( prop, options ) {
	const el = typeof prop == 'object' ? prop : document.querySelector(`[data-prop="${ prop }"`);
	if ( ! el )
		return;

	while ( el.firstChild )
		el.removeChild( el.firstChild );

	for ( const option of options )
		el.append( new Option( option ) );
}

// Populate theme selection elements
export function populateThemeSelections( instance ) {
	const themeList = instance.getThemeList().sort();
	for ( const el of document.querySelectorAll(`[data-getter="getTheme"]`) )
		populateSelect( el, themeList );
}

// Handle preset selecion
export function setPresets( presets, getInstance, initLoad ) {
	const audioMotion     = getInstance(),
		  presetSelection = document.getElementById('presets');

	const loadPreset = index => {
		const { options, theme, ledProps } = presets[ index ];
		audioMotion.setOptions( options );
		if ( theme !== undefined ) { // `null` also satisfies this condition, and will reset themes to default
			audioMotion.setThemeModifiers(); // reset modifiers to defaults first
			audioMotion.setTheme( theme );
		}
		if ( ledProps !== undefined ) {
			audioMotion.setLedProps( ledProps );
		}
		updateUI( getInstance );
	}

	presets.forEach( ( preset, index ) => {
		const option = new Option( preset.name, index );
		presetSelection.append( option );
	});

	presetSelection.addEventListener( 'change', () => loadPreset( presetSelection.value ) );

	if ( initLoad != null )
		loadPreset( initLoad );
}

// Update value div of range input elements
function updateRangeElement( el, instance ) {
	const s = el.nextElementSibling;
	if ( s && s.className == 'value' ) {
		let text = el.value;
		if ( el.dataset.prop == 'barSpace' ) {
			if ( el.value == 1 )
				text += ' (Legacy)';
		}
		else if ( el.dataset.prop == 'bandResolution' ) {
			text = `[${text}] `;
			if ( el.value == 0 )
				text += 'FFT freqs.';
			else if ( instance.isOctaveBands )
				text += ['','octaves','half','1/3rd','1/4th','1/6th','1/8th','1/12th','1/24th'][ el.value ] + ( el.value > 1 ? ' octs.' : '' );
			else
				text += ['','10','20','30','40','60','80','120','240'][ el.value ] + ' bands';
		}
		s.innerText = text;
	}
}

// Update UI elements to reflect the analyzer's current settings
export function updateUI( getInstance ) {
	const instance = getInstance();

	if ( instance.isDestroyed )
		document.getElementById('container').innerHTML = '<div class="warn">audioMotion instance has been destroyed. Reload the page to start again.</div>';

	document.querySelectorAll('[data-getter],[data-prop]').forEach( el => {
		let newValue;
		if ( el.dataset.getter ) { // value is obtained via a function
			const { channel, prop } = el.dataset;

			newValue = instance[ el.dataset.getter ]( channel );
			if ( prop )
				newValue = newValue[ prop ];
		}
		else
			newValue = getInstance( el )[ el.dataset.prop ];

		if ( el.tagName == 'BUTTON' )
			el.classList.toggle( 'active', !! newValue );
		else
			el.value = newValue;
	});
	document.querySelectorAll('input[type="range"]').forEach( el => updateRangeElement( el, instance ) );
	document.querySelectorAll('[data-flag]').forEach( el => el.classList.toggle( 'active', !! instance[ el.dataset.flag ] ) );
}
