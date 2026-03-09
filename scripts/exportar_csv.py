#!/usr/bin/env python3
"""
Exportador de atividades para CSV
Exporta todas as atividades para formato CSV para análise em planilhas
"""

import json
import csv
from pathlib import Path
import argparse

def carregar_atividades(caminho):
    """Carrega atividades de vários formatos"""
    caminho = Path(caminho)
    
    if caminho.is_file():
        with open(caminho, 'r', encoding='utf-8') as f:
            return json.load(f)
    elif caminho.is_dir():
        atividades = []
        for arquivo in caminho.glob("*.json"):
            with open(arquivo, 'r', encoding='utf-8') as f:
                atividades.append(json.load(f))
        return atividades
    
    return []

def determinar_campos(atividades):
    """Determina todos os campos disponíveis nas atividades"""
    campos = set()
    
    for atividade in atividades:
        campos.update(atividade.keys())
    
    # Ordenar campos por prioridade
    campos_prioritarios = [
        'id', 'nome', 'categoria', 'faixa_etaria',
        'tempo_entretenimento', 'preparo_adulto',
        'nivel_bagunca', 'quantidade_materiais',
        'materiais_necessarios', 'custo',
        'tipo_atividade', 'energia_crianca',
        'supervisao', 'local', 'habilidade_desenvolvida',
        'momento_ideal', 'clima', 'nivel_criatividade',
        'objetivo', 'descricao', 'como_aplicar',
        'precisa_antecipacao', 'porque_e_boa',
        'o_que_resolve', 'tags', 'resumo_pais'
    ]
    
    # Adicionar campos prioritários primeiro
    campos_ordenados = []
    for campo in campos_prioritarios:
        if campo in campos:
            campos_ordenados.append(campo)
            campos.remove(campo)
    
    # Adicionar campos restantes
    campos_ordenados.extend(sorted(campos))
    
    return campos_ordenados

def converter_valor(valor):
    """Converte valores para formato CSV"""
    if valor is None:
        return ''
    elif isinstance(valor, list):
        return '; '.join(str(v) for v in valor)
    elif isinstance(valor, dict):
        return json.dumps(valor, ensure_ascii=False)
    else:
        return str(valor)

def exportar_csv(atividades, caminho_saida, campos=None):
    """Exporta atividades para CSV"""
    if not atividades:
        print("Nenhuma atividade para exportar!")
        return
    
    # Determinar campos se não especificados
    if not campos:
        campos = determinar_campos(atividades)
    
    print(f"Exportando {len(atividades)} atividades para CSV...")
    print(f"Campos exportados: {len(campos)}")
    
    with open(caminho_saida, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        
        # Escrever cabeçalho
        writer.writerow(campos)
        
        # Escrever dados
        for i, atividade in enumerate(atividades, 1):
            linha = []
            for campo in campos:
                valor = atividade.get(campo, '')
                linha.append(converter_valor(valor))
            
            writer.writerow(linha)
            
            # Progresso a cada 10 atividades
            if i % 10 == 0:
                print(f"  Processadas: {i}/{len(atividades)}")
    
    print(f"✅ CSV exportado com sucesso: {caminho_saida}")
    print(f"   Total de linhas: {len(atividades) + 1} (cabeçalho + dados)")

def exportar_csv_otimizado(atividades, caminho_saida):
    """Exporta CSV com campos otimizados para análise"""
    # Campos selecionados para análise
    campos_analise = [
        'id', 'nome', 'categoria', 'faixa_etaria',
        'tempo_entretenimento', 'preparo_adulto',
        'compatibilidade_tempos',  # Campo calculado
        'nivel_bagunca', 'quantidade_materiais',
        'materiais_necessarios', 'custo',
        'supervisao', 'local', 'habilidade_desenvolvida',
        'tags', 'status_validacao'  # Campos adicionais
    ]
    
    # Calcular campos adicionais
    atividades_com_campos = []
    for atividade in atividades:
        atividade_completa = atividade.copy()
        
        # Calcular compatibilidade de tempos
        def extrair_minutos(tempo_str):
            if not tempo_str:
                return 0
            tempo_str = str(tempo_str).lower()
            tempo_str = tempo_str.replace('min', '').replace('minutos', '').strip()
            if '-' in tempo_str:
                partes = tempo_str.split('-')
                try:
                    return (int(partes[0].strip()) + int(partes[1].strip())) / 2
                except:
                    return 0
            try:
                return int(tempo_str.strip())
            except:
                return 0
        
        prep_min = extrair_minutos(atividade.get('preparo_adulto', ''))
        ent_min = extrair_minutos(atividade.get('tempo_entretenimento', ''))
        
        if prep_min > 0 and ent_min > 0:
            compatibilidade = 'OK' if prep_min <= ent_min * 0.5 else 'PREPARO LONGO'
        else:
            compatibilidade = 'INDETERMINADO'
        
        atividade_completa['compatibilidade_tempos'] = compatibilidade
        
        # Status de validação simplificado
        problemas = []
        if not atividade.get('materiais_necessarios') or str(atividade.get('materiais_necessarios', '')).lower() in ['nenhum', 'nada']:
            problemas.append('MATERIAIS')
        if len(atividade.get('descricao', '')) < 20:
            problemas.append('DESCRIÇÃO')
        if len(atividade.get('como_aplicar', '')) < 30:
            problemas.append('INSTRUÇÕES')
        
        if problemas:
            atividade_completa['status_validacao'] = '; '.join(problemas)
        else:
            atividade_completa['status_validacao'] = 'OK'
        
        atividades_com_campos.append(atividade_completa)
    
    # Exportar
    exportar_csv(atividades_com_campos, caminho_saida, campos_analise)

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(description='Exportador de atividades para CSV')
    parser.add_argument('--entrada', default='atividades/resumo/atividades.json',
                       help='Caminho para arquivo JSON ou diretório de atividades')
    parser.add_argument('--saida', default='atividades_analise.csv',
                       help='Caminho para arquivo CSV de saída')
    parser.add_argument('--tipo', default='completo',
                       choices=['completo', 'analise'],
                       help='Tipo de exportação: completo (todos campos) ou analise (campos selecionados)')
    parser.add_argument('--campos', help='Lista de campos específicos (separados por vírgula)')
    
    args = parser.parse_args()
    
    # Construir caminhos
    base_path = Path(__file__).parent.parent
    caminho_entrada = base_path / args.entrada
    caminho_saida = base_path / args.saida
    
    print("="*60)
    print("EXPORTADOR DE ATIVIDADES PARA CSV")
    print("="*60)
    
    # Carregar atividades
    print(f"\nCarregando atividades de: {caminho_entrada}")
    atividades = carregar_atividades(caminho_entrada)
    
    if not atividades:
        print("❌ Nenhuma atividade encontrada!")
        return
    
    print(f"Atividades carregadas: {len(atividades)}")
    
    # Exportar
    if args.tipo == 'analise':
        print("\nExportando CSV otimizado para análise...")
        exportar_csv_otimizado(atividades, caminho_saida)
    else:
        print("\nExportando CSV completo...")
        if args.campos:
            campos = [c.strip() for c in args.campos.split(',')]
            exportar_csv(atividades, caminho_saida, campos)
        else:
            exportar_csv(atividades, caminho_saida)
    
    # Mostrar estatísticas
    print(f"\n📊 ESTATÍSTICAS DA EXPORTAÇÃO:")
    print(f"   • Total de atividades: {len(atividades)}")
    print(f"   • Arquivo gerado: {caminho_saida}")
    print(f"   • Tamanho aproximado: {Path(caminho_saida).stat().st_size if Path(caminho_saida).exists() else 'N/A'} bytes")
    
    # Sugerir próximos passos
    print(f"\n💡 SUGESTÕES:")
    print(f"   • Abra o CSV no Excel, Google Sheets ou LibreOffice Calc")
    print(f"   • Use filtros para analisar por categoria, faixa etária, etc.")
    print(f"   • Classifique por 'compatibilidade_tempos' para identificar problemas")

if __name__ == "__main__":
    main()