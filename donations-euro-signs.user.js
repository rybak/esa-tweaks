// ==UserScript==
// @name         [BSG] Euro signs
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Replaces dollar signs with euro signs for marathons that take donations in euros.
// @author       Andrei Rybak
// @match        https://donations.esamarathon.com/admin/read_donations*
// @match        https://donations.esamarathon.com/admin/process_donations*
// @match        https://bsgmarathon.com/tracker/admin/process_donations
// @match        https://bsgmarathon.com/tracker/admin/read_donations
// @icon         https://www.google.com/s2/favicons?sz=64&domain=esamarathon.com
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	function log(msg) {
		console.log("[BSG Euro signs] " + msg);
	}

	function warn(msg) {
		console.warn("[BSG Euro signs] " + msg);
	}

	function replaceDollarSignsForever() {
		replaceDollarSigns();
		// I don't know of a good way to do it only on refreshes
		setTimeout(replaceDollarSignsForever, 200);
	}

	function replaceDollarSigns() {
		$('#id_result_set td:nth-child(2) a').each((i, e) => {
			const orig = $(e).text();
			if (orig.includes('$')) {
				const newText = orig.replace('$', '€');
				$(e).text(newText);
				log("replaced '" + orig + "' with '" + newText + "'");
			}
		});
	}

	$(document).ready(() => {
		log("starting...");
		replaceDollarSignsForever();
		log("started");
	});
})();
