import { Typography, Container, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 6, 
          textAlign: 'center', 
          borderRadius: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f9fbfd 100%)',
          border: '1px solid rgba(25, 118, 210, 0.08)'
        }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }} color="primary">
          Farmacia Do Sul
        </Typography>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, color: 'text.primary', mb: 2 }}>
          Portal de Gestión Farmacéutica
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: '500px', mx: 'auto', lineHeight: 1.6 }}>
          Bienvenido al sistema unificado. Utilice el menú lateral desplegable para acceder a los módulos.
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          startIcon={<LocalShippingIcon />}
          onClick={() => navigate('/pacote')}
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: 3,
            boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.4)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px 0 rgba(25, 118, 210, 0.5)',
            }
          }}
        >
          Gestión de Entregas (Pacotes)
        </Button>
      </Paper>
    </Container>
  );
}
