'use strict';

export default class VPAIDWrapper {
	constructor (VPAIDCreative) {

		this._creative = VPAIDCreative;
		if (this._checkVPAIDInterface(VPAIDCreative)) {
			return;
		}

		this.setCallbacksForCreative();
	}

	setCallbacksForCreative () {
		const callbacks = {
			AdStarted: this.onStartAd,
			AdStopped: this.onStopAd,
			AdSkipped: this.onSkipAd,
			AdLoaded: this.onAdLoaded,
			AdLinearChange: this.onAdLinearChange,
			AdSizeChange: this.onAdSizeChange,
			AdExpandedChange: this.onAdExpandedChange,
			AdSkippableStateChange: this.onAdSkippableStateChange,
			AdDurationChange: this.onAdDurationChange,
			AdRemainingTimeChange: this.onAdRemainingTimeChange,
			AdVolumeChange: this.onAdVolumeChange,
			AdImpression: this.onAdImpression,
			AdClickThru: this.onAdClickThru,
			AdInteraction: this.onAdInteraction,
			AdVideoStart: this.onAdVideoStart,
			AdVideoFirstQuartile: this.onAdVideoFirstQuartile,
			AdVideoMidpoint: this.onAdVideoMidpoint,
			AdVideoThirdQuartile: this.onAdVideoThirdQuartile,
			AdVideoComplete: this.onAdVideoComplete,
			AdUserAcceptInvitation: this.onAdUserAcceptInvitation,
			AdUserMinimize: this.onAdUserMinimize,
			AdUserClose: this.onAdUserClose,
			AdPaused: this.onAdPaused,
			AdPlaying: this.onAdPlaying,
			AdError: this.onAdError,
			AdLog: this.onAdLog
		};

		for (let event in callbacks) {
			this._creative.subscribe(callbacks[event], event, this);
		}
	}

	initAd (width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
		this._creative.initAd(width, height, viewMode, desiredBitrate, creativeData, environmentVars);
	}

	onAdPaused () {
		console.log("onAdPaused");
	}

	// Callback for AdPlaying
	onAdPlaying () {
		console.log("onAdPlaying");
	}

	// Callback for AdError
	onAdError (message) {
		console.log("onAdError: " + message);
	}

	// Callback for AdLog
	onAdLog (message) {
		console.log("onAdLog: " + message);
	}

	// Callback for AdUserAcceptInvitation
	onAdUserAcceptInvitation () {
		console.log("onAdUserAcceptInvitation");
	}

	// Callback for AdUserMinimize
	onAdUserMinimize () {
		console.log("onAdUserMinimize");
	}

	// Callback for AdUserClose
	onAdUserClose () {
		console.log("onAdUserClose");
	}

	onAdSkippableStateChange () {
		console.log("Ad Skippable State Changed to: " +
			this._creative.getAdSkippableState());
	}

	// Callback for AdUserClose
	onAdExpandedChange () {
		console.log("Ad Expanded Changed to: " + this._creative.getAdExpanded());
	}

	// Pass through for getAdExpanded
	getAdExpanded () {
		console.log("getAdExpanded");
		return this._creative.getAdExpanded();
	}

	// Pass through for getAdSkippableState
	getAdSkippableState () {
		console.log("getAdSkippableState");
		return this._creative.getAdSkippableState();
	}

	// Callback for AdSizeChange
	onAdSizeChange () {
		console.log("Ad size changed to: w=" + this._creative.getAdWidth() + "h=" +
			this._creative.getAdHeight());
	}

	// Callback for AdDurationChange
	onAdDurationChange () {
		// console.log("Ad Duration Changed to: " + this._creative.getAdDuration());
	}

	//
	onAdRemainingTimeChange () {

		// console.log("Ad Remaining Time Changed to: " +
		this._creative.getAdRemainingTime();
	}

	// Pass through for getAdRemainingTime
	getAdRemainingTime () {
		console.log("getAdRemainingTime");
		return this._creative.getAdRemainingTime();
	}

	// Callback for AdImpression
	onAdImpression () {
		console.log("Ad Impression");
	}

	// Callback for AdClickThru
	onAdClickThru () {
		console.log("Clickthrough portion of the ad was clicked");
	}

	// Callback for AdInteraction
	onAdInteraction () {
		console.log("A non-clickthrough event has occured");
	}

	// Callback for AdUserClose
	onAdVideoStart () {
		console.log("Video 0% completed");
	}

	onAdVideoFirstQuartile () {
		console.log("Video 25% completed");
	}

	onAdVideoMidpoint () {
		console.log("Video 50% completed");
	}

	// Callback for AdUserClose
	onAdVideoThirdQuartile () {
		console.log("Video 75% completed");
	}

	// Callback for AdVideoComplete
	onAdVideoComplete () {
		console.log("Video 100% completed");
	}

	// Callback for AdLinearChange
	onAdLinearChange () {
		console.log("Ad linear has changed: " + this._creative.getAdLinear())
	}

	// Pass through for getAdLinear
	getAdLinear () {
		console.log("getAdLinear");
		return this._creative.getAdLinear();
	}


	// Pass through for startAd()
	startAd () {
		console.log("startAd");
		this._creative.startAd();
	}

	onAdLoaded () {
		console.log("ad has been loaded");
	}

	// Callback for StartAd()
	onStartAd () {
		console.log("Ad has started");
	}

	//Pass through for stopAd()
	stopAd () {
		this._creative.stopAd();
	}

	// Callback for AdUserClose
	onStopAd () {
		console.log("Ad has stopped");
	}

	// Callback for AdUserClose
	onSkipAd () {
		console.log("Ad was skipped");
	}

	//Passthrough for setAdVolume
	setAdVolume (val) {
		this._creative.setAdVolume(val);
	}

	getAdVolume () {
		return this._creative.getAdVolume();
	}

	// Callback for AdVolumeChange
	onAdVolumeChange () {
		console.log("Ad Volume has changed to - " + this._creative.getAdVolume());
	}

	resizeAd () {
		this._creative.resizeAd();
	}

	pauseAd () {
		this._creative.pauseAd();
	}
	resumeAd () {
		this._creative.resumeAd();
	}

	expandAd () {
		this._creative.expandAd();
	}
	collapseAd () {
		this._creative.collapseAd();
	}

	_checkVPAIDInterface (VPAIDCreative) {
		const
			requiredElements = [
				'handshakeVersion',
				'initAd',
				'startAd',
				'stopAd',
				'skipAd',
				'resizeAd',
				'pauseAd',
				'resumeAd',
				'expandAd',
				'collapseAd',
				'subscribe',
				'unsubscribe'
			],
			total = requiredElements.length
		;

		let counter = 0;

		for (let i = 0; i < total; i++) {
			if (VPAIDCreative[requiredElements[i]] && typeof VPAIDCreative[requiredElements[i]] === 'function') {
				++counter;
			}
		}

		return counter === total;
	}
}