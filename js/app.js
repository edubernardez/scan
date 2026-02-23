let salesData = [];
const statusText = document.getElementById('status');
const infoDisplay = document.getElementById('sale-info');

// 1. Lógica para procesar el CSV (CORREGIDA para saltar encabezados de ML)
document.getElementById('csv-file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    statusText.innerText = "Analizando reporte...";

    Papa.parse(file, {
        header: false, // Cargamos como matriz para buscar la cabecera real
        skipEmptyLines: true,
        complete: function(results) {
            const rows = results.data;
            let headerIndex = -1;

            // Buscamos en qué fila está la columna "# de venta"
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].indexOf("# de venta") !== -1) {
                    headerIndex = i;
                    break;
                }
            }

            if (headerIndex !== -1) {
                const headers = rows[headerIndex];
                const rawData = rows.slice(headerIndex + 1);

                // Convertimos las filas en objetos usando los nombres de las columnas
                salesData = rawData.map(row => {
                    let obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index] ? row[index].toString().trim() : "";
                    });
                    return obj;
                }).filter(item => item['# de venta'] && item['# de venta'] !== "");

                statusText.innerText = `✅ ${salesData.length} ventas listas.`;
                statusText.style.color = "#00a650";
            } else {
                statusText.innerText = "❌ Error: No se encontró la columna '# de venta'.";
                statusText.style.color = "#cc0000";
                console.log("Filas analizadas:", rows.slice(0, 10));
            }
        }
    });
});

// 2. Configuración del Escáner
const html5QrCode = new Html5Qrcode("reader");
const qrConfig = { fps: 10, qrbox: { width: 280, height: 160 } };

html5QrCode.start(
    { facingMode: "environment" }, 
    qrConfig, 
    (decodedText) => processScan(decodedText.trim())
).catch(err => {
    statusText.innerText = "Error: Se requiere HTTPS o Localhost para usar la cámara.";
});

// 3. Procesar Escaneo
function processScan(code) {
    // Buscamos coincidencia
    const match = salesData.find(row => 
        (row['# de venta'] === code) || 
        (row['Número de seguimiento'] && row['Número de seguimiento'] === code) ||
        (row['Número de seguimiento'] && row['Número de seguimiento'].includes(code))
    );

    if (match) {
        const orderId = match['# de venta'];
        const comprador = match['Comprador'] || "Cliente";
        const producto = match['Título de la publicación'];
        const url = `https://www.mercadolibre.com.uy/ventas/v2/pedidos/${orderId}/detalle`;

        infoDisplay.innerHTML = `
            <div class="sale-card">
                <p><strong>Venta:</strong> #${orderId}</p>
                <p><strong>Cliente:</strong> ${comprador}</p>
                <p style="font-size:0.9em"><strong>Producto:</strong> ${producto}</p>
                <a href="${url}" target="_blank" class="btn-open">ABRIR DETALLE DE VENTA</a>
            </div>
        `;

        if (navigator.vibrate) navigator.vibrate(200);
        window.open(url, '_blank');
    } else {
        infoDisplay.innerHTML = `
            <div style="color: #cc0000; text-align: center;">
                <strong>No encontrado en este CSV</strong><br>
                Código: ${code}
            </div>
        `;
    }
}
