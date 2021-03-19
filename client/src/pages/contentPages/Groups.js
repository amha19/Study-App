import React, { useState, useMemo, useCallback } from 'react';
import {
    Grid,
    Typography,
    Container,
    Button,
    Modal,
    FormHelperText,
    MenuItem,
    Select,
    TextField,
} from '@material-ui/core';
import {
    baseStyle,
    activeStyle,
    acceptStyle,
    rejectStyle,
} from '../../components/Group/GroupPicture.styles';
import { Tooltip, Box } from '@material-ui/core';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

import { makeStyles } from '@material-ui/core/styles';
import GroupCard from '../../components/Group/GroupCard';
import defaultImage from '../../images/upload_placeholder.png';
import { useSnackbar } from 'notistack';
import { useConversationContext, useGlobalContext } from '../../context/studyappContext';
import * as actions from '../../context/actions';

const useStyles = makeStyles(theme => ({
    cardGrid: {
        paddingTop: theme.spacing(8),
        paddingBottom: theme.spacing(8),
    },
    button: {
        marginTop: '60px',
        marginRight: '60px',
        textTransform: 'none',
    },
    paper: {
        position: 'fixed',
        width: 475,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        borderRadius: 4,
        outline: 'none',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%)`,
    },
    groupImageContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '10px',
        paddingBottom: '10px',
    },
    large: {
        height: '300px',
        width: '400px',
    },
    uploading: {
        opacity: 0.5,
        height: '300px',
        width: '400px',
    },
}));

const Groups = () => {
    const classes = useStyles();
    const { conversationManager } = useConversationContext();
    const { userGroups, userCourse, dispatch } = useGlobalContext();
    const { groups, courseGroups } = userGroups;
    const [suggestedGroups, setSuggestedGroups] = useState([]);

    const { enqueueSnackbar } = useSnackbar();
    const [openModal, setOpen] = useState(false);
    const [groupError, setGroupErrors] = useState('');
    const [uploading, setUploading] = useState(false);
    const [groupPicture, setGroupPicture] = useState('');
    const [groupName, setGroupName] = useState('');
    const [groupNameValid, setGroupNameValid] = useState('');
    const [courseId, setCourseId] = useState('');

    const onDrop = useCallback(async droppedFiles => {
        if (droppedFiles.length) {
            setUploading(true);

            const form = new FormData();
            form.append('image', droppedFiles[0]);
            const res = await axios
                .post('/upload/single', form)
                .catch(err => console.log(err));
            if (res && res.data) {
                setGroupPicture(res.data.imageUrl);
                setUploading(false);
            }
        }
    }, []);

    const { getRootProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: 'image/*',
    });

    const style = useMemo(
        () => ({
            ...baseStyle,
            ...(isDragActive ? activeStyle : {}),
            ...(isDragAccept ? acceptStyle : {}),
            ...(isDragReject ? rejectStyle : {}),
        }),
        [isDragActive, isDragReject, isDragAccept]
    );

    const handleOpen = () => {
        setOpen(true);
        setGroupPicture('');
    };

    const handleClose = () => {
        setOpen(false);
        setGroupPicture('');
        setGroupName('');
        setGroupErrors('');
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (isFormValid()) {
            const data = {
                groupName: groupName,
                imageUrl: groupPicture,
                courseId: courseId,
            };

            const response = await axios.post('/user/groups', data);

            setGroupName('');
            setCourseId('');
            setGroupPicture('');

            if (response.data) {
                groups.push(response.data.data);
                await actions.fetchUserGroups(groups)(dispatch);

                conversationManager.updateRooms(groups);

                enqueueSnackbar('Group Created Successfully.', {
                    variant: 'success',
                    autoHideDuration: '5000',
                });
                setOpen(false);
            } else {
                enqueueSnackbar('Error Creating Group.', {
                    variant: 'Error',
                    autoHideDuration: '5000',
                });
            }
        } else {
            enqueueSnackbar('Error Creating Group.', {
                variant: 'Error',
                autoHideDuration: '5000',
            });
        }
    };

    const handleOnChange = e => {
        checkGroupExists(e.target.value.toLowerCase());
    };

    const isFormValid = () => {
        return groupNameValid && courseId ? true : false;
    };

    const checkGroupExists = name => {
        try {
            const allGroupNames = [...groups, ...courseGroups].map(group => {
                return group.name.toLowerCase();
            });

            setGroupName(name);

            if (allGroupNames.includes(name) !== true) {
                setGroupErrors('');
                setGroupNameValid(true);
                return false;
            } else {
                setGroupErrors('A group with this name already exists!');
                setGroupNameValid(false);
                return true;
            }
        } catch (err) {
            console.log(err);
        }
    };

    const body = (
        <div className={classes.paper}>
            <h2>Create a new group</h2>
            <p>Add group name and select your course.</p>
            <form className={classes.form} onSubmit={handleSubmit}>
                <FormHelperText>
                    {groupError ? (
                        <span style={{ color: '#fc2525' }}>{groupError}</span>
                    ) : (
                        'Please enter a group name'
                    )}
                </FormHelperText>
                <TextField
                    name="group_name"
                    fullWidth={true}
                    variant="outlined"
                    onChange={handleOnChange}
                ></TextField>

                <Box className={classes.groupImageContainer}>
                    <FormHelperText>Drag and Drop Group Picture </FormHelperText>
                    <Tooltip title="Drag and drop group picture" arrow placement="right">
                        <Box {...getRootProps({ style })}>
                            <img
                                alt="Profile Pic"
                                src={groupPicture ? groupPicture : defaultImage}
                                className={uploading ? classes.uploading : classes.large}
                            />
                        </Box>
                    </Tooltip>
                </Box>

                <FormHelperText>Course</FormHelperText>
                <Select name="course" variant="outlined" fullWidth={true} defaultValue="">
                    {userCourse.userCourses.map(course => {
                        return (
                            <MenuItem
                                key={course._id}
                                value={course._id}
                                onClick={() => setCourseId(course._id)}
                            >
                                {course.name}
                            </MenuItem>
                        );
                    })}
                </Select>
                <Button
                    type="submit"
                    className={classes.button}
                    color="primary"
                    style={{ marginTop: '20px' }}
                >
                    Create New Group
                </Button>
            </form>
        </div>
    );

    //filter out courses which the user has joined as suggestions
    React.useEffect(() => {
        const suggested = courseGroups.filter(group => {
            return !groups.some(joinedGroup => {
                return joinedGroup._id === group._id;
            });
        });
        setSuggestedGroups(suggested);
    }, [courseGroups, userGroups, groups]);

    const handleJoinGroup = async id => {
        try {
            const res = await axios.post(`/user/groups/${id}`, { groupId: id });
            const currGroups = [...groups, res.data];
            const newUserGroups = { courseGroups: [...courseGroups], groups: currGroups };
            dispatch({ type: 'updateUserGroups', payload: newUserGroups });
            conversationManager.updateRooms(currGroups);
        } catch (err) {
            console.log(err);
        }
    };

    const handleLeaveGroup = async id => {
        try {
            const res = await axios.delete(`/user/groups/${id}`, { groupId: id });
            const [currentGroups, updatedCourseGroups] = [
                [...groups],
                [...userGroups.courseGroups],
            ];

            const myGroups = currentGroups.filter(group => group._id !== res.data._id);

            const index = updatedCourseGroups.findIndex(
                group => group._id === res.data._id
            );

            updatedCourseGroups[index] = res.data;

            const newUserGroups = { courseGroups: updatedCourseGroups, groups: myGroups };

            dispatch({ type: 'updateUserGroups', payload: newUserGroups });
            conversationManager.updateRooms(myGroups);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <Grid>
            <Grid container>
                <Grid item direction="row" container md={4}></Grid>
                <Grid item justify="center" direction="row" container md={4}></Grid>
                <Grid item justify="flex-end" direction="row" container md={4}>
                    <Button
                        className={classes.button}
                        color="primary"
                        onClick={handleOpen}
                    >
                        Create New Group
                    </Button>
                    <Modal open={openModal} onClose={handleClose}>
                        {body}
                    </Modal>
                </Grid>
            </Grid>

            {groups.length > 0 && (
                <>
                    <Grid container>
                        <Grid item justify="center" direction="row" container sm={12}>
                            <Typography
                                variant="h1"
                                color="textPrimary"
                                style={{ paddingTop: '60px' }}
                            >
                                Your Groups
                            </Typography>
                        </Grid>
                    </Grid>
                    <Container className={classes.cardGrid} maxWidth="md">
                        <Grid container spacing={4}>
                            {groups.map(card => (
                                <GroupCard
                                    key={card._id}
                                    actionText="Leave Group"
                                    data={card}
                                    handleCardPress={handleLeaveGroup}
                                />
                            ))}
                        </Grid>
                    </Container>
                </>
            )}
            {suggestedGroups.length && (
                <>
                    <Grid container>
                        <Grid item justify="center" direction="row" container sm={12}>
                            <Typography
                                variant="h1"
                                color="textPrimary"
                                style={{ paddingTop: '60px' }}
                            >
                                Suggested For You.
                            </Typography>
                        </Grid>
                        <Grid item justify="center" direction="row" container sm={12}>
                            <Typography
                                variant="h6"
                                color="textSecondary"
                                style={{ paddingTop: '20px' }}
                            >
                                Groups you might be interested in!
                            </Typography>
                        </Grid>
                    </Grid>

                    <Container className={classes.cardGrid} maxWidth="md">
                        <Grid container spacing={4}>
                            {suggestedGroups.map(card => (
                                <GroupCard
                                    key={card._id}
                                    actionText="Join Group"
                                    data={card}
                                    handleCardPress={handleJoinGroup}
                                />
                            ))}
                        </Grid>
                    </Container>
                </>
            )}
        </Grid>
    );
};

export default Groups;
