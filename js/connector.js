console.log("Audio Record Power-Up script loaded!");

const TRELLO_APP_KEY = '478015f652ba5eb4990f7ccbeb19e6a9';
const ICON_URL = './mic.svg?v=1'; // Using relative path and version cache buster

window.TrelloPowerUp.initialize({
    'board-buttons': function (t, options) {
        console.log("Audio Record Power-Up: Trello called 'board-buttons' v5");
        return [{
            icon: ICON_URL,
            text: 'Debug Audio PU v5',
            callback: function (t) {
                return t.alert({
                    message: 'The Audio Power-Up capabilities are loading in Trello! (v5)',
                    duration: 3,
                });
            }
        }];
    },

    'card-buttons': function (t, options) {
        console.log("Audio Record Power-Up: Trello called 'card-buttons' v5");

        return [{
            icon: ICON_URL,
            text: 'Record Audio (v5)',
            callback: function (t) {
                return t.get('member', 'private', 'trelloToken')
                    .then(function (token) {
                        if (!token) {
                            return t.popup({
                                title: 'Authorize Power-Up',
                                url: './auth.html',
                                height: 140
                            });
                        } else {
                            return t.modal({
                                title: 'Record Audio',
                                url: './record.html',
                                height: 350,
                                fullscreen: false
                            });
                        }
                    });
            }
        }];
    },

    'attachment-sections': function (t, options) {
        // Claim our recorded audio files.
        // They are saved starting with "Trello Audio -" or as ".webm" or ".mp3"
        // Also, looking for URLs on our side if stored remotely, but here they are Trello's AWS S3 attachments
        var claimed = options.entries.filter(function (attachment) {
            return attachment.name && (attachment.name.startsWith('Trello Audio -') || attachment.name.endsWith('.webm'));
        });

        if (claimed && claimed.length > 0) {
            return [{
                id: 'AudioRecords',
                claimed: claimed,
                icon: ICON_URL,
                title: 'Recorded Audios',
                content: {
                    type: 'iframe',
                    url: t.signUrl('./section.html'),
                    height: 100 // We will sizeTo() dynamically in the iframe
                }
            }];
        } else {
            return [];
        }
    },

    'authorization-status': function (t, options) {
        return t.get('member', 'private', 'trelloToken')
            .then(function (token) {
                if (token) {
                    return { authorized: true };
                }
                return { authorized: false };
            });
    },

    'show-authorization': function (t, options) {
        return t.popup({
            title: 'Authorize Power-Up',
            url: './auth.html',
            height: 140,
        });
    }
}, {
    appKey: TRELLO_APP_KEY,
    appName: 'Audio Record Power-Up'
});
