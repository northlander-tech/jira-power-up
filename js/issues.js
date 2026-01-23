/* global TrelloPowerUp, CONFIG, createLoader, document */

var t = TrelloPowerUp.iframe({
  appKey: CONFIG.TRELLO_APP_KEY,
  appName: 'Jira Power-Up',
  appAuthor: 'Tikamoon'
});

var loaderEl = document.getElementById('loader');
var issuesEl = document.getElementById('issues');

createLoader(loaderEl);

t.render(function() {
  t.get('card', 'shared', 'pendingProject')
    .then(function(project) {
      if (!project) {
        throw new Error('Projet manquant');
      }
      return fetch(CONFIG.WEBHOOK_URL + '?project=' + project.key, {
        headers: { 'X-App-Key': CONFIG.N8N_APP_KEY }
      })
        .then(function(response) {
          if (!response.ok) {
            throw new Error('Erreur lors de la récupération des types');
          }
          return response.json();
        })
        .then(function(data) {
          project.id = data.projectId;
          return { project: project, issueTypes: data.issues };
        });
    })
    .then(function(result) {
      var project = result.project;
      var issueTypes = result.issueTypes;

      if (issueTypes.length === 0) {
        return t.closePopup().then(function() {
          return t.alert({
            message: 'Aucun type d\'issue disponible',
            duration: 5,
            display: 'error'
          });
        });
      }

      issueTypes.forEach(function(issueType) {
        var item = document.createElement('a');
        item.className = 'issue-item';
        item.textContent = issueType.name;
        item.href = '#';
        item.addEventListener('click', function(e) {
          e.preventDefault();
          t.set('card', 'shared', 'pendingTicket', {
            project: project,
            issueType: issueType
          })
            .then(function() {
              return t.remove('card', 'shared', 'pendingProject');
            })
            .then(function() {
              return t.popup({
                title: 'Création en cours',
                url: './create.html',
                height: 80
              });
            });
        });
        issuesEl.appendChild(item);
      });

      loaderEl.style.display = 'none';
      issuesEl.style.display = 'block';
      t.sizeTo('#issues');
    })
    .catch(function(error) {
      t.closePopup().then(function() {
        return t.alert({
          message: 'Erreur: ' + error.message,
          duration: 5,
          display: 'error'
        });
      });
    });
});
