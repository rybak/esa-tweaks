// ==UserScript==
// @name         [BSG] autorefresh
// @description  Add autorefreshing for BSG tracker
// @author       https://github.com/rybak/
// @homepageURL  https://github.com/rybak/esa-tweaks
// @version      2
// @license      MIT; https://github.com/rybak/esa-tweaks/blob/main/LICENSE.txt
// @match        https://tracker.bsgmarathon.com/admin/process_donations
// @match        https://tracker.bsgmarathon.com/admin/read_donations
// @match        https://tracker.bsgmarathon.com/admin/process_pending_bids
// @match        https://bsgmarathon.com/tracker/admin/process_donations
// @match        https://bsgmarathon.com/tracker/admin/read_donations
// @match        https://bsgmarathon.com/tracker/admin/process_pending_bids
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bsgmarathon.com
// @namespace    http://tampermonkey.net/
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	/*
	 * Constants configurable by user.
	 */
	const AUTO_REFRESH_DELAY_MILLIS = 5000;
	const USE_ISO_8601 = false;

	// same ID as builtin checkbox on process_donations for compatibility with shortcuts user scripts
	const AUTO_REFRESH_CHECKBOX_ID = 'id_autoRefresh';
	const LAST_REFRESH_TIME_DISPLAY_ID = 'esaTweaksLastAutoRefresh';

	function log(msg) {
		console.log("[BSG autorefresh] " + msg);
	}

	function warn(msg) {
		console.warn("[ESA autorefresh][WARNING] " + msg);
	}

	function findRefreshButton() {
		return $('button:contains(Refresh)');
	}

	function refresh() {
		try {
			log("Refreshing...");
			// runSearch is defined in tracker's JS scripts
			runSearch();
		} catch (e) {
			warn("Could not 'Refresh' this page " + e);
		}
	}

	var autoRefreshEnabled = false;

	function autoRefresh() {
		if (!autoRefreshEnabled) {
			return;
		}

		refresh();
		updateLastAutoRefreshTimeDisplay();
		setTimeout(autoRefresh, AUTO_REFRESH_DELAY_MILLIS);
	}

	function addAutoRefreshCheckbox() {
		const refreshButton = findRefreshButton();
		if (!refreshButton) {
			warn("Could not find 'Refresh' button");
			return;
		}
		const newHtml = $('<label for="' + AUTO_REFRESH_CHECKBOX_ID + '"' +
			' style="margin-left:0.3em;">Auto-Refresh?</label>' +
			'<input type="checkbox" id="' + AUTO_REFRESH_CHECKBOX_ID + '">');
		refreshButton.after(newHtml);
		const checkbox = $('#' + AUTO_REFRESH_CHECKBOX_ID);

		checkbox.change(() => {
			autoRefreshEnabled = checkbox.is(':checked');
			log("Changed autoRefreshEnabled to " + autoRefreshEnabled);
			if (autoRefreshEnabled) {
				setTimeout(autoRefresh, AUTO_REFRESH_DELAY_MILLIS);
			}
		});

		log("Added 'Auto-refresh' checkbox");
	}

	function addLastAutoRefreshTimeDisplay() {
		$('#id_loading').before('<span id="' + LAST_REFRESH_TIME_DISPLAY_ID + '"' +
			' title="Timestamp of the last auto-refresh."></span> ');
		log("Added #" + LAST_REFRESH_TIME_DISPLAY_ID + " to the layout");
	}

	// Format a Date using ISO 8601 format.
	// https://stackoverflow.com/a/17415677/1083697
	function formatTimestampIso8601(date) {
		var tzo = -date.getTimezoneOffset();
		var dif = tzo >= 0 ? '+' : '-';
		var pad = function(num) {
			var norm = Math.floor(Math.abs(num));
			return (norm < 10 ? '0' : '') + norm;
		};

		return date.getFullYear() +
			'-' + pad(date.getMonth() + 1) +
			'-' + pad(date.getDate()) +
			'T' + pad(date.getHours()) +
			':' + pad(date.getMinutes()) +
			':' + pad(date.getSeconds()) +
			dif + pad(tzo / 60) +
			':' + pad(tzo % 60);
	}

	function formatTimestamp(date) {
		if (USE_ISO_8601) {
			return formatTimestampIso8601(date);
		} else {
			return date.toLocaleString();
		}
	}

	function updateLastAutoRefreshTimeDisplay() {
		const s = formatTimestamp(new Date());
		$('#' + LAST_REFRESH_TIME_DISPLAY_ID).text(s);
		log("Last autorefresh: " + s);
	}

	$(document).ready(() => {
		addAutoRefreshCheckbox();
		addLastAutoRefreshTimeDisplay();
	});
})();
