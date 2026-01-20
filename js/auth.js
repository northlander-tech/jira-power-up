/* global TrelloPowerUp, CONFIG */

var t = TrelloPowerUp.iframe({
  appKey: CONFIG.TRELLO_APP_KEY,
  appName: 'Jira Power-Up'
});

t.render(function() {
  return t.sizeTo('#content');
});

var authBtn = document.getElementById('authorize');

authBtn.addEventListener('click', function() {
  t.getRestApi()
    .authorize({
      scope: 'read,write,account',
      expiration: 'never'
    })
    .then(function() {
      return t.closePopup();
    })
    .catch(function(error) {
      console.error('Authorization error:', error);
    });
});
