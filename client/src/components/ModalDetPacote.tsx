import { 
  Box, 
  Card, 
  Modal, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography, 
  Backdrop, 
  IconButton 
} from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';
import type { DetallePacote } from "../types/Pacote/pacote.type";

interface ModalDetPacoteProps {
    open: boolean;
    handleCloseModal: () => void;
    detalle: DetallePacote[];
}

export const ModalDetPacote = ({ open, handleCloseModal, detalle }: ModalDetPacoteProps) => {
    return (
        <Modal
            open={open}
            onClose={handleCloseModal}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                    sx: { backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }
                },
            }}
        >
            <Card
                elevation={24} 
                sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '95%', sm: 650 },
                    maxHeight: '90vh',
                    borderRadius: 4, 
                    border: '1px solid rgba(25, 118, 210, 0.08)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                }}
            >
                <Box 
                    sx={{ 
                        p: 3, 
                        backgroundColor: '#ffffff', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                    }}
                >
                    <Box>
                        <Typography id="modal-title" variant="h6" sx={{ fontWeight: 700, color: '#1a365d' }}>
                            Detalle del Paquete
                        </Typography>
                    </Box>
                    <IconButton onClick={handleCloseModal} size="small" sx={{ color: 'text.secondary' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <TableContainer sx={{ overflowY: 'auto', maxHeight: '60vh', p: 1 }}>
                    <Table stickyHeader sx={{ minWidth: 400 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc', color: '#475569' }}>Producto</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc', color: '#475569' }} align="center">Cantidad</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc', color: '#475569' }} align="right">Precio</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc', color: '#475569' }} align="right">Subtotal</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {detalle.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        No se encontraron detalles para este paquete.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                detalle.map((row) => (
                                    <TableRow key={row.idDetPreventa} hover>
                                        <TableCell sx={{ fontWeight: 500 }}>{row.nombreProducto}</TableCell>
                                        <TableCell align="center">{row.cantidad}</TableCell>
                                        <TableCell align="right">
                                            {Number(row.precio).toLocaleString('es-PY', { style: 'currency', currency: 'PYG' })}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                            {Number(row.subtotal).toLocaleString('es-PY', { style: 'currency', currency: 'PYG' })}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Modal>
    )
}