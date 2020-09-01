const Keycloak = require('keycloak-connect')
const session = require('express-session')
//var memoryStore = new session.MemoryStore();

let _keycloakInstance;

let kc = {};


/*  kc.session = session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
  });

  kc.keycloak = new Keycloak({
    store: memoryStore
  });
*/

  kc.getInstance = function () {
    if (!_keycloakInstance) {
        throw 'keycloak not initialized';
    }

    return _keycloakInstance;
}

kc.init = function () {
    if (_keycloakInstance) {
        return _keycloakInstance;
    }

    console.log('keycloak initializing');

    _keycloakInstance = new Keycloak({
        store: new session.MemoryStore()
    });

    return _keycloakInstance;
}

  module.exports = kc;