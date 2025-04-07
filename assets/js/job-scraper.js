/**
 * Job Scraper Module
 * Handles the scraping of job listings from various sources
 */
const jobScraperModule = (function() {
    /**
     * Scrape job listings from all sources
     * @param {string} companyUrl - The URL of the company website
     * @returns {Promise} - Promise that resolves with job listings
     */
    async function scrapeAllJobs(companyUrl) {
        try {
            // Extract company name from URL for better search results
            const companyName = extractCompanyName(companyUrl);
            
            // Show loader while scraping
            window.loaderModule.show();
            
            // Fetch jobs from Google Jobs
            const googleJobs = await scrapeGoogleJobs(companyName);
            
            // Fetch jobs from LinkedIn
            const linkedinJobs = await scrapeLinkedInJobs(companyName);
            
            // Combine all jobs (removemos a Gupy conforme solicitado)
            const allJobs = [...googleJobs, ...linkedinJobs];
            
            // Sort by date (most recent first)
            allJobs.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Hide loader
            window.loaderModule.hide();
            
            return {
                success: true,
                companyName,
                jobCount: allJobs.length,
                jobs: allJobs
            };
        } catch (error) {
            console.error('Error scraping jobs:', error);
            window.loaderModule.hide();
            throw error;
        }
    }
    
    /**
     * Extract company name from URL
     * @param {string} url - Company website URL
     * @returns {string} - Company name
     */
    function extractCompanyName(url) {
        try {
            // Remover protocolo (http://, https://)
            let domain = url.replace(/^(?:https?:\/\/)/i, "");
            
            // Remover www. se existir
            domain = domain.replace(/^www\./i, "");
            
            // Pegar apenas a parte entre o início e o final (.com, .com.br, etc.)
            // Encontrar o primeiro ponto para determinar o final do nome da empresa
            const firstDotIndex = domain.indexOf('.');
            if (firstDotIndex !== -1) {
                domain = domain.substring(0, firstDotIndex);
            }
            
            // Substituir pontos e hífens por espaços
            let companyName = domain.replace(/[\.-]/g, ' ');
            
            // Capitalizar primeira letra de cada palavra
            companyName = companyName
                .split(' ')
                .map(word => {
                    if (word.length > 0) {
                        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                    }
                    return word;
                })
                .join(' ');
            
            return companyName;
        } catch (error) {
            console.error('Error extracting company name:', error);
            return 'Unknown Company';
        }
    }
    
    /**
     * Gera uma URL para buscar vagas no Google Jobs
     * @param {string} companyName - Nome da empresa
     * @returns {Promise<Array>} - Promise que resolve com as vagas
     */
    async function scrapeGoogleJobs(companyName) {
        try {
            // Criar apenas um link com "[Empresa] Vagas"
            const searchQuery = `${companyName} Vagas`;
            const formattedQuery = searchQuery.replace(/\s+/g, '+');
            
            // Construir a URL no formato do exemplo da Vivo
            const googleJobsUrl = `https://www.google.com/search?q=${formattedQuery}&oq=${formattedQuery}&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIKCAEQABiABBiiBDIHCAIQABjvBTIKCAMQABiABBiiBDIKCAQQABiABBiiBDIHCAUQABjvBdIBCDM1MjdqMGo3qAIIsAIB8QUaGziIae2Haw&sourceid=chrome&ie=UTF-8&jbr=sep:0&udm=8`;
            
            // Não exibimos mais a contagem estimada de vagas
            
            // Criar um objeto de vaga com a URL gerada e informações adicionais
            const jobs = [
                {
                    id: 'google-main',
                    title: `Lista de Vagas Gerada para ${companyName}`,
                    company: companyName,
                    location: 'Brasil',
                    date: new Date().toLocaleDateString('pt-BR'),
                    source: 'google',
                    url: googleJobsUrl,
                    isJobList: true, // Indica que é uma lista de vagas, não uma vaga individual
                    highlight: true // Indica que este card deve ter destaque
                }
            ];
            
            return jobs;
        } catch (error) {
            console.error('Erro ao gerar URL do Google Jobs:', error);
            
            // Mesmo em caso de erro, retornar pelo menos a URL básica
            const searchQuery = `${companyName} Vagas`;
            const formattedQuery = searchQuery.replace(/\s+/g, '+');
            const estimatedJobCount = Math.floor(Math.random() * 30) + 10; // Entre 10 e 40 vagas
            
            return [
                {
                    id: 'google-fallback',
                    title: `Lista de Vagas Gerada para ${companyName}`,
                    company: companyName,
                    location: 'Brasil',
                    date: new Date().toLocaleDateString('pt-BR'),
                    source: 'google',
                    url: `https://www.google.com/search?q=${formattedQuery}&oq=${formattedQuery}&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIKCAEQABiABBiiBDIHCAIQABjvBTIKCAMQABiABBiiBDIKCAQQABiABBiiBDIHCAUQABjvBdIBCDM1MjdqMGo3qAIIsAIB8QUaGziIae2Haw&sourceid=chrome&ie=UTF-8&jbr=sep:0&udm=8`,
                    isJobList: true,
                    estimatedJobCount: estimatedJobCount,
                    highlight: true
                }
            ];
        }
    }
    
    /**
     * Scrape job listings from LinkedIn
     * @param {string} companyName - Name of the company
     * @returns {Promise<Array>} - Promise that resolves with job listings
     */
    async function scrapeLinkedInJobs(companyName) {
        try {
            const searchQuery = encodeURIComponent(`${companyName}`);
            // Adicionar localização Brasil/Brazil para restringir a busca
            const url = `https://www.linkedin.com/jobs/search/?keywords=${searchQuery}&location=Brazil`;
            
            // Use a proxy service to bypass CORS
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            
            const response = await fetch(proxyUrl);
            const html = await response.text();
            
            // Parse HTML using DOMParser
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const jobElements = doc.querySelectorAll('.job-search-card');
            const jobs = [];
            
            // Adicionar link direto para busca com localização "Brasil" (em português)
            jobs.push({
                id: 'linkedin-brasil',
                title: `Vagas na ${companyName} (Brasil)`,
                company: companyName,
                location: 'Brasil',
                date: new Date().toLocaleDateString('pt-BR'),
                source: 'linkedin',
                url: `https://www.linkedin.com/jobs/search/?keywords=${searchQuery}&location=Brasil`
            });
            
            jobElements.forEach((element, index) => {
                const titleElement = element.querySelector('.base-search-card__title');
                const companyElement = element.querySelector('.base-search-card__subtitle');
                const locationElement = element.querySelector('.job-search-card__location');
                const linkElement = element.querySelector('a');
                
                if (titleElement && companyElement) {
                    const title = titleElement.textContent.trim();
                    const company = companyElement.textContent.trim();
                    const location = locationElement ? locationElement.textContent.trim() : 'Não especificado';
                    const url = linkElement ? linkElement.href : `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title + ' ' + company)}`;
                    
                    jobs.push({
                        id: `linkedin-${index}`,
                        title,
                        company,
                        location,
                        date: new Date().toLocaleDateString('pt-BR'),
                        source: 'linkedin',
                        url
                    });
                }
            });
            
            return jobs;
        } catch (error) {
            console.error('Error scraping LinkedIn Jobs:', error);
            return [];
        }
    }
    
    /**
     * Scrape job listings from Gupy
     * @param {string} companyName - Name of the company
     * @returns {Promise<Array>} - Promise that resolves with job listings
     */
    async function scrapeGupyJobs(companyName) {
        try {
            // Formatar o nome da empresa para o formato usado pela Gupy
            const formattedCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            // URL direta para a página de vagas da empresa na Gupy
            const companyGupyUrl = `https://www.gupy.io/${formattedCompany}`;
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(companyGupyUrl)}`;
            
            const response = await fetch(proxyUrl);
            const html = await response.text();
            
            // Parse HTML using DOMParser
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Tentar encontrar vagas no formato da Gupy
            const jobElements = doc.querySelectorAll('.job-list__item, .job-card, .opportunity-card');
            const jobs = [];
            
            if (jobElements && jobElements.length > 0) {
                jobElements.forEach((element, index) => {
                    const titleElement = element.querySelector('.job-list__title, .job-title, .opportunity-title');
                    const locationElement = element.querySelector('.job-list__location, .job-location, .opportunity-location');
                    const linkElement = element.querySelector('a');
                    
                    if (titleElement) {
                        const title = titleElement.textContent.trim();
                        const location = locationElement ? locationElement.textContent.trim() : 'Brasil';
                        const url = linkElement ? linkElement.href : `${companyGupyUrl}/job/${index}`;
                        
                        jobs.push({
                            id: `gupy-${index}`,
                            title,
                            company: companyName,
                            location,
                            date: new Date().toLocaleDateString('pt-BR'),
                            source: 'gupy',
                            url
                        });
                    }
                });
            }
            
            // Se não encontramos vagas, tentar a API da Gupy
            if (jobs.length === 0) {
                // Tentar a API da Gupy para buscar vagas
                const apiUrl = `https://api.gupy.io/api/v1/companies/${formattedCompany}/jobs`;
                const apiProxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
                
                try {
                    const apiResponse = await fetch(apiProxyUrl);
                    const apiData = await apiResponse.json();
                    
                    if (apiData && Array.isArray(apiData)) {
                        apiData.forEach((job, index) => {
                            if (job.title || job.name) {
                                jobs.push({
                                    id: `gupy-api-${index}`,
                                    title: job.title || job.name,
                                    company: companyName,
                                    location: job.location || job.workplace || 'Brasil',
                                    date: new Date().toLocaleDateString('pt-BR'),
                                    source: 'gupy',
                                    url: job.url || `https://www.gupy.io/${formattedCompany}/job/${job.id || index}`
                                });
                            }
                        });
                    }
                } catch (apiError) {
                    console.error('Error with Gupy API:', apiError);
                }
            }
            
            // Se ainda não temos resultados, tentar buscar no site geral da Gupy
            if (jobs.length === 0) {
                const searchUrl = `https://portal.gupy.io/vagas?searchTerm=${encodeURIComponent(companyName)}`;
                const searchProxyUrl = `https://corsproxy.io/?${encodeURIComponent(searchUrl)}`;
                
                const searchResponse = await fetch(searchProxyUrl);
                const searchHtml = await searchResponse.text();
                
                const searchDoc = parser.parseFromString(searchHtml, 'text/html');
                const searchJobElements = searchDoc.querySelectorAll('.job-card, .vacancy-card, [data-testid="job-card"]');
                
                if (searchJobElements && searchJobElements.length > 0) {
                    searchJobElements.forEach((element, index) => {
                        const titleEl = element.querySelector('.job-title, .vacancy-title, [data-testid="job-title"]');
                        const companyEl = element.querySelector('.company-name, .vacancy-company, [data-testid="company-name"]');
                        const locationEl = element.querySelector('.location, .vacancy-location, [data-testid="job-location"]');
                        const linkEl = element.querySelector('a');
                        
                        if (titleEl && (companyEl && companyEl.textContent.toLowerCase().includes(companyName.toLowerCase()))) {
                            const title = titleEl.textContent.trim();
                            const company = companyEl.textContent.trim();
                            const location = locationEl ? locationEl.textContent.trim() : 'Brasil';
                            const url = linkEl ? linkEl.href : searchUrl;
                            
                            jobs.push({
                                id: `gupy-search-${index}`,
                                title,
                                company,
                                location,
                                date: new Date().toLocaleDateString('pt-BR'),
                                source: 'gupy',
                                url
                            });
                        }
                    });
                }
            }
            
            // Se ainda não temos resultados, criar alguns links diretos para a empresa na Gupy
            if (jobs.length === 0) {
                const departamentos = [
                    'Tecnologia',
                    'Marketing',
                    'Vendas',
                    'Recursos Humanos',
                    'Finanças'
                ];
                
                departamentos.forEach((depto, index) => {
                    jobs.push({
                        id: `gupy-${index}`,
                        title: `Vagas de ${depto} - ${companyName}`,
                        company: companyName,
                        location: 'Brasil',
                        date: new Date().toLocaleDateString('pt-BR'),
                        source: 'gupy',
                        url: `https://www.gupy.io/${formattedCompany}`
                    });
                });
            }
            
            return jobs;
        } catch (error) {
            console.error('Error scraping Gupy Jobs:', error);
            
            // Formatar o nome da empresa para o formato usado pela Gupy
            const formattedCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            // Retornar alguns resultados mesmo em caso de erro
            const departamentos = [
                'Tecnologia',
                'Marketing',
                'Vendas'
            ];
            
            return departamentos.map((depto, index) => ({
                id: `gupy-${index}`,
                title: `Vagas de ${depto} - ${companyName}`,
                company: companyName,
                location: 'Brasil',
                date: new Date().toLocaleDateString('pt-BR'),
                source: 'gupy',
                url: `https://www.gupy.io/${formattedCompany}`
            }));
        }
    }
    
    // Public API
    return {
        scrapeAllJobs
    };
})();
