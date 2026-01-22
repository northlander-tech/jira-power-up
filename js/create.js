/* global TrelloPowerUp, CONFIG, createLoader, document */

var t = TrelloPowerUp.iframe({
  appKey: CONFIG.TRELLO_APP_KEY,
  appName: 'Jira Power-Up',
  appAuthor: 'Tikamoon'
});

createLoader(document.getElementById('loader-container'));

t.render(function() {
  var project, issueType, card, memberId, trelloToken;

  t.get('card', 'shared', 'pendingTicket')
    .then(function(data) {
      if (!data) {
        throw new Error('Données manquantes');
      }
      project = data.project;
      issueType = data.issueType;
      return t.card('id', 'name', 'desc', 'shortLink');
    })
    .then(function(cardData) {
      card = cardData;
      return t.getContext();
    })
    .then(function(context) {
      memberId = context.member;
      return t.getRestApi().getToken();
    })
    .then(function(token) {
      trelloToken = token;
      return fetch('https://api.trello.com/1/members/' + memberId + '?key=' + CONFIG.TRELLO_APP_KEY + '&token=' + trelloToken);
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(member) {
      return fetch(CONFIG.WEBHOOK_URL + '/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Key': CONFIG.N8N_APP_KEY
        },
        body: JSON.stringify({
          project: project,
          issueType: issueType,
          card: card,
          creator: {
            id: member.id,
            username: member.username,
            fullName: member.fullName,
            email: member.email
          },
          trelloToken: trelloToken
        })
      });
    })
    .then(function(response) {
      return response.json()
        .catch(function() {
          return {};
        })
        .then(function(data) {
          return t.remove('card', 'shared', 'pendingTicket')
            .then(function() {
              if (response.ok) {
                return t.alert({
                  message: 'Ticket ' + project.key + ' (' + issueType.name + ') créé avec succès !',
                  duration: 5
                });
              } else {
                return t.alert({
                  message: data.message || data.error || 'Erreur lors de la création du ticket',
                  duration: 5,
                  display: 'error'
                });
              }
            })
            .then(function() {
              return t.closePopup();
            });
        });
    })
    .catch(function(error) {
      t.remove('card', 'shared', 'pendingTicket')
        .then(function() {
          return t.closePopup();
        })
        .then(function() {
          return t.alert({
            message: 'Erreur: ' + error.message,
            duration: 5,
            display: 'error'
          });
        });
    });
});
