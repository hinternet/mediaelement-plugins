'use strict';

import VPAIDWrapper from './vpaid-wrapper';

export default class AdsPlayer {

	/**
	 * Does not support Flash on VPAID
	 * @param media
	 * @param type
	 * @param url
	 */
	constructor (media, url, type) {

		if (~['video', 'audio'].indexOf(type)) {
			const element = document.createElement('type');
			element.id = 'admedia';
			element.src = url;
			media.appendChild(element);
			media.originalNode.removeAttribute('autoplay');
			media.style.display = 'none';
		} else if (type === 'iframe') {
			const iframe = document.createElement('iframe');
			iframe.id = 'adloaderframe';
			media.appendChild(iframe);
			media.originalNode.removeAttribute('autoplay');
			media.style.display = 'none';
			iframe.contentWindow.document.write(`<script src="${url}"></scr` + 'ipt>');
			const vpaid = iframe.contentWindow['getVPAIDAd'];
			if (vpaid && typeof vpaid === 'function') {
				new VPAIDWrapper(vpaid());
			}
		}
	}
	get paused() {
		return this.player.isPaused;
	}

	set muted (value) {
		this.setMuted(value);
	}

	get muted () {
		return this.player.isMuted;
	}

	get ended () {
		return this.endedMedia;
	}

	get readyState () {
		return this.media.originalNode.readyState;
	}

	set currentTime (value) {
		this.setCurrentTime(value);
	}

	get currentTime () {
		return this.getCurrentTime();
	}

	get duration () {
		return this.getDuration();
	}

	set volume (value) {
		this.setVolume(value);
	}

	get volume () {
		return this.getVolume();
	}

	set src (src) {
		this.setSrc(src);
	}

	get src () {
		return this.getSrc();
	}

	getSrc () {
		return this.media.originalNode.src;
	}

	setSrc (value) {
		this.media.originalNode.src = typeof value === 'string' ? value : value[0].src;
		this.load();
	}

	setCurrentTime (value) {
		this.player.currentTime = value;
		this.controller.seek();
		const event = mejs.Utils.createEvent('timeupdate', this.media);
		this.media.dispatchEvent(event);
	}

	getCurrentTime () {
		return this.player.currentTime;
	}

	getDuration () {
		return this.player.duration;
	}

	setVolume (value) {
		this.player.volumeLevel = value;
		this.controller.setVolumeLevel();
		const event = mejs.Utils.createEvent('volumechange', this.media);
		this.media.dispatchEvent(event);
	}

	getVolume () {
		return this.player.volumeLevel;
	}

	play () {
		if (this.player.isPaused) {
			this.controller.playOrPause();
			const event = mejs.Utils.createEvent('play', this.media);
			this.media.dispatchEvent(event);
		}
	}

	pause () {
		if (!this.player.isPaused) {
			this.controller.playOrPause();
			const event = mejs.Utils.createEvent('pause', this.media);
			this.media.dispatchEvent(event);
		}
	}

	load () {
		const
			t = this,
			url = this.media.originalNode.src,
			type = mejs.Utils.getTypeFromFile(url),
			mediaInfo = new chrome.cast.media.MediaInfo(url, type),
			castSession = cast.framework.CastContext.getInstance().getCurrentSession()
		;

		if (url === window.location.href || !castSession) {
			return;
		}

		// Find captions/audioTracks
		if (t.enableTracks === true) {
			const
				tracks = [],
				children = t.media.originalNode.children
			;

			let counter = 1;

			for (let i = 0, total = children.length; i < total; i++) {
				const
					child = children[i],
					tag = child.tagName.toLowerCase();

				if (tag === 'track' && (child.getAttribute('kind') === 'subtitles' || child.getAttribute('kind') === 'captions')) {
					const el = new chrome.cast.media.Track(counter, chrome.cast.media.TrackType.TEXT);
					el.trackContentId = mejs.Utils.absolutizeUrl(child.getAttribute('src'));
					el.trackContentType = 'text/vtt';
					el.subtype = chrome.cast.media.TextTrackType.SUBTITLES;
					el.name = child.getAttribute('label');
					el.language = child.getAttribute('srclang');
					el.customData = null;
					tracks.push(el);
					counter++;
				}
			}
			mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle();
			mediaInfo.tracks = tracks;
		}

		mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
		mediaInfo.streamType = t.isLive ? chrome.cast.media.StreamType.LIVE : chrome.cast.media.StreamType.BUFFERED;
		mediaInfo.customData = null;
		mediaInfo.duration = null;
		mediaInfo.currentTime = t.isLive ? Infinity : 0;

		if (t.media.originalNode.getAttribute('data-cast-title')) {
			mediaInfo.metadata.title = t.media.originalNode.getAttribute('data-cast-title');
		}

		if (t.media.originalNode.getAttribute('data-cast-description')) {
			mediaInfo.metadata.subtitle = t.media.originalNode.getAttribute('data-cast-description');
		}

		if (t.media.originalNode.getAttribute('poster')) {
			mediaInfo.metadata.images = [
				{'url': mejs.Utils.absolutizeUrl(t.media.originalNode.getAttribute('poster'))}
			];
		}

		const request = new chrome.cast.media.LoadRequest(mediaInfo);

		castSession.loadMedia(request).then(() => {
			// Autoplay media in the current position
			const currentTime = t.media.originalNode.currentTime;
			t.setCurrentTime(currentTime);
			t.play();

			const event = mejs.Utils.createEvent('play', t.media);
			t.media.dispatchEvent(event);
		}, (error) => {
			t._getErrorMessage(error);
		});
	}

	setMuted (value) {
		if (value === true && !this.player.isMuted) {
			this.controller.muteOrUnmute();
		} else if (value === false && this.player.isMuted) {
			this.controller.muteOrUnmute();
		}
		setTimeout(() => {
			const event = mejs.Utils.createEvent('volumechange', this.media);
			this.media.dispatchEvent(event);
		}, 50);
	}

	canPlayType () {
		return true;
	}
}