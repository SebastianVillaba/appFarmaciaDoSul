import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app: Application = express();
const PORT = Number(process.env.PORT) || 5000;
// En producción escuchar solo en 127.0.0.1: nginx es el único que expone la app
const HOST = process.env.HOST || '0.0.0.0';

// Crear servidor HTTP
const httpServer = createServer(app);

// Middlewares
app.use(helmet()); // Seguridad HTTP headers
app.use(express.json()); // Parser de JSON
app.use(cors()); // Habilitar CORS
app.use(express.urlencoded({ extended: true })); // Parser de URL-encoded

// Ruta de prueba
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '¡Servidor Express con TypeScript funcionando!',
    timestamp: new Date().toISOString(),
  });
});

// Ruta de health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Rutas de la API
app.use('/api', routes);

// Manejo de rutas no encontradas
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

// Manejo de errores global
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Iniciar servidor
httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor corriendo en http://${HOST}:${PORT}`);
  console.log(`📝 Modo: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
