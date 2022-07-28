// ==UserScript==
// @name         ESA donations :: auto-autorefresh enabler
// @description  Automatically enables autorefresh when table of donations becomes empty
// @author       https://github.com/rybak
// @homepageURL  https://github.com/rybak/esa-tweaks
// @updateURL    https://github.com/rybak/esa-tweaks/raw/main/donations-auto-autorefresh.user.js
// @version      1
// @license      MIT; https://github.com/rybak/esa-tweaks/blob/main/LICENSE.txt
// @match        https://donations.esamarathon.com/admin/process_donations
// @match        https://donations.esamarathon.com/admin/process_pending_bids
// @match        https://donations.esamarathon.com/admin/read_donations
// @match        https://bsgmarathon.com/tracker/admin/process_donations
// @match        https://bsgmarathon.com/tracker/admin/process_pending_bids
// @match        https://bsgmarathon.com/tracker/admin/read_donations
// @icon         https://www.google.com/s2/favicons?domain=esamarathon.com
// @namespace    http://tampermonkey.net/
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	const MAIN_TABLE_ID = 'id_result_set';

	function log(msg) {
		console.log("[ESA auto autorefresh] " + msg);
	}

	function warn(msg) {
		console.warn("[ESA auto autorefresh] " + msg);
	}

	function findAutoRefreshCheckbox() {
		return $("#id_autoRefresh");
	}

	function enableAutoRefreshCheckbox() {
		const checkbox = findAutoRefreshCheckbox();
		if (checkbox.length) {
			log("Auto-refresh checkbox is " + checkbox.prop('checked'));
			if (!checkbox.prop('checked')) {
				checkbox.click();
				log("Auto-refresh changed to " + checkbox.prop('checked'));
			}
		} else {
			warn("Could not find autorefresh checkbox");
		}
	}

	function autoAutoRefresh() {
		const rowCount = $('#id_result_set > tbody > tr').length;
		log(`There are ${rowCount} rows in the table #${MAIN_TABLE_ID}`);
		if (rowCount == 0) {
			enableAutoRefreshCheckbox();
		}
	}

	$(document).ready(() => {
		const table = document.getElementById(MAIN_TABLE_ID);
		const observer = new MutationObserver(autoAutoRefresh);
		observer.observe(table, {subtree: true, childList: true});
	});
})();

