const {post: PostModel} = require('../models');
const express = require('express');
const {keycloak} = require('../kc.js');
const logger = require('log4js').getLogger(); 
const { body, validationResult } = require('express-validator/check');
const router = express.Router();
/**
 * User can make a post
 */
router.post('/', keycloak.protect("User"), body("title").exists(), body("body").exists(), async (req, res) => {
    
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {

        logger.error('post post:', errors)
      return res.status(422).json({ errors: errors.array() });;
    }
    const {title, body} = req.body;
    const post = new PostModel({
        title,
        body
    })
    try {
        const newPost= await post.save()
        return res.status(201).json(newPost)
    }
    catch(err){
        return res.status(400).json(err)
    }  
  })
   /**
   * User can delete a post
   */
  router.delete('/:id', keycloak.protect("User"), async (req, res) => {
    let post = await getPostbyId(req.params.id)
    
    if(post == null)
        return res.status(400).json({error: "Post does not exist"});
    try {
    await post.remove()
    return res.json({message: "successfully deleted post"})
  }
  catch (err) {
    logger.error('delete post', err)
    return res.status(500).json(err)
  }
  })
   /**
   * User can update a post
   */
  router.patch('/:id', keycloak.protect("User"), async (req, res) => {
    let post = await getPostbyId(req.params.id)
    if(post == null)
        return res.status(400).json({error: "Post does not exist"});
    if(post.title != null) {
      post.title = req.body.title
    }
    if(post.body != null) {
      post.body = req.body.body
    }
    try {
        const updatedPost = await post.save()
        return res.json(updatedPost)
    }
    catch (err) {
      logger.error('patch post', err)
        return res.status(400).json(err)
    }
  })
   /**
   * User can see their feed (recent 10 posts)
   */
  router.get('/feed', keycloak.protect("User"), async (req, res) => {
    const {limit = 3, skip = 0} = req.query;
    try {
        const posts = await PostModel.find({}).limit(limit).skip(skip);
        return res.json(posts);
    }
    catch(err) {
      logger.error('get feed', err)
        return res.status(500).json(err)
    }
  })
  /**
 * admin can get list of posts (all posts or limited number?)
 */
router.get('/', keycloak.protect("User"), async (req, res) => {
    const {limit = 10, skip = 0} = req.query;
    try {
        const posts = await PostModel.find({}).limit(limit).skip(skip);
        return res.json(posts);
    }
    catch(err) {
      logger.error('get all posts', err)
        return res.status(500).json(err)
    }
})
  async function getPostbyId(id)
  {
      return await PostModel.findById(id)
  }
  module.exports = router;