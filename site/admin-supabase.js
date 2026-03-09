// Admin Supabase - Desplugados
document.addEventListener('DOMContentLoaded', function() {
    // Configurações do Supabase
    const SUPABASE_URL = 'https://yxagqrsdfiokogwksvbu.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_BZutp_epytYYLZiKofldxg_FuqLwXIf';
    
    // Inicializar cliente Supabase
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Elementos DOM
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const statsGrid = document.getElementById('stats-grid');
    const activitiesContainer = document.getElementById('activities-container');
    const activitiesCount = document.getElementById('activities-count');
    const detailPanel = document.getElementById('activity-detail-panel');
    const detailContent = document.getElementById('detail-content');
    const detailTitle = document.getElementById('detail-title');
    const closePanelBtn = document.getElementById('close-panel');
    const searchInput = document.getElementById('search-input');
    const filterStatus = document.getElementById('filter-status');
    const filterCategory = document.getElementById('filter-category');
    const filterAge = document.getElementById('filter-age');
    
    // Estado
    let allActivities = [];
    let categories = new Set();
    let selectedActivityId = null;
    
    // Funções de utilidade
    function showLoading(message = 'Carregando...') {
        if (loadingText) loadingText.textContent = message;
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
    }
    
    function hideLoading() {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
    
    function showError(message) {
        alert(`Erro: ${message}`);
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
            
            // Esconder loading das atividades
            const loadingEl = document.getElementById('loading-activities');
            if (loadingEl) loadingEl.style.display = 'none';
            
        } catch (error) {
            showError(`Falha ao carregar atividades: ${error.message}`);
        } finally {
            hideLoading();
        }
    }
    
    // Atualizar estatísticas
    function updateStatistics() {
        if (!statsGrid) return;
        
        const total = allActivities.length;
        const pendentes = allActivities.filter(a => a.status_revisao === 'pendente').length;
        const emRevisao = allActivities.filter(a => a.status_revisao === 'em_revisao').length;
        const aprovadas = allActivities.filter(a => a.status_revisao === 'aprovada').length;
        const precisaMelhorias = allActivities.filter(a => a.status_revisao === 'precisa_melhorias').length;
        
        statsGrid.innerHTML = `
            <div class="stat-card">
                <span class="stat-number">${total}</span>
                <span class="stat-label">Total</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${pendentes}</span>
                <span class="stat-label">Pendentes</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${emRevisao}</span>
                <span class="stat-label">Em Revisão</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${aprovadas}</span>
                <span class="stat-label">Aprovadas</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${precisaMelhorias}</span>
                <span class="stat-label">Melhorias</span>
            </div>
        `;
        
        if (activitiesCount) {
            activitiesCount.textContent = total;
        }
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
        
        // Renderizar
        renderActivities(filtered);
    }
    
    // Renderizar lista de atividades
    function renderActivities(activities) {
        if (!activitiesContainer) return;
        
        if (activities.length === 0) {
            activitiesContainer.innerHTML = `
                <div class="no-activities">
                    <i class="fas fa-search" style="font-size: 3rem; color: #6c757d; margin-bottom: 1rem;"></i>
                    <h3>Nenhuma atividade encontrada</h3>
                    <p>Experimente ajustar os filtros ou a busca.</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        activities.forEach(activity => {
            const dados = activity.dados || {};
            const isSelected = activity.id === selectedActivityId;
            
            html += `
                <div class="activity-card-admin ${isSelected ? 'selected' : ''}" 
                     onclick="selectActivity(${activity.id})"
                     data-id="${activity.id}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <h3 style="margin: 0 0 0.25rem 0;">
                                ${dados.nome || 'Sem nome'} 
                                <span style="font-size: 0.9rem; color: #6c757d;">(ID: ${activity.id})</span>
                            </h3>
                            <div class="activity-meta">
                                <span class="meta-tag">
                                    <i class="fas fa-tag"></i> ${dados.categoria || 'Sem categoria'}
                                </span>
                                <span class="meta-tag">
                                    <i class="fas fa-child"></i> ${dados.faixa_etaria || 'Sem idade'}
                                </span>
                                <span class="meta-tag">
                                    <i class="fas fa-clock"></i> ${dados.tempo_entretenimento || 'Sem tempo'}
                                </span>
                                <span class="meta-tag">
                                    <i class="fas ${dados.nivel_bagunca === 'Baixa' ? 'fa-broom' : 'fa-cloud'}"></i> 
                                    ${dados.nivel_bagunca || 'Sem bagunça'}
                                </span>
                            </div>
                        </div>
                        <div>
                            <span class="status-badge status-${activity.status_revisao}">
                                ${getStatusLabel(activity.status_revisao)}
                            </span>
                        </div>
                    </div>
                    
                    <p style="margin: 0.75rem 0 0 0; color: #495057; line-height: 1.4;">
                        ${(dados.descricao || '').substring(0, 120)}${(dados.descricao || '').length > 120 ? '...' : ''}
                    </p>
                    
                    <div style="margin-top: 0.75rem; font-size: 0.85rem; color: #6c757d;">
                        <i class="fas fa-comment"></i> ${activity.comentarios?.length || 0} comentários
                        <span style="margin-left: 1rem;">
                            <i class="fas fa-history"></i> ${activity.historico?.length || 0} histórico
                        </span>
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
            document.querySelectorAll('.activity-card-admin').forEach(card => {
                card.classList.remove('selected');
                if (parseInt(card.dataset.id) === activityId) {
                    card.classList.add('selected');
                }
            });
            
            // Renderizar detalhes
            renderActivityDetail(data);
            
            // Abrir painel
            detailPanel.classList.add('open');
            
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
            <div class="detail-section">
                <h4><i class="fas fa-info-circle"></i> Informações Básicas</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div>
                        <strong>Categoria:</strong> ${dados.categoria || 'Não informado'}
                    </div>
                    <div>
                        <strong>Faixa etária:</strong> ${dados.faixa_etaria || 'Não informado'}
                    </div>
                    <div>
                        <strong>Tempo:</strong> ${dados.tempo_entretenimento || 'Não informado'}
                    </div>
                    <div>
                        <strong>Preparo adulto:</strong> ${dados.preparo_adulto || 'Não informado'}
                    </div>
                    <div>
                        <strong>Nível bagunça:</strong> ${dados.nivel_bagunca || 'Não informado'}
                    </div>
                    <div>
                        <strong>Custo:</strong> ${dados.custo || 'Não informado'}
                    </div>
                    <div>
                        <strong>Supervisão:</strong> ${dados.supervisao || 'Não informado'}
                    </div>
                    <div>
                        <strong>Energia criança:</strong> ${dados.energia_crianca || 'Não informado'}
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-file-alt"></i> Descrição</h4>
                <p>${dados.descricao || 'Sem descrição'}</p>
                
                <h5 style="margin-top: 1rem;">Como aplicar</h5>
                <p>${dados.como_aplicar || 'Sem instruções'}</p>
                
                <h5 style="margin-top: 1rem;">Objetivo</h5>
                <p>${dados.objetivo || 'Sem objetivo'}</p>
                
                <h5 style="margin-top: 1rem;">Por que é boa</h5>
                <p>${dados.porque_e_boa || 'Sem justificativa'}</p>
            </div>
        `;
        
        // Materiais
        if (dados.materiais_necessarios) {
            html += `
                <div class="detail-section">
                    <h4><i class="fas fa-box-open"></i> Materiais Necessários</h4>
                    <p>${dados.materiais_necessarios}</p>
                </div>
            `;
        }
        
        // Tags
        if (dados.tags && dados.tags.length > 0) {
            html += `
                <div class="detail-section">
                    <h4><i class="fas fa-tags"></i> Tags</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${dados.tags.map(tag => `<span class="meta-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        // Descrição HTML
        if (dados.descricao_html) {
            html += `
                <div class="detail-section">
                    <h4><i class="fas fa-code"></i> Descrição Completa (HTML)</h4>
                    <div style="max-height: 300px; overflow-y: auto; padding: 1rem; background: white; border-radius: 6px;">
                        ${dados.descricao_html}
                    </div>
                </div>
            `;
        }
        
        // Formulário de status
        html += `
            <div class="status-form">
                <h4><i class="fas fa-flag"></i> Alterar Status</h4>
                <div class="form-group">
                    <label>Status atual: <span class="status-badge status-${activity.status_revisao}">
                        ${getStatusLabel(activity.status_revisao)}
                    </span></label>
                    <select id="status-select" class="form-control">
                        <option value="pendente" ${activity.status_revisao === 'pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="em_revisao" ${activity.status_revisao === 'em_revisao' ? 'selected' : ''}>Em Revisão</option>
                        <option value="aprovada" ${activity.status_revisao === 'aprovada' ? 'selected' : ''}>Aprovada</option>
                        <option value="precisa_melhorias" ${activity.status_revisao === 'precisa_melhorias' ? 'selected' : ''}>Precisa Melhorias</option>
                    </select>
                </div>
                <button onclick="updateStatus(${activity.id})" class="btn btn-primary">
                    <i class="fas fa-save"></i> Atualizar Status
                </button>
            </div>
        `;
        
        // Comentários existentes
        html += `
            <div class="detail-section">
                <h4><i class="fas fa-comments"></i> Comentários (${activity.comentarios?.length || 0})</h4>
        `;
        
        if (activity.comentarios && activity.comentarios.length > 0) {
            activity.comentarios.reverse().forEach((comentario, index) => {
                html += `
                    <div class="comment">
                        <div class="comment-meta">
                            <span><i class="fas fa-user"></i> ${comentario.autor || 'Usuário'}</span>
                            <span><i class="fas fa-clock"></i> ${formatDate(comentario.data)}</span>
                        </div>
                        <p>${comentario.texto || ''}</p>
                        ${comentario.links && comentario.links.length > 0 ? `
                            <div class="comment-links">
                                <strong><i class="fas fa-link"></i> Links:</strong><br>
                                ${comentario.links.map(link => `
                                    <a href="${link}" target="_blank" rel="noopener">
                                        <i class="fas fa-external-link-alt"></i> ${link.substring(0, 50)}${link.length > 50 ? '...' : ''}
                                    </a>
                                `).join('<br>')}
                            </div>
                        ` : ''}
                    </div>
                `;
            });
        } else {
            html += `<p>Nenhum comentário ainda.</p>`;
        }
        
        html += `</div>`;
        
        // Formulário de novo comentário
        html += `
            <div class="comment-form">
                <h4><i class="fas fa-plus-circle"></i> Adicionar Comentário</h4>
                <div class="form-group">
                    <label>Texto do comentário (instruções para melhorias)</label>
                    <textarea id="comment-text" class="form-control" rows="4" 
                        placeholder="Ex: Sugiro melhorar a descrição, adicionar mais materiais, etc."></textarea>
                </div>
                <div class="form-group">
                    <label>Links para referências (um por linha)</label>
                    <textarea id="comment-links" class="form-control" rows="3" 
                        placeholder="Ex: https://exemplo.com/tutorial
https://pinterest.com/ideias
https://youtube.com/video"></textarea>
                </div>
                <div class="form-group">
                    <label>Autor</label>
                    <input type="text" id="comment-author" class="form-control" value="Ricardo" placeholder="Seu nome">
                </div>
                <button onclick="addComment(${activity.id})" class="btn btn-success">
                    <i class="fas fa-paper-plane"></i> Adicionar Comentário
                </button>
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
            
            alert('✅ Status atualizado com sucesso!');
            
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
            alert('Por favor, digite um comentário.');
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
            
            alert('✅ Comentário adicionado com sucesso!');
            
        } catch (error) {
            showError(`Falha ao adicionar comentário: ${error.message}`);
        } finally {
            hideLoading();
        }
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
    
    // Configurar event listeners
    function setupEventListeners() {
        // Fechar painel
        if (closePanelBtn) {
            closePanelBtn.addEventListener('click', () => {
                detailPanel.classList.remove('open');
                selectedActivityId = null;
                // Remover seleção visual
                document.querySelectorAll('.activity-card-admin').forEach(card => {
                    card.classList.remove('selected');
                });
            });
        }
        
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
        
        // Busca
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                // Debounce para não sobrecarregar
                clearTimeout(window.searchTimeout);
                window.searchTimeout = setTimeout(filterAndRenderActivities, 300);
            });
        }
        
        // Fechar painel com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && detailPanel.classList.contains('open')) {
                detailPanel.classList.remove('open');
                selectedActivityId = null;
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