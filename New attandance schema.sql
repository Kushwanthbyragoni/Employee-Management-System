-- ─────────────────────────────────────────────────────────────────────────────
--  Employee Attendance Management System — Full SQL Schema v3
--  Run: CREATE DATABASE employee_db; then run this file.
-- ─────────────────────────────────────────────────────────────────────────────

USE employee_db;

DROP TABLE IF EXISTS leaves;
DROP TABLE IF EXISTS grievances;
DROP TABLE IF EXISTS hr_attendance;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS employees;

-- ─── Employees ───────────────────────────────────────────────────────────────
CREATE TABLE employees (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    firstName    VARCHAR(100),
    lastName     VARCHAR(100),
    empId        INT UNIQUE,
    age          INT,
    department   VARCHAR(100),
    salary       INT,
    phone        VARCHAR(20),
    email        VARCHAR(100),
    profileImage VARCHAR(255),
    joined_date  DATE DEFAULT (CURDATE())
);

-- ─── Users (login) ───────────────────────────────────────────────────────────
-- phone, email, salary, age added for HR/CEO who are not in the employees table
CREATE TABLE users (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(100) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    role         ENUM('employee','hr','ceo') NOT NULL,
    firstName    VARCHAR(100),
    lastName     VARCHAR(100),
    profileImage VARCHAR(255) DEFAULT '',
    phone        VARCHAR(20)  DEFAULT NULL,
    email        VARCHAR(100) DEFAULT NULL,
    salary       INT          DEFAULT NULL,
    age          INT          DEFAULT NULL,
    employee_id  INT DEFAULT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- ─── Attendance ──────────────────────────────────────────────────────────────
CREATE TABLE attendance (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date        DATE NOT NULL,
    check_in    TIME DEFAULT NULL,
    check_out   TIME DEFAULT NULL,
    total_hours DECIMAL(5,2) DEFAULT NULL,
    UNIQUE KEY  uq_emp_date (employee_id, date),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ─── HR Attendance ───────────────────────────────────────────────────────────
CREATE TABLE hr_attendance (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    date        DATE NOT NULL,
    check_in    TIME DEFAULT NULL,
    check_out   TIME DEFAULT NULL,
    total_hours DECIMAL(5,2) DEFAULT NULL,
    UNIQUE KEY  uq_hr_date (user_id, date)
);

-- ─── Leaves ──────────────────────────────────────────────────────────────────
CREATE TABLE leaves (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    applicant_id   INT NOT NULL,
    applicant_role ENUM('employee','hr') NOT NULL,
    employee_db_id INT DEFAULT NULL,
    applicant_name VARCHAR(200),
    leave_type     ENUM('sick','casual','earned','unpaid','other') DEFAULT 'casual',
    from_date      DATE NOT NULL,
    to_date        DATE NOT NULL,
    reason         TEXT,
    status         ENUM('pending','approved','rejected') DEFAULT 'pending',
    reviewed_by    VARCHAR(100) DEFAULT NULL,
    reviewed_at    DATETIME DEFAULT NULL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── Grievances ──────────────────────────────────────────────────────────────
CREATE TABLE grievances (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    from_name   VARCHAR(200),
    message     TEXT,
    status      ENUM('open','resolved') DEFAULT 'open',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
--  SEED: Employees (15)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO employees (firstName,lastName,empId,age,department,salary,phone,email,profileImage,joined_date) VALUES
('Arun',      'Kumar',    1001,28,'Engineering', 75000,'9876543210','arun.kumar@ems.com',    '',DATE_SUB(CURDATE(),INTERVAL 730 DAY)),
('Priya',     'Sharma',   1002,31,'Engineering', 82000,'9876543211','priya.sharma@ems.com',  '',DATE_SUB(CURDATE(),INTERVAL 600 DAY)),
('Rahul',     'Gupta',    1003,26,'HR Team',     55000,'9876543212','rahul.gupta@ems.com',   '',DATE_SUB(CURDATE(),INTERVAL 500 DAY)),
('Sneha',     'Reddy',    1004,29,'Marketing',   60000,'9876543213','sneha.reddy@ems.com',   '',DATE_SUB(CURDATE(),INTERVAL 400 DAY)),
('Vikram',    'Singh',    1005,35,'Engineering', 95000,'9876543214','vikram.singh@ems.com',  '',DATE_SUB(CURDATE(),INTERVAL 900 DAY)),
('Divya',     'Nair',     1006,27,'Finance',     68000,'9876543215','divya.nair@ems.com',    '',DATE_SUB(CURDATE(),INTERVAL 300 DAY)),
('Kiran',     'Mehta',    1007,33,'Marketing',   72000,'9876543216','kiran.mehta@ems.com',   '',DATE_SUB(CURDATE(),INTERVAL 700 DAY)),
('Ananya',    'Iyer',     1008,24,'Engineering', 65000,'9876543217','ananya.iyer@ems.com',   '',DATE_SUB(CURDATE(),INTERVAL 200 DAY)),
('Suresh',    'Patil',    1009,40,'Operations',  88000,'9876543218','suresh.patil@ems.com',  '',DATE_SUB(CURDATE(),INTERVAL 1000 DAY)),
('Kavitha',   'Rao',      1010,32,'HR Team',     58000,'9876543219','kavitha.rao@ems.com',   '',DATE_SUB(CURDATE(),INTERVAL 450 DAY)),
('Arjun',     'Patel',    1011,30,'Finance',     77000,'9876543220','arjun.patel@ems.com',   '',DATE_SUB(CURDATE(),INTERVAL 350 DAY)),
('Lakshmi',   'Menon',    1012,26,'Operations',  62000,'9876543221','lakshmi.menon@ems.com', '',DATE_SUB(CURDATE(),INTERVAL 250 DAY)),
('Ravi',      'Verma',    1013,38,'Engineering',105000,'9876543222','ravi.verma@ems.com',    '',DATE_SUB(CURDATE(),INTERVAL 1200 DAY)),
('Pooja',     'Krishnan', 1014,25,'Marketing',   56000,'9876543223','pooja.krishnan@ems.com','',DATE_SUB(CURDATE(),INTERVAL 180 DAY)),
('Siddharth', 'Joshi',    1015,29,'Finance',     79000,'9876543224','siddharth.joshi@ems.com','',DATE_SUB(CURDATE(),INTERVAL 550 DAY));

-- ─────────────────────────────────────────────────────────────────────────────
--  SEED: Users (employees)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO users (username,password,role,firstName,lastName,employee_id) VALUES
('emp001','emp123','employee','Arun',      'Kumar',    1),
('emp002','emp123','employee','Priya',     'Sharma',   2),
('emp003','emp123','employee','Rahul',     'Gupta',    3),
('emp004','emp123','employee','Sneha',     'Reddy',    4),
('emp005','emp123','employee','Vikram',    'Singh',    5),
('emp006','emp123','employee','Divya',     'Nair',     6),
('emp007','emp123','employee','Kiran',     'Mehta',    7),
('emp008','emp123','employee','Ananya',    'Iyer',     8),
('emp009','emp123','employee','Suresh',    'Patil',    9),
('emp010','emp123','employee','Kavitha',   'Rao',      10),
('emp011','emp123','employee','Arjun',     'Patel',    11),
('emp012','emp123','employee','Lakshmi',   'Menon',    12),
('emp013','emp123','employee','Ravi',      'Verma',    13),
('emp014','emp123','employee','Pooja',     'Krishnan', 14),
('emp015','emp123','employee','Siddharth', 'Joshi',    15);

-- ─── HR users — now include phone, email, salary, age ────────────────────────
INSERT INTO users (username,password,role,firstName,lastName,phone,email,salary,age,employee_id) VALUES
('hr001','hr123','hr','Meera', 'Pillai', '9876500001','meera.pillai@ems.com', 70000,34,NULL),
('hr002','hr123','hr','Deepak','Shetty', '9876500002','deepak.shetty@ems.com',68000,30,NULL);

-- ─── CEO ─────────────────────────────────────────────────────────────────────
INSERT INTO users (username,password,role,firstName,lastName,phone,email,salary,age,employee_id) VALUES
('ceo001','ceo123','ceo','Rajesh','Ambani','9876500000','rajesh.ambani@ems.com',500000,52,NULL);

-- ─────────────────────────────────────────────────────────────────────────────
--  SEED: Historical Attendance (last 14 days)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO attendance (employee_id,date,check_in,check_out,total_hours) VALUES
(1,DATE_SUB(CURDATE(),INTERVAL 13 DAY),'09:02:00','18:05:00',9.05),
(1,DATE_SUB(CURDATE(),INTERVAL 12 DAY),'09:15:00','18:00:00',8.75),
(1,DATE_SUB(CURDATE(),INTERVAL 11 DAY),'08:55:00','17:50:00',8.92),
(1,DATE_SUB(CURDATE(),INTERVAL 10 DAY),'09:30:00','18:30:00',9.00),
(1,DATE_SUB(CURDATE(),INTERVAL 9 DAY), '09:00:00','18:00:00',9.00),
(1,DATE_SUB(CURDATE(),INTERVAL 7 DAY), '09:10:00','18:10:00',9.00),
(1,DATE_SUB(CURDATE(),INTERVAL 6 DAY), '09:05:00','17:55:00',8.83),
(1,DATE_SUB(CURDATE(),INTERVAL 5 DAY), '09:00:00','18:00:00',9.00),
(1,DATE_SUB(CURDATE(),INTERVAL 4 DAY), '09:20:00','18:20:00',9.00),
(1,DATE_SUB(CURDATE(),INTERVAL 3 DAY), '08:50:00','17:50:00',9.00),
(1,DATE_SUB(CURDATE(),INTERVAL 2 DAY), '09:00:00','18:30:00',9.50),
(1,DATE_SUB(CURDATE(),INTERVAL 1 DAY), '09:15:00','18:15:00',9.00),

(2,DATE_SUB(CURDATE(),INTERVAL 13 DAY),'08:50:00','17:45:00',8.92),
(2,DATE_SUB(CURDATE(),INTERVAL 12 DAY),'09:00:00','17:30:00',8.50),
(2,DATE_SUB(CURDATE(),INTERVAL 11 DAY),'09:10:00','18:05:00',8.92),
(2,DATE_SUB(CURDATE(),INTERVAL 9 DAY), '09:00:00','18:00:00',9.00),
(2,DATE_SUB(CURDATE(),INTERVAL 7 DAY), '09:30:00','18:30:00',9.00),
(2,DATE_SUB(CURDATE(),INTERVAL 5 DAY), '09:05:00','18:00:00',8.92),
(2,DATE_SUB(CURDATE(),INTERVAL 3 DAY), '08:55:00','18:00:00',9.08),
(2,DATE_SUB(CURDATE(),INTERVAL 1 DAY), '09:15:00','17:45:00',8.50),

(3,DATE_SUB(CURDATE(),INTERVAL 11 DAY),'09:00:00','17:00:00',8.00),
(3,DATE_SUB(CURDATE(),INTERVAL 9 DAY), '09:30:00','18:30:00',9.00),
(3,DATE_SUB(CURDATE(),INTERVAL 7 DAY), '09:00:00','18:00:00',9.00),
(3,DATE_SUB(CURDATE(),INTERVAL 5 DAY), '09:10:00','18:10:00',9.00),
(3,DATE_SUB(CURDATE(),INTERVAL 2 DAY), '09:05:00','18:05:00',9.00),
(3,DATE_SUB(CURDATE(),INTERVAL 1 DAY), '09:20:00','18:20:00',9.00),

(4,DATE_SUB(CURDATE(),INTERVAL 12 DAY),'10:00:00','18:00:00',8.00),
(4,DATE_SUB(CURDATE(),INTERVAL 9 DAY), '09:15:00','18:15:00',9.00),
(4,DATE_SUB(CURDATE(),INTERVAL 7 DAY), '09:00:00','18:00:00',9.00),
(4,DATE_SUB(CURDATE(),INTERVAL 3 DAY), '09:00:00','18:30:00',9.50),
(4,DATE_SUB(CURDATE(),INTERVAL 1 DAY), '09:05:00','18:05:00',9.00),

(5,DATE_SUB(CURDATE(),INTERVAL 13 DAY),'08:30:00','19:00:00',10.50),
(5,DATE_SUB(CURDATE(),INTERVAL 12 DAY),'08:45:00','18:45:00',10.00),
(5,DATE_SUB(CURDATE(),INTERVAL 11 DAY),'09:00:00','19:00:00',10.00),
(5,DATE_SUB(CURDATE(),INTERVAL 9 DAY), '08:45:00','19:15:00',10.50),
(5,DATE_SUB(CURDATE(),INTERVAL 7 DAY), '09:00:00','19:00:00',10.00),
(5,DATE_SUB(CURDATE(),INTERVAL 5 DAY), '09:00:00','18:30:00',9.50),
(5,DATE_SUB(CURDATE(),INTERVAL 3 DAY), '09:00:00','19:00:00',10.00),
(5,DATE_SUB(CURDATE(),INTERVAL 1 DAY), '09:00:00','19:30:00',10.50),

(6,DATE_SUB(CURDATE(),INTERVAL 10 DAY),'09:15:00','18:15:00',9.00),
(6,DATE_SUB(CURDATE(),INTERVAL 7 DAY), '09:00:00','18:00:00',9.00),
(6,DATE_SUB(CURDATE(),INTERVAL 4 DAY), '09:30:00','18:00:00',8.50),
(6,DATE_SUB(CURDATE(),INTERVAL 1 DAY), '09:00:00','18:00:00',9.00),

(7,DATE_SUB(CURDATE(),INTERVAL 11 DAY),'09:00:00','17:30:00',8.50),
(7,DATE_SUB(CURDATE(),INTERVAL 9 DAY), '09:15:00','18:15:00',9.00),
(7,DATE_SUB(CURDATE(),INTERVAL 6 DAY), '09:00:00','18:00:00',9.00),
(7,DATE_SUB(CURDATE(),INTERVAL 3 DAY), '09:30:00','17:30:00',8.00),
(7,DATE_SUB(CURDATE(),INTERVAL 1 DAY), '09:00:00','18:30:00',9.50),

(8,DATE_SUB(CURDATE(),INTERVAL 12 DAY),'09:00:00','18:00:00',9.00),
(8,DATE_SUB(CURDATE(),INTERVAL 7 DAY), '09:00:00','17:00:00',8.00),
(8,DATE_SUB(CURDATE(),INTERVAL 5 DAY), '09:20:00','18:20:00',9.00),
(8,DATE_SUB(CURDATE(),INTERVAL 2 DAY), '09:00:00','18:00:00',9.00),
(8,DATE_SUB(CURDATE(),INTERVAL 1 DAY), '08:55:00','17:55:00',9.00),

(9,DATE_SUB(CURDATE(),INTERVAL 13 DAY),'08:45:00','17:45:00',9.00),
(9,DATE_SUB(CURDATE(),INTERVAL 11 DAY),'09:00:00','18:00:00',9.00),
(9,DATE_SUB(CURDATE(),INTERVAL 7 DAY), '09:00:00','17:30:00',8.50),
(9,DATE_SUB(CURDATE(),INTERVAL 5 DAY), '09:30:00','18:30:00',9.00),
(9,DATE_SUB(CURDATE(),INTERVAL 3 DAY), '09:00:00','18:00:00',9.00),
(9,DATE_SUB(CURDATE(),INTERVAL 1 DAY), '09:05:00','18:05:00',9.00),

(10,DATE_SUB(CURDATE(),INTERVAL 12 DAY),'09:30:00','18:30:00',9.00),
(10,DATE_SUB(CURDATE(),INTERVAL 8 DAY), '09:15:00','17:15:00',8.00),
(10,DATE_SUB(CURDATE(),INTERVAL 6 DAY), '09:00:00','18:30:00',9.50),
(10,DATE_SUB(CURDATE(),INTERVAL 4 DAY), '09:10:00','18:10:00',9.00),
(10,DATE_SUB(CURDATE(),INTERVAL 1 DAY), '09:20:00','18:20:00',9.00),

(11,DATE_SUB(CURDATE(),INTERVAL 13 DAY),'09:05:00','18:00:00',8.92),
(11,DATE_SUB(CURDATE(),INTERVAL 11 DAY),'09:00:00','18:05:00',9.08),
(11,DATE_SUB(CURDATE(),INTERVAL 9 DAY), '08:50:00','17:50:00',9.00),
(11,DATE_SUB(CURDATE(),INTERVAL 7 DAY), '09:15:00','18:15:00',9.00),
(11,DATE_SUB(CURDATE(),INTERVAL 5 DAY), '09:00:00','18:00:00',9.00),
(11,DATE_SUB(CURDATE(),INTERVAL 3 DAY), '09:10:00','17:40:00',8.50),
(11,DATE_SUB(CURDATE(),INTERVAL 1 DAY), '09:00:00','18:30:00',9.50),

(12,DATE_SUB(CURDATE(),INTERVAL 12 DAY),'09:20:00','18:20:00',9.00),
(12,DATE_SUB(CURDATE(),INTERVAL 10 DAY),'09:00:00','17:30:00',8.50),
(12,DATE_SUB(CURDATE(),INTERVAL 8 DAY), '09:05:00','18:05:00',9.00),
(12,DATE_SUB(CURDATE(),INTERVAL 6 DAY), '08:55:00','17:55:00',9.00),
(12,DATE_SUB(CURDATE(),INTERVAL 4 DAY), '09:30:00','18:00:00',8.50),
(12,DATE_SUB(CURDATE(),INTERVAL 2 DAY), '09:00:00','18:00:00',9.00),
(12,DATE_SUB(CURDATE(),INTERVAL 1 DAY), '09:10:00','18:10:00',9.00),

(13,DATE_SUB(CURDATE(),INTERVAL 13 DAY),'08:30:00','18:30:00',10.00),
(13,DATE_SUB(CURDATE(),INTERVAL 12 DAY),'08:45:00','19:00:00',10.25),
(13,DATE_SUB(CURDATE(),INTERVAL 11 DAY),'09:00:00','19:00:00',10.00),
(13,DATE_SUB(CURDATE(),INTERVAL 9 DAY), '08:40:00','18:40:00',10.00),
(13,DATE_SUB(CURDATE(),INTERVAL 7 DAY), '09:00:00','19:30:00',10.50),
(13,DATE_SUB(CURDATE(),INTERVAL 5 DAY), '08:50:00','18:50:00',10.00),
(13,DATE_SUB(CURDATE(),INTERVAL 3 DAY), '09:00:00','19:00:00',10.00),
(13,DATE_SUB(CURDATE(),INTERVAL 1 DAY), '08:45:00','19:15:00',10.50),

(14,DATE_SUB(CURDATE(),INTERVAL 11 DAY),'09:30:00','18:00:00',8.50),
(14,DATE_SUB(CURDATE(),INTERVAL 9 DAY), '09:00:00','18:00:00',9.00),
(14,DATE_SUB(CURDATE(),INTERVAL 7 DAY), '09:15:00','18:15:00',9.00),
(14,DATE_SUB(CURDATE(),INTERVAL 4 DAY), '09:00:00','17:30:00',8.50),
(14,DATE_SUB(CURDATE(),INTERVAL 2 DAY), '09:05:00','18:05:00',9.00),
(14,DATE_SUB(CURDATE(),INTERVAL 1 DAY), '09:20:00','18:20:00',9.00),

(15,DATE_SUB(CURDATE(),INTERVAL 13 DAY),'09:10:00','18:10:00',9.00),
(15,DATE_SUB(CURDATE(),INTERVAL 11 DAY),'09:00:00','18:30:00',9.50),
(15,DATE_SUB(CURDATE(),INTERVAL 9 DAY), '09:20:00','18:20:00',9.00),
(15,DATE_SUB(CURDATE(),INTERVAL 7 DAY), '09:00:00','18:00:00',9.00),
(15,DATE_SUB(CURDATE(),INTERVAL 5 DAY), '08:50:00','17:50:00',9.00),
(15,DATE_SUB(CURDATE(),INTERVAL 3 DAY), '09:15:00','18:45:00',9.50),
(15,DATE_SUB(CURDATE(),INTERVAL 1 DAY), '09:00:00','18:00:00',9.00);

-- ─────────────────────────────────────────────────────────────────────────────
--  Verify
-- ─────────────────────────────────────────────────────────────────────────────
SELECT 'employees'   AS tbl, COUNT(*) AS total_rows FROM employees
UNION ALL SELECT 'users',      COUNT(*) FROM users
UNION ALL SELECT 'attendance', COUNT(*) FROM attendance;

