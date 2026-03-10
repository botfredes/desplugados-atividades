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
      case 'aprovada': return 'bg-success text-white';
      case 'pendente': return 'bg-warning text-gray-800';
      case 'em_revisao': return 'bg-primary text-white';
      case 'precisa_melhorias': return 'bg-error text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Carregando atividade...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-error/10 border border-error/20 rounded-lg p-6">
          <h2 className="text-xl font-bold text-error mb-2">Atividade não encontrada</h2>
          <p className="text-gray-600 mb-4">A atividade com ID {id} não foi encontrada.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
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
      {/* Cabeçalho */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center text-primary hover:text-primary-dark mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Voltar para lista
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{dados.nome}</h1>
            <div className="flex items-center mt-2 space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(activity.status_revisao)}`}>
                {activity.status_revisao}
              </span>
              <span className="text-gray-600">ID: {activity.id}</span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Botão Aprovar */}
              <button
                onClick={approveActivity}
                className="px-6 py-3 bg-success text-white font-medium rounded-lg hover:bg-success-dark focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2 flex items-center justify-center"
              >
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Aprovar
              </button>
              
              {/* Botão Solicitar Melhorias */}
              {!improvementRequested ? (
                <button
                  onClick={openImprovementModal}
                  className="px-6 py-3 bg-error text-white font-medium rounded-lg hover:bg-error-dark focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  Solicitar Melhorias
                </button>
              ) : (
                <div className="px-6 py-3 bg-error/10 text-error font-medium rounded-lg border border-error/20 flex items-center justify-center">
                  <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  Melhorias Solicitadas
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Informações principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Básicas</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Categoria</label>
              <p className="font-medium">{dados.categoria}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Faixa etária</label>
              <p className="font-medium">{dados.faixa_etaria}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Tempo de entretenimento</label>
              <p className="font-medium">{dados.tempo_entretenimento || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Preparo adulto</label>
              <p className="font-medium">{dados.preparo_adulto || 'Não informado'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Materiais</h3>
          <div className="prose max-w-none">
            <p className="text-gray-700">{dados.materiais_necessarios || 'Não informado'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Classificação</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Nível de bagunça</label>
              <p className="font-medium">{dados.nivel_bagunca || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Custo</label>
              <p className="font-medium">{dados.custo || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Supervisão</label>
              <p className="font-medium">{dados.supervisao || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Tipo de atividade</label>
              <p className="font-medium">{dados.tipo_atividade || 'Não informado'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Descrição e Como Aplicar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Descrição</h3>
          <div className="prose max-w-none">
            <p className="text-gray-700">{dados.descricao || 'Sem descrição disponível.'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Como Aplicar</h3>
          <div className="prose max-w-none">
            <p className="text-gray-700">{dados.como_aplicar || 'Não informado'}</p>
          </div>
        </div>
      </div>

      {/* Comentários */}
      <div className="bg-white p-6 rounded-lg shadow-md">
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
