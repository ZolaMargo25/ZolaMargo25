function calcularCostos() {
    // Get input values
    const costoCarneCruda = parseFloat(document.getElementById('costoCarneCruda').value);
    const pesoPiernas = parseFloat(document.getElementById('pesoPiernas').value);
    const cantidadPiernas = parseInt(document.getElementById('cantidadPiernas').value);
    const pesoEspaldillas = parseFloat(document.getElementById('pesoEspaldillas').value);
    const cantidadEspaldillas = parseInt(document.getElementById('cantidadEspaldillas').value);
    const pesoCostillas = parseFloat(document.getElementById('pesoCostillas').value);
    const cantidadCostillas = parseInt(document.getElementById('cantidadCostillas').value);
    const pesoLomo = parseFloat(document.getElementById('pesoLomo').value);
    const cantidadLomo = parseInt(document.getElementById('cantidadLomo').value);
    const costoIngredientes = parseFloat(document.getElementById('costoIngredientes').value);
    const mermaCocimiento = parseFloat(document.getElementById('mermaCocimiento').value);
    const precioTaco = parseFloat(document.getElementById('precioTaco').value);
    const precioConsomeChico = parseFloat(document.getElementById('precioConsomeChico').value);
    const precioConsomeGrande = parseFloat(document.getElementById('precioConsomeGrande').value);
    // No need to get drink costs here as they are not part of the primary production cost

    const pesoTotalCarneCruda = (pesoPiernas * cantidadPiernas) +
                                (pesoEspaldillas * cantidadEspaldillas) +
                                (pesoCostillas * cantidadCostillas) +
                                (pesoLomo * cantidadLomo);

    const costoTotalProduccion = costoCarneCruda + costoIngredientes;
    const pesoNetoCarneCocida = pesoTotalCarneCruda - mermaCocimiento;

    let costoPorKgCarneCocida = 0;
    if (pesoNetoCarneCocida > 0) {
        costoPorKgCarneCocida = costoTotalProduccion / pesoNetoCarneCocida;
    } else {
        costoPorKgCarneCocida = Infinity;
    }

    const gramosPorTaco = 100;
    const tacosPorKg = (costoPorKgCarneCocida === Infinity || pesoNetoCarneCocida <=0) ? 0 : 1000 / gramosPorTaco;
    const numeroTacosEstimado = (pesoNetoCarneCocida <=0) ? 0 : pesoNetoCarneCocida * tacosPorKg;
    const costoPorTaco = (tacosPorKg > 0 && isFinite(costoPorKgCarneCocida)) ? costoPorKgCarneCocida / tacosPorKg : Infinity;
    const gananciaPorTaco = isFinite(costoPorTaco) ? precioTaco - costoPorTaco : -Infinity;
    const ingresosPorTacos = numeroTacosEstimado * precioTaco;
    const gananciaTotalPorTacos = numeroTacosEstimado * gananciaPorTaco;

    const costoTotalConsomeEstimado = costoIngredientes * 0.10;
    const volumenTotalConsomeEstimadoMl = 10000; // Placeholder: 10 Liters
    const costoPorMlConsome = (volumenTotalConsomeEstimadoMl > 0) ? costoTotalConsomeEstimado / volumenTotalConsomeEstimadoMl : 0;

    const costoConsomeChico = 200 * costoPorMlConsome;
    const gananciaConsomeChico = precioConsomeChico - costoConsomeChico;
    const costoConsomeGrande = 500 * costoPorMlConsome;
    const gananciaConsomeGrande = precioConsomeGrande - costoConsomeGrande;

    // Display results
    document.getElementById('pesoTotalCarneCruda').textContent = pesoTotalCarneCruda.toFixed(2);
    document.getElementById('costoTotalProduccion').textContent = costoTotalProduccion.toFixed(2);
    document.getElementById('pesoNetoCarneCocida').textContent = pesoNetoCarneCocida.toFixed(2);
    document.getElementById('costoPorKgCarneCocida').textContent = isFinite(costoPorKgCarneCocida) ? costoPorKgCarneCocida.toFixed(2) : "N/A (Verificar merma)";
    document.getElementById('numeroTacosEstimado').textContent = Math.floor(numeroTacosEstimado);
    document.getElementById('costoPorTaco').textContent = isFinite(costoPorTaco) ? costoPorTaco.toFixed(2) : "N/A";
    document.getElementById('gananciaPorTaco').textContent = isFinite(gananciaPorTaco) ? gananciaPorTaco.toFixed(2) : "N/A";
    document.getElementById('ingresosPorTacos').textContent = isFinite(ingresosPorTacos) ? ingresosPorTacos.toFixed(2) : "N/A";
    document.getElementById('gananciaTotalPorTacos').textContent = isFinite(gananciaTotalPorTacos) ? gananciaTotalPorTacos.toFixed(2) : "N/A";
    document.getElementById('costoConsomeChico').textContent = costoConsomeChico.toFixed(2);
    document.getElementById('gananciaConsomeChico').textContent = gananciaConsomeChico.toFixed(2);
    document.getElementById('costoConsomeGrande').textContent = costoConsomeGrande.toFixed(2);
    document.getElementById('gananciaConsomeGrande').textContent = gananciaConsomeGrande.toFixed(2);

    calcularPrecioVentaCarneKg();
    generarSugerenciasPaquetes();
    // Clear combo packages as their underlying costs might have changed. User needs to re-click "Generar Paquetes Combinados"
    displayPaquetesCombinados([]);
}

// Function to calculate and display sale price for meat per kg
function calcularPrecioVentaCarneKg() {
    const costoPorKgCarneCocidaText = document.getElementById('costoPorKgCarneCocida').textContent;
    if (costoPorKgCarneCocidaText === "" || costoPorKgCarneCocidaText === "NaN" || costoPorKgCarneCocidaText === "N/A (Verificar merma)") {
        document.getElementById('precioVentaCarneKg').textContent = "N/A";
        return;
    }
    const costoPorKgCarneCocida = parseFloat(costoPorKgCarneCocidaText);
    const margenGananciaCarneKg = parseFloat(document.getElementById('margenGananciaCarneKg').value);

    if (isNaN(costoPorKgCarneCocida) || isNaN(margenGananciaCarneKg)) {
        document.getElementById('precioVentaCarneKg').textContent = "Error";
        return;
    }

    const precioVenta = costoPorKgCarneCocida * (1 + (margenGananciaCarneKg / 100));
    document.getElementById('precioVentaCarneKg').textContent = precioVenta.toFixed(2);
}

function displayPaquetes(paquetes) {
    const container = document.getElementById('sugerenciasPaquetes');
    container.innerHTML = ''; // Clear previous suggestions

    if (paquetes.length === 0) {
        container.innerHTML = '<p>No hay sugerencias de paquetes de carne disponibles. Asegúrate de calcular los costos primero y definir un margen.</p>';
        return;
    }

    const ul = document.createElement('ul');
    paquetes.forEach(paquete => {
        const li = document.createElement('li');
        li.textContent = `Paquete de ${paquete.nombre}: ${paquete.peso.toFixed(2)} kg - Precio Sugerido: MXN ${paquete.precio.toFixed(2)} (Ganancia: MXN ${paquete.ganancia.toFixed(2)})`;
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

function generarSugerenciasPaquetes() {
    const costoPorKgCarneCocidaText = document.getElementById('costoPorKgCarneCocida').textContent;
    const margenGananciaText = document.getElementById('margenGananciaCarneKg').value;

    if (costoPorKgCarneCocidaText === "" || costoPorKgCarneCocidaText === "NaN" || costoPorKgCarneCocidaText === "N/A (Verificar merma)" || margenGananciaText === "") {
        displayPaquetes([]);
        return;
    }

    const costoPorKg = parseFloat(costoPorKgCarneCocidaText);
    const margenGanancia = parseFloat(margenGananciaText) / 100;

    if (isNaN(costoPorKg) || isNaN(margenGanancia)) {
        displayPaquetes([]);
        return;
    }

    const precioVentaPorKg = costoPorKg * (1 + margenGanancia);

    const paquetesDefinidos = [
        { nombre: "1/4 kg", peso: 0.250 },
        { nombre: "1/2 kg", peso: 0.500 },
        { nombre: "3/4 kg", peso: 0.750 },
        { nombre: "1 kg", peso: 1.000 }
    ];

    const paquetesSugeridos = paquetesDefinidos.map(p => {
        const precioPaquete = p.peso * precioVentaPorKg;
        const costoPaquete = p.peso * costoPorKg;
        const gananciaPaquete = precioPaquete - costoPaquete;
        return {
            ...p,
            precio: precioPaquete,
            ganancia: gananciaPaquete
        };
    });

    displayPaquetes(paquetesSugeridos);
}

function displayPaquetesCombinados(paquetes) {
    const container = document.getElementById('sugerenciasPaquetesCombinados');
    container.innerHTML = ''; // Clear previous suggestions

    if (paquetes.length === 0) {
        container.innerHTML = '<p>No hay sugerencias de paquetes combinados disponibles. Verifica los costos base y el margen de ganancia, luego haz clic en "Generar Paquetes Combinados".</p>';
        return;
    }

    const ul = document.createElement('ul');
    paquetes.forEach(paquete => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${paquete.nombre}</strong>: <br>
                        Contenido: ${paquete.descripcion}<br>
                        Costo Total del Paquete: MXN ${paquete.costoTotal.toFixed(2)}<br>
                        Precio de Venta Sugerido: MXN ${paquete.precioSugerido.toFixed(2)}<br>
                        Ganancia del Paquete: MXN ${paquete.ganancia.toFixed(2)}`;
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

function generarPaquetesCombinados() {
    const costoPorTacoText = document.getElementById('costoPorTaco').textContent;
    const costoConsomeChicoText = document.getElementById('costoConsomeChico').textContent;
    const costoBebida = parseFloat(document.getElementById('costoBebida').value);
    const margenGananciaCombo = parseFloat(document.getElementById('margenGananciaCombo').value) / 100;

    const precioTaco = parseFloat(document.getElementById('precioTaco').value);
    const precioConsomeChico = parseFloat(document.getElementById('precioConsomeChico').value);
    const precioBebida = parseFloat(document.getElementById('precioBebida').value);


    if (costoPorTacoText === "" || costoPorTacoText === "N/A" || isNaN(costoBebida) || isNaN(margenGananciaCombo) ||
        costoConsomeChicoText === "" || costoConsomeChicoText === "N/A" || isNaN(precioTaco) || isNaN(precioConsomeChico) || isNaN(precioBebida) ) {
        alert("Asegúrate de que los costos base (tacos, consomé) estén calculados y que los costos/precios de bebida, y el margen de ganancia para combos sean válidos.");
        displayPaquetesCombinados([]);
        return;
    }

    const costoTaco = parseFloat(costoPorTacoText);
    const costoConsChico = parseFloat(costoConsomeChicoText);

    const combosDefinidos = [
        {
            nombre: "Combo Personal",
            descripcion: "2 Tacos, 1 Consomé Chico, 1 Bebida",
            items: [
                { tipo: "Taco", costo: costoTaco, cantidad: 2, precioVentaIndividual: precioTaco },
                { tipo: "Consomé Chico", costo: costoConsChico, cantidad: 1, precioVentaIndividual: precioConsomeChico },
                { tipo: "Bebida", costo: costoBebida, cantidad: 1, precioVentaIndividual: precioBebida }
            ]
        },
        {
            nombre: "Combo Amigos",
            descripcion: "5 Tacos, 2 Consomés Chicos, 2 Bebidas",
            items: [
                { tipo: "Taco", costo: costoTaco, cantidad: 5, precioVentaIndividual: precioTaco },
                { tipo: "Consomé Chico", costo: costoConsChico, cantidad: 2, precioVentaIndividual: precioConsomeChico },
                { tipo: "Bebida", costo: costoBebida, cantidad: 2, precioVentaIndividual: precioBebida }
            ]
        },
        {
            nombre: "Paquete Familiar (promo)",
            descripcion: "10 Tacos, 4 Consomés Chicos, 4 Bebidas",
            items: [
                { tipo: "Taco", costo: costoTaco, cantidad: 10, precioVentaIndividual: precioTaco },
                { tipo: "Consomé Chico", costo: costoConsChico, cantidad: 4, precioVentaIndividual: precioConsomeChico },
                { tipo: "Bebida", costo: costoBebida, cantidad: 4, precioVentaIndividual: precioBebida }
            ],
            descuentoComboPorcentaje: 0.05
        }
    ];

    const paquetesSugeridos = combosDefinidos.map(combo => {
        let costoTotalPaquete = 0;
        let precioIndividualTotal = 0;
        combo.items.forEach(item => {
            costoTotalPaquete += item.costo * item.cantidad;
            precioIndividualTotal += item.precioVentaIndividual * item.cantidad;
        });

        let precioSugerido;
        if (combo.descuentoComboPorcentaje) {
            precioSugerido = precioIndividualTotal * (1 - combo.descuentoComboPorcentaje);
        } else {
            precioSugerido = costoTotalPaquete * (1 + margenGananciaCombo);
        }

        const gananciaPaquete = precioSugerido - costoTotalPaquete;

        return {
            nombre: combo.nombre,
            descripcion: combo.descripcion,
            costoTotal: costoTotalPaquete,
            precioSugerido: precioSugerido,
            ganancia: gananciaPaquete
        };
    });

    displayPaquetesCombinados(paquetesSugeridos);
}


window.onload = () => {
   generarSugerenciasPaquetes();
   displayPaquetesCombinados([]);

   const costoPorKgText = document.getElementById('costoPorKgCarneCocida').textContent;
   const margenGananciaText = document.getElementById('margenGananciaCarneKg').value;

   if (!costoPorKgText || costoPorKgText === "N/A (Verificar merma)" || costoPorKgText === "NaN" || costoPorKgText === "" || !margenGananciaText || margenGananciaText ==="") {
        document.getElementById('precioVentaCarneKg').textContent = "N/A";
   } else {
        calcularPrecioVentaCarneKg();
   }

    // Collapsible sections logic is initiated by its own DOMContentLoaded listener below
};

// Combined DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
    // Collapsible sections logic
    const collapsibleSections = document.querySelectorAll('.collapsible-section');
    collapsibleSections.forEach(section => {
        const header = section.querySelector('h2');
        const toggleBtn = header.querySelector('.toggle-btn');
        const content = section.querySelector('.collapsible-content');

        if (section.id === 'resultados' || section.id === 'inputs') {
            content.style.display = 'block';
            toggleBtn.textContent = '-';
        } else {
            content.style.display = 'none';
            toggleBtn.textContent = '+';
        }

        header.addEventListener('click', (event) => {
            if (event.target.closest('input, label, button') !== toggleBtn && event.target !== header) {
                if(event.target !== toggleBtn && event.target.parentElement !== header && event.target.parentElement.parentElement !==header) {
                    return;
                }
            }
            const isCollapsed = content.style.display === 'none';
            content.style.display = isCollapsed ? 'block' : 'none';
            toggleBtn.textContent = isCollapsed ? '-' : '+';
        });
    });

    // Print report button listener
    const printReportBtn = document.getElementById('printReportBtn');
    if (printReportBtn) {
        printReportBtn.addEventListener('click', generateAndPrintReport);
    }
});

function generateAndPrintReport() {
    const printArea = document.getElementById('print-area');
    if (!printArea) {
        console.error("Print area not found!");
        return;
    }

    let reportHTML = `
        <div class="report-container">
            <h1>Reporte de Costos de Barbacoa</h1>
            <div class="report-section">
                <h2>Valores de Entrada</h2>
                <p><strong>Costo Total de Carne Cruda:</strong> MXN ${document.getElementById('costoCarneCruda').value}</p>
                <p><strong>Peso Piernas (c/u):</strong> ${document.getElementById('pesoPiernas').value} kg x ${document.getElementById('cantidadPiernas').value}</p>
                <p><strong>Peso Espaldillas (c/u):</strong> ${document.getElementById('pesoEspaldillas').value} kg x ${document.getElementById('cantidadEspaldillas').value}</p>
                <p><strong>Peso Costillas (c/u):</strong> ${document.getElementById('pesoCostillas').value} kg x ${document.getElementById('cantidadCostillas').value}</p>
                <p><strong>Peso Lomo (c/u):</strong> ${document.getElementById('pesoLomo').value} kg x ${document.getElementById('cantidadLomo').value}</p>
                <p><strong>Costo Ingredientes:</strong> MXN ${document.getElementById('costoIngredientes').value}</p>
                <p><strong>Merma por Cocimiento y Hueso:</strong> ${document.getElementById('mermaCocimiento').value} kg</p>
                <hr>
                <p><strong>Precio de Venta Taco:</strong> MXN ${document.getElementById('precioTaco').value}</p>
                <p><strong>Precio Consomé Chico (200ml):</strong> MXN ${document.getElementById('precioConsomeChico').value}</p>
                <p><strong>Precio Consomé Grande (500ml):</strong> MXN ${document.getElementById('precioConsomeGrande').value}</p>
                <p><strong>Costo Promedio Bebida:</strong> MXN ${document.getElementById('costoBebida').value}</p>
                <p><strong>Precio de Venta Bebida:</strong> MXN ${document.getElementById('precioBebida').value}</p>
            </div>

            <div class="report-section">
                <h2>Resultados del Cálculo</h2>

                <div class="subsection-report" id="reportResultadosCarne">
                    <h3>Análisis de Carne (Rendimiento y Costos)</h3>
                    <p><strong>Peso Total Carne Cruda:</strong> ${document.getElementById('pesoTotalCarneCruda').textContent} kg</p>
                    <p><strong>Peso Neto Carne Cocida:</strong> ${document.getElementById('pesoNetoCarneCocida').textContent} kg</p>
                    <p><strong>Costo Total de Producción:</strong> MXN ${document.getElementById('costoTotalProduccion').textContent}</p>
                    <p><strong>Costo por Kg Carne Cocida:</strong> MXN ${document.getElementById('costoPorKgCarneCocida').textContent}</p>
                </div>

                <div class="subsection-report" id="reportResultadosTacos">
                    <h3>Análisis de Tacos</h3>
                    <p><strong>Número de Tacos Estimado (100g por taco):</strong> ${document.getElementById('numeroTacosEstimado').textContent}</p>
                    <p><strong>Costo por Taco:</strong> MXN ${document.getElementById('costoPorTaco').textContent}</p>
                    <p><strong>Ganancia por Taco:</strong> MXN ${document.getElementById('gananciaPorTaco').textContent}</p>
                    <p><strong>Ingresos Totales por Tacos:</strong> MXN ${document.getElementById('ingresosPorTacos').textContent}</p>
                    <p><strong>Ganancia Total por Tacos:</strong> MXN ${document.getElementById('gananciaTotalPorTacos').textContent}</p>
                </div>

                <div class="subsection-report" id="reportResultadosConsome">
                    <h3>Análisis de Consomé</h3>
                    <p><strong>Costo Consomé Chico (Estimado):</strong> MXN ${document.getElementById('costoConsomeChico').textContent}</p>
                    <p><strong>Ganancia por Consomé Chico:</strong> MXN ${document.getElementById('gananciaConsomeChico').textContent}</p>
                    <p><strong>Costo Consomé Grande (Estimado):</strong> MXN ${document.getElementById('costoConsomeGrande').textContent}</p>
                    <p><strong>Ganancia por Consomé Grande:</strong> MXN ${document.getElementById('gananciaConsomeGrande').textContent}</p>
                </div>
            </div>
    `;

    const precioVentaCarneKgText = document.getElementById('precioVentaCarneKg').textContent;
    if (precioVentaCarneKgText && precioVentaCarneKgText !== 'N/A' && precioVentaCarneKgText.trim() !== "") {
        reportHTML += `
            <div class="report-section">
                <h2>Venta de Carne por Kilo</h2>
                <p><strong>Margen de Ganancia para Venta por Kg:</strong> ${document.getElementById('margenGananciaCarneKg').value}%</p>
                <p><strong>Precio de Venta por Kg de Carne Cocida:</strong> MXN ${precioVentaCarneKgText}</p>
            </div>
        `;
    }

    const sugerenciasPaquetesContent = document.getElementById('sugerenciasPaquetes').innerHTML;
    if (sugerenciasPaquetesContent && !sugerenciasPaquetesContent.includes("no implementada") && !sugerenciasPaquetesContent.includes("No hay sugerencias")) {
        reportHTML += `
            <div class="report-section">
                <h2>Sugerencias de Paquetes de Carne</h2>
                ${sugerenciasPaquetesContent}
            </div>
        `;
    }

    const sugerenciasPaquetesCombinadosContent = document.getElementById('sugerenciasPaquetesCombinados').innerHTML;
     if (sugerenciasPaquetesCombinadosContent && !sugerenciasPaquetesCombinadosContent.includes("no implementada") && !sugerenciasPaquetesCombinadosContent.includes("No hay sugerencias")) {
        reportHTML += `
            <div class="report-section">
                <h2>Sugerencias de Paquetes Combinados</h2>
                <p><strong>Margen de Ganancia para Paquetes Combinados:</strong> ${document.getElementById('margenGananciaCombo').value}%</p>
                ${sugerenciasPaquetesCombinadosContent}
            </div>
        `;
    }

    reportHTML += `
            <div class="report-footer">
                <p>Reporte generado el: ${new Date().toLocaleString('es-MX')}</p>
            </div>
        </div>
    `;

    printArea.innerHTML = reportHTML;

    document.body.classList.add('printing'); // Though not strictly necessary with current @media print
    window.print();
    // document.body.classList.remove('printing'); // Can be added if issues occur post-print
}
