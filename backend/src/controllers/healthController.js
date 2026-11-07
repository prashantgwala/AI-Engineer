const { getDatabaseStatus } = require('../config/db');

const getHealth = (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'dms-backend',
  });
};

const getDatabaseHealth = async (_request, response, next) => {
  try {
    const databaseStatus = await getDatabaseStatus();
    response.status(200).json({
      status: 'ok',
      database: 'connected',
      databaseName: databaseStatus.database_name,
      serverTime: databaseStatus.server_time,
    });
  } catch (error) {
    error.statusCode = 503;
    error.publicMessage = 'Database is unavailable. Check the PostgreSQL configuration and server.';
    next(error);
  }
};

module.exports = { getHealth, getDatabaseHealth };
