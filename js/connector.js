console.log("Audio Record Power-Up script loaded!");

const TRELLO_APP_KEY = '478015f652ba5eb4990f7ccbeb19e6a9';
const ICON_URL = './mic.svg?v=1';

window.TrelloPowerUp.initialize({
    'board-buttons': function (t, options) {
        return [{
            icon: ICON_URL,
            text: 'Debug Audio PU v10',
            callback: function (t) {
                return t.alert({
                    message: 'Audio Power-Up v10 is running!',
                    duration: 3,
                });
            }
        }];
    },

    'card-buttons': function (t, options) {
        return [{
            icon: ICON_URL,
            text: 'Record Audio',
            callback: function (t) {
                return t.get('member', 'private', 'trelloToken')
                    .then(function (token) {
                        if (!token) {
                            return t.popup({
                                title: 'Authorize Power-Up',
                                url: './auth.html',
                                height: 250
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

    // Claim audio attachments so they do NOT appear in Trello's native attachments list.
    // This single section also renders the custom player — no card-back-section needed.
    'attachment-sections': function (t, options) {
        var claimed = (options.entries || []).filter(function (attachment) {
            return attachment.name && (
                attachment.name.startsWith('Trello Audio -') ||
                attachment.name.endsWith('.webm')
            );
        });
        if (claimed.length === 0) return [];
        return [{
            id: 'AudioRecords',
            claimed: claimed,
            icon: ICON_URL,
            title: 'Recorded Audios',
            content: {
                type: 'iframe',
                url: t.signUrl('./section.html'),
                height: claimed.length * 52 + 16
            }
        }];
    },

    'authorization-status': function (t, options) {
        return t.get('member', 'private', 'trelloToken')
            .then(function (token) {
                return { authorized: !!token };
            });
    },

    'show-authorization': function (t, options) {
        return t.popup({
            title: 'Authorize Power-Up',
            url: './auth.html',
            height: 250,
        });
    }
}, {
    appKey: TRELLO_APP_KEY,
    appName: 'Audio Record Power-Up'
});
