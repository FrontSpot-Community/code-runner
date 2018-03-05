module.exports = {
  apps: [
    {
      name: 'FrontspotCodeRunner',
      script: './app/index.js',
      env: {
        PORT: 3003,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
    },
  ],
  deploy: {
    production: {
      user: process.env.USER,
      host: process.env.HOST,
      ref: 'origin/master',
      repo: 'https://github.com/FrontSpot-Community/code-runner.git',
      path: '/home/code-battle-admin/production',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js --env=production',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};

