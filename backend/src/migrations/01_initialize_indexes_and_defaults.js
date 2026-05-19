import { Complaint } from '../models/Complaint.js';
import { SuspiciousActivity } from '../models/SuspiciousActivity.js';
import { Department } from '../models/Department.js';
import { User } from '../models/User.js';

export const up = async () => {
  // 1. Build compound and high-frequency indexes on Complaint
  try {
    await Complaint.collection.createIndex({ user_id: 1 });
    await Complaint.collection.createIndex({ status: 1, created_at: -1 });
    await Complaint.collection.createIndex({ category: 1, priority: 1 });
    await Complaint.collection.createIndex(
      { title: 'text', description: 'text', reference_id: 'text' },
      { 
        name: 'ComplaintTextSearchIndex', 
        weights: { title: 10, description: 5, reference_id: 15 } 
      }
    );
  } catch (err) {
    console.error('Failed to create indexes on Complaint collection:', err);
  }

  // 2. Build compound and high-frequency indexes on SuspiciousActivity
  try {
    await SuspiciousActivity.collection.createIndex({ user_id: 1 });
    await SuspiciousActivity.collection.createIndex({ severity: 1, created_at: -1 });
  } catch (err) {
    console.error('Failed to create indexes on SuspiciousActivity collection:', err);
  }

  // 3. Seed default departments
  const defaultDeps = [
    { name: 'Security Unit', description: 'Sentinel core security operations' },
    { name: 'Student Affairs', description: 'Student life and academic conduct investigations' },
    { name: 'Registry', description: 'Institutional data and administrative filings' }
  ];

  for (const dep of defaultDeps) {
    try {
      await Department.findOneAndUpdate(
        { name: dep.name },
        { $setOnInsert: dep },
        { upsert: true }
      );
    } catch (err) {
      console.error(`Failed to seed department ${dep.name}:`, err);
    }
  }
};
