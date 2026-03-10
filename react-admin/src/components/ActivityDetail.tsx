import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchActivity, updateActivityStatus } from '../api/activities';
import CommentSection from './CommentSection';
import ImprovementRequestModal from './ImprovementRequestModal';
import { Atividade } from '../types';

const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Atividade | null>(null);
  const [loading, setLoading] = useState(true);
  const [improvementRequested, setImprovementRequested] = useState(false);
  const [showImprovementModal, setShowImprovementModal] = useState(false);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setLoading(true);
        const data = await fetchActivity(id!);
        setActivity(data);
        setImprovementRequested(data.status_revisao === 'precisa_melhorias');
      } catch (error) {
        console.error('Erro ao carregar atividade:', error);
      } finally {
        setLoading(false);
      }
    };
    loadActivity();
  }, [id]);

  const approveActivity = async () => {
    if (!activity) return;
    
    if (window.confirm('Tem certeza que deseja aprovar esta atividade? O status será alterado para "Aprovada".')) {
      try {
        await updateActivityStatus(activity.id, 'aprovada');
        setActivity({ ...activity, status_revisao: 'aprovada' });
        alert('✅ Atividade aprovada com sucesso!');
      } catch (error) {
        console.error('Erro ao aprovar atividade:', error);
        alert('❌ Erro ao aprovar atividade.');
      }
    }
  };

  const openImprovementModal = () => {
    setShowImprovementModal(true);
  };

  const handleImprovementSuccess = () => {
    if (activity) {
      setActivity({ ...activity, status_revisao: 'precisa_melhorias' });
      setImprovementRequested(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovada': return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'em_revisao': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'precisa_melhorias': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Carregando atividade...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-700 mb-2">Atividade não encontrada</h2>
          <p className="text-gray-600 mb-4">A atividade com ID {id} não foi encontrada.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Voltar para a lista
          </button>
        </div>
      </div>
    );
  }

  const dados = activity.dados;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Botão Voltar */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 group"
      >
        <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        <span className="font-medium">Voltar para lista</span>
      </button>

      {/* Cabeçalho */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(activity.status_revisao)} mr-3`}>
                {activity.status_revisao}
              </span>
              <span className="text-gray-500 text-sm">ID: {activity.id}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{dados.nome}</h1>
            <p className="text-gray-600 mt-2">Categoria: <span className="font-medium">{dados.categoria}</span> • Faixa etária: <span className="font-medium">{dados.faixa_etaria}</span></p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Botão Aprovar */}
            <button
              onClick={approveActivity}
              className="px-5 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Aprovar
            </button>
            
            {/* Botão Solicitar Melhorias */}
            {!improvementRequested ? (
              <button
                onClick={openImprovementModal}
                className="px-5 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                Solicitar Melhorias
              </button>
            ) : (
              <div className="px-5 py-3 bg-red-50 text-red-700 font-medium rounded-lg border border-red-200 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                Melhorias Solicitadas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Informações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Informações Básicas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Informações Básicas</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 block mb-1">Categoria</label>
              <p className="font-medium text-gray-800">{dados.categoria}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Faixa etária</label>
              <p className="font-medium text-gray-800">{dados.faixa_etaria}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Tempo de entretenimento</label>
              <p className="font-medium text-gray-800">{dados.tempo_entretenimento || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Preparo adulto</label>
              <p className="font-medium text-gray-800">{dados.preparo_adulto || 'Não informado'}</p>
            </div>
          </div>
        </div>

        {/* Materiais */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Materiais Necessários</h3>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{dados.materiais_necessarios || 'Não informado'}</p>
          </div>
        </div>

        {/* Classificação */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Classificação</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 block mb-1">Nível de bagunça</label>
              <p className="font-medium text-gray-800">{dados.nivel_bagunca || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Custo</label>
              <p className="font-medium text-gray-800">{dados.custo || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Supervisão</label>
              <p className="font-medium text-gray-800">{dados.supervisao || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Tipo de atividade</label>
              <p className="font-medium text-gray-800">{dados.tipo_atividade || 'Não informado'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Detalhado (HTML ou Texto Simples) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500 inline-block">
          {dados.descricao_html ? 'Conteúdo Detalhado' : 'Descrição e Como Aplicar'}
        </h3>
        
        {dados.descricao_html ? (
          <div 
            className="prose max-w-none prose-blue html-content"
            dangerouslySetInnerHTML={{ __html: dados.descricao_html }} 
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-700 mb-2">Descrição</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{dados.descricao || 'Sem descrição disponível.'}</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-700 mb-2">Como Aplicar</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{dados.como_aplicar || 'Não informado.'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Comentários */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <CommentSection activityId={activity.id} comments={activity.comentarios || []} />
      </div>

      {/* Modal de Solicitação de Melhorias */}
      {activity && (
        <ImprovementRequestModal
          activityId={activity.id}
          activityName={dados.nome}
          isOpen={showImprovementModal}
          onClose={() => setShowImprovementModal(false)}
          onSuccess={handleImprovementSuccess}
        />
      )}
    </div>
  );
};

export default ActivityDetail;
