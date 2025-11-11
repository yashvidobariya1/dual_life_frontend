// store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./authSlice";

// combine all slices here (even if only one for now)
const rootReducer = combineReducers({
    auth: authReducer,
});

// Persist config
const persistConfig = {
    key: "root",
    storage,
    whitelist: ["auth"], // persist only auth slice
};

// Wrap rootReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);
export default store;
