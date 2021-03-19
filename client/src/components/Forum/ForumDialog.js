import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/styles';
import {
    Grid,
    Typography,
    Divider,
    Box,
    IconButton,
    Avatar,
    CircularProgress,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import ForwardIcon from '@material-ui/icons/Forward';
import ForwardOutlinedIcon from '@material-ui/icons/ForwardOutlined';
import Comments from '../Posts/Comments';
import axios from 'axios';
import defaultPostPicture from '../../images/study_group.png';

const useStyles = makeStyles(theme => ({
    title: {
        marginBottom: theme.spacing(2),
    },
    close: {
        height: 2.5,
    },
    upvote: {
        transform: 'rotate(-90deg)',
        height: '2rem',
        width: '2rem',
    },
    divider: {
        margin: theme.spacing(2, 0),
        width: '100%',
    },
    input: {
        margin: theme.spacing(2, 0),
    },
    avatar: {
        height: '75px',
        width: '75px',
        margin: theme.spacing(1),
        border: '2px solid #2968FF',
    },
    circular: {
        height: '200px',
        width: '200px',
    },
    postText: {
        padding: theme.spacing(1, 0, 1, 5),
    },
    button: {
        height: 117,
    },
}));

const PostDialog = ({ handleClosePost, activePostId }) => {
    const classes = useStyles();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [avatarUrl, setAvatarUrl] = useState();
    const [userAvatar, setUserAvatar] = useState();
    const [title, setTitle] = useState();
    const [postText, setPostText] = useState();
    const [upvoted, setUpvoted] = React.useState(false);

    const toggleVote = () => {
        setUpvoted(!upvoted);
    };

    const getPostData = async () => {
        try {
            const res = await axios.get(`/forum/post/${activePostId}`);
            setTitle(res.data.post.title);
            setPostText(res.data.post.text);
            setAvatarUrl(res.data.post.postAvatar);
            setUserAvatar(res.data.post.userAvatar);
            setComments(res.data.post.comments);
        } catch (err) {
            console.log(err);
        }
    };
    useEffect(() => {
        getPostData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePostId]);

    const addComment = async () => {
        const res = await axios.post(`forum/post/comment/${activePostId}`, {
            text: newComment,
        });
        const updatedComments = [...comments, res.data.comment];
        setComments(updatedComments);
        setNewComment('');
    };

    if (!title)
        return (
            <Grid
                container
                direction="column"
                justify="center"
                align="center"
                alignItems="center"
                className={classes.circular}
            >
                {/* <LinearProgress /> */}
                <CircularProgress size={100} color="secondary" />
            </Grid>
        );
    return (
        <div>
            <Grid item container direction="column" justify="center" alignItems="center">
                <Grid item container direction="column" alignItems="center">
                    <Grid
                        item
                        xs={12}
                        container
                        justify="space-between"
                        alignItems="baseline"
                    >
                        <Grid item xs={1}>
                            <Button
                                onClick={handleClosePost}
                                color="primary"
                                className={classes.close}
                            >
                                <CloseIcon />
                            </Button>
                        </Grid>
                        <Grid item xs={10}>
                            {/* Title */}
                            <Typography
                                variant="h1"
                                align="center"
                                id="form-dialog-title"
                                className={classes.title}
                            >
                                {title}
                            </Typography>
                        </Grid>
                        <Grid item xs={1}></Grid>
                    </Grid>

                    <Divider className={classes.divider} />
                    {/* Image container */}
                    <Grid item container xs={12} justify="center">
                        <Grid item>
                            <img
                                src={avatarUrl ? avatarUrl : defaultPostPicture}
                                alt="Post"
                            />
                        </Grid>
                    </Grid>
                    <Box className={classes.imageContainer}></Box>

                    <Divider className={classes.divider} />
                    {/* Post text body */}
                    <Grid item container xs={12} alignItems="center">
                        <Grid item xs={1}>
                            <Avatar className={classes.avatar} src={userAvatar}></Avatar>
                        </Grid>
                        <Grid item xs={10}>
                            <Typography className={classes.postText}>
                                {postText}
                            </Typography>
                        </Grid>
                        <Grid item xs={1}>
                            <IconButton aria-label="upvote" onClick={toggleVote}>
                                {upvoted ? (
                                    <ForwardIcon
                                        color="secondary"
                                        className={classes.upvote}
                                    />
                                ) : (
                                    <ForwardOutlinedIcon
                                        color="secondary"
                                        className={classes.upvote}
                                    />
                                )}
                            </IconButton>
                        </Grid>
                    </Grid>
                    <Divider className={classes.divider} />
                    {/* Comments loop container */}
                    <Grid item container xs={12} justify="center">
                        <Grid item xs={1}></Grid>
                        <Grid item xs={9} container direction="column">
                            {comments.map(comment => (
                                <Grid item key={comment._id}>
                                    <Comments comment={comment} />
                                </Grid>
                            ))}
                        </Grid>
                        <Grid item xs={1}></Grid>
                        <Grid
                            item
                            container
                            xs={12}
                            alignItems="center"
                            justify="center"
                            spacing={1}
                        >
                            <Grid item xs={10}>
                                <TextField
                                    variant="outlined"
                                    autoFocus
                                    label="Comment on post"
                                    type="text"
                                    multiline
                                    rows={4}
                                    rowsMax={4}
                                    color="secondary"
                                    fullWidth
                                    className={classes.input}
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <Button
                                    color="secondary"
                                    variant="outlined"
                                    onClick={addComment}
                                    className={classes.button}
                                    fullWidth
                                    // disabled={}
                                >
                                    Add Comment
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </div>
    );
};
export default PostDialog;
