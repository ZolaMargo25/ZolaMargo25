import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class ReportGenerator {
    constructor() {
        this.doc = null;
    }
    
    async init() {
        // Initialize any required settings
    }
    
    async generatePDF(project) {
        const { jsPDF } = window.jspdf;
        this.doc = new jsPDF();
        
        // Set up document
        this.setupDocument(project);
        
        // Add content sections
        this.addHeader(project);
        this.addProjectInfo(project);
        this.addInputData(project);
        this.addResults(project);
        this.addPackages(project);
        this.addFooter();
        
        // Save the PDF
        const fileName = `${project.name.replace(/[^a-z0-9]/gi, '_')}_reporte.pdf`;
        this.doc.save(fileName);
    }
    
    setupDocument(project) {
        // Set document properties
        this.doc.setProperties({
            title: `Reporte de Costos - ${project.name}`,
            subject: 'Análisis de Costos de Barbacoa',
            author: 'Barbacoa Pro Calculator',
            creator: 'Barbacoa Pro Calculator'
        });
        
        // Set default font
        this.doc.setFont('helvetica');
    }
    
    addHeader(project) {
        // Logo area (placeholder)
        this.doc.setFillColor(139, 69, 19); // SaddleBrown
        this.doc.rect(20, 20, 170, 25, 'F');
        
        // Title
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(20);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('🥩 BARBACOA PRO', 25, 35);
        
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text('Reporte de Análisis de Costos', 25, 42);
        
        // Reset text color
        this.doc.setTextColor(0, 0, 0);
    }
    
    addProjectInfo(project) {
        let yPos = 60;
        
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('INFORMACIÓN DEL PROYECTO', 20, yPos);
        
        yPos += 10;
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');
        
        this.doc.text(`Nombre: ${project.name}`, 20, yPos);
        yPos += 6;
        
        if (project.description) {
            this.doc.text(`Descripción: ${project.description}`, 20, yPos);
            yPos += 6;
        }
        
        this.doc.text(`Fecha de generación: ${new Date().toLocaleString('es-MX')}`, 20, yPos);
        yPos += 6;
        
        if (project.lastSaved) {
            this.doc.text(`Última modificación: ${new Date(project.lastSaved).toLocaleString('es-MX')}`, 20, yPos);
        }
    }
    
    addInputData(project) {
        let yPos = 100;
        
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('DATOS DE ENTRADA', 20, yPos);
        
        yPos += 10;
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        
        const data = project.data;
        if (!data) return;
        
        // Costs section
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Costos:', 20, yPos);
        yPos += 5;
        this.doc.setFont('helvetica', 'normal');
        
        this.doc.text(`• Costo total carne cruda: $${data.costoCarneCruda?.toFixed(2) || '0.00'} MXN`, 25, yPos);
        yPos += 5;
        this.doc.text(`• Costo ingredientes: $${data.costoIngredientes?.toFixed(2) || '0.00'} MXN`, 25, yPos);
        yPos += 8;
        
        // Meat cuts section
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Cortes de carne:', 20, yPos);
        yPos += 5;
        this.doc.setFont('helvetica', 'normal');
        
        if (data.cantidadPiernas > 0) {
            this.doc.text(`• Piernas: ${data.cantidadPiernas} x ${data.pesoPiernas}kg = ${(data.cantidadPiernas * data.pesoPiernas).toFixed(2)}kg`, 25, yPos);
            yPos += 5;
        }
        
        if (data.cantidadEspaldillas > 0) {
            this.doc.text(`• Espaldillas: ${data.cantidadEspaldillas} x ${data.pesoEspaldillas}kg = ${(data.cantidadEspaldillas * data.pesoEspaldillas).toFixed(2)}kg`, 25, yPos);
            yPos += 5;
        }
        
        if (data.cantidadCostillas > 0) {
            this.doc.text(`• Costillas: ${data.cantidadCostillas} x ${data.pesoCostillas}kg = ${(data.cantidadCostillas * data.pesoCostillas).toFixed(2)}kg`, 25, yPos);
            yPos += 5;
        }
        
        if (data.cantidadLomo > 0) {
            this.doc.text(`• Lomo: ${data.cantidadLomo} x ${data.pesoLomo}kg = ${(data.cantidadLomo * data.pesoLomo).toFixed(2)}kg`, 25, yPos);
            yPos += 5;
        }
        
        yPos += 3;
        this.doc.text(`• Merma por cocimiento: ${data.mermaCocimiento?.toFixed(2) || '0.00'}kg`, 25, yPos);
    }
    
    addResults(project) {
        const results = project.results;
        if (!results) return;
        
        // Add new page if needed
        if (this.doc.internal.pageSize.height - 80 < 150) {
            this.doc.addPage();
            var yPos = 30;
        } else {
            var yPos = 170;
        }
        
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('RESULTADOS DEL ANÁLISIS', 20, yPos);
        
        yPos += 10;
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        
        // Key metrics box
        this.doc.setFillColor(245, 245, 245);
        this.doc.rect(20, yPos, 170, 35, 'F');
        this.doc.setDrawColor(200, 200, 200);
        this.doc.rect(20, yPos, 170, 35, 'S');
        
        yPos += 8;
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('MÉTRICAS CLAVE', 25, yPos);
        
        yPos += 6;
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`Peso neto carne cocida: ${results.pesoNetoCarneCocida?.toFixed(2) || '0.00'} kg`, 25, yPos);
        this.doc.text(`Costo por kg: $${results.costoPorKgCarneCocida?.toFixed(2) || '0.00'}`, 110, yPos);
        
        yPos += 5;
        this.doc.text(`Tacos estimados: ${results.numeroTacosEstimado || 0}`, 25, yPos);
        this.doc.text(`Ganancia por taco: $${results.gananciaPorTaco?.toFixed(2) || '0.00'}`, 110, yPos);
        
        yPos += 5;
        this.doc.text(`Ingresos totales: $${results.ingresosPorTacos?.toFixed(2) || '0.00'}`, 25, yPos);
        this.doc.text(`Ganancia total: $${results.gananciaTotalPorTacos?.toFixed(2) || '0.00'}`, 110, yPos);
        
        yPos += 15;
        
        // Detailed analysis
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('ANÁLISIS DETALLADO', 20, yPos);
        
        yPos += 8;
        this.doc.setFont('helvetica', 'normal');
        
        // Profitability analysis
        if (results.roiProyectado) {
            this.doc.text(`ROI Proyectado: ${results.roiProyectado.toFixed(1)}%`, 20, yPos);
            yPos += 5;
        }
        
        if (results.rendimientoCarne) {
            this.doc.text(`Rendimiento de carne: ${results.rendimientoCarne.toFixed(1)}%`, 20, yPos);
            yPos += 5;
        }
        
        if (results.puntoEquilibrioTacos) {
            this.doc.text(`Punto de equilibrio: ${results.puntoEquilibrioTacos} tacos`, 20, yPos);
            yPos += 5;
        }
    }
    
    addPackages(project) {
        // This would add package information if available
        // Implementation depends on package data structure
    }
    
    addFooter() {
        const pageCount = this.doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);
            
            // Footer line
            this.doc.setDrawColor(139, 69, 19);
            this.doc.line(20, 280, 190, 280);
            
            // Footer text
            this.doc.setFontSize(8);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text('Generado por Barbacoa Pro Calculator', 20, 285);
            this.doc.text(`Página ${i} de ${pageCount}`, 170, 285);
        }
    }
    
    async printReport(project) {
        // Create a printable version
        const printWindow = window.open('', '_blank');
        const printContent = this.generatePrintHTML(project);
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
    }
    
    generatePrintHTML(project) {
        const results = project.results || {};
        const data = project.data || {};
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reporte de Costos - ${project.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    .header { background: #8B4513; color: white; padding: 20px; margin-bottom: 20px; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .header p { margin: 5px 0 0 0; }
                    .section { margin-bottom: 25px; }
                    .section h2 { color: #8B4513; border-bottom: 2px solid #D2B48C; padding-bottom: 5px; }
                    .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0; }
                    .metric-box { border: 1px solid #ddd; padding: 15px; background: #f9f9f9; }
                    .metric-value { font-size: 18px; font-weight: bold; color: #8B4513; }
                    .input-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
                    .input-item { margin-bottom: 8px; }
                    .label { font-weight: bold; }
                    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
                    @media print {
                        body { margin: 0; }
                        .section { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🥩 BARBACOA PRO - REPORTE DE COSTOS</h1>
                    <p>Proyecto: ${project.name}</p>
                    <p>Generado: ${new Date().toLocaleString('es-MX')}</p>
                </div>
                
                <div class="section">
                    <h2>Métricas Principales</h2>
                    <div class="metrics-grid">
                        <div class="metric-box">
                            <div class="label">Carne Cocida Total</div>
                            <div class="metric-value">${results.pesoNetoCarneCocida?.toFixed(2) || '0.00'} kg</div>
                        </div>
                        <div class="metric-box">
                            <div class="label">Costo por Kg</div>
                            <div class="metric-value">$${results.costoPorKgCarneCocida?.toFixed(2) || '0.00'}</div>
                        </div>
                        <div class="metric-box">
                            <div class="label">Tacos Estimados</div>
                            <div class="metric-value">${results.numeroTacosEstimado || 0}</div>
                        </div>
                        <div class="metric-box">
                            <div class="label">Ganancia por Taco</div>
                            <div class="metric-value">$${results.gananciaPorTaco?.toFixed(2) || '0.00'}</div>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2>Datos de Entrada</h2>
                    <div class="input-grid">
                        <div class="input-item">
                            <span class="label">Costo Carne Cruda:</span> $${data.costoCarneCruda?.toFixed(2) || '0.00'}
                        </div>
                        <div class="input-item">
                            <span class="label">Costo Ingredientes:</span> $${data.costoIngredientes?.toFixed(2) || '0.00'}
                        </div>
                        <div class="input-item">
                            <span class="label">Merma Cocimiento:</span> ${data.mermaCocimiento?.toFixed(2) || '0.00'} kg
                        </div>
                        <div class="input-item">
                            <span class="label">Precio Taco:</span> $${data.precioTaco?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2>Análisis de Rentabilidad</h2>
                    <div class="input-grid">
                        <div class="input-item">
                            <span class="label">Ingresos Totales:</span> $${results.ingresosPorTacos?.toFixed(2) || '0.00'}
                        </div>
                        <div class="input-item">
                            <span class="label">Ganancia Total:</span> $${results.gananciaTotalPorTacos?.toFixed(2) || '0.00'}
                        </div>
                        <div class="input-item">
                            <span class="label">ROI Proyectado:</span> ${results.roiProyectado?.toFixed(1) || '0.0'}%
                        </div>
                        <div class="input-item">
                            <span class="label">Rendimiento Carne:</span> ${results.rendimientoCarne?.toFixed(1) || '0.0'}%
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Reporte generado por Barbacoa Pro Calculator</p>
                    <p>${new Date().toLocaleString('es-MX')}</p>
                </div>
            </body>
            </html>
        `;
    }
}