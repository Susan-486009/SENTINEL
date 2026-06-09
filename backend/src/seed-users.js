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

    // 8. Seed 15 complaints per department (135 total)
    console.log('Seeding 135 complaints across the 9 departments...');

    const titles = [
      // 0: ICT & Portal Services
      [
        "Unable to access portal for registration",
        "Double payment charged on tuition fee",
        "Password reset request link not sending",
        "Hostel fee payment not reflecting on dashboard",
        "Request to bypass course prerequisite",
        "Voucher code login failing",
        "Invalid course units sum error",
        "Incorrect matriculation number display",
        "Biodata correction request",
        "Late registration fine wave appeal",
        "LMS account locked out",
        "Remita receipt verification pending",
        "Wrong department mapped on portal",
        "Mobile app login session error",
        "Request for duplicate admission letter"
      ],
      // 1: Student Welfare & Counseling
      [
        "Hostel room roommate conflict",
        "Harassment by senior student in Block B",
        "Request for academic stress counseling",
        "Broken lock on female hostel room 204",
        "Request to cook in hostel rooms",
        "Missing mattress in room 102",
        "Hostel bathroom sanitary issue",
        "Request for medical accommodation leave",
        "Leaking roof in Hostel Room 305",
        "Request to change room assignment",
        "Bedbug infestation in Block B common room",
        "Stolen textbook in hostel lounge",
        "Counseling request for exam anxiety",
        "Broken wardrobe door in Room 12",
        "Hostel room personalization request"
      ],
      // 2: Campus Security & Safety
      [
        "Missing phone at the university library",
        "Harassment by security officer at gates",
        "Lost wallet found and returned",
        "Loud party near hostel area after curfew",
        "Permission to park car inside academic zone",
        "Suspicious activity near sports complex",
        "Stolen bicycle from hostel rack",
        "Security escort request for late studies",
        "Dead bulbs along library walkway",
        "Request for security camera access",
        "Intruder warning in Block D common room",
        "Missing backpack from lecture theater",
        "Found lost flash drive",
        "Reconfigured main gate vehicle flow",
        "Request to bypass curfew check"
      ],
      // 3: Works & Physical Planning
      [
        "No water in Hostel Block C toilets",
        "Ceiling fan falling risk in Hall 1",
        "Broken desks in room 12",
        "Power outage in classroom Block D",
        "Request for personal air conditioner in room",
        "Faulty light switch in lab 2",
        "Broken window panes in Lecture Hall 4",
        "Leaking pipe in mechanical quad",
        "Unclogged drain in engineering quad",
        "Request to pave shortcut pathway",
        "Exposed electrical wires in corridor",
        "Squeaky doors in reading room",
        "Stained classroom whiteboards",
        "Fixed toilet flush valve in cafeteria",
        "Request to install swimming pool"
      ],
      // 4: Registry & Academic Planning
      [
        "Error in spelling of name on portal",
        "Delay in processing academic transcript",
        "Correction of matriculation number",
        "Missing stamp on registration form",
        "Request to change department late",
        "Certificate name order incorrect",
        "Request for deferred admission letter",
        "Lost student ID clearance letter",
        "Updated course code on registration list",
        "Appeal to register below minimum credit",
        "Transcript delivery failure notice",
        "Verification of external transfer credits",
        "Correction of graduation cohort year",
        "Replaced blank grade with final score",
        "Request for CGPA manual grade boost"
      ],
      // 5: Student Affairs Division
      [
        "Inquiry about Student Union elections date",
        "Club registration fee dispute",
        "ID Card replacement delay",
        "Missing list of approved clubs",
        "Request to host unregistered musical concert",
        "Student club constitution approval delay",
        "Departmental dues levy grievance",
        "Bursary scholarship disbursement inquiry",
        "Approved charter for student chapter",
        "Request to cancel mandatory orientation",
        "Missing handbook for freshers",
        "Loud noise from student center arcade",
        "Resolved travel permit for field trip",
        "Empty first-aid boxes in hostels",
        "Request to sell retail items in lounge"
      ],
      // 6: Computer Science Department
      [
        "CSC 401 exam result missing on portal",
        "Lecturer conduct during project defense",
        "Correction of grade for CSC 302",
        "CSC 201 lab equipment shortage",
        "Request to waive final year project",
        "CSC 311 class clash with MTH 302",
        "Lecturer missing practical lab hours",
        "Database lab server offline bug",
        "Rescheduled CSC 404 test date",
        "Request for student to grade papers",
        "CSC 305 operating systems textbook missing",
        "Lecturer refusing to explain project criteria",
        "Correction of graduation clearance grade",
        "Unsecured cables in CS Lab Room 3",
        "Request to bypass compiler theory course"
      ],
      // 7: Mechanical Engineering Department
      [
        "MEG 305 test script missing review",
        "MEG 411 lecturer not attending lectures",
        "Clash in exam timetable for MEG 301",
        "Missing workshop tools for MEG 202",
        "Request to change MEG course curriculum",
        "Faulty hydraulic bench in MEG lab",
        "MEG 401 lecturer rushing syllabus",
        "Rescheduled drawing board session",
        "Restocked lathe cutting fluids in workshop",
        "Request to write exam from home",
        "MEG 501 graduation supervisor change",
        "Lecturer selling mandatory textbooks",
        "Grade correction on portal for MEG 306",
        "Broken engine block model in auto lab",
        "Request to skip workshop practice"
      ],
      // 8: Accounting Department
      [
        "ACC 201 missing CA score",
        "Lecturer refusing to explain grades",
        "Timetable clash for ACC 403",
        "Calculator restrictions during test",
        "Request to upgrade grade from D to A",
        "ACC 311 textbook price gouging",
        "Exam room desk noise",
        "Correction of CA list entry error",
        "Restocked accounting journals in library",
        "Request to skip taxation course",
        "ACC 402 grades not released yet",
        "Lecturer missing classes repeatedly",
        "Resolved exam timetable mismatch",
        "Fixed accounting software lab access",
        "Request to waive ICAN registration fee"
      ]
    ];

    const descriptions = [
      // 0: ICT & Portal Services
      [
        "I am trying to register my courses for the semester but the portal is showing 'Access Denied' when I click submit. Please help resolve this.",
        "I paid my school fees using the portal, but my bank account was debited twice. The portal only shows one transaction paid. I need a refund or credit.",
        "I forgot my portal password and clicked reset, but the link is not sending to my school email after multiple tries.",
        "I paid my hostel fee, but the portal is still showing unpaid. I have attached the receipt of payment.",
        "I want the portal to allow me to register for CSC 401 without passing CSC 301 since I am a final year student.",
        "I purchased an internet voucher code at the ICT center but trying to login to the library WiFi says 'Voucher Expired' immediately.",
        "The portal registration sheet won't let me submit because it claims my course units exceed 24, but I only selected 18 units in total.",
        "My profile shows my old temporary application number instead of my newly assigned matriculation number.",
        "My date of birth was entered incorrectly during registration as 2005 instead of 2003. Please assist.",
        "I paid late due to health issues and want the 5,000 Naira late registration fee waived. I have a medical report.",
        "My portal is active, but trying to login to the Learning Management System (LMS) says my account is locked out.",
        "I paid my acceptance fee via Remita, but the status is stuck on 'Verifying' for over 48 hours.",
        "I got admission into Computer Science but my portal dashboard shows Mechanical Engineering department.",
        "The LASUSTECH mobile app keeps showing 'Session Expired' immediately after a successful login.",
        "I lost my original printed portal admission letter and want the portal admin to print another original copy."
      ],
      // 1: Student Welfare & Counseling
      [
        "My roommate brings guests late at night and plays loud music, which is disturbing my studies and sleep. I need a room change request.",
        "A senior student residing on the third floor is constantly harassing me and making me do his laundry. I feel unsafe.",
        "I am feeling extremely overwhelmed with my final year project and exam pressure. I need to schedule a session to speak to a counselor.",
        "The lock to our female hostel room door is broken, leaving our belongings unsafe when we go for lectures.",
        "We want the hostel management to allow us to cook inside the hostel rooms using gas cylinders to save time.",
        "I was allocated Hostel Room 102, but there are only 3 mattresses for 4 occupants. I need a mattress to sleep.",
        "The toilets in Block A are constantly blocked, causing bad odors and a health hazard for everyone on the floor.",
        "I need approval to stay off-campus next semester due to chronic health issues that require home care.",
        "Whenever it rains, water leaks from the ceiling directly onto my bed in Room 305.",
        "I want to swap rooms with my friend in Block D so we can study together.",
        "The common room in Block B has a bedbug infestation. We need the rooms fumigated.",
        "My chemistry textbook was stolen from the lounge while I was away. Please assist in checking room records.",
        "I get panic attacks before writing exams. I want to learn breathing techniques and stress management.",
        "The wardrobe door hinges are completely detached in my hostel room, so I cannot lock my clothes.",
        "I want permission to paint my hostel room walls blue and install wallpaper."
      ],
      // 2: Campus Security & Safety
      [
        "I left my iPhone 13 on the reading table in the library for 10 minutes, and when I returned it was gone. Please check security cameras.",
        "A security guard at the main campus gate was extremely rude and delayed me for 30 minutes for no reason despite showing my student ID.",
        "I lost my brown leather wallet containing my ID card and driver's license near the lecture hall yesterday.",
        "There is a noisy group gathering outside the hostel gate playing loud music at 1 AM. It is disturbing the peace.",
        "Requesting permission to drive and park my personal vehicle right next to the lecture halls instead of the parking lot.",
        "I saw two individuals who did not look like students loitering behind the sports complex late last night.",
        "My blue mountain bike was stolen from the bicycle rack outside Block C between 2 PM and 4 PM.",
        "I study in the library until 10 PM and feel unsafe walking to the remote hostel. Can a security guard escort me?",
        "The pathway between the library and engineering block is pitch black at night due to dead bulbs.",
        "I want security to give me the raw video footage of the library parking lot to see who dented my car.",
        "A person without a student ID card was seen entering the female common room in Block D.",
        "I forgot my black Nike backpack in Lecture Theater 3. It contains my notebooks and class notes.",
        "I found a red SanDisk 64GB flash drive on the grass near the admin block.",
        "Traffic is backing up onto the highway due to slow vehicle checks at the main gate.",
        "I want security to allow me to enter the hostel after the 11 PM curfew without writing my name in the logbook."
      ],
      // 3: Works & Physical Planning
      [
        "For the past two days, there has been no running water in the toilets of Block C. The sanitary condition is getting very poor.",
        "The ceiling fan in Lecture Hall 1 is shaking violently when turned on and looks like it might fall on students.",
        "Several desks in Room 12 have broken wood and nails sticking out, which are tearing students' clothes.",
        "There has been no electricity in Block D classrooms for three days, making evening study and lectures impossible.",
        "I want the school to install a personal split AC in my hostel room because of the heat.",
        "The main light switch in Physics Lab 2 sparks when toggled. This is a severe electrical hazard.",
        "Several glass window panes in Hall 4 are shattered, letting rain blow into the classroom.",
        "The pipe outside the mechanical lab has burst and is spraying water across the walkway.",
        "Storm water is pooling outside the mechanical building entrance due to leaves clogging the storm drain.",
        "We want works to pave the dirt shortcut through the lawn so it doesn't get muddy when it rains.",
        "There are exposed wires hanging from the ceiling in the admin building corridor next to office 24.",
        "The doors to the library reading room squeak loudly every time someone enters, disrupting quiet studies.",
        "The whiteboards in Classrooms 5 and 6 are heavily stained and cannot be erased.",
        "The flush valve in the student cafeteria toilet is stuck open, wasting hundreds of gallons of water.",
        "We want the physical planning department to build a recreational swimming pool next to the hostels."
      ],
      // 4: Registry & Academic Planning
      [
        "My name is misspelled on the portal as 'Sanni' instead of 'Sani'. I need this corrected before transcripts are generated.",
        "I applied for my official transcript two weeks ago, but the portal still shows 'Processing'. I need it for a scholarship deadline.",
        "My matriculation number has a wrong digit at the end on the registry list.",
        "My course registration form was not stamped by the registry officer during validation.",
        "I am in my 300 level and want to switch from History to Computer Science starting next semester.",
        "My name order on the graduation list is wrong. My middle name should come before my surname.",
        "I deferred my admission to next session but registry has not issued my official deferment letter.",
        "I lost my ID and need a temporary registry clearance letter to write my upcoming final exams.",
        "I registered for GST 202, but the registry sheet shows GST 204. I need this corrected.",
        "I only need 8 credits to graduate, but portal requires registering a minimum of 12 credits.",
        "The organization I sent my transcript to says they have not received it yet despite 3 weeks passing.",
        "I submitted my transfer transcript from my previous university, but registry has not verified my credits.",
        "My graduation status indicates 2025 instead of 2026, which affects my NYSC mobilization.",
        "The registry grade sheet for MTH 201 is blank for my matric number despite scoring 65% in CA.",
        "I am at 2.49 CGPA and want registry to round it up to 2.50 to graduate with second class upper."
      ],
      // 5: Student Affairs Division
      [
        "When are the nominations for the Student Union Government (SUG) elections opening?",
        "The departmental club is charging 5,000 Naira for registration instead of the school-approved 2,000 Naira limit.",
        "I paid for a replacement ID card last month but haven't received it at the student affairs desk.",
        "The student notice board doesn't list the verified campus associations and registered clubs.",
        "We want to host a concert on the school football field this weekend without formal registration.",
        "We submitted our new club constitution 3 weeks ago but have not received approval from the Dean.",
        "Our department association is enforcing a mandatory dues payment of 10,000 Naira, which is too expensive.",
        "When will the school local government bursary scholarship funds be disbursed to selected students?",
        "Our application to start a student chapter of the IEEE association is pending approval.",
        "We want the orientation program for freshmen cancelled because of the hot weather.",
        "The student affairs desk ran out of student handbooks during orientation and I haven't received mine.",
        "The music from the games area in the student center is extremely loud during class hours.",
        "We need a permit for the student excursion bus to travel outside Lagos State.",
        "The first-aid boxes in the student common rooms are completely empty of bandages and antiseptic.",
        "I want to set up a private convenience stall inside the hostel lounge to sell noodles and snacks."
      ],
      // 6: Computer Science Department
      [
        "My grade for CSC 401 is showing 'AR' (Absent Result), but I wrote the exam and signed the attendance sheet.",
        "A lecturer was throwing insults and acting extremely unprofessional during our mock project defense.",
        "I was given an F on the portal, but my script grades scored over 60%. I suspect a typing error.",
        "There are not enough working computers in the CS lab for the practical programming sessions.",
        "I want the department to allow me to graduate without writing the project report because of financial constraints.",
        "CSC 311 class clash with MTH 302, scheduled for Monday at 10 AM.",
        "The lab instructor for CSC 202 programming practicals has not attended the last three lab sessions.",
        "The database server in the CS lab is offline, preventing us from completing our SQL assignments.",
        "We have two exams on the same day and want the CSC 404 test rescheduled.",
        "A final year student is asking to grade the CSC 101 papers to earn extra pocket money.",
        "The library has only one copy of the recommended textbook for CSC 305 (Operating Systems).",
        "The supervisor refuses to provide a grading rubric or explain how project thesis marks are awarded.",
        "The department graduation list displays my grade for CSC 402 as C instead of my actual score A.",
        "Power cables are trailing across the floor in Room 3, creating a tripping hazard.",
        "I want to graduate without taking Compiler Theory because it is too hard."
      ],
      // 7: Mechanical Engineering Department
      [
        "I submitted my test script late with written permission, but it has not been graded on my CA sheet.",
        "The lecturer assigned to MEG 411 has only held one lecture in the past six weeks, leaving us behind.",
        "MEG 301 and CSC 302 exams are scheduled for the same slot next Tuesday.",
        "We lack welding rods and safety goggles in the department workshop for practical exercises.",
        "We want the department to delete thermodynamics from our course outline because it is too difficult.",
        "The hydraulic pump bench in the fluids lab has a fluid leak and cannot build pressure.",
        "The lecturer is trying to cover 8 topics in two classes, making it impossible to follow.",
        "The engineering drawing room was locked during our scheduled drawing practical on Wednesday.",
        "The lathe machines cannot operate because there is no coolant or cutting fluid available.",
        "I want to write my MEG 302 exam online from home because I don't feel like coming to campus.",
        "My project supervisor is never available and has not responded to my drafts for two months.",
        "A lecturer is forcing students to buy his textbook for 8,000 Naira or face automatic failure.",
        "My grades for MEG 306 shows C instead of B+ which I scored in my test and exam.",
        "The sectional cutaway model of the engine has broken pistons and is jammed.",
        "I want to graduate without doing the compulsory workshop practice because I don't like manual work."
      ],
      // 8: Accounting Department
      [
        "My Continuous Assessment test score of 25 is missing from my portal profile.",
        "The CA test papers were not returned, and the lecturer refused to explain how our scores were calculated.",
        "Timetable clash for ACC 403 with MEG 403 exam on Thursday.",
        "We were told we cannot use basic financial calculators during CA tests, which delays our calculations.",
        "I got a D in ACC 301 but I need an A to keep my CGPA up for scholarship retention.",
        "The department bookshop is selling the ACC 311 study guide at 12,000 Naira instead of the fixed price.",
        "The accounting exam hall has squeaky folding chairs that make a loud noise during exams.",
        "My CA score was input as 12 instead of 22 in ACC 305 database.",
        "The library lacks recent editions of professional accounting journals (ICAN) for research.",
        "I want to graduate without registering for Corporate Taxation because I don't want to study tax.",
        "It is two weeks after the exams and ACC 402 grades have not been posted on our board.",
        "The lecturer for Auditing (ACC 412) has only held two classes this semester.",
        "The department exam schedule says ACC 201 is on Monday, but the portal says Tuesday.",
        "Accounting students cannot login to Sage or Peachtree software on lab computers due to subscription expiry.",
        "I want the university to pay for my ICAN professional registration fees."
      ]
    ];

    const feedBacks = {
      resolved: {
        admin: "We have reviewed your details and solved the issue. The corrections are now active on your dashboard.",
        satisfied: "yes",
        rating: 5,
        comments: "Excellent resolution speed! Thank you."
      },
      fixed: {
        admin: "Our technical team has fixed this issue and verified the resolution directly.",
        satisfied: "yes",
        rating: 4,
        comments: "Fixed and working properly. Thank you."
      },
      rejected: {
        admin: "Your request is rejected as it does not align with the standard university academic guidelines and senate policies."
      }
    };

    let totalSeeded = 0;
    for (let j = 0; j < seededDepts.length; j++) {
      const dept = seededDepts[j];
      const staffList = await User.find({ role: 'staff', department_id: dept._id });

      for (let k = 0; k < 15; k++) {
        const assignedStaff = staffList[k % staffList.length];
        const student = students[k % students.length];
        const reference_id = genRefId();
        
        let category;
        if (j === 0) category = k % 2 === 0 ? "it-service" : "financial";
        else if (j === 1) category = k % 2 === 0 ? "facility-hostel" : "delicate";
        else if (j === 2) category = "security";
        else if (j === 3) category = "facility-maint";
        else if (j === 4) category = "admin-staff";
        else if (j === 5) category = "other";
        else category = k % 2 === 0 ? "academic-result" : "academic-lecturer";

        const title = titles[j][k];
        const description = descriptions[j][k];

        // Status cycle: 3 pending, 3 in_review, 3 resolved, 3 fixed, 3 rejected
        let status;
        if (k < 3) status = "pending";
        else if (k < 6) status = "in_review";
        else if (k < 9) status = "resolved";
        else if (k < 12) status = "fixed";
        else status = "rejected";

        const priorities = ["normal", "high", "normal", "critical", "low"];
        const priority = priorities[k % priorities.length];

        const timeline = [
          { type: 'system', text: 'Complaint submitted and reference ID issued.' },
          { type: 'assigned', text: `Assigned to ${assignedStaff.name} (${dept.name}).`, user_id: assignedStaff._id }
        ];

        if (status !== 'pending') {
          timeline.push({
            type: 'status_change',
            text: `Status changed to ${status.replace('_', ' ')}.`,
            user_id: assignedStaff._id
          });
        }

        let admin_feedback = "";
        let satisfaction = { satisfied: null, rating: null, comments: "", submitted_at: null };

        if (status === 'resolved') {
          admin_feedback = feedBacks.resolved.admin;
          satisfaction = {
            satisfied: feedBacks.resolved.satisfied,
            rating: feedBacks.resolved.rating,
            comments: feedBacks.resolved.comments,
            submitted_at: new Date()
          };
        } else if (status === 'fixed') {
          admin_feedback = feedBacks.fixed.admin;
          satisfaction = {
            satisfied: feedBacks.fixed.satisfied,
            rating: feedBacks.fixed.rating,
            comments: feedBacks.fixed.comments,
            submitted_at: new Date()
          };
        } else if (status === 'rejected') {
          admin_feedback = feedBacks.rejected.admin;
        }

        await Complaint.create({
          reference_id,
          user_id: student._id,
          assigned_staff_id: assignedStaff._id,
          category,
          title,
          description,
          anonymous: k % 4 === 0,
          priority,
          status,
          admin_feedback,
          satisfaction_feedback: satisfaction,
          timeline,
          internal_notes: status === 'in_review' || status === 'resolved' ? [
            {
              admin_id: assignedStaff._id,
              text: `Initial investigation started for this ${priority} priority case.`,
              created_at: new Date(Date.now() - 3600000)
            }
          ] : []
        });
        totalSeeded++;
      }
    }

    console.log(`🎉 Successfully seeded ${totalSeeded} complaints!`);
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedUsers();
