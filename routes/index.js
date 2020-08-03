AdminModel = require('../models/admin.model');
const logger = require('log4js').getLogger(); 
const express = require('express');
const { body, validationResult } = require('express-validator/check');
const router = express.Router();

/**
 * create an admin
 */
router.post('/', body("name").exists(), body("email").exists(), async (req, res) => {

    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        logger.error('post user:', errors)
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
router.get('/', async (req, res) => {
    console.log(req.query);
    //limit:10,skip:10}
    const {limit = 3, skip = 0} = req.query;
  
    try {
        const admins = await AdminModel.find({}).limit(limit).skip(skip);
        return res.json(admins);
    }
    catch(err) {
        logger.error("get admins: ", err);
        return res.status(500).json({error: "Internal Server error"});
    }
  })

module.exports = router;