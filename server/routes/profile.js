const express = require('express');
const router = express.Router();
const auth = require('../middleware/verifyAuth');
const { NotFound } = require('../utils/errors');

const Profile = require('../models/Profile');
const User = require('../models/user');
const updateProfile = require('../controllers/profile');
require('../models/Group');

// Returns current user profile based on ID
router.get('/', auth, async (req, res, next) => {
    try {
        //find profile by user id and populate email
        const profile = await Profile.findOne({
            user: req.body.userId,
        }).populate('user', ['email']);
        if (!profile) {
            throw new NotFound('No profile found.');
        }
        const user = await User.findById(req.body.userId)
            .populate({
                path: 'courses',
                model: 'Course',
            })
            .populate({
                path: 'groups',
                model: 'Group',
            })
            .populate({
                path: 'university',
                model: 'University',
                populate: {
                    path: 'courses',
                    model: 'Course',
                },
            })
            .select('-password');
        if (!user) return res.status(400).json({ message: 'No user found' });
        const userInfo = {
            profile,
            user,
        };
        res.json(userInfo);
    } catch (err) {
        next(err);
    }
});

//Updates user profile fields based on ID and populates email
router.put('/', auth, updateProfile);

module.exports = router;
