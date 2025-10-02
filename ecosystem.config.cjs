module.exports = {
  apps: [
    {
      name: 'zimbomate-v2',
      cwd: 'C:/ZimboMate',
      script: 'node',
      args: 'dev-direct.js',
      windowsHide: true,
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
}
