
import { createSlice } from "@reduxjs/toolkit";

const activeLink = createSlice({
    name: "activeLink",
    initialState : {
        value: 'dashboard',
    },
    reducers:{
        active : (state, action) => {
            state.value = action.payload
        }
    }
});

export const {active} = activeLink.actions;
export default activeLink.reducer;