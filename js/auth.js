var t = window.TrelloPowerUp.iframe();

const TRELLO_APP_KEY = '478015f652ba5eb4990f7ccbeb19e6a9';
// We use a small success page for the callback to close the popup automatically
var oauthUrl = window.location.origin + window.location.pathname.replace('auth.html', 'auth-success.html');
var trelloAuthUrl = `https://trello.com/1/authorize?expiration=never&name=Audio%20Record%20Power-Up&scope=read,write&key=${TRELLO_APP_KEY}&callback_method=fragment&return_url=${encodeURIComponent(oauthUrl)}`;

var tokenLooksValid = function (token) {
    return /^[0-9a-f]{64}$/.test(token);
};

document.getElementById('auth-btn').addEventListener('click', function () {
    t.authorize(trelloAuthUrl, { height: 680, width: 580, validToken: tokenLooksValid })
        .then(function (token) {
            return t.set('member', 'private', 'trelloToken', token);
        })
        .then(function () {
            return t.closePopup();
        })
        .catch(function (error) {
            console.error('Authorization failed', error);
        });
});
