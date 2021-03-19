const { GeneralError, NotFound, Unauthorized } = require('../utils/errors');
const { validationResult } = require('express-validator');

const Profile = require('../models/Profile');
const Post = require('../models/post');
const Forum = require('../models/Forum');

exports.creatForumPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({
            error: errors.array(),
        });

    const forumId = req.params.forumId;

    const { title, text, userId, postAvatar } = req.body;

    try {
        const forum = await Forum.findById(forumId);
        if (!forum) throw new NotFound('No forum found');

        const profile = await Profile.findOne({ user: userId });
        if (!profile) throw new NotFound('No profile found');

        const d = new Date();
        const nowTime = Math.floor(d.getTime() / 1000);

        const post = new Post({
            user: userId,
            title,
            text,
            postAvatar,
            name: `${profile.firstName} ${profile.lastName}`,
            userAvatar: `${profile.imageUrl}`,
            date: nowTime,
        });

        const response = await post.save();
        if (!response) throw new GeneralError('Error creating post.');

        forum.posts.push(post);
        const forumRes = forum.save();
        if (!forumRes) throw new GeneralError('Error adding a post to a forum');

        res.status(201).send(response);
    } catch (err) {
        console.log(err.message);
        next(error);
    }
};

exports.getPost = async (req, res, next) => {
    const { postId } = req.params;
    try {
        const post = await Post.findById(postId).populate({
            path: 'comments',
            model: 'Comment',
        });

        if (!post) throw NotFound('Post not found');

        res.status(200).json({ post });
    } catch (err) {
        console.log(err.message);
        next(err);
    }
};

exports.hidePost = async (req, res, next) => {
    const { forumId, postId } = req.params;

    try {
        const forum = await Forum.findById(forumId);
        if (!forum) throw new NotFound('No forum found');

        const post = await Post.findById(postId);
        if (!post) throw new NotFound('No post found');

        const forumPost = forum.posts.find((fp) => fp.toString() === postId);
        if (!forumPost) throw new NotFound('No post in forum found');

        // check if useres are deleteing their own posts
        if (post.user.toString() !== req.body.userId)
            throw new Unauthorized('Cannot delete post');

        post.isDeleted = true;

        const postRes = await post.save();
        if (!postRes) throw new GeneralError('Error saving post');

        res.status(200).json({ post });
    } catch (err) {
        console.log(err.message);
        next(err);
    }
};

exports.editPost = async (req, res, next) => {
    const { postId } = req.params;
    const { userId, title, text, postAvatar } = req.body;
    try {
        const post = await Post.findById(postId);
        if (!post) throw new NotFound('No post found');

        // check if useres are editing their own posts
        if (post.user.toString() !== userId)
            throw new Unauthorized('Cannot edit post');

        if (title) post.title = title;
        if (text) post.text = text;
        if (postAvatar) post.postAvatar = postAvatar;

        const response = await post.save();
        if (!response) throw new GeneralError('Error editing post');

        res.status(200).json({ post });
    } catch (err) {
        console.log(err.message);
        next(err);
    }
};

exports.addUpvote = async (req, res, next) => {
    const { postId } = req.params;
    const { userId } = req.body;

    try {
        const post = await Post.findById(postId);
        if (!post) throw new NotFound('No post found');

        // make sure a user can up vote a post only once.
        const votesArr = post.votes.filter(
            (vote) => vote.user.toString() === userId
        );

        if (votesArr.length > 0)
            throw new Unauthorized('Cannot up vote more than once');

        post.votes.push({ user: userId });

        const response = await post.save();
        if (!response) throw new GeneralError('Error voting');

        res.status(200).json({ post });
    } catch (err) {
        console.log(err.message);
        next(err);
    }
};

exports.removeUpvote = async (req, res, next) => {
    const { postId } = req.params;
    const { userId } = req.body;

    try {
        const post = await Post.findById(postId);
        if (!post) throw new NotFound('No post found');

        const voteArr = post.votes.filter(
            (vote) => vote.user.toString() === userId
        );
        if (voteArr.length === 0)
            throw new GeneralError('Post has not yet been voted');

        post.votes = post.votes.filter(
            (vote) => vote.user.toString() !== userId
        );

        const response = await post.save();
        if (!response) throw GeneralError('Error in unvoting');

        res.status(200).json({ post });
    } catch (err) {
        console.log(err.message);
        next(err);
    }
};
