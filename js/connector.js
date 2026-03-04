console.log("Audio Record Power-Up script loaded!");

const TRELLO_APP_KEY = '478015f652ba5eb4990f7ccbeb19e6a9';
const ICON_URL = './mic.svg?v=1'; // Using relative path and version cache buster

window.TrelloPowerUp.initialize({
    'board-buttons': function (t, options) {
        return [{
            icon: ICON_URL,
            text: 'Debug Audio PU v8',
            callback: function (t) {
                return t.alert({
                    message: 'Audio Power-Up v8 is running!',
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

    'card-back-section': function (t, options) {
        // Always render our section on the card back — it will check for recordings inside
        return {
            title: '🎙️ Recorded Audios',
            icon: ICON_URL,
            content: {
                type: 'iframe',
                url: t.signUrl('./section.html'),
                height: 60
            }
        };
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
            height: 250,
        });
    }
}, {
    appKey: TRELLO_APP_KEY,
    appName: 'Audio Record Power-Up'
});
