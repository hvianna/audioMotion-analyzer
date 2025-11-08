// Update value div of range input elements

function updateRangeElement( el, instance ) {
	const s = el.nextElementSibling;
	if ( s && s.className == 'value' ) {
		let text = el.value;
		if ( el.dataset.setting == 'barSpace' ) {
			if ( el.value == 1 )
				text += ' (Legacy)';
		}
		else if ( el.dataset.setting == 'bandResolution' ) {
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
