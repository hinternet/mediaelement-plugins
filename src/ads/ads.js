'use strict';

// import AdsPlayer from './player';
import AdsParser from './parser';

// Translations (English required)
mejs.i18n.en['mejs.ad-skip'] = 'Skip ad';
mejs.i18n.en['mejs.ad-skip-info'] = ['Skip in 1 second', 'Skip in %1 seconds'];

Object.assign(mejs.MepDefaults, {
	adsUrl: ''
});

Object.assign(MediaElementPlayer.prototype, {

	/**
	 * Feature constructor.
	 *
	 * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
	 * @param {MediaElementPlayer} player
	 * @param {HTMLElement} controls
	 * @param {HTMLElement} layers
	 */
	buildads (player, controls, layers) {
		if (!player.options.adsUrl) {
			return;
		}


		// add layer for ad links and skipping
		player.adsLayer = document.createElement('div');
		player.adsLayer.className = `${player.options.classPrefix}layer ${player.options.classPrefix}overlay ${player.options.classPrefix}ads`;
		player.adsLayer.innerHTML = `<a href="#" target="_blank"></a>` +
			`<div class="${player.options.classPrefix}ads-skip-block">` +
			`<span class="${player.options.classPrefix}ads-skip-message"></span>` +
			`<span class="${player.options.classPrefix}ads-skip-button">${mejs.i18n.t('mejs.ad-skip')}</span>` +
			`</div>`;
		player.adsLayer.style.display = 'none';

		layers.insertBefore(player.adsLayer, layers.querySelector(`.${player.options.classPrefix}overlay-play`));

		player.adsSkipBlock = player.adsLayer.querySelector(`.${player.options.classPrefix}ads-skip-block`);
		player.adsSkipBlock.style.display = 'none';
		player.adsSkipMessage = player.adsLayer.querySelector(`.${player.options.classPrefix}ads-skip-message`);
		player.adsSkipMessage.style.display = 'none';
		player.adsSkipButton = player.adsLayer.querySelector(`.${player.options.classPrefix}ads-skip-button`);
		//player.adsSkipButton.addEventListener('click', player._adsSkipClick.bind(player));

		// parse Ads link to find
		new AdsParser(player.options.adsUrl);

		// create new player
		// player.adsPlayer = new AdsPlayer(media, url, 'iframe');

		player.setupEvents();
	},
	// cleanads () {
	//
	// },
	_adsSkipClick (e) {
		// const t = this;
		//
		// t.media.removeEventListener('ended', t.adsPrerollEndedProxy);
		//
		// let event = mejs.Utils.createEvent('mejsprerollskipclicked', t.container);
		// t.container.dispatchEvent(event);
		//
		// event = mejs.Utils.createEvent('mejsprerollended', t.container);
		// t.container.dispatchEvent(event);
		//
		// t.options.indexPreroll++;
		// if (t.options.indexPreroll < t.options.adsPrerollMediaUrl.length) {
		// 	t.adsStartPreroll();
		// } else {
		// 	t.adRestoreMainMedia();
		// }

		e.preventDefault();
		e.stopPropagation();


	},
	setupEvents () {

		const t = this;

		let
			firstQuartExecuted = false,
			secondQuartExecuted = false,
			thirdQuartExecuted = false
		;

		// LOAD: preroll
		t.container.addEventListener('mejsprerollinitialized', () => {
			if (t.AdTags.length > 0) {

				const adTag = t.AdTags[0];

				if (adTag.trackingEvents.initialization) {
					for (let i = 0, total = adTag.trackingEvents.initialization.length; i < total; i++) {
						t.adsLoadUrl(adTag.trackingEvents.initialization[i]);
					}
				}
			}
		});


		// START: preroll
		t.container.addEventListener('mejsprerollstarted', () => {

			if (t.AdTags.length > 0) {

				const adTag = t.AdTags[0];

				// always fire this event
				if (adTag.trackingEvents.start) {
					for (let i = 0, total = adTag.trackingEvents.start.length; i < total; i++) {
						t.adsLoadUrl(adTag.trackingEvents.start[i]);
					}
				}

				// only do impressions once
				if (!adTag.shown && adTag.impressions.length > 0) {
					for (let i = 0, total = adTag.impressions.length; i < total; i++) {
						t.adsLoadUrl(adTag.impressions[i]);
					}
				}

				adTag.shown = true;
			}
		});

		// VOLUMECHANGE: preroll
		t.container.addEventListener('mejsprerollvolumechanged', () => {

			if (t.AdTags.length > 0 && t.options.indexPreroll < t.AdTags.length) {
				const adTag = t.AdTags[t.options.indexPreroll];


				if (adTag.trackingEvents.mute && !t.media.volume) {
					for (let i = 0, total = adTag.trackingEvents.mute.length; i < total; i++) {
						t.adsLoadUrl(adTag.trackingEvents.mute[i]);
					}
				}

				if (adTag.trackingEvents.unmute && t.media.volume) {
					for (let i = 0, total = adTag.trackingEvents.unmute.length; i < total; i++) {
						t.adsLoadUrl(adTag.trackingEvents.unmute[i]);
					}
				}
			}
		});

		// UPDATE: preroll
		t.container.addEventListener('mejsprerolltimeupdate', (e) => {

			if (t.AdTags.length > 0 && t.options.indexPreroll < t.AdTags.length) {
				const
					duration = e.detail.duration,
					current = e.detail.currentTime,
					percentage = Math.min(1, Math.max(0, current / duration)) * 100,
					adTag = t.AdTags[t.options.indexPreroll],
					isFirsQuart = percentage >= 25 && percentage < 50,
					isMidPoint = percentage >= 50 && percentage < 75,
					isThirdQuart = percentage >= 75 && percentage < 100
				;

				// Check which track is going to be fired
				if (adTag.trackingEvents.firstQuartile && !firstQuartExecuted && isFirsQuart) {
					for (let i = 0, total = adTag.trackingEvents.firstQuartile.length; i < total; i++) {
						t.adsLoadUrl(adTag.trackingEvents.firstQuartile[i]);
					}
					firstQuartExecuted = true;
				} else if (adTag.trackingEvents.midpoint && !secondQuartExecuted && isMidPoint) {
					for (let i = 0, total = adTag.trackingEvents.midpoint.length; i < total; i++) {
						t.adsLoadUrl(adTag.trackingEvents.midpoint[i]);
					}
					secondQuartExecuted = true;
				} else if (adTag.trackingEvents.thirdQuartile && !thirdQuartExecuted && isThirdQuart) {
					for (let i = 0, total = adTag.trackingEvents.thirdQuartile.length; i < total; i++) {
						t.adsLoadUrl(adTag.trackingEvents.thirdQuartile[i]);
					}
					thirdQuartExecuted = true;
				}
			}
		});

		// END: preroll
		t.container.addEventListener('mejsprerollended', () => {

			const adTag = t.AdTags[t.options.indexPreroll];

			if (t.AdTags.length > 0 && t.options.indexPreroll < t.AdTags.length && adTag.trackingEvents.complete) {
				for (let i = 0, total = adTag.trackingEvents.complete.length; i < total; i++) {
					t.adsLoadUrl(adTag.trackingEvents.complete[i]);
				}
			}

			firstQuartExecuted = false;
			secondQuartExecuted = false;
			thirdQuartExecuted = false;
		});

		// ADCLICKED: preroll
		t.container.addEventListener('mejsprerolladsclicked', () => {
			const adTag = t.AdTags[t.options.indexPreroll];

			if (t.AdTags.length > 0 && t.options.indexPreroll < t.AdTags.length && adTag.clickThrough && adTag.clickTracking) {
				t.adsLoadUrl(adTag.clickTracking);
			}
		});

		// ADSKIPPED: preroll
		t.container.addEventListener('mejsprerollskipclicked', () => {

			const adTag = t.AdTags[t.options.indexPreroll];

			if (t.AdTags.length > 0 && t.options.indexPreroll < t.AdTags.length && adTag.trackingEvents.skip) {
				for (let i = 0, total = adTag.trackingEvents.skip.length; i < total; i++) {
					t.adsLoadUrl(adTag.trackingEvents.skip[i]);
				}
			}
		});
	},

	/**
	 *
	 * @param {String} url
	 */
	setAdTagUrl (url) {

		const t = this;

		// set and reset
		t.options.AdTagUrl = url;
		t.options.indexPreroll = 0;
		t.AdTagIsLoaded = false;
		t.AdTags = [];
	},

	/**
	 *
	 */
	loadAdTagInfo () {
		const t = this;

		// set this to stop playback
		t.adsDataIsLoading = true;
		t.AdTagIsLoading = true;

		// try straight load first
		t.loadAdTagInfoDirect();
	},

	/**
	 *
	 */
	loadAdTagInfoDirect () {
		const t = this;

		mejs.Utils.ajax(t.options.AdTagUrl, 'xml', (data) => {
			if (t.options.AdsType === 'vpaid') {
				t.vpaidParseVpaidData(data);
			} else {
				t.ParseData(data);
			}
		}, (err) => {
			console.error('3:direct:error', err);

			// fallback to Yahoo proxy
			t.loadAdTagInfoProxy();
		});
	},

	/**
	 *
	 */
	loadAdTagInfoProxy () {
		const
			t = this,
			protocol = location.protocol,
			query = `select * from xml where url="${encodeURI(t.options.AdTagUrl)}"`,
			yahooUrl = `http${(/^https/.test(protocol) ? 's' : '')}://query.yahooapis.com/v1/public/yql?format=xml&q=${query}`
		;

		mejs.Utils.ajax(yahooUrl, 'xml', (data) => {
			if (t.options.AdsType === 'vpaid') {
				t.vpaidParseVpaidData(data);
			} else {
				t.ParseData(data);
			}
		}, (err) => {
			console.error(':proxy:yahoo:error', err);
		});
	},

	/**
	 * Parse a  XML source and build adTags entities.
	 *
	 * This is compliant with VPAID 3.0
	 * @param {String} data
	 */
	parse (data) {

		const
			t = this,
			ads = data.getElementsByTagName('Ad')
		;

		if (!ads.length) {
			return;
		}

		// clear out data
		t.AdTags = [];
		t.options.indexPreroll = 0;

		for (let i = 0, total = ads.length; i < total; i++) {
			const
				adNode = ads[i],
				title = adNode.getElementsByTagName('AdTitle').length ?
					adNode.getElementsByTagName('AdTitle')[0].textContent.trim() : '',
				description = adNode.getElementsByTagName('Description').length ?
					adNode.getElementsByTagName('Description')[0].textContent.trim() : '',
				clickLink = adNode.getElementsByTagName('ClickThrough').length ?
					adNode.getElementsByTagName('ClickThrough')[0].textContent.trim() : '',
				clickTrack = adNode.getElementsByTagName('ClickTracking').length ?
					adNode.getElementsByTagName('ClickTracking')[0].textContent.trim() : '',
				adTag = {
					id: adNode.getAttribute('id'),
					title: title,
					description: description,
					impressions: [],
					clickThrough: clickLink,
					clickTracking: clickTrack,
					mediaFiles: [],
					trackingEvents: {},
					// internal tracking if it's been used
					shown: false
				},
				impressions = adNode.getElementsByTagName('Impression'),
				mediaFiles = adNode.getElementsByTagName('MediaFile'),
				trackFiles = adNode.getElementsByTagName('Tracking')
			;

			t.AdTags.push(adTag);

			for (let j = 0, impressionsTotal = impressions.length; j < impressionsTotal; j++) {
				adTag.impressions.push(impressions[j].textContent.trim());
			}

			for (let j = 0, tracksTotal = trackFiles.length; j < tracksTotal; j++) {
				const trackingEvent = trackFiles[j], event = trackingEvent.getAttribute('event');

				if (adTag.trackingEvents[event] === undefined) {
					adTag.trackingEvents[event] = [];
				}
				adTag.trackingEvents[event].push(trackingEvent.textContent.trim());
			}

			for (let j = 0, mediaFilesTotal = mediaFiles.length; j < mediaFilesTotal; j++) {
				const
					mediaFile = mediaFiles[j],
					type = mediaFile.getAttribute('type')
				;

				if (t.media.canPlayType(type) !== '' || /(no|false)/i.test(t.media.canPlayType(type))) {

					// Execute JS files if found
					if (mediaFile.getAttribute('type') === 'application/javascript') {
						const
							script = document.createElement('script'),
							firstScriptTag = document.getElementsByTagName('script')[0]
						;

						script.src = mediaFile.textContent.trim();
						firstScriptTag.parentNode.insertBefore(script, firstScriptTag);

					}
					// Avoid Flash
					else if (mediaFile.getAttribute('delivery') !== 'application/x-shockwave-flash') {
						adTag.mediaFiles.push({
							id: mediaFile.getAttribute('id'),
							delivery: mediaFile.getAttribute('delivery'),
							type: mediaFile.getAttribute('type'),
							bitrate: mediaFile.getAttribute('bitrate'),
							width: mediaFile.getAttribute('width'),
							height: mediaFile.getAttribute('height'),
							url: mediaFile.textContent.trim()
						});
					}
				}
			}
		}

		// DONE
		t.Loaded();
	},

	/**
	 * Parse a VPAID XML source and build adTags entities.
	 *
	 * This is compliant with VPAID 2.0
	 * @param {String} data
	 */
	vpaidParseVpaidData (data) {

		const
			t = this,
			ads = data.getElementsByTagName('AdParameters')
		;

		// clear out data
		t.vpaidAdTags = [];
		t.options.indexPreroll = 0;

		if (typeof ads[0] === 'undefined') {
			return;
		}

		const
			adData = JSON.parse(ads[0].textContent.trim()),
			duration = data.getElementsByTagName('Duration'),
			adTag = {
				id: adData.ad_id.trim(),
				title: adData.title.trim(),
				clickThrough: adData.page_url,
				impressions: [],
				mediaFiles: [],
				trackingEvents: {},
				// internal tracking if it's been used
				shown: false
			}
		;

		if (typeof adData.media.tracking.beacon !== 'undefined') {

			const trackingPoints = ['initialization', 'start', 'firstQuartile', 'midpoint', 'thirdQuartile', 'complete'];

			for (let i = 0, total = adData.media.tracking.beacon.length; i < total; i++) {
				const trackingEvent = adData.media.tracking.beacon[i];

				if (~trackingPoints.indexOf(trackingEvent.type)) {
					if (adTag.trackingEvents[trackingEvent.type] === undefined) {
						adTag.trackingEvents[trackingEvent.type] = [];
					}
					adTag.trackingEvents[trackingEvent.type].push(trackingEvent.beacon_url.trim());
				} else if (trackingEvent.type === 'impression') {
					adTag.impressions.push(trackingEvent.beacon_url.trim());
				}
			}
		}

		for (const property in adData.media.video) {
			if (adData.media.video.hasOwnProperty(property)) {
				const
					mediaFile = adData.media.video[property],
					type = mediaFile.mime_type.trim()
				;

				if (t.media.canPlayType(type) !== '' || /(no|false)/i.test(t.media.canPlayType(type))) {

					adTag.mediaFiles.push({
						id: mediaFile.media_id,
						format: mediaFile.format,
						type: type,
						transcoding: mediaFile.transcoding,
						width: mediaFile.width,
						height: mediaFile.height,
						duration: duration,
						url: mediaFile.media_url
					});
				}
			}
		}

		t.AdTags.push(adTag);

		// DONE
		t.Loaded();
	},

	/**
	 *
	 */
	Loaded () {
		const t = this;

		t.AdTagIsLoaded = true;
		t.AdTagIsLoading = false;
		t.adsDataIsLoading = false;
		t.StartPreroll();
	},

	/**
	 *
	 */
	StartPreroll () {
		const t = this;

		// if we have a media URL, then send it up to the ads plugin as a preroll
		// load up the  ads to be played before the selected media.
		// Note: multiple preroll ads are supported.
		let i = 0;
		while (i < t.AdTags.length) {
			if (typeof t.AdTags[i].mediaFiles !== 'undefined' && t.AdTags[i].mediaFiles.length) {
				t.options.adsPrerollMediaUrl[i] = t.AdTags[i].mediaFiles[0].url;
			}
			if (typeof t.AdTags[i].clickThrough !== 'undefined') {
				t.options.adsPrerollAdUrl[i] = t.AdTags[i].clickThrough;
			}
			i++;
		}
		t.adsStartPreroll();

	}
});