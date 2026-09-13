const db = require('./db');

const addColumnIfNotExists = (colName, colDef) => {
  return new Promise((resolve, reject) => {
    const checkSql = "SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'fitness_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = ?";
    db.query(checkSql, [colName], (err, rows) => {
      if (err) return reject(err);
      if (rows[0].count === 0) {
        db.query(`ALTER TABLE users ADD COLUMN ${colName} ${colDef}`, (err2) => {
          if (err2) return reject(err2);
          console.log(`✅ Added column ${colName} to users table.`);
          resolve();
        });
      } else {
        console.log(`ℹ️ Column ${colName} already exists.`);
        resolve();
      }
    });
  });
};

async function run() {
  try {
    await addColumnIfNotExists('name', 'VARCHAR(100) DEFAULT NULL');
    await addColumnIfNotExists('weekly_goal_minutes', 'INT DEFAULT 150');
    console.log('🎉 Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration error:', err);
  } finally {
    process.exit(0);
  }
}

run();
