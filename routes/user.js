const {user: UserModel} = require('../models');
const express = require('express');
const {keycloak} = require('../kc.js');
const logger = require('log4js').getLogger(); 
const { body, validationResult } = require('express-validator/check');
const router = express.Router();

/**
 * create a user
 */
router.post('/',keycloak.protect("Admin"), body("name").exists(), body("email").isEmail(), async (req, res) => {
  logger.info('post user requst recieved');
  const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

  if (!errors.isEmpty()) {
      logger.error('post user:', errors)
    return res.status(422).json({ errors: errors.array() });
  }
  const {name, email} = req.body;
    const user = new UserModel({
      name,
      email
  })
  try {
      const newUser= await user.save()
      return res.status(201).json(newUser)
  }
  catch(err){
      return res.status(400).json(err)
  }  
})
/**
 * admin can get list of users
 */
router.get('/',keycloak.protect("Admin"), async (req, res) => {
  console.log(req.query);
  //limit:10,skip:10}
  const {limit = 10, skip = 0} = req.query;

  try {
      const users = await UserModel.find({}).limit(limit).skip(skip);
      return res.json(users);
  }
  catch(err) {
      logger.error("get users: ", err);
      return res.status(500).json({error: "Internal Server error"});
  }
})

module.exports = router;
