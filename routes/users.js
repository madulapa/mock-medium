UserModel = require('../models/user.model')
//PostModel = require('../models/post.model')
const express = require('express');
const router = express.Router();

/**
 * create a user
 */
router.post('/user', body("name").exists(), body("email").isEmail(), async (req, res) => {
  const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

  if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
    return;
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
router.get('/user', async (req, res) => {
  console.log(req.query);
  //limit:10,skip:10}
  const {limit = 10, skip = 0} = req.query;

  try {
      const users = await UserModel.find({}).limit(limit).skip(skip);
      return res.json(users);
  }
  catch(err) {
      console.error("get users: ", err);
      return res.status(500).json({error: "Internal Server error"});
  }
})

module.exports = router;
