const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User');

// @route Post api/users
// @desc  Register user
// @acces  public
router.post('/', [
    
check('name', 'Name is Required').not().isEmpty(),
check('email', 'Please Include your valid Email').isEmail(),
check('password', 'Password Must be 6 characters long').isLength({ min : 6 })

], 
async (req,res) => 
{
const errors = validationResult(req);

if(!errors.isEmpty()){
    return res.status(400).json({ errors : errors.array()});
}

const { name, email, password } = req.body;
try {
    // See if user exist
    let user = await User.findOne({email});
    if(user) {
       return res.status(400).json({errors : [{ msg: 'Email already exist'}]});
    }
    // get users gravatar
    const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
    });

    user = new User({
        name,
        email,
        avatar,
        password
    });

    // encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();


    // Return jsonwebtoken 
    const payload = {
        user : {
            id : user.id
        }
    }

    jwt.sign(payload, config.get('jwtSecret'),
        { expiresIn : 360000},
        (err, token) => {
            if(err) throw err;
            res.json({token});
        }
    );
}
catch(err) {
    console.log(err.message);
    res.status(500).send("server error");
}
}
);
module.exports = router;