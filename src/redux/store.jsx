
import { configureStore } from "@reduxjs/toolkit";
import NavActiveReduce from './slice/navactive';
import ActiveLinkReduce from './slice/activelink';
import DropdownReduce from './slice/dropdown';
import userReducer from './slice/user';
import themeReducer from './slice/theme';

export const store = configureStore({
    reducer : {
        navActive : NavActiveReduce,
        activeLink : ActiveLinkReduce,
        dropdown : DropdownReduce,
        user : userReducer,
        theme : themeReducer,
    }
});
