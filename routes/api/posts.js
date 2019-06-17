const express = require('express');
const router = express.Router();

// @route Get api/posts
// @desc  test route
// @acces  public
router.get('/', (req,res) => res.send("Posts route"));

module.exports = router;