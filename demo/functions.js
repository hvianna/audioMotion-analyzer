// Handle preset selecion
function setPresets( presets, getInstance, initLoad ) {
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
			document.getElementById('customLeds').checked = ledProps !== null;
			if ( ledProps !== null ) {
				ledHeight.value = ledProps.ledHeight;
				gapHeight.value = ledProps.gapHeight;
			}
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

// Set event listeners for UI controls
function addUIEventListeners( getInstance ) {
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
// Display value of ranged input elements
//document.querySelectorAll('input[type="range"]').forEach( el => el.addEventListener( 'input', () => updateRangeElement( el, audioMotion ) ) );

		});
	});
}

function populateThemeSelections( instance ) {
	for ( const name of instance.getThemeList().sort() ) {
		for ( const el of document.querySelectorAll(`[data-getter="getTheme"]`) )
			el.append( new Option( name ) );
	}
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
function updateUI( getInstance ) {
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

// Load song from user's computer
function loadSong( el ) {
	const fileBlob = el.files[0],
		  audioEl  = document.getElementById('audio');

	if ( fileBlob ) {
		audioEl.src = URL.createObjectURL( fileBlob );
		audioEl.play();
	}
}
