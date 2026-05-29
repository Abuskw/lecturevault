require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dneama7tz',
  api_key: '331236972982713',
  api_secret: '5Cmo7rkCquVaNhUu2sc46beooS0'
});
// ========================================
// MIDDLEWARE
// ========================================

// Allow requests from your React/Vite frontend
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
// ============ UPLOAD LECTURE ============

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + '.pdf')
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDFs!'), false);
}});

app.post('/api/lectures/upload', auth, upload.single('pdf'), async (req, res) => {
  try {
    const { title, weekNumber, courseId, academicYear } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No PDF uploaded' });
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'raw',
      folder: 'lecturevault',
      use_filename: true,
      unique_filename: true
    });
    
    db.prepare(`INSERT INTO lectures (title, weekNumber, fileUrl, fileName, fileSize, academicYear, courseId, uploaderId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
      title, parseInt(weekNumber), result.secure_url, file.originalname, file.size,
      academicYear, parseInt(courseId), req.user?.userId || 1
    );
    
    // Delete local file after upload
    fs.unlinkSync(file.path);
    
    res.status(201).json({ message: 'Uploaded!', fileUrl: result.secure_url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});
app.post('/api/courses/create', (req, res) => {
  const { code, title, departmentId } = req.body;
  const existing = db.prepare('SELECT * FROM courses WHERE code = ?').get(code);
  if (existing) return res.json(existing);
  const result = db.prepare('INSERT INTO courses (code, title, level, semester, departmentId) VALUES (?, ?, 100, 1, ?)').run(code, title, departmentId);
  res.json({ id: result.lastInsertRowid, code, title });
});
// DOWNLOAD LECTURE
app.get('/api/lectures/:id/download', (req, res) => {
  const lecture = db.prepare('SELECT * FROM lectures WHERE id = ?').get(req.params.id);
  if (!lecture) return res.status(404).json({ error: 'Lecture not found' });
  
  db.prepare('UPDATE lectures SET downloads = downloads + 1 WHERE id = ?').run(req.params.id);
  
  // Redirect to Cloudinary URL
  res.redirect(lecture.fileUrl);
});
app.use('/uploads', express.static(uploadsDir));


// ========================================
// CONFIGURATION
// ========================================

// Lecturer verification code (move to .env in production)
let LECTURER_SECRET = process.env.LECTURER_SECRET || 'teach2025';
// JWT secret
const JWT_SECRET =
  process.env.JWT_SECRET || 'secret123';

// ========================================
// HEALTH CHECK
// ========================================

app.get('/api/health', (req, res) => {
  try {
    // Simple DB test
    db.prepare('SELECT 1 as ok').get();

    res.json({
      status: 'healthy',
      database: 'connected',
      port: PORT,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

// ========================================
// AUTH ROUTES
// ========================================

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      role,
      studentLevel,
      lecturerCode,
    } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({
        error: 'Full name, email, and password are required',
      });
    }

    // Check if user already exists
    const existing = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email);

    if (existing) {
      return res.status(400).json({
        error: 'User already exists',
      });
    }

    // Determine final role
    let finalRole = role || 'student';

    // Lecturer verification
    if (role === 'lecturer') {
      if (lecturerCode !== LECTURER_SECRET) {
        return res.status(403).json({
          error:
            'Invalid lecturer verification code. Contact your department.',
        });
      }

      finalRole = 'lecturer';
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = db
      .prepare(
        `
        INSERT INTO users
        (email, password, fullName, role, studentLevel)
        VALUES (?, ?, ?, ?, ?)
      `
      )
      .run(
        email,
        hashedPassword,
        fullName,
        finalRole,
        studentLevel || null
      );

    const userId = result.lastInsertRowid;

    // Create JWT
    const token = jwt.sign(
      {
        userId,
        email,
        role: finalRole,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success
    res.status(201).json({
      token,
      user: {
        id: userId,
        email,
        fullName,
        role: finalRole,
        studentLevel: studentLevel || null,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);

    res.status(500).json({
      error: 'Registration failed',
      details: error.message,
    });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Find user
    const user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Compare password
    const isValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from returned object
    const { password: _password, ...userData } = user;

    res.json({
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      error: 'Login failed',
      details: error.message,
    });
  }
});

// ========================================
// COURSE ROUTES
// ========================================

// Get all courses with optional filters
app.get('/api/courses', (req, res) => {
  try {
    const { level, search } = req.query;

    let query = 'SELECT * FROM courses WHERE 1=1';
    const params = [];

    if (level) {
      query += ' AND level = ?';
      params.push(level);
    }

    if (search) {
      query += ' AND (title LIKE ? OR code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY level, code';

    const courses = db.prepare(query).all(...params);

    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);

    res.status(500).json({
      error: 'Failed to fetch courses',
      details: error.message,
    });
  }
});

// Get single course
app.get('/api/courses/:id', (req, res) => {
  try {
    const course = db
      .prepare('SELECT * FROM courses WHERE id = ?')
      .get(req.params.id);

    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
      });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);

    res.status(500).json({
      error: 'Failed to fetch course',
      details: error.message,
    });
  }
});

// Get lectures for a course
app.get('/api/courses/:id/lectures', (req, res) => {
  try {
    const lectures = db
      .prepare(
        `
        SELECT
          lectures.*,
          users.fullName AS uploaderName,
          (
            SELECT AVG(value)
            FROM ratings
            WHERE ratings.lectureId = lectures.id
          ) AS averageRating
        FROM lectures
        LEFT JOIN users
          ON lectures.uploaderId = users.id
        WHERE lectures.courseId = ?
          AND lectures.status = 'published'
        ORDER BY lectures.weekNumber
      `
      )
      .all(req.params.id);

    res.json(lectures);
  } catch (error) {
    console.error('Get lectures error:', error);

    res.status(500).json({
      error: 'Failed to fetch lectures',
      details: error.message,
    });
  }
});
app.get('/api/lectures', (req, res) => {
  try {
    const lectures = db.prepare(`
      SELECT
        lectures.*,
        courses.code as courseCode,
        courses.title as courseTitle
      FROM lectures
      JOIN courses
        ON lectures.courseId = courses.id
      WHERE lectures.status = 'published'
      ORDER BY lectures.createdAt DESC
    `).all();

    res.json(lectures);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch lectures'
    });
  }
});
// ========================================
// PATHFINDER ROUTES
// ========================================

app.get('/api/pathfinder/upcoming', (req, res) => {
  try {
    const currentLevel =
      parseInt(req.query.level, 10) || 100;

    const nextLevel = currentLevel + 100;

    const courses = db
      .prepare(
        'SELECT * FROM courses WHERE level = ? ORDER BY code'
      )
      .all(nextLevel);

    const lectures = db
      .prepare(
        `
        SELECT
          lectures.*,
          courses.code AS courseCode,
          courses.title AS courseTitle
        FROM lectures
        JOIN courses
          ON lectures.courseId = courses.id
        WHERE courses.level = ?
          AND lectures.weekNumber <= 3
        ORDER BY courses.code, lectures.weekNumber
      `
      )
      .all(nextLevel);

    res.json({
      nextLevel,
      courses,
      lectures,
    });
  } catch (error) {
    console.error('Pathfinder error:', error);

    res.status(500).json({
      error: 'Failed to fetch upcoming courses',
      details: error.message,
    });
  }
});

// ========================================
// ADMIN ROUTES
// ========================================

const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    req.user = decoded;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

app.get('/api/admin/stats', adminAuth, (req, res) => {
  const users = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const courses = db.prepare('SELECT COUNT(*) as count FROM courses').get().count;
  const lectures = db.prepare('SELECT COUNT(*) as count FROM lectures').get().count;
  const downloads = db.prepare('SELECT SUM(downloads) as total FROM lectures').get().total || 0;
  const lecturers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role='lecturer'").get().count;
  const students = db.prepare("SELECT COUNT(*) as count FROM users WHERE role='student'").get().count;
  res.json({ users, courses, lectures, downloads, lecturers, students });
});

app.get('/api/admin/users', adminAuth, (req, res) => {
  const users = db.prepare("SELECT id, email, fullName, role, studentLevel, createdAt FROM users ORDER BY createdAt DESC").all();
  res.json(users);
});

app.put('/api/admin/users/:id/role', adminAuth, (req, res) => {
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(req.body.role, req.params.id);
  res.json({ success: true });
});

app.delete('/api/admin/users/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/admin/lectures', adminAuth, (req, res) => {
  const lectures = db.prepare(`
    SELECT lectures.*, courses.code as courseCode, courses.title as courseTitle, users.fullName as uploaderName
    FROM lectures JOIN courses ON lectures.courseId = courses.id JOIN users ON lectures.uploaderId = users.id
    ORDER BY lectures.createdAt DESC
  `).all();
  res.json(lectures);
});

app.delete('/api/admin/lectures/:id', adminAuth, (req, res) => {
  const lecture = db.prepare('SELECT * FROM lectures WHERE id = ?').get(req.params.id);
  if (lecture) {
    if (lecture.fileUrl && lecture.fileUrl.startsWith('/uploads/')) {
      const fp = path.join(__dirname, lecture.fileUrl);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    db.prepare('DELETE FROM lectures WHERE id = ?').run(req.params.id);
  }
  res.json({ success: true });
});

app.put('/api/admin/lecturer-code', adminAuth, (req, res) => {
  LECTURER_SECRET = req.body.code;
  res.json({ success: true, code: LECTURER_SECRET });
});

// ============ FACULTIES & DEPARTMENTS ============

app.get('/api/faculties', (req, res) => {
  const faculties = db.prepare('SELECT * FROM faculties ORDER BY name').all();
  res.json(faculties);
});

app.get('/api/faculties/:id/departments', (req, res) => {
  const depts = db.prepare('SELECT * FROM departments WHERE facultyId = ? ORDER BY name').all(req.params.id);
  res.json(depts);
});

app.get('/api/departments', (req, res) => {
  const depts = db.prepare(`
    SELECT departments.*, faculties.name as facultyName 
    FROM departments JOIN faculties ON departments.facultyId = faculties.id 
    ORDER BY faculties.name, departments.name
  `).all();
  res.json(depts);
});
// ========================================
// RATINGS & COMMENTS
// ========================================

// Rate a lecture
app.post('/api/lectures/:id/rate', auth, (req, res) => {
  try {
    const { value, comment } = req.body;
    const userId = req.user.userId;

    const existing = db.prepare('SELECT * FROM ratings WHERE userId = ? AND lectureId = ?').get(userId, req.params.id);
    if (existing) {
      db.prepare('UPDATE ratings SET value = ?, comment = ? WHERE id = ?').run(value, comment || null, existing.id);
    } else {
      db.prepare('INSERT INTO ratings (value, comment, userId, lectureId) VALUES (?, ?, ?, ?)').run(value, comment || null, userId, req.params.id);
    }

    const avg = db.prepare('SELECT AVG(value) as avg, COUNT(*) as count FROM ratings WHERE lectureId = ?').get(req.params.id);
    res.json({ success: true, averageRating: avg.avg, totalRatings: avg.count });
  } catch (error) {
    res.status(500).json({ error: 'Rating failed' });
  }
});
// Get ratings for a lecture
app.get('/api/lectures/:id/ratings', (req, res) => {
  const ratings = db.prepare(`
    SELECT ratings.*, users.fullName, users.avatar FROM ratings 
    JOIN users ON ratings.userId = users.id 
    WHERE lectureId = ? ORDER BY ratings.createdAt DESC
  `).all(req.params.id);
  res.json(ratings);
});

// Add comment
app.post('/api/lectures/:id/comments', auth, (req, res) => {
  try {
    const { text, parentId } = req.body;
    const userId = req.user.userId;   // from JWT

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    const result = db.prepare(
      'INSERT INTO comments (text, userId, lectureId, parentId) VALUES (?, ?, ?, ?)'
    ).run(text.trim(), userId, req.params.id, parentId || null);

    const comment = db.prepare(`
      SELECT comments.*, users.fullName, users.avatar
      FROM comments
      JOIN users ON comments.userId = users.id
      WHERE comments.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(comment);
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});
// Get comments for a lecture
app.get('/api/lectures/:id/comments', (req, res) => {
  const comments = db.prepare(`
    SELECT comments.*, users.fullName, users.avatar FROM comments 
    JOIN users ON comments.userId = users.id 
    WHERE lectureId = ? AND parentId IS NULL
    ORDER BY comments.createdAt DESC
  `).all(req.params.id);
  
  // Get replies for each comment
  const withReplies = comments.map(c => {
    c.replies = db.prepare(`
      SELECT comments.*, users.fullName FROM comments 
      JOIN users ON comments.userId = users.id 
      WHERE parentId = ? ORDER BY comments.createdAt ASC
    `).all(c.id);
    return c;
  });
  
  res.json(withReplies);
});
// Bulk upload multiple lectures
const bulkUpload = multer({ storage, fileFilter: (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDFs!'), false);
}});

app.post('/api/lectures/bulk-upload', auth, bulkUpload.array('pdfs', 20), (req, res) => {
  try {
    const { titles, weekNumbers, courseId, academicYear } = req.body;
    const files = req.files;
    
    if (!files || files.length === 0) return res.status(400).json({ error: 'No PDFs uploaded' });
    
    const parseField = (field) => {
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try { return JSON.parse(field) } catch { return field.split(',').map(item => item.trim()).filter(Boolean) }
      }
      return [field];
    }

    const titleList = parseField(titles);
    const weekList = parseField(weekNumbers);
    
    let uploaded = 0;
    const insert = db.prepare(`INSERT INTO lectures (title, weekNumber, fileUrl, fileName, fileSize, academicYear, courseId, uploaderId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    
        files.forEach((file, i) => {
      const fileUrl = '/uploads/' + file.filename;
      insert.run(
        titleList[i] || `Week ${weekList[i] || i+1} Lecture`,
        parseInt(weekList[i]) || i+1,
        fileUrl,
        file.originalname,
        file.size,
        academicYear,
        parseInt(courseId),
        req.user?.userId || 1
      );
      uploaded++;
    });
    
    res.status(201).json({ message: `${uploaded} lectures uploaded!`, count: uploaded });
  } catch (err) {
    res.status(500).json({ error: 'Bulk upload failed' });
  }
});
// ========================================
// 404 HANDLER
// ========================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);

  res.status(500).json({
    error: 'Internal server error',
    details: error.message,
  });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  console.log(`\n✅ Server running at http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎓 Lecturer code: ${LECTURER_SECRET}`);
  console.log('');
});