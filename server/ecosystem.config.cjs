// Configuración de PM2 para producción.
// Uso (desde la carpeta server, después de `npm run build`):
//   pm2 start ecosystem.config.cjs
// Las credenciales y secretos se leen de server/.env (no versionado).
module.exports = {
  apps: [
    {
      name: 'farmaciadosul-api',
      script: 'dist/index.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '300M',
      time: true,
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        HOST: '127.0.0.1',
        TRUST_PROXY: 'true',
      },
    },
  ],
};
