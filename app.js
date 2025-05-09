let projects = [];
let currentProjectIndex = null;

let mediaRecorder;
let audioChunks = [];

function loadProjectsFromFirebase() {
  firebase.database().ref("projects").once("value").then(snapshot => {
    const data = snapshot.val();
    projects = data ? Object.values(data) : [];
    displayProjects();
  });
}
function createProject() {
  document.getElementById("projectNameInput").value = "";
  document.getElementById("projectDateInput").value = new Date().toISOString().split('T')[0];
  document.getElementById("projectInfoInput").value = "";
  document.getElementById("projectDialog").style.display = "flex";
}

function submitProject() {
  const name = document.getElementById("projectNameInput").value.trim();
  const date = document.getElementById("projectDateInput").value;
  const info = document.getElementById("projectInfoInput").value.trim();

  if (!name) {
    alert("Prosjektnavn er påkrevd.");
    return;
  }

  const project = { name, date, info, measurements: [], images: [] };
  projects.push(project);
 set(ref(db, 'projects'), projects);
  closeProjectDialog();
  displayProjects();
}

function closeProjectDialog() {
  document.getElementById("projectDialog").style.display = "none";
}

function displayProjects() {
    const list = document.createElement('ul');
    list.id = 'projectList';

    projects.forEach((proj, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${proj.name}
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
        <div style="margin-bottom: 10px; display: flex; flex-wrap: wrap; gap: 8px;">
            <button onclick="addArea()">➕ område</button>
            <button onclick="exportProjectToPDF()">📄 PDF</button>
            <button onclick="exportImagesToZip()">🗂️ Bilder</button>
            <button onclick="goBack()">🔙 Tilbake</button>
        </div>
        <p><strong>Info:</strong> ${proj.info}</p>
        <h3>Områder</h3>
        <ul id="areaList"></ul>
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

  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="project-content">
      <h3>Rediger måling</h3>
      <label for="editDesc"><strong>Beskrivelse:</strong></label><br>
      <input type="text" id="editDesc" value="${measurement.description}" style="width: 90%; max-width: 400px;"><br><br>

      <label for="editValue"><strong>Verdi (i meter):</strong></label><br>
      <input type="number" id="editValue" step="0.01" value="${measurement.value}" style="width: 90%; max-width: 400px;"><br><br>

      <button onclick="saveEditedMeasurement(${areaIndex}, ${measurementIndex})">💾 Lagre</button>
      <button onclick="openArea(${areaIndex})">Avbryt</button>
    </div>
  `;
}

function saveEditedMeasurement(areaIndex, measurementIndex) {
  const newDescription = document.getElementById('editDesc').value.trim();
  const newValue = parseFloat(document.getElementById('editValue').value);

  if (!newDescription || isNaN(newValue)) {
    alert("Vennligst fyll ut både beskrivelse og gyldig måleverdi.");
    return;
  }

  const proj = projects[currentProjectIndex];
  const area = proj.areas[areaIndex];
  const measurement = area.measurements[measurementIndex];

  measurement.description = newDescription;
  measurement.value = newValue.toFixed(2);

  set(ref(db, 'projects'), projects);
  openArea(areaIndex);
}
function deleteMeasurement(areaIndex, measurementIndex) {
  const proj = projects[currentProjectIndex];
  const area = proj.areas[areaIndex];
  const measurement = area.measurements[measurementIndex];

  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="project-content">
      <h3>Slett måling</h3>
      <p>Er du sikker på at du vil slette denne målingen?</p>
      <p><strong>${measurement.description}: ${measurement.value} m</strong></p>
      <br>
      <button onclick="confirmDeleteMeasurement(${areaIndex}, ${measurementIndex})">🗑️ Slett</button>
      <button onclick="openArea(${areaIndex})">Avbryt</button>
    </div>
  `;
}

function confirmDeleteMeasurement(areaIndex, measurementIndex) {
  const proj = projects[currentProjectIndex];
  const area = proj.areas[areaIndex];
  area.measurements.splice(measurementIndex, 1);

set(ref(db, 'projects'), projects);
  openArea(areaIndex);
}
function confirmDeleteMeasurement(areaIndex, measurementIndex) {
  const proj = projects[currentProjectIndex];
  const area = proj.areas[areaIndex];
  area.measurements.splice(measurementIndex, 1);
 set(ref(db, 'projects'), projects);
  openArea(areaIndex);
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

function addMeasurementToArea(areaIndex) {
  const content = document.getElementById('content');

  content.innerHTML = `
    <div class="project-content">
      <h3>Ny måling</h3>
      <label for="descInput"><strong>Beskrivelse:</strong></label><br>
      <input type="text" id="descInput" style="width: 90%; max-width: 400px;"><br><br>

      <label for="valInput"><strong>Verdi (i meter):</strong></label><br>
      <input type="number" id="valInput" step="0.01" style="width: 90%; max-width: 400px;"><br><br>

      <button onclick="saveMeasurement(${areaIndex})">💾 Lagre</button>
      <button onclick="openArea(${areaIndex})">Avbryt</button>
    </div>
  `;
}

function saveMeasurement(areaIndex) {
  const description = document.getElementById('descInput').value.trim();
  const value = parseFloat(document.getElementById('valInput').value);

  if (!description || isNaN(value)) {
    alert("Vennligst fyll ut både beskrivelse og gyldig måleverdi.");
    return;
  }

  const proj = projects[currentProjectIndex];
  const area = proj.areas[areaIndex];

  area.measurements.push({ description, value: value.toFixed(2) });
 set(ref(db, 'projects'), projects);
  openArea(areaIndex);
}

function addArea() {
  document.getElementById("areaNameInput").value = "";
  document.getElementById("areaDialog").style.display = "flex";
}

function submitArea() {
  const name = document.getElementById("areaNameInput").value.trim();
  if (!name) {
    alert("Områdenavn er påkrevd.");
    return;
  }

  const proj = projects[currentProjectIndex];
  if (!proj.areas) proj.areas = [];

  proj.areas.push({ name, measurements: [], comment: "", images: [] });
  set(ref(db, 'projects'), projects);
  closeAreaDialog();
  displayAreas();
}

function closeAreaDialog() {
  document.getElementById("areaDialog").style.display = "none";
}

function openArea(areaIndex) {
    const proj = projects[currentProjectIndex];
    const area = proj.areas[areaIndex];

    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="project-content">
            <h3>${area.name}</h3>

            <div style="margin-bottom: 10px; display: flex; flex-wrap: wrap; gap: 8px;">
                <button onclick="addMeasurementToArea(${areaIndex})">➕ Måling</button>
                <button onclick="openNoteEditor(${areaIndex})">📝 Notat</button>
                <button onclick="document.getElementById('imageUpload').click()">📷 Bilde</button>
                <input type="file" id="imageUpload" accept="image/*" multiple style="display: none;">
                <button onclick="openProject(${currentProjectIndex})">🔙 Tilbake</button>
            </div>

            <h4>Målelogg</h4>
            <ul id="measurementList"></ul>

            <h4>Notater</h4>
            <ul id="noteList"></ul>

            <h4>Bilder</h4>
            <div id="imageGallery" style="margin-top:10px;"></div>
        </div>
    `;

    document.getElementById('imageUpload').addEventListener('change', function(event) {
        const files = Array.from(event.target.files);

        function processFile(index) {
            if (index >= files.length) {
               set(ref(db, 'projects'), projects);
                displayAreaImages(areaIndex);
                return;
            }

            const file = files[index];
            const reader = new FileReader();
            reader.onload = function(e) {
                area.images.push(e.target.result);

                const takeAnother = confirm("📸 Vil du ta et nytt bilde?");
                if (takeAnother) {
                    document.getElementById('imageUpload').click();
                } else {
                    set(ref(db, 'projects'), projects);
                    displayAreaImages(areaIndex);
                }
            };
            reader.readAsDataURL(file);
        }

        processFile(0);
        event.target.value = '';
    });

    displayAreaMeasurements(areaIndex);
    displayAreaNotes(areaIndex);
    displayAreaAudio(areaIndex);
    displayAreaImages(areaIndex);
}
function addMeasurement() {
    const description = prompt("Beskrivelse av måling:");
    const value = prompt("Måleverdi i meter (f.eks. 5.75):");

    if (description && value) {
        const proj = projects[currentProjectIndex];
        proj.measurements.push({ description, value: parseFloat(value).toFixed(2) });
        set(ref(db, 'projects'), projects);
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
           <button class="primary" onclick="createProject()">Nytt Prosjekt</button>
        `;
    }
}

// Dialog for valg av bildekilde
function openImageSourceDialog(areaIndex) {
  currentAreaIndex = areaIndex;
  document.getElementById("imageSourceDialog").style.display = "flex";
}

function closeImageSourceDialog() {
  document.getElementById("imageSourceDialog").style.display = "none";
}

function startImageUpload(source) {
  closeImageSourceDialog();

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  if (source === "camera") {
    input.capture = "environment";
  }

  input.onchange = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const proj = projects[currentProjectIndex];
      const area = proj.areas[currentAreaIndex];
      area.images = area.images || [];
      area.images.push(e.target.result);
      set(ref(db, 'projects'), projects);
      displayAreaImages(currentAreaIndex);
      document.getElementById("continueUploadDialog").style.display = "flex";
    };
    reader.readAsDataURL(file);
  };

  input.click();
}

function continueImageUpload() {
  document.getElementById("continueUploadDialog").style.display = "none";
  openImageSourceDialog(currentAreaIndex);
}

function closeContinueUpload() {
  document.getElementById("continueUploadDialog").style.display = "none";
  openArea(currentAreaIndex);
}
function deleteImage(areaIndex, imageIndex) {
  const proj = projects[currentProjectIndex];
  const area = proj.areas[areaIndex];

  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="project-content">
      <h3>Slett bilde</h3>
      <p>Er du sikker på at du vil slette dette bildet?</p>
      <img src="${area.images[imageIndex]}" style="max-width: 200px; margin-top: 10px; border-radius: 8px;">
      <br><br>
      <button onclick="confirmDeleteImage(${areaIndex}, ${imageIndex})">🗑️ Slett</button>
      <button onclick="openArea(${areaIndex})">Avbryt</button>
    </div>
  `;
}

function confirmDeleteImage(areaIndex, imageIndex) {
  const proj = projects[currentProjectIndex];
  const area = proj.areas[areaIndex];

  area.images.splice(imageIndex, 1);
  set(ref(db, 'projects'), projects);
  openArea(areaIndex);
}

let currentAreaIndex = null;

function editArea(areaIndex) {
  const proj = projects[currentProjectIndex];
  const area = proj.areas[areaIndex];

  currentAreaIndex = areaIndex;
  document.getElementById("editAreaName").value = area.name;
  document.getElementById("editAreaDialog").style.display = "flex";
}

function submitAreaEdit() {
  const newName = document.getElementById("editAreaName").value.trim();
  if (!newName) {
    alert("Områdenavn er påkrevd.");
    return;
  }

  const proj = projects[currentProjectIndex];
  proj.areas[currentAreaIndex].name = newName;

  set(ref(db, 'projects'), projects);
  closeEditAreaDialog();
  displayAreas();
}

function closeEditAreaDialog() {
  document.getElementById("editAreaDialog").style.display = "none";
}

function deleteArea(areaIndex) {
  const proj = projects[currentProjectIndex];
  const area = proj.areas[areaIndex];

  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="project-content">
      <h3>Slett område</h3>
      <p>Er du sikker på at du vil slette området <strong>"${area.name}"</strong>?</p>
      <br>
      <button onclick="confirmDeleteArea(${areaIndex})">🗑️ Slett</button>
      <button onclick="openProject(${currentProjectIndex})">Avbryt</button>
    </div>
  `;
}

function confirmDeleteArea(areaIndex) {
  const proj = projects[currentProjectIndex];
  proj.areas.splice(areaIndex, 1);
 set(ref(db, 'projects'), projects);
  openProject(currentProjectIndex);
}
function editProject(projectIndex) {
  const proj = projects[projectIndex];
  currentProjectIndex = projectIndex;

  document.getElementById("editProjectName").value = proj.name;
  document.getElementById("editProjectDate").value = proj.date;
  document.getElementById("editProjectInfo").value = proj.info;

  document.getElementById("editProjectDialog").style.display = "flex";
}

function submitProjectEdit() {
  const name = document.getElementById("editProjectName").value.trim();
  const date = document.getElementById("editProjectDate").value;
  const info = document.getElementById("editProjectInfo").value.trim();

  if (!name) {
    alert("Prosjektnavn er påkrevd.");
    return;
  }

  const proj = projects[currentProjectIndex];
  proj.name = name;
  proj.date = date;
  proj.info = info;

 set(ref(db, 'projects'), projects);
  closeEditProjectDialog();
  displayProjects();
}

function closeEditProjectDialog() {
  document.getElementById("editProjectDialog").style.display = "none";
}

function deleteProject(projectIndex) {
  const proj = projects[projectIndex];

  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="project-content">
      <h3>Slett prosjekt</h3>
      <p>Er du sikker på at du vil slette prosjektet <strong>"${proj.name}"</strong>?</p>
      <br>
      <button onclick="confirmDeleteProject(${projectIndex})">🗑️ Slett</button>
      <button onclick="displayProjects()">Avbryt</button>
    </div>
  `;
}

function confirmDeleteProject(projectIndex) {
  projects.splice(projectIndex, 1);
 set(ref(db, 'projects'), projects);
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
            <textarea id="noteInput" rows="10" style="width:90%; max-width:500px;"></textarea>
            <br><br>
            <button onclick="startDictation()">🗣️ Start diktering</button>
            <button onclick="stopDictation()">🛑 Stopp diktering</button>
            <p id="dictationStatus" style="color: green; font-weight: bold;"></p>

            <hr style="margin:20px 0">

            <button onclick="startRecording()">🎤 Start opptak</button>
            <button onclick="stopRecording()">⏹️ Stopp opptak</button>
            <p id="recordingStatus"></p>
            <audio id="audioPreview" controls style="display:none; margin-top:10px;"></audio>

            <br><br>
            <button onclick="saveNoteWithAudio(${areaIndex})">Lagre notat</button>
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
    set(ref(db, 'projects'), projects);
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
            <button onclick="editNote(${areaIndex}, ${noteIndex})">✏️ Rediger</button>
            <button onclick="deleteNote(${areaIndex}, ${noteIndex})">🗑️ Slett</button>
            <br><br>
            <button onclick="openArea(${areaIndex})">Tilbake til område</button>
        </div>
    `;
}
function editNote(areaIndex, noteIndex) {
    const proj = projects[currentProjectIndex];
    const area = proj.areas[areaIndex];
    const note = area.notes[noteIndex];

    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="project-content">
            <h3>Rediger notat ${noteIndex + 1} – ${area.name}</h3>
            <textarea id="editNoteInput" rows="12" style="width:90%; max-width:500px;">${note}</textarea>
            <br><br>
            <button onclick="saveEditedNote(${areaIndex}, ${noteIndex})">Lagre endringer</button>
            <button onclick="viewNote(${areaIndex}, ${noteIndex})">Avbryt</button>
        </div>
    `;
}

function deleteNote(areaIndex, noteIndex) {
  const proj = projects[currentProjectIndex];
  const area = proj.areas[areaIndex];
  const note = area.notes[noteIndex];

  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="project-content">
      <h3>Slett notat</h3>
      <p>Er du sikker på at du vil slette dette notatet?</p>
      <blockquote>${note.substring(0, 100)}...</blockquote>
      <br>
      <button onclick="confirmDeleteNote(${areaIndex}, ${noteIndex})">🗑️ Slett</button>
      <button onclick="viewNote(${areaIndex}, ${noteIndex})">Avbryt</button>
    </div>
  `;
}

function confirmDeleteNote(areaIndex, noteIndex) {
  const proj = projects[currentProjectIndex];
  const area = proj.areas[areaIndex];
  area.notes.splice(noteIndex, 1);
  set(ref(db, 'projects'), projects);
  openArea(areaIndex);
}
function saveEditedNote(areaIndex, noteIndex) {
    const newText = document.getElementById('editNoteInput').value.trim();
    if (!newText) {
        alert("Notatet kan ikke være tomt.");
        return;
    }

    const proj = projects[currentProjectIndex];
    const area = proj.areas[areaIndex];
    area.notes[noteIndex] = newText;

  set(ref(db, 'projects'), projects);
    viewNote(areaIndex, noteIndex);
}

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = e => {
                audioChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioURL = URL.createObjectURL(audioBlob);
                const audio = document.getElementById('audioPreview');
                audio.src = audioURL;
                audio.style.display = 'block';

                // Lagre base64-data i elementet
                const reader = new FileReader();
               reader.onloadend = () => {
    audio.dataset.base64 = reader.result;
    console.log("✅ Base64 ble satt:", reader.result.substring(0, 100) + "...")
                };
                reader.readAsDataURL(audioBlob);
            };

            mediaRecorder.start();
            document.getElementById('recordingStatus').textContent = '🎙️ Opptak pågår...';
        })
        .catch(err => {
            alert('Kunne ikke starte opptak: ' + err);
        });
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        document.getElementById('recordingStatus').textContent = '✅ Opptak lagret.';
    }
}

function saveNoteWithAudio(areaIndex) {
    const noteText = document.getElementById('noteInput').value.trim();
    const proj = projects[currentProjectIndex];
    const area = proj.areas[areaIndex];
    if (!area.notes) area.notes = [];
    if (!area.audioNotes) area.audioNotes = [];

    const audio = document.getElementById('audioPreview');

    setTimeout(() => {
        const audioBase64 = audio.dataset.base64;

        if (noteText) {
            area.notes.push(noteText);
        }

        if (audioBase64) {
            area.audioNotes.push(audioBase64);
        } else if (audio.style.display === 'block') {
            alert("Lydopptaket er ikke klart enda. Vent noen sekunder etter stopp.");
            return;
        }

        set(ref(db, 'projects'), projects);
        openArea(areaIndex);
    }, 500); // 500 ms forsinkelse
}


function displayAreaAudio(areaIndex) {
    const proj = projects[currentProjectIndex];
    const area = proj.areas[areaIndex];
    if (!area.audioNotes || area.audioNotes.length === 0) return;

    const container = document.createElement('div');
    container.innerHTML = '<h4>Lydnotater</h4>';

    area.audioNotes.forEach((audioData, i) => {
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = audioData;
        const label = document.createElement('p');
        label.textContent = `Lyd ${i + 1}`;
        container.appendChild(label);
        container.appendChild(audio);
    });

    document.querySelector('.project-content').appendChild(container);
}
let recognition;
function startDictation() {
    const noteField = document.getElementById("noteInput");
    const status = document.getElementById("dictationStatus");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Talegjenkjenning støttes ikke i denne nettleseren.");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "nb-NO"; // Norsk
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + " ";
            }
        }
        noteField.value += finalTranscript;
    };

    recognition.onstart = () => {
        status.textContent = "🎙️ Lytter...";
    };

    recognition.onerror = (e) => {
        status.textContent = "❌ Feil: " + e.error;
    };

    recognition.onend = () => {
        status.textContent = "🛑 Diktering stoppet.";
    };

    recognition.start();
}
function stopDictation() {
    if (recognition) {
        recognition.stop();
        document.getElementById("dictationStatus").textContent = "🛑 Diktering stoppet.";
    }
}
window.onload = displayProjects;
