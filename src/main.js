import { Calculator } from './js/calculator.js';
import { UIManager } from './js/ui-manager.js';
import { DataManager } from './js/data-manager.js';
import { ReportGenerator } from './js/report-generator.js';
import { Analytics } from './js/analytics.js';
import { createIcons } from 'lucide';

class BarbacoaApp {
    constructor() {
        this.calculator = new Calculator();
        this.uiManager = new UIManager();
        this.dataManager = new DataManager();
        this.reportGenerator = new ReportGenerator();
        this.analytics = new Analytics();
        
        this.currentProject = {
            name: 'Mi Proyecto de Barbacoa',
            description: '',
            data: {},
            results: {},
            lastSaved: null,
            id: this.generateId()
        };
        
        this.init();
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    async init() {
        // Show loading screen
        this.showLoadingScreen();
        
        // Initialize components
        await this.initializeComponents();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load saved data if exists
        await this.loadLastProject();
        
        // Hide loading screen and show app
        this.hideLoadingScreen();
        
        // Initialize icons
        createIcons();
        
        // Show welcome message
        this.uiManager.showToast('¡Bienvenido a Barbacoa Pro!', 'success');
    }
    
    showLoadingScreen() {
        document.getElementById('loading-screen').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }
    
    hideLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
            document.getElementById('main-app').classList.remove('hidden');
        }, 1500);
    }
    
    async initializeComponents() {
        await this.uiManager.init();
        await this.dataManager.init();
        await this.reportGenerator.init();
        await this.analytics.init();
    }
    
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                this.uiManager.switchTab(tabId);
            });
        });
        
        // Calculate button
        document.getElementById('calculate-btn').addEventListener('click', () => {
            this.performCalculation();
        });
        
        // Project management
        document.getElementById('save-project-btn').addEventListener('click', () => {
            this.openSaveModal();
        });
        
        document.getElementById('load-project-btn').addEventListener('click', () => {
            this.openLoadModal();
        });
        
        document.getElementById('new-project-btn').addEventListener('click', () => {
            this.createNewProject();
        });
        
        // Report generation
        document.getElementById('export-pdf-btn').addEventListener('click', () => {
            this.exportToPDF();
        });
        
        document.getElementById('print-report-btn').addEventListener('click', () => {
            this.printReport();
        });
        
        document.getElementById('export-data-btn').addEventListener('click', () => {
            this.exportData();
        });
        
        // Modal handlers
        document.getElementById('confirm-save-btn').addEventListener('click', () => {
            this.saveProject();
        });
        
        document.getElementById('load-file-input').addEventListener('change', (e) => {
            this.loadFromFile(e.target.files[0]);
        });
        
        // Auto-save on input changes
        this.setupAutoSave();
        
        // Project name changes
        document.getElementById('project-name').addEventListener('input', (e) => {
            this.currentProject.name = e.target.value;
            this.markAsModified();
        });
    }
    
    setupAutoSave() {
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.markAsModified();
                // Auto-save after 2 seconds of inactivity
                clearTimeout(this.autoSaveTimeout);
                this.autoSaveTimeout = setTimeout(() => {
                    this.autoSave();
                }, 2000);
            });
        });
    }
    
    markAsModified() {
        const statusIndicator = document.getElementById('project-status');
        statusIndicator.className = 'status-indicator modified';
        statusIndicator.title = 'Proyecto modificado';
    }
    
    markAsSaved() {
        const statusIndicator = document.getElementById('project-status');
        statusIndicator.className = 'status-indicator saved';
        statusIndicator.title = 'Proyecto guardado';
        
        const lastSaved = document.getElementById('last-saved');
        lastSaved.textContent = `Último guardado: ${new Date().toLocaleString('es-MX')}`;
    }
    
    async performCalculation() {
        try {
            // Show loading state
            const calculateBtn = document.getElementById('calculate-btn');
            const originalText = calculateBtn.innerHTML;
            calculateBtn.innerHTML = '<i data-lucide="loader-2"></i> Calculando...';
            calculateBtn.disabled = true;
            
            // Get input data
            const inputData = this.getInputData();
            
            // Perform calculations
            const results = await this.calculator.calculate(inputData);
            
            // Store results
            this.currentProject.data = inputData;
            this.currentProject.results = results;
            
            // Update UI with results
            await this.updateResultsUI(results);
            
            // Generate analytics
            await this.analytics.generateCharts(results);
            
            // Show success message
            this.uiManager.showToast('Cálculos completados exitosamente', 'success');
            
            // Switch to results tab
            this.uiManager.switchTab('results');
            
        } catch (error) {
            console.error('Error in calculation:', error);
            this.uiManager.showToast('Error en el cálculo. Verifica los datos ingresados.', 'error');
        } finally {
            // Restore button state
            const calculateBtn = document.getElementById('calculate-btn');
            calculateBtn.innerHTML = '<i data-lucide="calculator"></i> Calcular Costos y Rentabilidad';
            calculateBtn.disabled = false;
            createIcons();
        }
    }
    
    getInputData() {
        return {
            costoCarneCruda: parseFloat(document.getElementById('costoCarneCruda').value) || 0,
            pesoPiernas: parseFloat(document.getElementById('pesoPiernas').value) || 0,
            cantidadPiernas: parseInt(document.getElementById('cantidadPiernas').value) || 0,
            pesoEspaldillas: parseFloat(document.getElementById('pesoEspaldillas').value) || 0,
            cantidadEspaldillas: parseInt(document.getElementById('cantidadEspaldillas').value) || 0,
            pesoCostillas: parseFloat(document.getElementById('pesoCostillas').value) || 0,
            cantidadCostillas: parseInt(document.getElementById('cantidadCostillas').value) || 0,
            pesoLomo: parseFloat(document.getElementById('pesoLomo').value) || 0,
            cantidadLomo: parseInt(document.getElementById('cantidadLomo').value) || 0,
            costoIngredientes: parseFloat(document.getElementById('costoIngredientes').value) || 0,
            mermaCocimiento: parseFloat(document.getElementById('mermaCocimiento').value) || 0,
            precioTaco: parseFloat(document.getElementById('precioTaco').value) || 0,
            precioConsomeChico: parseFloat(document.getElementById('precioConsomeChico').value) || 0,
            precioConsomeGrande: parseFloat(document.getElementById('precioConsomeGrande').value) || 0,
            costoBebida: parseFloat(document.getElementById('costoBebida').value) || 0,
            precioBebida: parseFloat(document.getElementById('precioBebida').value) || 0
        };
    }
    
    async updateResultsUI(results) {
        const resultsContent = document.getElementById('results-content');
        const packagesContent = document.getElementById('packages-content');
        
        // Generate results HTML
        resultsContent.innerHTML = this.generateResultsHTML(results);
        packagesContent.innerHTML = this.generatePackagesHTML(results);
    }
    
    generateResultsHTML(results) {
        return `
            <div class="results-grid">
                <div class="metric-card primary">
                    <div class="metric-icon">🥩</div>
                    <div class="metric-content">
                        <h3>Carne Cocida Total</h3>
                        <div class="metric-value">${results.pesoNetoCarneCocida.toFixed(2)} kg</div>
                        <div class="metric-change">De ${results.pesoTotalCarneCruda.toFixed(2)} kg cruda</div>
                    </div>
                </div>
                
                <div class="metric-card success">
                    <div class="metric-icon">💰</div>
                    <div class="metric-content">
                        <h3>Costo por Kg</h3>
                        <div class="metric-value">$${results.costoPorKgCarneCocida.toFixed(2)}</div>
                        <div class="metric-change">Costo total: $${results.costoTotalProduccion.toFixed(2)}</div>
                    </div>
                </div>
                
                <div class="metric-card info">
                    <div class="metric-icon">🌮</div>
                    <div class="metric-content">
                        <h3>Tacos Estimados</h3>
                        <div class="metric-value">${results.numeroTacosEstimado}</div>
                        <div class="metric-change">100g por taco</div>
                    </div>
                </div>
                
                <div class="metric-card ${results.gananciaPorTaco >= 0 ? 'success' : 'warning'}">
                    <div class="metric-icon">${results.gananciaPorTaco >= 0 ? '📈' : '📉'}</div>
                    <div class="metric-content">
                        <h3>Ganancia por Taco</h3>
                        <div class="metric-value">$${results.gananciaPorTaco.toFixed(2)}</div>
                        <div class="metric-change">Precio: $${results.precioTaco.toFixed(2)}</div>
                    </div>
                </div>
            </div>
            
            <div class="section-card">
                <div class="section-header">
                    <h2>Análisis Detallado de Costos</h2>
                </div>
                <div class="analysis-grid">
                    <div class="analysis-section">
                        <h3>Análisis de Carne</h3>
                        <div class="analysis-items">
                            <div class="analysis-item">
                                <span class="label">Peso Total Carne Cruda:</span>
                                <span class="value">${results.pesoTotalCarneCruda.toFixed(2)} kg</span>
                            </div>
                            <div class="analysis-item">
                                <span class="label">Peso Neto Carne Cocida:</span>
                                <span class="value">${results.pesoNetoCarneCocida.toFixed(2)} kg</span>
                            </div>
                            <div class="analysis-item">
                                <span class="label">Merma de Cocción:</span>
                                <span class="value">${((results.pesoTotalCarneCruda - results.pesoNetoCarneCocida) / results.pesoTotalCarneCruda * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analysis-section">
                        <h3>Análisis de Tacos</h3>
                        <div class="analysis-items">
                            <div class="analysis-item">
                                <span class="label">Costo por Taco:</span>
                                <span class="value">$${results.costoPorTaco.toFixed(2)}</span>
                            </div>
                            <div class="analysis-item">
                                <span class="label">Ingresos Totales:</span>
                                <span class="value">$${results.ingresosPorTacos.toFixed(2)}</span>
                            </div>
                            <div class="analysis-item">
                                <span class="label">Ganancia Total:</span>
                                <span class="value ${results.gananciaTotalPorTacos >= 0 ? 'positive' : 'negative'}">$${results.gananciaTotalPorTacos.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analysis-section">
                        <h3>Análisis de Consomé</h3>
                        <div class="analysis-items">
                            <div class="analysis-item">
                                <span class="label">Ganancia Consomé Chico:</span>
                                <span class="value">$${results.gananciaConsomeChico.toFixed(2)}</span>
                            </div>
                            <div class="analysis-item">
                                <span class="label">Ganancia Consomé Grande:</span>
                                <span class="value">$${results.gananciaConsomeGrande.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    generatePackagesHTML(results) {
        const packages = this.calculator.generatePackages(results);
        const combos = this.calculator.generateCombos(results);
        
        return `
            <div class="section-card">
                <div class="section-header">
                    <h2>Paquetes de Carne</h2>
                    <p>Precios sugeridos para venta por peso</p>
                </div>
                <div class="packages-grid">
                    ${packages.map(pkg => `
                        <div class="package-card">
                            <div class="package-header">
                                <h3>${pkg.nombre}</h3>
                                <div class="package-weight">${pkg.peso.toFixed(2)} kg</div>
                            </div>
                            <div class="package-pricing">
                                <div class="price-main">$${pkg.precio.toFixed(2)}</div>
                                <div class="price-profit">Ganancia: $${pkg.ganancia.toFixed(2)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="section-card">
                <div class="section-header">
                    <h2>Paquetes Combinados</h2>
                    <p>Combos con tacos, consomé y bebidas</p>
                </div>
                <div class="combos-grid">
                    ${combos.map(combo => `
                        <div class="combo-card">
                            <div class="combo-header">
                                <h3>${combo.nombre}</h3>
                                <div class="combo-description">${combo.descripcion}</div>
                            </div>
                            <div class="combo-pricing">
                                <div class="price-breakdown">
                                    <span class="cost">Costo: $${combo.costoTotal.toFixed(2)}</span>
                                    <span class="price">Precio: $${combo.precioSugerido.toFixed(2)}</span>
                                </div>
                                <div class="profit ${combo.ganancia >= 0 ? 'positive' : 'negative'}">
                                    Ganancia: $${combo.ganancia.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Project Management Methods
    openSaveModal() {
        document.getElementById('save-project-name').value = this.currentProject.name;
        document.getElementById('save-project-description').value = this.currentProject.description;
        this.uiManager.openModal('save-modal');
    }
    
    async openLoadModal() {
        const projects = await this.dataManager.getAllProjects();
        const projectsList = document.getElementById('projects-list');
        
        if (projects.length === 0) {
            projectsList.innerHTML = '<div class="no-projects">No hay proyectos guardados</div>';
        } else {
            projectsList.innerHTML = projects.map(project => `
                <div class="project-item" data-id="${project.id}">
                    <div class="project-info">
                        <h4>${project.name}</h4>
                        <p>${project.description || 'Sin descripción'}</p>
                        <small>Guardado: ${new Date(project.lastSaved).toLocaleString('es-MX')}</small>
                    </div>
                    <div class="project-actions">
                        <button class="btn btn-small btn-primary" onclick="app.loadProject('${project.id}')">Cargar</button>
                        <button class="btn btn-small btn-danger" onclick="app.deleteProject('${project.id}')">Eliminar</button>
                    </div>
                </div>
            `).join('');
        }
        
        this.uiManager.openModal('load-modal');
    }
    
    async saveProject() {
        const name = document.getElementById('save-project-name').value.trim();
        const description = document.getElementById('save-project-description').value.trim();
        
        if (!name) {
            this.uiManager.showToast('El nombre del proyecto es requerido', 'error');
            return;
        }
        
        this.currentProject.name = name;
        this.currentProject.description = description;
        this.currentProject.lastSaved = new Date().toISOString();
        
        try {
            await this.dataManager.saveProject(this.currentProject);
            this.markAsSaved();
            this.uiManager.closeModal('save-modal');
            this.uiManager.showToast('Proyecto guardado exitosamente', 'success');
            
            // Update project name in header
            document.getElementById('project-name').value = name;
        } catch (error) {
            console.error('Error saving project:', error);
            this.uiManager.showToast('Error al guardar el proyecto', 'error');
        }
    }
    
    async loadProject(projectId) {
        try {
            const project = await this.dataManager.getProject(projectId);
            if (project) {
                this.currentProject = project;
                this.loadProjectData(project);
                this.uiManager.closeModal('load-modal');
                this.uiManager.showToast('Proyecto cargado exitosamente', 'success');
            }
        } catch (error) {
            console.error('Error loading project:', error);
            this.uiManager.showToast('Error al cargar el proyecto', 'error');
        }
    }
    
    loadProjectData(project) {
        // Update project name
        document.getElementById('project-name').value = project.name;
        
        // Load input data
        if (project.data) {
            Object.keys(project.data).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = project.data[key];
                }
            });
        }
        
        // Load results if available
        if (project.results) {
            this.updateResultsUI(project.results);
            this.analytics.generateCharts(project.results);
        }
        
        this.markAsSaved();
    }
    
    async deleteProject(projectId) {
        if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
            try {
                await this.dataManager.deleteProject(projectId);
                this.openLoadModal(); // Refresh the list
                this.uiManager.showToast('Proyecto eliminado', 'success');
            } catch (error) {
                console.error('Error deleting project:', error);
                this.uiManager.showToast('Error al eliminar el proyecto', 'error');
            }
        }
    }
    
    createNewProject() {
        if (confirm('¿Crear un nuevo proyecto? Los cambios no guardados se perderán.')) {
            this.currentProject = {
                name: 'Nuevo Proyecto de Barbacoa',
                description: '',
                data: {},
                results: {},
                lastSaved: null,
                id: this.generateId()
            };
            
            // Reset form
            document.querySelectorAll('input[type="number"]').forEach(input => {
                input.value = input.defaultValue || '';
            });
            
            // Clear results
            document.getElementById('results-content').innerHTML = '<div class="results-placeholder"><i data-lucide="bar-chart-3"></i><h3>Realiza el cálculo para ver los resultados</h3></div>';
            document.getElementById('packages-content').innerHTML = '<div class="results-placeholder"><i data-lucide="package"></i><h3>Genera paquetes después del cálculo</h3></div>';
            document.getElementById('analytics-content').innerHTML = '<div class="results-placeholder"><i data-lucide="trending-up"></i><h3>Análisis visual de rentabilidad</h3></div>';
            
            // Update UI
            document.getElementById('project-name').value = this.currentProject.name;
            document.getElementById('last-saved').textContent = 'Último guardado: Nunca';
            
            // Switch to inputs tab
            this.uiManager.switchTab('inputs');
            
            this.uiManager.showToast('Nuevo proyecto creado', 'success');
            createIcons();
        }
    }
    
    async loadFromFile(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            const project = JSON.parse(text);
            
            this.currentProject = {
                ...project,
                id: this.generateId(),
                lastSaved: null
            };
            
            this.loadProjectData(this.currentProject);
            this.uiManager.closeModal('load-modal');
            this.uiManager.showToast('Proyecto importado exitosamente', 'success');
        } catch (error) {
            console.error('Error loading file:', error);
            this.uiManager.showToast('Error al cargar el archivo', 'error');
        }
    }
    
    async autoSave() {
        if (this.currentProject.lastSaved) {
            this.currentProject.data = this.getInputData();
            await this.dataManager.saveProject(this.currentProject);
            this.markAsSaved();
        }
    }
    
    async loadLastProject() {
        const lastProject = await this.dataManager.getLastProject();
        if (lastProject) {
            this.currentProject = lastProject;
            this.loadProjectData(lastProject);
        }
    }
    
    // Report Methods
    async exportToPDF() {
        if (!this.currentProject.results) {
            this.uiManager.showToast('Realiza el cálculo antes de exportar', 'warning');
            return;
        }
        
        try {
            await this.reportGenerator.generatePDF(this.currentProject);
            this.uiManager.showToast('PDF generado exitosamente', 'success');
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.uiManager.showToast('Error al generar el PDF', 'error');
        }
    }
    
    async printReport() {
        if (!this.currentProject.results) {
            this.uiManager.showToast('Realiza el cálculo antes de imprimir', 'warning');
            return;
        }
        
        try {
            await this.reportGenerator.printReport(this.currentProject);
        } catch (error) {
            console.error('Error printing report:', error);
            this.uiManager.showToast('Error al imprimir el reporte', 'error');
        }
    }
    
    exportData() {
        const dataStr = JSON.stringify(this.currentProject, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.currentProject.name.replace(/[^a-z0-9]/gi, '_')}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.uiManager.showToast('Datos exportados exitosamente', 'success');
    }
}

// Global app instance
window.app = new BarbacoaApp();

// Global modal functions
window.openModal = (modalId) => window.app.uiManager.openModal(modalId);
window.closeModal = (modalId) => window.app.uiManager.closeModal(modalId);