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

    // 3. Admin: admin@lasustech.edu.ng
    const adminEmail = 'admin@lasustech.edu.ng';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const adminHash = await hashPassword('Password123@');
      await User.create({
        name: 'LASUSTECH Admin',
        email: adminEmail,
        matric: 'ADM001',
        password: adminHash,
        role: 'admin'
      });
      console.log(`Created admin account: ${adminEmail}`);
    } else {
      console.log(`Admin account ${adminEmail} already exists. Updating password.`);
      const adminHash = await hashPassword('Password123@');
      await User.updateOne({ email: adminEmail }, { password: adminHash, role: 'admin' });
    }

    // 4. Clean existing staff and departments to prevent stale data
    await User.deleteMany({ role: 'staff' });
    await Department.deleteMany({});
    console.log('Cleared existing staff and departments.');

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

    // 6. Seed Staff (Nigerian names)
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
      "Mr. Dele Momodu",
      "Dr. Abubakar Shehu",
      "Mrs. Zainab Ahmed"
    ];

    const staffHash = await hashPassword('Password123@');

    for (let i = 0; i < staffNames.length; i++) {
      const name = staffNames[i];
      const dept = seededDepts[i % seededDepts.length];
      const email = `staff.${name.toLowerCase().replace(/[^a-z]/g, '')}@lasustech.edu.ng`;
      
      await User.create({
        name,
        email,
        matric: `STF${String(i + 1).padStart(3, '0')}`,
        password: staffHash,
        role: 'staff',
        department_id: dept._id
      });

      console.log(`Created staff: ${name} in department ${dept.name} (${email})`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedUsers();
