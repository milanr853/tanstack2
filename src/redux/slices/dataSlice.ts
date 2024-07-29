import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { makeData, Person } from '../../makeData';



const initialState = {
    data: makeData(50),
};

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setData(state, action) {
            state.data = action.payload;
        },
    },
});

export const { setData } = dataSlice.actions;
export default dataSlice.reducer;
