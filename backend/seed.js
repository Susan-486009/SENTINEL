import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import { hashPassword } from './src/utils/auth.js';

const seed = async () => {
  try {
    const uri = process.env.DATABASE_URI || 'mongodb://localhost:27017/lasustech_complaints';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for seeding...');

    // Wipe all existing users for a clean slate
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users.');

    // Hash default password for all seeded users
    const defaultPassword = 'Password123!';
    const hashedPassword = await hashPassword(defaultPassword);

    // 1. Create Admins
    console.log('Seeding Admins...');
    const admins = [
      {
        name: 'Super Admin',
        matric: 'ADMIN001',
        email: 'superadmin@lasustech.edu.ng',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'Feedback Reviewer',
        matric: 'ADMIN002',
        email: 'feedback@lasustech.edu.ng',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'Support Head',
        matric: 'ADMIN003',
        email: 'support@lasustech.edu.ng',
        password: hashedPassword,
        role: 'admin'
      }
    ];

    await User.insertMany(admins);
    console.log(`✅ ${admins.length} Admins created.`);

    // 2. Create 50 Students
    console.log('Seeding 50 Students...');
    
    const firstNames = [
      'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Daniel', 'Olivia',
      'James', 'Ava', 'Susan', 'Ade', 'Femi', 'Chidi', 'Ngozi', 'Aisha',
      'Yusuf', 'Bola', 'Tunde', 'Kemi', 'Sola', 'Emeka', 'Tobi', 'Lara',
      'Seun', 'Uche', 'Amaka', 'Dami'
    ];
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Ogunleye', 'Adeyemi', 'Okafor', 'Ibrahim', 'Rade', 'Oluwaseun', 'Nwosu',
      'Abiodun', 'Bello', 'Musa', 'Alabi', 'Falade'
    ];

    const years = ['22', '23', '24', '25'];
    const students = [];

    for (let i = 1; i <= 50; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const year = years[Math.floor(Math.random() * years.length)];
      // e.g. 240303010010 — YY + dept code 030301 + padded counter
      const matric = `${year}030301${String(i).padStart(4, '0')}`;

      students.push({
        name: `${fn} ${ln}`,
        matric,
        email: `student${i}@lasustech.edu.ng`,
        password: hashedPassword,
        role: 'student'
      });
    }

    await User.insertMany(students);
    console.log(`✅ ${students.length} Students created.`);

    console.log('\n--- Test Credentials (all share the same password) ---');
    console.log('Password for ALL accounts: Password123!\n');
    console.log('Admins:');
    console.log('  superadmin@lasustech.edu.ng  | matric: ADMIN001');
    console.log('  feedback@lasustech.edu.ng    | matric: ADMIN002');
    console.log('  support@lasustech.edu.ng     | matric: ADMIN003');
    console.log('\nStudents:');
    console.log('  student1@lasustech.edu.ng  → student50@lasustech.edu.ng');
    console.log('  Matric format: [YY]030301[XXXX]  (e.g. 24030301000 1)');
    students.slice(0, 5).forEach(s => {
      console.log(`  ${s.email} | matric: ${s.matric}`);
    });
    console.log('  ...');

    await mongoose.disconnect();
    console.log('\n🎉 Seed completed successfully.');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
