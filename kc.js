const Keycloak = require('keycloak-connect')
const session = require('express-session')
var memoryStore = new session.MemoryStore();


let kc = {};


  kc.session = session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
  });

  kc.keycloak = new Keycloak({
    store: memoryStore
  });

  module.exports = kc;