#!/usr/bin/env python3
"""
Gera dados otimizados para o site a partir das atividades JSON
Cria um arquivo JavaScript que pode ser carregado diretamente
"""

import json
import re
from pathlib import Path

def simplify_for_site(atividade):
    """Simplifica os dados da atividade para uso no site"""
    # Icones por categoria
    category_icons = {
        'Artes Experimentais e Sensoriais': 'fas fa-palette',
        'Atividades Sensoriais': 'fas fa-hand-holding-heart',
        'Atividades de Conexão': 'fas fa-users',
        'Ciências e Experimentos': 'fas fa-flask',
        'Construção e Engenharia': 'fas fa-tools',
        'Culinária e Gastronomia': 'fas fa-utensils',
        'Desafios e Missões': 'fas fa-flag-checkered',
        'Dramatização e Faz de Conta': 'fas fa-theater-masks',
        'Jogos de Tabuleiro e Cartas': 'fas fa-chess-board',
        'Leitura e Narrativa': 'fas fa-book-open',
        'Lógica e Matemática': 'fas fa-calculator',
        'Movimento e Coordenação': 'fas fa-running',
        'Música e Ritmo': 'fas fa-music',
        'Natureza e Exploração': 'fas fa-leaf',
        'Projetos Criativos': 'fas fa-lightbulb'
    }
    
    # Determinar dificuldade baseada no tipo de atividade
    difficulty_map = {
        'Simples': 'easy',
        'Moderada': 'medium',
        'Ativa': 'medium',
        'Muito Ativa': 'hard',
        'Complexa': 'hard'
    }
    
    # Extrair tempo médio em minutos
    tempo_str = atividade.get('tempo_entretenimento', '')
    tempo_min = 0
    if tempo_str:
        # Extrair números (ex: "20-40 min" -> média 30)
        nums = re.findall(r'\d+', tempo_str)
        if len(nums) == 2:
            tempo_min = (int(nums[0]) + int(nums[1])) // 2
        elif len(nums) == 1:
            tempo_min = int(nums[0])
    
    # Determinar categoria de tempo
    if tempo_min <= 20:
        tempo_categoria = 'short'
    elif tempo_min <= 40:
        tempo_categoria = 'medium'
    else:
        tempo_categoria = 'long'
    
    # Extrair idade mínima e máxima
    faixa = atividade.get('faixa_etaria', '')
    idade_min = 3
    idade_max = 8
    if faixa:
        nums = re.findall(r'\d+', faixa)
        if len(nums) >= 2:
            idade_min = int(nums[0])
            idade_max = int(nums[1])
    
    # Criar dados simplificados
    return {
        'id': atividade.get('id', 0),
        'nome': atividade.get('nome', 'Atividade sem nome'),
        'categoria': atividade.get('categoria', 'Sem categoria'),
        'categoria_slug': re.sub(r'[^\w\s-]', '', atividade.get('categoria', '').lower()).replace(' ', '-'),
        'categoria_icon': category_icons.get(atividade.get('categoria', ''), 'fas fa-star'),
        'faixa_etaria': faixa,
        'idade_min': idade_min,
        'idade_max': idade_max,
        'tempo_entretenimento': tempo_str,
        'tempo_min': tempo_min,
        'tempo_categoria': tempo_categoria,
        'nivel_bagunca': atividade.get('nivel_bagunca', 'Média'),
        'custo': atividade.get('custo', 'Baixo'),
        'supervisao': atividade.get('supervisao', 'Moderada'),
        'local': atividade.get('local', 'Qualquer'),
        'momento_ideal': atividade.get('momento_ideal', 'Qualquer hora'),
        'clima': atividade.get('clima', 'Qualquer'),
        'tipo_atividade': atividade.get('tipo_atividade', 'Moderada'),
        'dificuldade': difficulty_map.get(atividade.get('tipo_atividade', 'Moderada'), 'medium'),
        'descricao': atividade.get('descricao', ''),
        'descricao_curta': (atividade.get('descricao', '')[:100] + '...') if len(atividade.get('descricao', '')) > 100 else atividade.get('descricao', ''),
        'objetivo': atividade.get('objetivo', ''),
        'como_aplicar': atividade.get('como_aplicar', ''),
        'materiais_necessarios': atividade.get('materiais_necessarios', ''),
        'tags': atividade.get('tags', [])[:5],  # Limitar a 5 tags
        'imagem_url': atividade.get('imagem_url', ''),
        'resumo_pais': atividade.get('resumo_pais', '')
    }

def main():
    """Função principal"""
    print("="*60)
    print("GERADOR DE DADOS PARA O SITE DESPLUGADOS")
    print("="*60)
    
    # Caminhos
    base_dir = Path(__file__).parent.parent
    input_file = base_dir / 'atividades' / 'resumo' / 'atividades.json'
    output_file = base_dir / 'site' / 'data' / 'atividades.js'
    
    print(f"Lendo dados de: {input_file}")
    
    # Carregar atividades
    with open(input_file, 'r', encoding='utf-8') as f:
        atividades = json.load(f)
    
    print(f"Encontradas {len(atividades)} atividades")
    
    # Processar cada atividade
    atividades_site = []
    categorias = {}
    
    for atividade in atividades:
        atividade_simplificada = simplify_for_site(atividade)
        atividades_site.append(atividade_simplificada)
        
        # Contar categorias
        cat = atividade_simplificada['categoria']
        if cat not in categorias:
            categorias[cat] = {
                'nome': cat,
                'slug': atividade_simplificada['categoria_slug'],
                'icon': atividade_simplificada['categoria_icon'],
                'count': 0
            }
        categorias[cat]['count'] += 1
    
    # Ordenar atividades por ID
    atividades_site.sort(key=lambda x: x['id'])
    
    # Converter para lista de categorias
    categorias_list = list(categorias.values())
    categorias_list.sort(key=lambda x: x['nome'])
    
    # Criar objeto final
    data = {
        'atividades': atividades_site,
        'categorias': categorias_list,
        'estatisticas': {
            'total': len(atividades_site),
            'categorias': len(categorias_list),
            'faixa_etaria_min': min(a['idade_min'] for a in atividades_site),
            'faixa_etaria_max': max(a['idade_max'] for a in atividades_site)
        }
    }
    
    # Escrever arquivo JavaScript
    print(f"Gerando arquivo: {output_file}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('// Dados das atividades Desplugados - Gerado automaticamente\n')
        f.write('const atividadesData = ')
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write(';\n')
    
    print(f"✅ Dados gerados com sucesso!")
    print(f"   • Atividades: {len(atividades_site)}")
    print(f"   • Categorias: {len(categorias_list)}")
    print(f"   • Arquivo: {output_file}")
    
    # Criar também um JSON para referência
    json_output = base_dir / 'site' / 'data' / 'atividades.json'
    with open(json_output, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"   • JSON de referência: {json_output}")

if __name__ == "__main__":
    main()