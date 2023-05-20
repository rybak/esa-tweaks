// ==UserScript==
// @name         [BSG] Regular mode
// @namespace    http://tampermonkey.net/
// @description  Automatically switches processing mode to "Regular"
// @author       https://github.com/rybak
// @homepageURL  https://github.com/rybak/esa-tweaks
// @version      4
// @license      MIT; https://github.com/rybak/esa-tweaks/blob/main/LICENSE.txt
// @match        https://bsgmarathon.com/tracker/admin/process_donations
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bsgmarathon.com
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
