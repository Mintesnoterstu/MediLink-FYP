import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { logger } from './utils/logger.js';
import { notFoundHandler, errorHandler } from './middleware/validation.js';

import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import consentRoutes from './routes/consents.js';
import recordRoutes from './routes/records.js';
import appointmentRoutes from './routes/appointments.js';
import adminRoutes from './routes/admin.js';
import diseaseRoutes from './routes/diseases.js';
import medicineRoutes from './routes/medicines.js';
import auditRoutes from './routes/audit.js';
import professionalRoutes from './routes/professionals.js';
import vitalSignsRoutes from './routes/vitalSigns.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'medilink-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/consents', consentRoutes);
app.use('/api/patient/consents', consentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/medications', medicineRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/professional', professionalRoutes);
app.use('/api/vital-signs', vitalSignsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled promise rejection', { error: err?.message || String(err) });
});

export default app;

