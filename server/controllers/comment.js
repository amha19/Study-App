const { GeneralError, NotFound, Unauthorized } = require('../utils/errors');
const { validationResult } = require('express-validator');

const Profile = require('../models/Profile');
const Post = require('../models/post');
const Comment = require('../models/Comment');

exports.addComment = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
        return res.status(400).json({
            error: errors.array(),
        });

    const { postId } = req.params;
    const { userId, text } = req.body;

    try {
        const post = await Post.findById(postId);
        if (!post) throw new NotFound('No post found');

        const profile = await Profile.findOne({ user: userId });
        if (!profile) throw new NotFound('No profile found');

        const comment = new Comment({
            user: userId,
            text,
            name: `${profile.firstName} ${profile.lastName}`,
            avatar: profile.imageUrl,
        });

        const commentRes = comment.save();
        if (!commentRes) throw new GeneralError('Error adding a comment');

        post.comments.push(comment);

        const postRes = await post.save();
        if (!postRes) throw new GeneralError('Error saving post');

        res.status(201).json({ comment });
    } catch (err) {
        console.log(err.message);
        next(err);
    }
};

exports.hideComment = async (req, res, next) => {
    const { postId, commentId } = req.params;

    try {
        const post = await Post.findById(postId);
        if (!post) throw new NotFound('No post found');

        const comment = await Comment.findById(commentId);
        if (!comment) throw new NotFound('No comment found');

        const postComment = post.comments.find(
            (pc) => pc.toString() === commentId
        );
        if (!postComment) throw new NotFound('No comment in post found');

        // check if a usere is deleteing his/her own comment
        if (comment.user.toString() !== req.body.userId)
            throw new Unauthorized('Cannot delete comment');

        comment.isDeleted = true;

        const response = await comment.save();
        if (!response) throw new GeneralError('Error saving comment');

        res.status(200).json({ comment });
    } catch (err) {
        console.log(err.message);
        next(err);
    }
};

exports.editComment = async (req, res, next) => {
    const { commentId } = req.params;
    const { userId, text } = req.body;

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) throw new NotFound('No comment found');

        // check if a user is editing his/her own comment
        if (comment.user.toString() !== userId)
            throw new Unauthorized('Cannot edit comment');

        if (text) comment.text = text;

        const response = await comment.save();
        if (!response) throw new GeneralError('Error editing comment');

        res.status(200).json({ comment });
    } catch (err) {
        console.log(err.message);
        next(err);
    }
};
