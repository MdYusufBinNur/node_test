const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config')
const { check, validationResult } = require('express-validator');
//Import models
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
            let user = await User.findOne({ email });
            if (user){
                return  res.status(400).json({ errors: [{ msg: 'User Already Exist' }]});
            }
            //Get user gravator

            const avatar = gravatar.url(email,{
                s: '200',
                r: 'pg',
                d: 'mm'
            });
            user = new User({ name, email, avatar,password});

            //Encrypted password
            const  salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            //Save the user
            await user.save();

            const payload ={
                user: {
                    id: user.id
                }
            };
            jwt.sign(payload,
                config.get('jwtSecret'),
                { expiresIn: 360000 },
                (err, token) => {
                if (err) throw err;
                    res.json({ token })
                });
            //Return jsonwebtoken
            //res.send('User Registered')
        }catch (err) {
            console.error(err.message);
             res.status(500).send('Server Error');
        }

    });
router.get('/',(req, res) => res.send('User Route'));
router.get('/login',(req, res) => res.send('User Login Route'));
router.get('/register',(req, res) => res.send('User Register Route'));

module.exports = router;