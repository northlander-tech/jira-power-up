/* global document, CONFIG */

function getRandomPhrase(fallback) {
  if (CONFIG.LOADER_PHRASES && CONFIG.LOADER_PHRASES.length > 0) {
    var phrases = CONFIG.LOADER_PHRASES.split('|');
    var index = Math.floor(Math.random() * phrases.length);
    return phrases[index];
  }
  return fallback || 'Chargement...';
}

function createLoader(container) {
  var loader = document.createElement('div');
  loader.className = 'loader';

  var bars = document.createElement('div');
  bars.className = 'loader-bars';
  for (var i = 0; i < 3; i++) {
    bars.appendChild(document.createElement('span'));
  }

  var p = document.createElement('p');
  p.textContent = getRandomPhrase();

  loader.appendChild(bars);
  loader.appendChild(p);
  container.appendChild(loader);

  return loader;
}
