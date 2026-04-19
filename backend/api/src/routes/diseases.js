import { Router } from 'express';
import { query } from '../config/database.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const r = await query('SELECT * FROM diseases ORDER BY name ASC');
    return res.json(r.rows);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const idOrSlug = req.params.id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      idOrSlug,
    );
    const r = await query(
      isUuid ? 'SELECT * FROM diseases WHERE id = $1' : 'SELECT * FROM diseases WHERE slug = $1',
      [idOrSlug],
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Disease not found' });
    return res.json(r.rows[0]);
  } catch (err) {
    return next(err);
  }
});

export default router;

