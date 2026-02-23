let salesData = [];
const statusText = document.getElementById('status');
const infoDisplay = document.getElementById('sale-info');

// 1. Lógica para procesar el CSV
document.getElementById('csv-file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    statusText.innerText = "Procesando...";

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            // Filtramos las filas para encontrar las que tienen el ID de venta
            // El reporte de ML suele tener filas de texto al principio
            salesData = results.data.filter(row => row['# de venta']);
            
            if (salesData.length > 0) {
                statusText.innerText = `✅ ${salesData.length} ventas cargadas.`;
                statusText.style.color = "#00a650";
            } else {
                statusText.innerText = "❌ No se encontraron ventas en el archivo.";
                statusText.style.color = "#cc0000";
            }
        }
    });
});

// 2. Configuración del Escáner
const html5QrCode = new Html5Qrcode("reader");
const qrConfig = { 
    fps: 10, 
    qrbox: { width: 250, height: 150 } 
};

// Iniciar cámara trasera por defecto
html5QrCode.start(
    { facingMode: "environment" }, 
    qrConfig, 
    (decodedText) => processScan(decodedText.trim())
).catch(err => {
    statusText.innerText = "Error de cámara: Asegúrate de usar HTTPS.";
});

// 3. Procesar Escaneo y Redirigir
function processScan(code) {
    // Buscamos coincidencia por # de venta o por Número de seguimiento
    const match = salesData.find(row => 
        (row['# de venta'] === code) || 
        (row['Número de seguimiento'] && row['Número de seguimiento'].includes(code))
    );

    if (match) {
        const orderId = match['# de venta'];
        const comprador = match['Comprador'] || "Cliente";
        const producto = match['Título de la publicación'];
        
        // URL de gestión de venta para el vendedor en Uruguay
        const saleUrl = `https://www.mercadolibre.com.uy/ventas/v2/pedidos/${orderId}/detalle`;

        infoDisplay.innerHTML = `
            <div class="sale-card">
                <p><strong>Venta:</strong> #${orderId}</p>
                <p><strong>Cliente:</strong> ${comprador}</p>
                <p><strong>Producto:</strong> ${producto}</p>
                <a href="${saleUrl}" target="_blank" class="btn-open">GESTIONAR VENTA</a>
            </div>
        `;

        if (navigator.vibrate) navigator.vibrate(200);
        
        // Intenta abrir automáticamente la venta
        window.open(saleUrl, '_blank');
        
    } else {
        infoDisplay.innerHTML = `
            <div style="color: #cc0000; text-align: center;">
                <strong>Código no encontrado</strong><br>
                ${code}
            </div>
        `;
    }
}