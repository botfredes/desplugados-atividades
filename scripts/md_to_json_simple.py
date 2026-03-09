#!/usr/bin/env python3
"""
Converte arquivos Markdown com frontmatter para JSON
Parser simples de YAML sem dependências externas
"""

import json
import re
from pathlib import Path

def parse_yaml_frontmatter(content):
    """Parser simples de YAML frontmatter (apenas para estruturas básicas)"""
    if not content.startswith('---'):
        return {}, content
    
    parts = content.split('---', 2)
    if len(parts) < 3:
        return {}, content
    
    yaml_text = parts[1].strip()
    markdown_content = parts[2].strip()
    
    result = {}
    lines = yaml_text.split('\n')
    i = 0
    
    while i < len(lines):
        line = lines[i].rstrip()
        
        # Ignorar linhas vazias e comentários
        if not line or line.startswith('#'):
            i += 1
            continue
        
        # Verificar se é item de lista
        if line.lstrip().startswith('-'):
            # Encontrar a chave anterior
            if i > 0:
                # Procurar chave nos últimos resultados
                pass  # Implementação simplificada para listas
            i += 1
            continue
        
        # Encontrar chave: valor
        if ':' in line:
            key, rest = line.split(':', 1)
            key = key.strip()
            rest = rest.strip()
            
            # Valor vazio
            if not rest:
                result[key] = None
                i += 1
                continue
            
            # Valor entre aspas
            if rest.startswith('"') and rest.endswith('"'):
                result[key] = rest[1:-1].replace('\\"', '"')
            elif rest.startswith("'") and rest.endswith("'"):
                result[key] = rest[1:-1]
            # Valor booleano
            elif rest.lower() in ['true', 'false']:
                result[key] = rest.lower() == 'true'
            # Valor numérico
            elif re.match(r'^-?\d+$', rest):
                result[key] = int(rest)
            elif re.match(r'^-?\d+\.\d+$', rest):
                result[key] = float(rest)
            # Lista inline
            elif rest.startswith('[') and rest.endswith(']'):
                # Lista simples
                items = rest[1:-1].split(',')
                result[key] = [item.strip().strip('"\'') for item in items if item.strip()]
            else:
                # String simples
                result[key] = rest
            
            i += 1
        else:
            i += 1
    
    return result, markdown_content

def parse_markdown_sections(markdown_text):
    """Extrai seções do Markdown para campos estruturados"""
    # Inicializar com o markdown completo
    fields = {
        'descricao_markdown': markdown_text,
        'secoes': {}
    }
    
    # Padrão para seções (## Título)
    section_pattern = r'^##\s+(.+?)$\s*$(.*?)(?=^##\s|\Z)'
    
    for match in re.finditer(section_pattern, markdown_text, re.MULTILINE | re.DOTALL):
        title = match.group(1).strip()
        content = match.group(2).strip()
        
        # Mapear títulos para campos
        title_lower = title.lower()
        
        field_map = {
            'descrição': 'descricao',
            'descriçao': 'descricao',  # sem acento
            'objetivo': 'objetivo',
            'como aplicar': 'como_aplicar',
            'materiais necessários': 'materiais_necessarios',
            'materiais': 'materiais_necessarios',
            'por que é boa?': 'porque_e_boa',
            'por que é boa': 'porque_e_boa',
            'o que resolve': 'o_que_resolve',
            'resumo para pais': 'resumo_pais',
            'tags': 'tags_raw',
            'informações da atividade': 'info_tabela'
        }
        
        if title_lower in field_map:
            fields[field_map[title_lower]] = content
        else:
            fields['secoes'][title] = content
    
    return fields

def md_file_to_json(md_path):
    """Converte um arquivo Markdown para objeto JSON"""
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parsear frontmatter
    frontmatter, md_content = parse_yaml_frontmatter(content)
    
    # Parsear seções do markdown
    md_fields = parse_markdown_sections(md_content)
    
    # Combinar frontmatter com campos do markdown
    atividade = frontmatter.copy()
    
    # Adicionar campos específicos do markdown (exceto secoes)
    for key, value in md_fields.items():
        if key != 'secoes':
            atividade[key] = value
    
    # Extrair ID do nome do arquivo se não existir
    if 'id' not in atividade:
        match = re.search(r'^(\d+)-', md_path.name)
        if match:
            atividade['id'] = int(match.group(1))
    
    # Extrair nome do arquivo se não existir
    if 'nome' not in atividade:
        nome = md_path.stem
        if '-' in nome:
            nome = nome.split('-', 1)[1]
        atividade['nome'] = nome.replace('-', ' ').title()
    
    return atividade

def build_json_from_markdown(md_dir, output_json, individual_dir=None):
    """Constrói JSON final a partir de arquivos Markdown"""
    md_path = Path(md_dir)
    
    if not md_path.exists():
        print(f"❌ Diretório não encontrado: {md_dir}")
        return []
    
    # Encontrar todos os arquivos .md
    all_md_files = list(md_path.rglob("*.md"))
    
    # Filtrar: remover README.md e arquivos que não são atividades
    md_files = []
    for md_file in all_md_files:
        # Ignorar README.md
        if md_file.name.lower() == 'readme.md':
            continue
        
        # Ignorar arquivos em diretório raiz (se houver)
        if md_file.parent == md_path:
            # Arquivos na raiz devem começar com número (ID)
            if not re.match(r'^\d+', md_file.stem):
                continue
        
        md_files.append(md_file)
    
    if not md_files:
        print(f"❌ Nenhum arquivo .md de atividade encontrado em {md_dir}")
        return []
    
    print(f"📁 Encontrados {len(md_files)} arquivos Markdown")
    
    todas_atividades = []
    
    # Processar cada arquivo
    for i, md_file in enumerate(md_files, 1):
        try:
            atividade = md_file_to_json(md_file)
            todas_atividades.append(atividade)
            
            # Salvar JSON individual se solicitado
            if individual_dir:
                individual_path = Path(individual_dir)
                individual_path.mkdir(exist_ok=True, parents=True)
                
                id_atividade = atividade.get('id', i)
                nome_base = atividade.get('nome', 'atividade').lower()
                
                nome_arquivo = f"{id_atividade:03d}-{nome_base}"
                nome_arquivo = re.sub(r'[^\w\s-]', '', nome_arquivo)
                nome_arquivo = re.sub(r'[\s]+', '-', nome_arquivo)
                nome_arquivo = f"{nome_arquivo}.json"
                
                json_file = individual_path / nome_arquivo
                with open(json_file, 'w', encoding='utf-8') as f:
                    json.dump(atividade, f, ensure_ascii=False, indent=2)
                
                print(f"  [{i:3d}/{len(md_files)}] {md_file.name} → {nome_arquivo}")
            else:
                print(f"  [{i:3d}/{len(md_files)}] Processado: {md_file.name}")
                
        except Exception as e:
            print(f"❌ Erro ao processar {md_file}: {e}")
    
    # Ordenar por ID
    todas_atividades.sort(key=lambda x: x.get('id', 0))
    
    # Salvar JSON consolidado
    output_path = Path(output_json)
    output_path.parent.mkdir(exist_ok=True, parents=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(todas_atividades, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ JSON consolidado salvo: {output_path}")
    print(f"📊 Total de atividades: {len(todas_atividades)}")
    
    return todas_atividades

def main():
    """Função principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Constrói JSON a partir de Markdown')
    parser.add_argument('--md-dir', default='markdown-atividades',
                       help='Diretório com arquivos Markdown')
    parser.add_argument('--output', default='atividades/gerado/atividades.json',
                       help='Arquivo JSON de saída')
    parser.add_argument('--individual', action='store_true',
                       help='Gerar arquivos JSON individuais')
    parser.add_argument('--individual-dir', default='atividades/individuais-gerado',
                       help='Diretório para JSONs individuais')
    
    args = parser.parse_args()
    
    print("="*60)
    print("CONSTRUTOR JSON A PARTIR DE MARKDOWN")
    print("="*60)
    
    atividades = build_json_from_markdown(
        md_dir=args.md_dir,
        output_json=args.output,
        individual_dir=args.individual_dir if args.individual else None
    )
    
    if atividades:
        # Estatísticas simples
        categorias = {}
        for atividade in atividades:
            cat = atividade.get('categoria', 'Sem categoria')
            categorias[cat] = categorias.get(cat, 0) + 1
        
        print(f"\n📋 ESTATÍSTICAS:")
        print(f"   • Total: {len(atividades)} atividades")
        print(f"   • Categorias: {len(categorias)}")
        for cat, count in sorted(categorias.items()):
            print(f"     - {cat}: {count}")
        
        if args.individual:
            print(f"   • JSONs individuais em: {args.individual_dir}")

if __name__ == "__main__":
    main()