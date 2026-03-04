var t = window.TrelloPowerUp.iframe();

const TRELLO_APP_KEY = '478015f652ba5eb4990f7ccbeb19e6a9';
var authUrl = 'https://trello.com/1/authorize?expiration=never&name=Audio%20Record%20Power-Up&scope=read,write&response_type=token&key=' + TRELLO_APP_KEY;

// Open Trello auth in a new tab
document.getElementById('open-auth-btn').addEventListener('click', function () {
    window.open(authUrl, '_blank');
});

// Save the manually pasted token
document.getElementById('save-token-btn').addEventListener('click', function () {
    var token = document.getElementById('token-input').value.trim();
    var statusEl = document.getElementById('auth-status');

    if (!token || token.length < 10) {
        statusEl.style.color = '#EB5A46';
        statusEl.innerText = 'Please paste a valid token.';
        return;
    }

    statusEl.style.color = '#5E6C84';
    statusEl.innerText = 'Saving...';

    t.set('member', 'private', 'trelloToken', token)
        .then(function () {
            statusEl.style.color = '#61BD4F';
            statusEl.innerText = '✓ Authorized! Closing...';
            setTimeout(function () {
                t.closePopup();
            }, 800);
        })
        .catch(function (err) {
            statusEl.style.color = '#EB5A46';
            statusEl.innerText = 'Failed to save token. Try again.';
            console.error(err);
        });
});
