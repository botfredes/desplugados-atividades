#!/usr/bin/env python3
"""
Conversor simples de JSON para Markdown com frontmatter YAML
Sem dependências externas além da biblioteca padrão
"""

import json
import re
from pathlib import Path

def dict_to_yaml(data, indent=0):
    """Converte dicionário para YAML básico (sem dependências externas)"""
    lines = []
    indent_str = ' ' * indent
    
    for key, value in data.items():
        if value is None:
            lines.append(f"{indent_str}{key}: null")
        elif isinstance(value, bool):
            lines.append(f"{indent_str}{key}: {str(value).lower()}")
        elif isinstance(value, (int, float)):
            lines.append(f"{indent_str}{key}: {value}")
        elif isinstance(value, str):
            # Escapar aspas duplas na string
            escaped_value = value.replace('"', '\\"')
            # Se tem caracteres especiais, usar aspas
            if ':' in escaped_value or '"' in escaped_value or "'" in escaped_value or value.strip() != value:
                lines.append(f'{indent_str}{key}: "{escaped_value}"')
            else:
                lines.append(f"{indent_str}{key}: {value}")
        elif isinstance(value, list):
            if value and isinstance(value[0], dict):
                # Lista de dicionários - tratamento especial
                lines.append(f"{indent_str}{key}:")
                for item in value:
                    lines.append(f"{indent_str}  -")
                    # Recursão para dicionários dentro da lista
                    sub_lines = dict_to_yaml(item, indent + 4).split('\n')
                    lines.extend(sub_lines)
            else:
                lines.append(f"{indent_str}{key}:")
                for item in value:
                    if isinstance(item, str):
                        escaped_item = item.replace('"', '\\"')
                        if ':' in escaped_item or '"' in escaped_item or "'" in escaped_item:
                            lines.append(f'{indent_str}  - "{escaped_item}"')
                        else:
                            lines.append(f"{indent_str}  - {item}")
                    else:
                        lines.append(f"{indent_str}  - {item}")
        elif isinstance(value, dict):
            lines.append(f"{indent_str}{key}:")
            sub_lines = dict_to_yaml(value, indent + 2).split('\n')
            lines.extend(sub_lines)
        else:
            lines.append(f"{indent_str}{key}: {value}")
    
    return '\n'.join(lines)

def build_markdown_content(atividade):
    """Constrói conteúdo Markdown organizado"""
    sections = []
    
    # Título (h1) baseado no nome
    nome = atividade.get('nome', 'Atividade sem nome')
    sections.append(f"# {nome}\n")
    
    # Descrição breve
    descricao = atividade.get('descricao', '')
    if descricao:
        sections.append(f"## Descrição\n\n{descricao}\n")
    
    # Objetivo
    objetivo = atividade.get('objetivo', '')
    if objetivo:
        sections.append(f"## Objetivo\n\n{objetivo}\n")
    
    # Como aplicar (instruções)
    como_aplicar = atividade.get('como_aplicar', '')
    if como_aplicar:
        sections.append(f"## Como Aplicar\n\n{como_aplicar}\n")
    
    # Materiais necessários
    materiais = atividade.get('materiais_necessarios', '')
    if materiais:
        sections.append(f"## Materiais Necessários\n\n{materiais}\n")
    
    # Por que é boa
    porque_boa = atividade.get('porque_e_boa', '')
    if porque_boa:
        sections.append(f"## Por que é Boa?\n\n{porque_boa}\n")
    
    # O que resolve
    o_que_resolve = atividade.get('o_que_resolve', '')
    if o_que_resolve:
        sections.append(f"## O que Resolve\n\n{o_que_resolve}\n")
    
    # Resumo para pais
    resumo_pais = atividade.get('resumo_pais', '')
    if resumo_pais:
        sections.append(f"## Resumo para Pais\n\n{resumo_pais}\n")
    
    # Tags (seção separada)
    tags = atividade.get('tags', [])
    if tags:
        tags_str = ', '.join(tags)
        sections.append(f"## Tags\n\n{tags_str}\n")
    
    # Informações rápidas (tabela)
    infos = []
    campos_info = [
        ('Categoria', 'categoria'),
        ('Faixa Etária', 'faixa_etaria'),
        ('Tempo de Entretenimento', 'tempo_entretenimento'),
        ('Preparo do Adulto', 'preparo_adulto'),
        ('Nível de Bagunça', 'nivel_bagunca'),
        ('Custo', 'custo'),
        ('Supervisão', 'supervisao'),
        ('Local', 'local'),
        ('Tipo de Atividade', 'tipo_atividade'),
        ('Energia da Criança', 'energia_crianca'),
        ('Momento Ideal', 'momento_ideal'),
        ('Clima', 'clima'),
        ('Nível de Criatividade', 'nivel_criatividade'),
        ('Habilidade Desenvolvida', 'habilidade_desenvolvida'),
        ('Precisa Antecipação', 'precisa_antecipacao')
    ]
    
    for label, campo in campos_info:
        valor = atividade.get(campo)
        if valor:
            infos.append(f"| {label} | {valor} |")
    
    if infos:
        sections.append("## Informações da Atividade\n")
        sections.append("| Campo | Valor |")
        sections.append("|-------|-------|")
        sections.extend(infos)
        sections.append("")  # Linha em branco
    
    return '\n'.join(sections)

def create_frontmatter(atividade):
    """Cria frontmatter YAML com metadados essenciais"""
    # Campos para frontmatter
    campos_frontmatter = [
        'id', 'nome', 'categoria', 'faixa_etaria',
        'tempo_entretenimento', 'preparo_adulto',
        'nivel_bagunca', 'quantidade_materiais',
        'tipo_atividade', 'energia_crianca',
        'supervisao', 'local', 'custo',
        'habilidade_desenvolvida', 'momento_ideal',
        'clima', 'nivel_criatividade',
        'precisa_antecipacao', 'tags',
        'imagem_url', 'imagem_prompt',
        'created_at', 'enriquecido_em'
    ]
    
    frontmatter = {}
    for campo in campos_frontmatter:
        valor = atividade.get(campo)
        if valor is not None:
            frontmatter[campo] = valor
    
    return frontmatter

def convert_json_to_markdown(json_file, output_dir):
    """Converte um arquivo JSON para Markdown"""
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            atividade = json.load(f)
    except Exception as e:
        print(f"Erro ao ler {json_file}: {e}")
        return None
    
    # Criar nome do arquivo
    id_atividade = atividade.get('id', '000')
    nome_base = atividade.get('nome', 'atividade').lower()
    
    # Limpar nome para usar no arquivo
    nome_arquivo = f"{id_atividade:03d}-{nome_base}"
    nome_arquivo = re.sub(r'[^\w\s-]', '', nome_arquivo)
    nome_arquivo = re.sub(r'[\s]+', '-', nome_arquivo)
    nome_arquivo = f"{nome_arquivo}.md"
    
    # Criar diretório por categoria
    categoria = atividade.get('categoria', 'sem-categoria')
    categoria_dir = re.sub(r'[^\w\s-]', '', categoria.lower())
    categoria_dir = re.sub(r'[\s]+', '-', categoria_dir)
    
    dir_path = output_dir / categoria_dir
    dir_path.mkdir(exist_ok=True, parents=True)
    
    # Criar conteúdo
    frontmatter = create_frontmatter(atividade)
    content = build_markdown_content(atividade)
    
    # Escrever arquivo Markdown
    output_file = dir_path / nome_arquivo
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('---\n')
        f.write(dict_to_yaml(frontmatter))
        f.write('\n---\n\n')
        f.write(content)
    
    return output_file

def main():
    """Função principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Converte JSON para Markdown (simples)')
    parser.add_argument('--input', default='atividades/individuais',
                       help='Diretório de arquivos JSON de entrada')
    parser.add_argument('--output', default='markdown-atividades',
                       help='Diretório de saída para arquivos Markdown')
    parser.add_argument('--single', help='Arquivo JSON único para converter')
    
    args = parser.parse_args()
    
    print("="*60)
    print("CONVERSOR JSON → MARKDOWN (SIMPLES)")
    print("="*60)
    
    output_dir = Path(args.output)
    output_dir.mkdir(exist_ok=True, parents=True)
    
    converted = []
    
    if args.single:
        # Converter arquivo único
        json_file = Path(args.single)
        if json_file.exists():
            md_file = convert_json_to_markdown(json_file, output_dir)
            if md_file:
                converted.append(md_file)
                print(f"✅ Convertido: {json_file.name} → {md_file.name}")
        else:
            print(f"❌ Arquivo não encontrado: {args.single}")
    else:
        # Converter diretório
        input_dir = Path(args.input)
        if not input_dir.exists():
            print(f"❌ Diretório não encontrado: {args.input}")
            return
        
        json_files = list(input_dir.glob("*.json"))
        print(f"📁 Encontrados {len(json_files)} arquivos JSON em {args.input}")
        
        for i, json_file in enumerate(json_files, 1):
            md_file = convert_json_to_markdown(json_file, output_dir)
            if md_file:
                converted.append(md_file)
                print(f"  [{i:3d}/{len(json_files)}] {json_file.name} → {md_file.name}")
    
    # Criar README no diretório de markdown
    if converted:
        readme_path = output_dir / "README.md"
        with open(readme_path, 'w', encoding='utf-8') as f:
            f.write("# Atividades Desplugados em Markdown\n\n")
            f.write(f"Total de atividades: {len(converted)}\n\n")
            
            # Agrupar por categoria
            categorias = {}
            for md_file in converted:
                categoria = md_file.parent.name
                if categoria not in categorias:
                    categorias[categoria] = []
                categorias[categoria].append(md_file.name)
            
            f.write("## Índice por Categoria\n\n")
            for categoria, arquivos in sorted(categorias.items()):
                f.write(f"### {categoria.replace('-', ' ').title()}\n\n")
                for arquivo in sorted(arquivos):
                    f.write(f"- [{arquivo}]({categoria}/{arquivo})\n")
                f.write("\n")
        
        print(f"\n📄 README criado: {readme_path}")
        print(f"✅ Total convertido: {len(converted)} atividades")
        print(f"📁 Saída: {output_dir}")

if __name__ == "__main__":
    main()