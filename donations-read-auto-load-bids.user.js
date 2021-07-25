// ==UserScript==
// @name         ESA donations :: reading - auto load bids
// @description  Automatically expands the "Bids" column on page /read_donations
// @author       https://github.com/rybak
// @homepageURL  https://github.com/rybak/esa-tweaks
// @updateURL    https://github.com/rybak/esa-tweaks/raw/main/donations-read-auto-load-bids.user.js
// @version      0.1
// @match        https://donations.esamarathon.com/admin/read_donations
// @icon         https://www.google.com/s2/favicons?domain=esamarathon.com
// @namespace    http://tampermonkey.net/
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	const DONATIONS_TABLE_ID = 'id_result_set';

	function log(msg) {
		console.log("[ESA auto load bids] " + msg);
	}

	function warn(msg) {
		console.warn("[ESA auto load bids][WARNING] " + msg);
	}

	var bidsAutoLoader = new MutationObserver((mutations) => {
		var n = 0;
		$('#' + DONATIONS_TABLE_ID + ' .bidcell button').each((i, button) => {
			$(button).click();
			n++;
		});
		if (n > 0) {
			log("Loaded " + n + " donation bids");
		}
	});

	$(document).ready(() => {
		const donationsTable = document.getElementById(DONATIONS_TABLE_ID);
		if (!donationsTable) {
			warn("Could not find donations table. Aborting");
			return;
		}

		bidsAutoLoader.observe(donationsTable, {
			childList: true,
			subtree: true
		});
		log("Started bid auto loader");
	});
})();

