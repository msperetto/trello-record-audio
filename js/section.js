var t = window.TrelloPowerUp.iframe();

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
                list.innerHTML = '<div class="status-text">No recordings yet.</div>';
            } else {
                audioAttachments.forEach(function (att) {
                    var item = document.createElement('div');
                    item.className = 'audio-item';

                    var header = document.createElement('div');
                    header.className = 'audio-header';

                    var title = document.createElement('div');
                    title.className = 'audio-title';
                    title.innerText = att.name;

                    var date = document.createElement('div');
                    date.className = 'audio-date';
                    date.innerText = new Date(att.date).toLocaleDateString();

                    header.appendChild(title);
                    header.appendChild(date);

                    var audio = document.createElement('audio');
                    audio.controls = true;
                    // The URL from Trello is securely provided
                    audio.src = att.url;
                    audio.preload = 'none';

                    item.appendChild(header);
                    item.appendChild(audio);

                    list.appendChild(item);
                });
            }

            // Request Trello to resize the iframe to beautifully fit all audio items
            return t.sizeTo(document.body);
        });
});
