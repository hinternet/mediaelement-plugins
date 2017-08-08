'use strict';

export default class AdsParser {
	constructor (url) {
		this._url = url;
		this._tags = [];
		this._load();
	}

	_load (url) {
		const adsUrl = url || this._url;
		mejs.Utils.ajax(adsUrl, 'xml', (data) => {
			this._parse(data)
		});
	}

	_parse (data) {
		const root = data.querySelector('VAST');

		if (!root || !root.hasChildNodes()) {
			return;
		}

		const type = root.getAttribute('version');
		// Could be VPAID, so check if there's an indicator of VPAID in the MediaFile tag
		if (type === '2.0') {
			const media = root.querySelector('MediaFile');
			if (media && media.getAttribute('apiFramework') === 'VPAID') {
				this._parseVAST(root);
			} else {
				this._parseVAST(root);
			}
		} else {
			this._parseVAST(root);
		}
	}

	// _parseVPAID (root) {
	//
	// }

	_parseVAST (root) {
		const
			ads = root.getElementsByTagName('Ad'),
			totalAds = ads.length
		;

		if (!totalAds) {
			return;
		}

		for (let i = 0; i < totalAds; i++) {
			const
				node = ads[i],
				adTag = {
					id: node.id || i,
					sequence: node.getAttribute('sequence') || 0,
					impressions: [],
					mediaFiles: [],
					clickTracks: [],
					trackingEvents: {}
				},
				childTag = node.getElementsByTagName('InLine')[0]
			;

			// Detect if Inline or Wrapper tags are inside the Ad
			if (childTag.tagName.toLowerCase() === 'wrapper') {
				const
					impression = childTag.querySelector('Impression'),
					uri = childTag.querySelector('VASTAdTagURI'),
					adSystem = childTag.querySelector('AdSystem')
				;
				if (!impression || !uri || !adSystem) {
					// Error
					return;
				}
				adTag.adSystem = adSystem.getAttribute('version');
				adTag.impressions.push(impression.textContent.trim());
				this._load(uri);
			} else {

				const
					impressions = node.getElementsByTagName('Impression'),
					//mediaFiles = node.getElementsByTagName('MediaFile'),
					trackFiles = node.getElementsByTagName('Tracking'),
					clickTracks = node.getElementsByTagName('ClickTracking')
				;

				adTag.title = node.getElementsByTagName('AdTitle').length ?
					node.getElementsByTagName('AdTitle')[0].textContent.trim() : '';
				adTag.description = node.getElementsByTagName('Description').length ?
					node.getElementsByTagName('Description')[0].textContent.trim() : '';
				adTag.clickLink = node.getElementsByTagName('ClickThrough').length ?
					node.getElementsByTagName('ClickThrough')[0].textContent.trim() : '';

				for (let j = 0, impressionsTotal = impressions.length; j < impressionsTotal; j++) {
					adTag.impressions.push(impressions[j].textContent.trim());
				}

				for (let j = 0, clickTracksTotal = clickTracks.length; j < clickTracksTotal; j++) {
					adTag.clickTracks.push(clickTracks[j].textContent.trim());
				}

				for (let j = 0, tracksTotal = trackFiles.length; j < tracksTotal; j++) {
					const
						trackingEvent = trackFiles[j],
						event = trackingEvent.getAttribute('event')
					;

					if (adTag.trackingEvents[event] === undefined) {
						adTag.trackingEvents[event] = [];
					}
					adTag.trackingEvents[event].push(trackingEvent.textContent.trim());
				}

				// for (let j = 0, mediaFilesTotal = mediaFiles.length; j < mediaFilesTotal; j++) {
				// 	const
				// 		mediaFile = mediaFiles[j],
				// 		type = mediaFile.getAttribute('type')
				// 	;
				//
				// 	if (t.media.canPlayType(type) !== '' || /(no|false)/i.test(t.media.canPlayType(type))) {
				// 		if (mediaFile.getAttribute('type') === 'application/javascript') {
				// 			var script = document.createElement('script'),
				// 				firstScriptTag = document.getElementsByTagName('script')[0];
				//
				// 			script.src = mediaFile.textContent.trim();
				// 			firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
				// 		} else if (mediaFile.getAttribute('delivery') !== 'application/x-shockwave-flash') {
				// 			adTag.mediaFiles.push({
				// 				id: mediaFile.getAttribute('id'),
				// 				delivery: mediaFile.getAttribute('delivery'),
				// 				type: mediaFile.getAttribute('type'),
				// 				bitrate: mediaFile.getAttribute('bitrate'),
				// 				width: mediaFile.getAttribute('width'),
				// 				height: mediaFile.getAttribute('height'),
				// 				url: mediaFile.textContent.trim()
				// 			});
				// 		}
				// 	}
				// }
			}
		}
	}
}