
import { createSlice } from "@reduxjs/toolkit";

const user = createSlice({
    name: "user",
    initialState : {
        loggedin : 'no',
        userDetails : {
            UserID : '',
            UserName : '',
            UserRole : '',
            UserEmail : '',
            UserTeamId : ''
        } 
    },
    
    reducers:{
        setUserDetails : (state, action) => {
            state.loggedin = action.payload.isLogin
            state.userDetails = action.payload.userdetails
        }
    }
});

export const {setUserDetails} = user.actions;
export default user.reducer;