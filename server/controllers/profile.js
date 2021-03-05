const { NotFound } = require('../utils/errors');
const Profile = require('../models/Profile');
const User = require('../models/user');

async function updateProfile(req, res, next) {
    try {
        //find profile
        let profile = await Profile.findOne({ user: req.body.userId });

        const { firstName, lastName, phone, location, imageUrl } = req.body;

        //if profile found then update
        if (profile) {
            const filter = { user: req.body.userId };
            const updatedProfile = {};
            if (firstName) updatedProfile.firstName = firstName;
            if (lastName) updatedProfile.lastName = lastName;
            if (phone) updatedProfile.phone = phone;
            if (location) updatedProfile.location = location;
            if (imageUrl) updatedProfile.imageUrl = imageUrl;

            //update profile and populate email
            profile = await Profile.findOneAndUpdate(filter, updatedProfile, {
                new: true,
            }).populate('user', ['email']);

            return res.json(profile);
        }
        //return error message if no profile found
        throw new NotFound('No profile found.');
    } catch (err) {
        next();
    }
}

module.exports = updateProfile;
