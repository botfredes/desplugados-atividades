#!/usr/bin/env python3
"""
Converte atividades de Markdown com frontmatter para JSON
Reconstrói a estrutura JSON original a partir dos arquivos .md
"""

import yaml
import json
import re
from pathlib import Path

def parse_markdown_file(md_path):
    """Analisa arquivo Markdown com frontmatter YAML"""
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Separar frontmatter do conteúdo
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            frontmatter_str = parts[1].strip()
            markdown_content = parts[2].strip()
            
            # Parsear frontmatter YAML
            frontmatter = yaml.safe_load(frontmatter_str)
            
            # Parsear conteúdo Markdown
            parsed_content = parse_markdown_content(markdown_content)
            
            return frontmatter, parsed_content
    
    # Se não tiver frontmatter, tratar como conteúdo puro
    return {}, {'descricao_markdown': content.strip()}

def parse_markdown_content(markdown_text):
    """Extrai seções do conteúdo Markdown"""
    sections = {
        'descricao_markdown': markdown_text,
        'secoes': {}
    }
    
    # Padrão para identificar seções (## Título)
    pattern = r'^##\s+(.+?)$\s*$(.*?)(?=^##\s|\Z)'
    matches = re.findall(pattern, markdown_text, re.MULTILINE | re.DOTALL)
    
    for title, content in matches:
        title_clean = title.strip()
        content_clean = content.strip()
        
        # Mapear títulos para campos conhecidos
        field_map = {
            'descrição': 'descricao',
            'como aplicar': 'como_aplicar',
            'objetivo': 'objetivo',
            'materiais necessários': 'materiais_necessarios',
            'por que é boa?': 'porque_e_boa',
            'o que resolve': 'o_que_resolve',
            'resumo para pais': 'resumo_pais',
            'detalhes completos': 'descricao_html'
        }
        
        key = title_clean.lower()
        if key in field_map:
            sections[field_map[key]] = content_clean
        else:
            sections['secoes'][title_clean] = content_clean
    
    return sections

def markdown_to_json(md_path):
    """Converte arquivo Markdown para objeto JSON"""
    frontmatter, parsed_content = parse_markdown_file(md_path)
    
    # Criar objeto atividade combinando frontmatter e conteúdo
    atividade = frontmatter.copy()
    
    # Adicionar campos do conteúdo
    for key, value in parsed_content.items():
        if key != 'secoes':
            atividade[key] = value
    
    # Garantir campos obrigatórios
    if 'id' not in atividade:
        # Tentar extrair ID do nome do arquivo
        match = re.search(r'^(\d+)-', md_path.name)
        if match:
            atividade['id'] = int(match.group(1))
    
    if 'nome' not in atividade:
        # Tentar extrair nome do arquivo
        nome = md_path.stem
        if '-' in nome:
            nome = nome.split('-', 1)[1]
        atividade['nome'] = nome.replace('-', ' ').title()
    
    return atividade

def convert_all_markdown_to_json(md_dir, output_dir, individual_dir=None, summary_file=None):
    """Converte todos os arquivos Markdown para JSON"""
    md_path = Path(md_dir)
    output_path = Path(output_dir)
    
    # Criar diretórios de saída
    output_path.mkdir(exist_ok=True, parents=True)
    
    if individual_dir:
        individual_path = Path(individual_dir)
        individual_path.mkdir(exist_ok=True, parents=True)
    
    todas_atividades = []
    
    # Encontrar todos os arquivos .md
    md_files = list(md_path.rglob("*.md"))
    
    print(f"Encontrados {len(md_files)} arquivos Markdown")
    
    for md_file in md_files:
        try:
            atividade = markdown_to_json(md_file)
            todas_atividades.append(atividade)
            
            # Salvar JSON individual se solicitado
            if individual_dir:
                id_atividade = atividade.get('id', '000')
                nome_arquivo = f"{id_atividade:03d}-{atividade.get('nome', 'atividade').lower()}"
                nome_arquivo = re.sub(r'[^\w\s-]', '', nome_arquivo)
                nome_arquivo = re.sub(r'[\s]+', '-', nome_arquivo)
                nome_arquivo = f"{nome_arquivo}.json"
                
                individual_file = individual_path / nome_arquivo
                with open(individual_file, 'w', encoding='utf-8') as f:
                    json.dump(atividade, f, ensure_ascii=False, indent=2)
                
                print(f"  ✓ {md_file.name} → {nome_arquivo}")
            
        except Exception as e:
            print(f"Erro ao processar {md_file}: {e}")
    
    # Ordenar atividades por ID
    todas_atividades.sort(key=lambda x: x.get('id', 0))
    
    # Salvar arquivo JSON consolidado
    consolidated_file = output_path / "atividades.json"
    with open(consolidated_file, 'w', encoding='utf-8') as f:
        json.dump(todas_atividades, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Arquivo consolidado: {consolidated_file}")
    print(f"   • Total de atividades: {len(todas_atividades)}")
    
    # Criar arquivo de estatísticas
    if summary_file:
        criar_estatisticas(todas_atividades, summary_file)
    
    return todas_atividades

def criar_estatisticas(atividades, output_file):
    """Cria arquivo com estatísticas das atividades"""
    estatisticas = {
        'total': len(atividades),
        'categorias': {},
        'faixa_etaria': {},
        'nivel_bagunca': {},
        'custo': {},
        'supervisao': {}
    }
    
    for atividade in atividades:
        # Contar categorias
        categoria = atividade.get('categoria', 'Não especificada')
        estatisticas['categorias'][categoria] = estatisticas['categorias'].get(categoria, 0) + 1
        
        # Contar faixa etária
        faixa = atividade.get('faixa_etaria', 'Não especificada')
        estatisticas['faixa_etaria'][faixa] = estatisticas['faixa_etaria'].get(faixa, 0) + 1
        
        # Contar nível de bagunça
        bagunca = atividade.get('nivel_bagunca', 'Não especificada')
        estatisticas['nivel_bagunca'][bagunca] = estatisticas['nivel_bagunca'].get(bagunca, 0) + 1
        
        # Contar custo
        custo = atividade.get('custo', 'Não especificada')
        estatisticas['custo'][custo] = estatisticas['custo'].get(custo, 0) + 1
        
        # Contar supervisão
        supervisao = atividade.get('supervisao', 'Não especificada')
        estatisticas['supervisao'][supervisao] = estatisticas['supervisao'].get(supervisao, 0) + 1
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(estatisticas, f, ensure_ascii=False, indent=2)
    
    print(f"📊 Estatísticas salvas: {output_file}")

def main():
    """Função principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Converte atividades Markdown para JSON')
    parser.add_argument('--input', default='markdown-atividades',
                       help='Diretório de arquivos Markdown de entrada')
    parser.add_argument('--output', default='atividades/gerado',
                       help='Diretório de saída para arquivos JSON')
    parser.add_argument('--individual', action='store_true',
                       help='Criar arquivos JSON individuais')
    parser.add_argument('--individual-dir', default='atividades/individuais-gerado',
                       help='Diretório para arquivos JSON individuais')
    parser.add_argument('--stats', default='estatisticas.json',
                       help='Arquivo para estatísticas')
    
    args = parser.parse_args()
    
    print("="*60)
    print("CONVERSOR MARKDOWN → JSON")
    print("="*60)
    
    # Converter
    individual_dir = args.individual_dir if args.individual else None
    
    atividades = convert_all_markdown_to_json(
        md_dir=args.input,
        output_dir=args.output,
        individual_dir=individual_dir,
        summary_file=args.stats
    )
    
    # Mostrar resumo
    print(f"\n📋 RESUMO DA CONVERSÃO:")
    print(f"   • Atividades processadas: {len(atividades)}")
    
    if args.individual:
        print(f"   • Arquivos individuais em: {args.individual_dir}")
    
    print(f"   • Arquivo consolidado em: {args.output}/atividades.json")
    print(f"   • Estatísticas em: {args.stats}")

if __name__ == "__main__":
    # Testar se yaml está disponível
    try:
        import yaml
        main()
    except ImportError:
        print("ERRO: Biblioteca PyYAML não encontrada.")
        print("Instale com: pip install PyYAML")
        exit(1)