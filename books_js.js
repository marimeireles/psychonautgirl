const pastelColors = [
  "#FFB3BA", "#FFDFBA", "#ffd900", "#90ee90", "#BAE1FF",
  "#E0BBE4", "#957DAD", "#D291BC", "#FEC8D8", "#ffd2c8",
  "#B2B2B2", "#F5CBF6", "#abff14", "#C3D0EF", "#ff91a8",
  "#F9D1D1", "#A8D0DB", "#D6E2BF", "#F1D0B8", "#E9C9F1",
];

const cuteColors = [
  '#FF69B4', '#FF6347', '#FFA500', '#00BFFF', '#FF1493',
  '#FF4500', '#800080', '#9400D3', '#FF7F50', '#008080',
  "#F5CBF6",
];

let labelColors = {};

function getColorForLabel(label) {
  if (!labelColors[label]) {
    let colorIndex = Object.keys(labelColors).length % pastelColors.length;
    labelColors[label] = pastelColors[colorIndex];
  }
  return labelColors[label];
}

function getColorForLabelStatus(label) {
  if (!labelColors[label]) {
    let colorIndex = Object.keys(labelColors).length % cuteColors.length;
    labelColors[label] = cuteColors[colorIndex];
  }
  return labelColors[label];
}

function renderTable(rowsData) {
  let tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = '';

  rowsData.forEach(rowData => {
    var row = document.createElement("tr");
    let typeColor = getColorForLabelStatus(rowData.status);

    if (Array.isArray(rowData.type)) {
      row.innerHTML = `
        <td>${rowData.name}</td>
        <td><span class="badge" style="background-color: ${typeColor};">${rowData.status}</span></td>`;
        const tdEl = document.createElement("td");
        var i = 0;
      rowData.type.forEach(labelType => {
        labelType = labelType.replace(/\s+/g, '');
        let typeColor = getColorForLabel(labelType);
        tdEl.innerHTML = tdEl.innerHTML.concat(`<span class="badge" style="background-color: ${typeColor}; margin-right: 10px;">${labelType}</span>`);
      });
      row.innerHTML = row.innerHTML.concat(`<td>${tdEl.innerHTML}</td>`);
      row.innerHTML = row.innerHTML.concat(`
        <td>${rowData.author}</td>`
      );
    }

    else {
      let typeColorStatus = getColorForLabelStatus(rowData.status);
      let typeColor = getColorForLabelStatus(rowData.type);
      row.innerHTML = `
        <td>${rowData.name}</td>
        <td><span class="badge" style="background-color: ${typeColorStatus};">${rowData.status}</span></td>
        <td><span class="badge" style="background-color: ${typeColor};">${rowData.type}</span></td>
        <td>${rowData.author}</td>
      `;
    }

    tableBody.appendChild(row);
  });
}

function renderStatusDropdown(statuses) {
  let dropdownMenu = document.getElementById("statusDropdownMenu");
  dropdownMenu.innerHTML = '';

  statuses.forEach(status => {
    let menuItem = document.createElement("li");
    let anchor = document.createElement("a");
    anchor.classList.add("dropdown-item");
    anchor.href = "#";
    anchor.textContent = status;

    anchor.addEventListener("click", function () {
      let sortedData = tableData.filter(row => row.status === status);
      renderTable(sortedData);
    });

    menuItem.appendChild(anchor);
    dropdownMenu.appendChild(menuItem);
  });
}

function renderTypeDropdown(labels) {
  let dropdownMenu = document.getElementById("typeDropdownMenu");
  dropdownMenu.innerHTML = '';
  labels = labels.filter(item => !Array.isArray(item));
  console.log(labels)

  labels.forEach(label => {
    let menuItem = document.createElement("li");
    let anchor = document.createElement("a");
    anchor.classList.add("dropdown-item");
    anchor.href = "#";
    anchor.textContent = label;

    anchor.addEventListener("click", function () {
      let sortedData = tableData.filter(row => row.type.includes(label));
      renderTable(sortedData);
    });

    menuItem.appendChild(anchor);
    dropdownMenu.appendChild(menuItem);
  });
}

let tableData = [];

const csvFileUrl = "https://cdn.jsdelivr.net/gh/marimeireles/psychonautgirl@master/my_books.csv";

fetch(csvFileUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.text();
  })
  .then((content) => {
    let lines = content.split("\n");

    // Removed the redeclaration of tableData here

    for (let i = 1; i < lines.length; i++) {
      let cells = lines[i].split(",");

      if (cells.length < 4) {
        continue;
      }

      if (cells[2].includes(";")) {
        cells[2] = cells[2].split(";");
      }

      let rowData = {
        name: cells[0].trim(),
        status: cells[1].trim(),
        type: cells[2],
        author: cells[3].trim(),
      };

      tableData.push(rowData);
    }

    renderTable(tableData);

    let uniqueLabels = [...new Set(tableData.map((row) => row.type))];
    renderTypeDropdown(uniqueLabels);

    let uniqueStatuses = [...new Set(tableData.map((row) => row.status))];
    renderStatusDropdown(uniqueStatuses);
  })
  .catch((error) => {
    console.error("There was a problem with the fetch operation:", error);
  });

