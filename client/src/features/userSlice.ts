import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Interface para el estado del usuario
export interface UserState {
    idUsuario: number | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

// Interface para los datos del login
export interface UserLoginData {
    idUsuario: number;
    idSucursal: number;
}

const initialState: UserState = {
    idUsuario: null,
    idSucursal: null,
    status: 'idle',
    error: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserData: (state, action: PayloadAction<UserLoginData>) => {
            state.idUsuario = action.payload.idUsuario;
            state.idSucursal = action.payload.idSucursal;
            state.status = 'succeeded';
        },
        clearUser: (state) => {
            state.idUsuario = null;
            state.idSucursal = null;
            state.status = 'idle';
            state.error = null;
        },
        setLoading: (state) => {
            state.status = 'loading';
        },
        setError: (state, action: PayloadAction<string>) => {
            state.status = 'failed';
            state.error = action.payload;
        }
    },
});

export const { setUserData, clearUser, setLoading, setError } = userSlice.actions;

// Selectores
export const selectUser = (state: { user: UserState }) => state.user;
export const selectIdUsuario = (state: { user: UserState }) => state.user.idUsuario;
// export const selectIdVendedor = (state: { user: UserState }) => state.user.idVendedor;
// export const selectNombreVendedor = (state: { user: UserState }) => state.user.nombreVendedor;
export const selectIdSucursal = (state: { user: UserState }) => state.user.idSucursal;
// export const selectIdPersonaJur = (state: { user: UserState }) => state.user.idPersonaJur;
// export const selectDsuc = (state: { user: UserState }) => state.user.dsuc;
// export const selectDcaja = (state: { user: UserState }) => state.user.dcaja;
// export const selectFactura = (state: { user: UserState }) => state.user.factura;
// export const selectToken = (state: { user: UserState }) => state.user.token;
export const selectUserStatus = (state: { user: UserState }) => state.user.status;
export const selectIsAuthenticated = (state: { user: UserState }) => !!state.user.idUsuario;

export default userSlice.reducer;
