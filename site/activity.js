// Visualização de Atividade em Tela Inteira - Desplugados
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
    
    // Elementos de conteúdo
    const activityTitle = document.getElementById('activity-title');
    const activityStatus = document.getElementById('activity-status');
    const activityId = document.getElementById('activity-id');
    const activityCategory = document.getElementById('activity-category');
    const activityAge = document.getElementById('activity-age');
    const activityDescription = document.getElementById('activity-description');
    const editJsonBtn = document.getElementById('edit-json-btn');
    
    // Informações da tabela
    const infoTempo = document.getElementById('info-tempo');
    const infoPreparo = document.getElementById('info-preparo');
    const infoBagunca = document.getElementById('info-bagunca');
    const infoCusto = document.getElementById('info-custo');
    const infoSupervisao = document.getElementById('info-supervisao');
    const infoEnergia = document.getElementById('info-energia');
    const infoLocal = document.getElementById('info-local');
    const infoMomento = document.getElementById('info-momento');
    const infoClima = document.getElementById('info-clima');
    
    // Conteúdo principal
    const infoMateriais = document.getElementById('info-materiais');
    const infoTags = document.getElementById('info-tags');
    const infoComoAplicar = document.getElementById('info-como-aplicar');
    const infoObjetivo = document.getElementById('info-objetivo');
    const infoPorqueBoa = document.getElementById('info-porque-boa');
    const infoResolve = document.getElementById('info-resolve');
    const infoDescricaoHtml = document.getElementById('info-descricao-html');
    
    // Comentários
    const commentCount = document.getElementById('comment-count');
    const commentsContainer = document.getElementById('comments-container');
    
    // Funções de utilidade
    function showLoading(message = 'Carregando...') {
        if (loadingText) loadingText.textContent = message;
        if (loadingOverlay) loadingOverlay.classList.remove('hidden');
    }
    
    function hideLoading() {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
    
    function showError(message) {
        hideLoading();
        alert(`Erro: ${message}`);
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
    
    // Formatar data
    function formatDate(isoString) {
        try {
            const date = new Date(isoString);
            return date.toLocaleString('pt-BR');
        } catch (e) {
            return isoString || 'Data desconhecida';
        }
    }
    
    // Carregar atividade
    async function loadActivity() {
        const activityId = getActivityIdFromUrl();
        
        if (!activityId || isNaN(activityId)) {
            showNotFound();
            return;
        }
        
        showLoading(`Carregando atividade #${activityId}...`);
        
        try {
            // Buscar atividade do Supabase
            const { data, error } = await supabase
                .from('atividades_v2')
                .select('*')
                .eq('id', activityId)
                .single();
            
            if (error) throw error;
            
            if (!data) {
                showNotFound();
                return;
            }
            
            // Renderizar atividade
            renderActivity(data);
            
        } catch (error) {
            if (error.code === 'PGRST116') {
                // Registro não encontrado
                showNotFound();
            } else {
                showError(`Falha ao carregar atividade: ${error.message}`);
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
    }
    
    // Renderizar atividade
    function renderActivity(activity) {
        const dados = activity.dados || {};
        
        // Atualizar título da página
        document.title = `${dados.nome || 'Atividade'} - Desplugados`;
        
        // Informações básicas
        if (activityTitle) activityTitle.textContent = dados.nome || 'Sem nome';
        if (activityStatus) {
            activityStatus.textContent = getStatusLabel(activity.status_revisao);
            activityStatus.className = `badge badge-lg ${getStatusClass(activity.status_revisao)}`;
        }
        if (activityId) activityId.textContent = `ID: ${activity.id}`;
        if (activityCategory) activityCategory.textContent = dados.categoria || 'Sem categoria';
        if (activityAge) activityAge.textContent = dados.faixa_etaria || 'Sem idade';
        if (activityDescription) activityDescription.textContent = dados.descricao || 'Sem descrição';
        
        // Botão de edição
        if (editJsonBtn) {
            editJsonBtn.disabled = false;
            editJsonBtn.onclick = () => {
                window.open(`https://github.com/botfredes/desplugados-atividades/edit/main/atividades/individuais/${String(activity.id).padStart(3, '0')}-${dados.slug || 'atividade'}.json`, '_blank');
            };
        }
        
        // Tabela de informações
        if (infoTempo) infoTempo.textContent = dados.tempo_entretenimento || '-';
        if (infoPreparo) infoPreparo.textContent = dados.preparo_adulto || '-';
        if (infoBagunca) infoBagunca.textContent = dados.nivel_bagunca || '-';
        if (infoCusto) infoCusto.textContent = dados.custo || '-';
        if (infoSupervisao) infoSupervisao.textContent = dados.supervisao || '-';
        if (infoEnergia) infoEnergia.textContent = dados.energia_crianca || '-';
        if (infoLocal) infoLocal.textContent = dados.local || '-';
        if (infoMomento) infoMomento.textContent = dados.momento_ideal || '-';
        if (infoClima) infoClima.textContent = dados.clima || '-';
        
        // Materiais
        if (infoMateriais) {
            infoMateriais.innerHTML = dados.materiais_necessarios ? 
                `<p>${dados.materiais_necessarios.replace(/\n/g, '<br>')}</p>` : 
                '<p class="text-gray-500">Não informado</p>';
        }
        
        // Tags
        if (infoTags) {
            if (dados.tags && dados.tags.length > 0) {
                infoTags.innerHTML = dados.tags.map(tag => 
                    `<span class="badge badge-outline">${tag}</span>`
                ).join('');
            } else {
                infoTags.innerHTML = '<span class="text-gray-500">Nenhuma tag</span>';
            }
        }
        
        // Conteúdo textual
        if (infoComoAplicar) {
            infoComoAplicar.innerHTML = dados.como_aplicar ? 
                `<p>${dados.como_aplicar.replace(/\n/g, '<br>')}</p>` : 
                '<p class="text-gray-500">Não informado</p>';
        }
        
        if (infoObjetivo) {
            infoObjetivo.innerHTML = dados.objetivo ? 
                `<p>${dados.objetivo}</p>` : 
                '<p class="text-gray-500">Não informado</p>';
        }
        
        if (infoPorqueBoa) {
            infoPorqueBoa.innerHTML = dados.porque_e_boa ? 
                `<p>${dados.porque_e_boa}</p>` : 
                '<p class="text-gray-500">Não informado</p>';
        }
        
        if (infoResolve) {
            infoResolve.innerHTML = dados.o_que_resolve ? 
                `<p>${dados.o_que_resolve}</p>` : 
                '<p class="text-gray-500">Não informado</p>';
        }
        
        // Descrição HTML
        if (infoDescricaoHtml) {
            if (dados.descricao_html) {
                infoDescricaoHtml.innerHTML = dados.descricao_html;
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
    }
    
    // Renderizar comentários
    function renderComments(comentarios) {
        if (!commentCount || !commentsContainer) return;
        
        commentCount.textContent = comentarios.length;
        
        if (comentarios.length === 0) {
            commentsContainer.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-comment-slash text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">Nenhum comentário ainda.</p>
                </div>
            `;
            return;
        }
        
        // Ordenar por data (mais recente primeiro)
        comentarios.sort((a, b) => new Date(b.data) - new Date(a.data));
        
        let html = '';
        
        comentarios.forEach((comentario, index) => {
            html += `
                <div class="chat chat-start">
                    <div class="chat-image avatar">
                        <div class="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                            <i class="fas fa-user"></i>
                        </div>
                    </div>
                    <div class="chat-header">
                        ${comentario.autor || 'Usuário'}
                        <time class="text-xs opacity-50 ml-2">${formatDate(comentario.data)}</time>
                    </div>
                    <div class="chat-bubble">
                        <p class="whitespace-pre-wrap">${comentario.texto || ''}</p>
                        ${comentario.links && comentario.links.length > 0 ? `
                            <div class="mt-3 pt-3 border-t border-gray-200">
                                <strong class="text-sm block mb-1">Links de referência:</strong>
                                <ul class="space-y-1">
                                    ${comentario.links.map(link => `
                                        <li>
                                            <a href="${link}" target="_blank" rel="noopener" 
                                               class="text-primary hover:underline break-all">
                                                <i class="fas fa-external-link-alt mr-1"></i>
                                                ${link}
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
        
        commentsContainer.innerHTML = html;
    }
    
    // Inicializar
    async function init() {
        // Carregar atividade
        await loadActivity();
    }
    
    // Iniciar
    init();
});