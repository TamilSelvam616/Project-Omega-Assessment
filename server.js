const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const mammoth = require('mammoth');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config({ path: 'mongo.env' });

const googleClient = new OAuth2Client("16927821098-oab06qa24clokg9gvd5gtkropk5s13j8.apps.googleusercontent.com");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://admin:TmevANlO8EJjFNva@cluster0.he8l0ni.mongodb.net/mcq_platform?retryWrites=true&w=majority';

// Driver layer instantiation parameters cleanly optimized
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ Omega Assess Framework: Persistent Database Hook Established Successfully.');
  initializeDatabase();
})
.catch(err => console.error('❌ Mongoose Driver Engine Layer Init Fault Exception:', err.message));

// Architectural Primitive Mapping Schema Compilation Layout
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correct: { type: Number, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const resultSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  percentage: { type: Number, required: true },
  timeSpent: { type: String, required: true },
  tabSwitches: { type: Number, required: true },
  completedAt: { type: String, required: true },
  answers: Array,
  createdAt: { type: Date, default: Date.now }
});

const settingSchema = new mongoose.Schema({
  testDuration: { type: Number, default: 5 },
  maxTabSwitches: { type: Number, default: 2 },
  updatedBy: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const teacherSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true }
});

const Question = mongoose.model('Question', questionSchema);
const Result = mongoose.model('Result', resultSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Setting = mongoose.model('Setting', settingSchema);

// Multer configuration for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.mimetype === 'application/msword') {
      cb(null, true);
    } else {
      cb(new Error('Only Word documents (.doc, .docx) are allowed'), false);
    }
  }
});

// Initialize default teacher account
async function initializeDefaultTeacher() {
  try {
    const existingTeacher = await Teacher.findOne({ email: 'teacher@school.edu' });
    if (!existingTeacher) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const teacher = new Teacher({
        email: 'teacher@school.edu',
        password: hashedPassword,
        name: 'Default Teacher'
      });
      await teacher.save();
      console.log('✅ Default teacher account created: teacher@school.edu / password123');
    } else {
      console.log('✅ Default teacher account already exists');
    }
  } catch (error) {
    console.error('❌ Error creating default teacher:', error.message);
  }
}

// Initialize default settings
async function initializeDefaultSettings() {
  try {
    const existingSettings = await Setting.findOne();
    if (!existingSettings) {
      const settings = new Setting({
        testDuration: 5,
        maxTabSwitches: 2,
        updatedBy: 'system'
      });
      await settings.save();
      console.log('✅ Default settings created');
    } else {
      console.log('✅ Default settings already exist');
    }
  } catch (error) {
    console.error('❌ Error creating default settings:', error.message);
  }
}

// Initialize some sample questions
async function initializeSampleQuestions() {
  try {
    const questionCount = await Question.countDocuments();
    if (questionCount === 0) {
      const sampleQuestions = [
        {
          question: "What is the capital of France?",
          options: ["London", "Paris", "Berlin", "Madrid"],
          correct: 1,
          createdBy: "system"
        },
        {
          question: "Which programming language is known as the backbone of web development?",
          options: ["Python", "JavaScript", "Java", "C++"],
          correct: 1,
          createdBy: "system"
        },
        {
          question: "What does HTML stand for?",
          options: [
            "Hyper Text Markup Language",
            "High Tech Modern Language", 
            "Hyper Transfer Markup Language",
            "Home Tool Markup Language"
          ],
          correct: 0,
          createdBy: "system"
        }
      ];
      
      await Question.insertMany(sampleQuestions);
      console.log('✅ Sample questions created');
    } else {
      console.log(`✅ ${questionCount} questions already exist in database`);
    }
  } catch (error) {
    console.error('❌ Error creating sample questions:', error.message);
  }
}

// Initialize database
async function initializeDatabase() {
  console.log('🔄 Initializing database...');
  await initializeDefaultTeacher();
  await initializeDefaultSettings();
  await initializeSampleQuestions();
  console.log('✅ Database initialization complete');
}

// Upgraded Unified Identity Verification Endpoint Router Pipeline
app.post('/api/auth/google', async (req, res) => {
  const { token, mode } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, error: 'Cryptographic data payload components missing.' });
  }

  try {
    // Decrypt and process signature validity checks with Google security tokens
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: "16927821098-oab06qa24clokg9gvd5gtkropk5s13j8.apps.googleusercontent.com"
    });
    
    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase().trim();
    const hostedDomain = payload.hd; // Captures the explicit organization domain text string (e.g., school.edu)
    
    // Look for matching database user entries
    let teacher = await Teacher.findOne({ email });

    // ROUTING EVALUATION BLOCK A: SIGN IN INTERCEPT
    if (mode === 'login') {
      if (!teacher) {
        return res.status(401).json({ 
          success: false, 
          error: 'Identity registry empty. Use the Register Node tab to establish access maps first.' 
        });
      }
      return res.json({ success: true, message: 'Authentication verification validated cleanly.', email: teacher.email });
    }

    // ROUTING EVALUATION BLOCK B: SIGN UP REGISTER INTERCEPT (WITH DOMAIN VALIDATION LOCK)
    if (mode === 'signup') {
      if (teacher) {
        return res.status(409).json({ 
          success: false, 
          error: 'Identity allocation collision. An instructor profile with this email address already exists.' 
        });
      }

      // CRITICAL ENFORCEMENT: Block standard public domains (like gmail.com, yahoo.com) if lock active
      // Change 'school.edu' to your university's actual workspace domain mapping string
      const TARGET_DOMAIN = 'school.edu'; 
      if (hostedDomain !== TARGET_DOMAIN && !email.endsWith('@' + TARGET_DOMAIN)) {
        return res.status(403).json({ 
          success: false, 
          error: `Registration Denied: Access restricted to authorized institutional accounts matching @${TARGET_DOMAIN} contexts.` 
        });
      }

      // Safe creation block mapping Google identity data vectors directly to database elements
      teacher = await Teacher.create({
        email: email,
        name: payload.name || 'Verified Google Workspace Node',
        password: 'oauth_secured_profile_vector'
      });

      return res.status(201).json({ 
        success: true, 
        message: 'New administrative matrix node initialized successfully.', 
        email: teacher.email 
      });
    }

  } catch (error) {
    console.error('Google Certificate Security Failure:', error);
    res.status(401).json({ success: false, error: 'Verification handshake failed. Token corrupted.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Get all questions
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Add new questions
app.post('/api/questions', async (req, res) => {
  try {
    const { questions, teacherEmail } = req.body;
    
    // Validate input
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'No questions provided' });
    }

    if (!teacherEmail) {
      return res.status(400).json({ error: 'Teacher email is required' });
    }

    // Add teacher email to each question
    const questionsWithTeacher = questions.map(q => ({
      ...q,
      createdBy: teacherEmail
    }));

    // Save questions to database
    const savedQuestions = await Question.insertMany(questionsWithTeacher);
    
    res.json({ 
      success: true, 
      message: `Successfully added ${savedQuestions.length} questions`,
      count: savedQuestions.length 
    });
  } catch (error) {
    console.error('Error saving questions:', error);
    res.status(500).json({ error: 'Failed to save questions' });
  }
});

// Upload questions from Word document
app.post('/api/questions/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { teacherEmail } = req.body;
    if (!teacherEmail) {
      return res.status(400).json({ error: 'Teacher email is required' });
    }

    console.log('Processing uploaded file:', req.file.originalname);

    // Convert Word document to text
    const result = await mammoth.extractRawText({ buffer: req.file.buffer });
    const text = result.value;

    // Parse questions from text
    const questions = parseQuestionsFromText(text);
    
    if (questions.length === 0) {
      return res.status(400).json({ error: 'No valid questions found in the document' });
    }

    // Add teacher email to each question
    const questionsWithTeacher = questions.map(q => ({
      ...q,
      createdBy: teacherEmail
    }));

    // Save to database
    const savedQuestions = await Question.insertMany(questionsWithTeacher);

    res.json({
      success: true,
      message: `Successfully imported ${savedQuestions.length} questions`,
      count: savedQuestions.length
    });

  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: 'Failed to process document: ' + error.message });
  }
});

// Parse questions from text
function parseQuestionsFromText(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const questions = [];
  let currentQuestion = null;

  for (const line of lines) {
    if (line.match(/^(Q\.|Question\s+\d+\.?|^\d+\.)/i)) {
      if (currentQuestion) questions.push(currentQuestion);
      currentQuestion = {
        question: line.replace(/^(Q\.|Question\s+\d+\.?|^\d+\.)\s*/i, '').trim(),
        options: [],
        correct: null
      };
    } else if (line.match(/^[A-D]\)/) && currentQuestion) {
      const optionText = line.replace(/^[A-D]\)\s*/, '').trim();
      const isCorrect = optionText.includes('[Correct]') || optionText.includes('(Correct)');
      const cleanOption = optionText.replace(/\[Correct\]|\(Correct\)/g, '').trim();

      const optionIndex = currentQuestion.options.length;
      currentQuestion.options.push(cleanOption);
      if (isCorrect) currentQuestion.correct = optionIndex;
    } else if (currentQuestion && currentQuestion.options.length === 0) {
      currentQuestion.question += ' ' + line;
    }
  }

  if (currentQuestion) questions.push(currentQuestion);
  
  // Set default correct answer if none specified
  questions.forEach(q => {
    if (q.correct === null && q.options.length > 0) {
      q.correct = 0;
    }
  });

  return questions.filter(q => q.question && q.options.length >= 2);
}

// Teacher login
app.post('/api/teacher/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find teacher by email
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      console.log('Teacher not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, teacher.password);
    if (!isPasswordValid) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('Successful login for:', email);
    res.json({
      success: true,
      message: 'Login successful',
      teacher: {
        email: teacher.email,
        name: teacher.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await Setting.findOne().sort({ updatedAt: -1 });
    if (!settings) {
      return res.json({ testDuration: 5, maxTabSwitches: 2 });
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
app.post('/api/settings', async (req, res) => {
  try {
    const { testDuration, maxTabSwitches, teacherEmail } = req.body;

    if (!teacherEmail) {
      return res.status(400).json({ error: 'Teacher email is required' });
    }

    const settings = new Setting({
      testDuration: parseInt(testDuration) || 5,
      maxTabSwitches: parseInt(maxTabSwitches) || 2,
      updatedBy: teacherEmail
    });

    await settings.save();

    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Save results
app.post('/api/results', async (req, res) => {
  try {
    const resultData = req.body;

    // Check if email already exists
    const existingResult = await Result.findOne({ email: resultData.email });
    if (existingResult) {
      return res.status(400).json({ error: 'This email has already taken the test' });
    }

    const result = new Result(resultData);
    await result.save();

    res.json({ success: true, message: 'Results saved successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'This email has already taken the test' });
    }
    console.error('Error saving results:', error);
    res.status(500).json({ error: 'Failed to save results' });
  }
});

// Check if email has taken test
app.get('/api/results/check', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existingResult = await Result.findOne({ email });
    res.json({ exists: !!existingResult });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: 'Failed to check email' });
  }
});

// Get all results
app.get('/api/results', async (req, res) => {
  try {
    const results = await Result.find().sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// Clear all results
app.delete('/api/results/clear', async (req, res) => {
  try {
    await Result.deleteMany({});
    res.json({ success: true, message: 'All results cleared successfully' });
  } catch (error) {
    console.error('Error clearing results:', error);
    res.status(500).json({ error: 'Failed to clear results' });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Default teacher account: teacher@school.edu / password123`);
  console.log(`🌐 Access the application at: http://localhost:${PORT}`);
});