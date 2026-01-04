import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userInfo: null,
    token: null,
    pId: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.userInfo = action.payload.user;
      state.token = action.payload.token;
    },
    clearUserInfo: (state) => {
      state.userInfo = null;
      state.token = null;
      state.pId = null;
    },
    setPId: (state, action) => {
      state.pId = action.payload;
    },
  },
});

export const { loginSuccess, clearUserInfo, setPId } = authSlice.actions;
export default authSlice.reducer;
