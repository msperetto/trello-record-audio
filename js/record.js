var t = window.TrelloPowerUp.iframe();

const TRELLO_APP_KEY = '478015f652ba5eb4990f7ccbeb19e6a9';

var recordBtn = document.getElementById('record-btn');
var saveBtn = document.getElementById('save-btn');
var discardBtn = document.getElementById('discard-btn');
var statusText = document.getElementById('status');
var audioPreviewContainer = document.getElementById('audio-preview-container');
var audioPreview = document.getElementById('audio-preview');

var mediaRecorder;
var audioChunks = [];
var selectedAudioBlob = null;

var isRecording = false;

recordBtn.addEventListener('click', async function () {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
});

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = function (e) {
            if (e.data.size > 0) {
                audioChunks.push(e.data);
            }
        };

        mediaRecorder.onstop = function () {
            selectedAudioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            audioChunks = [];

            var audioUrl = URL.createObjectURL(selectedAudioBlob);
            audioPreview.src = audioUrl;

            recordBtn.style.display = 'none';
            audioPreviewContainer.style.display = 'block';
            statusText.innerText = 'Listen or save your recording';
            t.sizeTo(document.body).catch(console.error);
        };

        audioChunks = [];
        mediaRecorder.start();
        isRecording = true;
        recordBtn.classList.add('recording');
        statusText.innerText = 'Recording... Click button to stop';
    } catch (err) {
        console.error('Error accessing microphone', err);
        statusText.innerText = 'Microphone access denied. Please allow it in the browser.';
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    isRecording = false;
    recordBtn.classList.remove('recording');
}

discardBtn.addEventListener('click', function () {
    selectedAudioBlob = null;
    audioPreview.src = '';
    recordBtn.style.display = 'flex';
    audioPreviewContainer.style.display = 'none';
    statusText.innerText = 'Click to start recording';
    t.sizeTo(document.body).catch(console.error);
});

saveBtn.addEventListener('click', function () {
    saveBtn.disabled = true;
    saveBtn.innerText = 'Uploading...';

    t.get('member', 'private', 'trelloToken').then(function (token) {
        if (!token) {
            statusText.innerText = 'Missing Trello Auth Token. Please authorize first.';
            saveBtn.disabled = false;
            saveBtn.innerText = 'Upload to Card';
            return;
        }

        var cardId = t.getContext().card;

        // Create FormData to send binary blob via Trello REST API
        var formData = new FormData();
        formData.append('key', TRELLO_APP_KEY);
        formData.append('token', token);
        formData.append('file', selectedAudioBlob, 'AudioRecord-' + Date.now() + '.webm');
        formData.append('name', 'Trello Audio - ' + new Date().toLocaleString());

        fetch('https://api.trello.com/1/cards/' + cardId + '/attachments', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                saveBtn.innerText = 'Saved!';
                setTimeout(() => {
                    t.closeModal();
                }, 1000);
            })
            .catch(err => {
                console.error('Upload failed', err);
                saveBtn.disabled = false;
                saveBtn.innerText = 'Upload Failed (Retry)';
            });
    });
});

t.render(function () {
    t.sizeTo(document.body).catch(console.error);
});
