// ==UserScript==
// @name         ESA donations :: reverse event list order
// @description  Makes it easier to get to the recent events on ESA website by reversing the default order of events.
// @author       https://github.com/rybak
// @homepageURL  https://github.com/rybak/esa-tweaks
// @updateURL    https://github.com/rybak/esa-tweaks/raw/main/donations-reverse-event-lists.user.js
// @version      1.1
// @match        https://donations.esamarathon.com/*
// @icon         https://www.google.com/s2/favicons?domain=esamarathon.com
// @namespace    http://tampermonkey.net/
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	function log(msg) {
		console.log("[ESA reverse events] " + msg);
	}

	// https://stackoverflow.com/a/6973954/1083697
	function reportJqueryVersion() {
		if (typeof jQuery != 'undefined') {
			// jQuery is loaded => print the version
			log("jQuery version: " + jQuery.fn.jquery);
		} else {
			log("[WARNING] No jQuery detected");
		}
	}

	// https://stackoverflow.com/a/5347882/1083697
	function reverseChildren(element, message) {
		if (!element) {
			log("Could not reverse " + message);
			return;
		}
		element.children().each(function(i,li) {
			element.prepend(li);
		});
		log("Reversed " + message);
	}

	// using jQuery already loaded by the website
	reportJqueryVersion();

	$(document).ready(() => {
		if (document.location.href.endsWith("/events/")) {
			reverseChildren($(".list-group.center-block"), "big list on /events");
		}

		function reverseEventsDropdown() {
			var toggle = $(".dropdown").children(".dropdown-toggle")[0];
			if (!toggle) {
				return;
			}
			toggle = $(toggle);
			if (toggle.text() != "Events ") {
				return;
			}
			reverseChildren($(".dropdown .dropdown-menu.small"), "Events dropdown");
		}
		reverseEventsDropdown();
		
		// TODO reverse list in bids filters
	});

})();
