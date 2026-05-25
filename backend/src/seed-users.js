import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Department } from './models/Department.js';
import { hashPassword } from './utils/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function seedUsers() {
  try {
    const fallbackUri = 'mongodb://radesusan8_db_user:qNrwmM25eqQ1iCDE@ac-rns7nv3-shard-00-00.awsdyzq.mongodb.net:27017,ac-rns7nv3-shard-00-01.awsdyzq.mongodb.net:27017,ac-rns7nv3-shard-00-02.awsdyzq.mongodb.net:27017/LASUSTECH-MONITOR?ssl=true&authSource=admin&replicaSet=atlas-j1g9d3-shard-0&appName=susan-project';
    await mongoose.connect(fallbackUri);
    console.log('Connected to MongoDB');

    // Superadmins
    const superadmins = [
      { email: 'susan@gmail.com', name: 'Susan', password: 'Susan123@', role: 'superadmin', matric: 'SA001' },
      { email: 'makindealade@gmail.com', name: 'Makinde Alade', password: 'Makinde123@', role: 'superadmin', matric: 'SA002' },
      { email: 'dean@gmail.com', name: 'Dean of Student Affairs', password: 'dean123@', role: 'superadmin', matric: 'SA003' }
    ];

    for (const sa of superadmins) {
      const exists = await User.findOne({ email: sa.email });
      if (!exists) {
        const hashedPassword = await hashPassword(sa.password);
        await User.create({
          name: sa.name,
          email: sa.email,
          matric: sa.matric,
          password: hashedPassword,
          role: sa.role
        });
        console.log(`Created superadmin: ${sa.email}`);
      } else {
        console.log(`Superadmin ${sa.email} already exists. Updating password and role.`);
        const hashedPassword = await hashPassword(sa.password);
        await User.updateOne({ email: sa.email }, { password: hashedPassword, role: 'superadmin' });
      }
    }

    // Admins
    for (let i = 1; i <= 5; i++) {
      const email = `admin${i}@lasustech.edu.ng`;
      const exists = await User.findOne({ email });
      if (!exists) {
        const hashedPassword = await hashPassword('Password123@');
        await User.create({
          name: `Dummy Admin ${i}`,
          email,
          matric: `ADM00${i}`,
          password: hashedPassword,
          role: 'admin'
        });
        console.log(`Created admin: ${email}`);
      }
    }

    // Staff
    // Ensure we have some departments first
    const departments = await Department.find();
    
    // We will distribute the 30 staff across departments if they exist, or just leave it null
    for (let i = 1; i <= 30; i++) {
      const email = `staff${i}@lasustech.edu.ng`;
      const exists = await User.findOne({ email });
      if (!exists) {
        const hashedPassword = await hashPassword('Password123@');
        
        let deptId = undefined;
        if (departments.length > 0) {
          // pick a random department
          const randomDept = departments[Math.floor(Math.random() * departments.length)];
          deptId = randomDept._id;
        }

        await User.create({
          name: `Staff Member ${i}`,
          email,
          matric: `STF0${i < 10 ? '0'+i : i}`,
          password: hashedPassword,
          role: 'staff',
          ...(deptId && { department_id: deptId })
        });
        console.log(`Created staff: ${email}`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedUsers();
