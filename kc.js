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