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

const genRefId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randStr = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `CMP-${randStr(8)}-${randStr(4)}`;
};

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

    // 7. Make sure we have mock student users in the database
    let students = await User.find({ role: 'student' });
    if (students.length === 0) {
      console.log('No students found. Seeding mock student users...');
      const studentHash = await hashPassword('Password123!');
      const mockStudents = [
        { name: 'Olamide Adebayo', email: 'olamide@lasustech.edu.ng', matric: '220303010001', password: studentHash, role: 'student' },
        { name: 'Chinedu Okafor', email: 'chinedu@lasustech.edu.ng', matric: '220303010002', password: studentHash, role: 'student' },
        { name: 'Aisha Yusuf', email: 'aisha@lasustech.edu.ng', matric: '220303010003', password: studentHash, role: 'student' },
        { name: 'Femi Balogun', email: 'femi@lasustech.edu.ng', matric: '220303010004', password: studentHash, role: 'student' },
        { name: 'Susan Rade', email: 'student1@lasustech.edu.ng', matric: '220303010005', password: studentHash, role: 'student' },
        { name: 'Chioma Nwosu', email: 'chioma@lasustech.edu.ng', matric: '220303010006', password: studentHash, role: 'student' },
        { name: 'Tunde Bakare Jr.', email: 'tunde@lasustech.edu.ng', matric: '220303010007', password: studentHash, role: 'student' },
        { name: 'Bola Tinubu Jr.', email: 'bola@lasustech.edu.ng', matric: '220303010008', password: studentHash, role: 'student' },
        { name: 'Kemi Adeosun Jr.', email: 'kemi@lasustech.edu.ng', matric: '220303010009', password: studentHash, role: 'student' },
        { name: 'Abubakar Shehu Jr.', email: 'abubakar@lasustech.edu.ng', matric: '220303010010', password: studentHash, role: 'student' }
      ];
      students = await User.insertMany(mockStudents);
      console.log(`Created ${students.length} mock student users.`);
    }

    // 8. Seed 5 complaints per department (45 total)
    console.log('Seeding 45 complaints across the 9 departments...');

    const complaintsData = [
      // 1. ICT & Portal Services (it-service, financial)
      {
        deptIdx: 0,
        category: "it-service",
        title: "Unable to access portal for registration",
        description: "I am trying to register my courses for the semester but the portal is showing 'Access Denied' when I click submit. Please help resolve this.",
        status: "pending", priority: "normal"
      },
      {
        deptIdx: 0,
        category: "financial",
        title: "Double payment charged on tuition fee",
        description: "I paid my school fees using the portal, but my account was debited twice. The portal only shows one transaction paid. I need a refund or credit.",
        status: "in_review", priority: "high"
      },
      {
        deptIdx: 0,
        category: "it-service",
        title: "Password reset request link not sending",
        description: "I forgot my portal password and clicked reset, but the link is not sending to my school email after multiple tries.",
        status: "resolved", priority: "normal",
        admin_feedback: "We reviewed your account profile and found your alternate email was set incorrectly. We have reset it manually and sent a temporary password 'LasustechTemp123!' to your main inbox.",
        satisfied: "yes", rating: 5, comments: "Thank you so much! The manual password worked immediately."
      },
      {
        deptIdx: 0,
        category: "financial",
        title: "Hostel fee payment not reflecting on dashboard",
        description: "I paid my hostel fee, but the portal is still showing unpaid. I have attached the receipt of payment.",
        status: "fixed", priority: "critical",
        admin_feedback: "Our financial database has reconciled your payment. Your portal profile has now been updated to show 'Paid'.",
        satisfied: "yes", rating: 4, comments: "It is reflecting on my dashboard now. Thanks for reconciling it."
      },
      {
        deptIdx: 0,
        category: "it-service",
        title: "Request to bypass course prerequisite",
        description: "I want the portal to allow me to register for CSC 401 without passing CSC 301 since I am a final year student.",
        status: "rejected", priority: "low",
        admin_feedback: "Your request is rejected. Faculty academic policy does not allow prerequisite bypass under any circumstances. You must register and pass CSC 301 first."
      },

      // 2. Student Welfare & Counseling (facility-hostel, delicate)
      {
        deptIdx: 1,
        category: "facility-hostel",
        title: "Hostel room roommate conflict",
        description: "My roommate brings guests late at night and plays loud music, which is disturbing my studies and sleep. I need a room change request.",
        status: "pending", priority: "normal"
      },
      {
        deptIdx: 1,
        category: "delicate",
        title: "Harassment by senior student in Block B",
        description: "A senior student residing on the third floor is constantly harassing me and making me do his laundry. I feel unsafe walking back to my room.",
        status: "in_review", priority: "high"
      },
      {
        deptIdx: 1,
        category: "delicate",
        title: "Request for academic stress counseling",
        description: "I am feeling extremely overwhelmed with my final year project and exam pressure. I need to schedule a session to speak to a counselor.",
        status: "resolved", priority: "normal",
        admin_feedback: "We have scheduled a session for you with Mrs. Adebayo on Thursday at 2:00 PM. Please visit the welfare center office.",
        satisfied: "yes", rating: 5, comments: "The counseling session was very helpful. I feel much better now."
      },
      {
        deptIdx: 1,
        category: "facility-hostel",
        title: "Broken lock on female hostel room 204",
        description: "The lock to our hostel room door is broken, leaving our belongings unsafe when we go for lectures.",
        status: "fixed", priority: "critical",
        admin_feedback: "A maintenance carpenter was dispatched to Hostel Room 204. The door lock cylinder has been replaced with a new one.",
        satisfied: "yes", rating: 5, comments: "Lock fixed within hours! We feel safe now. Thank you."
      },
      {
        deptIdx: 1,
        category: "facility-hostel",
        title: "Request to cook in hostel rooms",
        description: "We want the hostel management to allow us to cook inside the hostel rooms using gas cylinders to save time.",
        status: "rejected", priority: "low",
        admin_feedback: "This request is rejected. Strict fire hazard safety regulations prohibit gas cylinders in sleeping areas. You must use the designated common kitchen."
      },

      // 3. Campus Security & Safety (security)
      {
        deptIdx: 2,
        category: "security",
        title: "Missing phone at the university library",
        description: "I left my iPhone 13 on the reading table in the library for 10 minutes, and when I returned it was gone. Please check security cameras.",
        status: "pending", priority: "normal"
      },
      {
        deptIdx: 2,
        category: "security",
        title: "Harassment by security officer at gates",
        description: "A security guard at the main campus gate was extremely rude and delayed me for 30 minutes for no reason despite showing my student ID.",
        status: "in_review", priority: "high"
      },
      {
        deptIdx: 2,
        category: "security",
        title: "Lost wallet found and returned",
        description: "I lost my brown leather wallet containing my ID card and driver's license near the lecture hall yesterday.",
        status: "resolved", priority: "normal",
        admin_feedback: "A brown leather wallet matching your description was turned in to the security post. Please bring a valid proof of identity to claim it.",
        satisfied: "yes", rating: 5, comments: "Got my wallet back with all cards intact! The campus security team did an amazing job."
      },
      {
        deptIdx: 2,
        category: "security",
        title: "Loud party near hostel area after curfew",
        description: "There is a noisy group gathering outside the hostel gate playing loud music at 1 AM. It is disturbing the peace.",
        status: "fixed", priority: "normal",
        admin_feedback: "A security patrol team was dispatched to the area and dispersed the gathering. Curfew restrictions have been reinforced.",
        satisfied: "yes", rating: 4, comments: "Thank you for dispersing them, it is quiet now."
      },
      {
        deptIdx: 2,
        category: "security",
        title: "Permission to park car inside academic zone",
        description: "Requesting permission to drive and park my personal vehicle right next to the lecture halls instead of the general parking lot.",
        status: "rejected", priority: "low",
        admin_feedback: "Rejected. The academic zone is restricted to pedestrian transit and emergency vehicles only to ensure student safety."
      },

      // 4. Works & Physical Planning (facility-maint)
      {
        deptIdx: 3,
        category: "facility-maint",
        title: "No water in Hostel Block C toilets",
        description: "For the past two days, there has been no running water in the toilets of Block C. The sanitary condition is getting very poor.",
        status: "pending", priority: "normal"
      },
      {
        deptIdx: 3,
        category: "facility-maint",
        title: "Ceiling fan falling risk in Hall 1",
        description: "The ceiling fan in Lecture Hall 1 is shaking violently when turned on and looks like it might fall on students.",
        status: "in_review", priority: "high"
      },
      {
        deptIdx: 3,
        category: "facility-maint",
        title: "Broken desks in room 12",
        description: "Several desks in Room 12 have broken wood and nails sticking out, which are tearing students' clothes.",
        status: "resolved", priority: "normal",
        admin_feedback: "Maintenance team sent a carpenter to Room 12. Broken wooden panels have been replaced and safety nails hammered flat.",
        satisfied: "yes", rating: 5, comments: "Great repair work. Desks are safe to use now."
      },
      {
        deptIdx: 3,
        category: "facility-maint",
        title: "Power outage in classroom Block D",
        description: "There has been no electricity in Block D classrooms for three days, making evening study and lectures impossible.",
        status: "fixed", priority: "critical",
        admin_feedback: "Our electrical technicians investigated and replaced a blown fuse in the Block D distribution box. Power has been restored.",
        satisfied: "yes", rating: 5, comments: "Power is back! Thank you for the quick intervention."
      },
      {
        deptIdx: 3,
        category: "facility-maint",
        title: "Request for personal air conditioner in room",
        description: "I want the school to install a personal split AC in my hostel room because of the heat.",
        status: "rejected", priority: "low",
        admin_feedback: "Rejected. Hostel facilities are equipped with standard ceiling fans. Personal air conditioners are not supported due to grid power load limits."
      },

      // 5. Registry & Academic Planning (admin-staff)
      {
        deptIdx: 4,
        category: "admin-staff",
        title: "Error in spelling of name on portal profile",
        description: "My name is misspelled on the portal as 'Sanni' instead of 'Sani'. I need this corrected before transcripts are generated.",
        status: "pending", priority: "normal"
      },
      {
        deptIdx: 4,
        category: "admin-staff",
        title: "Delay in processing academic transcript",
        description: "I applied for my official transcript two weeks ago, but the portal still shows 'Processing'. I need it for a scholarship deadline.",
        status: "in_review", priority: "high"
      },
      {
        deptIdx: 4,
        category: "admin-staff",
        title: "Correction of matriculation number",
        description: "My matriculation number has a wrong digit at the end on the registry list.",
        status: "resolved", priority: "normal",
        admin_feedback: "We reviewed your admission file and corrected the typing error in the database. Your correct matric number is now reflected.",
        satisfied: "yes", rating: 4, comments: "It has been updated on my portal profile. Thanks!"
      },
      {
        deptIdx: 4,
        category: "admin-staff",
        title: "Missing stamp on registration form",
        description: "My course registration form was not stamped by the registry officer during validation.",
        status: "fixed", priority: "normal",
        admin_feedback: "Please bring your printed form to window 3 at the Registry Division today to have it stamped manually.",
        satisfied: "yes", rating: 5, comments: "Form stamped successfully. Thank you!"
      },
      {
        deptIdx: 4,
        category: "admin-staff",
        title: "Request to change admission department late",
        description: "I am in my 300 level and want to switch from History to Computer Science starting next semester.",
        status: "rejected", priority: "low",
        admin_feedback: "Rejected. Late change of department is only permitted up to the end of 100 level. You cannot switch majors at this stage of your academic program."
      },

      // 6. Student Affairs Division (other)
      {
        deptIdx: 5,
        category: "other",
        title: "Inquiry about Student Union elections date",
        description: "When are the nominations for the Student Union Government (SUG) elections opening?",
        status: "pending", priority: "normal"
      },
      {
        deptIdx: 5,
        category: "other",
        title: "Club registration fee dispute",
        description: "The departmental club is charging 5,000 Naira for registration instead of the school-approved 2,000 Naira limit.",
        status: "in_review", priority: "normal"
      },
      {
        deptIdx: 5,
        category: "other",
        title: "ID Card replacement delay",
        description: "I paid for a replacement ID card last month but haven't received it at the student affairs desk.",
        status: "resolved", priority: "normal",
        admin_feedback: "Your replacement ID card has been printed. Please bring your payment receipt to the Student Affairs office to collect it.",
        satisfied: "yes", rating: 5, comments: "Got my card! The process was smooth."
      },
      {
        deptIdx: 5,
        category: "other",
        title: "Missing list of approved clubs",
        description: "The student notice board doesn't list the verified campus associations and registered clubs.",
        status: "fixed", priority: "low",
        admin_feedback: "We have updated and posted the list of approved student clubs on the Student Affairs notice board and the portal news page.",
        satisfied: "yes", rating: 4, comments: "Found the list. Thank you."
      },
      {
        deptIdx: 5,
        category: "other",
        title: "Request to host unregistered musical concert",
        description: "We want to host a concert on the school football field this weekend without formal student affairs registration.",
        status: "rejected", priority: "low",
        admin_feedback: "Rejected. All public social events must be registered at least 2 weeks in advance with security clearance and approved safety permits."
      },

      // 7. Computer Science Department (academic-result, academic-lecturer)
      {
        deptIdx: 6,
        category: "academic-result",
        title: "CSC 401 exam result missing on portal",
        description: "My grade for CSC 401 is showing 'AR' (Absent Result), but I wrote the exam and signed the attendance sheet.",
        status: "pending", priority: "normal"
      },
      {
        deptIdx: 6,
        category: "academic-lecturer",
        title: "Lecturer conduct during project defense",
        description: "A lecturer was throwing insults and acting extremely unprofessional during our mock project defense sessions.",
        status: "in_review", priority: "high"
      },
      {
        deptIdx: 6,
        category: "academic-result",
        title: "Correction of grade for CSC 302",
        description: "I was given an F on the portal, but my script grades scored over 60%. I suspect a typing error.",
        status: "resolved", priority: "normal",
        admin_feedback: "The department reviewed your script. A data-entry error occurred. Your grade has been corrected from F to B+.",
        satisfied: "yes", rating: 5, comments: "Thank you so much! My grade has been correctly updated."
      },
      {
        deptIdx: 6,
        category: "academic-result",
        title: "CSC 201 lab equipment shortage",
        description: "There are not enough working computers in the CS lab for the practical programming sessions.",
        status: "fixed", priority: "normal",
        admin_feedback: "Our IT support team has connected 15 additional workstations in the CS lab. All practical sessions should now have sufficient setups.",
        satisfied: "yes", rating: 4, comments: "More computers are working now. Thanks."
      },
      {
        deptIdx: 6,
        category: "academic-result",
        title: "Request to waive final year project",
        description: "I want the department to allow me to graduate without writing the project report because of financial constraints.",
        status: "rejected", priority: "low",
        admin_feedback: "Rejected. The final year project is a compulsory core course mandated by the university senate curriculum and cannot be waived."
      },

      // 8. Mechanical Engineering Department (academic-result, academic-lecturer)
      {
        deptIdx: 7,
        category: "academic-result",
        title: "MEG 305 test script missing review",
        description: "I submitted my test script late with written permission, but it has not been graded on my CA sheet.",
        status: "pending", priority: "normal"
      },
      {
        deptIdx: 7,
        category: "academic-lecturer",
        title: "MEG 411 lecturer not attending lectures",
        description: "The lecturer assigned to MEG 411 has only held one lecture in the past six weeks, leaving us behind.",
        status: "in_review", priority: "high"
      },
      {
        deptIdx: 7,
        category: "academic-result",
        title: "Clash in exam timetable",
        description: "MEG 301 and CSC 302 exams are scheduled for the same time slot next Tuesday. I cannot write both.",
        status: "resolved", priority: "high",
        admin_feedback: "We contacted the timetable committee. The MEG 301 exam slot has been shifted to Wednesday morning to resolve the clash.",
        satisfied: "yes", rating: 5, comments: "Clash resolved! Thank you for the quick action."
      },
      {
        deptIdx: 7,
        category: "academic-result",
        title: "Missing workshop tools for MEG 202",
        description: "We lack welding rods and safety goggles in the department workshop for practical exercises.",
        status: "fixed", priority: "normal",
        admin_feedback: "The workshop coordinator has restocked safety goggles and welding rods. They are now available for student check-out.",
        satisfied: "yes", rating: 5, comments: "Got the safety gear for our practical. Thank you."
      },
      {
        deptIdx: 7,
        category: "academic-result",
        title: "Request to change MEG course curriculum",
        description: "We want the department to delete thermodynamics from our course outline because it is too difficult.",
        status: "rejected", priority: "low",
        admin_feedback: "Rejected. The Mechanical Engineering curriculum is accredited by COREN and cannot be altered by student petition."
      },

      // 9. Accounting Department (academic-result, academic-lecturer)
      {
        deptIdx: 8,
        category: "academic-result",
        title: "ACC 201 missing CA score",
        description: "My Continuous Assessment test score of 25 is missing from my portal profile.",
        status: "pending", priority: "normal"
      },
      {
        deptIdx: 8,
        category: "academic-lecturer",
        title: "Lecturer refusing to explain grades",
        description: "The CA test papers were not returned, and the lecturer refused to explain how our scores were calculated.",
        status: "in_review", priority: "high"
      },
      {
        deptIdx: 8,
        category: "academic-result",
        title: "Timetable clash for ACC 403",
        description: "Timetable shows clash with MEG 403 exam on Thursday.",
        status: "resolved", priority: "normal",
        admin_feedback: "The exam schedule has been updated. The ACC 403 exam will now hold in the afternoon session.",
        satisfied: "yes", rating: 4, comments: "Shifted, thanks for updating the schedule."
      },
      {
        deptIdx: 8,
        category: "academic-result",
        title: "Calculator restrictions during accounting test",
        description: "We were told we cannot use basic financial calculators during CA tests, which delays our calculations.",
        status: "fixed", priority: "normal",
        admin_feedback: "The HOD has issued a memo permitting basic financial calculators. Programmable calculators remain banned.",
        satisfied: "yes", rating: 5, comments: "Permitted now. Tests are much fairer."
      },
      {
        deptIdx: 8,
        category: "academic-result",
        title: "Request to upgrade grade from D to A",
        description: "I got a D in ACC 301 but I need an A to keep my CGPA up for scholarship retention.",
        status: "rejected", priority: "low",
        admin_feedback: "Rejected. Grades are strictly awarded based on test and exam scores. No arbitrary score adjustments are permitted."
      }
    ];

    for (let i = 0; i < complaintsData.length; i++) {
      const data = complaintsData[i];
      const dept = seededDepts[data.deptIdx];
      const staffList = await User.find({ role: 'staff', department_id: dept._id });
      
      // Select staff member (alternate)
      const assignedStaff = staffList[i % staffList.length];
      
      // Select student (alternate)
      const student = students[i % students.length];
      
      const reference_id = genRefId();

      const timeline = [
        { type: 'system', text: 'Complaint submitted and reference ID issued.' },
        { type: 'assigned', text: `Assigned to ${assignedStaff.name} (${dept.name}).`, user_id: assignedStaff._id }
      ];

      if (data.status !== 'pending') {
        timeline.push({
          type: 'status_change',
          text: `Status changed to ${data.status.replace('_', ' ')}.`,
          user_id: assignedStaff._id
        });
      }

      await Complaint.create({
        reference_id,
        user_id: student._id,
        assigned_staff_id: assignedStaff._id,
        category: data.category,
        title: data.title,
        description: data.description,
        anonymous: i % 7 === 0, // make some complaints anonymous
        priority: data.priority,
        status: data.status,
        admin_feedback: data.admin_feedback || "",
        satisfaction_feedback: data.satisfied ? {
          satisfied: data.satisfied,
          rating: data.rating,
          comments: data.comments,
          submitted_at: new Date()
        } : {
          satisfied: null,
          rating: null,
          comments: "",
          submitted_at: null
        },
        timeline,
        internal_notes: data.status === 'in_review' || data.status === 'resolved' ? [
          {
            admin_id: assignedStaff._id,
            text: `Initial investigation started for this ${data.priority} priority case.`,
            created_at: new Date(Date.now() - 3600000)
          }
        ] : []
      });
    }

    console.log(`🎉 Successfully seeded ${complaintsData.length} complaints!`);
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedUsers();
