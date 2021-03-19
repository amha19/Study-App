import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import defaultPostPicture from '../../images/study_group.png';
import { msToTimeAgo } from '../../utils/convertTimeStamps';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        borderRadius: 15,
    },
    actionArea: {
        height: 120,
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        alignItems: 'center',
    },
    cardInfo: {
        display: 'grid',
        gridTemplateRows: '1fr',
        justify: 'space-between',
        paddingRight: theme.spacing(2),
    },
    cardImage: {
        width: 100,
        height: 100,
        justifySelf: 'center',
        borderRadius: '10px',
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: '1.375rem',
        [theme.breakpoints.down('sm')]: {
            fontSize: '1.25rem',
        },
        [theme.breakpoints.down('xs')]: {
            fontWeight: 'normal',
            fontSize: '1rem',
        },
    },
    cardDesc: {
        fontSize: '0.875rem',
    },
    postedBy: {
        color: '#2968FF',
    },
    postDateInfo: {
        paddingTop: 10,
    },
}));

const PostCard = ({ post, updateActivePost }) => {
    const classes = useStyles();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <Grid
                container
                direction="column"
                justify="center"
                align="center"
                alignItems="center"
            >
                <CircularProgress size={100} color="secondary" />
            </Grid>
        );
    }

    const updatePostId = () => {
        updateActivePost(post._id);
    };

    return (
        <Card className={classes.root} variant="outlined" onClick={updatePostId}>
            <CardActionArea className={classes.actionArea}>
                <CardMedia
                    component="img"
                    alt="alt img"
                    height="140"
                    image={post.postAvatar ? post.postAvatar : defaultPostPicture}
                    title={post.title}
                    className={classes.cardImage}
                />
                <CardContent className={classes.cardInfo}>
                    <div>
                        <Typography className={classes.cardTitle}>
                            {post.title}
                        </Typography>
                    </div>
                    <div className={classes.postDateInfo}>
                        <span className={classes.cardDesc}>
                            Posted {post.postDate} by{' '}
                        </span>
                        <span className={classes.postedBy}>{post.name}</span>
                    </div>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default PostCard;
