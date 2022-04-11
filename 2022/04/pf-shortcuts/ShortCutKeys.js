(function ($) {
	var ShiftMod = false;
	var CtrlMod = false;
	var AltMod = false;

	$.fn.defineShortcutKey = function (mod, key, func) {
		try {

			$(this).keydown(function (e) {

				//e.preventDefault();

				// Modifier down (SHIFT, CONTROL, ALT)
				if (e.keyCode == 16) {
					ShiftMod = true;
				} else if (e.keyCode == 17) {
					CtrlMod = true;
				} else if (e.keyCode == 18) {
					AltMod = true;
				}

				// Check key
				if (e.keyCode == key) {
					// Verify assignment of modifier
					if (mod == null || mod == 0 || mod == key) {
						func();
					} else {
						// Verify modifier
						if (mod == 16) {
							if (ShiftMod == true) {
								func();
							}
						} else if (mod == 17) {
							if (CtrlMod == true) {
								func();
							}
						} else if (mod == 18) {
							if (AltMod == true) {
								func();
							}
						}
					}
				}

				// Modifier up (SHIFT, CONTROL, ALT)
				$(this).keyup(function (e) {

					//e.preventDefault();

					if (e.keyCode == 16) {
						ShiftMod = false;
					} else if (e.keyCode == 17) {
						CtrlMod = false;
					} else if (e.keyCode == 18) {
						AltMod = false;
					}

				});

			});


		} catch (e) {

			console.log(e);

		}
	};

}
	(jQuery));
