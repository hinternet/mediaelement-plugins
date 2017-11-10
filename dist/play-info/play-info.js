/*!
 * MediaElement.js
 * http://www.mediaelementjs.com/
 *
 * Wrapper that mimics native HTML5 MediaElement (audio and video)
 * using a variety of technologies (pure JavaScript, Flash, iframe)
 *
 * Copyright 2010-2017, John Dyer (http://j.hn/)
 * License: MIT
 *
 */(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

mejs.i18n.en['mejs.play-info-toggle'] = 'Toggle play info';

Object.assign(mejs.MepDefaults, {
    playInfo: null
});

Object.assign(MediaElementPlayer.prototype, {
    buildplayinfo: function buildplayinfo(player, controls, layers) {

        var toggleButtonTitle = mejs.i18n.t('mejs.play-info-toggle');

        if (player.createPlayInfo()) {
            return;
        }

        player.currentPlaylistItem = 0;
        player.originalControlsIndex = controls.style.zIndex;
        controls.style.zIndex = 5;

        player.playInfoLayer = document.createElement('div');
        player.playInfoLayer.className = player.options.classPrefix + 'play-info-layer  ' + player.options.classPrefix + 'layer ' + (player.isVideo ? player.options.classPrefix + 'play-info-hidden' : '');
        player.playInfoLayer.innerHTML = '<ul class="' + player.options.classPrefix + 'play-info-container"></ul>';
        layers.insertBefore(player.playInfoLayer, layers.firstChild);

        for (var i = 0, total = player.listItems.length; i < total; i++) {
            player.playInfoLayer.querySelector('ul').innerHTML += player.listItems[i];
        }

        if (player.isVideo) {
            player.playInfoButton = document.createElement('div');
            player.playInfoButton.className = player.options.classPrefix + 'button ' + player.options.classPrefix + 'play-info-button';
            player.playInfoButton.innerHTML = '<button type="button" aria-controls="' + player.id + '" title="' + toggleButtonTitle + '" aria-label="' + toggleButtonTitle + '" tabindex="0"></button>';
            player.playInfoButton.addEventListener('click', function () {
                mejs.Utils.toggleClass(player.playInfoLayer, player.options.classPrefix + 'play-info-hidden');
            });
            player.addControlElement(player.playInfoButton, 'play-info');
        } else {
            var items = player.playInfoLayer.querySelectorAll('li');

            if (items.length <= 10) {
                var height = 0;
                for (var _i = 0, _total = items.length; _i < _total; _i++) {
                    height += items[_i].offsetHeight;
                }
                player.container.style.height = height + 'px';
            }
        }
    },
    cleanplayinfo: function cleanplayinfo(player, controls, layers, media) {
        media.removeEventListener('ended', player.endedCallback);
    },
    createPlayInfo: function createPlayInfo() {
        var t = this;

        t.playInfo = t.options.playInfo ? t.options.playInfo : {};

        if (!t.options.playInfo) {
            var children = t.mediaFiles || t.media.originalNode.children;

            for (var i = 0; i < 1; i++) {
                var childNode = children[i];

                if (childNode.tagName.toLowerCase() === 'source') {
                    (function () {
                        var elements = {};
                        Array.prototype.slice.call(childNode.attributes).forEach(function (item) {
                            elements[item.name] = item.value;
                        });

                        if (elements.src && elements.type && elements.title) {
                            elements.type = mejs.Utils.formatType(elements.src, elements.type);
                            t.playInfo = elements;
                        }
                    })();
                }
            }
        }

        t.listItems = [];

        var element = t.playInfo,
            item = document.createElement('li'),
            id = t.id + '_play-info_0',
            thumbnail = element['data-play-info-thumbnail'] ? '<div class="' + t.options.classPrefix + 'play-info-item-thumbnail"><img tabindex="-1" src="' + element['data-play-info-thumbnail'] + '"></div>' : '',
            description = element['data-play-info-description'] ? '<div class="' + t.options.classPrefix + 'play-info-item-description">' + element['data-play-info-description'] + '</div>' : '';
        item.tabIndex = 0;
        item.className = t.options.classPrefix + 'play-info-selector-list-item ' + t.options.classPrefix + 'play-info-selected';
        item.innerHTML = '<div class="' + t.options.classPrefix + 'play-info-item-inner">' + ('' + thumbnail) + ('<div class="' + t.options.classPrefix + 'play-info-item-content">') + ('<div><input type="radio" class="' + t.options.classPrefix + 'play-info-selector-input" ') + ('name="' + t.id + '_playlist" id="' + id + '" data-play-info-index="' + 0 + '" value="' + element.src + '" disabled>') + ('<label class="' + t.options.classPrefix + 'play-info-selector-label" ') + ('for="' + id + '">' + element.title + '</label></div>' + description + '</div></div>');

        t.listItems.push(item.outerHTML);
    }
});

},{}]},{},[1]);
