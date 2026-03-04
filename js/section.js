var t = window.TrelloPowerUp.iframe();

var PLAY_ICON = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>';
var PAUSE_ICON = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
}

function createAudioItem(att) {
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

    // Waveform / progress area
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

    // Shorten the name for display
    var rawName = att.name || 'Audio';
    var label = document.createElement('span');
    label.className = 'audio-label';
    label.innerText = rawName.replace('Trello Audio - ', '').split(' ').slice(0, 3).join(' ');
    label.title = rawName;

    meta.appendChild(duration);
    meta.appendChild(label);
    waveform.appendChild(meta);
    item.appendChild(waveform);

    // Update duration once metadata loads
    audio.addEventListener('loadedmetadata', function () {
        duration.innerText = formatTime(audio.duration);
    });

    // Update progress bar
    audio.addEventListener('timeupdate', function () {
        if (audio.duration) {
            var pct = (audio.currentTime / audio.duration) * 100;
            fill.style.width = pct + '%';
            duration.innerText = formatTime(audio.currentTime);
        }
    });

    // On end: reset
    audio.addEventListener('ended', function () {
        playBtn.classList.remove('playing');
        playBtn.innerHTML = PLAY_ICON;
        fill.style.width = '0%';
        duration.innerText = formatTime(audio.duration);
    });

    // Click to seek
    track.addEventListener('click', function (e) {
        var rect = track.getBoundingClientRect();
        var pct = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * audio.duration;
    });

    // Play / pause toggle
    playBtn.addEventListener('click', function () {
        // Pause any other playing audio
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

t.render(function () {
    t.card('attachments')
        .then(function (card) {
            var attachments = card.attachments || [];
            var audioAttachments = attachments.filter(function (a) {
                return a.name && (a.name.startsWith('Trello Audio -') || a.name.endsWith('.webm'));
            });

            var list = document.getElementById('audio-list');
            list.innerHTML = '';

            if (audioAttachments.length === 0) {
                list.innerHTML = '<div class="empty-state">No recordings yet.</div>';
            } else {
                audioAttachments.forEach(function (att) {
                    list.appendChild(createAudioItem(att));
                });
            }

            return t.sizeTo(document.body);
        });
});
