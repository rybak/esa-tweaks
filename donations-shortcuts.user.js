// ==UserScript==
// @name         ESA donations :: shortcuts
// @description  Shortcuts to help reading and screening donations on ESA
// @author       https://github.com/rybak
// @homepageURL  https://github.com/rybak/esa-tweaks
// @updateURL    https://github.com/rybak/esa-tweaks/raw/main/donations-shortcuts.user.js
// @version      1.1
// @match        https://donations.esamarathon.com/admin/process_donations
// @match        https://donations.esamarathon.com/admin/read_donations
// @match        https://donations.esamarathon.com/admin/process_pending_bids
// @icon         https://www.google.com/s2/favicons?domain=esamarathon.com
// @namespace    http://tampermonkey.net/
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	/*
	 * This scripts adds following shortcuts to some pages:
	 *
	 *   [R] -- refresh the table, same as button "Refresh"
	 *   [A] -- flip the state of "Auto-refresh" checkbox
	 *
	 */

	/*
	 * This script depends on the fact that both /process_donations and
	 * /read_donations have the same structure and use the same function
	 * names and element IDs.
	 */

	function log(msg) {
		console.log("[ESA shortcuts] " + msg);
	}

	function warn(msg) {
		console.warn("[ESA shortcuts][WARNING] " + msg);
	}

	// https://stackoverflow.com/a/6973954/1083697
	function reportJqueryVersion() {
		if (typeof jQuery != 'undefined') {
			// jQuery is loaded => print the version
			log("jQuery version: " + jQuery.fn.jquery);
		} else {
			warn("No jQuery detected");
		}
	}

	// using jQuery already loaded by the website
	reportJqueryVersion();

	function refresh() {
		try {
			log("Refreshing...");
			// runSearch is defined in ESA's JS scripts
			runSearch();
		} catch (e) {
			warn("Could not 'Refresh' this page " + e);
		}
	}

	function findAutoRefreshCheckbox() {
		return $("#id_autoRefresh");
	}

	function flipAutoRefreshCheckbox() {
		const checkbox = findAutoRefreshCheckbox();
		if (checkbox.length) {
			checkbox.click();
			log("Auto-refresh changed to " + checkbox.prop('checked'));
		} else {
			log("Could not find autorefresh checkbox");
		}
	}

	$(document).ready(() => {

		$(document).on("keydown", function(e) {
			log("Pressed " + String.fromCharCode(e.which) + " code = " + e.which);
			switch(e.which) {
				case 82: // 'R'
					refresh();
					break;
				case 65: // 'A'
					flipAutoRefreshCheckbox();
					break;
			}
		});

		log("Added shorcuts handler");

	});
})();
