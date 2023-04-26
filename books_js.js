const pastelColors = [
  "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF",
  "#E0BBE4", "#957DAD", "#D291BC", "#FEC8D8", "#FFDFD3",
  "#B2B2B2", "#E5E5E5", "#E2F3C7", "#C3D0EF", "#F5D1E9",
  "#F9D1D1", "#A8D0DB", "#D6E2BF", "#F1D0B8", "#E9C9F1"
];

const cuteColors = [
  '#FF69B4',
  '#FF6347',
  '#FFA500',
  '#00BFFF',
  '#FF1493',
  '#FF4500',
  '#800080',
  '#9400D3',
  '#FF7F50',
  '#008080'
];

let labelColors = {};

function getColorForLabelType(label) {
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
    let typeColorType = getColorForLabelStatus(rowData.status);

    if (Array.isArray(rowData.type)) {
      row.innerHTML = `
        <td>${rowData.name}</td>
        <td><span class="badge" style="background-color: ${typeColorType};">${rowData.status}</span></td>`;
        const tdEl = document.createElement("td");
        var i = 0;
      rowData.type.forEach(labelType => {
        let typeColor = getColorForLabelType(labelType);
        tdEl.innerHTML = tdEl.innerHTML.concat(`<span class="badge" style="background-color: ${typeColorType}; margin-right: 10px;">${labelType}</span>`);
      });
      row.innerHTML = row.innerHTML.concat(`<td>${tdEl.innerHTML}</td>`);
      row.innerHTML = row.innerHTML.concat(`
        <td>${rowData.author}</td>`
      );
    }

    else {
      let typeColorStatus = getColorForLabelStatus(rowData.status);
      let typeColorType = getColorForLabelStatus(rowData.type);
      row.innerHTML = `
        <td>${rowData.name}</td>
        <td><span class="badge" style="background-color: ${typeColorStatus};">${rowData.status}</span></td>
        <td><span class="badge" style="background-color: ${typeColorType};">${rowData.type}</span></td>
        <td>${rowData.author}</td>
      `;
    }

    tableBody.appendChild(row);
  });
}

function sortByType(rowsData) {
  return rowsData.sort((a, b) => a.type.localeCompare(b.type));
}

function sortByStatus(rowsData) {
  return rowsData.sort((a, b) => a.status.localeCompare(b.status));
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

// Replace this with the URL of your CSV file
const csvFileUrl = "https://github.com/marimeireles/psychonautgirl/blob/master/my_books.csv";

fetch(csvFileUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.text();
  })
  .then((content) => {
    let lines = content.split("\n");

    let tableData = [];

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

