
import { createSlice } from "@reduxjs/toolkit";

const dropdown = createSlice({
    name: "dropdown",
    initialState : {
        value: null,
    },
    reducers:{
        dptoggle : (state, action) => {
            state.value = ( state.value !== action.payload ? action.payload : null);
        },
        dpshow : (state, action) => {
            state.value = action.payload
        }
    }
});

export const {dptoggle, dpshow} = dropdown.actions;
export default dropdown.reducer;