#!/usr/bin/env python3
import json
import csv
import os
from datetime import datetime

# Caminhos
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, '..', 'tabela_completude.csv')
JSON_OUTPUT = os.path.join(BASE_DIR, 'data', 'completude.json')
ATIVIDADES_JS_PATH = os.path.join(BASE_DIR, 'data', 'atividades.js')

# Ler tabela de completude CSV
completude_data = []
with open(CSV_PATH, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=',')
    for row in reader:
        # Processar problemas
        problemas = row['Problemas'].split(' | ') if row['Problemas'] else []
        
        # Determinar se é problemática (score < 80)
        try:
            score = float(row['Pontuação'])
            problematica = score < 80
        except:
            score = 0
            problematica = False
        
        completude_data.append({
            'id': int(row['ID']) if row['ID'].isdigit() else row['ID'],
            'nome': row['Nome'],
            'categoria': row['Categoria'],
            'pontuacao': score,
            'status': row['Status'],
            'faixa_etaria': row['Faixa Etária'],
            'tempo': row['Tempo'],
            'preparo': row['Preparo'],
            'bagunca': row['Bagunça'],
            'custo': row['Custo'],
            'supervisao': row['Supervisão'],
            'problemas': problemas,
            'qtd_problemas': int(row['Qtd Problemas']),
            'problematica': problematica
        })

# Calcular estatísticas
total = len(completude_data)
problematicas = sum(1 for a in completude_data if a['problematica'])
completas = sum(1 for a in completude_data if a['status'] == 'COMPLETA')
score_medio = sum(a['pontuacao'] for a in completude_data) / total if total > 0 else 0

# Criar objeto final
output = {
    'gerado_em': datetime.now().isoformat(),
    'estatisticas': {
        'total': total,
        'problematicas': problematicas,
        'completas': completas,
        'score_medio': round(score_medio, 2)
    },
    'atividades': completude_data
}

# Salvar JSON
with open(JSON_OUTPUT, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f'✅ Dados de completude convertidos para JSON: {JSON_OUTPUT}')
print(f'   - Total: {total} atividades')
print(f'   - Problemáticas: {problematicas}')
print(f'   - Completas: {completas}')
print(f'   - Score médio: {score_medio:.2f}')

# Também criar uma versão simplificada para atividades problemáticas
problematicas_simplificadas = [
    {
        'id': a['id'],
        'nome': a['nome'],
        'categoria': a['categoria'],
        'pontuacao': a['pontuacao'],
        'problemas': a['problemas'],
        'qtd_problemas': a['qtd_problemas'],
        'tempo': a['tempo'],
        'preparo': a['preparo'],
        'faixa_etaria': a['faixa_etaria']
    }
    for a in completude_data if a['problematica']
]

PROBLEMATICAS_OUTPUT = os.path.join(BASE_DIR, 'data', 'problematicas.json')
with open(PROBLEMATICAS_OUTPUT, 'w', encoding='utf-8') as f:
    json.dump({
        'gerado_em': datetime.now().isoformat(),
        'total': len(problematicas_simplificadas),
        'atividades': problematicas_simplificadas
    }, f, ensure_ascii=False, indent=2)

print(f'✅ Lista de atividades problemáticas salva: {PROBLEMATICAS_OUTPUT}')