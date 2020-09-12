const {user: UserModel} = require('../models');
const express = require('express');
const keycloak = require('../kc.js').getInstance();
const logger = require('log4js').getLogger(); 
const { body, validationResult } = require('express-validator');
const router = express.Router();



//user login 
app.post('/login', (req,res)=> {
  const {username, password} = req.body; 

  return keycloak.grantManager.obtainDirectly(username,password).then(grant => {
    console.log(grant);
      return res.json({access_token:grant.access_token.token})
  }).catch(err => {
    logger.error(err);
    return res.status(500).json({error: 'error occured'});
  })
});

//user registration 
app.post('/register', async (req,res)=> {
  const{username, email, roleName, password} = req.body; 
    try{
      const newUser = await adminClient.users.create({
        username: username, 
        email: email,
        enabled:true
      });
  
      const user = await adminClient.users.findOne({id: newUser.id});
      await adminClient.users.resetPassword({
        id: user.id,
        credential: {
          temporary: false, 
          type: 'password', 
          value: password,
        },
      });

      const role = await adminClient.roles.findOneByName({name: roleName});
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
    } catch(err){
      logger.error(err);
      return res.status(400).json(err.response.data);
    }

});

module.exports = router;
