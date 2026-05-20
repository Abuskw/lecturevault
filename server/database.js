const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'lecturevault.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS faculties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    facultyId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facultyId) REFERENCES faculties(id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    fullName TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    studentLevel INTEGER,
    departmentId INTEGER,
    avatar TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (departmentId) REFERENCES departments(id)
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    level INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    units INTEGER DEFAULT 2,
    departmentId INTEGER,
    lecturerId INTEGER,
    description TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (departmentId) REFERENCES departments(id),
    FOREIGN KEY (lecturerId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS lectures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    weekNumber INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    fileName TEXT,
    fileSize INTEGER,
    fileType TEXT DEFAULT 'pdf',
    academicYear TEXT NOT NULL,
    courseId INTEGER,
    uploaderId INTEGER,
    downloads INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (courseId) REFERENCES courses(id),
    FOREIGN KEY (uploaderId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    value INTEGER NOT NULL CHECK(value >= 1 AND value <= 5),
    comment TEXT,
    userId INTEGER,
    lectureId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (lectureId) REFERENCES lectures(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    userId INTEGER,
    lectureId INTEGER,
    parentId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (lectureId) REFERENCES lectures(id),
    FOREIGN KEY (parentId) REFERENCES comments(id)
  );

  CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    lectureId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (lectureId) REFERENCES lectures(id)
  );
`);

// Insert sample data if empty
const facultyCount = db.prepare('SELECT COUNT(*) as count FROM faculties').get();
if (facultyCount.count === 0) {
  console.log('📚 Inserting faculties, departments, and courses...');
  
  const insertFaculty = db.prepare("INSERT INTO faculties (name) VALUES (?)");
  const insertDept = db.prepare("INSERT INTO departments (name, facultyId) VALUES (?, ?)");
  const insertCourse = db.prepare("INSERT INTO courses (code, title, level, semester, units, departmentId) VALUES (?, ?, ?, ?, ?, ?)");
  
  // ========== FACULTY OF AGRICULTURE ==========
  const fAgri = insertFaculty.run('Faculty of Agriculture');
  const dAgriSci = insertDept.run('Agricultural Science', fAgri.lastInsertRowid);
  const dFisheries = insertDept.run('Fisheries and Aquaculture', fAgri.lastInsertRowid);
  const dForestry = insertDept.run('Forestry and Wildlife Management', fAgri.lastInsertRowid);
  const dFoodSci = insertDept.run('Food Science and Technology', fAgri.lastInsertRowid);
  
  insertCourse.run('AGR101', 'Introduction to Agriculture', 100, 1, 3, dAgriSci.lastInsertRowid);
  insertCourse.run('AGR102', 'Principles of Crop Production', 100, 2, 3, dAgriSci.lastInsertRowid);
  insertCourse.run('FIS101', 'Introduction to Fisheries', 100, 1, 3, dFisheries.lastInsertRowid);
  insertCourse.run('FIS201', 'Aquaculture Systems', 200, 1, 4, dFisheries.lastInsertRowid);
  insertCourse.run('FOR101', 'Introduction to Forestry', 100, 1, 3, dForestry.lastInsertRowid);
  insertCourse.run('FST101', 'Food Science Fundamentals', 100, 1, 3, dFoodSci.lastInsertRowid);

  // ========== BASIC MEDICAL SCIENCES ==========
  const fMed = insertFaculty.run('Basic Medical Sciences');
  const dMLS = insertDept.run('Medical Laboratory Science', fMed.lastInsertRowid);
  const dNursing = insertDept.run('Nursing Science', fMed.lastInsertRowid);
  const dPhysio = insertDept.run('Physiotherapy', fMed.lastInsertRowid);
  const dMedSurg = insertDept.run('Medicine and Surgery', fMed.lastInsertRowid);
  
  insertCourse.run('MLS101', 'Introduction to Medical Laboratory', 100, 1, 4, dMLS.lastInsertRowid);
  insertCourse.run('MLS201', 'Clinical Chemistry', 200, 1, 4, dMLS.lastInsertRowid);
  insertCourse.run('NUR101', 'Fundamentals of Nursing', 100, 1, 4, dNursing.lastInsertRowid);
  insertCourse.run('DPT101', 'Anatomy for Physiotherapy', 100, 1, 4, dPhysio.lastInsertRowid);
  insertCourse.run('MBBS101', 'Basic Medical Sciences', 100, 1, 6, dMedSurg.lastInsertRowid);

  // ========== EARTH AND ENVIRONMENTAL SCIENCES ==========
  const fEarth = insertFaculty.run('Earth and Environmental Sciences');
  const dEnvMgt = insertDept.run('Environmental Management', fEarth.lastInsertRowid);
  const dGeog = insertDept.run('Geography', fEarth.lastInsertRowid);
  const dMeteo = insertDept.run('Meteorology', fEarth.lastInsertRowid);
  
  insertCourse.run('EVM101', 'Introduction to Environmental Management', 100, 1, 3, dEnvMgt.lastInsertRowid);
  insertCourse.run('EVM201', 'Environmental Impact Assessment', 200, 1, 3, dEnvMgt.lastInsertRowid);
  insertCourse.run('GEO101', 'Physical Geography', 100, 1, 3, dGeog.lastInsertRowid);
  insertCourse.run('GEO201', 'Human Geography', 200, 1, 3, dGeog.lastInsertRowid);
  insertCourse.run('MET101', 'Introduction to Meteorology', 100, 1, 3, dMeteo.lastInsertRowid);

  // ========== FACULTY OF EDUCATION ==========
  const fEdu = insertFaculty.run('Faculty of Education');
  const dEduGen = insertDept.run('Education', fEdu.lastInsertRowid);
  const dSpecEdu = insertDept.run('Special Education', fEdu.lastInsertRowid);
  const dEduPsych = insertDept.run('Educational Psychology and Counseling', fEdu.lastInsertRowid);
  const dEduMgt = insertDept.run('Education Management', fEdu.lastInsertRowid);
  const dSciEdu = insertDept.run('Science Education', fEdu.lastInsertRowid);
  const dMathCSEdu = insertDept.run('Mathematics and Computer Science Education', fEdu.lastInsertRowid);
  const dLibInfo = insertDept.run('Library and Information Science', fEdu.lastInsertRowid);
  
  insertCourse.run('EDU101', 'Introduction to Education', 100, 1, 2, dEduGen.lastInsertRowid);
  insertCourse.run('EDU201', 'Educational Psychology', 200, 1, 2, dEduGen.lastInsertRowid);
  insertCourse.run('SPE101', 'Introduction to Special Education', 100, 1, 3, dSpecEdu.lastInsertRowid);
  insertCourse.run('GCE101', 'Guidance and Counseling', 100, 1, 2, dEduPsych.lastInsertRowid);
  insertCourse.run('EMT101', 'Educational Management', 100, 1, 2, dEduMgt.lastInsertRowid);
  insertCourse.run('SCE101', 'Science Education Methods', 100, 1, 3, dSciEdu.lastInsertRowid);
  insertCourse.run('CSE101', 'Computer Science Education', 100, 1, 3, dMathCSEdu.lastInsertRowid);
  insertCourse.run('LIS101', 'Library Science Basics', 100, 1, 3, dLibInfo.lastInsertRowid);

  // ========== FACULTY OF HUMANITIES ==========
  const fHum = insertFaculty.run('Faculty of Humanities');
  const dArabic = insertDept.run('Arabic', fHum.lastInsertRowid);
  const dEngFrench = insertDept.run('English and French', fHum.lastInsertRowid);
  const dNigLang = insertDept.run('Nigerian Languages', fHum.lastInsertRowid);
  const dHistSec = insertDept.run('History and Security Studies', fHum.lastInsertRowid);
  const dIslamic = insertDept.run('Islamic Studies', fHum.lastInsertRowid);
  
  insertCourse.run('ARB101', 'Arabic Language I', 100, 1, 3, dArabic.lastInsertRowid);
  insertCourse.run('ARB201', 'Arabic Literature', 200, 1, 3, dArabic.lastInsertRowid);
  insertCourse.run('ENG101', 'English Composition', 100, 1, 3, dEngFrench.lastInsertRowid);
  insertCourse.run('FRN101', 'French Language I', 100, 1, 3, dEngFrench.lastInsertRowid);
  insertCourse.run('HAU101', 'Hausa Language I', 100, 1, 3, dNigLang.lastInsertRowid);
  insertCourse.run('HIS101', 'Nigerian History', 100, 1, 3, dHistSec.lastInsertRowid);
  insertCourse.run('ISL101', 'Islamic Studies I', 100, 1, 3, dIslamic.lastInsertRowid);

  // ========== FACULTY OF LAW ==========
  const fLaw = insertFaculty.run('Faculty of Law');
  const dLaw = insertDept.run('Law', fLaw.lastInsertRowid);
  
  insertCourse.run('LAW101', 'Introduction to Law', 100, 1, 4, dLaw.lastInsertRowid);
  insertCourse.run('LAW201', 'Constitutional Law', 200, 1, 4, dLaw.lastInsertRowid);
  insertCourse.run('LAW301', 'Criminal Law', 300, 1, 4, dLaw.lastInsertRowid);

  // ========== FACULTY OF MANAGEMENT SCIENCES ==========
  const fMgt = insertFaculty.run('Faculty of Management Sciences');
  const dAcct = insertDept.run('Accounting', fMgt.lastInsertRowid);
  const dBusAdmin = insertDept.run('Business Administration', fMgt.lastInsertRowid);
  const dPubAdmin = insertDept.run('Public Administration', fMgt.lastInsertRowid);
  const dLGDS = insertDept.run('Local Government and Development Studies', fMgt.lastInsertRowid);
  
  insertCourse.run('ACC101', 'Principles of Accounting', 100, 1, 3, dAcct.lastInsertRowid);
  insertCourse.run('ACC201', 'Financial Accounting', 200, 1, 4, dAcct.lastInsertRowid);
  insertCourse.run('BUS101', 'Introduction to Business', 100, 1, 3, dBusAdmin.lastInsertRowid);
  insertCourse.run('BUS201', 'Business Management', 200, 1, 4, dBusAdmin.lastInsertRowid);
  insertCourse.run('PUB101', 'Public Administration I', 100, 1, 3, dPubAdmin.lastInsertRowid);
  insertCourse.run('LGS101', 'Local Government Studies', 100, 1, 3, dLGDS.lastInsertRowid);

  // ========== FACULTY OF NATURAL AND APPLIED SCIENCES ==========
  const fNAS = insertFaculty.run('Faculty of Natural and Applied Sciences');
  const dBiochem = insertDept.run('Biochemistry', fNAS.lastInsertRowid);
  const dBioSci = insertDept.run('Biological Sciences', fNAS.lastInsertRowid);
  const dChem = insertDept.run('Pure and Industrial Chemistry', fNAS.lastInsertRowid);
  const dCS = insertDept.run('Computer Science', fNAS.lastInsertRowid);
  const dMath = insertDept.run('Mathematics', fNAS.lastInsertRowid);
  const dMicroBio = insertDept.run('MicroBiological Sciences', fNAS.lastInsertRowid);
  const dPhysics = insertDept.run('Physics', fNAS.lastInsertRowid);
  const dStat = insertDept.run('Statistics', fNAS.lastInsertRowid);
  
  insertCourse.run('BCH101', 'Biochemistry I', 100, 1, 4, dBiochem.lastInsertRowid);
  insertCourse.run('BCH201', 'Metabolism', 200, 1, 4, dBiochem.lastInsertRowid);
  insertCourse.run('BIO101', 'General Biology', 100, 1, 3, dBioSci.lastInsertRowid);
  insertCourse.run('BIO201', 'Genetics', 200, 1, 4, dBioSci.lastInsertRowid);
  insertCourse.run('CHM101', 'General Chemistry', 100, 1, 4, dChem.lastInsertRowid);
  insertCourse.run('CHM201', 'Organic Chemistry', 200, 1, 4, dChem.lastInsertRowid);
  insertCourse.run('CSC101', 'Introduction to Programming', 100, 1, 3, dCS.lastInsertRowid);
  insertCourse.run('CSC102', 'Computer Science Fundamentals', 100, 2, 3, dCS.lastInsertRowid);
  insertCourse.run('CSC201', 'Data Structures and Algorithms', 200, 1, 4, dCS.lastInsertRowid);
  insertCourse.run('CSC202', 'Object Oriented Programming', 200, 2, 4, dCS.lastInsertRowid);
  insertCourse.run('CSC301', 'Operating Systems', 300, 1, 4, dCS.lastInsertRowid);
  insertCourse.run('CSC302', 'Computer Networks', 300, 2, 4, dCS.lastInsertRowid);
  insertCourse.run('CSC401', 'Software Engineering', 400, 1, 4, dCS.lastInsertRowid);
  insertCourse.run('CSC402', 'Cyber Security', 400, 2, 4, dCS.lastInsertRowid);
  insertCourse.run('MTH101', 'Elementary Mathematics', 100, 1, 3, dMath.lastInsertRowid);
  insertCourse.run('MTH201', 'Calculus', 200, 1, 4, dMath.lastInsertRowid);
  insertCourse.run('MTH301', 'Linear Algebra', 300, 1, 4, dMath.lastInsertRowid);
  insertCourse.run('MCB101', 'MicroBiology I', 100, 1, 4, dMicroBio.lastInsertRowid);
  insertCourse.run('PHY101', 'General Physics', 100, 1, 4, dPhysics.lastInsertRowid);
  insertCourse.run('PHY201', 'Electromagnetism', 200, 1, 4, dPhysics.lastInsertRowid);
  insertCourse.run('STA101', 'Introduction to Statistics', 100, 1, 3, dStat.lastInsertRowid);

  // ========== FACULTY OF SOCIAL SCIENCES ==========
  const fSoc = insertFaculty.run('Faculty of Social Sciences');
  const dEcon = insertDept.run('Economics', fSoc.lastInsertRowid);
  const dPolSci = insertDept.run('Political Science', fSoc.lastInsertRowid);
  const dSoc = insertDept.run('Sociology', fSoc.lastInsertRowid);
  const dIntRel = insertDept.run('International Relations', fSoc.lastInsertRowid);
  const dSocLib = insertDept.run('Library and Information Science', fSoc.lastInsertRowid);
  
  insertCourse.run('ECO101', 'Principles of Economics', 100, 1, 3, dEcon.lastInsertRowid);
  insertCourse.run('ECO201', 'Microeconomics', 200, 1, 4, dEcon.lastInsertRowid);
  insertCourse.run('POL101', 'Introduction to Political Science', 100, 1, 3, dPolSci.lastInsertRowid);
  insertCourse.run('POL201', 'Nigerian Government and Politics', 200, 1, 4, dPolSci.lastInsertRowid);
  insertCourse.run('SOC101', 'Introduction to Sociology', 100, 1, 3, dSoc.lastInsertRowid);
  insertCourse.run('INR101', 'International Relations I', 100, 1, 3, dIntRel.lastInsertRowid);
  insertCourse.run('SLS101', 'Library Science Basics', 100, 1, 3, dSocLib.lastInsertRowid);
  
  console.log('✅ All data inserted successfully!');
}

console.log('✅ Database setup complete');
module.exports = db;