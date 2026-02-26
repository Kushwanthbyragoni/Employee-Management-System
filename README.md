# Employee Management System

A full-stack Employee Management System designed with a clean, modern, and professional user interface. This application allows organizations to efficiently manage employee records with features for adding, updating, deleting, and viewing employee information in a structured database-driven environment.

---

## 🚀 Features

* Add new employee records with validation
* Edit and update existing employee details
* Delete employee entries securely
* Real-time form validation
* Duplicate user detection
* Responsive and user-friendly interface
* Persistent data storage using SQL database
* Organized dashboard-style layout
* System Online 

---

## 🛠️ Tech Stack

**Frontend**

* HTML5
* CSS3
* JavaScript (DOM Manipulation & Validation)

**Backend**

* Node.js


**Database**

* MySQL

**Version Control**

* Git & GitHub

---

## 📂 Project Structure

```
Employee-Management-System/
│── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
│── backend/
│   ├── server1.js
│   
│── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Kushwanthbyragoni/Employee-Management-System
cd Employee-Management-System
```

### 2️⃣ Install dependencies

```bash
npm install
npm install multer
```

### 3️⃣ Configure Database

* Create a MySQL database
* Update database credentials inside `server1.js`

Example:

```js
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "your_password",
  database: "employee_db"
});
```

### 4️⃣ Run the server

```bash
node server1.js
```

Server will start at:

```
http://localhost:5000
```

---


## 🎯 Key Highlights

* Clean and minimal UI design for better user experience
* Structured backend with Node.js integration
* SQL database connectivity for persistent storage
* Scalable architecture for future enhancements
* Can check if system online or not

---

## 🔮 Future Enhancements

* Authentication and role-based access control
* Search and filtering functionality
* Pagination for large datasets
* Deployment on cloud platforms
* Export data to CSV / Excel

---

## 👨‍💻 Author

**Kushwanth Byragoni**

---

## 📄 License

This project is created for educational and learning purposes.

---

⭐ If you found this project useful, consider giving it a star!
