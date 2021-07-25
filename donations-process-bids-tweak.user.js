// ==UserScript==
// @name         ESA donations :: tweak process bids layout
// @description  Remove "br" tags from the layout to reduce used vertical space.
// @author       https://github.com/rybak
// @homepageURL  https://github.com/rybak/esa-tweaks
// @updateURL    https://github.com/rybak/esa-tweaks/raw/main/donations-process-bids-tweak.user.js
// @version      1.1
// @license      MIT; https://github.com/rybak/esa-tweaks/blob/main/LICENSE.txt
// @match        https://donations.esamarathon.com/admin/process_pending_bids
// @icon         https://www.google.com/s2/favicons?domain=esamarathon.com
// @namespace    http://tampermonkey.net/
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	function log(msg) {
		console.log("[ESA tweak process bids layout] " + msg);
	}

	function warn(msg) {
		console.warn("[ESA tweak process bids layout][WARNING] " + msg);
	}

	function removeLinebreaks() {
		try {
			$($($('.container-fluid')[0]).children('br')[0]).remove();
			log("Removed linebreaks");
		} catch (e) {
			warn("Could not remove linebreaks " + e);
		}
	}

	$(document).ready(() => {
		removeLinebreaks();
	});
})();
