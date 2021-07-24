// ==UserScript==
// @name         ESA donations :: auto-refresh processing bids
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add auto-refreshing for /admin/process_pending_bids
// @author       https://github.com/rybak/
// @homepageURL  https://github.com/rybak/esa-tweaks
// @match        https://donations.esamarathon.com/admin/process_pending_bids
// @icon         https://www.google.com/s2/favicons?domain=esamarathon.com
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	const AUTO_REFRESH_DELAY_MILLIS = 5000;
	const AUTO_REFRESH_CHECKBOX_ID = 'id_autoRefresh';
	const LAST_REFRESH_TIME_DISPLAY_ID = 'esaTweaksLastAutoRefresh';

	function log(msg) {
		console.log("[ESA auto-refresh processing bids] " + msg);
	}

	function warn(msg) {
		console.warn("[ESA auto-refresh processing bids][WARNING] " + msg);
	}

	function findRefreshButton() {
		for (const b of document.getElementsByTagName('button')) {
			if ($(b).text() == 'Refresh') {
				return $(b);
			}
		}
		return null;
	}

	function refresh() {
		try {
			log("Refreshing...");
			// runSearch is defined in ESA's JS scripts
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
		const newHtml = $('<label for="' + AUTO_REFRESH_CHECKBOX_ID + '" style="margin-left:0.3em;">Auto-Refresh?</label>' +
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
		$('#id_loading').before('<span id="' + LAST_REFRESH_TIME_DISPLAY_ID + '"></span> ');
		log("Added #" + LAST_REFRESH_TIME_DISPLAY_ID + " to the layout");
	}

	// https://stackoverflow.com/a/17415677/1083697
	function formatTimestamp(date) {
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