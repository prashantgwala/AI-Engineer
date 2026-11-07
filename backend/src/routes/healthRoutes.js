const express = require('express');
const {
  getHealth,
  getDatabaseHealth,
} = require('../controllers/healthController');

const router = express.Router();

router.get('/health', getHealth);
router.get('/db-health', getDatabaseHealth);

module.exports = router;
