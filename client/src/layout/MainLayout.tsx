import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Typography, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import type { KeyboardEvent, MouseEvent } from 'react';

const menuItems = [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'Entrega de Paquetes', path: '/pacote', icon: <LocalShippingIcon /> }
];

const Layout = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleDrawer = (open: boolean) => (event: KeyboardEvent | MouseEvent) => {
        if (event.type === 'keydown' && ((event as KeyboardEvent).key === 'Tab' || (event as KeyboardEvent).key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    const handleMenuClick = (path: string) => {
        navigate(path);
        setDrawerOpen(false);
    };

    return (
        <Box>
            {/* Botón para abrir el Drawer */}
            {
                !drawerOpen &&
                <IconButton
                    onClick={toggleDrawer(true)}
                    sx={{
                        position: 'fixed',
                        top: 16,
                        left: 16,
                        zIndex: 1300,
                        backgroundColor: 'white',
                        boxShadow: 2
                    }}
                >
                    <MenuIcon />
                </IconButton>
            }

            {/* Drawer Lateral */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
            >
                <Box
                    sx={{ width: 250 }}
                    role="presentation"
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                >
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }} color="primary">
                            Farmacia Do Sul
                        </Typography>
                    </Box>
                    <Divider />
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.path} disablePadding>
                                <ListItemButton
                                    onClick={() => handleMenuClick(item.path)}
                                    selected={location.pathname === item.path}
                                    sx={{
                                        '&.Mui-selected': {
                                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(25, 118, 210, 0.12)',
                                            }
                                        }
                                    }}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            {/* Contenido de las páginas */}
            <Outlet />
        </Box>
    );
};

export default Layout;
