// ==UserScript==
// @name         [BSG] Regular mode
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Automatically switches processing mode to "Regular"
// @author       Andrei Rybak
// @match        https://bsgmarathon.com/tracker/admin/process_donations
// @icon         https://www.google.com/s2/favicons?sz=64&domain=esamarathon.com
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	function log(msg) {
		console.log("[BSG Regular mode] " + msg);
	}

	function warn(msg) {
		console.warn("[BSG Regular mode] " + msg);
	}

	$(document).ready(() => {
		log("starting...");
		// for testing:
		// $("#id_process_mode").val("confirm");
		$("#id_process_mode").val("normal");
		log("changed");
	});
})();
