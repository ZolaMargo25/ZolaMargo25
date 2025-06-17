export class Calculator {
    constructor() {
        this.results = {};
    }
    
    async calculate(data) {
        // Calculate total raw meat weight
        const pesoTotalCarneCruda = 
            (data.pesoPiernas * data.cantidadPiernas) +
            (data.pesoEspaldillas * data.cantidadEspaldillas) +
            (data.pesoCostillas * data.cantidadCostillas) +
            (data.pesoLomo * data.cantidadLomo);
        
        // Calculate total production cost
        const costoTotalProduccion = data.costoCarneCruda + data.costoIngredientes;
        
        // Calculate net cooked meat weight
        const pesoNetoCarneCocida = Math.max(0, pesoTotalCarneCruda - data.mermaCocimiento);
        
        // Calculate cost per kg of cooked meat
        const costoPorKgCarneCocida = pesoNetoCarneCocida > 0 
            ? costoTotalProduccion / pesoNetoCarneCocida 
            : 0;
        
        // Calculate taco metrics
        const gramosPorTaco = 100;
        const tacosPorKg = 1000 / gramosPorTaco;
        const numeroTacosEstimado = Math.floor(pesoNetoCarneCocida * tacosPorKg);
        const costoPorTaco = costoPorKgCarneCocida / tacosPorKg;
        const gananciaPorTaco = data.precioTaco - costoPorTaco;
        const ingresosPorTacos = numeroTacosEstimado * data.precioTaco;
        const gananciaTotalPorTacos = numeroTacosEstimado * gananciaPorTaco;
        
        // Calculate consommé metrics
        const costoTotalConsomeEstimado = data.costoIngredientes * 0.10;
        const volumenTotalConsomeEstimadoMl = 10000; // 10 liters
        const costoPorMlConsome = volumenTotalConsomeEstimadoMl > 0 
            ? costoTotalConsomeEstimado / volumenTotalConsomeEstimadoMl 
            : 0;
        
        const costoConsomeChico = 200 * costoPorMlConsome;
        const gananciaConsomeChico = data.precioConsomeChico - costoConsomeChico;
        const costoConsomeGrande = 500 * costoPorMlConsome;
        const gananciaConsomeGrande = data.precioConsomeGrande - costoConsomeGrande;
        
        // Store input data for reference
        this.results = {
            // Input data
            ...data,
            
            // Calculated results
            pesoTotalCarneCruda,
            costoTotalProduccion,
            pesoNetoCarneCocida,
            costoPorKgCarneCocida,
            numeroTacosEstimado,
            costoPorTaco,
            gananciaPorTaco,
            ingresosPorTacos,
            gananciaTotalPorTacos,
            costoConsomeChico,
            gananciaConsomeChico,
            costoConsomeGrande,
            gananciaConsomeGrande,
            
            // Additional metrics
            margenGananciaTaco: data.precioTaco > 0 ? (gananciaPorTaco / data.precioTaco) * 100 : 0,
            rendimientoCarne: pesoTotalCarneCruda > 0 ? (pesoNetoCarneCocida / pesoTotalCarneCruda) * 100 : 0,
            costoPorGramoTaco: costoPorTaco / 100,
            
            // Profitability analysis
            puntoEquilibrioTacos: gananciaPorTaco > 0 ? Math.ceil(costoTotalProduccion / gananciaPorTaco) : 0,
            roiProyectado: costoTotalProduccion > 0 ? (gananciaTotalPorTacos / costoTotalProduccion) * 100 : 0
        };
        
        return this.results;
    }
    
    generatePackages(results, margenGanancia = 50) {
        if (!results.costoPorKgCarneCocida) return [];
        
        const precioVentaPorKg = results.costoPorKgCarneCocida * (1 + (margenGanancia / 100));
        
        const paquetesDefinidos = [
            { nombre: "Paquete 1/4 kg", peso: 0.250 },
            { nombre: "Paquete 1/2 kg", peso: 0.500 },
            { nombre: "Paquete 3/4 kg", peso: 0.750 },
            { nombre: "Paquete 1 kg", peso: 1.000 },
            { nombre: "Paquete Familiar 2 kg", peso: 2.000 }
        ];
        
        return paquetesDefinidos.map(p => {
            const precio = p.peso * precioVentaPorKg;
            const costo = p.peso * results.costoPorKgCarneCocida;
            const ganancia = precio - costo;
            
            return {
                ...p,
                precio,
                ganancia,
                margen: (ganancia / precio) * 100
            };
        });
    }
    
    generateCombos(results, margenGanancia = 40) {
        if (!results.costoPorTaco || !results.costoConsomeChico) return [];
        
        const combosDefinidos = [
            {
                nombre: "Combo Personal",
                descripcion: "2 Tacos + 1 Consomé Chico + 1 Bebida",
                items: [
                    { tipo: "Taco", costo: results.costoPorTaco, cantidad: 2, precio: results.precioTaco },
                    { tipo: "Consomé Chico", costo: results.costoConsomeChico, cantidad: 1, precio: results.precioConsomeChico },
                    { tipo: "Bebida", costo: results.costoBebida, cantidad: 1, precio: results.precioBebida }
                ]
            },
            {
                nombre: "Combo Amigos",
                descripcion: "5 Tacos + 2 Consomés Chicos + 2 Bebidas",
                items: [
                    { tipo: "Taco", costo: results.costoPorTaco, cantidad: 5, precio: results.precioTaco },
                    { tipo: "Consomé Chico", costo: results.costoConsomeChico, cantidad: 2, precio: results.precioConsomeChico },
                    { tipo: "Bebida", costo: results.costoBebida, cantidad: 2, precio: results.precioBebida }
                ]
            },
            {
                nombre: "Paquete Familiar",
                descripcion: "10 Tacos + 4 Consomés Chicos + 4 Bebidas",
                items: [
                    { tipo: "Taco", costo: results.costoPorTaco, cantidad: 10, precio: results.precioTaco },
                    { tipo: "Consomé Chico", costo: results.costoConsomeChico, cantidad: 4, precio: results.precioConsomeChico },
                    { tipo: "Bebida", costo: results.costoBebida, cantidad: 4, precio: results.precioBebida }
                ],
                descuentoEspecial: 0.05 // 5% discount
            }
        ];
        
        return combosDefinidos.map(combo => {
            let costoTotal = 0;
            let precioIndividualTotal = 0;
            
            combo.items.forEach(item => {
                costoTotal += item.costo * item.cantidad;
                precioIndividualTotal += item.precio * item.cantidad;
            });
            
            let precioSugerido;
            if (combo.descuentoEspecial) {
                precioSugerido = precioIndividualTotal * (1 - combo.descuentoEspecial);
            } else {
                precioSugerido = costoTotal * (1 + (margenGanancia / 100));
            }
            
            const ganancia = precioSugerido - costoTotal;
            const ahorroCliente = precioIndividualTotal - precioSugerido;
            
            return {
                nombre: combo.nombre,
                descripcion: combo.descripcion,
                costoTotal,
                precioSugerido,
                ganancia,
                precioIndividual: precioIndividualTotal,
                ahorroCliente,
                margen: (ganancia / precioSugerido) * 100
            };
        });
    }
}