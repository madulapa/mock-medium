AdminModel = require('../models/admin.model');
//UserModel = require('../models/user.model')
//PostModel = require('../models/post.model')
const express = require('express');
const { body, validationResult } = require('express-validator/check');
const router = express.Router();

/**
 * create an admin
 */
router.post('/admin', body("name").exists(), body("email").isEmail(), async (req, res) => {

    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
      return;
    }
    const {name, email} = req.body;
    const admin = new AdminModel({
        name,
        email
    })
    try {
        const newAdmin = await admin.save()
        return res.status(201).json(newAdmin)
    }
    catch(err){
        return res.status(400).json(err)
    }  
})

/**
 * admin can get list of admins(all or just limit?)
 */
router.get('/admin', async (req, res) => {
    console.log(req.query);
    //limit:10,skip:10}
    const {limit = 3, skip = 0} = req.query;
  
    try {
        const admins = await AdminModel.find({}).limit(limit).skip(skip);
        return res.json(admins);
    }
    catch(err) {
        console.error("get admins: ", err);
        return res.status(500).json({error: "Internal Server error"});
    }
  })

module.exports = router;