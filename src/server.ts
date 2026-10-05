import app from './app';
import { env } from './config/env';
import prisma from './config/database';

const PORT = env.PORT;

const server = app.listen(PORT, async () => {
  console.log(`=========================================`);
  console.log(`  POLRI E-TAT BACKEND SERVICE RUNNING   `);
  console.log(`  Port        : ${PORT}                 `);
  console.log(`  Environment : ${env.NODE_ENV}         `);
  console.log(`  URL         : http://localhost:${PORT} `);
  console.log(`=========================================`);

  try {
    await prisma.$connect();
    console.log('✔ Database connection established successfully');
  } catch (error) {
    console.error('✘ Failed to connect to database:', error);
    console.log('ℹ Ensure your PostgreSQL database is running and DATABASE_URL is configured in .env');
  }
});

// Graceful Shutdown
const handleShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
