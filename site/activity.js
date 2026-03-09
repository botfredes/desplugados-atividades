// Script para página de detalhes da atividade
document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const loadingElement = document.getElementById('loading');
    const activityContainer = document.getElementById('activity-container');
    const notFoundElement = document.getElementById('not-found');
    
    // Obter ID da atividade da URL
    function getActivityIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        return id ? parseInt(id) : null;
    }
    
    // Encontrar atividade pelo ID
    function findActivityById(id) {
        return atividadesData.atividades.find(activity => activity.id === id);
    }
    
    // Formatar tempo para legibilidade
    function formatTime(minutes) {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hours}h${mins}min` : `${hours}h`;
        }
    }
    
    // Renderizar detalhes da atividade
    function renderActivityDetails(activity) {
        // Determinar ícone de dificuldade
        const difficultyIcons = {
            'easy': 'fas fa-smile',
            'medium': 'fas fa-meh',
            'hard': 'fas fa-grimace'
        };
        
        // Determinar texto de dificuldade
        const difficultyTexts = {
            'easy': 'Fácil',
            'medium': 'Médio', 
            'hard': 'Difícil'
        };
        
        // Criar HTML
        const html = `
            <div class="detail-header">
                <h2>${activity.nome}</h2>
                <div class="detail-category">
                    <i class="${activity.categoria_icon}"></i>
                    <span>${activity.categoria}</span>
                </div>
                <div class="detail-meta">
                    <div class="detail-meta-item">
                        <i class="fas fa-child"></i>
                        <span>${activity.faixa_etaria}</span>
                    </div>
                    <div class="detail-meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${activity.tempo_entretenimento}</span>
                    </div>
                    <div class="detail-meta-item">
                        <i class="fas fa-broom"></i>
                        <span>${activity.nivel_bagunca}</span>
                    </div>
                    <div class="detail-meta-item">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>${activity.custo}</span>
                    </div>
                    <div class="detail-meta-item">
                        <i class="${difficultyIcons[activity.dificuldade]}"></i>
                        <span>${difficultyTexts[activity.dificuldade]}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-content">
                <div class="detail-section">
                    <h3><i class="fas fa-info-circle"></i> Descrição</h3>
                    <p>${activity.descricao}</p>
                </div>
                
                <div class="detail-grid">
                    <div class="detail-card">
                        <h4><i class="fas fa-bullseye"></i> Objetivo</h4>
                        <p>${activity.objetivo}</p>
                    </div>
                    
                    <div class="detail-card">
                        <h4><i class="fas fa-tools"></i> Materiais Necessários</h4>
                        <p>${activity.materiais_necessarios}</p>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3><i class="fas fa-play-circle"></i> Como Aplicar</h3>
                    <p>${activity.como_aplicar}</p>
                </div>
                
                <div class="detail-section">
                    <h3><i class="fas fa-lightbulb"></i> Resumo para os Pais</h3>
                    <p>${activity.resumo_pais}</p>
                </div>
                
                ${activity.tags && activity.tags.length > 0 ? `
                <div class="detail-section">
                    <h3><i class="fas fa-tags"></i> Tags</h3>
                    <div class="detail-tags">
                        ${activity.tags.map(tag => `<span class="detail-tag">${tag}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="detail-section">
                    <h3><i class="fas fa-chart-bar"></i> Informações Técnicas</h3>
                    <div class="detail-grid">
                        <div class="detail-card">
                            <h4><i class="fas fa-user-shield"></i> Supervisão</h4>
                            <p>${activity.supervisao}</p>
                        </div>
                        <div class="detail-card">
                            <h4><i class="fas fa-home"></i> Local</h4>
                            <p>${activity.local || 'Qualquer lugar'}</p>
                        </div>
                        <div class="detail-card">
                            <h4><i class="fas fa-clock"></i> Momento Ideal</h4>
                            <p>${activity.momento_ideal}</p>
                        </div>
                        <div class="detail-card">
                            <h4><i class="fas fa-cloud-sun"></i> Clima</h4>
                            <p>${activity.clima}</p>
                        </div>
                        <div class="detail-card">
                            <h4><i class="fas fa-bolt"></i> Tipo de Atividade</h4>
                            <p>${activity.tipo_atividade}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        activityContainer.innerHTML = html;
        activityContainer.style.display = 'block';
    }
    
    // Inicializar página
    function initPage() {
        const activityId = getActivityIdFromUrl();
        
        if (!activityId) {
            // ID não fornecido, mostrar erro
            showNotFound();
            return;
        }
        
        const activity = findActivityById(activityId);
        
        if (!activity) {
            // Atividade não encontrada
            showNotFound();
            return;
        }
        
        // Atividade encontrada, renderizar
        setTimeout(() => {
            loadingElement.style.display = 'none';
            renderActivityDetails(activity);
            
            // Atualizar título da página
            document.title = `Desplugados - ${activity.nome}`;
        }, 500);
    }
    
    // Mostrar mensagem de não encontrado
    function showNotFound() {
        setTimeout(() => {
            loadingElement.style.display = 'none';
            notFoundElement.style.display = 'block';
        }, 500);
    }
    
    // Inicializar
    initPage();
});