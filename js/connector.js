const TRELLO_APP_KEY = '478015f652ba5eb4990f7ccbeb19e6a9';

// Helper to provide a fallback SVG for icons
const MIC_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>';

const ICON_URL = 'data:image/svg+xml;base64,' + btoa(MIC_ICON);

window.TrelloPowerUp.initialize({
  'card-buttons': function(t, options) {
    return [{
      icon: ICON_URL,
      text: 'Record Audio',
      callback: function(t) {
        return t.get('member', 'private', 'trelloToken')
          .then(function(token) {
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

  'attachment-sections': function(t, options){
    // Claim our recorded audio files.
    // They are saved starting with "Trello Audio -" or as ".webm" or ".mp3"
    // Also, looking for URLs on our side if stored remotely, but here they are Trello's AWS S3 attachments
    var claimed = options.entries.filter(function(attachment){
      return attachment.name && (attachment.name.startsWith('Trello Audio -') || attachment.name.endsWith('.webm'));
    });

    if(claimed && claimed.length > 0){
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

  'authorization-status': function(t, options){
    return t.get('member', 'private', 'trelloToken')
    .then(function(token){
      if(token){
        return { authorized: true };
      }
      return { authorized: false };
    });
  },

  'show-authorization': function(t, options){
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
