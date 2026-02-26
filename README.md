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
│
│── package.json
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
* Update database credentials inside `database.js`

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

## 📸 Screenshots

(Add your project screenshots here)

```
![Dashboard](screenshots/dashboard.png)<img width="460" height="400" alt="image" src="https://github.com/user-attachments/assets/fda585b5-650c-4b31-a116-ffe663e5e875" />
<img width="1919" height="983" alt="Screenshot 2026-02-26 184429" src="https://github.com/user-attachments/assets/8672cf10-fe4e-474a-a1dc-74c7af15f91b" />
<img width="1718" height="911" alt="Screenshot 2026-02-26 184440" src="https://github.com/user-attachments/assets/9948581c-8734-40e8-a6d9-f253d2e39879" />

![Form](screenshots/form.png)
```

---

## 🎯 Key Highlights

* Clean and minimal UI design for better user experience
* Structured backend with REST API integration
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
