// Admin Supabase Simplificado - Desplugados
document.addEventListener('DOMContentLoaded', function() {
    // Configurações do Supabase
    const SUPABASE_URL = 'https://yxagqrsdfiokogwksvbu.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_BZutp_epytYYLZiKofldxg_FuqLwXIf';
    
    // Inicializar cliente Supabase
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Elementos DOM
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const searchInput = document.getElementById('search-input');
    const filterStatus = document.getElementById('filter-status');
    const filterCategory = document.getElementById('filter-category');
    const filterAge = document.getElementById('filter-age');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const activitiesContainer = document.getElementById('activities-container');
    const activitiesCount = document.getElementById('activities-count');
    
    // Elementos de estatísticas
    const statTotal = document.getElementById('stat-total');
    const statPendentes = document.getElementById('stat-pendentes');
    const statAprovadas = document.getElementById('stat-aprovadas');
    const statMelhorias = document.getElementById('stat-melhorias');
    
    // Estado
    let allActivities = [];
    let categories = new Set();
    
    // Funções de utilidade
    function showLoading(message = 'Carregando...') {
        if (loadingText) loadingText.textContent = message;
        if (loadingOverlay) loadingOverlay.classList.remove('hidden');
    }
    
    function hideLoading() {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
    
    function showError(message) {
        const modal = document.createElement('div');
        modal.className = 'modal modal-open';
        modal.innerHTML = `
            <div class="modal-box">
                <h3 class="font-bold text-lg text-error">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    Erro
                </h3>
                <p class="py-4">${message}</p>
                <div class="modal-action">
                    <button onclick="this.closest('.modal').remove()" class="btn btn-primary">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `toast toast-top toast-end`;
        notification.innerHTML = `
            <div class="alert alert-${type}">
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
    
    // Carregar atividades
    async function loadActivities() {
        showLoading('Carregando atividades...');
        
        try {
            // Buscar todas as atividades
            const { data, error } = await supabase
                .from('atividades_v2')
                .select('*')
                .order('id');
            
            if (error) throw error;
            
            allActivities = data || [];
            
            // Extrair categorias
            categories.clear();
            allActivities.forEach(activity => {
                if (activity.dados && activity.dados.categoria) {
                    categories.add(activity.dados.categoria);
                }
            });
            
            // Atualizar estatísticas
            updateStatistics();
            
            // Carregar filtros
            loadCategoryFilter();
            
            // Carregar lista
            filterAndRenderActivities();
            
        } catch (error) {
            showError(`Falha ao carregar atividades: ${error.message}`);
        } finally {
            hideLoading();
        }
    }
    
    // Atualizar estatísticas
    function updateStatistics() {
        if (!allActivities.length) return;
        
        const total = allActivities.length;
        const pendentes = allActivities.filter(a => a.status_revisao === 'pendente').length;
        const aprovadas = allActivities.filter(a => a.status_revisao === 'aprovada').length;
        const precisaMelhorias = allActivities.filter(a => a.status_revisao === 'precisa_melhorias').length;
        
        if (statTotal) statTotal.textContent = total;
        if (statPendentes) statPendentes.textContent = pendentes;
        if (statAprovadas) statAprovadas.textContent = aprovadas;
        if (statMelhorias) statMelhorias.textContent = precisaMelhorias;
    }
    
    // Carregar filtro de categorias
    function loadCategoryFilter() {
        if (!filterCategory) return;
        
        // Limpar opções (mantendo a primeira)
        while (filterCategory.options.length > 1) {
            filterCategory.remove(1);
        }
        
        // Ordenar categorias e adicionar
        Array.from(categories).sort().forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            filterCategory.appendChild(option);
        });
    }
    
    // Filtrar e renderizar atividades
    function filterAndRenderActivities() {
        if (!activitiesContainer) return;
        
        // Aplicar filtros
        let filtered = allActivities;
        
        // Filtro de status
        const statusFilter = filterStatus.value;
        if (statusFilter) {
            filtered = filtered.filter(a => a.status_revisao === statusFilter);
        }
        
        // Filtro de categoria
        const categoryFilter = filterCategory.value;
        if (categoryFilter) {
            filtered = filtered.filter(a => a.dados && a.dados.categoria === categoryFilter);
        }
        
        // Filtro de idade
        const ageFilter = filterAge.value;
        if (ageFilter) {
            filtered = filtered.filter(a => a.dados && a.dados.faixa_etaria === ageFilter);
        }
        
        // Filtro de busca
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(a => {
                const nome = a.dados?.nome?.toLowerCase() || '';
                const descricao = a.dados?.descricao?.toLowerCase() || '';
                const tags = Array.isArray(a.dados?.tags) ? a.dados.tags.join(' ').toLowerCase() : '';
                
                return nome.includes(searchTerm) || 
                       descricao.includes(searchTerm) || 
                       tags.includes(searchTerm);
            });
        }
        
        // Ordenar por ID
        filtered.sort((a, b) => a.id - b.id);
        
        // Atualizar contador
        if (activitiesCount) {
            activitiesCount.textContent = filtered.length;
        }
        
        // Renderizar
        renderActivities(filtered);
    }
    
    // Renderizar lista de atividades
    function renderActivities(activities) {
        if (!activitiesContainer) return;
        
        if (activities.length === 0) {
            activitiesContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold mb-2">Nenhuma atividade encontrada</h3>
                    <p class="text-gray-500">Experimente ajustar os filtros ou a busca.</p>
                    <button onclick="clearFilters()" class="btn btn-primary mt-4">
                        <i class="fas fa-times mr-2"></i>
                        Limpar Filtros
                    </button>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        activities.forEach(activity => {
            const dados = activity.dados || {};
            const statusClass = `badge-status-${activity.status_revisao}`;
            const statusLabel = getStatusLabel(activity.status_revisao);
            const commentCount = activity.comentarios?.length || 0;
            
            html += `
                <div class="card card-compact bg-base-100 shadow hover:shadow-lg transition-shadow">
                    <div class="card-body">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <div class="flex items-start gap-2">
                                    <h3 class="card-title text-lg mb-1 flex-1">
                                        ${dados.nome || 'Sem nome'}
                                        <span class="text-sm font-normal text-gray-500">#${activity.id}</span>
                                    </h3>
                                    <div class="badge ${statusClass} font-semibold">
                                        ${statusLabel}
                                    </div>
                                </div>
                                <div class="flex flex-wrap gap-1 mb-2">
                                    <span class="badge badge-outline badge-sm">
                                        <i class="fas fa-tag mr-1"></i> ${dados.categoria || 'Sem categoria'}
                                    </span>
                                    <span class="badge badge-outline badge-sm">
                                        <i class="fas fa-child mr-1"></i> ${dados.faixa_etaria || 'Sem idade'}
                                    </span>
                                    <span class="badge badge-outline badge-sm">
                                        <i class="fas fa-clock mr-1"></i> ${dados.tempo_entretenimento || 'Sem tempo'}
                                    </span>
                                </div>
                                <p class="text-gray-600 text-sm line-clamp-2 mb-3">
                                    ${(dados.descricao || '').substring(0, 120)}${(dados.descricao || '').length > 120 ? '...' : ''}
                                </p>
                            </div>
                        </div>
                        
                        <div class="card-actions justify-between items-center">
                            <div class="text-sm text-gray-500">
                                <i class="fas fa-comment mr-1"></i> ${commentCount} comentário${commentCount !== 1 ? 's' : ''}
                                <span class="mx-2">•</span>
                                <i class="fas fa-history mr-1"></i> ${activity.historico?.length || 0} histórico
                            </div>
                            <div class="flex gap-2">
                                <div class="dropdown dropdown-end">
                                    <div tabindex="0" role="button" class="btn btn-sm btn-ghost">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </div>
                                    <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow">
                                        <li>
                                            <a href="review.html?id=${activity.id}">
                                                <i class="fas fa-eye"></i> Revisar Atividade
                                            </a>
                                        </li>
                                        <li><hr class="my-1"></li>
                                        <li>
                                            <a onclick="quickUpdateStatus(${activity.id}, 'pendente')">
                                                <i class="fas fa-clock"></i> Pendente
                                            </a>
                                        </li>
                                        <li>
                                            <a onclick="quickUpdateStatus(${activity.id}, 'em_revisao')">
                                                <i class="fas fa-search"></i> Em Revisão
                                            </a>
                                        </li>
                                        <li>
                                            <a onclick="quickUpdateStatus(${activity.id}, 'aprovada')">
                                                <i class="fas fa-check"></i> Aprovada
                                            </a>
                                        </li>
                                        <li>
                                            <a onclick="quickUpdateStatus(${activity.id}, 'precisa_melhorias')">
                                                <i class="fas fa-exclamation-triangle"></i> Precisa Melhorias
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <a href="review.html?id=${activity.id}" class="btn btn-sm btn-primary">
                                    Revisar
                                    <i class="fas fa-edit ml-1"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        activitiesContainer.innerHTML = html;
    }
    
    // Atualização rápida de status
    window.quickUpdateStatus = async function(activityId, newStatus) {
        showLoading('Atualizando status...');
        
        try {
            // Buscar atividade atual
            const { data: currentData, error: fetchError } = await supabase
                .from('atividades_v2')
                .select('*')
                .eq('id', activityId)
                .single();
            
            if (fetchError) throw fetchError;
            
            // Adicionar ao histórico
            const historico = currentData.historico || [];
            historico.push({
                data: new Date().toISOString(),
                campo: 'status_revisao',
                valor_antigo: currentData.status_revisao,
                valor_novo: newStatus,
                autor: 'admin'
            });
            
            // Atualizar no Supabase
            const { error } = await supabase
                .from('atividades_v2')
                .update({
                    status_revisao: newStatus,
                    historico: historico,
                    updated_at: new Date().toISOString()
                })
                .eq('id', activityId);
            
            if (error) throw error;
            
            // Recarregar atividades
            await loadActivities();
            
            showNotification(`✅ Status atualizado para "${getStatusLabel(newStatus)}"!`);
            
        } catch (error) {
            showError(`Falha ao atualizar status: ${error.message}`);
        } finally {
            hideLoading();
        }
    };
    
    // Limpar filtros
    window.clearFilters = function() {
        if (searchInput) searchInput.value = '';
        if (filterStatus) filterStatus.value = '';
        if (filterCategory) filterCategory.value = '';
        if (filterAge) filterAge.value = '';
        filterAndRenderActivities();
    };
    
    // Funções auxiliares
    function getStatusLabel(status) {
        const labels = {
            'pendente': 'Pendente',
            'em_revisao': 'Em Revisão',
            'aprovada': 'Aprovada',
            'precisa_melhorias': 'Precisa Melhorias'
        };
        return labels[status] || status;
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Filtros
        if (filterStatus) {
            filterStatus.addEventListener('change', filterAndRenderActivities);
        }
        if (filterCategory) {
            filterCategory.addEventListener('change', filterAndRenderActivities);
        }
        if (filterAge) {
            filterAge.addEventListener('change', filterAndRenderActivities);
        }
        
        // Busca com debounce
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                clearTimeout(window.searchTimeout);
                window.searchTimeout = setTimeout(filterAndRenderActivities, 300);
            });
        }
        
        // Limpar filtros
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', clearFilters);
        }
    }
    
    // Inicializar
    async function init() {
        showLoading('Conectando ao Supabase...');
        
        try {
            // Testar conexão
            const { data, error } = await supabase
                .from('atividades_v2')
                .select('id')
                .limit(1);
            
            if (error) throw error;
            
            // Configurar listeners
            setupEventListeners();
            
            // Carregar atividades
            await loadActivities();
            
        } catch (error) {
            showError(`Falha ao conectar ao Supabase: ${error.message}`);
            console.error('Supabase error:', error);
        } finally {
            hideLoading();
        }
    }
    
    // Iniciar
    init();
});