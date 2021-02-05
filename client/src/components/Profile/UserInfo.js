import React, { useState } from 'react';
import { Grid, InputLabel, Button, Typography, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useSnackbar } from 'notistack';

import { useGlobalContext } from '../../context/studyappContext';
import * as actions from '../../context/actions';

const useStyles = makeStyles(theme => ({
    header: {
        margin: theme.spacing(8, 0, 8, 0),
        [theme.breakpoints.down('sm')]: {
            margin: theme.spacing(0, 0, 8, 0),
        },
    },
    inputStyles: {
        fontWeight: '600',
        width: 300,
        [theme.breakpoints.down('xs')]: {
            width: '100%',
            paddingRight: 24,
        },
    },
    labelStyles: {
        paddingBottom: '.5em',
    },
    profileGrid: {
        padding: '2em 0 0 2em',
    },
    button: {
        marginLeft: '1.2em',
        marginTop: '1em',
        width: 300,
    },
    container: {
        padding: theme.spacing(0, 0, 0, 11),
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(0, 0, 0, 6),
        },
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(0, 0, 0, 4),
            marginBottom: 16,
        },
    },
    listsContainer: {
        [theme.breakpoints.down('xs')]: {
            display: 'flex',
            flexDirection: 'column',
        },
    },
    inputWrapper: {
        margin: theme.spacing(2),
    },
}));

const UserInfo = () => {
    const { profile, dispatch } = useGlobalContext();
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();

    const [firstName, setFirstName] = useState(profile.firstName);
    const [lastName, setLastName] = useState(profile.lastName);
    const [email, setEmail] = useState(profile.user.email);
    const [location, setLocation] = useState(profile.location);
    const [phone, setPhone] = useState(profile.phone);

    const handleSubmit = async e => {
        e.preventDefault();
        const userInfo = {
            firstName,
            lastName,
            location,
            phone,
        };

        const res = await actions.updateProfile(userInfo)(dispatch);
        if (res.status === 200) {
            enqueueSnackbar('Updated successfully', {
                variant: 'success',
                autoHideDuration: '5000',
            });
        } else {
            enqueueSnackbar(res.messages, {
                variant: 'Error',
                autoHideDuration: '5000',
            });
        }
    };

    return (
        <Grid item container xs={9} direction="column" className={classes.container}>
            <form noValidate autoComplete="off">
                <Typography variant="h1" className={classes.header}>
                    Profile
                </Typography>
                <Grid item container spacing={4} className={classes.listsContainer}>
                    <Grid item>
                        <div className={classes.inputWrapper}>
                            <InputLabel className={classes.labelStyles}>
                                First Name
                            </InputLabel>
                            <TextField
                                variant="outlined"
                                defaultValue={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                className={classes.inputStyles}
                                placeholder="Add a first name.."
                            />
                        </div>
                    </Grid>
                    {/* Last Name */}
                    <Grid item>
                        <div className={classes.inputWrapper}>
                            <InputLabel className={classes.labelStyles}>
                                Last Name
                            </InputLabel>
                            <TextField
                                variant="outlined"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                className={classes.inputStyles}
                                placeholder="Add a last name.."
                            />
                        </div>
                    </Grid>
                    {/* Email */}
                    <Grid item>
                        <div className={classes.inputWrapper}>
                            <InputLabel className={classes.labelStyles}>Email</InputLabel>
                            <TextField
                                variant="outlined"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className={classes.inputStyles}
                            />
                        </div>
                    </Grid>
                    {/* Phone */}
                    <Grid item>
                        <div className={classes.inputWrapper}>
                            <InputLabel className={classes.labelStyles}>Phone</InputLabel>
                            <TextField
                                variant="outlined"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className={classes.inputStyles}
                                placeholder="Add phone number.."
                            />
                        </div>
                    </Grid>
                    {/* Location */}
                    <Grid item>
                        <div className={classes.inputWrapper}>
                            <InputLabel className={classes.labelStyles}>
                                Location
                            </InputLabel>
                            <TextField
                                variant="outlined"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                className={classes.inputStyles}
                                placeholder="eg. Toronto"
                            />
                        </div>
                    </Grid>
                    <Grid container>
                        <Grid item>
                            <Button
                                color="primary"
                                className={classes.button}
                                onClick={handleSubmit}
                            >
                                Submit
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </form>
        </Grid>
    );
};

export default UserInfo;
