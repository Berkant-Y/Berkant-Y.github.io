document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    setupSpotlight();
    setupNavHighlight();
    setupModalListeners();
});

let allProjects = [];

// Data Loading (Local Variable + LocalStorage fallback)
function initData() {
    // Migration: Recover User Data from V1
    const storedV1 = localStorage.getItem('portfolio_projects');
    if (storedV1) {
        try {
            const projectsV1 = JSON.parse(storedV1);
            // Keep only user-added projects (ID > 100)
            const userProjects = projectsV1.filter(p => p.id > 100);

            if (userProjects.length > 0) {
                const currentV2 = JSON.parse(localStorage.getItem('portfolio_projects_v2')) || [];
                // Merge and Deduplicate
                const merged = [...userProjects, ...currentV2];
                const unique = merged.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);

                localStorage.setItem('portfolio_projects_v2', JSON.stringify(unique));
            }
            localStorage.removeItem('portfolio_projects');
        } catch (e) {
            console.error('Migration failed', e);
        }
    }

    const storedProjects = localStorage.getItem('portfolio_projects_v2');
    if (!storedProjects && typeof initialProjects !== 'undefined') {
        localStorage.setItem('portfolio_projects_v2', JSON.stringify(initialProjects));
        return initialProjects;
    }
    return JSON.parse(storedProjects) || [];
}

function loadProjects() {
    const container = document.getElementById('projects-container');

    allProjects = initData();

    // Merge initialProjects if they exist (Hardcoded projects take precedence or just add missing ones)
    if (typeof initialProjects !== 'undefined') {
        const combined = [...initialProjects, ...allProjects];
        // Deduplicate by ID - initialProjects come first so they are preferred if IDs conflict
        allProjects = combined.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
    }

    if (allProjects.length === 0) {
        container.innerHTML = '<p>No projects found.</p>';
        return;
    }

    // Render Projects (V4 List Style)
    // Entire card is clickable to open Modal
    container.innerHTML = allProjects.map(project => `
        <div class="project-item" onclick="openProjectModal(${project.id})">
            <div>
                <h3>
                    ${project.title}
                    <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.8em; margin-left: 5px;"></i>
                </h3>
                <p>${project.description}</p>
                <div class="tech-tags">
                    ${project.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Spotlight Effect
function setupSpotlight() {
    const body = document.querySelector('body');
    document.addEventListener('mousemove', (e) => {
        body.style.setProperty('--x', e.clientX + 'px');
        body.style.setProperty('--y', e.clientY + 'px');
    });
}

// Nav Highlight
function setupNavHighlight() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Adjustment for offset
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
}

/* Modal Logic (Same as before) */
window.openProjectModal = function (id) {
    const project = allProjects.find(p => p.id === id);
    if (!project) return;

    document.getElementById('modal-title').textContent = project.title;

    let content = project.readme || `<p>${project.description}</p>`;
    // Append Links if available
    let linksHtml = '<div style="margin-top: 2rem; display: flex; gap: 1rem;">';
    if (project.githubUrl) linksHtml += `<a href="${project.githubUrl}" target="_blank" style="text-decoration: underline;">GitHub</a>`;
    if (project.demoUrl) linksHtml += `<a href="${project.demoUrl}" target="_blank" style="text-decoration: underline;">Live Demo</a>`;
    linksHtml += '</div>';

    document.getElementById('modal-body').innerHTML = content + linksHtml;

    const modal = document.getElementById('project-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function setupModalListeners() {
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('close-modal');

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal && modal.classList.contains('active')) closeModal(); });
}
