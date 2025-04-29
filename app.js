let projects = JSON.parse(localStorage.getItem('projects')) || [];
let currentProjectIndex = null;

function createProject() {
    const name = prompt("Prosjektnavn:");
    const today = new Date().toISOString().split('T')[0];  // yyyy-mm-dd
    const date = prompt("Dato for befaring (åååå-mm-dd):", today);
    const info = prompt("Generelle opplysninger:");

    if (name) {
        const project = { name, date, info, measurements: [], images: [] };
        projects.push(project);
        localStorage.setItem('projects', JSON.stringify(projects));
        displayProjects();
    }
}

function displayProjects() {
    const list = document.createElement('ul');
    list.id = 'projectList';

    projects.forEach((proj, index) => {
        const li = document.createElement('li');
        li.textContent = `${proj.name} - ${proj.date}`;
        li.onclick = () => openProject(index);
        list.appendChild(li);
    });

    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="project-content">
            <p>Velkommen! Velg et prosjekt eller opprett et nytt.</p>
        </div>
    `;

    const wrapper = content.querySelector('.project-content');
    wrapper.appendChild(list);
}

function openProject(index) {
    currentProjectIndex = index;
    const proj = projects[index];
    updateHeader(proj);

    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="project-content">
            <p><strong>Info:</strong> ${proj.info}</p>
            <h3>Områder</h3>
            <ul id="areaList"></ul>
            <button onclick="addArea()">Legg til område</button>
            <br><br>
            <button onclick="goBack()">Tilbake</button>
        </div>
    `;

    displayAreas();
}

function displayMeasurements() {
    const proj = projects[currentProjectIndex];
    const list = document.getElementById('measurementList');
    list.innerHTML = '';

    proj.measurements.forEach(m => {
        const li = document.createElement('li');
        li.textContent = `${m.description}: ${m.value} m`;
        list.appendChild(li);
    });
}

function displayAreas() {
    const proj = projects[currentProjectIndex];
    const list = document.getElementById('areaList');
    list.innerHTML = '';

    proj.areas?.forEach((area, index) => {
        const li = document.createElement('li');
        li.textContent = area.name;
        li.onclick = () => openArea(index);
        list.appendChild(li);
    });
}

function addArea() {
    const name = prompt("Navn på område:");
    if (!name) return;

    const proj = projects[currentProjectIndex];
    if (!proj.areas) proj.areas = [];

    proj.areas.push({ name, measurements: [], comment: "", images: [] });
    localStorage.setItem('projects', JSON.stringify(projects));
    displayAreas();
}

function openArea(areaIndex) {
    const proj = projects[currentProjectIndex];
    const area = proj.areas[areaIndex];

    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="project-content">
            <h3>${area.name}</h3>
            <p><em>Her kommer målinger, bilder og kommentarer!</em></p>
            <br>
            <button onclick="openProject(${currentProjectIndex})">Tilbake til prosjekt</button>
        </div>
    `;
}
function addMeasurement() {
    const description = prompt("Beskrivelse av måling:");
    const value = prompt("Måleverdi i meter (f.eks. 5.75):");

    if (description && value) {
        const proj = projects[currentProjectIndex];
        proj.measurements.push({ description, value: parseFloat(value).toFixed(2) });
        localStorage.setItem('projects', JSON.stringify(projects));
        displayMeasurements();
    }
}

function goBack() {
    updateHeader();

    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="project-content">
            <p>Velkommen! Velg et prosjekt eller opprett et nytt.</p>
            <ul id="projectList"></ul>
        </div>
    `;
    displayProjects();
}

function updateHeader(project = null) {
    const header = document.querySelector('header');
    if (project) {
        header.innerHTML = `
            <div class="project-header-box">
                <strong>${project.name}</strong><br>
                ${project.date}
            </div>
        `;
    } else {
        header.innerHTML = `
            <h1>Befaringslogg</h1>
            <button onclick="createProject()">Nytt Prosjekt</button>
        `;
    }
}

window.onload = displayProjects;
