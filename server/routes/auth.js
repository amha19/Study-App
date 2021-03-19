const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const validateBody = require('../middleware/validateBody');
const validateEntryReq = validateBody.entry;
const auth = require('../middleware/verifyAuth');
const {
    Conflict,
    GeneralError,
    NotFound,
    Unauthorized,
} = require('../utils/errors');
const { check } = require('express-validator');
const Profile = require('../models/Profile');
const User = require('../models/user');
const userController = require('../controllers/user');
const Group = require('../models/Group');

router.post('/login', validateEntryReq, async function (req, res, next) {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).catch(() => {
            throw new GeneralError('Error connecting to database');
        });
        if (!user) throw new NotFound('No user found');

        const match = await bcrypt
            .compare(password, user.password)
            .catch(() => {
                throw new GeneralError('Error decrypting password');
            });

        if (!match) throw new Unauthorized('Invalid credentials');

        const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
            expiresIn: '180d',
        });
        res.cookie('token', token, { httpOnly: true });
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});

router.post('/register', validateEntryReq, async function (req, res, next) {
    const {
        firstName,
        lastName,
        email,
        password,
        courses,
        university,
    } = req.body;

    const userInfo = { email, password, courses, university };
    if (!university) delete userInfo['university'];

    try {
        const hashedPw = await bcrypt.hash(password, 10).catch(() => {
            throw new GeneralError('Failed to hash password.');
        });
        userInfo.password = hashedPw;
        const user = new User(userInfo);
        const userDoc = await user.save(user).catch((err) => {
            console.log(err.Error);
            if (!err.errors || (err.errors.email && err.errors.email.reason)) {
                throw new GeneralError('Error connecting to database.');
            } else {
                throw new Conflict('Email already in use.');
            }
        });
        const token = jwt.sign({ id: userDoc.id }, process.env.SECRET_KEY, {
            expiresIn: '180d',
        });
        await new Profile({ user: userDoc.id, firstName, lastName })
            .save()
            .catch(() => {
                throw new GeneralError(
                    'Error creating user profile on registration.'
                );
            });
        res.cookie('token', token, { httpOnly: true });
        res.sendStatus(201);
    } catch (error) {
        next(error);
    }
});

// Removes a group without any members
// router.delete('/group/:groupId', auth, async (req, res, next) => {
//     const { groupId } = req.params;
//     try {
//         const group = await Group.findById(groupId);
//         if (!groupId) throw new NotFound('Group not found');

//         const groupRes = await group.remove();
//         if (!groupRes) throw new GeneralError('Error removing group');

//         res.status(200).json({ message: 'Group removed' });
//     } catch (err) {
//         console.log(err.message);
//         next(err);
//     }
// });

router.delete('/logout', function (req, res) {
    res.clearCookie('token');
    res.sendStatus(204);
});

// PUT /auth/changepasword
// Changes user password
router.put(
    '/changepassword',
    auth,
    [
        check('oldPassword', 'Old password is required').notEmpty(),
        check('newPassword', 'New password is required').notEmpty(),
    ],
    userController.passwordChange
);

module.exports = router;
