// server.js — Employee Attendance Management System Backend v3
const express = require("express");
const mysql   = require("mysql2");
const cors    = require("cors");
const multer  = require("multer");
const path    = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ─── Multer ───────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ─── DB Connection ────────────────────────────────────────────────────────────
const db = mysql.createConnection({
  host:        "localhost",
  user:        "root",
  password:    "kushwanth*22",   // <-  MySQL password
  database:    "employee_db",
  timezone:    "+05:30",          // MySQL interprets DATETIME values in IST
  dateStrings: true               // CRITICAL FIX: return DATE columns as plain strings
                                  // not JS Date objects. Without this, mysql2 returns
                                  // Date objects at UTC midnight which shifts the date
                                  // back by 1 day for IST users (UTC+5:30).
});

db.connect(err => {
  if (err) { console.error("DB connection failed:", err); process.exit(1); }
  console.log("Connected to MySQL");

  // ✅ FIX: Ensure all required columns exist in the users table.
  // This runs safely on every server start — IF NOT EXISTS means no errors
  // if the column already exists.
  db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profileImage VARCHAR(255) DEFAULT ''`, () => {});
  db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL`, () => {});
  db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(150) DEFAULT NULL`, () => {});
  db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS age INT DEFAULT NULL`, () => {});
  db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS salary DECIMAL(10,2) DEFAULT NULL`, () => {});
  db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT NULL`, () => {});
});

// Helper
function query(sql, params = []) {
  return new Promise((res, rej) =>
    db.query(sql, params, (err, result) => err ? rej(err) : res(result))
  );
}

// Returns today YYYY-MM-DD in IST using Intl (reliable, no locale dependency)
function todayIST() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).formatToParts(new Date());
  const y = parts.find(p => p.type === "year").value;
  const m = parts.find(p => p.type === "month").value;
  const d = parts.find(p => p.type === "day").value;
  return `${y}-${m}-${d}`;
}

// Returns current time HH:MM:SS in IST (24-hour)
function nowTimeIST() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  }).formatToParts(new Date());
  return parts.filter(p => ["hour","minute","second"].includes(p.type)).map(p => p.value).join(":");
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: "Missing credentials." });

  try {
    const rows = await query("SELECT * FROM users WHERE username = ?", [username]);
    if (!rows.length)
      return res.status(401).json({ success: false, message: "Invalid username or password." });

    const user = rows[0];
    if (password !== user.password)
      return res.status(401).json({ success: false, message: "Invalid username or password." });

    // For employee role: also fetch their employee record
    let empRecord = null;
    if (user.role === "employee" && user.employee_id) {
      const empRows = await query("SELECT * FROM employees WHERE id = ?", [user.employee_id]);
      if (empRows.length) empRecord = empRows[0];
    }

    // Determine profile image:
    // Employees: use employees.profileImage
    // HR/CEO:    use users.profileImage
    let profileImage = "";
    if (empRecord && empRecord.profileImage) {
      profileImage = empRecord.profileImage;
    } else if (user.profileImage) {
      profileImage = user.profileImage;
    }

    res.json({
      success: true,
      user: {
        id:          empRecord ? empRecord.id    : user.id,
        userId:      user.id,                       // always the users table id
        username:    user.username,
        role:        user.role,
        firstName:   empRecord ? empRecord.firstName  : user.firstName,
        lastName:    empRecord ? empRecord.lastName   : user.lastName,
        empId:       empRecord ? empRecord.empId      : null,
        department:  empRecord ? empRecord.department : null,
        age:         empRecord ? empRecord.age        : null,
        // ✅ FIX: for HR/CEO, read phone/email from users table directly
        phone:       empRecord ? empRecord.phone  : (user.phone  || null),
        email:       empRecord ? empRecord.email  : (user.email  || null),
        salary:      empRecord ? empRecord.salary     : null,
        imageUrl:    profileImage ? "http://localhost:5000" + profileImage : null
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── ADD USER (HR creates login for new employee) ────────────────────────────
app.post("/addUser", async (req, res) => {
  const { username, password, role, firstName, lastName, employee_id } = req.body;
  try {
    const existing = await query("SELECT id FROM users WHERE username = ?", [username]);
    if (existing.length)
      return res.status(409).json({ success: false, message: "Username already exists." });
    await query(
      "INSERT INTO users (username, password, role, firstName, lastName, employee_id) VALUES (?,?,?,?,?,?)",
      [username, password, role || "employee", firstName, lastName, employee_id || null]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ─── UPDATE USER PROFILE (HR / CEO — stored in users table) ─────────────────
// ✅ FIX: now correctly saves phone and email to the users table
app.put("/updateUserProfile/:userId", upload.single("profileImage"), async (req, res) => {
  const { firstName, lastName, phone, email, salary, age } = req.body;
  const userId = req.params.userId;
  try {
    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      await query(
        "UPDATE users SET firstName=?, lastName=?, phone=?, email=?, salary=?, age=?, profileImage=? WHERE id=?",
        [firstName, lastName, phone||null, email||null, salary||null, age||null, imageUrl, userId]
      );
      res.json({ success: true, imageUrl });
    } else {
      await query(
        "UPDATE users SET firstName=?, lastName=?, phone=?, email=?, salary=?, age=? WHERE id=?",
        [firstName, lastName, phone||null, email||null, salary||null, age||null, userId]
      );
      res.json({ success: true, imageUrl: null });
    }
  } catch (err) {
    console.error("Update user profile error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET USER PHOTO (for directory display of HR/CEO) ────────────────────────
app.get("/user/:userId", async (req, res) => {
  try {
    const rows = await query(
      "SELECT id, firstName, lastName, role, profileImage FROM users WHERE id=?",
      [req.params.userId]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── EMPLOYEES ───────────────────────────────────────────────────────────────
app.get("/getEmployees", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM employees ORDER BY id DESC");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/addEmployee", upload.single("profileImage"), async (req, res) => {
  const { firstName, lastName, empId, age, department, salary, phone, email } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
  try {
    const result = await query(
      `INSERT INTO employees (firstName,lastName,empId,age,department,salary,phone,email,profileImage)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [firstName, lastName, empId, age||null, department, salary||null, phone, email, imageUrl]
    );
    res.json({ message: "Employee Added", id: result.insertId, imageUrl });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/updateEmployee/:id", upload.single("profileImage"), async (req, res) => {
  const { firstName, lastName, empId, age, department, salary, phone, email } = req.body;
  const id = req.params.id;
  try {
    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      await query(
        `UPDATE employees SET firstName=?,lastName=?,empId=?,age=?,department=?,salary=?,phone=?,email=?,profileImage=? WHERE id=?`,
        [firstName, lastName, empId, age, department, salary, phone, email, imageUrl, id]
      );
      // Also sync the users table profileImage for this employee
      await query(
        `UPDATE users SET profileImage=? WHERE employee_id=?`,
        [imageUrl, id]
      );
      res.json({ message: "Updated", imageUrl });
    } else {
      await query(
        `UPDATE employees SET firstName=?,lastName=?,empId=?,age=?,department=?,salary=?,phone=?,email=? WHERE id=?`,
        [firstName, lastName, empId, age, department, salary, phone, email, id]
      );
      res.json({ message: "Updated", imageUrl: null });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/deleteEmployee/:id", async (req, res) => {
  try {
    await query("DELETE FROM employees WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
app.post("/attendance/checkin", async (req, res) => {
  const { employee_id } = req.body;
  const today = todayIST();
  const now   = nowTimeIST();
  try {
    const existing = await query(
      "SELECT * FROM attendance WHERE employee_id = ? AND date = ?",
      [employee_id, today]
    );
    if (existing.length)
      return res.status(400).json({ success: false, message: "Already checked in today." });
    await query(
      "INSERT INTO attendance (employee_id, date, check_in) VALUES (?, ?, ?)",
      [employee_id, today, now]
    );
    res.json({ success: true, time: now, date: today });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/attendance/checkout", async (req, res) => {
  const { employee_id } = req.body;
  const today = todayIST();
  const now   = nowTimeIST();
  try {
    const rows = await query(
      "SELECT * FROM attendance WHERE employee_id = ? AND date = ?",
      [employee_id, today]
    );
    if (!rows.length || !rows[0].check_in)
      return res.status(400).json({ success: false, message: "Not checked in today." });
    if (rows[0].check_out)
      return res.status(400).json({ success: false, message: "Already checked out." });

    const [ih, im, is_] = rows[0].check_in.split(":").map(Number);
    const [oh, om, os]  = now.split(":").map(Number);
    const totalH = Math.max(0, parseFloat((((oh*3600+om*60+os)-(ih*3600+im*60+is_))/3600).toFixed(2)));

    await query(
      "UPDATE attendance SET check_out=?, total_hours=? WHERE employee_id=? AND date=?",
      [now, totalH, employee_id, today]
    );
    res.json({ success: true, time: now, total_hours: totalH });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/attendance/today/:employee_id", async (req, res) => {
  const today = todayIST();
  try {
    const rows = await query(
      "SELECT * FROM attendance WHERE employee_id=? AND date=?",
      [req.params.employee_id, today]
    );
    res.json(rows[0] || null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/attendance/employee/:employee_id", async (req, res) => {
  try {
    const rows = await query(
      "SELECT * FROM attendance WHERE employee_id=? ORDER BY date DESC",
      [req.params.employee_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/attendance/all", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM attendance ORDER BY date DESC, check_in DESC");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── HR ATTENDANCE (stored in hr_attendance table) ────────────────────────────
// HR users are not in the employees table, so we track their attendance separately.

app.post("/hr/attendance/checkin", async (req, res) => {
  const { user_id } = req.body;
  const today = todayIST();
  const now   = nowTimeIST();
  try {
    await query(`CREATE TABLE IF NOT EXISTS hr_attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      date DATE NOT NULL,
      check_in TIME DEFAULT NULL,
      check_out TIME DEFAULT NULL,
      total_hours DECIMAL(5,2) DEFAULT NULL,
      UNIQUE KEY uq_hr_date (user_id, date)
    )`);
    const existing = await query("SELECT * FROM hr_attendance WHERE user_id=? AND date=?", [user_id, today]);
    if (existing.length)
      return res.status(400).json({ success: false, message: "Already checked in today." });
    await query("INSERT INTO hr_attendance (user_id, date, check_in) VALUES (?,?,?)", [user_id, today, now]);
    res.json({ success: true, time: now, date: today });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post("/hr/attendance/checkout", async (req, res) => {
  const { user_id } = req.body;
  const today = todayIST();
  const now   = nowTimeIST();
  try {
    const rows = await query("SELECT * FROM hr_attendance WHERE user_id=? AND date=?", [user_id, today]);
    if (!rows.length || !rows[0].check_in)
      return res.status(400).json({ success: false, message: "Not checked in today." });
    if (rows[0].check_out)
      return res.status(400).json({ success: false, message: "Already checked out." });
    const [ih, im, is_] = rows[0].check_in.split(":").map(Number);
    const [oh, om, os]  = now.split(":").map(Number);
    const totalH = Math.max(0, parseFloat((((oh*3600+om*60+os)-(ih*3600+im*60+is_))/3600).toFixed(2)));
    await query("UPDATE hr_attendance SET check_out=?, total_hours=? WHERE user_id=? AND date=?", [now, totalH, user_id, today]);
    res.json({ success: true, time: now, total_hours: totalH });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get("/hr/attendance/today/:user_id", async (req, res) => {
  const today = todayIST();
  try {
    await query(`CREATE TABLE IF NOT EXISTS hr_attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      date DATE NOT NULL,
      check_in TIME DEFAULT NULL,
      check_out TIME DEFAULT NULL,
      total_hours DECIMAL(5,2) DEFAULT NULL,
      UNIQUE KEY uq_hr_date (user_id, date)
    )`);
    const rows = await query("SELECT * FROM hr_attendance WHERE user_id=? AND date=?", [req.params.user_id, today]);
    res.json(rows[0] || null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/hr/attendance/history/:user_id", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM hr_attendance WHERE user_id=? ORDER BY date DESC", [req.params.user_id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/hr/attendance/all", async (req, res) => {
  try {
    await query(`CREATE TABLE IF NOT EXISTS hr_attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      date DATE NOT NULL,
      check_in TIME DEFAULT NULL,
      check_out TIME DEFAULT NULL,
      total_hours DECIMAL(5,2) DEFAULT NULL,
      UNIQUE KEY uq_hr_date (user_id, date)
    )`);
    const rows = await query(`
      SELECT ha.*, u.firstName, u.lastName, u.username
      FROM hr_attendance ha
      LEFT JOIN users u ON u.id = ha.user_id
      ORDER BY ha.date DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── GET ALL HR USERS (CEO uses this to know who is absent) ──────────────────
// Returns every user with role='hr' including all profile fields
app.get("/hr/users", async (req, res) => {
  try {
    const rows = await query(
      "SELECT id, firstName, lastName, username, profileImage, phone, email, salary, age FROM users WHERE role = 'hr' ORDER BY id"
    );
    const numbered = rows.map((u, i) => ({ ...u, hr_number: i + 1 }));
    res.json(numbered);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete an HR user from the users table (CEO only action)
app.delete("/hr/user/:id", async (req, res) => {
  try {
    await query("DELETE FROM users WHERE id = ? AND role = 'hr'", [req.params.id]);
    res.json({ message: "HR user deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── LEAVES ───────────────────────────────────────────────────────────────────
// Leaves can be applied by employees and HR.
// Employee leaves → approved/rejected by HR or CEO.
// HR leaves       → approved/rejected by CEO only.

const ensureLeavesTable = () => query(`
  CREATE TABLE IF NOT EXISTS leaves (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    applicant_id INT NOT NULL,           -- users.id of the person applying
    applicant_role ENUM('employee','hr') NOT NULL,
    employee_db_id INT DEFAULT NULL,     -- employees.id (for employee role)
    applicant_name VARCHAR(200),
    leave_type   ENUM('sick','casual','earned','unpaid','other') DEFAULT 'casual',
    from_date    DATE NOT NULL,
    to_date      DATE NOT NULL,
    reason       TEXT,
    status       ENUM('pending','approved','rejected') DEFAULT 'pending',
    reviewed_by  VARCHAR(100) DEFAULT NULL,
    reviewed_at  DATETIME DEFAULT NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Apply for leave
app.post("/leaves/apply", async (req, res) => {
  await ensureLeavesTable();
  const { applicant_id, applicant_role, employee_db_id, applicant_name, leave_type, from_date, to_date, reason } = req.body;
  try {
    const result = await query(
      `INSERT INTO leaves (applicant_id, applicant_role, employee_db_id, applicant_name, leave_type, from_date, to_date, reason)
       VALUES (?,?,?,?,?,?,?,?)`,
      [applicant_id, applicant_role, employee_db_id || null, applicant_name, leave_type || 'casual', from_date, to_date, reason]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Get leaves for a specific applicant
app.get("/leaves/mine/:applicant_id", async (req, res) => {
  await ensureLeavesTable();
  try {
    const rows = await query("SELECT * FROM leaves WHERE applicant_id=? ORDER BY created_at DESC", [req.params.applicant_id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get all employee leaves (for HR — only employee role)
app.get("/leaves/employees", async (req, res) => {
  await ensureLeavesTable();
  try {
    const rows = await query("SELECT * FROM leaves WHERE applicant_role='employee' ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get all leaves (for CEO — both employee and hr)
app.get("/leaves/all", async (req, res) => {
  await ensureLeavesTable();
  try {
    const rows = await query("SELECT * FROM leaves ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Review a leave (approve/reject)
app.put("/leaves/review/:id", async (req, res) => {
  const { status, reviewed_by } = req.body; // status: 'approved' | 'rejected'
  try {
    await query(
      "UPDATE leaves SET status=?, reviewed_by=?, reviewed_at=NOW() WHERE id=?",
      [status, reviewed_by, req.params.id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));