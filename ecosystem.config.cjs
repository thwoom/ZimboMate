module.exports = {
  apps: [
    {
      name: 'zimbomate-v2',
      cwd: 'C:/ZimboMate/packages/zimbomate-v2',
      script: 'node',
      args: 'dev-direct.js',
      windowsHide: true,
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};


