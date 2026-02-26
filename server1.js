const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());

// ✅ Serve uploaded images as static files
app.use("/uploads", express.static("uploads"));

// ✅ Multer config — saves images to /uploads folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "kushwanth*22",
    database: "employee_db"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed", err);
    } else {
        console.log("Connected to MySQL ✅");
    }
});

// ✅ Add Employee — multer handles body + file together
// No express.json() needed here — multer parses both text fields and file
app.post("/addEmployee", upload.single("profileImage"), (req, res) => {

    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const { firstName, lastName, empId, age, department, salary, phone, email } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const sql = `
        INSERT INTO employees 
        (firstName, lastName, empId, age, department, salary, phone, email, profileImage)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [firstName, lastName, empId, age, department, salary, phone, email, imageUrl],
        (err, result) => {
            if (err) {
                console.error("Insert error:", err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Employee Added", id: result.insertId, imageUrl });
        }
    );
});

// ✅ Get All Employees
app.get("/getEmployees", (req, res) => {
    db.query("SELECT * FROM employees", (err, results) => {
        if (err) {
            console.error("Fetch error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// ✅ Delete Employee
app.delete("/deleteEmployee/:id", (req, res) => {
    db.query("DELETE FROM employees WHERE id = ?", [req.params.id], (err) => {
        if (err) {
            console.error("Delete error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.send("Deleted");
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000 🚀");
});

// ✅ Update Employee
app.put("/updateEmployee/:id", upload.single("profileImage"), (req, res) => {
    const { firstName, lastName, empId, age, department, salary, phone, email } = req.body;
    const id = req.params.id;

    let sql;
    let params;

    if (req.file) {
        // If new image uploaded
        const imageUrl = `/uploads/${req.file.filename}`;
        sql = `UPDATE employees SET firstName=?, lastName=?, empId=?, age=?, department=?, salary=?, phone=?, email=?, profileImage=? WHERE id=?`;
        params = [firstName, lastName, empId, age, department, salary, phone, email, imageUrl, id];
    } else {
        // No new image
        sql = `UPDATE employees SET firstName=?, lastName=?, empId=?, age=?, department=?, salary=?, phone=?, email=? WHERE id=?`;
        params = [firstName, lastName, empId, age, department, salary, phone, email, id];
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("Update error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Employee Updated", imageUrl: req.file ? `/uploads/${req.file.filename}` : null });
    });
});