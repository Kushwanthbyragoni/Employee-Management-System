/**
 * shared.js  (was shared-profile.js)
 * Shared profile modal logic for Employee, HR, and CEO dashboards.
 *
 * Expects in HTML:
 *   - <div id="selfProfileModal" ...>  (the modal overlay)
 *   - Topbar avatar: <div id="topbarAvatar" onclick="openSelfProfile()">
 *   - Topbar name/dept: #topbarName, #topbarDept
 *   - Sidebar user span: #sidebarUser
 *   - currentUser must be set before calling init
 *
 * For EMPLOYEE role: calls PUT /updateEmployee/:id
 * For HR / CEO role: calls PUT /updateUserProfile/:userId
 */

// ── Open self-profile modal ────────────────────────────────────────────────────
function openSelfProfile() {
  const u = window.currentUser;
  if (!u) return;

  document.getElementById('sp_firstName').value = u.firstName || '';
  document.getElementById('sp_lastName').value  = u.lastName  || '';
  // ✅ FIX: populate phone/email for ALL roles (was missing for HR/CEO)
  document.getElementById('sp_phone').value     = u.phone     || '';
  document.getElementById('sp_email').value     = u.email     || '';

  // Avatar preview
  const av = document.getElementById('sp_avatarPreview');
  if (u.imageUrl) {
    av.innerHTML = `<img src="${u.imageUrl}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>`;
  } else {
    av.textContent = ((u.firstName||'?')[0] + (u.lastName||'')[0]).toUpperCase();
  }

  // Clear file input
  const fi = document.getElementById('sp_imageInput');
  if (fi) fi.value = '';

  document.getElementById('selfProfileModal').classList.add('open');
}

function closeSelfProfile(e) {
  if (!e || e.target.id === 'selfProfileModal') {
    document.getElementById('selfProfileModal').classList.remove('open');
  }
}

function sp_previewAvatar(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const av = document.getElementById('sp_avatarPreview');
    av.innerHTML = `<img src="${ev.target.result}" alt="preview" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>`;
  };
  reader.readAsDataURL(file);
}

async function saveSelfProfile() {
  const u  = window.currentUser;
  const fn = document.getElementById('sp_firstName').value.trim();
  const ln = document.getElementById('sp_lastName').value.trim();
  const ph = document.getElementById('sp_phone').value.trim();
  const em = document.getElementById('sp_email').value.trim();

  if (!fn || !ln) { alert('First and last name are required.'); return; }

  const fd = new FormData();
  fd.append('firstName', fn);
  fd.append('lastName',  ln);
  // ✅ FIX: always append phone and email regardless of role
  fd.append('phone', ph);
  fd.append('email', em);

  const imgFile = document.getElementById('sp_imageInput').files[0];
  if (imgFile) fd.append('profileImage', imgFile);

  let endpoint = '';
  if (u.role === 'employee') {
    // Employees: update the employees table row
    fd.append('empId',      u.empId      || '');
    fd.append('age',        u.age        || '');
    fd.append('department', u.department || '');
    fd.append('salary',     u.salary     || '');
    endpoint = `http://localhost:5000/updateEmployee/${u.id}`;
  } else {
    // HR / CEO: update the users table row
    // phone and email are already appended above
    endpoint = `http://localhost:5000/updateUserProfile/${u.userId}`;
  }

  try {
    const res  = await fetch(endpoint, { method: 'PUT', body: fd });
    const data = await res.json();

    if (!res.ok) { alert(data.message || data.error || 'Save failed.'); return; }

    // ✅ FIX: update phone/email for ALL roles (was only done for employee)
    u.firstName = fn;
    u.lastName  = ln;
    u.phone     = ph;
    u.email     = em;

    if (data.imageUrl) {
      u.imageUrl = 'http://localhost:5000' + data.imageUrl;
    }

    window.currentUser = u;
    sessionStorage.setItem('user', JSON.stringify(u));

    // Refresh all topbar/sidebar user displays
    updateTopbarUser();
    const su = document.getElementById('sidebarUser');
    if (su) su.textContent = fn + ' ' + ln;

    document.getElementById('selfProfileModal').classList.remove('open');
    if (typeof showToast === 'function') showToast('Profile updated successfully!');

    // If employee dashboard, reload directory so photo shows to others
    if (typeof loadEmployees === 'function') loadEmployees();

  } catch(e) {
    alert('Could not save profile. Make sure the server is running.');
  }
}

// Update topbar avatar + name + dept
function updateTopbarUser() {
  const u = window.currentUser;
  if (!u) return;

  const nameEl = document.getElementById('topbarName');
  const deptEl = document.getElementById('topbarDept');
  const avEl   = document.getElementById('topbarAvatar');

  if (nameEl) nameEl.textContent = (u.firstName || '') + ' ' + (u.lastName || '');
  if (deptEl) {
    const deptLabel = u.role === 'hr' ? 'Human Resources' : u.role === 'ceo' ? 'Chief Executive Officer' : (u.department || 'Employee');
    deptEl.textContent = deptLabel;
  }
  if (avEl) {
    if (u.imageUrl) {
      avEl.innerHTML = `<img src="${u.imageUrl}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>`;
    } else {
      avEl.textContent = ((u.firstName || '?')[0] + (u.lastName || '')[0]).toUpperCase();
    }
  }
}