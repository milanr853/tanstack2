import { createSlice } from '@reduxjs/toolkit';



const initialState = {
    data: null,
};

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setImportData(state, action) {
            state.data = action.payload;
        },
    },
});

export const { setImportData } = dataSlice.actions;
export default dataSlice.reducer;
