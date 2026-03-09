#!/usr/bin/env python3
"""
Converte atividades de JSON para Markdown com frontmatter YAML
Cria estrutura organizada como blog para revisão manual
"""

import json
import os
from pathlib import Path
import re

def html_to_markdown(html_text):
    """Converte HTML simples para Markdown básico"""
    if not html_text:
        return ""
    
    # Substituições básicas
    md = html_text
    
    # Remover tags de abertura e fechamento de parágrafos
    md = re.sub(r'<p>', '', md)
    md = re.sub(r'</p>', '\n\n', md)
    
    # Converter headings
    md = re.sub(r'<h3>(.*?)</h3>', r'## \1', md)
    md = re.sub(r'<h4>(.*?)</h4>', r'### \1', md)
    
    # Converter listas
    md = re.sub(r'<ul>', '', md)
    md = re.sub(r'</ul>', '\n', md)
    md = re.sub(r'<li>', '- ', md)
    md = re.sub(r'</li>', '\n', md)
    
    # Converter strong/em
    md = re.sub(r'<strong>(.*?)</strong>', r'**\1**', md)
    md = re.sub(r'<em>(.*?)</em>', r'*\1*', md)
    
    # Remover outras tags HTML
    md = re.sub(r'<[^>]+>', '', md)
    
    # Limpar espaços múltiplos
    md = re.sub(r'\n\s*\n', '\n\n', md)
    
    return md.strip()

def build_markdown_content(atividade):
    """Constrói o conteúdo Markdown a partir dos dados da atividade"""
    sections = []
    
    # Descrição
    descricao = atividade.get('descricao', '')
    if descricao:
        sections.append(f"## Descrição\n\n{descricao}\n")
    
    # Como Aplicar
    como_aplicar = atividade.get('como_aplicar', '')
    if como_aplicar:
        sections.append(f"## Como Aplicar\n\n{como_aplicar}\n")
    
    # Objetivo
    objetivo = atividade.get('objetivo', '')
    if objetivo:
        sections.append(f"## Objetivo\n\n{objetivo}\n")
    
    # Materiais Necessários
    materiais = atividade.get('materiais_necessarios', '')
    if materiais:
        sections.append(f"## Materiais Necessários\n\n{materiais}\n")
    
    # Por que é Boa
    porque_boa = atividade.get('porque_e_boa', '')
    if porque_boa:
        sections.append(f"## Por que é Boa?\n\n{porque_boa}\n")
    
    # O que Resolve
    o_que_resolve = atividade.get('o_que_resolve', '')
    if o_que_resolve:
        sections.append(f"## O que Resolve\n\n{o_que_resolve}\n")
    
    # Resumo para Pais
    resumo_pais = atividade.get('resumo_pais', '')
    if resumo_pais:
        sections.append(f"## Resumo para Pais\n\n{resumo_pais}\n")
    
    # Descrição HTML (se existir)
    descricao_html = atividade.get('descricao_html', '')
    if descricao_html:
        md_html = html_to_markdown(descricao_html)
        if md_html:
            # Adicionar seção separada para conteúdo HTML convertido
            sections.append(f"## Detalhes Completos\n\n{md_html}\n")
    
    return '\n'.join(sections)

def atividade_to_frontmatter(atividade):
    """Extrai campos para frontmatter YAML"""
    # Campos a incluir no frontmatter
    campos_frontmatter = [
        'id', 'nome', 'categoria', 'faixa_etaria',
        'tempo_entretenimento', 'preparo_adulto',
        'nivel_bagunca', 'quantidade_materiais',
        'tipo_atividade', 'energia_crianca',
        'supervisao', 'local', 'custo',
        'habilidade_desenvolvida', 'momento_ideal',
        'clima', 'nivel_criatividade',
        'precisa_antecipacao', 'tags'
    ]
    
    frontmatter = {}
    for campo in campos_frontmatter:
        valor = atividade.get(campo)
        if valor is not None:
            frontmatter[campo] = valor
    
    # Campos extras que podem ser úteis
    extras = ['imagem_url', 'imagem_prompt', 'created_at', 'enriquecido_em']
    for extra in extras:
        valor = atividade.get(extra)
        if valor:
            frontmatter[extra] = valor
    
    return frontmatter

def create_markdown_file(atividade, output_dir):
    """Cria arquivo Markdown para uma atividade"""
    # Criar nome do arquivo
    id_atividade = atividade.get('id', '000')
    nome_arquivo = f"{id_atividade:03d}-{atividade.get('nome', 'atividade').lower()}"
    
    # Remover caracteres especiais
    nome_arquivo = re.sub(r'[^\w\s-]', '', nome_arquivo)
    nome_arquivo = re.sub(r'[\s]+', '-', nome_arquivo)
    nome_arquivo = f"{nome_arquivo}.md"
    
    # Criar diretório por categoria
    categoria = atividade.get('categoria', 'sem-categoria')
    categoria_dir = re.sub(r'[^\w\s-]', '', categoria.lower())
    categoria_dir = re.sub(r'[\s]+', '-', categoria_dir)
    
    dir_path = output_dir / categoria_dir
    dir_path.mkdir(exist_ok=True, parents=True)
    
    # Construir conteúdo
    frontmatter = atividade_to_frontmatter(atividade)
    content = build_markdown_content(atividade)
    
    # Criar arquivo Markdown com frontmatter
    with open(dir_path / nome_arquivo, 'w', encoding='utf-8') as f:
        f.write('---\n')
        yaml.dump(frontmatter, f, allow_unicode=True, default_flow_style=False)
        f.write('---\n\n')
        f.write(content)
    
    return dir_path / nome_arquivo

def convert_all_json_to_markdown(json_dir, output_dir):
    """Converte todos os arquivos JSON para Markdown"""
    json_path = Path(json_dir)
    output_path = Path(output_dir)
    
    # Criar diretório de saída
    output_path.mkdir(exist_ok=True, parents=True)
    
    atividades_convertidas = []
    
    # Processar arquivos JSON individuais
    if json_path.is_file() and json_path.name.endswith('.json'):
        # É um arquivo único
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, list):
                for atividade in data:
                    md_path = create_markdown_file(atividade, output_path)
                    atividades_convertidas.append(md_path)
            else:
                md_path = create_markdown_file(data, output_path)
                atividades_convertidas.append(md_path)
    
    elif json_path.is_dir():
        # É um diretório de arquivos JSON
        for json_file in json_path.glob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    atividade = json.load(f)
                    md_path = create_markdown_file(atividade, output_path)
                    atividades_convertidas.append(md_path)
            except Exception as e:
                print(f"Erro ao processar {json_file}: {e}")
    
    return atividades_convertidas

def main():
    """Função principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Converte atividades JSON para Markdown')
    parser.add_argument('--input', default='atividades/individuais',
                       help='Diretório ou arquivo JSON de entrada')
    parser.add_argument('--output', default='markdown-atividades',
                       help='Diretório de saída para arquivos Markdown')
    parser.add_argument('--summary', action='store_true',
                       help='Criar arquivo de sumário')
    
    args = parser.parse_args()
    
    print("="*60)
    print("CONVERSOR JSON → MARKDOWN")
    print("="*60)
    
    # Converter
    print(f"\nConvertendo de: {args.input}")
    print(f"Salvando em: {args.output}")
    
    converted = convert_all_json_to_markdown(args.input, args.output)
    
    print(f"\n✅ Conversão concluída!")
    print(f"   • Arquivos convertidos: {len(converted)}")
    print(f"   • Diretório de saída: {args.output}")
    
    # Criar sumário se solicitado
    if args.summary:
        summary_path = Path(args.output) / "SUMMARY.md"
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write("# Sumário das Atividades\n\n")
            f.write(f"Total: {len(converted)} atividades\n\n")
            
            # Agrupar por categoria
            categorias = {}
            for md_path in converted:
                with open(md_path, 'r', encoding='utf-8') as md_file:
                    content = md_file.read()
                    # Extrair categoria do frontmatter
                    match = re.search(r'categoria:\s*(.+)', content)
                    if match:
                        categoria = match.group(1).strip()
                        if categoria not in categorias:
                            categorias[categoria] = []
                        categorias[categoria].append(md_path.name)
            
            for categoria, arquivos in sorted(categorias.items()):
                f.write(f"## {categoria}\n\n")
                for arquivo in sorted(arquivos):
                    f.write(f"- [{arquivo}]({categoria.lower().replace(' ', '-')}/{arquivo})\n")
                f.write("\n")
        
        print(f"   • Sumário criado: {summary_path}")

if __name__ == "__main__":
    main()