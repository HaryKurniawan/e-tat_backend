/// <reference path="./types/express.d.ts" />
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Import route modules
import authRoutes from './modules/auth/auth.routes';
import registrasiRoutes from './modules/registrasi/registrasi.routes';
import permohonanRoutes from './modules/permohonan/permohonan.routes';
import asesmenMedisRoutes from './modules/asesmen-medis/asesmen-medis.routes';
import asesmenHukumRoutes from './modules/asesmen-hukum/asesmen-hukum.routes';
import sidangPlenoRoutes from './modules/sidang-pleno/sidang-pleno.routes';
import rekomendasiRoutes from './modules/rekomendasi/rekomendasi.routes';
import tindakLanjutRoutes from './modules/tindak-lanjut/tindak-lanjut.routes';
import klarifikasiRoutes from './modules/klarifikasi/klarifikasi.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import auditRoutes from './modules/audit/audit.routes';
import uploadRoutes from './modules/upload/upload.routes';

const app: Application = express();

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Memastikan Swagger UI dapat memuat stylesheet dan assets tanpa diblokir CSP
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (seperti Postman atau server-to-server) atau dari origin yang diizinkan
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true); // Dev-friendly
      }
    },
    credentials: true,
  })
);

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 1000, // max 1000 request per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari IP ini, coba lagi nanti.',
  },
});
app.use('/api', limiter);

// Body Parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads folder
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Swagger Documentation UI & OpenAPI Spec
try {
  app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'POLRI E-TAT API Documentation (Swagger)',
      customCss: '.swagger-ui .topbar { background-color: #0b172a; border-bottom: 2px solid #D4AF37; }',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    })
  );
  app.use('/docs', (req: Request, res: Response) => res.redirect('/api-docs'));
} catch (e) {
  console.warn('⚠️ Swagger UI failed to initialize:', e);
}

// Root & Health check endpoints
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    service: 'POLRI E-TAT Backend API',
    version: '1.0.0',
    docs: '/api-docs',
    health: '/api/health',
  });
});

app.get(['/api/health', '/health'], (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'POLRI E-TAT Backend API',
    version: '1.0.0',
    environment: env.NODE_ENV,
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/registrasi', registrasiRoutes);
app.use('/api/permohonan', permohonanRoutes);
app.use('/api/asesmen-medis', asesmenMedisRoutes);
app.use('/api/asesmen-hukum', asesmenHukumRoutes);
app.use('/api/sidang-pleno', sidangPlenoRoutes);
app.use('/api/rekomendasi', rekomendasiRoutes);
app.use('/api/tindak-lanjut', tindakLanjutRoutes);
app.use('/api/klarifikasi', klarifikasiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/upload', uploadRoutes);

// Fallback & Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
