import { Router } from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';

import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validation.js';
import { withMedilinkSession } from '../config/database.js';
import {
  createWoredaAdmin,
  createCityAdmin,
  listWoredaAdmins,
  getCityAdmin,
  getZoneStatistics,
  getZoneAuditLogs,
  getRealtimeEmailStatus,
  createFacilityAdmin,
  registerFacility,
  getFacilityAdmins,
  getFacilities,
  getWoredaStatistics,
  getCityStatistics,
  getWoredaAudit,
  getCityAudit,
  createDoctor,
  createNurse,
  registerPatientByFacilityAdmin,
  checkPatientDuplicate,
  getDoctors,
  getNurses,
  getPatientsBasic,
  getFacilityStatistics,
  getFacilityAudit,
} from '../controllers/adminController.js';

const router = Router();
const zonalRoleOnly = requireRole('zonal_admin');

const ADMIN_CHILD_ROLE = {
  zonal_admin: ['woreda_admin', 'city_admin'],
  woreda_admin: ['facility_admin'],
  city_admin: ['facility_admin'],
  facility_admin: [],
};

function assertAllowedAdminCreation(actorRole, targetRole) {
  const allowed = ADMIN_CHILD_ROLE[actorRole] || [];
  return Array.isArray(allowed) && allowed.includes(targetRole);
}

// Create sub-admin (next level down). Enforced in API layer (admins still cannot access patient data due to RLS).
const createUserSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  phone: Joi.string().min(8).optional(),
  fullName: Joi.string().min(2).required(),
  role: Joi.string()
    .valid('woreda_admin', 'city_admin', 'facility_admin')
    .required(),
  zoneId: Joi.string().uuid().optional(),
  woredaId: Joi.string().uuid().optional(),
  facilityId: Joi.string().uuid().optional(),
  password: Joi.string().min(6).required(),
});

const createWoredaAdminSchema = Joi.object({
  woredaName: Joi.string()
    .valid('Jimma', 'Seka', 'Gera', 'Gomma', 'Mana', 'Limmu Kosa', 'Kersa', 'Dedo', 'Omo Nada', 'Sigimo')
    .required(),
  fullName: Joi.string().min(2).required(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  recoveryEmail: Joi.string().email({ tlds: { allow: false } }).required(),
  phoneNumber: Joi.string().min(8).required(),
  officialTitle: Joi.string().min(2).required(),
});

const createCityAdminSchema = Joi.object({
  cityName: Joi.string().valid('Jimma City').default('Jimma City'),
  fullName: Joi.string().min(2).required(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  recoveryEmail: Joi.string().email({ tlds: { allow: false } }).required(),
  phoneNumber: Joi.string().min(8).required(),
  officialTitle: Joi.string().min(2).required(),
});

const createFacilityAdminSchema = Joi.object({
  facilityName: Joi.string().min(2).required(),
  facilityType: Joi.string().valid('Hospital', 'Health Center', 'Clinic').required(),
  licenseNumber: Joi.string().min(2).required(),
  licenseDocument: Joi.string().allow('', null).optional(),
  facilityAddress: Joi.string().min(2).required(),
  facilityPhone: Joi.string().min(8).required(),
  facilityEmail: Joi.string().email({ tlds: { allow: false } }).required(),
  adminFullName: Joi.string().min(2).required(),
  adminEmail: Joi.string().email({ tlds: { allow: false } }).required(),
  recoveryEmail: Joi.string().email({ tlds: { allow: false } }).required(),
  adminPhone: Joi.string().min(8).required(),
  officialTitle: Joi.string().min(2).required(),
});

const registerFacilitySchema = Joi.object({
  facilityName: Joi.string().min(2).required(),
  facilityType: Joi.string().valid('Hospital', 'Health Center', 'Clinic').required(),
  licenseNumber: Joi.string().min(2).required(),
  licenseDocument: Joi.string().allow('', null).optional(),
  facilityAddress: Joi.string().min(2).required(),
  facilityPhone: Joi.string().min(8).required(),
  facilityEmail: Joi.string().email({ tlds: { allow: false } }).required(),
});

const createDoctorSchema = Joi.object({
  fullName: Joi.string().min(2).required(),
  licenseNumber: Joi.string().min(2).required(),
  licenseDocument: Joi.string().allow('', null).optional(),
  specialization: Joi.string()
    .valid('General Practitioner', 'Pediatrician', 'Surgeon', 'Gynecologist', 'Cardiologist')
    .required(),
  department: Joi.string().valid('Outpatient', 'Inpatient', 'Emergency', 'Pediatrics', 'Surgery').required(),
  yearsExperience: Joi.number().integer().min(0).max(80).required(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  recoveryEmail: Joi.string().email({ tlds: { allow: false } }).required(),
  phoneNumber: Joi.string().min(8).required(),
  officialTitle: Joi.string().min(2).required(),
});

const createNurseSchema = Joi.object({
  fullName: Joi.string().min(2).required(),
  licenseNumber: Joi.string().min(2).required(),
  licenseDocument: Joi.string().allow('', null).optional(),
  department: Joi.string().valid('Outpatient', 'Inpatient', 'Emergency').required(),
  yearsExperience: Joi.number().integer().min(0).max(80).required(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  recoveryEmail: Joi.string().email({ tlds: { allow: false } }).required(),
  phoneNumber: Joi.string().min(8).required(),
  officialTitle: Joi.string().min(2).required(),
});

const registerPatientSchema = Joi.object({
  fullName: Joi.string().min(3).required(),
  dateOfBirth: Joi.string().isoDate().required(),
  gender: Joi.string().valid('male', 'female').required(),
  kebeleIdNumber: Joi.string().min(2).required(),
  idDocumentUpload: Joi.string().allow('', null).optional(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  phoneNumber: Joi.string().pattern(/^09\d{8}$/).allow('', null).optional(),
  recoveryEmail: Joi.string().email({ tlds: { allow: false } }).allow('', null).optional(),
  woreda: Joi.string().min(2).required(),
  kebele: Joi.string().min(2).required(),
  emergencyContactName: Joi.string().min(2).required(),
  emergencyContactPhone: Joi.string().pattern(/^09\d{8}$/).required(),
  emergencyContactRelation: Joi.string().min(2).required(),
});

router.post('/woreda', authRequired, zonalRoleOnly, validateBody(createWoredaAdminSchema), createWoredaAdmin);
router.post('/city', authRequired, zonalRoleOnly, validateBody(createCityAdminSchema), createCityAdmin);
router.get('/woredas', authRequired, zonalRoleOnly, listWoredaAdmins);
router.get('/city', authRequired, zonalRoleOnly, getCityAdmin);
router.get('/email-status', authRequired, zonalRoleOnly, getRealtimeEmailStatus);

router.post(
  '/facility-admin',
  authRequired,
  requireRole('woreda_admin', 'city_admin'),
  validateBody(createFacilityAdminSchema),
  createFacilityAdmin,
);
router.post(
  '/facility/register',
  authRequired,
  requireRole('woreda_admin', 'city_admin'),
  validateBody(registerFacilitySchema),
  registerFacility,
);
router.get('/facility-admins', authRequired, requireRole('woreda_admin', 'city_admin'), getFacilityAdmins);
router.get('/facilities', authRequired, requireRole('woreda_admin', 'city_admin'), getFacilities);
router.get('/woreda-statistics', authRequired, requireRole('woreda_admin'), getWoredaStatistics);
router.get('/city-statistics', authRequired, requireRole('city_admin'), getCityStatistics);
router.get('/woreda-audit', authRequired, requireRole('woreda_admin'), getWoredaAudit);
router.get('/city-audit', authRequired, requireRole('city_admin'), getCityAudit);
router.post('/doctor', authRequired, requireRole('facility_admin'), validateBody(createDoctorSchema), createDoctor);
router.post('/nurse', authRequired, requireRole('facility_admin'), validateBody(createNurseSchema), createNurse);
router.post(
  '/patient/register',
  authRequired,
  requireRole('facility_admin'),
  validateBody(registerPatientSchema),
  registerPatientByFacilityAdmin,
);
router.get('/patient/check-duplicate', authRequired, requireRole('facility_admin'), checkPatientDuplicate);
router.get('/doctors', authRequired, requireRole('facility_admin'), getDoctors);
router.get('/nurses', authRequired, requireRole('facility_admin'), getNurses);
router.get('/patients', authRequired, requireRole('facility_admin'), getPatientsBasic);
router.get('/facility-statistics', authRequired, requireRole('facility_admin'), getFacilityStatistics);
router.get('/facility-audit', authRequired, requireRole('facility_admin'), getFacilityAudit);
router.get('/me', authRequired, (req, res) => {
  return res.json({ id: req.user?.id, role: req.user?.role });
});

router.post(
  '/users',
  authRequired,
  requireRole('zonal_admin', 'woreda_admin', 'city_admin', 'facility_admin'),
  validateBody(createUserSchema),
  async (req, res, next) => {
    try {
      const b = req.validatedBody;
      if (!assertAllowedAdminCreation(req.user.role, b.role)) {
        return res.status(403).json({ error: 'You can only create next-level admins' });
      }
      const hash = await bcrypt.hash(b.password, 10);
      const created = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
        const actorRow = await client.query(
          'SELECT zone_id, woreda_id, facility_id FROM users WHERE id = $1 LIMIT 1',
          [req.user.id],
        );
        const actor = actorRow.rows[0] || {};
        const zoneId = b.zoneId || actor.zone_id || null;
        const woredaId = b.woredaId || actor.woreda_id || null;
        const facilityId = b.facilityId || actor.facility_id || null;
        const r = await client.query(
          `
          INSERT INTO users (email, phone, password_hash, full_name, role, zone_id, woreda_id, facility_id, created_by, two_factor_enabled)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true)
          RETURNING id, email, full_name, role
        `,
          [b.email, b.phone || null, hash, b.fullName, b.role, zoneId, woredaId, facilityId, req.user.id],
        );
        return r.rows[0];
      });
      return res.status(201).json(created);
    } catch (err) {
      return next(err);
    }
  },
);

router.get(
  '/users',
  authRequired,
  requireRole('zonal_admin', 'woreda_admin', 'facility_admin'),
  async (req, res, next) => {
    try {
      const rows = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
        const r = await client.query(
          `
          SELECT id, email, phone, full_name, role, is_active, created_at
          FROM users
          WHERE role IN ('zonal_admin','woreda_admin','facility_admin')
          ORDER BY created_at DESC
          LIMIT 200
        `,
        );
        return r.rows;
      });
      return res.json(rows);
    } catch (err) {
      return next(err);
    }
  },
);

router.put(
  '/users/:id/suspend',
  authRequired,
  requireRole('zonal_admin', 'woreda_admin', 'facility_admin'),
  async (req, res, next) => {
    try {
      const userId = req.params.id;
      await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
        await client.query('UPDATE users SET is_active = false WHERE id = $1', [userId]);
      });
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  },
);

// Facility registration (woreda/city admin)
const facilitySchema = Joi.object({
  name: Joi.string().required(),
  nameAm: Joi.string().required(),
  type: Joi.string().required(),
  typeAm: Joi.string().required(),
  woredaId: Joi.string().uuid().required(),
  licenseNumber: Joi.string().optional(),
});

router.post(
  '/facilities',
  authRequired,
  requireRole('woreda_admin', 'zonal_admin'),
  validateBody(facilitySchema),
  async (req, res, next) => {
    try {
      const b = req.validatedBody;
      const created = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
        const r = await client.query(
          `
          INSERT INTO facilities (name, name_am, type, type_am, woreda_id, license_number)
          VALUES ($1,$2,$3,$4,$5,$6)
          RETURNING *
        `,
          [b.name, b.nameAm, b.type, b.typeAm, b.woredaId, b.licenseNumber || null],
        );
        return r.rows[0];
      });
      return res.status(201).json(created);
    } catch (err) {
      return next(err);
    }
  },
);

// Create doctor/nurse (facility admin)
const professionalSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  phone: Joi.string().min(8).optional(),
  fullName: Joi.string().min(2).required(),
  role: Joi.string().valid('doctor', 'nurse').required(),
  facilityId: Joi.string().uuid().required(),
  licenseNumber: Joi.string().required(),
  specialization: Joi.string().allow('').optional(),
  password: Joi.string().min(6).required(),
});

router.post(
  '/professionals',
  authRequired,
  requireRole('facility_admin'),
  validateBody(professionalSchema),
  async (req, res, next) => {
    try {
      const b = req.validatedBody;
      const hash = await bcrypt.hash(b.password, 10);
      const created = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
        const actorRow = await client.query('SELECT facility_id FROM users WHERE id = $1 LIMIT 1', [req.user.id]);
        const actorFacilityId = actorRow.rows[0]?.facility_id || null;
        const facilityId = actorFacilityId || b.facilityId;
        if (!facilityId) {
          throw new Error('facilityId is required');
        }
        if (actorFacilityId && b.facilityId && b.facilityId !== actorFacilityId) {
          throw new Error('Facility admin can only create professionals in their facility');
        }
        const r = await client.query(
          `
          INSERT INTO users (
            email, phone, password_hash, full_name, role, facility_id,
            license_number, specialization, created_by, two_factor_enabled
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true)
          RETURNING id, email, full_name, role, facility_id
        `,
          [b.email, b.phone || null, hash, b.fullName, b.role, facilityId, b.licenseNumber, b.specialization || null, req.user.id],
        );
        return r.rows[0];
      });
      return res.status(201).json(created);
    } catch (err) {
      return next(err);
    }
  },
);

router.get(
  '/statistics',
  authRequired,
  zonalRoleOnly,
  getZoneStatistics,
);

router.get(
  '/audit',
  authRequired,
  zonalRoleOnly,
  getZoneAuditLogs,
);

export default router;

