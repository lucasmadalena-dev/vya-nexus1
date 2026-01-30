/**
 * Configuração PM2 - Vya Nexus
 * 
 * Este arquivo define como o PM2 deve gerenciar os processos do Vya Nexus.
 * 
 * Para usar este arquivo em produção:
 * 1. Copie este arquivo para a raiz do projeto no servidor
 * 2. Execute: pm2 start ecosystem.config.js
 * 3. Configure auto-restart: pm2 startup && pm2 save
 * 
 * Comandos úteis:
 * - pm2 start ecosystem.config.js
 * - pm2 stop all
 * - pm2 restart all
 * - pm2 logs
 * - pm2 monit
 * - pm2 delete all
 */

module.exports = {
  apps: [
    {
      // ========================================================================
      // Painel Principal - Vya Nexus Dashboard
      // ========================================================================
      name: 'vya-nexus-dashboard',
      script: './dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '127.0.0.1',
      },
      error_file: './logs/dashboard-error.log',
      out_file: './logs/dashboard-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: false,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      ignore_watch: ['node_modules', 'logs', 'dist'],
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
    },

    {
      // ========================================================================
      // Painel Administrativo - Vya Nexus Admin
      // ========================================================================
      name: 'vya-nexus-admin',
      script: './dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3004,
        HOSTNAME: '127.0.0.1',
      },
      error_file: './logs/admin-error.log',
      out_file: './logs/admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: false,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      ignore_watch: ['node_modules', 'logs', 'dist'],
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
    },

    {
      // ========================================================================
      // Vya Cloud - Storage
      // ========================================================================
      name: 'vya-nexus-cloud',
      script: './dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOSTNAME: '127.0.0.1',
      },
      error_file: './logs/cloud-error.log',
      out_file: './logs/cloud-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: false,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      ignore_watch: ['node_modules', 'logs', 'dist'],
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
    },

    {
      // ========================================================================
      // Vya Email - Communication
      // ========================================================================
      name: 'vya-nexus-email',
      script: './dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        HOSTNAME: '127.0.0.1',
      },
      error_file: './logs/email-error.log',
      out_file: './logs/email-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: false,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      ignore_watch: ['node_modules', 'logs', 'dist'],
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
    },

    {
      // ========================================================================
      // Vya Hosting - Web Hosting
      // ========================================================================
      name: 'vya-nexus-hosting',
      script: './dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
        HOSTNAME: '127.0.0.1',
      },
      error_file: './logs/hosting-error.log',
      out_file: './logs/hosting-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: false,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      ignore_watch: ['node_modules', 'logs', 'dist'],
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
    },
  ],

  // ============================================================================
  // Configurações Globais
  // ============================================================================
  deploy: {
    production: {
      user: 'ubuntu',
      host: '[SEU_IP_DO_SERVIDOR]',
      ref: 'origin/main',
      repo: '[SEU_REPOSITORIO_GIT]',
      path: '/var/www/vya-nexus',
      'post-deploy': 'pnpm install && pnpm build && pm2 reload ecosystem.config.js --env production',
    },
  },
};
