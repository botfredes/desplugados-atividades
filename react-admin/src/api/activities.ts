import supabase from '../lib/supabase';
import { Atividade } from '../types';

export interface Filters {
  status_revisao?: string;
  categoria?: string;
  faixa_etaria?: string;
  search?: string;
}

export const fetchActivities = async (page: number, filters: Filters = {}) => {
  const from = (page - 1) * 10;
  const to = from + 9;
  
  let query = supabase
    .from('atividades_v2')
    .select('*')
    .range(from, to);
  
  // Aplicar filtros
  if (filters.status_revisao) {
    if (filters.status_revisao === 'nao_aprovado') {
      // Não aprovado = pendente ou precisa_melhorias
      query = query.in('status_revisao', ['pendente', 'precisa_melhorias']);
    } else {
      query = query.eq('status_revisao', filters.status_revisao);
    }
  }
  
  if (filters.categoria) {
    query = query.eq('dados->>categoria', filters.categoria);
  }
  
  if (filters.faixa_etaria) {
    query = query.eq('dados->>faixa_etaria', filters.faixa_etaria);
  }
  
  if (filters.search) {
    query = query.ilike('dados->>nome', `%${filters.search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data as Atividade[];
};

export const fetchActivity = async (id: string) => {
  const { data, error } = await supabase
    .from('atividades_v2')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Atividade;
};

export const updateActivityStatus = async (id: string, status: string) => {
  const { error } = await supabase
    .from('atividades_v2')
    .update({ status_revisao: status })
    .eq('id', id);

  if (error) throw error;
};

export const addComment = async (id: string, comment: string, links: string[]) => {
  // Primeiro, buscar a atividade atual para obter os comentários existentes
  const { data: activity, error: fetchError } = await supabase
    .from('atividades_v2')
    .select('comentarios')
    .eq('id', id)
    .single();
  
  if (fetchError) throw fetchError;
  
  const existingComments = activity?.comentarios || [];
  const newComment = {
    id: Date.now().toString(), // ID temporário
    texto: comment,
    links: links,
    data: new Date().toISOString(),
    autor: 'Revisor', // Poderia ser dinâmico
  };
  
  const updatedComments = [...existingComments, newComment];
  
  const { error } = await supabase
    .from('atividades_v2')
    .update({ comentarios: updatedComments })
    .eq('id', id);

  if (error) throw error;
  return newComment;
};
