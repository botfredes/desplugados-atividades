// Painel de Administração Desplugados
document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const adminStats = document.getElementById('admin-stats');
    const problemCount = document.getElementById('problem-count');
    const activitiesAdminContainer = document.getElementById('activities-admin-container');
    const loadingElement = document.getElementById('loading');
    const exportBtn = document.getElementById('export-btn');
    const filterCategory = document.getElementById('filter-category');
    const filterProblemCount = document.getElementById('filter-problem-count');
    const filterPriority = document.getElementById('filter-priority');
    const otherActivitiesSection = document.getElementById('other-activities-section');
    const otherActivitiesContainer = document.getElementById('other-activities-container');
    
    // Dados
    let completudeData = {};
    let problematicasData = [];
    let allActivities = [];
    let enrichmentData = {};
    
    // Inicializar
    function initAdmin() {
        // Carregar dados de completude (já carregado via script tag)
        if (typeof window.completudeData !== 'undefined') {
            completudeData = window.completudeData;
        }
        
        // Carregar dados de atividades problemáticas
        if (typeof window.problematicasData !== 'undefined') {
            problematicasData = window.problematicasData.atividades || [];
        }
        
        // Carregar dados completos das atividades
        if (typeof window.atividadesData !== 'undefined') {
            allActivities = window.atividadesData.atividades || [];
        }
        
        // Carregar dados de enriquecimento do localStorage
        loadEnrichmentData();
        
        // Atualizar interface
        updateStats();
        loadCategoryFilter();
        loadActivities();
        setupEventListeners();
        
        // Esconder loading
        setTimeout(() => {
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        }, 500);
    }
    
    // Carregar dados de enriquecimento do localStorage
    function loadEnrichmentData() {
        const saved = localStorage.getItem('desplugados_enrichment');
        if (saved) {
            try {
                enrichmentData = JSON.parse(saved);
            } catch (e) {
                enrichmentData = {};
            }
        } else {
            enrichmentData = {};
        }
    }
    
    // Salvar dados de enriquecimento no localStorage
    function saveEnrichmentData() {
        localStorage.setItem('desplugados_enrichment', JSON.stringify(enrichmentData));
    }
    
    // Atualizar estatísticas
    function updateStats() {
        if (!completudeData.estatisticas) return;
        
        const stats = completudeData.estatisticas;
        
        if (adminStats) {
            adminStats.innerHTML = `
                <div class="admin-stat">
                    <span class="number">${stats.total}</span>
                    <span class="label">Total de Atividades</span>
                </div>
                <div class="admin-stat">
                    <span class="number">${stats.problematicas}</span>
                    <span class="label">Problemáticas</span>
                </div>
                <div class="admin-stat">
                    <span class="number">${stats.completas}</span>
                    <span class="label">Completas</span>
                </div>
                <div class="admin-stat">
                    <span class="number">${stats.score_medio}</span>
                    <span class="label">Pontuação Média</span>
                </div>
            `;
        }
        
        if (problemCount) {
            problemCount.textContent = stats.problematicas;
        }
    }
    
    // Carregar categorias no filtro
    function loadCategoryFilter() {
        if (!filterCategory) return;
        
        // Extrair categorias únicas das atividades problemáticas
        const categories = new Set();
        problematicasData.forEach(activity => {
            if (activity.categoria) {
                categories.add(activity.categoria);
            }
        });
        
        // Ordenar e adicionar opções
        Array.from(categories).sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            filterCategory.appendChild(option);
        });
    }
    
    // Carregar atividades
    function loadActivities() {
        if (!activitiesAdminContainer) return;
        
        // Filtrar atividades (por enquanto só problemáticas)
        let filteredActivities = problematicasData;
        
        // Aplicar filtros
        if (filterCategory.value) {
            filteredActivities = filteredActivities.filter(a => a.categoria === filterCategory.value);
        }
        
        if (filterProblemCount.value) {
            const count = parseInt(filterProblemCount.value);
            filteredActivities = filteredActivities.filter(a => a.qtd_problemas === count);
        }
        
        // Ordenar por pontuação (mais baixa primeiro)
        filteredActivities.sort((a, b) => a.pontuacao - b.pontuacao);
        
        // Renderizar
        renderActivities(filteredActivities);
    }
    
    // Renderizar atividades
    function renderActivities(activities) {
        if (!activitiesAdminContainer) return;
        
        if (activities.length === 0) {
            activitiesAdminContainer.innerHTML = `
                <div class="no-activities">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: #2ed573; margin-bottom: 1rem;"></i>
                    <h3>Nenhuma atividade encontrada</h3>
                    <p>Experimente ajustar os filtros.</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        activities.forEach(activity => {
            const activityId = activity.id;
            const activityDetails = allActivities.find(a => a.id === activityId) || {};
            const enrichment = enrichmentData[activityId] || {};
            
            // Links do GitHub
            const githubJsonUrl = `https://github.com/botfredes/desplugados-atividades/edit/main/atividades/individuais/${String(activityId).padStart(3, '0')}-${activityDetails.slug || 'atividade'}.json`;
            const githubMarkdownUrl = `https://github.com/botfredes/desplugados-atividades/tree/main/markdown-atividades`;
            
            // Determinar cor da pontuação
            let scoreColor = '#2ed573'; // verde
            if (activity.pontuacao < 70) scoreColor = '#ff4757'; // vermelho
            else if (activity.pontuacao < 80) scoreColor = '#ffa502'; // laranja
            
            html += `
                <div class="activity-card-admin problematica" id="activity-${activityId}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h3 style="margin: 0 0 0.5rem 0;">${activity.nome} <span style="font-size: 0.9rem; color: #666;">(ID: ${activityId})</span></h3>
                            <div style="display: flex; gap: 1rem; margin-bottom: 0.5rem;">
                                <span style="background: #e9ecef; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem;">
                                    ${activity.categoria}
                                </span>
                                <span style="background: #e9ecef; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem;">
                                    ${activity.faixa_etaria}
                                </span>
                                <span style="background: ${scoreColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">
                                    ${activity.pontuacao}/100
                                </span>
                                <span class="problem-badge">
                                    ${activity.qtd_problemas} problema${activity.qtd_problemas !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                        <div>
                            <span class="priority-badge ${enrichment.priority || 'priority-medium'}">
                                ${(enrichment.priority || 'medium').toUpperCase()}
                            </span>
                        </div>
                    </div>
                    
                    <div style="margin-top: 1rem;">
                        <p><strong>Tempo:</strong> ${activity.tempo} | <strong>Preparo:</strong> ${activity.preparo}</p>
                    </div>
                    
                    ${activity.problemas && activity.problemas.length > 0 ? `
                    <div class="problems-list">
                        <h4 style="margin-top: 0; color: #e53e3e;"><i class="fas fa-exclamation-circle"></i> Problemas Identificados</h4>
                        ${activity.problemas.map(problema => `
                            <div class="problem-item">
                                <i class="fas fa-times-circle"></i> ${problema}
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                    
                    <div class="github-links">
                        <a href="activity.html?id=${activityId}" class="github-link" target="_blank">
                            <i class="fas fa-eye"></i> Ver Atividade
                        </a>
                        <a href="${githubJsonUrl}" class="github-link" target="_blank">
                            <i class="fab fa-github"></i> Editar JSON
                        </a>
                        <a href="${githubMarkdownUrl}" class="github-link" target="_blank">
                            <i class="fab fa-markdown"></i> Ver Markdown
                        </a>
                    </div>
                    
                    <div class="enrichment-form">
                        <h4><i class="fas fa-magic"></i> Enriquecimento</h4>
                        
                        <div class="form-group">
                            <label for="links-${activityId}">Links para enriquecimento (um por linha)</label>
                            <textarea 
                                id="links-${activityId}" 
                                class="form-control" 
                                rows="3" 
                                placeholder="Ex: https://exemplo.com/tutorial
https://pinterest.com/ideias
https://youtube.com/video"
                            >${enrichment.links ? enrichment.links.join('\n') : ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="notes-${activityId}">Notas e observações</label>
                            <textarea 
                                id="notes-${activityId}" 
                                class="form-control" 
                                rows="2"
                                placeholder="Ideias para melhorar, adaptações, materiais alternativos..."
                            >${enrichment.notes || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="priority-${activityId}">Prioridade</label>
                            <select id="priority-${activityId}" class="form-control">
                                <option value="high" ${enrichment.priority === 'high' ? 'selected' : ''}>Alta</option>
                                <option value="medium" ${!enrichment.priority || enrichment.priority === 'medium' ? 'selected' : ''}>Média</option>
                                <option value="low" ${enrichment.priority === 'low' ? 'selected' : ''}>Baixa</option>
                            </select>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between;">
                            <button onclick="saveActivityEnrichment(${activityId})" class="btn btn-primary">
                                <i class="fas fa-save"></i> Salvar
                            </button>
                            <button onclick="clearActivityEnrichment(${activityId})" class="btn btn-danger">
                                <i class="fas fa-trash"></i> Limpar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        activitiesAdminContainer.innerHTML = html;
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Filtros
        if (filterCategory) {
            filterCategory.addEventListener('change', loadActivities);
        }
        if (filterProblemCount) {
            filterProblemCount.addEventListener('change', loadActivities);
        }
        if (filterPriority) {
            filterPriority.addEventListener('change', loadActivities);
        }
        
        // Botão de exportação
        if (exportBtn) {
            exportBtn.addEventListener('click', exportEnrichmentData);
        }
    }
    
    // Salvar enriquecimento de uma atividade (disponível globalmente)
    window.saveActivityEnrichment = function(activityId) {
        const linksTextarea = document.getElementById(`links-${activityId}`);
        const notesTextarea = document.getElementById(`notes-${activityId}`);
        const prioritySelect = document.getElementById(`priority-${activityId}`);
        
        if (!linksTextarea || !notesTextarea || !prioritySelect) return;
        
        // Processar links (uma por linha, remover espaços, filtrar vazios)
        const links = linksTextarea.value
            .split('\n')
            .map(link => link.trim())
            .filter(link => link.length > 0);
        
        enrichmentData[activityId] = {
            links: links,
            notes: notesTextarea.value.trim(),
            priority: prioritySelect.value,
            updatedAt: new Date().toISOString()
        };
        
        saveEnrichmentData();
        
        // Feedback visual
        const button = event ? event.target : linksTextarea;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Salvo!';
        button.style.background = '#2ed573';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 1500);
    };
    
    // Limpar enriquecimento de uma atividade (disponível globalmente)
    window.clearActivityEnrichment = function(activityId) {
        if (confirm('Tem certeza que deseja limpar os dados de enriquecimento desta atividade?')) {
            delete enrichmentData[activityId];
            saveEnrichmentData();
            
            // Resetar campos
            const linksTextarea = document.getElementById(`links-${activityId}`);
            const notesTextarea = document.getElementById(`notes-${activityId}`);
            const prioritySelect = document.getElementById(`priority-${activityId}`);
            
            if (linksTextarea) linksTextarea.value = '';
            if (notesTextarea) notesTextarea.value = '';
            if (prioritySelect) prioritySelect.value = 'medium';
            
            // Atualizar badge de prioridade
            const badge = document.querySelector(`#activity-${activityId} .priority-badge`);
            if (badge) {
                badge.className = 'priority-badge priority-medium';
                badge.textContent = 'MEDIUM';
            }
        }
    };
    
    // Exportar dados de enriquecimento
    function exportEnrichmentData() {
        const exportObj = {
            gerado_em: new Date().toISOString(),
            atividades_total: Object.keys(enrichmentData).length,
            atividades: enrichmentData
        };
        
        const dataStr = JSON.stringify(exportObj, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `desplugados-enriquecimento-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Feedback
        exportBtn.innerHTML = '<i class="fas fa-check"></i> Exportado!';
        setTimeout(() => {
            exportBtn.innerHTML = '<i class="fas fa-download"></i> Exportar Enriquecimento';
        }, 2000);
    }
    
    // Iniciar
    initAdmin();
});