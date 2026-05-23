import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import { Complaint } from './src/models/Complaint.js';
import { TokenSession } from './src/models/TokenSession.js';
import { Chat } from './src/models/Chat.js';
import { SuspiciousActivity } from './src/models/SuspiciousActivity.js';

const clearDatabase = async () => {
  try {
    const uri = process.env.DATABASE_URI || 'mongodb://localhost:27017/lasustech_complaints';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for database cleanup...');

    // 1. Delete all non-admin users
    const userDeleteResult = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`🗑️  Deleted ${userDeleteResult.deletedCount} non-admin users.`);

    // 2. Wipe active token sessions for non-admins (or all for safety)
    const sessionDeleteResult = await TokenSession.deleteMany({});
    console.log(`🗑️  Deleted ${sessionDeleteResult.deletedCount} active token sessions.`);

    // 3. Wipe all complaints
    const complaintDeleteResult = await Complaint.deleteMany({});
    console.log(`🗑️  Deleted ${complaintDeleteResult.deletedCount} complaints.`);

    // 4. Wipe all chat logs
    const chatDeleteResult = await Chat.deleteMany({});
    console.log(`🗑️  Deleted ${chatDeleteResult.deletedCount} chat logs.`);

    // 5. Wipe suspicious activity logs
    const activityDeleteResult = await SuspiciousActivity.deleteMany({});
    console.log(`🗑️  Deleted ${activityDeleteResult.deletedCount} suspicious activity logs.`);

    // Verify remaining admins
    const remainingAdmins = await User.find({ role: 'admin' }).select('name email role');
    console.log('\n👑 Remaining Admin Accounts in Database:');
    remainingAdmins.forEach(admin => {
      console.log(`  - ${admin.name} (${admin.email}) [role: ${admin.role}]`);
    });

    await mongoose.disconnect();
    console.log('\n🎉 Database cleanup completed successfully.');
  } catch (err) {
    console.error('Cleanup error:', err);
    process.exit(1);
  }
};

clearDatabase();
