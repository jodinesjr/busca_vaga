/**
 * Main Application Module
 * Handles the main application logic and UI interactions
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchForm = document.getElementById('search-form');
    const companyUrlInput = document.getElementById('company-url');
    const resultsContainer = document.getElementById('results-container');
    const noResults = document.getElementById('no-results');
    const resultsList = document.getElementById('results-list');
    const filterButtons = document.querySelectorAll('[data-filter]');
    
    // Initialize the application
    function init() {
        // Add event listeners
        searchForm.addEventListener('submit', handleSearch);
        filterButtons.forEach(button => {
            button.addEventListener('click', handleFilter);
        });
    }
    
    /**
     * Handle search form submission
     * @param {Event} event - Form submit event
     */
    async function handleSearch(event) {
        event.preventDefault();
        
        const companyUrl = companyUrlInput.value.trim();
        
        if (!companyUrl) {
            showError('Por favor, insira a URL da empresa.');
            return;
        }
        
        try {
            // Show loader
            window.loaderModule.show();
            
            // Clear previous results
            resultsList.innerHTML = '';
            
            // Mostrar mensagem de carregamento
            noResults.classList.remove('d-none');
            resultsList.classList.add('d-none');
            noResults.innerHTML = `
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
                <p class="lead">Buscando vagas para ${companyUrl}...</p>
                <p>Isso pode levar alguns segundos.</p>
            `;
            
            // Scrape jobs
            const data = await jobScraperModule.scrapeAllJobs(companyUrl);
            
            // Hide loader
            window.loaderModule.hide();
            
            // Display results
            if (data.success && data.jobs.length > 0) {
                displayResults(data);
                
                // Salvar na sessão para histórico
                try {
                    const searchHistory = JSON.parse(sessionStorage.getItem('searchHistory')) || [];
                    searchHistory.unshift({
                        companyUrl,
                        companyName: data.companyName,
                        timestamp: new Date().toISOString(),
                        jobCount: data.jobs.length
                    });
                    // Manter apenas as últimas 10 buscas
                    if (searchHistory.length > 10) {
                        searchHistory.pop();
                    }
                    sessionStorage.setItem('searchHistory', JSON.stringify(searchHistory));
                } catch (e) {
                    console.error('Erro ao salvar histórico:', e);
                }
            } else {
                showNoResults(data.companyName);
            }
        } catch (error) {
            console.error('Error searching jobs:', error);
            window.loaderModule.hide();
            showError('Ocorreu um erro ao buscar vagas. Por favor, tente novamente.');
        }
    }
    
    /**
     * Display job results
     * @param {Object} data - Job data
     */
    function displayResults(data) {
        // Hide no results message
        noResults.classList.add('d-none');
        resultsList.classList.remove('d-none');
        
        // Limpar resultados anteriores
        resultsList.innerHTML = '';
        
        // Contar vagas por fonte
        const googleJobs = data.jobs.filter(job => job.source === 'google').length;
        const linkedinJobs = data.jobs.filter(job => job.source === 'linkedin').length;
        
        // Create results header
        const header = document.createElement('div');
        header.className = 'mb-4';
        header.innerHTML = `
            <h4>Encontramos ${data.jobCount} vagas para ${data.companyName}</h4>
            <p class="text-muted">Resultados: ${googleJobs} do Google Jobs e ${linkedinJobs} do LinkedIn</p>
        `;
        resultsList.appendChild(header);
        
        // Agrupar vagas por fonte
        const groupedJobs = {
            google: data.jobs.filter(job => job.source === 'google'),
            linkedin: data.jobs.filter(job => job.source === 'linkedin')
        };
        
        // Criar seções para cada fonte
        Object.keys(groupedJobs).forEach(source => {
            const jobs = groupedJobs[source];
            if (jobs.length > 0) {
                // Criar cabeçalho da seção
                const sourceHeader = document.createElement('div');
                sourceHeader.className = `source-header ${source} mt-4 mb-3`;
                
                let sourceName;
                switch (source) {
                    case 'google':
                        // Não mostrar cabeçalho para Google Jobs
                        sourceHeader.style.display = 'none';
                        sourceName = '';
                        break;
                    case 'linkedin':
                        sourceName = 'LinkedIn';
                        break;
                    default:
                        sourceName = source;
                }
                
                sourceHeader.innerHTML = `
                    <h5>
                        <span class="job-source ${source}">${sourceName}</span>
                        ${source !== 'google' ? `<span class="ms-2">${jobs.length} vagas encontradas</span>` : ''}
                    </h5>
                `;
                resultsList.appendChild(sourceHeader);
                
                // Criar cards para cada vaga
                jobs.forEach(job => {
                    const jobCard = createJobCard(job);
                    resultsList.appendChild(jobCard);
                });
            }
        });
        
        // Reset filters
        resetFilters();
    }
    
    /**
     * Create a job card element
     * @param {Object} job - Job data
     * @returns {HTMLElement} - Job card element
     */
    function createJobCard(job) {
        const card = document.createElement('div');
        
        // Adicionar classes especiais para cards destacados
        let cardClasses = `card job-card ${job.source} mb-3`;
        if (job.highlight) {
            cardClasses += ' border-primary highlight-card';
        }
        card.className = cardClasses;
        card.setAttribute('data-source', job.source);
        
        // Format source name for display
        let sourceName;
        switch (job.source) {
            case 'google':
                sourceName = 'Google Jobs';
                break;
            case 'linkedin':
                sourceName = 'LinkedIn';
                break;
            default:
                sourceName = job.source;
        }
        
        // Determinar o texto do botão e ícone com base no tipo de card
        let buttonText = 'Ver Vaga';
        let buttonIcon = 'fas fa-external-link-alt';
        let additionalInfo = '';
        
        if (job.isJobList) {
            buttonText = 'Ver Lista de Vagas';
            buttonIcon = 'fas fa-list';
            additionalInfo = '';
        }
        
        card.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="job-source ${job.source}">${sourceName}</span>
                    <a href="${job.url}" target="_blank" class="btn ${job.highlight ? 'btn-primary' : 'btn-sm btn-outline-primary'}">
                        <i class="${buttonIcon} me-1"></i> ${buttonText}
                    </a>
                </div>
                <h5 class="job-title">${job.title}</h5>
                <div class="job-company mb-2">${job.company}</div>
                <div class="job-location mb-3">
                    <i class="fas fa-map-marker-alt me-1"></i> ${job.location}
                </div>
            </div>
        `;
        
        return card;
    }
    
    /**
     * Handle filter button clicks
     * @param {Event} event - Click event
     */
    function handleFilter(event) {
        const filterValue = event.target.getAttribute('data-filter');
        
        // Update active button
        filterButtons.forEach(button => {
            button.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Filter job cards
        const jobCards = document.querySelectorAll('.job-card');
        
        jobCards.forEach(card => {
            if (filterValue === 'all' || card.getAttribute('data-source') === filterValue) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    /**
     * Reset filters to show all results
     */
    function resetFilters() {
        filterButtons.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-filter') === 'all') {
                button.classList.add('active');
            }
        });
    }
    
    /**
     * Show no results message
     * @param {string} companyName - Name of the company
     */
    function showNoResults(companyName) {
        noResults.classList.remove('d-none');
        resultsList.classList.add('d-none');
        
        noResults.innerHTML = `
            <i class="fas fa-search fa-3x text-muted mb-3"></i>
            <p class="lead">Não encontramos vagas abertas para ${companyName}.</p>
            <p>Tente buscar por outra empresa ou verifique se a URL está correta.</p>
        `;
    }
    
    /**
     * Show error message
     * @param {string} message - Error message
     */
    function showError(message) {
        noResults.classList.remove('d-none');
        resultsList.classList.add('d-none');
        
        noResults.innerHTML = `
            <i class="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
            <p class="lead">${message}</p>
        `;
    }
    
    // Initialize the application
    init();
});
