import React, { useState } from 'react';
import { addComment } from '../api/activities';
import { Comment as CommentType } from '../types';

interface CommentSectionProps {
  activityId: string;
  comments: CommentType[];
}

const CommentSection: React.FC<CommentSectionProps> = ({ activityId, comments }) => {
  const [newComment, setNewComment] = useState('');
  const [newLinks, setNewLinks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const submitComment = async () => {
    if (!newComment.trim()) {
      alert('Por favor, escreva um comentário antes de enviar.');
      return;
    }

    setSubmitting(true);
    try {
      const linksArray = newLinks.split('\n')
        .map(link => link.trim())
        .filter(link => link !== '' && (link.startsWith('http://') || link.startsWith('https://')));
      
      await addComment(activityId, newComment, linksArray);
      
      // Em uma implementação real, atualizaríamos os comentários via prop callback ou estado global
      // Por enquanto, recarregamos a página para ver o novo comentário
      window.location.reload();
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      alert('❌ Erro ao adicionar comentário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Comentários e Sugestões</h2>
      
      {/* Lista de comentários existentes */}
      <div className="space-y-6 mb-8">
        {comments.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
            <p className="text-gray-500">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold mr-3">
                    {comment.autor?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">{comment.autor || 'Usuário'}</span>
                    <span className="text-gray-500 text-sm ml-2">{formatDate(comment.data)}</span>
                  </div>
                </div>
              </div>
              
              <div className="ml-11">
                <p className="text-gray-700 whitespace-pre-wrap">{comment.texto}</p>
                
                {comment.links && comment.links.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-600 mb-2 block">Links de referência:</span>
                    <div className="space-y-1">
                      {comment.links.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-primary hover:text-primary-dark text-sm truncate"
                        >
                          <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                          </svg>
                          {link.replace(/^https?:\/\//, '').substring(0, 50)}
                          {link.length > 50 ? '...' : ''}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Formulário para novo comentário */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Adicionar Comentário</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentário ou sugestão de melhoria *
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Descreva o que pode ser melhorado, sugestões, observações..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={4}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Links de referência (opcional)
            </label>
            <textarea
              value={newLinks}
              onChange={(e) => setNewLinks(e.target.value)}
              placeholder="Cole links úteis, um por linha. Exemplo:&#10;https://exemplo.com/tutorial&#10;https://pinterest.com/ideia"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">Links devem começar com http:// ou https://</p>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={submitComment}
              disabled={submitting || !newComment.trim()}
              className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <>
                  <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                  Enviar Comentário
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
