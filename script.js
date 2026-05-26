// Secure Anti-Cheat Hook Infrastructure
let isQuizInProgress = false;
let tabSwitchCount = 0;
let maxTabSwitches = 2;
let globalHeader = document.getElementById('global-header');

document.addEventListener('contextmenu', (e) => {
  if (isQuizInProgress) {
    e.preventDefault();
    showToast('Peripheral interaction event context disabled within current runtime sandbox.', 'error');
  }
});

document.addEventListener('keydown', (e) => {
  if (isQuizInProgress) {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && e.key === 'I') ||
      (e.ctrlKey && e.shiftKey && e.key === 'C') ||
      (e.ctrlKey && e.key === 'u')
    ) {
      e.preventDefault();
      showToast('Kernel context mutation calls blocked inside execution loop.', 'error');
      handleTabSwitch();
    }
  }
});

// Dynamic Clipboard Locking
['copy', 'cut', 'paste'].forEach(event => {
  document.addEventListener(event, (e) => {
    if (isQuizInProgress) {
      e.preventDefault();
      navigator.clipboard.writeText(''); // Purge clipboard buffer
      showToast(`Clipboard ${event} action dynamically blocked by security kernel.`, 'error');
    }
  });
});

function enterFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) elem.requestFullscreen().catch(err => console.error(err));
  document.body.classList.add('fullscreen-enforced');
}

function exitFullscreen() {
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(err => console.error(err));
  }
  document.body.classList.remove('fullscreen-enforced');
}

function isFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}

const fullscreenWarning = document.getElementById('fullscreen-warning');
const continueFullscreenBtn = document.getElementById('continue-fullscreen');
const refreshWarning = document.getElementById('refresh-warning');
const continueTestBtn = document.getElementById('continue-test');

function handleFullscreenChange() {
  if (!isFullscreen() && isQuizInProgress) {
    fullscreenWarning.classList.remove('hidden');
    handleTabSwitch();
  } else {
    fullscreenWarning.classList.add('hidden');
  }
}

document.addEventListener('fullscreenchange', handleFullscreenChange);

window.addEventListener('beforeunload', (e) => {
  if (isQuizInProgress) {
    e.preventDefault();
    return (e.returnValue = 'Warning: Modifying application memory vectors will terminate runtime validation hooks.');
  }
});

function handleTabSwitch() {
  if (!isQuizInProgress) return; 

  tabSwitchCount++;
  saveState();

  const tabWarningEl = document.getElementById('tab-warning');
  const tabCountEl = document.getElementById('tab-count');
  
  if (tabWarningEl && tabCountEl) {
    tabWarningEl.classList.remove('hidden');
    tabCountEl.textContent = tabSwitchCount;
  }

  if (tabSwitchCount > maxTabSwitches) {
    showToast('Automated submission forced: Breach parameter threshold exceeded.', 'error');
    showResult();
    return;
  }

  showToast(`Warning: Focus mutation registered. Remaining validation clear lines: ${maxTabSwitches - tabSwitchCount}`, 'warning');
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && isQuizInProgress) {
    handleTabSwitch();
  }
});

window.addEventListener('blur', () => {
  if (isQuizInProgress) {
    handleTabSwitch();
  }
});

continueFullscreenBtn.addEventListener('click', () => {
  enterFullscreen();
  fullscreenWarning.classList.add('hidden');
});

// Toast Notification Management
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-animate max-w-sm w-full bg-cyberCard border p-4 rounded-xl shadow-xl flex items-start space-x-3 text-xs font-mono ${
    type === 'error' ? 'border-red-500/30 text-red-400' :
    type === 'warning' ? 'border-amber-500/30 text-amber-400' :
    type === 'success' ? 'border-emerald-500/30 text-emerald-400' :
    'border-blue-500/30 text-blue-400'
  }`;

  toast.innerHTML = `
    <div class="flex-1">${message}</div>
    <button class="text-gray-500 hover:text-white transition-colors focus:outline-none">✕</button>
  `;

  toast.querySelector('button').addEventListener('click', () => toast.remove());
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Runtime Global Variables
let questions = [];
let currentQuestion = 0;
let score = 0;
let answers = [];
let testDuration = 5; 
let timeLeft = testDuration * 60; 
let userName = '';
let userEmail = '';
let timer;
let startTime = null;

// AI Proctoring Global State
let proctorModel = null;
let proctorInterval = null;
let proctorStream = null;

// Core Interface Nodes
const modeSelection = document.getElementById('mode-selection');
const teacherLogin = document.getElementById('teacher-login');
const formContainer = document.getElementById('form-container');
const quizContainer = document.getElementById('quiz-container');
const resultContainer = document.getElementById('result-container');
const teacherDashboard = document.getElementById('teacher-dashboard');

const studentModeBtn = document.getElementById('student-mode-btn');
const teacherModeBtn = document.getElementById('teacher-mode-btn');
const startBtn = document.getElementById('start-btn');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const resultEl = document.getElementById('result');
const timerEl = document.getElementById('timer');
const progressBar = document.getElementById('progress-bar');
const currentQEl = document.getElementById('current-q');
const totalQsEl = document.getElementById('total-qs');
const proctorContainer = document.getElementById('proctor-container');
const proctorVideo = document.getElementById('proctor-video');
const proctorStatus = document.getElementById('proctor-status');

// --- AI Proctoring Engine ---
async function startProctoring() {
  if(!proctorContainer || !proctorVideo) return;
  
  try {
    proctorContainer.classList.remove('hidden');
    setTimeout(() => proctorContainer.classList.remove('opacity-0'), 50);
    
    proctorStatus.textContent = 'Requesting Camera...';
    proctorStatus.className = 'absolute bottom-3 right-3 text-[9px] font-mono text-amber-400 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm';
    
    proctorStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    proctorVideo.srcObject = proctorStream;
    
    proctorStatus.textContent = 'Loading AI Model...';
    if (!proctorModel) {
      proctorModel = await cocoSsd.load();
    }
    
    proctorStatus.textContent = 'Tracking Active';
    proctorStatus.className = 'absolute bottom-3 right-3 text-[9px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm';
    proctorInterval = setInterval(detectFrame, 1500);
  } catch (error) {
    showToast('Webcam access required for AI Proctoring. Verification failed.', 'error');
    handleTabSwitch(); // Penalize for rejecting camera
  }
}

async function detectFrame() {
  if(!proctorModel || !proctorVideo || proctorVideo.paused || !isQuizInProgress) return;
  
  const predictions = await proctorModel.detect(proctorVideo);
  let personCount = 0;
  let cellPhoneDetected = false;
  
  predictions.forEach(p => {
    if (p.class === 'person') personCount++;
    if (p.class === 'cell phone') cellPhoneDetected = true;
  });
  
  if (cellPhoneDetected) {
    showToast('AI ALERT: Unauthorized device (Smartphone) detected in feed.', 'error');
    handleTabSwitch(); 
  } else if (personCount > 1) {
    showToast('AI ALERT: Multiple individuals detected in evaluation zone.', 'error');
    handleTabSwitch();
  } else if (personCount === 0) {
    showToast('AI ALERT: Candidate missing from camera feed.', 'warning');
  }
}

function stopProctoring() {
  if (proctorInterval) clearInterval(proctorInterval);
  if (proctorStream) {
    proctorStream.getTracks().forEach(track => track.stop());
  }
  if(proctorVideo) proctorVideo.srcObject = null;
  if(proctorContainer) {
    proctorContainer.classList.add('opacity-0');
    setTimeout(() => proctorContainer.classList.add('hidden'), 500);
  }
}

async function initializeSettings() {
  try {
    const response = await fetch('http://localhost:3000/api/settings');
    const settings = await response.json();
    testDuration = settings.testDuration || 5;
    maxTabSwitches = settings.maxTabSwitches || 2;
    
    document.getElementById('test-duration').value = testDuration;
    document.getElementById('test-time-minutes').textContent = testDuration;
    document.getElementById('allowed-tab-switches').value = maxTabSwitches;
  } catch (error) {
    console.error('Failed processing administrative properties configurations payload.', error);
  }
}

// Global Routing Escape Operations
document.getElementById('back-to-mode-from-login').addEventListener('click', () => {
  teacherLogin.classList.add('hidden');
  modeSelection.classList.remove('hidden');
  globalHeader.classList.remove('hidden');
});
document.getElementById('back-to-mode-from-student').addEventListener('click', () => {
  formContainer.classList.add('hidden');
  modeSelection.classList.remove('hidden');
  globalHeader.classList.remove('hidden');
});
document.getElementById('back-to-mode-from-result').addEventListener('click', () => {
  resultContainer.classList.add('hidden');
  modeSelection.classList.remove('hidden');
  globalHeader.classList.remove('hidden');
});
document.getElementById('back-to-mode-from-teacher').addEventListener('click', () => {
  teacherDashboard.classList.add('hidden');
  modeSelection.classList.remove('hidden');
  globalHeader.classList.remove('hidden');
  localStorage.removeItem('teacherLoggedIn');
});

studentModeBtn.addEventListener('click', async () => {
  await loadQuestions();
  if (questions.length === 0) {
    showToast('Evaluation sets structurally empty. Access administrative dashboard to add files.', 'error');
    return;
  }
  modeSelection.classList.add('hidden');
  globalHeader.classList.add('hidden');
  formContainer.classList.remove('hidden');
});

// Active Auth Context Tracking Vector
let currentAuthMode = 'login'; 

// Interactive Auth Tab Listeners
const tabLogin = document.getElementById('auth-tab-login');
const tabSignup = document.getElementById('auth-tab-signup');
const authTitle = document.getElementById('auth-title');
const authDesc = document.getElementById('auth-desc');

tabLogin.addEventListener('click', () => toggleAuthMode('login'));
tabSignup.addEventListener('click', () => toggleAuthMode('signup'));

function toggleAuthMode(mode) {
  currentAuthMode = mode;
  if (mode === 'login') {
    tabLogin.className = "flex-1 pb-3 text-sm font-mono font-bold border-b-2 border-blue-500 text-white focus:outline-none transition-all";
    tabSignup.className = "flex-1 pb-3 text-sm font-mono font-bold border-b-2 border-transparent text-gray-500 hover:text-gray-300 focus:outline-none transition-all";
    authTitle.textContent = "Access Control Center";
    authDesc.textContent = "Mount your pre-registered Google Node context token parameters to access core telemetry dashboards.";
  } else {
    tabLogin.className = "flex-1 pb-3 text-sm font-mono font-bold border-b-2 border-transparent text-gray-500 hover:text-gray-300 focus:outline-none transition-all";
    tabSignup.className = "flex-1 pb-3 text-sm font-mono font-bold border-b-2 border-emerald-500 text-white focus:outline-none transition-all";
    authTitle.textContent = "Provision New Instructor Node";
    authDesc.textContent = "Stitch a brand new instructor authorization profile directly into the live production cloud matrix using Google OAuth2.";
  }
  // Refresh Google client rendering to map state parameters cleanly
  initializeGoogleAuth(); 
}

function initializeGoogleAuth() {
  if (typeof google === 'undefined') {
    setTimeout(initializeGoogleAuth, 100);
    return;
  }

  google.accounts.id.initialize({
    client_id: "16927821098-oab06qa24clokg9gvd5gtkropk5s13j8.apps.googleusercontent.com", // Drop your real ID here
    callback: handleGoogleCredentialPacket
  });

  google.accounts.id.renderButton(
    document.getElementById("google-auth-button"),
    { 
      theme: "filled_dark", 
      size: "large", 
      width: "280", 
      text: currentAuthMode === 'login' ? 'signin_with' : 'signup_with',
      shape: "pill" 
    }
  );
}

async function handleGoogleCredentialPacket(response) {
  try {
    // Deliver identity token along with intentional context mapping parameter
    const verificationExchange = await fetch('http://localhost:3000/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        token: response.credential,
        mode: currentAuthMode // Explicitly tell backend if we are logging in or signing up
      })
    });

    const data = await verificationExchange.json();

    if (data.success) {
      teacherLogin.classList.add('hidden');
      teacherDashboard.classList.remove('hidden');
      document.getElementById('teacher-email-display').textContent = data.email;
      
      localStorage.setItem('teacherLoggedIn', 'true');
      localStorage.setItem('teacherEmail', data.email);
      
      loadResults();
      showToast(data.message || 'Authentication sequence complete.', 'success');
    } else {
      showToast(data.error || 'Authentication matrix registration reject.', 'error');
    }
  } catch (error) {
    console.error('Google Verification Matrix Error:', error);
    showToast('Network link failure validating certificate keys.', 'error');
  }
}

// Ensure trigger initializes when entering view space
document.getElementById('teacher-mode-btn').addEventListener('click', () => {
  modeSelection.classList.add('hidden');
  globalHeader.classList.add('hidden');
  teacherLogin.classList.remove('hidden');
  toggleAuthMode('login'); // Always default state back to clear lines login sequence
});

// Fisher-Yates Shuffle Helper
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function loadQuestions() {
  try {
    const response = await fetch('http://localhost:3000/api/questions');
    let rawQuestions = await response.json();
    
    // Shuffle the main questions array
    rawQuestions = shuffleArray(rawQuestions);
    
    // Deep clone and shuffle options for each question
    questions = rawQuestions.map(q => {
      const correctOptionString = q.options[q.correct]; // Identify the actual correct string
      const shuffledOptions = shuffleArray([...q.options]); // Shuffle the options array
      const newCorrectIndex = shuffledOptions.indexOf(correctOptionString); // Find where it moved to
      
      return {
        ...q,
        options: shuffledOptions,
        correct: newCorrectIndex
      };
    });
    
    totalQsEl.textContent = questions.length;
  } catch (error) {
    showToast('Collection lookup exception failure.', 'error');
  }
}

function saveState() {
  const state = { userName, userEmail, currentQuestion, answers, tabSwitchCount, timeLeft, isQuizInProgress, startTime };
  localStorage.setItem('quizState', JSON.stringify(state));
}

startBtn.addEventListener('click', async () => {
  userName = nameInput.value.trim();
  userEmail = emailInput.value.trim();

  if (!userName || !userEmail) {
    showToast('Identity properties required.', 'error');
    return;
  }

  // Double checking duplication tracking parameters
  try {
    const checkRes = await fetch(`http://localhost:3000/api/results/check?email=${encodeURIComponent(userEmail)}`);
    const checkData = await checkRes.json();
    if (checkData.exists) {
      showToast('Log identity mapping matches baseline records database. Single token allocation enforced.', 'error');
      return;
    }
  } catch {
    showToast('Error validating uniqueness matrix constraints.', 'error');
    return;
  }

  formContainer.classList.add('hidden');
  quizContainer.classList.remove('hidden');
  startTime = new Date();
  timeLeft = testDuration * 60;
  answers = new Array(questions.length).fill(null);
  isQuizInProgress = true;

  saveState();
  enterFullscreen();
  startProctoring(); // Initialize AI Monitoring
  startTimer();
  loadQuestion();
});

function startTimer() {
  updateTimerDisplay();
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    saveState();

    if (timeLeft <= 0) {
      clearInterval(timer);
      showToast('Maximum execution processing allocation exceeded. Auto-submitting pipeline.', 'error');
      showResult();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const min = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const sec = (timeLeft % 60).toString().padStart(2, '0');
  timerEl.textContent = `${min}:${sec}`;
}

function loadQuestion() {
  if (questions.length === 0) return;

  const q = questions[currentQuestion];
  questionEl.textContent = q.question;
  optionsEl.innerHTML = '';

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  progressBar.style.width = `${progress}%`;
  currentQEl.textContent = currentQuestion + 1;

  q.options.forEach((opt, idx) => {
    const div = document.createElement('div');
    div.className = `option-card p-4 rounded-xl cursor-pointer text-sm font-mono flex items-center space-x-3 ${answers[currentQuestion] === idx ? 'option-selected' : ''}`;
    div.innerHTML = `
      <span class="w-4 h-4 rounded-full border border-cyberBorder flex items-center justify-center text-[10px] ${answers[currentQuestion] === idx ? 'bg-blue-500 border-blue-500 text-white' : 'text-gray-500'}">
        ${answers[currentQuestion] === idx ? '✓' : ''}
      </span>
      <span class="text-gray-300">${opt}</span>
    `;
    div.addEventListener('click', () => {
      answers[currentQuestion] = idx;
      saveState();
      loadQuestion();
    });
    optionsEl.appendChild(div);
  });

  prevBtn.disabled = currentQuestion === 0;
  if (currentQuestion === questions.length - 1) {
    nextBtn.classList.add('hidden');
    submitBtn.classList.remove('hidden');
  } else {
    nextBtn.classList.remove('hidden');
    submitBtn.classList.add('hidden');
  }
}

nextBtn.addEventListener('click', () => {
  if (answers[currentQuestion] === null) {
    showToast('Selection index parsing requirements missing before state incrementation.', 'warning');
    return;
  }
  currentQuestion++;
  saveState();
  loadQuestion();
});

prevBtn.addEventListener('click', () => {
  currentQuestion--;
  saveState();
  loadQuestion();
});

submitBtn.addEventListener('click', () => showResult());

async function showResult() {
  clearInterval(timer);
  isQuizInProgress = false;
  exitFullscreen();
  stopProctoring(); // Terminate AI Feed

  score = 0;
  answers.forEach((ans, idx) => {
    if (ans === questions[idx].correct) score++;
  });

  const timeSpent = startTime ? Math.floor((new Date() - startTime) / 1000) : 0;
  const minutes = Math.floor(timeSpent / 60);
  const seconds = Math.floor(timeSpent % 60);

  const studentAnswers = answers.map((answer, index) => ({
    question: questions[index].question,
    selectedOption: answer !== null ? questions[index].options[answer] : 'Unanswered Packet',
    correctOption: questions[index].options[questions[index].correct],
    isCorrect: answer === questions[index].correct
  }));

  const payload = {
    name: userName,
    email: userEmail,
    score: score,
    total: questions.length,
    percentage: Math.round((score / questions.length) * 100),
    timeSpent: `${minutes}m ${seconds}s`,
    tabSwitches: tabSwitchCount,
    completedAt: new Date().toLocaleString(),
    answers: studentAnswers
  };

  try {
    await fetch('http://localhost:3000/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showToast('Evaluation matrix metrics synchronized with database remote cloud hosts.', 'success');
  } catch (error) {
    showToast('Transaction packet storage drop failure.', 'error');
  }

  localStorage.removeItem('quizState');
  quizContainer.classList.add('hidden');
  resultContainer.classList.remove('hidden');

  resultEl.innerHTML = `
    <div class="grid grid-cols-2 gap-4 bg-cyberDark p-4 rounded-xl border border-cyberBorder max-w-sm mx-auto font-mono">
      <div>
        <div class="text-2xl font-bold text-blue-400">${score} / ${questions.length}</div>
        <div class="text-[10px] text-gray-500 uppercase mt-1">Parsed Hits</div>
      </div>
      <div>
        <div class="text-2xl font-bold text-emerald-400">${payload.percentage}%</div>
        <div class="text-[10px] text-gray-500 uppercase mt-1">Ratio Delta</div>
      </div>
    </div>
  `;
}

document.getElementById('retry-btn').addEventListener('click', () => {
  currentQuestion = 0;
  score = 0;
  answers = [];
  tabSwitchCount = 0;
  isQuizInProgress = false;
  nameInput.value = '';
  emailInput.value = '';
  resultContainer.classList.add('hidden');
  modeSelection.classList.remove('hidden');
  globalHeader.classList.remove('hidden');
});

// Admin Logic Modules
document.getElementById('save-settings').addEventListener('click', async () => {
  const duration = parseInt(document.getElementById('test-duration').value) || 5;
  const switches = parseInt(document.getElementById('allowed-tab-switches').value) || 2;

  try {
    await fetch('http://localhost:3000/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testDuration: duration, maxTabSwitches: switches, teacherEmail: localStorage.getItem('teacherEmail') })
    });
    showToast('Administrative control engine map configurations updated.', 'success');
  } catch {
    showToast('Error updating remote parameters configurations variables.', 'error');
  }
});

async function loadResults() {
  try {
    const response = await fetch('http://localhost:3000/api/results');
    const data = await response.json();
    const body = document.getElementById('results-table-body');
    
    document.getElementById('total-students').textContent = data.length;
    if(data.length > 0) {
      const p = data.map(r => r.percentage);
      document.getElementById('avg-score').textContent = `${Math.round(p.reduce((a,b)=>a+b,0)/p.length)}%`;
      document.getElementById('min-score').textContent = `${Math.min(...p)}%`;
      document.getElementById('max-score').textContent = `${Math.max(...p)}%`;
    }

    body.innerHTML = data.map(r => `
      <tr class="hover:bg-cyberCard/20 border-b border-cyberBorder/30">
        <td class="p-3">${r.name}</td>
        <td class="p-3 text-gray-400">${r.email}</td>
        <td class="p-3 text-center">${r.score}/${r.total}</td>
        <td class="p-3 text-center font-bold text-blue-400">${r.percentage}%</td>
        <td class="p-3 text-center text-gray-400">${r.timeSpent}</td>
        <td class="p-3 text-center text-red-400">${r.tabSwitches}</td>
        <td class="p-3 text-center text-gray-500 text-[10px]">${r.completedAt}</td>
        <td class="p-3 text-center"><button class="text-blue-400 underline hover:text-blue-300">View</button></td>
      </tr>
    `).join('');
  } catch {
    showToast('Error evaluating background tracking datasets matrix map records.', 'error');
  }
}

// Ingest Word Binary Pipelines File Target Listeners
const fileInput = document.getElementById('question-file');
fileInput.addEventListener('change', (e) => {
  document.getElementById('file-name').textContent = e.target.files[0]?.name || 'No document loaded';
});

document.getElementById('upload-questions').addEventListener('click', async () => {
  if(!fileInput.files.length) return showToast('Please load binary file payload source maps first.', 'warning');
  
  const fd = new FormData();
  fd.append('file', fileInput.files[0]);
  fd.append('teacherEmail', localStorage.getItem('teacherEmail'));

  try {
    const res = await fetch('http://localhost:3000/api/questions/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if(data.success) {
      showToast(`Success processing objects array collection: ${data.count} compiled entries.`, 'success');
      loadQuestions();
    }
  } catch {
    showToast('File stream payload parse transformation failure abstraction.', 'error');
  }
});

// Initialization Bootstrap Run Loop
(async function bootstrap() {
  await initializeSettings();
  const state = JSON.parse(localStorage.getItem('quizState'));
  if (state && state.isQuizInProgress) {
    userName = state.userName;
    userEmail = state.userEmail;
    currentQuestion = state.currentQuestion;
    answers = state.answers;
    tabSwitchCount = state.tabSwitchCount;
    timeLeft = state.timeLeft;
    startTime = state.startTime;
    isQuizInProgress = true;

    modeSelection.classList.add('hidden');
    globalHeader.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    startTimer();
    loadQuestion();
  }
})();