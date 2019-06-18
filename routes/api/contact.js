const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

const Contact = require('../../models/Contact');


// contact route 

router.post('/', [
    check('name', 'Name field is Required').not().isEmpty(),
    check('email', 'Email field is Required').not().isEmpty(),
    check('phone', 'Phone field is Required').not().isEmpty(),
    check('subject', 'Subject field is Required').not().isEmpty(),
    check('message', 'Your Message field is Required').not().isEmpty(),
], async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors : errors.array()});
    }

    try {

        const newContact = new Contact ({
            name : req.body.name,
            email : req.body.email,
            phone : req.body.phone,
            subject : req.body.subject,
            message : req.body.message
        })

        const contact = await newContact.save();
        res.json(contact);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }


});

module.exports = router;