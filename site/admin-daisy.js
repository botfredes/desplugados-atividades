// Admin Supabase com Daisy UI - Desplugados
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
    const detailContent = document.getElementById('detail-content');
    const detailTitle = document.getElementById('detail-title');
    
    // Elementos de estatísticas
    const statTotal = document.getElementById('stat-total');
    const statPendentes = document.getElementById('stat-pendentes');
    const statAprovadas = document.getElementById('stat-aprovadas');
    const statMelhorias = document.getElementById('stat-melhorias');
    
    // Estado
    let allActivities = [];
    let categories = new Set();
    let selectedActivityId = null;
    
    // Funções de utilidade
    function showLoading(message = 'Carregando...') {
        if (loadingText) loadingText.textContent = message;
        if (loadingOverlay) loadingOverlay.classList.remove('hidden');
    }
    
    function hideLoading() {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
    
    function showError(message) {
        // Usar modal do Daisy UI
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
                    ${clearFiltersBtn ? `<button onclick="clearFilters()" class="btn btn-primary mt-4">
                        <i class="fas fa-times mr-2"></i>
                        Limpar Filtros
                    </button>` : ''}
                </div>
            `;
            return;
        }
        
        let html = '';
        
        activities.forEach(activity => {
            const dados = activity.dados || {};
            const isSelected = activity.id === selectedActivityId;
            
            // Determinar cor do badge baseado no status
            const statusClass = `badge-status-${activity.status_revisao}`;
            const statusLabel = getStatusLabel(activity.status_revisao);
            
            // Contar comentários
            const commentCount = activity.comentarios?.length || 0;
            
            html += `
                <div class="card card-compact bg-base-100 shadow hover:shadow-lg activity-card ${isSelected ? 'ring-2 ring-primary' : ''}"
                     onclick="selectActivity(${activity.id})"
                     data-id="${activity.id}">
                    <div class="card-body">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h3 class="card-title text-lg mb-1">
                                    ${dados.nome || 'Sem nome'}
                                    <span class="text-sm font-normal text-gray-500">#${activity.id}</span>
                                </h3>
                                <div class="flex flex-wrap gap-1 mb-2">
                                    <span class="badge badge-outline">
                                        <i class="fas fa-tag mr-1"></i> ${dados.categoria || 'Sem categoria'}
                                    </span>
                                    <span class="badge badge-outline">
                                        <i class="fas fa-child mr-1"></i> ${dados.faixa_etaria || 'Sem idade'}
                                    </span>
                                    <span class="badge badge-outline">
                                        <i class="fas fa-clock mr-1"></i> ${dados.tempo_entretenimento || 'Sem tempo'}
                                    </span>
                                </div>
                            </div>
                            <div class="badge ${statusClass} font-semibold">
                                ${statusLabel}
                            </div>
                        </div>
                        
                        <p class="text-gray-600 text-sm line-clamp-2">
                            ${(dados.descricao || '').substring(0, 120)}${(dados.descricao || '').length > 120 ? '...' : ''}
                        </p>
                        
                        <div class="card-actions justify-between items-center mt-3">
                            <div class="text-sm text-gray-500">
                                <i class="fas fa-comment mr-1"></i> ${commentCount} comentário${commentCount !== 1 ? 's' : ''}
                            </div>
                            <button class="btn btn-sm btn-primary">
                                Ver detalhes
                                <i class="fas fa-chevron-right ml-1"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        activitiesContainer.innerHTML = html;
    }
    
    // Selecionar atividade
    window.selectActivity = async function(activityId) {
        showLoading('Carregando detalhes...');
        
        try {
            // Buscar atividade completa
            const { data, error } = await supabase
                .from('atividades_v2')
                .select('*')
                .eq('id', activityId)
                .single();
            
            if (error) throw error;
            
            selectedActivityId = activityId;
            
            // Atualizar seleção visual
            document.querySelectorAll('.activity-card').forEach(card => {
                card.classList.remove('ring-2', 'ring-primary');
                if (parseInt(card.dataset.id) === activityId) {
                    card.classList.add('ring-2', 'ring-primary');
                }
            });
            
            // Renderizar detalhes
            renderActivityDetail(data);
            
            // Abrir drawer (painel lateral)
            document.getElementById('drawer-toggle').checked = true;
            
        } catch (error) {
            showError(`Falha ao carregar atividade: ${error.message}`);
        } finally {
            hideLoading();
        }
    };
    
    // Renderizar detalhes da atividade
    function renderActivityDetail(activity) {
        if (!detailContent || !detailTitle) return;
        
        const dados = activity.dados || {};
        
        // Atualizar título
        detailTitle.textContent = `${dados.nome || 'Atividade'} (ID: ${activity.id})`;
        
        // Gerar conteúdo
        let html = `
            <!-- Informações Básicas -->
            <div class="card bg-base-100 shadow mb-4">
                <div class="card-body">
                    <h4 class="card-title">
                        <i class="fas fa-info-circle text-primary mr-2"></i>
                        Informações Básicas
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <div>
                                <label class="font-semibold text-sm text-gray-500">Categoria</label>
                                <p class="text-lg">${dados.categoria || 'Não informado'}</p>
                            </div>
                            <div>
                                <label class="font-semibold text-sm text-gray-500">Faixa etária</label>
                                <p class="text-lg">${dados.faixa_etaria || 'Não informado'}</p>
                            </div>
                            <div>
                                <label class="font-semibold text-sm text-gray-500">Tempo de entretenimento</label>
                                <p class="text-lg">${dados.tempo_entretenimento || 'Não informado'}</p>
                            </div>
                            <div>
                                <label class="font-semibold text-sm text-gray-500">Preparo adulto</label>
                                <p class="text-lg">${dados.preparo_adulto || 'Não informado'}</p>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <div>
                                <label class="font-semibold text-sm text-gray-500">Nível de bagunça</label>
                                <p class="text-lg">${dados.nivel_bagunca || 'Não informado'}</p>
                            </div>
                            <div>
                                <label class="font-semibold text-sm text-gray-500">Custo</label>
                                <p class="text-lg">${dados.custo || 'Não informado'}</p>
                            </div>
                            <div>
                                <label class="font-semibold text-sm text-gray-500">Supervisão</label>
                                <p class="text-lg">${dados.supervisao || 'Não informado'}</p>
                            </div>
                            <div>
                                <label class="font-semibold text-sm text-gray-500">Energia da criança</label>
                                <p class="text-lg">${dados.energia_crianca || 'Não informado'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Descrição e Objetivos -->
            <div class="card bg-base-100 shadow mb-4">
                <div class="card-body">
                    <h4 class="card-title">
                        <i class="fas fa-file-alt text-primary mr-2"></i>
                        Descrição
                    </h4>
                    <div class="space-y-4">
                        <div>
                            <label class="font-semibold text-sm text-gray-500">Descrição</label>
                            <p class="text-lg">${dados.descricao || 'Sem descrição'}</p>
                        </div>
                        <div>
                            <label class="font-semibold text-sm text-gray-500">Como aplicar</label>
                            <p>${dados.como_aplicar || 'Sem instruções'}</p>
                        </div>
                        <div>
                            <label class="font-semibold text-sm text-gray-500">Objetivo</label>
                            <p>${dados.objetivo || 'Sem objetivo'}</p>
                        </div>
                        <div>
                            <label class="font-semibold text-sm text-gray-500">Por que é boa</label>
                            <p>${dados.porque_e_boa || 'Sem justificativa'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Materiais
        if (dados.materiais_necessarios) {
            html += `
                <div class="card bg-base-100 shadow mb-4">
                    <div class="card-body">
                        <h4 class="card-title">
                            <i class="fas fa-box-open text-primary mr-2"></i>
                            Materiais Necessários
                        </h4>
                        <p>${dados.materiais_necessarios}</p>
                    </div>
                </div>
            `;
        }
        
        // Tags
        if (dados.tags && dados.tags.length > 0) {
            html += `
                <div class="card bg-base-100 shadow mb-4">
                    <div class="card-body">
                        <h4 class="card-title">
                            <i class="fas fa-tags text-primary mr-2"></i>
                            Tags
                        </h4>
                        <div class="flex flex-wrap gap-2">
                            ${dados.tags.map(tag => `<span class="badge badge-outline">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Formulário de status
        html += `
            <div class="card bg-base-100 shadow mb-4">
                <div class="card-body">
                    <h4 class="card-title">
                        <i class="fas fa-flag text-primary mr-2"></i>
                        Alterar Status
                    </h4>
                    <div class="space-y-4">
                        <div>
                            <label class="font-semibold text-sm text-gray-500">Status atual</label>
                            <div class="badge badge-status-${activity.status_revisao} font-semibold text-lg mt-1">
                                ${getStatusLabel(activity.status_revisao)}
                            </div>
                        </div>
                        <div class="form-control">
                            <label class="label">
                                <span class="label-text">Novo status</span>
                            </label>
                            <select id="status-select" class="select select-bordered w-full">
                                <option value="pendente" ${activity.status_revisao === 'pendente' ? 'selected' : ''}>Pendente</option>
                                <option value="em_revisao" ${activity.status_revisao === 'em_revisao' ? 'selected' : ''}>Em Revisão</option>
                                <option value="aprovada" ${activity.status_revisao === 'aprovada' ? 'selected' : ''}>Aprovada</option>
                                <option value="precisa_melhorias" ${activity.status_revisao === 'precisa_melhorias' ? 'selected' : ''}>Precisa Melhorias</option>
                            </select>
                        </div>
                        <button onclick="updateStatus(${activity.id})" class="btn btn-primary w-full">
                            <i class="fas fa-save mr-2"></i>
                            Atualizar Status
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Comentários existentes
        html += `
            <div class="card bg-base-100 shadow mb-4">
                <div class="card-body">
                    <h4 class="card-title">
                        <i class="fas fa-comments text-primary mr-2"></i>
                        Comentários (${activity.comentarios?.length || 0})
                    </h4>
                    <div class="space-y-4">
        `;
        
        if (activity.comentarios && activity.comentarios.length > 0) {
            activity.comentarios.reverse().forEach((comentario, index) => {
                html += `
                    <div class="chat chat-start">
                        <div class="chat-header">
                            ${comentario.autor || 'Usuário'}
                            <time class="text-xs opacity-50 ml-2">${formatDate(comentario.data)}</time>
                        </div>
                        <div class="chat-bubble">
                            <p>${comentario.texto || ''}</p>
                            ${comentario.links && comentario.links.length > 0 ? `
                                <div class="comment-links mt-2 pt-2 border-t border-gray-200">
                                    <strong class="text-sm">Links:</strong>
                                    <ul class="mt-1 space-y-1">
                                        ${comentario.links.map(link => `
                                            <li>
                                                <a href="${link}" target="_blank" rel="noopener" class="text-primary hover:underline">
                                                    <i class="fas fa-external-link-alt mr-1"></i>
                                                    ${link.substring(0, 50)}${link.length > 50 ? '...' : ''}
                                                </a>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
        } else {
            html += `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <span>Nenhum comentário ainda. Seja o primeiro a comentar!</span>
                </div>
            `;
        }
        
        html += `
                    </div>
                </div>
            </div>
        `;
        
        // Formulário de novo comentário
        html += `
            <div class="card bg-base-100 shadow">
                <div class="card-body">
                    <h4 class="card-title">
                        <i class="fas fa-plus-circle text-primary mr-2"></i>
                        Adicionar Comentário
                    </h4>
                    <div class="space-y-4">
                        <div class="form-control">
                            <label class="label">
                                <span class="label-text">Texto do comentário (instruções para melhorias)</span>
                            </label>
                            <textarea id="comment-text" class="textarea textarea-bordered h-24" 
                                placeholder="Ex: Sugiro melhorar a descrição, adicionar mais materiais, etc."></textarea>
                        </div>
                        <div class="form-control">
                            <label class="label">
                                <span class="label-text">Links para referências (um por linha)</span>
                            </label>
                            <textarea id="comment-links" class="textarea textarea-bordered h-20" 
                                placeholder="Ex: https://exemplo.com/tutorial
https://pinterest.com/ideias
https://youtube.com/video"></textarea>
                        </div>
                        <div class="form-control">
                            <label class="label">
                                <span class="label-text">Autor</span>
                            </label>
                            <input type="text" id="comment-author" class="input input-bordered" value="Ricardo" placeholder="Seu nome">
                        </div>
                        <button onclick="addComment(${activity.id})" class="btn btn-success w-full">
                            <i class="fas fa-paper-plane mr-2"></i>
                            Adicionar Comentário
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        detailContent.innerHTML = html;
    }
    
    // Atualizar status
    window.updateStatus = async function(activityId) {
        const statusSelect = document.getElementById('status-select');
        if (!statusSelect) return;
        
        const newStatus = statusSelect.value;
        
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
            
            // Atualizar detalhes se esta atividade estiver selecionada
            if (selectedActivityId === activityId) {
                await selectActivity(activityId);
            }
            
            // Mostrar notificação de sucesso
            showNotification('✅ Status atualizado com sucesso!', 'success');
            
        } catch (error) {
            showError(`Falha ao atualizar status: ${error.message}`);
        } finally {
            hideLoading();
        }
    };
    
    // Adicionar comentário
    window.addComment = async function(activityId) {
        const commentText = document.getElementById('comment-text');
        const commentLinks = document.getElementById('comment-links');
        const commentAuthor = document.getElementById('comment-author');
        
        if (!commentText || !commentText.value.trim()) {
            showNotification('Por favor, digite um comentário.', 'warning');
            return;
        }
        
        showLoading('Adicionando comentário...');
        
        try {
            // Buscar atividade atual
            const { data: currentData, error: fetchError } = await supabase
                .from('atividades_v2')
                .select('*')
                .eq('id', activityId)
                .single();
            
            if (fetchError) throw fetchError;
            
            // Processar links
            const links = commentLinks.value
                .split('\n')
                .map(link => link.trim())
                .filter(link => link.length > 0);
            
            // Novo comentário
            const novoComentario = {
                data: new Date().toISOString(),
                autor: commentAuthor.value.trim() || 'Usuário',
                texto: commentText.value.trim(),
                links: links
            };
            
            // Adicionar aos comentários existentes
            const comentarios = currentData.comentarios || [];
            comentarios.push(novoComentario);
            
            // Atualizar no Supabase
            const { error } = await supabase
                .from('atividades_v2')
                .update({
                    comentarios: comentarios,
                    updated_at: new Date().toISOString()
                })
                .eq('id', activityId);
            
            if (error) throw error;
            
            // Limpar formulário
            commentText.value = '';
            commentLinks.value = '';
            
            // Recarregar detalhes
            await selectActivity(activityId);
            
            // Mostrar notificação
            showNotification('✅ Comentário adicionado com sucesso!', 'success');
            
        } catch (error) {
            showError(`Falha ao adicionar comentário: ${error.message}`);
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
    
    function formatDate(isoString) {
        try {
            const date = new Date(isoString);
            return date.toLocaleString('pt-BR');
        } catch (e) {
            return isoString || 'Data desconhecida';
        }
    }
    
    function showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `toast toast-top toast-end`;
        notification.innerHTML = `
            <div class="alert alert-${type}">
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
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
        
        // Fechar drawer com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const drawerToggle = document.getElementById('drawer-toggle');
                if (drawerToggle) drawerToggle.checked = false;
            }
        });
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
            
            console.log('✅ Conexão com Supabase estabelecida');
            
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