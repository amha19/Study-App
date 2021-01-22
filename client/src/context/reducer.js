import Profile from '../models/Profile';

export const initialState = {
    isLoading: true,
    isAuth: false,
    userCourse: {},
    profile: Profile,
};

export const reducer = (state, action) => {
    const { type, payload } = action;
    switch (type) {
        case 'LOGIN_SUCCESS':
        case 'REGISTER_SUCCESS':
            return {
                ...state,
                isAuth: true,
                isLoading: false,
            };
        case 'FETCH_USER_COURSES':
            console.log(payload);
            return {
                ...state,
                userCourse: payload[1],
                profile: payload[0],
                isLoading: false,
            };
        case 'LOGIN_FAIL':
        case 'REGISTER_FAIL':
            return {
                ...state,
                isLoading: true,
            };
        case 'updateProfile':
            return {
                ...state,
                profile: payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuth: false,
                isLoading: true,
            };
        default:
            throw new Error('No action type found!');
    }
};
