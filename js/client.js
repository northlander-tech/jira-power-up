/* global TrelloPowerUp, CONFIG */

var JIRA_ICON = 'https://cdn.icon-icons.com/icons2/2699/PNG/512/atlassian_jira_logo_icon_170511.png';

var PROJECTS = [
  { text: 'Toast', key: 'TOAST' },
  { text: 'Modulo', key: 'MOD' }
];

var AUTH_POPUP = {
  title: 'Autorisation Trello',
  url: './auth.html',
  height: 140
};

function showIssueTypePopup(t, project) {
  return t.set('card', 'shared', 'pendingProject', project)
    .then(function() {
      return t.popup({
        title: 'Choisir le type',
        url: './issues.html',
        height: 200
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
  'authorization-status': function(t) {
    return t.getRestApi()
      .isAuthorized()
      .then(function(isAuthorized) {
        return { authorized: isAuthorized };
      });
  },
  'show-authorization': function(t) {
    return t.popup(AUTH_POPUP);
  },
  'card-buttons': function(t) {
    return [{
      icon: JIRA_ICON,
      text: 'Créer ticket Jira',
      callback: function(t) {
        return t.getRestApi()
          .isAuthorized()
          .then(function(isAuthorized) {
            if (!isAuthorized) {
              return t.popup(AUTH_POPUP);
            }
            return showProjectPopup(t);
          });
      }
    }];
  }
}, {
  appKey: CONFIG.TRELLO_APP_KEY,
  appName: 'Jira Power-Up',
  appAuthor: 'Tikamoon'
});
