const { user: UserModel } = require('../models');
const express = require('express');
const keycloak = require('../kc.js').getInstance();
const logger = require('log4js').getLogger();
const { Issuer } = require('openid-client');
const { body, validationResult } = require('express-validator');
const { default: KeycloakAdminClient } = require("keycloak-admin");
const router = express.Router();


let keycloakIssuer;
let client;
let tokenSet;

// Periodically using refresh_token grant flow to get new access token here

const adminClient = new KeycloakAdminClient();
(async function () {
  try {

    let authRes = await adminClient.auth({
      username: 'admin',
      password: 'admin',
      grantType: 'password',
      clientId: 'admin-cli',
    });

    keycloakIssuer = await Issuer.discover(
      'http://localhost:8080/auth/realms/master',
    );

    client = new keycloakIssuer.Client({
      client_id: 'admin-cli', // Same as `clientId` passed to client.auth()
      client_secret: '1750dd02-86b8-4fe6-9632-81783374eb0b'
    });
    tokenSet = await client.grant({
      username: 'admin',
      password: 'admin',
      grant_type: 'password'
    });

    adminClient.setConfig({
      realmName: 'mock-medium',
    });

    setInterval(async () => {
      const refreshToken = tokenSet.refresh_token;
      tokenSet = await client.refresh(refreshToken);
      adminClient.setAccessToken(tokenSet.access_token);
    }, 58 * 1000); // 58 seconds
  } catch (e) {
    logger.error(e);
  }
})()




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
router.post('/register', async (req, res) => {
  const { username, email, roleName, password } = req.body;
  try {
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

    const role = await adminClient.roles.findOneByName({ name: roleName });
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
    return res.status(400).json(err.response.data);
  }

});

module.exports = router;
