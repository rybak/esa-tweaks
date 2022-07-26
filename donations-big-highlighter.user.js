// ==UserScript==
// @name         ESA donations :: big donations highlighter
// @description  Highlights big donations for reading donations on ESA and BSG
// @author       https://github.com/rybak
// @homepageURL  https://github.com/rybak/esa-tweaks
// @updateURL    https://github.com/rybak/esa-tweaks/raw/main/donations-big-highlighter.user.js
// @version      1
// @license      MIT; https://github.com/rybak/esa-tweaks/blob/main/LICENSE.txt
// @match        https://donations.esamarathon.com/admin/process_donations
// @match        https://donations.esamarathon.com/admin/read_donations
// @match        https://bsgmarathon.com/tracker/admin/process_donations
// @match        https://bsgmarathon.com/tracker/admin/read_donations
// @icon         https://www.google.com/s2/favicons?domain=esamarathon.com
// @namespace    http://tampermonkey.net/
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	const MAIN_TABLE_ID = 'id_result_set';
	const BIG_DONOS_STYLE_ID = 'esaTweaksBigDonosStyle';
	const HIGHLIGHT_STYLE = 'font-size: 300%;';

	function log(msg) {
		console.log("[ESA big donations] " + msg);
	}

	function warn(msg) {
		console.warn("[ESA big donations] " + msg);
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

	function highlightBigDonations() {
		$(`#${BIG_DONOS_STYLE_ID}`).remove();
		const style = `<style id="${BIG_DONOS_STYLE_ID}"></style>`;
		$(style).appendTo($('body'));

		$('#id_result_set tr').each((rowIndex, row) => {
			$(row).find("td:nth-child(2) a").each((i, cell) => {
				const cellText = $(cell).text();
				log(cellText);
				const donationAmountRegex = new RegExp("[$](\\d+)[.]\\d+", "g");
				const m = donationAmountRegex.exec(cellText);
				if (!m || (m.length < 2)) {
					warn(`Could not parse ${cellText}`);
					return;
				}
				const amount = parseInt(m[1]);
				if (isNaN(amount)) {
					warn(`Could not parse ${cellText}`);
					return;
				}
				// arbitrary amount of $100 for ESA and €100 for BSG
				if (amount >= 100) {
					// `rowIndex` is weird a bit, because non-header rows are inside tbody => their
					// indexes in `nth-child` selector are off by one
					$(`#${BIG_DONOS_STYLE_ID}`).append('tr:nth-child(' + rowIndex + ') td:nth-child(2) { ' + HIGHLIGHT_STYLE + ' }');
				}
			});
		});
	}

	$(document).ready(() => {
		const table = document.getElementById(MAIN_TABLE_ID);
		const observer = new MutationObserver(highlightBigDonations);
		observer.observe(table, {subtree: true, childList: true});
	});
})();

