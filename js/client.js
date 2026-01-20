/* global TrelloPowerUp, CONFIG */

var Promise = TrelloPowerUp.Promise;
var JIRA_ICON = 'https://cdn.icon-icons.com/icons2/2699/PNG/512/atlassian_jira_logo_icon_170511.png';

var PROJECTS = [
  { text: 'Toast', key: 'TOAST' },
  { text: 'Modulo', key: 'MOD' }
];

function fetchIssueTypes(projectKey) {
  return fetch(CONFIG.WEBHOOK_URL + '?project=' + projectKey)
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des types');
      }
      return response.json();
    });
}

function createJiraTicket(t, project, issueType) {
  return Promise.all([
    t.card('id', 'name', 'desc', 'url', 'labels'),
    t.member('id', 'username', 'fullName', 'email'),
  ])
  .then(function(results) {
    var card = results[0];
    var member = results[1];

    return fetch(CONFIG.WEBHOOK_URL + '/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createTicket',
        project: project,
        issueType: issueType,
        card: card,
        creator: member
      })
    })
    .then(function(response) {
      if (response.ok) {
        return t.alert({
          message: 'Ticket ' + project.key + ' (' + issueType.name + ') créé avec succès !',
          duration: 5
        });
      } else {
        return t.alert({
          message: 'Erreur lors de la création du ticket',
          duration: 5,
          display: 'error'
        });
      }
    })
    .catch(function(error) {
      return t.alert({
        message: 'Erreur réseau: ' + error.message,
        duration: 5,
        display: 'error'
      });
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

TrelloPowerUp.initialize({
  'card-buttons': function(t, options) {
    return [{
      icon: JIRA_ICON,
      text: 'Créer ticket Jira',
      callback: function(t) {
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
    }];
  }
});
