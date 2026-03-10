import React, { useState } from 'react';
import { addComment } from '../api/activities';

interface ImprovementRequestModalProps {
  activityId: string;
  activityName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImprovementRequestModal: React.FC<ImprovementRequestModalProps> = ({
  activityId,
  activityName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [description, setDescription] = useState('');
  const [links, setLinks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Por favor, descreva o que precisa ser melhorado.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const linksArray = links
        .split('\n')
        .map(link => link.trim())
        .filter(link => link !== '' && (link.startsWith('http://') || link.startsWith('https://')));

      // Adicionar comentário especial
      await addComment(activityId, description, linksArray);

      // Aqui você poderia enviar uma notificação para o assistente
      // Por enquanto, apenas fechamos o modal e chamamos onSuccess
      onSuccess();
      onClose();
      
      // Limpar formulário
      setDescription('');
      setLinks('');
      
      // Mostrar confirmação
      alert('✅ Solicitação de melhorias enviada! Vou trabalhar nisso agora.');
      
    } catch (err) {
      console.error('Erro ao enviar solicitação:', err);
      setError('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabeçalho */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Solicitar Melhorias
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {activityName}
            </p>
          </div>
          
          {/* Conteúdo */}
          <div className="px-6 py-4">
            {error && (
              <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-md">
                <p className="text-error text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  O que precisa ser melhorado? *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva detalhadamente o que deve ser corrigido, adicionado ou melhorado..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={4}
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Links de referência (opcional)
                </label>
                <textarea
                  value={links}
                  onChange={(e) => setLinks(e.target.value)}
                  placeholder="Cole links úteis para referência, um por linha. Exemplo:&#10;https://exemplo.com/tutorial&#10;https://pinterest.com/ideia"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                  rows={3}
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Links devem começar com http:// ou https://
                </p>
              </div>
            </div>
          </div>
          
          {/* Rodapé */}
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                'Enviar para Fila'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovementRequestModal;