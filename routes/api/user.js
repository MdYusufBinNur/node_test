const express = require('express');
const router = express.Router();

//@route GET api/user
//@desc  Test route
//@access  Public
router.get('/',(req, res) => res.send('User Route'));
router.get('/login',(req, res) => res.send('User Login Route'));
router.get('/register',(req, res) => res.send('User Register Route'));

module.exports = router;