'use strict';

/**
 * Play info plugin
 *
 * This feature is an spin-off of the playlist plugin
 * for one-element playlist.
 */

// Translations (English required)
mejs.i18n.en['mejs.play-info-toggle'] = 'Toggle play info';

// Feature configuration
Object.assign(mejs.MepDefaults, {
    /**
     * MUST have `src` and `title`; other items: `data-thumbnail`, `type`, `description`
     * @type {Object}
     */
    playInfo: null,
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
    buildplayinfo (player, controls, layers) {

        const
            toggleButtonTitle = mejs.i18n.t('mejs.play-info-toggle')
        ;

        if (player.createPlayInfo()) {
            return;
        }

        player.currentPlaylistItem = 0;
        player.originalControlsIndex = controls.style.zIndex;
        controls.style.zIndex = 5;

        player.playInfoLayer = document.createElement('div');
        player.playInfoLayer.className = `${player.options.classPrefix}play-info-layer  ${player.options.classPrefix}layer ${(player.isVideo ? `${player.options.classPrefix}play-info-hidden` : '')}`;
        player.playInfoLayer.innerHTML = `<ul class="${player.options.classPrefix}play-info-container"></ul>`;
        layers.insertBefore(player.playInfoLayer, layers.firstChild);

        for (let i = 0, total = player.listItems.length; i < total; i++) {
            player.playInfoLayer.querySelector('ul').innerHTML += player.listItems[i];
        }

        if (player.isVideo) {
            player.playInfoButton = document.createElement('div');
            player.playInfoButton.className = `${player.options.classPrefix}button ${player.options.classPrefix}play-info-button`;
            player.playInfoButton.innerHTML = `<button type="button" aria-controls="${player.id}" title="${toggleButtonTitle}" aria-label="${toggleButtonTitle}" tabindex="0"></button>`;
            player.playInfoButton.addEventListener('click', function () {
                mejs.Utils.toggleClass(player.playInfoLayer, `${player.options.classPrefix}play-info-hidden`);
            });
            player.addControlElement(player.playInfoButton, 'play-info');
        } else {
            const items = player.playInfoLayer.querySelectorAll('li');

            if (items.length <= 10) {
                let height = 0;
                for (let i = 0, total = items.length; i < total; i++) {
                    height += items[i].offsetHeight;
                }
                player.container.style.height = `${height}px`;
            }
        }
    },
    cleanplayinfo (player, controls, layers, media) {
        media.removeEventListener('ended', player.endedCallback);
    },

    createPlayInfo () {
        const t = this;

        t.playInfo = t.options.playInfo ? t.options.playInfo : {};

        if (!t.options.playInfo) {
            const children = t.mediaFiles || t.media.originalNode.children;
            // Only one 'source' will be read.
            for (let i = 0; i < 1; i++) {
                const childNode = children[i];

                if (childNode.tagName.toLowerCase() === 'source') {
                    const elements = {};
                    Array.prototype.slice.call(childNode.attributes).forEach((item) => {
                        elements[item.name] = item.value;
                    });

                    // Make sure src, type and title are available
                    if (elements.src && elements.type && elements.title) {
                        elements.type = mejs.Utils.formatType(elements.src, elements.type);
                        t.playInfo = elements;
                    }
                }
            }
        }

        t.listItems = [];
        const
            element = t.playInfo,
            item = document.createElement('li'),
            id = `${t.id}_play-info_0`,
            thumbnail = element['data-play-info-thumbnail'] ? `<div class="${t.options.classPrefix}play-info-item-thumbnail"><img tabindex="-1" src="${element['data-play-info-thumbnail']}"></div>` : '',
            description = element['data-play-info-description-link'] ? `<a target="_blank" href="${element['data-play-info-description-link']}"><div class="${t.options.classPrefix}play-info-item-description-linked">${element['data-play-info-description']}</div></a>` :
                (element['data-play-info-description'] ? `<div class="${t.options.classPrefix}play-info-item-description">${element['data-play-info-description']}</div>` : ''),
            title = element['title-link'] ? `<a target="_blank" href="${element['title-link']}">${element.title}</a>` : element.title
        ;
        item.tabIndex = 0;
        item.className = `${t.options.classPrefix}play-info-selector-list-item ${t.options.classPrefix}play-info-selected`;
        item.innerHTML = `<div class="${t.options.classPrefix}play-info-item-inner">` +
            `${thumbnail}` +
            `<div class="${t.options.classPrefix}play-info-item-content">` +
            `<div><input type="radio" class="${t.options.classPrefix}play-info-selector-input" ` +
            `name="${t.id}_playlist" id="${id}" data-play-info-index="${0}" value="${element.src}" disabled>` +
            `<label class="${t.options.classPrefix}play-info-selector-label" ` +
            `for="${id}">${title}</label></div>${description}</div></div>`;

        t.listItems.push(item.outerHTML);
    }
});