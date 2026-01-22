/* global TrelloPowerUp, CONFIG */

var Promise = TrelloPowerUp.Promise;
var JIRA_ICON = 'https://cdn.icon-icons.com/icons2/2699/PNG/512/atlassian_jira_logo_icon_170511.png';

var PROJECTS = [
  { text: 'Toast', key: 'TOAST' },
  { text: 'Modulo', key: 'MOD' }
];

function fetchIssueTypes(projectKey) {
  return fetch(CONFIG.WEBHOOK_URL + '?project=' + projectKey, {
    headers: { 'X-App-Key': CONFIG.N8N_APP_KEY }
  })
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des types');
      }
      return response.json();
    });
}

function createJiraTicket(t, project, issueType) {
  var card, memberId, trelloToken;

  return t.card('id', 'name', 'desc', 'shortLink')
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
      return response.json().then(function(data) {
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
      });
    })
    .catch(function(error) {
      return t.alert({
        message: 'Erreur réseau: ' + error.message,
        duration: 5,
        display: 'error'
      });
    });
}

function showIssueTypePopup(t, project) {
  return fetchIssueTypes(project.key)
    .then(function(data) {
      project.id = data.projectId;
      var issueTypes = data.issues;

      if (issueTypes.length === 0) {
        return t.alert({
          message: 'Aucun type d\'issue disponible',
          duration: 5,
          display: 'error'
        });
      }
      return t.popup({
        title: 'Choisir le type',
        items: issueTypes.map(function(issueType) {
          return {
            text: issueType.name,
            callback: function(t) {
              return createJiraTicket(t, project, issueType);
            }
          };
        })
      });
    })
    .catch(function(error) {
      return t.alert({
        message: 'Erreur: ' + error.message,
        duration: 5,
        display: 'error'
      });
    });
}

function showProjectPopup(t) {
  return t.popup({
    title: 'Choisir le projet',
    items: PROJECTS.map(function(project) {
      return {
        text: project.text,
        callback: function(t) {
          return showIssueTypePopup(t, project);
        }
      };
    })
  });
}

TrelloPowerUp.initialize({
  'authorization-status': function(t, options) {
    return t.getRestApi()
      .isAuthorized()
      .then(function(isAuthorized) {
        return { authorized: isAuthorized };
      });
  },
  'show-authorization': function(t, options) {
    return t.popup({
      title: 'Autorisation requise',
      url: './auth.html',
      height: 140
    });
  },
  'card-buttons': function(t, options) {
    return [{
      icon: JIRA_ICON,
      text: 'Créer ticket Jira',
      callback: function(t) {
        return t.getRestApi()
          .isAuthorized()
          .then(function(isTrelloAuthorized) {
            if (!isTrelloAuthorized) {
              return t.popup({
                title: 'Autorisation requise',
                url: './auth.html',
                height: 140
              });
            }
            return showProjectPopup(t);
          });
      }
    }];
  }
}, {
  appKey: CONFIG.TRELLO_APP_KEY,
  appName: 'Jira Power-Up'
});
