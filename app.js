const apiUrl = 'http://localhost:3000';  // This is where your local server will run

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const taskForm = document.getElementById('task-form');

    loginForm.addEventListener('submit', loginUser);
    taskForm.addEventListener('submit', assignTask);

    checkAuth();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        fetch(`${apiUrl}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json())
          .then(data => {
              if (data.role === 'admin') {
                  showPage('admin-dashboard');
                  loadEmployees();
              } else if (data.role === 'employee') {
                  showPage('employee-dashboard');
                  loadTasks();
              }
          });
    } else {
        showPage('login-page');
    }
}

function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    }).then(res => res.json())
      .then(data => {
          if (data.token) {
              localStorage.setItem('token', data.token);
              checkAuth();
          } else {
              document.getElementById('login-error').textContent = 'Invalid login credentials';
          }
      });
}

function logout() {
    localStorage.removeItem('token');
    showPage('login-page');
}

function assignTask(event) {
    event.preventDefault();
    const title = document.getElementById('task-title').value;
    const employeeId = document.getElementById('employee-select').value;

    const token = localStorage.getItem('token');
    fetch(`${apiUrl}/tasks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, assigned_to: employeeId })
    }).then(() => {
        alert('Task assigned');
    });
}

function loadEmployees() {
    const token = localStorage.getItem('token');
    fetch(`${apiUrl}/employees`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(res => res.json())
      .then(data => {
          const employeeSelect = document.getElementById('employee-select');
          employeeSelect.innerHTML = '';
          data.forEach(employee => {
              const option = document.createElement('option');
              option.value = employee.id;
              option.textContent = employee.name;
              employeeSelect.appendChild(option);
          });
      });
}

function loadTasks() {
    const token = localStorage.getItem('token');
    fetch(`${apiUrl}/tasks`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(res => res.json())
      .then(data => {
          const taskList = document.getElementById('task-list');
          taskList.innerHTML = '';
          data.forEach(task => {
              const li = document.createElement('li');
              li.textContent = task.title;
              taskList.appendChild(li);
          });
      });
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
}
