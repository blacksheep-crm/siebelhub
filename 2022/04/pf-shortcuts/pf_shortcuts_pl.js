//pf jca 28.03.2022: accelarator
if (!consts.isDefined("CustomAccelarators")) {
	consts.set("CustomAccelarators", "true");
	SiebelJS.Log("custompl.js CustomAccelarators was unset");

	//ALT+F3
	$("body").defineShortcutKey(18, 114, function () {
		var aE = document.activeElement.getAttribute("name");
		var is_ro = $('[name="' + aE + '"]').is('[readonly]');
		var is_ta = $('[name="' + aE + '"]').is('textarea');
		var cm_val = "[" + SiebelApp.S_App.GetProfileAttr("Login Name") + " " + SiebelApp.CustomUtils.helperDate(new Date(), SiebelApp.S_App.GetProfileAttr('Me. Preferred Locale Code')) + "]";
		SiebelJS.Log("custompl.js: aE = " + aE + ", Read Only = " + is_ro + ", TextArea = " + is_ta);
		if (!is_ro && is_ta) {
			var aE_val = $('[name="' + aE + '"]').val();
			aE_val = (aE_val) ? (aE_val + "\r\n" + cm_val) : cm_val;
			//$('[name="' + aE + '"]').show();
			$('[name="' + aE + '"]').val(aE_val);
			//$('[name="' + aE + '"]').focus();
		} else {
			try {
				SiebelApp.CustomUtils.CopyStringToClipboard(cm_val);
				$('[name="' + aE + '"]').show();
				$('[name="' + aE + '"]').focus();
			} catch (errAcc) {
				SiebelJS.Log("custompl.js ALT+F3 error: " + errAcc.toString());
			}
		}
	});
}

//Helper Funktionen






CopyStringToClipboard = function (str) {
	try {
		// Create new element
		//https://stackoverflow.com/questions/22581345/click-button-copy-to-clipboard
		var el = document.createElement('textarea');
		// Set value (string to be copied)
		el.value = str;
		// Set non-editable to avoid focus and move outside of view
		//el.setAttribute('readonly', '');
		el.style = {
			position: 'absolute',
			left: '-9999px',
			top: '0'
		};
		document.body.appendChild(el);
		// Select text inside element
		el.select();
		// Copy text to clipboard
		document.execCommand('copy');
		// Remove temporary element
		document.body.removeChild(el);
	} catch (e) {
		SiebelJS.Log("error in custom_utils.js Function.CopyStringToClipboard: " + e.toString())
	}
	finally {
		SiebelJS.Log("custom_utils.js Function.CopyStringToClipboard: " + str);
	}
};


helperDate = function (dt_1, locale) {
	var h_01 = dt_1.getHours();
	var m_01 = dt_1.getMinutes();
	var s_01 = dt_1.getSeconds();
	var f_01 = 'dd.mm.yy';

	switch (locale) {
	case 'ARA':
	case 'HEB':
	case 'JPN':
	case 'CHS':
	case 'CHT':
		f_01 = 'yy/mm/dd';
		break;
	case 'DAN':
	case 'NLD':
	case 'NOR':
		f_01 = 'dd-mm-yy';
		break;
	case 'KOR':
	case 'SVE':
		f_01 = 'yy-mm-dd';
		break;
	case 'ENU':
		f_01 = 'mm/dd/yy';
		break;
	case 'AUE':
	case 'ESN':
	case 'ESP':
	case 'FRA':
	case 'ITA':
	case 'ZAF':
	case 'FRB':
	case 'NLB':
	case 'PTB':
		f_01 = 'dd/mm/yy';
		break;
	case 'DEU':
	case 'CHE':
	case 'ENG':
	case 'IND':
	case 'PLK':
	case 'RUS':
	case 'TRK':
	case 'CSY':
	case 'FIN':
	default:
		f_01 = 'dd.mm.yy';
		break;
	}
	//$.datepicker._defaults['dateFormat']
	return $.datepicker.formatDate(f_01, dt_1) + " " + (h_01 < 10 ? '0' : '') + h_01 + ":" + (m_01 < 10 ? '0' : '') + m_01 + ":" + (s_01 < 10 ? '0' : '') + s_01;
};
