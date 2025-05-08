let projects = JSON.parse(localStorage.getItem('projects')) || [];
let currentProjectIndex = null;

let mediaRecorder;
let audioChunks = [];


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

function addMeasurementToArea(areaIndex) {
    const choice = confirm("Trykk OK for manuell måling, eller Avbryt for å bruke kamera.");

    if (choice) {
        // Manuell måling
        const description = prompt("Beskrivelse av måling:");
        const value = prompt("Måleverdi i meter (f.eks. 5.75):");

        if (description && value) {
            const proj = projects[currentProjectIndex];
            const area = proj.areas[areaIndex];

            area.measurements.push({ description, value: parseFloat(value).toFixed(2) });
            localStorage.setItem('projects', JSON.stringify(projects));
            displayAreaMeasurements(areaIndex);
        }
    } else {
        // Kamera-måling (midlertidig melding)
        alert("Kameramåling kommer snart! 📷 Vi jobber med saken.");
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

            <div style="margin-bottom: 10px; display: flex; flex-wrap: wrap; gap: 8px;">
                <button onclick="addMeasurementToArea(${areaIndex})">➕ Måling</button>
                <button onclick="openNoteEditor(${areaIndex})">📝 Nytt notat</button>
                <button onclick="document.getElementById('imageUpload').click()">📷 Velg filer</button>
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
                localStorage.setItem('projects', JSON.stringify(projects));
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
                    localStorage.setItem('projects', JSON.stringify(projects));
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
           <button class="primary" onclick="createProject()">Nytt Prosjekt</button>
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
    const confirmDelete = confirm("Er du sikker på at du vil slette dette notatet?");
    if (!confirmDelete) return;

    const proj = projects[currentProjectIndex];
    const area = proj.areas[areaIndex];
    area.notes.splice(noteIndex, 1);
    localStorage.setItem('projects', JSON.stringify(projects));
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

    localStorage.setItem('projects', JSON.stringify(projects));
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

        localStorage.setItem('projects', JSON.stringify(projects));
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
