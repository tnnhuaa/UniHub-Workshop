if (process.env.NODE_ENV !== 'production' && !process.env.CI) {
  try {
    const { execSync } = require('node:child_process');
    execSync('husky', { stdio: 'ignore' });
  } catch {
    // Gracefully ignore if husky fails or is not available
  }
}
