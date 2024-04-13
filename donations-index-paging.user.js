// ==UserScript==
// @name         ESA donations :: index paging
// @description  Adds links to quickly switch between pages of public indexes at donations.esamarathon.com
// @author       https://github.com/rybak
// @homepageURL  https://github.com/rybak/esa-tweaks
// @version      5
// @license      MIT; https://github.com/rybak/esa-tweaks/blob/main/LICENSE.txt
// @match        https://donations.esamarathon.com/donors/*
// @match        https://donations.esamarathon.com/donations/*
// @match        https://uksg.esamarathon.com/donors/*
// @match        https://uksg.esamarathon.com/donations/*
// @match        https://tracker.bsgmarathon.com/*
// @match        https://gamesdonequick.com/tracker/donors/*
// @match        https://gamesdonequick.com/tracker/donations/*
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
	 * If [min, max) is long, some of the page numbers in the middle of the interval will be skipped, but some
	 * milestones depending on the scale of `total` will be kept.
	 *
	 * Examples:
	 * [1, 8) => [[1, 2, 3, 4, 5, 6, 7]]
	 * [1, 250) => [[1, 2, 3], [50, 100, 150, 200], [247, 248, 249]]
	 */
	function abbreviatePageRange(min, max, total) {
		const n = max - min;
		if (n <= 7) {
			return [ range(min, max) ];
		}
		var milestones = getMilestones(min + PAGE_RANGE_ABBREV_SIZE, max - PAGE_RANGE_ABBREV_SIZE, total);
		if (milestones.length == 0) {
			return [
				range(min, min + PAGE_RANGE_ABBREV_SIZE),
				range(max - PAGE_RANGE_ABBREV_SIZE, max)
			];
		} else {
			return [
				range(min, min + PAGE_RANGE_ABBREV_SIZE),
				milestones,
				range(max - PAGE_RANGE_ABBREV_SIZE, max)
			];
		}
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

	function getMilestones(min, max, n) {
		if (n <= 50) {
			return [];
		}
		var step;
		// crude calculation for really big numbers
		if (n >= 50000) {
			step = Math.pow(10, Math.floor(Math.log10(n))) / 2;
		}
		// hand pickes numbers for smaller numbers
		if (n > 10000 && n < 50000) {
			step = 5000;
		}
		if (n > 5000 && n <= 10000) {
			step = 1000;
		}
		if (n > 1000 && n <= 5000) {
			step = 500;
		}
		if (n > 500 && n <= 1000) {
			step = 100;
		}
		if (n > 100 && n <= 500) {
			step = 50;
		}
		if (n > 50 && n <= 100) {
			step = 10;
		}
		var milestones = [];
		for (var i = step; i < max; i += step) {
			if (i < min) {
				// This could be a binary search, but because we control the scale, linear search is
				// fine.  Linear search is simpler, therefore better.
				continue;
			}
			milestones.push(i);
		}
		return milestones;
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
		const total = maxPage - minPage + 1;
		const container = $('#' + PAGE_SPINNER_ID).parent().parent();

		const left = abbreviatePageRange(minPage, currentPage, total);
		const right = abbreviatePageRange(currentPage + 1, maxPage + 1, total);

		log(left);
		log(right);
		const leftHtml = pageRangesToLinks(left);
		const rightHtml = pageRangesToLinks(right);
		container.append(leftHtml).append(" " + currentPage + " ").append(rightHtml);
		log("Added links to pages from " + minPage + " to " + maxPage);
	}

	addPageIndexing();
})();
