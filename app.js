let projects = JSON.parse(localStorage.getItem('projects')) || [];

function createProject() {
    const name = prompt("Prosjektnavn:");
    const date = prompt("Dato for befaring (dd.mm.yyyy):");
    const info = prompt("Generelle opplysninger:");

    if (name) {
        const project = { name, date, info, measurements: [] };
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
    const proj = projects[index];
    const measurement = prompt(`Legg til måling for ${proj.name} (i meter, f.eks. 3.25):`);

    if (measurement) {
        proj.measurements.push(parseFloat(measurement).toFixed(2) + " m");
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    alert(`Prosjekt: ${proj.name}\nDato: ${proj.date}\nInfo: ${proj.info}\n\nMålinger:\n${proj.measurements.join('\n')}`);
}

window.onload = displayProjects;
