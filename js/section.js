var t = window.TrelloPowerUp.iframe();

const TRELLO_APP_KEY = '478015f652ba5eb4990f7ccbeb19e6a9';

var PLAY_ICON = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>';
var PAUSE_ICON = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
}

// Close all open dropdowns
function closeAllDropdowns() {
    document.querySelectorAll('.dropdown.open').forEach(function (d) {
        d.classList.remove('open');
    });
}

document.addEventListener('click', function (e) {
    if (!e.target.closest('.menu-btn')) {
        closeAllDropdowns();
    }
});

function deleteAttachment(cardId, attId, token, onSuccess) {
    fetch('https://api.trello.com/1/cards/' + cardId + '/attachments/' + attId + '?key=' + TRELLO_APP_KEY + '&token=' + token, {
        method: 'DELETE'
    })
        .then(function (res) {
            if (res.ok) {
                onSuccess();
            } else {
                alert('Delete failed. Please try again.');
            }
        })
        .catch(function () {
            alert('Delete failed. Please try again.');
        });
}

function renameAttachment(attId, currentName, onSuccess) {
    // Store custom name in card-scoped data
    t.get('card', 'shared', 'audioNames').then(function (names) {
        var nameMap = names || {};
        var newName = window.prompt('Rename audio:', nameMap[attId] || currentName);
        if (newName && newName.trim() && newName.trim() !== currentName) {
            nameMap[attId] = newName.trim();
            t.set('card', 'shared', 'audioNames', nameMap).then(onSuccess);
        }
    });
}

function createAudioItem(att, cardId, token, nameMap) {
    var item = document.createElement('div');
    item.className = 'audio-item';

    // Hidden audio element
    var audio = document.createElement('audio');
    audio.className = 'hidden-audio';
    audio.src = att.url;
    audio.preload = 'metadata';
    item.appendChild(audio);

    // Play/Pause button
    var playBtn = document.createElement('button');
    playBtn.className = 'play-btn';
    playBtn.innerHTML = PLAY_ICON;
    item.appendChild(playBtn);

    // Waveform
    var waveform = document.createElement('div');
    waveform.className = 'audio-waveform';

    var track = document.createElement('div');
    track.className = 'progress-track';
    var fill = document.createElement('div');
    fill.className = 'progress-fill';
    track.appendChild(fill);
    waveform.appendChild(track);

    var meta = document.createElement('div');
    meta.className = 'audio-meta';

    var duration = document.createElement('span');
    duration.className = 'audio-duration';
    duration.innerText = '0:00';

    var displayName = (nameMap && nameMap[att.id]) || att.name.replace('Trello Audio - ', '');
    var label = document.createElement('span');
    label.className = 'audio-label';
    label.innerText = displayName;
    label.title = displayName;

    meta.appendChild(duration);
    meta.appendChild(label);
    waveform.appendChild(meta);
    item.appendChild(waveform);

    // Three-dot menu button
    var menuBtn = document.createElement('button');
    menuBtn.className = 'menu-btn';
    menuBtn.title = 'Options';
    menuBtn.innerHTML = '&#8942;'; // vertical ellipsis ⋮
    item.appendChild(menuBtn);

    // Dropdown
    var dropdown = document.createElement('div');
    dropdown.className = 'dropdown';

    var renameItem = document.createElement('button');
    renameItem.className = 'dropdown-item';
    renameItem.innerText = 'Rename';
    renameItem.addEventListener('click', function () {
        closeAllDropdowns();
        renameAttachment(att.id, displayName, function () {
            renderSection(); // re-render to show updated name
        });
    });

    var deleteItem = document.createElement('button');
    deleteItem.className = 'dropdown-item';
    deleteItem.innerText = 'Delete';
    deleteItem.addEventListener('click', function () {
        closeAllDropdowns();
        if (window.confirm('Delete this recording?')) {
            deleteAttachment(cardId, att.id, token, function () {
                renderSection();
            });
        }
    });

    dropdown.appendChild(renameItem);
    dropdown.appendChild(deleteItem);
    item.appendChild(dropdown);

    menuBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = dropdown.classList.contains('open');
        closeAllDropdowns();
        if (!isOpen) {
            dropdown.classList.add('open');
        }
    });

    // Audio event listeners
    audio.addEventListener('loadedmetadata', function () {
        duration.innerText = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', function () {
        if (audio.duration) {
            fill.style.width = (audio.currentTime / audio.duration * 100) + '%';
            duration.innerText = formatTime(audio.currentTime);
        }
    });

    audio.addEventListener('ended', function () {
        playBtn.classList.remove('playing');
        playBtn.innerHTML = PLAY_ICON;
        fill.style.width = '0%';
        duration.innerText = formatTime(audio.duration);
    });

    track.addEventListener('click', function (e) {
        var rect = track.getBoundingClientRect();
        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    });

    playBtn.addEventListener('click', function () {
        document.querySelectorAll('.hidden-audio').forEach(function (a) {
            if (a !== audio && !a.paused) {
                a.pause();
                var btn = a.parentElement.querySelector('.play-btn');
                if (btn) { btn.classList.remove('playing'); btn.innerHTML = PLAY_ICON; }
            }
        });
        if (audio.paused) {
            audio.play();
            playBtn.classList.add('playing');
            playBtn.innerHTML = PAUSE_ICON;
        } else {
            audio.pause();
            playBtn.classList.remove('playing');
            playBtn.innerHTML = PLAY_ICON;
        }
    });

    return item;
}

var renderGeneration = 0;

function renderSection() {
    var myGeneration = ++renderGeneration;
    var list = document.getElementById('audio-list');
    list.innerHTML = '';

    Promise.all([
        t.card('attachments', 'id'),
        t.get('card', 'shared', 'audioNames'),
        t.get('member', 'private', 'trelloToken')
    ]).then(function (results) {
        // A newer render started while we were waiting — discard this result
        if (myGeneration !== renderGeneration) return;

        var card = results[0];
        var nameMap = results[1] || {};
        var token = results[2];

        // Deduplicate: first by ID, then by URL as a safety net
        var seenIds = {};
        var seenUrls = {};
        var audioAttachments = (card.attachments || []).filter(function (a) {
            if (!a.name) return false;
            if (seenIds[a.id] || seenUrls[a.url]) return false;
            if (a.name.startsWith('Trello Audio -') || a.name.endsWith('.webm')) {
                seenIds[a.id] = true;
                seenUrls[a.url] = true;
                return true;
            }
            return false;
        });

        list.innerHTML = ''; // clear again here, safely inside the resolved promise
        audioAttachments.forEach(function (att) {
            list.appendChild(createAudioItem(att, card.id, token, nameMap));
        });

        return t.sizeTo(document.body);
    });
}

t.render(renderSection);

