import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        userInfo: null,
        token: null,
    },
    reducers: {
        loginSuccess: (state, action) => {
            state.userInfo = action.payload.user;
            state.token = action.payload.token;
        },
        clearUserInfo: (state) => {
            state.userInfo = null;
            state.token = null;
        },
    },
});

export const { loginSuccess, clearUserInfo } = authSlice.actions;
export default authSlice.reducer;
