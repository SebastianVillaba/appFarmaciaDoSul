import { useSelector, useDispatch } from 'react-redux';
import {
    selectUser,
    selectIdUsuario,
    //selectIdVendedor,
    // selectNombreVendedor,
    // selectIdSucursal,
    // selectIdPersonaJur,
    // selectDsuc,
    // selectDcaja,
    // selectFactura,
    // selectToken,
    selectUserStatus,
    selectIsAuthenticated,
    setUserData,
    clearUser,
    type UserLoginData
} from '../features/userSlice';

/**
 * Hook para acceso rápido a todos los datos del usuario
 * @returns Objeto con todos los datos del usuario y funciones útiles
 */
export const useUser = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const login = (userData: UserLoginData) => {
        dispatch(setUserData(userData));
    };

    const logout = () => {
        dispatch(clearUser());
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    };

    return {
        // Datos del usuario
        ...user,
        isAuthenticated,

        // Funciones
        login,
        logout
    };
};

// Hooks individuales para casos donde solo necesitas un campo específico
export const useIdUsuario = () => useSelector(selectIdUsuario);
// export const useIdVendedor = () => useSelector(selectIdVendedor);
// export const useNombreVendedor = () => useSelector(selectNombreVendedor);
// export const useIdSucursal = () => useSelector(selectIdSucursal);
// export const useIdPersonaJur = () => useSelector(selectIdPersonaJur);
// export const useDsuc = () => useSelector(selectDsuc);
// export const useDcaja = () => useSelector(selectDcaja);
// export const useFactura = () => useSelector(selectFactura);
// export const useToken = () => useSelector(selectToken);
export const useUserStatus = () => useSelector(selectUserStatus);
export const useIsAuthenticated = () => useSelector(selectIsAuthenticated);
