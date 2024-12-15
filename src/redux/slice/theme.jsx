
import { createSlice } from "@reduxjs/toolkit";

const theme = createSlice({
    name: "theme",
    initialState : {
        value: localStorage.getItem('theme') || 'light',
    },
    reducers:{
        activeTheme : (state, action) => {
            state.value = action.payload
        }
    }
});

export const {activeTheme} = theme.actions;
export default theme.reducer;