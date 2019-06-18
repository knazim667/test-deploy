const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const User = require('../../models/User');



// @route Post api/posts
// @desc  Post route
// @acces  public
router.post('/', [auth, [
    check('title', 'Title field is Required').not().isEmpty(),
    check('description', 'Description field is required').not().isEmpty()
]], 
async (req,res) => {
    
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors : errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
        title : req.body.title,
        description : req.body.description,
        name : user.name,
        avatar : user.avatar,
        user : req.user.id
        });

        const post = await newPost.save();
        res.json(post);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    
});

// @route Get api/posts
// @desc  Get route
// @acces  public

router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({date : -1})
        res.json(posts);
    } catch (err) {
        console.error({errors : err.message});
        res.status(500).send('Server Error');
    }
});

// @route Get api/posts/:id
// @desc  Get posts by id
// @acces  public

router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({ msg: "Post Not Found"});
        }
        res.json(post);
    } catch (err) {
        console.error({errors : err.message});
        if(err.kind === "ObjectId"){
            return res.status(404).json({ msg: "Post Not Found"});
        }
        res.status(500).send('Server Error');
    }
});


// @route Delete api/posts/:id
// @desc  Delete posts by id
// @acces  public

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({ msg: "Post Not Found"});
        }

        if(post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "User Not Authorized"});
        }

        await post.remove();

        res.json({ msg : "Post Removed"});
    } catch (err) {
        console.error({errors : err.message});
        if(err.kind === "ObjectId"){
            return res.status(404).json({ msg: "Post Not Found"});
        }
        res.status(500).send('Server Error');
    }
});

// @route Like api/posts/like/:id
// @desc  Like posts by id
// @acces  private

router.put('/like/:id', auth, async (req , res) => {
    try {
        const post = await Post.findById(req.params.id);

        // check if the post already been liked
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({ msg : "Post Already liked"})
        }

        post.likes.unshift({ user : req.user.id});

        await post.save();

        res.json(post.likes);

    } catch (err) {
        console.error({errors : err.message});
        res.status(500).send("Server Error");
    }
});

// @route unLike api/posts/unlike/:id
// @desc  unLike posts by id
// @acces  private

router.put('/unlike/:id', auth, async (req , res) => {
    try {
        const post = await Post.findById(req.params.id);

        // check if the post already been liked
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({ msg : "Post is not yet liked"})
        }

        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        await post.save();

        res.json(post.likes);
        
    } catch (err) {
        console.error({errors : err.message});
        res.status(500).send("Server Error");
    }
});


// @route Comment api/posts/comment/:id
// @desc  Comment route
// @acces  private
router.post('/comment/:id', [auth, [
    check('text', 'Text field is Required').not().isEmpty(),
]], 
async (req,res) => {
    
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors : errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = {
        text : req.body.text,
        name : user.name,
        avatar : user.avatar,
        user : req.user.id
        };

        post.comments.unshift(newComment);

        await post.save();
        res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    
});


module.exports = router;