// ✅ Global variables — accessible everywhere
let employees = [];
let selectedEmployeeId = -1;
let selectedEmployee = {};

document.addEventListener("DOMContentLoaded", () => {

    const employeeList = document.getElementById("employeeList");
    const employeeInfo = document.getElementById("employeeInfo");
    const empCount     = document.getElementById("empCount");

    const createEmployeeBtn = document.querySelector(".header .createEmployee, .btn-add.createEmployee");
    const addEmployeeModal  = document.querySelector(".addEmployee");
    const addEmployeeForm   = document.getElementById("employeeForm");

    // ✅ Update employee count in topbar
    function updateCount() {
        if (empCount) empCount.textContent = `${employees.length} employee${employees.length !== 1 ? "s" : ""}`;
    }

    // ✅ Load employees from DB when page opens
    async function loadEmployees() {
        try {
            const res  = await fetch("http://localhost:5000/getEmployees");
            const data = await res.json();

            employees = data.map(emp => ({
                id:       emp.id,
                firstName:emp.firstName,
                lastName: emp.lastName,
                empId:    emp.empId,
                age:      emp.age,
                department: emp.department,
                salary:   emp.salary,
                phone:    emp.phone,
                email:    emp.email,
                imageUrl: emp.profileImage ? "http://localhost:5000" + emp.profileImage : ""
            }));

            renderEmployees();
            updateCount();
        } catch (err) {
            console.error("Could not load employees:", err);
        }
    }

    loadEmployees();

    /*    OPEN MODAL    */
    createEmployeeBtn.addEventListener("click", () => {
        addEmployeeModal.style.display = "flex";
    });

    /*    CLOSE MODAL    */
    addEmployeeModal.addEventListener("click", (e) => {
        if (e.target.classList.contains("addEmployee")) {
            addEmployeeModal.style.display = "none";
        }
    });

    /*    SUBMIT FORM    */
    addEmployeeForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(addEmployeeForm);
        const values   = Object.fromEntries(formData.entries());

        const valid =
            validateText("firstName", "firstNameError") &&
            validateText("lastName",  "lastNameError")  &&
            validateText("department","departmentError") &&
            validatePhone() &&
            validateEmail();

        if (!valid) return;
        if (!validateEmpId()) return;

        const imageFile = formData.get("profileImage");

        const sendData = new FormData();
        sendData.append("firstName",  values.firstName);
        sendData.append("lastName",   values.lastName);
        sendData.append("empId",      values.empId);
        sendData.append("age",        values.age);
        sendData.append("department", values.department);
        sendData.append("salary",     values.salary);
        sendData.append("phone",      values.phone);
        sendData.append("email",      values.email);
        if (imageFile && imageFile.size > 0) {
            sendData.append("profileImage", imageFile);
        }

        try {
            const response = await fetch("http://localhost:5000/addEmployee", {
                method: "POST",
                body:   sendData
            });

            const result = await response.json();
            console.log("Server response:", result);

            const newEmployee = {
                id:         result.id,
                firstName:  values.firstName,
                lastName:   values.lastName,
                empId:      values.empId,
                age:        values.age,
                department: values.department,
                salary:     values.salary,
                phone:      values.phone,
                email:      values.email,
                imageUrl:   result.imageUrl ? "http://localhost:5000" + result.imageUrl : ""
            };

            employees.push(newEmployee);
            selectedEmployeeId = newEmployee.id;
            selectedEmployee   = newEmployee;

            renderEmployees();
            renderSingleEmployee();
            updateCount();

            addEmployeeForm.reset();
            addEmployeeModal.style.display = "none";

        } catch (err) {
            console.error("Failed to save employee:", err);
            alert("Could not connect to server. Make sure node server1.js is running!");
        }
    });

    /*    CLICK LIST    */
    employeeList.addEventListener("click", async (e) => {

        const item = e.target.closest(".employees__names--item");
        if (!item) return;

        const id = Number(item.id);

        // DELETE
        if (e.target.classList.contains("delete-btn")) {
            if (!confirm("Remove this employee?")) return;
            try {
                await fetch(`http://localhost:5000/deleteEmployee/${id}`, { method: "DELETE" });
            } catch (err) {
                console.error("Delete failed:", err);
            }

            employees = employees.filter(emp => emp.id !== id);

            if (selectedEmployeeId === id) {
                selectedEmployeeId = -1;
                selectedEmployee   = {};
            }

            renderEmployees();
            renderSingleEmployee();
            updateCount();
            return;
        }

        // EDIT button in list
        if (e.target.classList.contains("edit-btn")) {
            selectedEmployeeId = id;
            selectedEmployee   = employees.find(emp => emp.id === id);
            openEditModal();
            return;
        }

        // SELECT
        selectedEmployeeId = id;
        selectedEmployee   = employees.find(emp => emp.id === id);
        renderEmployees();
        renderSingleEmployee();
    });

    /*    RENDER LIST    */
    function renderEmployees() {

        employeeList.innerHTML = "";

        if (employees.length === 0) {
            employeeList.innerHTML = `<div style="padding:20px;text-align:center;color:#94a3b8;font-size:0.85rem;">No employees yet.<br>Click <b>Add Employee</b> to get started.</div>`;
            return;
        }

        employees.forEach(emp => {
            const span = document.createElement("div");
            span.className = "employees__names--item";
            span.id = emp.id;

            if (emp.id === selectedEmployeeId) {
                span.classList.add("selected");
                selectedEmployee = emp;
            }

            // Initials avatar fallback
            const initials = `${emp.firstName[0] || ""}${emp.lastName[0] || ""}`.toUpperCase();

            span.innerHTML = `
                <span class="emp-name">${emp.firstName} ${emp.lastName}
                    <span style="font-size:0.72rem;color:#94a3b8;font-weight:400;display:block;">ID: ${emp.empId} · ${emp.department || "—"}</span>
                </span>
                <span class="emp-actions">
                    <span class="edit-btn" title="Edit">✏️</span>
                    <span class="delete-btn" title="Delete">❌</span>
                </span>
            `;

            employeeList.appendChild(span);
        });
    }

    /*    RENDER SINGLE — Professional Profile Card    */
    function renderSingleEmployee() {

        if (selectedEmployeeId === -1) {
            employeeInfo.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state__icon">👤</div>
                    <p>Select an employee to view their profile</p>
                </div>`;
            return;
        }

        const emp      = selectedEmployee;
        const initials = `${emp.firstName[0] || ""}${emp.lastName[0] || ""}`.toUpperCase();
        const avatar   = emp.imageUrl
            ? `<img class="profile-card__avatar" src="${emp.imageUrl}" alt="${emp.firstName}" />`
            : `<div class="profile-card__avatar--placeholder">${initials}</div>`;

        employeeInfo.innerHTML = `
            <div class="profile-card">
                <div class="profile-card__top">
                    ${avatar}
                    <div>
                        <div class="profile-card__name">${emp.firstName} ${emp.lastName}</div>
                        <span class="profile-card__dept">${emp.department || "No Department"}</span>
                    </div>
                </div>
                <div class="profile-card__grid">
                    <div class="profile-card__field">
                        <span class="profile-card__field--label">Employee ID</span>
                        <span class="profile-card__field--value">#${emp.empId}</span>
                    </div>
                    <div class="profile-card__field">
                        <span class="profile-card__field--label">Age</span>
                        <span class="profile-card__field--value">${emp.age} years</span>
                    </div>
                    <div class="profile-card__field">
                        <span class="profile-card__field--label">Salary</span>
                        <span class="profile-card__field--value salary">₹${Number(emp.salary).toLocaleString("en-IN")}</span>
                    </div>
                    <div class="profile-card__field">
                        <span class="profile-card__field--label">Phone</span>
                        <span class="profile-card__field--value">${emp.phone}</span>
                    </div>
                    <div class="profile-card__field" style="grid-column: 1 / -1;">
                        <span class="profile-card__field--label">Email</span>
                        <span class="profile-card__field--value">${emp.email}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== VALIDATION =====
    const textRegex  = /^[A-Za-z\s]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validateEmpId(currentId = null) {
        const value = document.getElementById("empId").value.trim();
        if (!value) { clearError("empIdError"); return true; }
        if (employees.some(emp => emp.empId == value && emp.id !== currentId)) {
            showError("empIdError", "Employee ID already exists");
            return false;
        }
        clearError("empIdError");
        return true;
    }

    function showError(id, msg) { document.getElementById(id).textContent = msg; }
    function clearError(id)     { document.getElementById(id).textContent = ""; }

    function validateText(fieldId, errorId) {
        const value = document.getElementById(fieldId).value.trim();
        if (!textRegex.test(value)) { showError(errorId, "Only letters allowed"); return false; }
        clearError(errorId);
        return true;
    }

    function validatePhone() {
        const value = document.getElementById("phone").value.trim();
        if (!phoneRegex.test(value)) { showError("phoneError", "Enter 10 digit number"); return false; }
        clearError("phoneError");
        return true;
    }

    function validateEmail() {
        const value = document.getElementById("email").value.trim();
        if (!emailRegex.test(value)) { showError("emailError", "Invalid email"); return false; }
        clearError("emailError");
        return true;
    }

    document.getElementById("firstName") .addEventListener("input", () => validateText("firstName",  "firstNameError"));
    document.getElementById("lastName")  .addEventListener("input", () => validateText("lastName",   "lastNameError"));
    document.getElementById("department").addEventListener("input", () => validateText("department", "departmentError"));
    document.getElementById("phone")     .addEventListener("input", validatePhone);
    document.getElementById("email")     .addEventListener("input", validateEmail);
    document.getElementById("empId")     .addEventListener("input", () => validateEmpId());

    // ✅ Edit form submit
    document.getElementById("editForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const sendData = new FormData();
        sendData.append("firstName",  document.getElementById("edit_firstName").value);
        sendData.append("lastName",   document.getElementById("edit_lastName").value);
        sendData.append("empId",      document.getElementById("edit_empId").value);
        sendData.append("age",        document.getElementById("edit_age").value);
        sendData.append("department", document.getElementById("edit_department").value);
        sendData.append("salary",     document.getElementById("edit_salary").value);
        sendData.append("phone",      document.getElementById("edit_phone").value);
        sendData.append("email",      document.getElementById("edit_email").value);

        const imageFile = document.getElementById("edit_image").files[0];
        if (imageFile) sendData.append("profileImage", imageFile);

        try {
            const response = await fetch(`http://localhost:5000/updateEmployee/${selectedEmployeeId}`, {
                method: "PUT",
                body:   sendData
            });

            const result = await response.json();
            console.log("Update response:", result);

            const index = employees.findIndex(emp => emp.id === selectedEmployeeId);
            if (index !== -1) {
                employees[index] = {
                    ...employees[index],
                    firstName:  document.getElementById("edit_firstName").value,
                    lastName:   document.getElementById("edit_lastName").value,
                    empId:      document.getElementById("edit_empId").value,
                    age:        document.getElementById("edit_age").value,
                    department: document.getElementById("edit_department").value,
                    salary:     document.getElementById("edit_salary").value,
                    phone:      document.getElementById("edit_phone").value,
                    email:      document.getElementById("edit_email").value,
                    imageUrl:   result.imageUrl ? "http://localhost:5000" + result.imageUrl : employees[index].imageUrl
                };
                selectedEmployee = employees[index];
            }

            renderEmployees();
            renderSingleEmployee();
            closeEditModal();

        } catch (err) {
            console.error("Update failed:", err);
            alert("Could not update. Make sure server is running!");
        }
    });

});

// ✅ Global — accessible from onclick
function openEditModal() {
    document.getElementById("edit_firstName").value  = selectedEmployee.firstName;
    document.getElementById("edit_lastName").value   = selectedEmployee.lastName;
    document.getElementById("edit_empId").value      = selectedEmployee.empId;
    document.getElementById("edit_age").value        = selectedEmployee.age;
    document.getElementById("edit_department").value = selectedEmployee.department;
    document.getElementById("edit_salary").value     = selectedEmployee.salary;
    document.getElementById("edit_phone").value      = selectedEmployee.phone;
    document.getElementById("edit_email").value      = selectedEmployee.email;
    document.getElementById("editModal").style.display = "flex";
}

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
}

// Block numbers in text fields
function allowOnlyLetters(e) {
    const char = String.fromCharCode(e.which);
    if (!/[A-Za-z\s]/.test(char)) e.preventDefault();
}