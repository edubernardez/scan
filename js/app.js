let inventory = {};
const html5QrCode = new Html5Qrcode("reader");

const config = { fps: 10, qrbox: { width: 250, height: 150 } };

html5QrCode.start({ facingMode: "environment" }, config, (decodedText) => {
    handleScan(decodedText);
});

function handleScan(code) {
    if (inventory[code]) {
        inventory[code]++;
        updateRow(code);
    } else {
        inventory[code] = 1;
        addRow(code);
    }
}

function addRow(code) {
    const tbody = document.getElementById('inventory-list');
    const row = document.createElement('tr');
    row.id = `row-${code}`;
    row.innerHTML = `<td>${code}</td><td class="count">1</td><td><span class="badge badge-new">Nuevo</span></td>`;
    tbody.prepend(row);
}

function updateRow(code) {
    const row = document.getElementById(`row-${code}`);
    row.querySelector('.count').innerText = inventory[code];
    const badge = row.querySelector('.badge');
    badge.innerText = "Repetido";
    badge.className = "badge badge-repeat";
    row.classList.add('duplicate');
}

function clearList() {
    if(confirm("¿Borrar todo?")) {
        inventory = {};
        document.getElementById('inventory-list').innerHTML = '';
    }
}