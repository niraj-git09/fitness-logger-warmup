const db = require('./db');

const addColumnIfNotExists = (tableName, colName, colDef) => {
  return new Promise((resolve, reject) => {
    const checkSql = "SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'fitness_db' AND TABLE_NAME = ? AND COLUMN_NAME = ?";
    db.query(checkSql, [tableName, colName], (err, rows) => {
      if (err) return reject(err);
      if (rows[0].count === 0) {
        db.query(`ALTER TABLE ${tableName} ADD COLUMN ${colName} ${colDef}`, (err2) => {
          if (err2) return reject(err2);
          console.log(`✅ Added column ${colName} to ${tableName} table.`);
          resolve();
        });
      } else {
        console.log(`ℹ️ Column ${colName} already exists in ${tableName}.`);
        resolve();
      }
    });
  });
};

async function run() {
  try {
    // Users table additions
    await addColumnIfNotExists('users', 'name', 'VARCHAR(100) DEFAULT NULL');
    await addColumnIfNotExists('users', 'weekly_goal_minutes', 'INT DEFAULT 150');

    // Workouts table additions
    await addColumnIfNotExists('workouts', 'notes', 'TEXT DEFAULT NULL');
    await addColumnIfNotExists('workouts', 'intensity', "VARCHAR(20) DEFAULT 'medium'");

    console.log('🎉 Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration error:', err);
  } finally {
    process.exit(0);
  }
}

run();
