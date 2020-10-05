const Keycloak = require('keycloak-connect')
const session = require('express-session')

let _keycloakInstance;

let kc = {};

kc.getInstance = function () {
    if (!_keycloakInstance) {
        throw 'keycloak not initialized';
    }

    return _keycloakInstance;
}

kc.store = new session.MemoryStore();

kc.init = function () {
    if (_keycloakInstance) {
        return _keycloakInstance;
    }

    console.log('keycloak initializing');

    _keycloakInstance = new Keycloak({
        store: kc.store
    });

    return _keycloakInstance;
}

module.exports = kc;