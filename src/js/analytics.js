import { Chart, registerables } from 'chart.js';

export class Analytics {
    constructor() {
        this.charts = {};
    }
    
    async init() {
        Chart.register(...registerables);
    }
    
    async generateCharts(results) {
        const analyticsContent = document.getElementById('analytics-content');
        
        analyticsContent.innerHTML = `
            <div class="analytics-grid">
                <div class="chart-card">
                    <h3>Distribución de Costos</h3>
                    <canvas id="costsChart"></canvas>
                </div>
                <div class="chart-card">
                    <h3>Análisis de Rentabilidad</h3>
                    <canvas id="profitabilityChart"></canvas>
                </div>
                <div class="chart-card">
                    <h3>Rendimiento de Carne</h3>
                    <canvas id="yieldChart"></canvas>
                </div>
                <div class="chart-card">
                    <h3>Proyección de Ventas</h3>
                    <canvas id="salesChart"></canvas>
                </div>
            </div>
            
            <div class="section-card">
                <div class="section-header">
                    <h2>Métricas Avanzadas</h2>
                </div>
                <div class="advanced-metrics">
                    <div class="metric-row">
                        <div class="metric-item">
                            <span class="metric-label">Margen de Ganancia por Taco</span>
                            <span class="metric-value ${results.margenGananciaTaco >= 0 ? 'positive' : 'negative'}">
                                ${results.margenGananciaTaco?.toFixed(1) || '0.0'}%
                            </span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Punto de Equilibrio</span>
                            <span class="metric-value">${results.puntoEquilibrioTacos || 0} tacos</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">ROI Proyectado</span>
                            <span class="metric-value ${results.roiProyectado >= 0 ? 'positive' : 'negative'}">
                                ${results.roiProyectado?.toFixed(1) || '0.0'}%
                            </span>
                        </div>
                    </div>
                    <div class="metric-row">
                        <div class="metric-item">
                            <span class="metric-label">Costo por Gramo</span>
                            <span class="metric-value">$${results.costoPorGramoTaco?.toFixed(4) || '0.0000'}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Rendimiento de Carne</span>
                            <span class="metric-value">${results.rendimientoCarne?.toFixed(1) || '0.0'}%</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Eficiencia de Costos</span>
                            <span class="metric-value">
                                ${this.calculateCostEfficiency(results).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Generate charts
        await this.createCostsChart(results);
        await this.createProfitabilityChart(results);
        await this.createYieldChart(results);
        await this.createSalesChart(results);
    }
    
    async createCostsChart(results) {
        const ctx = document.getElementById('costsChart');
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.charts.costs) {
            this.charts.costs.destroy();
        }
        
        this.charts.costs = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Carne Cruda', 'Ingredientes'],
                datasets: [{
                    data: [results.costoCarneCruda, results.costoIngredientes],
                    backgroundColor: ['#8B4513', '#CD5C5C'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    async createProfitabilityChart(results) {
        const ctx = document.getElementById('profitabilityChart');
        if (!ctx) return;
        
        if (this.charts.profitability) {
            this.charts.profitability.destroy();
        }
        
        this.charts.profitability = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Costo por Taco', 'Precio de Venta', 'Ganancia'],
                datasets: [{
                    label: 'MXN',
                    data: [results.costoPorTaco, results.precioTaco, results.gananciaPorTaco],
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
                    borderWidth: 1,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    async createYieldChart(results) {
        const ctx = document.getElementById('yieldChart');
        if (!ctx) return;
        
        if (this.charts.yield) {
            this.charts.yield.destroy();
        }
        
        const merma = results.pesoTotalCarneCruda - results.pesoNetoCarneCocida;
        
        this.charts.yield = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Carne Aprovechable', 'Merma'],
                datasets: [{
                    data: [results.pesoNetoCarneCocida, merma],
                    backgroundColor: ['#28a745', '#dc3545'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${value.toFixed(2)} kg (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    async createSalesChart(results) {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;
        
        if (this.charts.sales) {
            this.charts.sales.destroy();
        }
        
        // Create projection data
        const scenarios = [
            { name: '50% Ventas', factor: 0.5 },
            { name: '75% Ventas', factor: 0.75 },
            { name: '100% Ventas', factor: 1.0 },
            { name: '125% Ventas', factor: 1.25 }
        ];
        
        const projectionData = scenarios.map(scenario => ({
            scenario: scenario.name,
            ingresos: results.ingresosPorTacos * scenario.factor,
            ganancias: results.gananciaTotalPorTacos * scenario.factor
        }));
        
        this.charts.sales = new Chart(ctx, {
            type: 'line',
            data: {
                labels: projectionData.map(d => d.scenario),
                datasets: [
                    {
                        label: 'Ingresos',
                        data: projectionData.map(d => d.ingresos),
                        borderColor: '#4ECDC4',
                        backgroundColor: 'rgba(78, 205, 196, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Ganancias',
                        data: projectionData.map(d => d.ganancias),
                        borderColor: '#45B7D1',
                        backgroundColor: 'rgba(69, 183, 209, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    calculateCostEfficiency(results) {
        // Calculate efficiency based on cost per kg vs industry average
        const industryAverage = 300; // Assumed industry average cost per kg
        const efficiency = ((industryAverage - results.costoPorKgCarneCocida) / industryAverage) * 100;
        return Math.max(0, Math.min(100, efficiency + 50)); // Normalize to 0-100 scale
    }
    
    destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
}