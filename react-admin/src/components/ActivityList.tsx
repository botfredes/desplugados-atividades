import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchActivities, Filters } from '../api/activities';
import { Atividade } from '../types';
import { formatCustoSimples, getCustoColorClass, formatFaixaEtaria } from '../utils/formatting';

const ActivityList: React.FC = () => {
  const [activities, setActivities] = useState<Atividade[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Carregar filtros do localStorage
  const loadFiltersFromStorage = (): Filters => {
    if (typeof window === 'undefined') {
      return {
        status_revisao: '',
        categoria: '',
        faixa_etaria: '',
        search: '',
      };
    }
    const saved = localStorage.getItem('desplugados_admin_filters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          status_revisao: parsed.status_revisao || '',
          categoria: parsed.categoria || '',
          faixa_etaria: parsed.faixa_etaria || '',
          search: parsed.search || '',
        };
      } catch (e) {
        console.error('Erro ao carregar filtros do localStorage:', e);
      }
    }
    return {
      status_revisao: '',
      categoria: '',
      faixa_etaria: '',
      search: '',
    };
  };

  const [filters, setFilters] = useState<Filters>(loadFiltersFromStorage);
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Salvar filtros no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem('desplugados_admin_filters', JSON.stringify(filters));
  }, [filters]);

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'em_revisao', label: 'Em Revisão' },
    { value: 'aprovada', label: 'Aprovada' },
    { value: 'precisa_melhorias', label: 'Precisa Melhorias' },
    { value: 'nao_aprovado', label: 'Não Aprovado' } // Filtro especial
  ];
  const categoriaOptions = ['Artes', 'Brincadeiras', 'Culinária', 'Esportes', 'Jogos', 'Música', 'Natureza', 'Tecnologia'];
  const idadeOptions = ['3-4 anos', '3-6 anos', '4-8 anos', '5-6 anos', '6-8 anos', '7-8 anos', '3-8 anos', '5-8 anos'];

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchActivities(page, filters);
        setActivities(data);
        setTotalCount(143);
      } catch (err) {
        setError('Erro ao carregar atividades. Tente novamente.');
        console.error('Erro ao carregar atividades:', err);
      } finally {
        setLoading(false);
      }
    };
    loadActivities();
  }, [page, filters]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Resetar para primeira página ao filtrar
  };

  const handleSearchSubmit = () => {
    setFilters(prev => ({ ...prev, search: searchInput }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      status_revisao: '',
      categoria: '',
      faixa_etaria: '',
      search: '',
    });
    setSearchInput('');
    setPage(1);
  };

  // Sincronizar searchInput quando filters.search mudar externamente (ex: limpar filtros)
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovada': return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'em_revisao': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'precisa_melhorias': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalPages = Math.ceil(totalCount / 10);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Atividades Desplugados</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Carregando atividades...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Atividades Desplugados</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Atividades Desplugados</h1>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Busca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome da atividade..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              />
              <button
                onClick={handleSearchSubmit}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
              >
                Filtrar
              </button>
            </div>
          </div>
          
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status_revisao || ''}
              onChange={(e) => handleFilterChange('status_revisao', e.target.value)}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.categoria || ''}
              onChange={(e) => handleFilterChange('categoria', e.target.value)}
            >
              <option value="">Todas</option>
              {categoriaOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          
          {/* Faixa etária */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.faixa_etaria || ''}
              onChange={(e) => handleFilterChange('faixa_etaria', e.target.value)}
            >
              <option value="">Todas</option>
              {idadeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Limpar Filtros */}
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>
      
      {/* Grid de Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {activities.map((activity) => (
          <Link
            key={activity.id}
            to={`/activity/${activity.id}`}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer block"
          >
            <div className="flex flex-col h-full">
              {/* Cabeçalho do Card */}
              <div className="mb-3">
                <h3 className="font-semibold text-gray-800 text-lg line-clamp-2">
                  {activity.dados.nome}
                </h3>
              </div>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(activity.status_revisao)}`}>
                  {activity.status_revisao}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                  {activity.dados.categoria}
                </span>
                
                {/* Faixa etária (expandida se diferente) */}
                {activity.dados.faixa_etaria_expandida && 
                 activity.dados.faixa_etaria_expandida !== activity.dados.faixa_etaria ? (
                  <span 
                    className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200"
                    title={`Faixa original: ${activity.dados.faixa_etaria}`}
                  >
                    {activity.dados.faixa_etaria_expandida} ↗
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                    {activity.dados.faixa_etaria}
                  </span>
                )}
                
                {/* Custo simplificado */}
                {activity.dados.custo_simples !== undefined && (
                  <span 
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${getCustoColorClass(activity.dados.custo_simples)} ${activity.dados.custo_simples === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                    title={activity.dados.custo || 'Custo'}
                  >
                    {formatCustoSimples(activity.dados.custo_simples)}
                  </span>
                )}
              </div>
              
              {/* Detalhes Resumidos */}
              <div className="mt-auto text-sm text-gray-600 space-y-1">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Tempo: {activity.dados.tempo_preparacao || 'Não informado'}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                  <span>
                    Custo:{' '}
                    {activity.dados.custo_simples !== undefined ? (
                      <span className="font-medium" title={activity.dados.custo || ''}>
                        {' '}
                        <span className={getCustoColorClass(activity.dados.custo_simples)}>
                          {formatCustoSimples(activity.dados.custo_simples)}
                        </span>
                        {activity.dados.custo && activity.dados.custo_simples !== 0 && (
                          <span className="text-gray-500 text-xs ml-1">({activity.dados.custo})</span>
                        )}
                      </span>
                    ) : (
                      <span>{activity.dados.custo || 'Não informado'}</span>
                    )}
                  </span>
                </div>
              </div>
              
              {/* Botão de Ação (opcional) */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="text-blue-600 font-medium text-sm flex items-center">
                  Ver detalhes
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Paginação */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{(page - 1) * 10 + 1}</span> a{' '}
              <span className="font-medium">{Math.min(page * 10, totalCount)}</span> de{' '}
              <span className="font-medium">{totalCount}</span> atividades
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Anterior</span>
                &larr;
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === i + 1
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Próxima</span>
                &rarr;
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityList;
