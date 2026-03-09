// Página de Revisão Mobile - Desplugados
document.addEventListener('DOMContentLoaded', function() {
    // Configurações do Supabase
    const SUPABASE_URL = 'https://yxagqrsdfiokogwksvbu.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_BZutp_epytYYLZiKofldxg_FuqLwXIf';
    
    // Inicializar cliente Supabase
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Elementos DOM
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const activityNotFound = document.getElementById('activity-not-found');
    const activityContent = document.getElementById('activity-content');
    const reviewForm = document.getElementById('review-form');
    const pageTitle = document.getElementById('page-title');
    
    // Elementos de conteúdo
    const activityTitle = document.getElementById('activity-title');
    const activityStatus = document.getElementById('activity-status');
    const activityId = document.getElementById('activity-id');
    const currentStatusBadge = document.getElementById('current-status-badge');
    
    // Informações
    const infoCategoria = document.getElementById('info-categoria');
    const infoIdade = document.getElementById('info-idade');
    const infoTempo = document.getElementById('info-tempo');
    const infoPreparo = document.getElementById('info-preparo');
    const infoBagunca = document.getElementById('info-bagunca');
    const infoCusto = document.getElementById('info-custo');
    const infoDescricao = document.getElementById('info-descricao');
    const infoComoAplicar = document.getElementById('info-como-aplicar');
    const infoMateriais = document.getElementById('info-materiais');
    const infoObjetivo = document.getElementById('info-objetivo');
    const infoPorqueBoa = document.getElementById('info-porque-boa');
    const infoResolve = document.getElementById('info-resolve');
    const infoDescricaoHtml = document.getElementById('info-descricao-html');
    
    // Comentários
    const commentCount = document.getElementById('comment-count');
    const commentsContainer = document.getElementById('comments-container');
    
    // Formulário
    const commentText = document.getElementById('comment-text');
    const commentLinks = document.getElementById('comment-links');
    
    // Estado
    let currentActivity = null;
    let currentActivityId = null;
    
    // Funções de utilidade
    function showLoading(message = 'Carregando...') {
        if (loadingText) loadingText.textContent = message;
        if (loadingOverlay) loadingOverlay.classList.remove('hidden');
    }
    
    function hideLoading() {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
    
    function showNotification(message, type = 'success') {
        // Criar toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-top toast-center`;
        toast.innerHTML = `
            <div class="alert alert-${type} shadow-lg">
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    function showError(message) {
        showNotification(`❌ ${message}`, 'error');
    }
    
    // Obter ID da URL
    function getActivityIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        return id ? parseInt(id) : null;
    }
    
    // Formatar status
    function getStatusLabel(status) {
        const labels = {
            'pendente': 'Pendente',
            'em_revisao': 'Em Revisão',
            'aprovada': 'Aprovada',
            'precisa_melhorias': 'Precisa Melhorias'
        };
        return labels[status] || status;
    }
    
    function getStatusClass(status) {
        return `badge-status-${status}`;
    }
    
    // Formatar data para mobile
    function formatDate(isoString) {
        try {
            const date = new Date(isoString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            if (diffMins < 60) {
                return `há ${diffMins} min`;
            } else if (diffHours < 24) {
                return `há ${diffHours} h`;
            } else if (diffDays < 7) {
                return `há ${diffDays} d`;
            } else {
                return date.toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit',
                    year: '2-digit'
                });
            }
        } catch (e) {
            return 'hoje';
        }
    }
    
    // Carregar atividade
    async function loadActivity() {
        currentActivityId = getActivityIdFromUrl();
        
        if (!currentActivityId || isNaN(currentActivityId)) {
            showNotFound();
            return;
        }
        
        showLoading(`Carregando atividade #${currentActivityId}...`);
        
        try {
            // Buscar atividade do Supabase
            const { data, error } = await supabase
                .from('atividades_v2')
                .select('*')
                .eq('id', currentActivityId)
                .single();
            
            if (error) throw error;
            
            if (!data) {
                showNotFound();
                return;
            }
            
            currentActivity = data;
            renderActivity(data);
            
        } catch (error) {
            if (error.code === 'PGRST116') {
                showNotFound();
            } else {
                showError(`Falha ao carregar: ${error.message}`);
            }
        } finally {
            hideLoading();
        }
    }
    
    // Mostrar "não encontrado"
    function showNotFound() {
        hideLoading();
        if (activityNotFound) {
            activityNotFound.classList.remove('hidden');
        }
        if (activityContent) {
            activityContent.classList.add('hidden');
        }
        if (reviewForm) {
            reviewForm.classList.add('hidden');
        }
    }
    
    // Renderizar atividade
    function renderActivity(activity) {
        const dados = activity.dados || {};
        
        // Atualizar título da página
        document.title = `Revisar: ${dados.nome || 'Atividade'} - Desplugados`;
        if (pageTitle) pageTitle.textContent = dados.nome || 'Revisar';
        
        // Informações básicas
        if (activityTitle) activityTitle.textContent = dados.nome || 'Sem nome';
        updateStatusDisplay(activity.status_revisao);
        if (activityId) activityId.textContent = `ID: ${activity.id}`;
        
        // Tabela de informações
        if (infoCategoria) infoCategoria.textContent = dados.categoria || '-';
        if (infoIdade) infoIdade.textContent = dados.faixa_etaria || '-';
        if (infoTempo) infoTempo.textContent = dados.tempo_entretenimento || '-';
        if (infoPreparo) infoPreparo.textContent = dados.preparo_adulto || '-';
        if (infoBagunca) infoBagunca.textContent = dados.nivel_bagunca || '-';
        if (infoCusto) infoCusto.textContent = dados.custo || '-';
        
        // Conteúdo textual
        if (infoDescricao) infoDescricao.textContent = dados.descricao || 'Sem descrição';
        if (infoComoAplicar) infoComoAplicar.textContent = dados.como_aplicar || 'Não informado';
        if (infoMateriais) infoMateriais.textContent = dados.materiais_necessarios || 'Não informado';
        if (infoObjetivo) infoObjetivo.textContent = dados.objetivo || 'Não informado';
        if (infoPorqueBoa) infoPorqueBoa.textContent = dados.porque_e_boa || 'Não informado';
        if (infoResolve) infoResolve.textContent = dados.o_que_resolve || 'Não informado';
        
        // Descrição HTML
        if (infoDescricaoHtml) {
            if (dados.descricao_html) {
                infoDescricaoHtml.innerHTML = dados.descricao_html;
                // Adicionar classes para mobile
                const elements = infoDescricaoHtml.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, li');
                elements.forEach(el => {
                    el.classList.add('prose-mobile');
                });
            } else {
                infoDescricaoHtml.innerHTML = `
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i>
                        <span>Esta atividade não possui descrição HTML formatada.</span>
                    </div>
                `;
            }
        }
        
        // Comentários
        renderComments(activity.comentarios || []);
        
        // Mostrar conteúdo
        if (activityNotFound) activityNotFound.classList.add('hidden');
        if (activityContent) activityContent.classList.remove('hidden');
        if (reviewForm) reviewForm.classList.remove('hidden');
        
        // Rolar para o topo suavemente
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Atualizar display do status
    function updateStatusDisplay(status) {
        const label = getStatusLabel(status);
        const statusClass = getStatusClass(status);
        
        if (activityStatus) {
            activityStatus.textContent = label;
            activityStatus.className = `badge badge-sm ${statusClass}`;
        }
        
        if (currentStatusBadge) {
            currentStatusBadge.textContent = label;
            currentStatusBadge.className = `badge badge-sm ${statusClass}`;
        }
    }
    
    // Renderizar comentários
    function renderComments(comentarios) {
        if (!commentCount || !commentsContainer) return;
        
        commentCount.textContent = comentarios.length;
        
        if (comentarios.length === 0) {
            commentsContainer.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-comment-slash text-2xl text-gray-300 mb-2"></i>
                    <p class="text-gray-500 text-sm">Nenhum comentário ainda.</p>
                </div>
            `;
            return;
        }
        
        // Ordenar por data (mais recente primeiro)
        comentarios.sort((a, b) => new Date(b.data) - new Date(a.data));
        
        let html = '';
        
        comentarios.forEach((comentario) => {
            const hasLinks = comentario.links && comentario.links.length > 0;
            
            html += `
                <div class="chat chat-start">
                    <div class="chat-image avatar">
                        <div class="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm">
                            ${comentario.autor ? comentario.autor.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </div>
                    <div class="chat-header">
                        <span class="font-medium">${comentario.autor || 'Usuário'}</span>
                        <time class="text-xs opacity-50 ml-2">${formatDate(comentario.data)}</time>
                    </div>
                    <div class="chat-bubble bg-base-200 text-base-content">
                        <div class="whitespace-pre-wrap text-sm">${comentario.texto || ''}</div>
                        ${hasLinks ? `
                            <div class="mt-2 pt-2 border-t border-base-300">
                                <div class="text-xs font-medium mb-1">Links:</div>
                                <div class="space-y-1">
                                    ${comentario.links.map(link => `
                                        <a href="${link}" target="_blank" rel="noopener" 
                                           class="block text-primary hover:underline truncate text-xs">
                                            <i class="fas fa-external-link-alt mr-1"></i>
                                            ${link.replace(/^https?:\/\//, '').substring(0, 40)}${link.length > 40 ? '...' : ''}
                                        </a>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        commentsContainer.innerHTML = html;
        
        // Abrir o accordion de comentários se houver comentários
        const commentsAccordion = document.querySelector('input[type="checkbox"][aria-label="Comentários"]');
        if (commentsAccordion && comentarios.length > 0) {
            commentsAccordion.checked = true;
        }
    }
    
    // Atualizar status (disponível globalmente)
    window.updateStatus = async function(newStatus) {
        if (!currentActivity || !currentActivityId) return;
        
        const oldStatus = currentActivity.status_revisao;
        if (oldStatus === newStatus) {
            showNotification('Status já está definido assim', 'info');
            return;
        }
        
        showLoading('Atualizando status...');
        
        try {
            // Adicionar ao histórico
            const historico = currentActivity.historico || [];
            historico.push({
                data: new Date().toISOString(),
                campo: 'status_revisao',
                valor_antigo: oldStatus,
                valor_novo: newStatus,
                autor: 'revisor'
            });
            
            // Atualizar no Supabase
            const { error } = await supabase
                .from('atividades_v2')
                .update({
                    status_revisao: newStatus,
                    historico: historico,
                    updated_at: new Date().toISOString()
                })
                .eq('id', currentActivityId);
            
            if (error) throw error;
            
            // Atualizar atividade local
            currentActivity.status_revisao = newStatus;
            currentActivity.historico = historico;
            
            // Atualizar display
            updateStatusDisplay(newStatus);
            
            showNotification(`✅ Status alterado para "${getStatusLabel(newStatus)}"`);
            
        } catch (error) {
            showError(`Falha ao atualizar status: ${error.message}`);
        } finally {
            hideLoading();
        }
    };
    
    // Adicionar comentário
    window.addComment = async function() {
        if (!currentActivityId || !commentText || !commentText.value.trim()) {
            showNotification('Digite um comentário antes de enviar', 'warning');
            commentText?.focus();
            return;
        }
        
        showLoading('Adicionando comentário...');
        
        try {
            // Processar links
            const links = commentLinks.value
                .split('\n')
                .map(link => link.trim())
                .filter(link => link.length > 0 && (link.startsWith('http://') || link.startsWith('https://')));
            
            // Novo comentário
            const novoComentario = {
                data: new Date().toISOString(),
                autor: 'Revisor', // Poderia ser configurável
                texto: commentText.value.trim(),
                links: links
            };
            
            // Buscar atividade atual para obter comentários existentes
            const { data: currentData, error: fetchError } = await supabase
                .from('atividades_v2')
                .select('comentarios')
                .eq('id', currentActivityId)
                .single();
            
            if (fetchError) throw fetchError;
            
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
                .eq('id', currentActivityId);
            
            if (error) throw error;
            
            // Atualizar atividade local e interface
            if (currentActivity) {
                currentActivity.comentarios = comentarios;
                renderComments(comentarios);
            }
            
            // Limpar formulário
            clearForm();
            
            // Focar no campo de comentário para próximo
            commentText.focus();
            
            showNotification('✅ Comentário adicionado!');
            
            // Rolar para os comentários
            setTimeout(() => {
                const commentsSection = document.querySelector('input[type="checkbox"][aria-label*="Comentários"]');
                if (commentsSection) {
                    commentsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    commentsSection.checked = true;
                }
            }, 300);
            
        } catch (error) {
            showError(`Falha ao adicionar comentário: ${error.message}`);
        } finally {
            hideLoading();
        }
    };
    
    // Limpar formulário
    window.clearForm = function() {
        if (commentText) commentText.value = '';
        if (commentLinks) commentLinks.value = '';
    };
    
    // Suporte para enviar comentário com Ctrl+Enter
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter' && commentText && document.activeElement === commentText) {
            addComment();
        }
    });
    
    // Inicializar
    async function init() {
        // Verificar se estamos em um dispositivo móvel
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            document.body.classList.add('mobile');
        }
        
        // Carregar atividade
        await loadActivity();
        
        // Focar no campo de comentário após carregar
        setTimeout(() => {
            if (commentText && currentActivity) {
                commentText.focus();
            }
        }, 500);
    }
    
    // Iniciar
    init();
});