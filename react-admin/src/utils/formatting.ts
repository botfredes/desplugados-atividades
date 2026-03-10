/**
 * Utilitários de formatação para o Admin React
 */

/**
 * Converte custo_simples (0-3) para ícones de dólar
 * 0: Grátis (não mostra ícone)
 * 1: $ (Baixo)
 * 2: $$ (Médio) 
 * 3: $$$ (Alto)
 */
export function formatCustoSimples(custoSimples: number | undefined): string {
  if (custoSimples === undefined || custoSimples === null) return '';
  
  switch (custoSimples) {
    case 0: return 'Grátis';
    case 1: return '$';
    case 2: return '$$';
    case 3: return '$$$';
    default: return '';
  }
}

/**
 * Retorna a descrição textual do custo
 */
export function getCustoDescription(custoSimples: number | undefined): string {
  if (custoSimples === undefined || custoSimples === null) return 'Custo não informado';
  
  switch (custoSimples) {
    case 0: return 'Grátis (sem custo)';
    case 1: return 'Baixo (até R$15)';
    case 2: return 'Médio (R$15-30)';
    case 3: return 'Alto (R$30+)';
    default: return 'Custo não informado';
  }
}

/**
 * Retorna cor CSS para o custo
 */
export function getCustoColorClass(custoSimples: number | undefined): string {
  if (custoSimples === undefined || custoSimples === null) return 'text-gray-600';
  
  switch (custoSimples) {
    case 0: return 'text-green-600';
    case 1: return 'text-blue-600';
    case 2: return 'text-yellow-600';
    case 3: return 'text-red-600';
    default: return 'text-gray-600';
  }
}

/**
 * Formata faixa etária expandida com indicação visual
 */
export function formatFaixaEtaria(
  faixaOriginal: string | undefined, 
  faixaExpandida: string | undefined
): { display: string; tooltip?: string } {
  if (!faixaOriginal && !faixaExpandida) {
    return { display: 'Idade não informada' };
  }
  
  if (!faixaExpandida || faixaOriginal === faixaExpandida) {
    return { display: faixaOriginal || 'Idade não informada' };
  }
  
  return {
    display: `${faixaExpandida} ↗`,
    tooltip: `Faixa original: ${faixaOriginal}. Expandida para incluir adaptações.`
  };
}

/**
 * Extrai idade mínima e máxima de uma string de faixa etária
 */
export function parseIdadeRange(faixaEtaria: string): { min: number; max: number } | null {
  if (!faixaEtaria) return null;
  
  const match = faixaEtaria.match(/(\d+)[^\d]*(\d+)/);
  if (match) {
    const min = parseInt(match[1]);
    const max = parseInt(match[2]);
    return { min, max };
  }
  
  return null;
}