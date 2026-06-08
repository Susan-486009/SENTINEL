import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Department } from './models/Department.js';
import { Complaint } from './models/Complaint.js';
import { TokenSession } from './models/TokenSession.js';
import { Chat } from './models/Chat.js';
import { SuspiciousActivity } from './models/SuspiciousActivity.js';
import { hashPassword } from './utils/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function seedUsers() {
  try {
    const fallbackUri = 'mongodb://radesusan8_db_user:qNrwmM25eqQ1iCDE@ac-rns7nv3-shard-00-00.awsdyzq.mongodb.net:27017,ac-rns7nv3-shard-00-01.awsdyzq.mongodb.net:27017,ac-rns7nv3-shard-00-02.awsdyzq.mongodb.net:27017/LASUSTECH-MONITOR?ssl=true&authSource=admin&replicaSet=atlas-j1g9d3-shard-0&appName=susan-project';
    const uri = process.env.DATABASE_URI || fallbackUri;
    
    console.log('Connecting to database...');
    try {
      await mongoose.connect(uri);
    } catch (err) {
      if (uri !== fallbackUri) {
        console.warn('⚠️  Failed to connect with primary DATABASE_URI. Retrying with standard fallback URI...');
        await mongoose.connect(fallbackUri);
      } else {
        throw err;
      }
    }
    console.log('Connected to MongoDB');

    // 1. Delete superadmin@lasustech.edu.ng
    await User.deleteOne({ email: 'superadmin@lasustech.edu.ng' });
    console.log('Deleted superadmin@lasustech.edu.ng');

    // 2. Superadmins
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

    // 3. Admin: admin@lasustech.edu.ng (Delete any conflicting email or matric to avoid E11000)
    const adminEmail = 'admin@lasustech.edu.ng';
    const adminMatric = 'ADM001';
    await User.deleteMany({ $or: [{ email: adminEmail }, { matric: adminMatric }] });
    
    const adminHash = await hashPassword('Password123@');
    await User.create({
      name: 'LASUSTECH Admin',
      email: adminEmail,
      matric: adminMatric,
      password: adminHash,
      role: 'admin'
    });
    console.log(`Created/Reset admin account: ${adminEmail}`);

    // 4. Clean existing staff, departments, complaints, and related collections to prevent stale data
    await User.deleteMany({ role: 'staff' });
    await Department.deleteMany({});
    await Complaint.deleteMany({});
    await Chat.deleteMany({});
    await TokenSession.deleteMany({});
    await SuspiciousActivity.deleteMany({});
    console.log('🗑️  Cleared existing staff, departments, complaints, sessions, chats, and activities.');

    // 5. Seed Departments
    const deptDefinitions = [
      { name: "ICT & Portal Services", description: "Handles portal accounts, payment integrations, website, and network issues.", categories: ["it-service", "financial"] },
      { name: "Student Welfare & Counseling", description: "Handles counseling, hostel welfare, safety, and sensitive/delicate complaints (harassment, wellness).", categories: ["facility-hostel", "delicate"] },
      { name: "Campus Security & Safety", description: "Responsible for physical security, emergency response, and general safety enforcement on campus.", categories: ["security"] },
      { name: "Works & Physical Planning", description: "Handles classroom maintenance, power, water, utilities, and general facility issues.", categories: ["facility-maint"] },
      { name: "Registry & Academic Planning", description: "Handles academic transcripts, administrative documentation, and official student registry records.", categories: ["admin-staff"] },
      { name: "Student Affairs Division", description: "Oversees student associations, generic inquiries, and complaints that do not fall under other departments.", categories: ["other"] },
      { name: "Computer Science Department", description: "CS academic issues, lecturer concerns, and exam result queries.", categories: [] },
      { name: "Mechanical Engineering Department", description: "Mechanical Engineering academic issues, lecturer concerns, and exam result queries.", categories: [] },
      { name: "Accounting Department", description: "Accounting academic issues, lecturer concerns, and exam result queries.", categories: [] }
    ];

    const seededDepts = [];
    for (const d of deptDefinitions) {
      const dept = await Department.create(d);
      seededDepts.push(dept);
      console.log(`Created department: ${dept.name}`);
    }

    // 6. Seed exactly 2 staff members per department (18 staff members in total)
    const staffNames = [
      "Dr. Kunle Alabi",
      "Mrs. Toyin Bello",
      "Dr. Olanrewaju Gbadamosi",
      "Engr. Sunday Ogundimu",
      "Prof. Chidi Nwachukwu",
      "Dr. Amina Yusuf",
      "Mr. Babajide Sowore",
      "Mrs. Funmilayo Adebayo",
      "Dr. Kelechi Okafor",
      "Mrs. Blessing Okoye",
      "Mr. Festus Keyamo",
      "Dr. Folasade Adegoke",
      "Mr. Tunde Bakare",
      "Mrs. Yetunde Onanuga",
      "Dr. Chioma Nnaji",
      "Prof. Ibrahim Gambari",
      "Mrs. Ronke Ojo",
      "Mr. Dele Momodu"
    ];

    const staffHash = await hashPassword('Password123@');

    for (let j = 0; j < seededDepts.length; j++) {
      const dept = seededDepts[j];
      const staffListForDept = [];

      for (let k = 0; k < 2; k++) {
        const staffIndex = j * 2 + k;
        const name = staffNames[staffIndex];
        const cleanName = name
          .toLowerCase()
          .replace(/^(dr|mr|mrs|prof|engr)\.?\s+/i, '')
          .replace(/[^a-z0-9\s]/g, '')
          .trim()
          .replace(/\s+/g, '.');
        const email = `${cleanName}@lasustech.edu.ng`;
        const matric = `STF${String(staffIndex + 1).padStart(3, '0')}`;

        const newStaff = await User.create({
          name,
          email,
          matric,
          password: staffHash,
          role: 'staff',
          department_id: dept._id
        });

        staffListForDept.push(newStaff);
        console.log(`Created staff: ${name} -> Department: ${dept.name} (${email})`);
      }

      // Set department head_id to the first staff member
      await Department.updateOne(
        { _id: dept._id },
        { $set: { head_id: staffListForDept[0]._id } }
      );
      console.log(`Set ${staffListForDept[0].name} as Head of ${dept.name}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedUsers();
