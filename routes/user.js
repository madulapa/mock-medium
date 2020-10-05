const express = require('express');
const keycloak = require('../kc.js').getInstance();
const logger = require('log4js').getLogger();
const { Issuer } = require('openid-client');
const { body, validationResult } = require('express-validator');
const { default: KeycloakAdminClient } = require("keycloak-admin");
const router = express.Router();
const config = require('./../config/config.json');

let keycloakIssuer;
let client;
let tokenSet;

// Periodically using refresh_token grant flow to get new access token here
const adminClient = new KeycloakAdminClient();

(async function () {
  try {
    await adminClient.auth(config.keycloak.admin);
    adminClient.setConfig({
      realmName: 'mock-medium',
    });

    keycloakIssuer = await Issuer.discover(
      'http://localhost:8080/auth/realms/master',
    );

    client = new keycloakIssuer.Client({
      client_id: 'admin-cli'
    });

    tokenSet = await client.grant({
      grant_type: config.keycloak.admin.grantType,
      username: config.keycloak.admin.username,
      password: config.keycloak.admin.password,
    });

     setInterval(async () => {
       logger.info('refreshing admin token');
       tokenSet = await client.refresh(adminClient.refreshToken);
       adminClient.setAccessToken(tokenSet.access_token);
     }, config.keycloak.adminRefresh * 1000);
  } catch (e) {
    logger.error(e);
  }
})();

//user login 
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  return keycloak.grantManager.obtainDirectly(username, password).then(grant => {
    return res.json({ access_token: grant.access_token.token })
  }).catch(err => {
    logger.error(err);
    return res.status(500).json({ error: 'error occured' });
  })
});

//user registration 
router.post('/register',
  body("username").exists(), body("email").exists(), body("password").exists(), body("roleName").exists(),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      logger.error('post register:', errors);
      return res.status(422).json({ errors: errors.array() });;
    }

    const { username, email, roleName, password } = req.body;
    try {
      const role = await adminClient.roles.findOneByName({ name: roleName });

      if (!role) {
        throw new Error(`Invalid role given: ${roleName}`);
      }

      const newUser = await adminClient.users.create({
        username: username,
        email: email,
        enabled: true
      });

      const user = await adminClient.users.findOne({ id: newUser.id });
      await adminClient.users.resetPassword({
        id: user.id,
        credential: {
          temporary: false,
          type: 'password',
          value: password,
        },
      });

      await adminClient.users.addRealmRoleMappings({
        id: user.id,
        roles:
          [
            {
              id: role.id,
              name: role.name,
            },
          ],
      });
      return res.json(user);
    } catch (err) {
      logger.error(err);
      return res.status(400).json({ error: err.response ? err.response.data : err.message });
    }
  });

module.exports = router;
