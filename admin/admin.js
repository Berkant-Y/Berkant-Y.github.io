// Check Auth
if (!localStorage.getItem('admin_auth')) {
    window.location.href = 'index.html';
}

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('admin_auth');
    window.location.href = 'index.html';
});

// Data Management
let projects = [];

function loadData() {
    const stored = localStorage.getItem('portfolio_projects_v2');
    if (stored) {
        projects = JSON.parse(stored);
    } else if (typeof initialProjects !== 'undefined') {
        projects = [...initialProjects]; // Copy from projects.js default
        saveData(); // Save to local storage for consistency
    }
}

function saveData() {
    localStorage.setItem('portfolio_projects_v2', JSON.stringify(projects));
}

function renderList() {
    const list = document.getElementById('admin-project-list');
    list.innerHTML = projects.map(p => `
        <div class="admin-item">
            <span>${p.title}</span>
            <button class="delete-btn" onclick="deleteProject(${p.id})">Delete</button>
        </div>
    `).join('');
}

// Actions
window.deleteProject = function (id) {
    if (confirm('Are you sure you want to delete this project?')) {
        projects = projects.filter(p => p.id !== id);
        saveData();
        renderList();
    }
};

document.getElementById('add-project-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const newProject = {
        id: Date.now(), // Generate ID
        title: document.getElementById('p-title').value,
        description: document.getElementById('p-desc').value,
        tags: document.getElementById('p-tags').value.split(',').map(t => t.trim()).filter(Boolean),
        githubUrl: document.getElementById('p-github').value || null,
        demoUrl: document.getElementById('p-demo').value || null,
        stars: parseInt(document.getElementById('p-stars').value) || 0,
        readme: document.getElementById('p-readme').value || ''
    };

    // Add to top
    projects.unshift(newProject);
    saveData();
    renderList();

    // Reset form
    e.target.reset();
    alert('Project Added!');
});

document.getElementById('reset-data').addEventListener('click', () => {
    if (confirm('This will wipe all custom changes and restore default projects. Continue?')) {
        if (typeof initialProjects !== 'undefined') {
            projects = [...initialProjects];
            saveData();
            renderList();
            alert('Reset Complete');
        } else {
            alert('Cannot find default data.');
        }
    }
});

// Init
loadData();
renderList();
