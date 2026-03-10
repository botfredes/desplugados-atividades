export type Comment = {
  id: string;
  texto: string;
  links: string[];
  data: string;
  autor: string;
};

export type Atividade = {
  id: string;
  dados: {
    nome: string;
    categoria: string;
    faixa_etaria: string;
    tempo_entretenimento?: string;
    preparo_adulto?: string;
    materiais_necessarios?: string;
    nivel_bagunca?: string;
    custo?: string;
    supervisao?: string;
    tipo_atividade?: string;
    descricao?: string;
    como_aplicar?: string;
    [key: string]: any;
  };
  status_revisao: string;
  comentarios: Comment[];
  historico: Array<any>;
};
