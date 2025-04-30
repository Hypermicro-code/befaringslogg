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
        li.innerHTML = `
            ${proj.name} - ${proj.date}
            <button onclick="openProject(${index})">Åpne</button>
            <button onclick="editProject(${index})">✏️</button>
            <button onclick="deleteProject(${index})">🗑️</button>
        `;
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
            <button onclick="exportProjectToPDF()">Eksporter til PDF</button>
            <button onclick="exportImagesToZip()">Last ned bilder som ZIP</button>
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

    if (!proj.areas) return;

    proj.areas.forEach((area, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${area.name}
            <button onclick="openArea(${index})">Åpne</button>
            <button onclick="editArea(${index})">✏️</button>
            <button onclick="deleteArea(${index})">🗑️</button>
        `;
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

    if (!area.images) return;

    area.images.forEach((src, i) => {
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.display = 'inline-block';
        container.style.margin = '5px';

        const img = document.createElement('img');
       img.src = src;
img.onclick = () => showImageModal(src);
        img.style.width = '80px';
        img.style.height = '80px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '5px';

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.top = '0';
        deleteBtn.style.right = '0';
        deleteBtn.style.background = 'rgba(255, 0, 0, 0.7)';
        deleteBtn.style.border = 'none';
        deleteBtn.style.color = 'white';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.borderRadius = '0 5px 0 5px';
        deleteBtn.onclick = () => deleteImage(areaIndex, i);

        container.appendChild(img);
        container.appendChild(deleteBtn);
        gallery.appendChild(container);
    });
}
function displayAreaNotes(areaIndex) {
    const proj = projects[currentProjectIndex];
    const area = proj.areas[areaIndex];
    const list = document.getElementById('noteList');
    list.innerHTML = '';

    if (!area.notes || area.notes.length === 0) {
        list.innerHTML = '<li>Ingen notater lagt inn.</li>';
        return;
    }

    area.notes.forEach((note, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" onclick="viewNote(${areaIndex}, ${i})">Notat ${i + 1}</a>`;
        list.appendChild(li);
    });
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

            <h4>Notater</h4>
            <button onclick="openNoteEditor(${areaIndex})">Nytt notat</button>
            <ul id="noteList"></ul>

            <h4>Bilder</h4>
            <input type="file" id="imageUpload" accept="image/*" multiple>
            <div id="imageGallery" style="margin-top:10px;"></div>

            <br><br>
            <button onclick="openProject(${currentProjectIndex})">Tilbake til prosjekt</button>
        </div>
    `;

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
        event.target.value = '';
    });

    displayAreaMeasurements(areaIndex);
    displayAreaImages(areaIndex);
    displayAreaNotes(areaIndex);
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

            <h4>Notater</h4>
            <button onclick="openNoteEditor(${areaIndex})">Nytt notat</button>
            <ul id="noteList"></ul>

            <h4>Bilder</h4>
            <input type="file" id="imageUpload" accept="image/*" multiple>
            <div id="imageGallery" style="margin-top:10px;"></div>

            <br><br>
            <button onclick="openProject(${currentProjectIndex})">Tilbake til prosjekt</button>
        </div>
    `;

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
        event.target.value = '';
    });

    displayAreaMeasurements(areaIndex);
    displayAreaImages(areaIndex);
    displayAreaNotes(areaIndex);
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

function deleteImage(areaIndex, imageIndex) {
    const confirmDelete = confirm("Er du sikker på at du vil slette dette bildet?");
    if (!confirmDelete) return;

    const proj = projects[currentProjectIndex];
    const area = proj.areas[areaIndex];

    area.images.splice(imageIndex, 1);
    localStorage.setItem('projects', JSON.stringify(projects));
    displayAreaImages(areaIndex);
}

function editArea(areaIndex) {
    const proj = projects[currentProjectIndex];
    const area = proj.areas[areaIndex];

    const newName = prompt("Nytt navn for området:", area.name);
    if (newName) {
        area.name = newName;
        localStorage.setItem('projects', JSON.stringify(projects));
        displayAreas();
    }
}

function deleteArea(areaIndex) {
    const confirmDelete = confirm("Er du sikker på at du vil slette dette området?");
    if (!confirmDelete) return;

    const proj = projects[currentProjectIndex];
    proj.areas.splice(areaIndex, 1);

    localStorage.setItem('projects', JSON.stringify(projects));
    displayAreas();
}
function editProject(projectIndex) {
    const proj = projects[projectIndex];

    const newName = prompt("Nytt prosjektnavn:", proj.name);
    const newDate = prompt("Ny dato (f.eks. 2025-06-01):", proj.date);
    const newInfo = prompt("Ny info:", proj.info);

    if (newName && newDate && newInfo) {
        proj.name = newName;
        proj.date = newDate;
        proj.info = newInfo;
        localStorage.setItem('projects', JSON.stringify(projects));
        displayProjects();
    }
}

function deleteProject(projectIndex) {
    const confirmDelete = confirm("Er du sikker på at du vil slette dette prosjektet?");
    if (!confirmDelete) return;

    projects.splice(projectIndex, 1);
    localStorage.setItem('projects', JSON.stringify(projects));
    displayProjects();
}
async function exportProjectToPDF() {
    const proj = projects[currentProjectIndex];
    const includeImages = confirm("Vil du inkludere bilder i PDF-en?");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(16);
    doc.text(`Prosjekt: ${proj.name}`, 10, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Dato: ${proj.date}`, 10, y);
    y += 8;
    doc.text(`Info: ${proj.info}`, 10, y);
    y += 10;

    if (!proj.areas || proj.areas.length === 0) {
        doc.text("Ingen områder registrert.", 10, y);
    } else {
        for (const area of proj.areas) {
            doc.setFontSize(14);
            doc.text(`Område: ${area.name}`, 10, y);
            y += 8;
            
            if (area.notes && area.notes.length > 0) {
    doc.setFontSize(11);
    doc.text("Notater:", 10, y);
    y += 6;

    area.notes.forEach((note, n) => {
        const noteLabel = `Notat ${n + 1}:`;
        const splitNote = doc.splitTextToSize(note, 180);
        doc.text(noteLabel, 14, y);
        y += 6;
        doc.text(splitNote, 18, y);
        y += splitNote.length * 6;
    });
}

            if (area.measurements && area.measurements.length > 0) {
                doc.setFontSize(11);
                doc.text("Målinger:", 10, y);
                y += 6;
                area.measurements.forEach(m => {
                    doc.text(`• ${m.description}: ${m.value} m`, 14, y);
                    y += 6;
                });
            } else {
                doc.text("Ingen målinger registrert.", 10, y);
                y += 6;
            }

            // Bilder
            if (includeImages && area.images && area.images.length > 0) {
                doc.text("Bilder:", 10, y);
                y += 6;
                let x = 10;
                let rowHeight = 0;

                for (let i = 0; i < area.images.length; i++) {
                    try {
                        const img = await loadImage(area.images[i]);
                        const imgWidth = 60;
                        const imgHeight = 45;
                        if (x + imgWidth > 200) {
                            x = 10;
                            y += rowHeight + 5;
                            rowHeight = 0;
                        }
                        doc.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
                        x += imgWidth + 5;
                        rowHeight = Math.max(rowHeight, imgHeight);
                    } catch (e) {
                        doc.text("Kunne ikke laste bilde.", 10, y);
                        y += 6;
                    }
                }
                y += rowHeight + 10;
            }

            y += 10;
            if (y > 260) {
                doc.addPage();
                y = 10;
            }
        }
    }

    doc.save(`${proj.name.replace(/\s+/g, '_')}.pdf`);
}

function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataUrl;
    });
}
async function exportImagesToZip() {
    const proj = projects[currentProjectIndex];
    const zip = new JSZip();

    if (!proj.areas || proj.areas.length === 0) {
        alert("Ingen områder å eksportere bilder fra.");
        return;
    }

    for (const area of proj.areas) {
        const folder = zip.folder(area.name.replace(/\s+/g, "_"));
        if (area.images && area.images.length > 0) {
            for (let i = 0; i < area.images.length; i++) {
                const base64 = area.images[i];
                const imgData = base64.split(',')[1];
                folder.file(`bilde_${i + 1}.jpg`, imgData, { base64: true });
            }
        }
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${proj.name.replace(/\s+/g, '_')}_bilder.zip`);
}
// Forstørret bildevisning
function showImageModal(src) {
    const modal = document.getElementById('imageModal');
    const img = document.getElementById('modalImage');
    img.src = src;
    modal.style.display = 'flex';

    // Klikk utenfor bildet lukker modal
    modal.onclick = function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}
function openNoteEditor(areaIndex) {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="project-content">
            <h3>Nytt notat</h3>
            <textarea id="noteInput" rows="15" style="width:90%; max-width:500px;"></textarea>
            <br><br>
            <button onclick="saveNote(${areaIndex})">Lagre notat</button>
            <button onclick="openArea(${areaIndex})">Avbryt</button>
        </div>
    `;
}

function saveNote(areaIndex) {
    const text = document.getElementById('noteInput').value.trim();
    if (!text) return alert("Notatet er tomt.");
    
    const proj = projects[currentProjectIndex];
    const area = proj.areas[areaIndex];
    if (!area.notes) area.notes = [];

    area.notes.push(text);
    localStorage.setItem('projects', JSON.stringify(projects));
    openArea(areaIndex);
}
function viewNote(areaIndex, noteIndex) {
    const proj = projects[currentProjectIndex];
    const area = proj.areas[areaIndex];
    const note = area.notes[noteIndex];

    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="project-content">
            <h3>Notat ${noteIndex + 1} – ${area.name}</h3>
            <p style="white-space: pre-wrap; max-width:600px;">${note}</p>
            <br>
            <button onclick="openArea(${areaIndex})">Tilbake til område</button>
        </div>
    `;
}
window.onload = displayProjects;
