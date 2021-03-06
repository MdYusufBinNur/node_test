const express = require('express');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route GET api/profile/me
//@desc  Get Current user Profile
//@access  private
router.get('/me', auth, async (req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user',['name','avatar']);
        if (!profile){
            return res.status(400).json({ msg: "There is no profile for this user"})
        }
        await res.json(profile)
    }catch (err) {
        console.error(err.message);
        res.status(500).send('SERVER ERROR');
    }
});

//@route GET api/profile
//@desc  Create update user profile
//@access  private
router.post('/',
    [
        auth,
        [
            check('status','Status is required').not().isEmpty(),
            check('skills', 'Skills is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ error:  errors.array() })
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    // Build profile Object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    // Build Array
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build Objects

    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try{
        let profile = await Profile.findOne({ user: req.user.id });
        if (profile){
        //Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields},
                {new: true}
                );
            console.log(profileFields)
            return res.json(profile)
        }
    //Create
        profile = new Profile(profileFields);
        await profile.save();
        console.log(profile)
        await res.json(profile)

    }catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }

});

//@route GET api/profile
//@desc  Get All Profiles
//@access  Publis
router.get('/',async (req, res) => {
    try{
        const profile = await  Profile.find().populate('user',['name','avatar']);
        await res.json(profile);

    }catch (e) {
        console.error(e.message);
        res.status(500).send("Server Error")
    }
});

//@route GET api/profile/user/:user_id
//@desc  Get All Profiles
//@access  Publis
router.get('/user/:user_id',async (req, res) => {
    try{
        const profile = await  Profile.findOne({user: req.params.user_id}).populate('user',['name','avatar']);
        if (!profile){
            return res.status(400).json({ msg: 'Profile not found'});
        }
        await res.json(profile);

    }catch (e) {
        console.error(e.message);
        if (e.kind === 'ObjectId'){
            return res.status(400).json({ msg: 'Profile no found'});

        }
        res.status(500).send("Server Error")
    }
});

//@route DELETE api/profile
//@desc  Delete Profile
//@access  Private
router.delete('/',auth, async (req, res) => {
    try{
         await  Profile.findOneAndRemove({ user:  req.user.id});
         await  User.findOneAndRemove({ _id: req.user.id});

        await res.json({ msg: "User Removed"});

    }catch (e) {
        console.error(e.message);
        res.status(500).send("Server Error")
    }
});

//@route PUT api/profile/experience
//@desc  Add Profile Experience
//@access  Private
router.put('/experience',
    [auth,
        [
            check('title',"Title is required").not().isEmpty(),
            check('company',"Company is required").not().isEmpty(),
            check('from',"From Date is required").not().isEmpty()
        ]
    ], async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array()})
        }
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;
        const newExp = {
            title, company, location,from, to, current, description
        };
        try{
            const profile = Profile.findOne({ user: req.user.id});

            profile.experience.unshift(newExp);
            await profile.save();
            await res.json(profile);
        }catch (e) {
            console.error(e.message);
            res.status(400).send(e.message);

        }
})
module.exports = router;