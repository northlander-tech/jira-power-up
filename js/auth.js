/* global TrelloPowerUp, CONFIG */

var t = TrelloPowerUp.iframe({
  appKey: CONFIG.TRELLO_APP_KEY,
  appName: 'Jira Power-Up',
  appAuthor: 'Tikamoon'
});

t.render(function() {
  return t.sizeTo('#content');
});

document.getElementById('authorize').addEventListener('click', function() {
  t.getRestApi()
    .authorize({
      scope: 'read,write,account',
      expiration: 'never'
    })
    .then(function() {
      return t.closePopup();
    })
    .catch(TrelloPowerUp.restApiError.AuthDeniedError, function() {
      console.log('Autorisation annulée par l\'utilisateur');
    })
    .catch(function(error) {
      console.error('Erreur d\'autorisation:', error);
    });
});
