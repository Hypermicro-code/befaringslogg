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
    const list = document.getElementById('projectList');
    list.innerHTML = '';
    projects.forEach((proj, index) => {
        const li = document.createElement('li');
        li.textContent = `${proj.name} - ${proj.date}`;
        li.onclick = () => openProject(index);
        list.appendChild(li);
    });
}

function openProject(index) {
    currentProjectIndex = index;
    const proj = projects[index];
    const content = document.getElementById('content');

    content.innerHTML = `
        <h2>${proj.name}</h2>
        <p><strong>Dato:</strong> ${proj.date}</p>
        <p><strong>Info:</strong> ${proj.info}</p>
        <h3>Målelogg</h3>
        <ul id="measurementList"></ul>
        <button onclick="addMeasurement()">Legg til måling</button>
        <br><br>
        <button onclick="goBack()">Tilbake</button>
    `;

    displayMeasurements();
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
    const content = document.getElementById('content');
    content.innerHTML = `
        <p>Velkommen! Velg et prosjekt eller opprett et nytt.</p>
        <ul id="projectList"></ul>
    `;
    displayProjects();
}

window.onload = displayProjects;
