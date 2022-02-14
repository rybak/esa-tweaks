// ==UserScript==
// @name         ESA donations :: notifications
// @description  Notifies about new entries in the donations table
// @author       https://github.com/rybak
// @homepageURL  https://github.com/rybak/esa-tweaks
// @updateURL    https://github.com/rybak/esa-tweaks/raw/main/donations-notifications.user.js
// @version      1.2
// @license      MIT; https://github.com/rybak/esa-tweaks/blob/main/LICENSE.txt
// @match        https://donations.esamarathon.com/admin/process_donations
// @match        https://donations.esamarathon.com/admin/read_donations
// @match        https://donations.esamarathon.com/admin/process_pending_bids
// @icon         https://www.google.com/s2/favicons?domain=esamarathon.com
// @namespace    http://tampermonkey.net/
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	const INITIAL_DELAY_MILLIS = 1000;
	const CHECK_PERIOD_MILLIS = 5000;

	const ICON_URL = 'https://esamarathon.com/wp-content/uploads/2020/02/european-speedrun-assembly-esa-logotype-66x66.png';
	const SOUND_URL = 'https://upload.wikimedia.org/wikipedia/commons/9/91/Sound4.wav';
	const DEFAULT_AUDIO_VOLUME_INT = 50;
	const AUDIO_VOLUME_SCALE = 100.0;

	const MAIN_TABLE_ID = 'id_result_set';
	const NOTIFICATION_PERMISSION_ASK_ID = 'esaTweaksNotificationsPlease';
	const NOTIFICATION_PERMISSION_BUTTON_ID = 'esaTweaksNotificationsPermissionButton'
	const SOUND_CHECKBOX_ID = 'esaTweaksNotificationsSoundEnabled';
	const AUDIO_VOLUME_SLIDER_ID = 'esaTweaksNotificationsSoundVolume';
	const NOTIFICATION_CHECKBOX_ID = 'esaTweaksNotificationsEnabled';
	const SETTINGS_PANEL_ID = 'esaTweaksNotificationsSettings';
	const TEST_BUTTON_ID = 'esaTweaksNotificationsTestButton';

	var AUDIO;

	// state
	var currentRowsCount = 0;
	var soundEnabled = false;
	var notificationEnabled = false;

	function log(msg) {
		console.log("[ESA notifications] " + msg);
	}

	function warn(msg) {
		console.log("[ESA notifications] " + msg);
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

	// using jQuery already loaded by the website
	if (!checkJqueryVersion()) {
		log("Aborting");
		return;
	}

	function addPermissionAskButton(settingsPanel) {
		settingsPanel.append($('<div id="' + NOTIFICATION_PERMISSION_ASK_ID + '" style="display:none;">' +
			'<p>Please allow notifications.</p>' +
			'<button id="' + NOTIFICATION_PERMISSION_BUTTON_ID + '">Request notification permission</button>' +
			'</div>'));
	}

	function getSubpageName() {
		return document.location.pathname;
	}

	function addCheckbox(settingsPanel, title, id, callback) {
		const checkbox = $('<input type="checkbox" id="' + id + '"></input><label for="' + id + '">' + title + '</label>');
		const localStorageKey = getSubpageName() + id;
		settingsPanel.append(checkbox);
		checkbox.change(function() {
			const newValue = this.checked;
			log('Checkbox ' + localStorageKey + ' changed to ' + newValue);
			callback(newValue);
			localStorage.setItem(localStorageKey, newValue.toString());
		});
		const val = localStorage.getItem(localStorageKey) == "true" ? true : false;
		callback(val);
		checkbox.attr('checked', val);
	}

	function addVolumeSlider(settingsPanel) {
		const localStorageKey = getSubpageName() + AUDIO_VOLUME_SLIDER_ID;
		const slider = $('<input id="' + AUDIO_VOLUME_SLIDER_ID
			+ '" type="range" min="1" max="100" value="50" title="Change volume of notification sound">');
		var volume = undefined;
		try {
			volume = parseInt(localStorage.getItem(localStorageKey));
		} catch (ignored) {
		}
		if (isNaN(volume)) {
			volume = DEFAULT_AUDIO_VOLUME_INT;
		}
		slider.val(volume);
		AUDIO.volume = volume / AUDIO_VOLUME_SCALE;
		slider.change((e, i) => {
			const intVal = parseInt(slider.val());
			log("Volume slider new int value = " + intVal);
			localStorage.setItem(localStorageKey, intVal.toString());
			const floatVal = intVal / AUDIO_VOLUME_SCALE;
			AUDIO.volume = floatVal;
		});
		settingsPanel.append('<label for="' + AUDIO_VOLUME_SLIDER_ID + '">Volume: </label>');
		settingsPanel.append(slider);
		log("Volume slider has been added. Volume = " + volume);
	}

	function addTestNotificationButton(settingsPanel) {
		const testButton = $('<button id="' + TEST_BUTTON_ID + '">Test</button>');
		testButton.click(() => {
			notifyUser("Test notification: " + createNotificationText(-42));
			updateTestButton();
		});
		settingsPanel.append(testButton);
	}

	function updateTestButton() {
		var newText;
		if (notificationEnabled || soundEnabled) {
			newText = 'Test';
		} else {
			newText = 'Nothing to test - use checkboxes above';
		}
		log('New button text should be = ' + newText);
		$('#' + TEST_BUTTON_ID).html(newText);
	}

	function addSettingsPanel() {
		const settingsPanel = $('<div id="' + SETTINGS_PANEL_ID + '"></div>');
		settingsPanel.append('<h3 style="margin-top:0;">Notifications</h3>');
		$('body').append(settingsPanel);

		addPermissionAskButton(settingsPanel);
		settingsPanel.append('<p>Notify about new donations/bids using:</p>');
		addCheckbox(settingsPanel, 'Sound', SOUND_CHECKBOX_ID, (newValue) => {
			soundEnabled = newValue;
			updateTestButton();
		});
		settingsPanel.append('<br>');
		addCheckbox(settingsPanel, 'Popup', NOTIFICATION_CHECKBOX_ID, (newValue) => {
			notificationEnabled = newValue;
			updateTestButton();
		});
		settingsPanel.append('<br>');
		addVolumeSlider(settingsPanel);
		settingsPanel.append('<br>');
		addTestNotificationButton(settingsPanel);
		addSettingsPanelStyle();
	}

	function addSettingsPanelStyle() {
		const css = '#' + SETTINGS_PANEL_ID + ' { ' +
			`position: absolute;
	      bottom: 2rem;
	      right: 2rem;
	      border: 1px solid rgb(140, 62, 179);
	      padding: 0.5rem;

	      filter: opacity(50%);
	      width: 8rem;
	      overflow: hidden;
	      height: 2em;
	      }` +
			'#' + SETTINGS_PANEL_ID + ':hover { ' +
			`filter: opacity(100%);
	      width: 20rem;
	      height: auto;
	      }`;
		const style = document.createElement('style');

		if (style.styleSheet) {
			style.styleSheet.cssText = css;
		} else {
			style.appendChild(document.createTextNode(css));
		}

		document.getElementsByTagName('head')[0].appendChild(style);
		log("Finished setting up CSS for #" + SETTINGS_PANEL_ID);
	}


	function countRows() {
		// note: very precise selector -- don't count nested table in the "Bids" column on /read_donations
		return $('#' + MAIN_TABLE_ID + ' > tbody > tr').length - 1; // minus one for the header row
	}

	function checkRowsCount(callback) {
		const newRowsCount = countRows();
		if (newRowsCount != currentRowsCount) {
			log("Changed to " + newRowsCount + " row(s)");
			callback(currentRowsCount, newRowsCount);
		}
		currentRowsCount = newRowsCount;
	}

	function checkRowsCountPeriodically(callback, periodMillis) {
		checkRowsCount(callback);
		setTimeout(() => checkRowsCountPeriodically(callback, periodMillis), periodMillis);
	}

	function createNotificationText(diff) {
		var singular = "donation";
		if (getSubpageName().includes("bids")) {
			singular = "bid";
		}
		if (diff === 1) {
			return "Got one new " + singular + "."
		}
		return "Got " + diff + " new " + singular + "s.";
	}

	function requestNotificationPermission() {
		Notification.requestPermission().then(() => {
			if (Notification.permission === "granted") {
				$('#' + NOTIFICATION_PERMISSION_ASK_ID).hide();
			}
		});
	}

	function askPermissionIfNeeded() {
		if (Notification.permission === 'default') {
			$('#' + NOTIFICATION_PERMISSION_ASK_ID).show();
			return;
		}
	}

	function showNotification(body) {
		const title = getSubpageName();
		// https://developer.mozilla.org/en-US/docs/Web/API/notification#examples
		if (Notification.permission === "granted") {
			const options = {
				'body': body,
				'icon' : ICON_URL,
				'silent' : false,
			};
			const notification = new Notification(title, options);
			return;
		}
		askPermissionIfNeeded();
	}

	function notifyUser(notificationText) {
		if (notificationEnabled) {
			showNotification(notificationText);
		}
		if (soundEnabled) {
			AUDIO.play();
		}
	}

	function notifyAboutNewRowsCount(oldCount, newCount) {
		const diff = newCount - oldCount;
		if (diff <= 0) {
			return;
		}
		notifyUser(createNotificationText(diff));
	}

	function initializeEsaDonationsNotifications() {
		AUDIO = new Audio(SOUND_URL);
		addSettingsPanel();
		askPermissionIfNeeded();
		$('#' + NOTIFICATION_PERMISSION_BUTTON_ID).click(() => {
			requestNotificationPermission();
		});
	}

	function startRowsCounter() {
		/*
		 * Using count of rows to determine appearance of new donations means that we only notify user when
		 * amount of donations changes.  However, if donations come quick enough, this check might fail.
		 * For example: screener has two donations in the table, sends one to the reader, new donation comes in
		 * with auto-refresh -- row count remains at two, despite the fact that a new donation appeared in the
		 * table.  However, this isn't very likely and is not a concern at this point.
		 */
		currentRowsCount = countRows();
		log("Started with " + currentRowsCount + " rows(s)");
		checkRowsCountPeriodically(notifyAboutNewRowsCount, CHECK_PERIOD_MILLIS);
	}

	$(document).ready(() => {
		initializeEsaDonationsNotifications();
		setTimeout(startRowsCounter, INITIAL_DELAY_MILLIS);
	});

})();
