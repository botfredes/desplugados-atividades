// Site Desplugados - Script principal
document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const activitiesGrid = document.getElementById('activities-grid');
    const categoriesGrid = document.getElementById('categories-grid');
    const categoryFilter = document.getElementById('category-filter');
    const ageFilter = document.getElementById('age-filter');
    const timeFilter = document.getElementById('time-filter');
    const searchInput = document.getElementById('search-input');
    const loadingElement = document.getElementById('loading');
    const totalActivitiesElement = document.getElementById('total-activities');
    
    // Dados das atividades (carregados do arquivo atividades.js)
    let allActivities = atividadesData.atividades;
    let allCategories = atividadesData.categorias;
    let filteredActivities = [...allActivities];
    
    // Inicializar o site
    function initSite() {
        // Atualizar contador total
        if (totalActivitiesElement) {
            totalActivitiesElement.textContent = atividadesData.estatisticas.total;
        }
        
        // Carregar categorias no filtro
        loadCategoryFilter();
        
        // Carregar categorias na seção de categorias
        loadCategories();
        
        // Carregar atividades
        loadActivities();
        
        // Configurar eventos
        setupEventListeners();
        
        // Esconder loading
        setTimeout(() => {
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        }, 500);
    }
    
    // Carregar categorias no dropdown de filtro
    function loadCategoryFilter() {
        if (!categoryFilter) return;
        
        // Limpar opções existentes (mantendo a primeira)
        while (categoryFilter.options.length > 1) {
            categoryFilter.remove(1);
        }
        
        // Adicionar categorias
        allCategories.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.slug;
            option.textContent = categoria.nome;
            categoryFilter.appendChild(option);
        });
    }
    
    // Carregar categorias na seção de categorias
    function loadCategories() {
        if (!categoriesGrid) return;
        
        categoriesGrid.innerHTML = '';
        
        allCategories.forEach(categoria => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.dataset.category = categoria.slug;
            
            categoryCard.innerHTML = `
                <h3><i class="${categoria.icon}"></i> ${categoria.nome}</h3>
                <div class="count">${categoria.count} atividades</div>
            `;
            
            categoryCard.addEventListener('click', () => {
                // Filtrar por esta categoria
                categoryFilter.value = categoria.slug;
                applyFilters();
            });
            
            categoriesGrid.appendChild(categoryCard);
        });
    }
    
    // Carregar atividades na grid
    function loadActivities() {
        if (!activitiesGrid) return;
        
        activitiesGrid.innerHTML = '';
        
        if (filteredActivities.length === 0) {
            activitiesGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>Nenhuma atividade encontrada</h3>
                    <p>Tente ajustar os filtros ou termos da busca</p>
                </div>
            `;
            return;
        }
        
        filteredActivities.forEach(atividade => {
            const activityCard = document.createElement('div');
            activityCard.className = 'activity-card';
            activityCard.dataset.id = atividade.id;
            activityCard.dataset.category = atividade.categoria_slug;
            activityCard.dataset.age = `${atividade.idade_min}-${atividade.idade_max}`;
            activityCard.dataset.time = atividade.tempo_categoria;
            
            // Determinar ícone baseado na categoria
            const icon = atividade.categoria_icon || 'fas fa-star';
            
            // Cor de fundo baseada na categoria (hash simples)
            const categoryHash = stringToColor(atividade.categoria);
            
            activityCard.innerHTML = `
                <div class="activity-image" style="background: ${categoryHash}">
                    <i class="${icon}"></i>
                </div>
                <div class="activity-content">
                    <h3>${atividade.nome}</h3>
                    <div class="activity-meta">
                        <div class="meta-item">
                            <i class="fas fa-child"></i>
                            <span>${atividade.faixa_etaria}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${atividade.tempo_entretenimento}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-broom"></i>
                            <span>${atividade.nivel_bagunca}</span>
                        </div>
                    </div>
                    <p class="activity-description">${atividade.descricao_curta}</p>
                    <div class="activity-tags">
                        ${atividade.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="activity-footer">
                        <span class="difficulty ${atividade.dificuldade}">
                            ${getDifficultyText(atividade.dificuldade)}
                        </span>
                        <button class="view-btn" onclick="viewActivity(${atividade.id})">
                            Ver detalhes <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            `;
            
            activitiesGrid.appendChild(activityCard);
        });
    }
    
    // Aplicar filtros
    function applyFilters() {
        const selectedCategory = categoryFilter.value;
        const selectedAge = ageFilter.value;
        const selectedTime = timeFilter.value;
        const searchTerm = searchInput.value.toLowerCase();
        
        filteredActivities = allActivities.filter(atividade => {
            // Filtro por categoria
            if (selectedCategory && atividade.categoria_slug !== selectedCategory) {
                return false;
            }
            
            // Filtro por idade
            if (selectedAge) {
                const [minAge, maxAge] = selectedAge.split('-').map(Number);
                if (atividade.idade_min > maxAge || atividade.idade_max < minAge) {
                    return false;
                }
            }
            
            // Filtro por tempo
            if (selectedTime && atividade.tempo_categoria !== selectedTime) {
                return false;
            }
            
            // Filtro por busca
            if (searchTerm) {
                const searchFields = [
                    atividade.nome,
                    atividade.descricao,
                    atividade.objetivo,
                    atividade.categoria
                ].join(' ').toLowerCase();
                
                if (!searchFields.includes(searchTerm)) {
                    return false;
                }
                
                // Verificar tags também
                const tagMatch = atividade.tags.some(tag => 
                    tag.toLowerCase().includes(searchTerm)
                );
                
                if (!tagMatch && !searchFields.includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
        
        loadActivities();
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Filtros
        if (categoryFilter) {
            categoryFilter.addEventListener('change', applyFilters);
        }
        
        if (ageFilter) {
            ageFilter.addEventListener('change', applyFilters);
        }
        
        if (timeFilter) {
            timeFilter.addEventListener('change', applyFilters);
        }
        
        // Busca
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(applyFilters, 300);
            });
        }
    }
    
    // Funções auxiliares
    function stringToColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Cores pastéis
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 65%)`;
    }
    
    function getDifficultyText(difficulty) {
        const texts = {
            'easy': 'Fácil',
            'medium': 'Médio',
            'hard': 'Difícil'
        };
        return texts[difficulty] || 'Médio';
    }
    
    // Função para visualizar atividade - redireciona para página de detalhes
    window.viewActivity = function(id) {
        window.location.href = `activity.html?id=${id}`;
    };
    
    // Inicializar o site
    initSite();
});