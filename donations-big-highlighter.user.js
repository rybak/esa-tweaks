// ==UserScript==
// @name         ESA donations :: big donations highlighter
// @description  Highlights big donations for reading donations on ESA and BSG
// @author       https://github.com/rybak
// @homepageURL  https://github.com/rybak/esa-tweaks
// @version      4
// @license      MIT; https://github.com/rybak/esa-tweaks/blob/main/LICENSE.txt
// @match        https://donations.esamarathon.com/admin/process_donations
// @match        https://donations.esamarathon.com/admin/read_donations
// @match        https://uksg.esamarathon.com/admin/process_donations
// @match        https://uksg.esamarathon.com/admin/read_donations
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
	const HIGHLIGHT_STYLE_100 = 'font-size: 300%;';
	const HIGHLIGHT_STYLE_500 = 'font-size: 500%; font-weight: 700;';

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

		$('#id_result_set > tbody > tr').each((rowIndex, row) => {
			$(row).find("td:nth-child(2) a").each((i, cell) => {
				const cellText = $(cell).text();
				log("Row: " + rowIndex + " amount: " + cellText);
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
				var highlightStyle = '';
				if (amount >= 100) {
					highlightStyle = HIGHLIGHT_STYLE_100;
				}
				if (amount >= 500) {
					highlightStyle = HIGHLIGHT_STYLE_500;
				}
				if (highlightStyle == '') {
					return;
				}
				$(`#${BIG_DONOS_STYLE_ID}`).append('#' + MAIN_TABLE_ID + ' > tbody > tr:nth-child(' + (rowIndex + 1) + ') > td:nth-child(2) { ' + highlightStyle + ' }');
			});
		});
	}

	$(document).ready(() => {
		const table = document.getElementById(MAIN_TABLE_ID);
		const observer = new MutationObserver(highlightBigDonations);
		observer.observe(table, {subtree: true, childList: true});
	});
})();

