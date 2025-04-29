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

function displayAreaMeasurements(areaIndex) {
    const proj = projects[currentProjectIndex];
    const area = proj.areas[areaIndex];
    const list = document.getElementById('measurementList');
    list.innerHTML = '';

    if (!area.measurements) return; // <-- Lagt til dette

    area.measurements.forEach((m, i) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${m.description}: ${m.value} m
            <button onclick="editMeasurement(${areaIndex}, ${i})">✏️</button>
            <button onclick="deleteMeasurement(${areaIndex}, ${i})">🗑️</button>
        `;
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

function editMeasurement(areaIndex, measurementIndex) {
    const proj = projects[currentProjectIndex];
    const area = proj.areas[areaIndex];
    const measurement = area.measurements[measurementIndex];

    const newDescription = prompt("Ny beskrivelse:", measurement.description);
    const newValue = prompt("Ny måleverdi (i meter):", measurement.value);

    if (newDescription && newValue) {
        measurement.description = newDescription;
        measurement.value = parseFloat(newValue).toFixed(2);
        localStorage.setItem('projects', JSON.stringify(projects));
        displayAreaMeasurements(areaIndex);
    }
}

function deleteMeasurement(areaIndex, measurementIndex) {
    const confirmDelete = confirm("Er du sikker på at du vil slette denne målingen?");
    if (!confirmDelete) return;

    const proj = projects[currentProjectIndex];
    const area = proj.areas[areaIndex];
    area.measurements.splice(measurementIndex, 1);

    localStorage.setItem('projects', JSON.stringify(projects));
    displayAreaMeasurements(areaIndex);
}

function displayAreaImages(areaIndex) {
    const proj = projects[currentProjectIndex];
    const area = proj.areas[areaIndex];
    const gallery = document.getElementById('imageGallery');
    gallery.innerHTML = '';

    area.images?.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.style.width = '80px';
        img.style.height = '80px';
        img.style.objectFit = 'cover';
        img.style.margin = '5px';
        gallery.appendChild(img);
    });
}
function addMeasurementToArea(areaIndex) {
    const description = prompt("Beskrivelse av måling:");
    const value = prompt("Måleverdi i meter (f.eks. 5.75):");

    if (description && value) {
        const proj = projects[currentProjectIndex];
        const area = proj.areas[areaIndex];

        area.measurements.push({ description, value: parseFloat(value).toFixed(2) });
        localStorage.setItem('projects', JSON.stringify(projects));
        displayAreaMeasurements(areaIndex);
    }
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

            <h4>Målelogg</h4>
            <ul id="measurementList"></ul>
            <button onclick="addMeasurementToArea(${areaIndex})">Legg til måling</button>

            <h4>Kommentar</h4>
            <textarea id="areaComment" rows="5" style="width:90%;max-width:400px;">${area.comment || ''}</textarea>

            <h4>Bilder</h4>
            <input type="file" id="imageUpload" accept="image/*" multiple>
            <div id="imageGallery" style="margin-top:10px;"></div>

            <br><br>
            <button onclick="openProject(${currentProjectIndex})">Tilbake til prosjekt</button>
        </div>
    `;

    document.getElementById('areaComment').addEventListener('input', function() {
        area.comment = this.value;
        localStorage.setItem('projects', JSON.stringify(projects));
    });

    document.getElementById('imageUpload').addEventListener('change', function(event) {
        const files = Array.from(event.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                area.images.push(e.target.result);
                localStorage.setItem('projects', JSON.stringify(projects));
                displayAreaImages(areaIndex);
            };
            reader.readAsDataURL(file);
        });
        event.target.value = ''; // Reset input after upload
    });

    displayAreaMeasurements(areaIndex);
    displayAreaImages(areaIndex);
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
