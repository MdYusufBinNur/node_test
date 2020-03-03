const express = require('express');
const router = express.Router();
const gravator = require('gravator');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
//Import Models
const User = require('../../models/User');

//@route GET api/user
//@desc  Test route
//@access  Public
router.post(
    '/',
    [
        check('name', 'Name Is Required').not().isEmpty(),
        check('email', 'Please input a valid email').isEmail(),
        check('password','Please enter password with 6 or more character').isLength({min: 6})
    ],
    async (req, res) =>{
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array()})
        }

        const { name, email, password} = req.body;
        try {
            //See if user already exist
            let user = User.findOne({ email });
            if (user){
                 res.status(400).json({ errors: [{ msg: 'User Already Exist' }]});
            }
            //Get user gravator

            //Encrypted password
            //Return jsonwebtoken
            res.send('User Route')
        }catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }

    });
router.get('/',(req, res) => res.send('User Route'));
router.get('/login',(req, res) => res.send('User Login Route'));
router.get('/register',(req, res) => res.send('User Register Route'));

module.exports = router;