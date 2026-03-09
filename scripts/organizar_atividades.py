#!/usr/bin/env python3
"""
Organizador de atividades do Desplugados
Distribui as atividades em uma estrutura de pastas organizada
"""

import json
import os
import re
import csv
from pathlib import Path

def sanitizar_nome_arquivo(nome):
    """Converte nome da atividade para nome de arquivo amigável"""
    # Remove caracteres especiais, converte para minúsculas
    nome = nome.lower()
    nome = re.sub(r'[^\w\s-]', '', nome)  # Remove caracteres não alfanuméricos
    nome = re.sub(r'[-\s]+', '-', nome)   # Substitui espaços e múltiplos hífens
    return nome.strip('-')

def criar_estrutura_pastas(base_path):
    """Cria a estrutura de pastas necessária"""
    diretorios = [
        base_path / "atividades" / "por-categoria",
        base_path / "atividades" / "individuais",
        base_path / "atividades" / "resumo",
        base_path / "scripts",
        base_path / "templates",
        base_path / "recursos",
        base_path / "docs"
    ]
    
    for diretorio in diretorios:
        diretorio.mkdir(parents=True, exist_ok=True)
        print(f"Criado: {diretorio}")

def carregar_atividades_enriquecidas():
    """Carrega o arquivo de atividades enriquecidas"""
    # Caminho relativo ao script
    script_dir = Path(__file__).parent.parent
    arquivo_original = script_dir.parent / "atividades_enriquecidas.json"
    
    if not arquivo_original.exists():
        # Tentar caminho alternativo
        arquivo_original = Path("/home/node/.openclaw/workspace/atividades_enriquecidas.json")
    
    with open(arquivo_original, 'r', encoding='utf-8') as f:
        return json.load(f)

def organizar_por_categoria(atividades, base_path):
    """Organiza atividades em pastas por categoria"""
    print("\nOrganizando por categoria...")
    
    categorias = set()
    atividades_por_categoria = {}
    
    # Agrupar por categoria
    for atividade in atividades:
        categoria = atividade.get('categoria', 'Sem Categoria')
        categorias.add(categoria)
        
        if categoria not in atividades_por_categoria:
            atividades_por_categoria[categoria] = []
        
        atividades_por_categoria[categoria].append(atividade)
    
    # Criar pastas e salvar arquivos
    for categoria, lista_atividades in atividades_por_categoria.items():
        # Criar nome de pasta seguro
        nome_pasta = sanitizar_nome_arquivo(categoria)
        pasta_categoria = base_path / "atividades" / "por-categoria" / nome_pasta
        pasta_categoria.mkdir(parents=True, exist_ok=True)
        
        # Salvar arquivo JSON da categoria
        arquivo_categoria = pasta_categoria / "atividades.json"
        with open(arquivo_categoria, 'w', encoding='utf-8') as f:
            json.dump(lista_atividades, f, ensure_ascii=False, indent=2)
        
        # Salvar cada atividade individualmente na categoria
        for atividade in lista_atividades:
            atividade_id = atividade.get('id', 0)
            nome_atividade = atividade.get('nome', 'sem-nome')
            nome_arquivo = f"{atividade_id:03d}-{sanitizar_nome_arquivo(nome_atividade)}.json"
            arquivo_atividade = pasta_categoria / nome_arquivo
            
            with open(arquivo_atividade, 'w', encoding='utf-8') as f:
                json.dump(atividade, f, ensure_ascii=False, indent=2)
    
    print(f"Categorias criadas: {len(categorias)}")
    return categorias, atividades_por_categoria

def salvar_atividades_individuais(atividades, base_path):
    """Salva cada atividade em um arquivo JSON individual"""
    print("\nSalvando atividades individuais...")
    
    pasta_individuais = base_path / "atividades" / "individuais"
    contador = 0
    
    for atividade in atividades:
        atividade_id = atividade.get('id', 0)
        nome_atividade = atividade.get('nome', 'sem-nome')
        
        # Criar nome de arquivo
        nome_arquivo = f"{atividade_id:03d}-{sanitizar_nome_arquivo(nome_atividade)}.json"
        arquivo_atividade = pasta_individuais / nome_arquivo
        
        with open(arquivo_atividade, 'w', encoding='utf-8') as f:
            json.dump(atividade, f, ensure_ascii=False, indent=2)
        
        contador += 1
    
    print(f"Atividades individuais salvas: {contador}")

def salvar_arquivos_resumo(atividades, categorias, base_path):
    """Salva arquivos consolidados e estatísticas"""
    print("\nCriando arquivos de resumo...")
    
    pasta_resumo = base_path / "atividades" / "resumo"
    
    # 1. JSON consolidado
    arquivo_consolidado = pasta_resumo / "atividades.json"
    with open(arquivo_consolidado, 'w', encoding='utf-8') as f:
        json.dump(atividades, f, ensure_ascii=False, indent=2)
    
    # 2. CSV para análise
    arquivo_csv = pasta_resumo / "atividades.csv"
    criar_csv(atividades, arquivo_csv)
    
    # 3. Estatísticas
    arquivo_stats = pasta_resumo / "estatisticas.json"
    criar_estatisticas(atividades, categorias, arquivo_stats)
    
    print(f"Arquivos de resumo criados em: {pasta_resumo}")

def criar_csv(atividades, caminho_csv):
    """Cria arquivo CSV com os dados principais"""
    if not atividades:
        return
    
    # Definir campos do CSV
    campos = [
        'id', 'nome', 'categoria', 'faixa_etaria',
        'tempo_entretenimento', 'preparo_adulto',
        'nivel_bagunca', 'quantidade_materiais',
        'custo', 'supervisao', 'local',
        'habilidade_desenvolvida', 'tags'
    ]
    
    with open(caminho_csv, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=campos)
        writer.writeheader()
        
        for atividade in atividades:
            linha = {}
            for campo in campos:
                valor = atividade.get(campo, '')
                # Converter listas para string
                if isinstance(valor, list):
                    valor = ';'.join(str(v) for v in valor)
                linha[campo] = valor
            writer.writerow(linha)

def criar_estatisticas(atividades, categorias, caminho_json):
    """Cria arquivo de estatísticas"""
    estatisticas = {
        'total_atividades': len(atividades),
        'categorias': {
            'total': len(categorias),
            'lista': sorted(list(categorias))
        },
        'faixa_etaria': {},
        'tempo_preparo': {},
        'nivel_bagunca': {},
        'custo': {}
    }
    
    # Contar por faixa etária
    for atividade in atividades:
        faixa = atividade.get('faixa_etaria', 'Não informado')
        estatisticas['faixa_etaria'][faixa] = estatisticas['faixa_etaria'].get(faixa, 0) + 1
    
    # Contar por tempo de preparo
    for atividade in atividades:
        preparo = atividade.get('preparo_adulto', 'Não informado')
        estatisticas['tempo_preparo'][preparo] = estatisticas['tempo_preparo'].get(preparo, 0) + 1
    
    # Contar por nível de bagunça
    for atividade in atividades:
        bagunca = atividade.get('nivel_bagunca', 'Não informado')
        estatisticas['nivel_bagunca'][bagunca] = estatisticas['nivel_bagunca'].get(bagunca, 0) + 1
    
    # Contar por custo
    for atividade in atividades:
        custo = atividade.get('custo', 'Não informado')
        estatisticas['custo'][custo] = estatisticas['custo'].get(custo, 0) + 1
    
    with open(caminho_json, 'w', encoding='utf-8') as f:
        json.dump(estatisticas, f, ensure_ascii=False, indent=2)

def criar_documentacao(base_path):
    """Cria documentação básica"""
    print("\nCriando documentação...")
    
    docs_path = base_path / "docs"
    
    # Guia de revisão
    guia_revisao = docs_path / "guia-revisao.md"
    conteudo = """# Guia de Revisão de Atividades

## O que verificar em cada atividade

### 1. Informações Básicas
- [ ] **Nome** da atividade é claro e descritivo
- [ ] **Categoria** apropriada
- [ ] **Faixa etária** condiz com a complexidade

### 2. Tempos
- [ ] **Tempo de preparo** é realista (5-30 min)
- [ ] **Tempo de entretenimento** condiz com a atividade
- [ ] Preparo não excede 50% do tempo total

### 3. Materiais
- [ ] **Lista de materiais** é específica
- [ ] **Quantidade** declarada condiz com a lista
- [ ] **Custo** está correto (Baixo/Médio/Alto)
- [ ] Materiais são acessíveis em casa ou fáceis de obter

### 4. Conteúdo
- [ ] **Descrição** é clara e atraente
- [ ] **Como aplicar** tem instruções passo a passo
- [ ] **Objetivo** educacional está claro
- [ ] **Habilidade desenvolvida** é apropriada

### 5. Recursos Extras
- [ ] **Tags** são relevantes e úteis para busca
- [ ] **Recursos online** sugeridos (se houver)
- [ ] **Variações** para diferentes idades/contextos

## Prioridade de Revisão

### Alta Prioridade (verificar primeiro)
1. Atividades com tempo de preparo "Nenhum" ou muito longo
2. Atividades com materiais "Nenhum" ou muito genéricos
3. Atividades com inconsistências entre campos

### Média Prioridade
4. Atividades da mesma categoria para consistência
5. Atividades com a mesma faixa etária

### Baixa Prioridade
6. Revisão de tags e categorização
7. Melhoria de descrições e instruções
"""
    with open(guia_revisao, 'w', encoding='utf-8') as f:
        f.write(conteudo)
    
    # Critérios de qualidade
    criterios = docs_path / "criterios-qualidade.md"
    conteudo = """# Critérios de Qualidade das Atividades

## Atividade "Completa" ✅

Uma atividade é considerada **COMPLETA** quando atende a todos os critérios:

### 1. Informações Básicas (Obrigatório)
- [ ] Nome claro e descritivo
- [ ] Categoria apropriada
- [ ] Faixa etária específica (ex: "3-4 anos", não "3-8 anos" genérico)

### 2. Tempos Realistas (Obrigatório)
- [ ] Tempo de preparo: 5-30 minutos (exceto atividades especiais)
- [ ] Tempo de entretenimento: 10-60 minutos
- [ ] Preparo ≤ 30% do tempo total de entretenimento

### 3. Materiais Específicos (Obrigatório)
- [ ] Lista de materiais concreta (não "nenhum" ou "qualquer")
- [ ] Quantidade declarada condiz com a lista
- [ ] Custo condiz com os materiais listados

### 4. Conteúdo de Qualidade (Desejável)
- [ ] Descrição clara (mínimo 50 caracteres)
- [ ] Instruções passo a passo (mínimo 100 caracteres)
- [ ] Objetivo educacional claro
- [ ] Habilidade desenvolvida específica

### 5. Recursos Complementares (Opcional)
- [ ] Tags relevantes (3-5 tags)
- [ ] Recursos online sugeridos
- [ ] Variações para adaptação
- [ ] Dicas de segurança

## Pontuação de Qualidade

Cada atividade recebe uma pontuação de 0-100:

- **90-100:** Excelente - Pronta para uso
- **70-89:** Boa - Pequenas melhorias necessárias
- **50-69:** Regular - Revisão importante necessária
- **0-49:** Insuficiente - Requer reescrita/adaptação

## Checklist de Revisão Rápida

Para revisão rápida, verifique apenas:

1. **Tempos compatíveis?** ✅
2. **Materiais específicos?** ✅
3. **Instruções claras?** ✅
4. **Faixa etária apropriada?** ✅

Se todas 4 respostas forem SIM, a atividade está em bom estado.
"""
    with open(criterios, 'w', encoding='utf-8') as f:
        f.write(conteudo)

def main():
    """Função principal"""
    print("="*60)
    print("ORGANIZADOR DE ATIVIDADES DESPLUGADOS")
    print("="*60)
    
    # Definir caminhos
    script_dir = Path(__file__).parent
    repo_base = script_dir.parent
    
    print(f"Diretório base: {repo_base}")
    
    # 1. Criar estrutura de pastas
    criar_estrutura_pastas(repo_base)
    
    # 2. Carregar atividades
    print("\nCarregando atividades enriquecidas...")
    atividades = carregar_atividades_enriquecidas()
    print(f"Atividades carregadas: {len(atividades)}")
    
    # 3. Organizar por categoria
    categorias, atividades_por_categoria = organizar_por_categoria(atividades, repo_base)
    
    # 4. Salvar atividades individuais
    salvar_atividades_individuais(atividades, repo_base)
    
    # 5. Criar arquivos de resumo
    salvar_arquivos_resumo(atividades, categorias, repo_base)
    
    # 6. Criar documentação
    criar_documentacao(repo_base)
    
    print("\n" + "="*60)
    print("ORGANIZAÇÃO CONCLUÍDA COM SUCESSO!")
    print("="*60)
    print(f"\nEstrutura criada em: {repo_base}")
    print("\nResumo:")
    print(f"  • Atividades processadas: {len(atividades)}")
    print(f"  • Categorias: {len(categorias)}")
    print(f"  • Arquivos individuais: {len(atividades)}")
    print(f"  • Pastas por categoria: {len(categorias)}")
    print("\nPronto para revisão!")

if __name__ == "__main__":
    main()