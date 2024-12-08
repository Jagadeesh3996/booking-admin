
import { createSlice } from "@reduxjs/toolkit";

const navActive = createSlice({
    name: "navActive",
    initialState : {
        value: false,
    },
    reducers:{
        toggle : (state)=>{
            state.value = !state.value;
        },
        show : (state)=>{
            state.value = true;
        },
        hide : (state)=>{
            state.value = false;
        },
    }
});

export const {toggle, show, hide} = navActive.actions;
export default navActive.reducer;