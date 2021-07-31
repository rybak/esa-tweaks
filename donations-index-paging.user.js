// ==UserScript==
// @name         ESA donations :: index paging
// @description  Adds links to quickly switch between pages of public indexes at donations.esamarathon.com
// @author       https://github.com/rybak
// @homepageURL  https://github.com/rybak/esa-tweaks
// @updateURL    https://github.com/rybak/esa-tweaks/raw/main/donations-index-paging.user.js
// @version      1.0
// @match        https://donations.esamarathon.com/donors/*
// @match        https://donations.esamarathon.com/donations/*
// @icon         https://www.google.com/s2/favicons?domain=esamarathon.com
// @namespace    http://tampermonkey.net/
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	function log(msg) {
		console.log("[ESA index paging] " + msg);
	}

	const PAGE_SPINNER_ID = 'page';
	const PAGE_RANGE_ABBREV_SIZE = 3;

	// adapted from https://stackoverflow.com/a/68145493/1083697
	function range(a, b) {
		return Array.from({ length: b - a }, (_, i) => a + i);
	}

	/*
	 * Returns a list of lists of page numbers to use for given left-inclusive and
	 * right-exclusive range [min, max).
	 * If [min, max) interval is short enough, all page numbers will be returned in a single list.
	 * If [min, max) is long, some of the page numbers in the middle of the interval will be skipped.
	 *
	 * Examples:
	 * [1, 8) => [[1, 2, 3, 4, 5, 6, 7]]
	 * [3, 20) => [[1, 2, 3], [17, 18, 19]]
	 */
	function abbreviatePageRange(min, max) {
		const n = max - min;
		if (n <= 7) {
			return [ range(min, max) ];
		}
		return [
			range(min, min + PAGE_RANGE_ABBREV_SIZE),
			range(max - PAGE_RANGE_ABBREV_SIZE, max)
		];
	}

	function urlWithoutParams(location) {
		return location.origin + location.pathname;
	}

	function pageUrl(pageNumber) {
		return urlWithoutParams(document.location) + '?page=' + pageNumber;
	}

	function pageLinkHtml(pageNumber) {
		return '<a href="' + pageUrl(pageNumber) + '">' + pageNumber + '</a>';
	}

	function pageRangesToLinks(pageRanges) {
		return pageRanges.map(pageRange =>
			pageRange.map(pageNumber => pageLinkHtml(pageNumber)).join(" ")
		).join(" ... ");
	}

	function addPageIndexing() {
		const currentPage = parseInt($('#' + PAGE_SPINNER_ID).val(), 10);
		if (isNaN(currentPage)) {
			// spinner for user doesn't exist => assume we are on site with no paging
			log("Can't find currentPage value. Aborting.");
			return;
		}
		const minPage = parseInt($('#' + PAGE_SPINNER_ID).attr('min'), 10);
		const maxPage = parseInt($('#' + PAGE_SPINNER_ID).attr('max'), 10);
		const container = $('#' + PAGE_SPINNER_ID).parent().parent();

		const left = abbreviatePageRange(minPage, currentPage);
		const right = abbreviatePageRange(currentPage + 1, maxPage + 1);

		const leftHtml = pageRangesToLinks(left);
		const rightHtml = pageRangesToLinks(right);
		container.append(leftHtml).append(" " + currentPage + " ").append(rightHtml);
		log("Added links to pages from " + minPage + " to " + maxPage);
	}

	addPageIndexing();
})();
