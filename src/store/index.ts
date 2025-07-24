// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authSlice from './slices/authSlice';
import employeeSlice from './slices/employeeSlice';
import serviceSlice from './slices/serviceSlice';
import documentSlice from './slices/documentSlice';
import teamSlice from './slices/teamsSlice';

export const store = configureStore({
    reducer: {
        auth: authSlice,
        employees: employeeSlice,
        services: serviceSlice,
        documents: documentSlice,
        teams: teamSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks typés pour Redux
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;