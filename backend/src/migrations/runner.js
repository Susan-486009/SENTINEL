import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SchemaMigration } from '../models/SchemaMigration.js';
import { logStructured } from '../utils/catastrophicLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigrations = async () => {
  logStructured({ level: 'INFO', message: '🔍 Starting automated schema migration checks…' });
  
  // 1. Attempt to acquire atomic migration lock in MongoDB
  let lockAcquired = false;
  try {
    const lock = await SchemaMigration.findOneAndUpdate(
      { migration_name: '__lock__' },
      { 
        $setOnInsert: { success: false, error_message: null },
        $set: { locked: true, locked_at: new Date() }
      },
      { upsert: true, new: true, rawResult: true }
    );
    
    // If lock was already active (locked is true in the updated state and it was not just upserted)
    const wasAlreadyLocked = lock.lastErrorObject?.updatedExisting && lock.value?.locked === true && (Date.now() - new Date(lock.value.locked_at).getTime() < 5 * 60 * 1000); // 5 mins safety window
    
    if (wasAlreadyLocked) {
      logStructured({ 
        level: 'WARN', 
        message: '⚠️ Migration lock is currently held by another node in the cluster. Skipping migrations.' 
      });
      return;
    }
    
    lockAcquired = true;
  } catch (lockErr) {
    logStructured({ 
      level: 'ERROR', 
      message: 'Failed to acquire migration lock. Proceeding to prevent bootstrap block.', 
      error: lockErr 
    });
  }

  try {
    // 2. Identify all migrations in this directory
    const migrationFiles = [
      '01_initialize_indexes_and_defaults.js'
    ];

    for (const file of migrationFiles) {
      const alreadyRun = await SchemaMigration.findOne({ migration_name: file, success: true });
      if (alreadyRun) {
        logStructured({ level: 'INFO', message: `✅ Migration already applied: ${file}` });
        continue;
      }

      logStructured({ level: 'INFO', message: `🚀 Applying schema migration: ${file}…` });
      
      try {
        const filePath = path.join(__dirname, file);
        const migrationModule = await import(`file://${filePath}`);
        
        if (typeof migrationModule.up === 'function') {
          await migrationModule.up();
          
          await SchemaMigration.findOneAndUpdate(
            { migration_name: file },
            { success: true, executed_at: new Date(), error_message: null },
            { upsert: true }
          );
          logStructured({ level: 'INFO', message: `✅ Migration applied successfully: ${file}` });
        } else {
          throw new Error('Migration missing required export function: "up"');
        }
      } catch (err) {
        logStructured({ 
          level: 'ERROR', 
          message: `❌ Schema migration failed for: ${file}`, 
          error: err 
        });
        
        await SchemaMigration.findOneAndUpdate(
          { migration_name: file },
          { success: false, executed_at: new Date(), error_message: err.message },
          { upsert: true }
        );
        
        throw err; // Terminate to prevent inconsistent DB states
      }
    }
  } finally {
    // 3. Release Lock
    if (lockAcquired) {
      try {
        await SchemaMigration.updateOne({ migration_name: '__lock__' }, { locked: false, locked_at: null });
        logStructured({ level: 'INFO', message: '🔓 Released schema migration lock.' });
      } catch (unlockErr) {
        logStructured({ 
          level: 'ERROR', 
          message: 'Failed to release migration lock cleanly.', 
          error: unlockErr 
        });
      }
    }
  }
};
