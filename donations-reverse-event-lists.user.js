// ==UserScript==
// @name         ESA donations :: reverse event list order
// @description  Makes it easier to get to the recent events on ESA website by reversing the default order of events.
// @author       https://github.com/rybak
// @homepageURL  https://github.com/rybak/esa-tweaks
// @version      3
// @license      MIT; https://github.com/rybak/esa-tweaks/blob/main/LICENSE.txt
// @match        https://donations.esamarathon.com/*
// @match        https://bsgmarathon.com/tracker/*
// @icon         https://www.google.com/s2/favicons?domain=esamarathon.com
// @namespace    http://tampermonkey.net/
// @grant        none
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

/*

Copyright (c) 2021 Andrei Rybak

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

(function() {
	'use strict';

	function log(msg) {
		console.log("[ESA reverse events] " + msg);
	}

	// https://stackoverflow.com/a/6973954/1083697
	function checkJqueryVersion() {
		if (typeof jQuery != 'undefined') {
			// jQuery is loaded => print the version
			log("jQuery version: " + jQuery.fn.jquery);
			return true;
		} else {
			log("No jQuery detected");
			return false;
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

	if (!checkJqueryVersion()) {
		log("Aborting");
		return;
	}
	// using jQuery already loaded by the website

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

		if (document.location.href.includes("/admin/tracker/")) {
			// https://stackoverflow.com/a/5441763/1083697
			// https://api.jquery.com/contains-selector/
			reverseChildren($('#changelist-filter h3:contains(By event)+ul'), "Filter in sidebar of admin interface");
		}
	});

})();
