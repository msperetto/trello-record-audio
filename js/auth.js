var t = window.TrelloPowerUp.iframe();

const TRELLO_APP_KEY = '478015f652ba5eb4990f7ccbeb19e6a9';
// We use a small success page for the callback to close the popup automatically
var oauthUrl = window.location.origin + window.location.pathname.replace('auth.html', 'auth-success.html');
var trelloAuthUrl = `https://trello.com/1/authorize?expiration=never&name=Audio%20Record%20Power-Up&scope=read,write&key=${TRELLO_APP_KEY}&callback_method=fragment&return_url=${encodeURIComponent(oauthUrl)}`;

var tokenLooksValid = function () {
    return true; // We accept any return to proceed with the promise
};

document.getElementById('auth-btn').addEventListener('click', function () {
    t.getRestApi()
        .authorize({
            scope: 'read,write',
            expiration: 'never'
        })
        .then(function (token) {
            // Trello handles the storage and retrieval internally with this method.
            return t.set('member', 'private', 'trelloToken', token)
                .then(function () {
                    return t.closePopup();
                });
        })
        .catch(function (error) {
            console.error('REST API Authorization failed', error);
        });
});
