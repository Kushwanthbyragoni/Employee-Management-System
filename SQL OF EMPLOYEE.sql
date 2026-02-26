USE employee_db;


CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    empId INT,
    age INT,
    department VARCHAR(100),
    salary INT,
    phone VARCHAR(20),
    email VARCHAR(100),
    profileImage VARCHAR(255)
);


SELECT * FROM employees
