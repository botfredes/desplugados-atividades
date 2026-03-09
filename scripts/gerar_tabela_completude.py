#!/usr/bin/env python3
"""
Gera tabela de completude das atividades para Google Docs
Exporta CSV e Markdown com pontuação de cada atividade
"""

import json
import csv
from pathlib import Path
import re
from validar_atividades import ValidadorAtividades

class GeradorTabelaCompletude(ValidadorAtividades):
    def __init__(self):
        super().__init__()
        self.todas_atividades_validadas = []  # Armazenar todas as atividades validadas
    
    def validar_atividade(self, atividade, atividade_id):
        """Sobrescreve para armazenar todos os resultados"""
        problemas, pontuacao, status = super().validar_atividade(atividade, atividade_id)
        
        # Armazenar resultado completo
        resultado = {
            'id': atividade_id,
            'nome': atividade.get('nome', ''),
            'categoria': atividade.get('categoria', ''),
            'faixa_etaria': atividade.get('faixa_etaria', ''),
            'tempo_entretenimento': atividade.get('tempo_entretenimento', ''),
            'preparo_adulto': atividade.get('preparo_adulto', ''),
            'nivel_bagunca': atividade.get('nivel_bagunca', ''),
            'custo': atividade.get('custo', ''),
            'supervisao': atividade.get('supervisao', ''),
            'pontuacao': pontuacao,
            'status': status,
            'problemas': problemas,
            'quantidade_problemas': len(problemas)
        }
        
        self.todas_atividades_validadas.append(resultado)
        
        return problemas, pontuacao, status
    
    def executar_validacao(self, caminho_atividades):
        """Executa validação coletando todos os resultados"""
        print("="*60)
        print("GERANDO TABELA DE COMPLETUDE")
        print("="*60)
        
        # Carregar atividades
        atividades = self.carregar_atividades(caminho_atividades)
        self.estatisticas['total'] = len(atividades)
        
        if not atividades:
            print("Nenhuma atividade encontrada!")
            return
        
        print(f"Atividades carregadas: {len(atividades)}")
        
        # Validar cada atividade
        print("\nValidando atividades...")
        pontuacoes = []
        
        for i, atividade in enumerate(atividades, 1):
            atividade_id = atividade.get('id', i)
            problemas, pontuacao, status = self.validar_atividade(atividade, atividade_id)
            pontuacoes.append(pontuacao)
            
            if i % 20 == 0:
                print(f"  Processadas: {i}/{len(atividades)}")
        
        # Calcular estatísticas
        self.estatisticas['pontuacao_media'] = sum(pontuacoes) / len(pontuacoes) if pontuacoes else 0
        self.estatisticas['completas'] = sum(1 for a in self.todas_atividades_validadas if a['pontuacao'] >= 80)
        self.estatisticas['com_problemas'] = sum(1 for a in self.todas_atividades_validadas if a['pontuacao'] < 80)
        
        # Ordenar por pontuação (menor primeiro)
        self.todas_atividades_validadas.sort(key=lambda x: x['pontuacao'])
        
        print(f"\n✅ Validação concluída!")
        print(f"   • Pontuação média: {self.estatisticas['pontuacao_media']:.1f}/100")
        print(f"   • Atividades completas: {self.estatisticas['completas']}")
        print(f"   • Atividades com problemas: {self.estatisticas['com_problemas']}")
    
    def exportar_csv_completo(self, caminho_csv):
        """Exporta todas as atividades para CSV"""
        with open(caminho_csv, 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            # Cabeçalho
            writer.writerow([
                'ID', 'Nome', 'Categoria', 'Pontuação', 'Status',
                'Faixa Etária', 'Tempo', 'Preparo', 'Bagunça', 'Custo',
                'Supervisão', 'Problemas', 'Qtd Problemas'
            ])
            
            for atividade in self.todas_atividades_validadas:
                problemas_str = ' | '.join(atividade['problemas']) if atividade['problemas'] else 'Nenhum'
                
                writer.writerow([
                    atividade['id'],
                    atividade['nome'],
                    atividade['categoria'],
                    f"{atividade['pontuacao']:.1f}",
                    atividade['status'].replace('✅ ', '').replace('⚠️  ', '').replace('❌ ', ''),
                    atividade['faixa_etaria'],
                    atividade['tempo_entretenimento'],
                    atividade['preparo_adulto'],
                    atividade['nivel_bagunca'],
                    atividade['custo'],
                    atividade['supervisao'],
                    problemas_str,
                    atividade['quantidade_problemas']
                ])
        
        print(f"📊 CSV completo exportado: {caminho_csv}")
    
    def exportar_markdown(self, caminho_md):
        """Exporta tabela em formato Markdown"""
        with open(caminho_md, 'w', encoding='utf-8') as f:
            f.write("# Tabela de Completude das Atividades\n\n")
            f.write(f"**Total:** {self.estatisticas['total']} atividades | ")
            f.write(f"**Pontuação média:** {self.estatisticas['pontuacao_media']:.1f}/100 | ")
            f.write(f"**Completas:** {self.estatisticas['completas']} | ")
            f.write(f"**Com problemas:** {self.estatisticas['com_problemas']}\n\n")
            
            f.write("| ID | Nome | Categoria | Pontuação | Status | Problemas |\n")
            f.write("|----|------|-----------|-----------|--------|-----------|\n")
            
            for atividade in self.todas_atividades_validadas:
                # Limitar nome para tabela
                nome = atividade['nome']
                if len(nome) > 40:
                    nome = nome[:37] + '...'
                
                # Status sem emoji
                status = atividade['status'].replace('✅ ', '').replace('⚠️  ', '').replace('❌ ', '')
                
                # Problemas resumidos
                problemas = atividade['problemas']
                if problemas:
                    problemas_str = f"{len(problemas)} problema(s)"
                    if len(problemas) > 0:
                        problemas_str += f": {problemas[0]}"
                        if len(problemas) > 1:
                            problemas_str += "..."
                else:
                    problemas_str = "Nenhum"
                
                f.write(f"| {atividade['id']} | {nome} | {atividade['categoria']} | ")
                f.write(f"{atividade['pontuacao']:.1f} | {status} | {problemas_str} |\n")
            
            f.write("\n\n## Estatísticas por Categoria\n\n")
            
            # Agrupar por categoria
            categorias = {}
            for atividade in self.todas_atividades_validadas:
                cat = atividade['categoria']
                if cat not in categorias:
                    categorias[cat] = {
                        'total': 0,
                        'pontuacao_total': 0,
                        'completas': 0
                    }
                categorias[cat]['total'] += 1
                categorias[cat]['pontuacao_total'] += atividade['pontuacao']
                if atividade['pontuacao'] >= 80:
                    categorias[cat]['completas'] += 1
            
            f.write("| Categoria | Total | Completas | Pontuação Média |\n")
            f.write("|-----------|-------|-----------|-----------------|\n")
            
            for cat, stats in sorted(categorias.items()):
                media = stats['pontuacao_total'] / stats['total'] if stats['total'] > 0 else 0
                completas_pct = (stats['completas'] / stats['total'] * 100) if stats['total'] > 0 else 0
                
                f.write(f"| {cat} | {stats['total']} | {stats['completas']} ({completas_pct:.1f}%) | {media:.1f} |\n")
        
        print(f"📄 Tabela Markdown exportada: {caminho_md}")
    
    def exportar_html(self, caminho_html):
        """Exporta tabela HTML para fácil cópia"""
        from datetime import datetime
        
        with open(caminho_html, 'w', encoding='utf-8') as f:
            # Escrever cabeçalho
            f.write(f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Tabela de Completude - Desplugados</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        table {{ border-collapse: collapse; width: 100%; margin-bottom: 30px; }}
        th, td {{ border: 1px solid #ddd; padding: 10px; text-align: left; }}
        th {{ background-color: #4CAF50; color: white; }}
        tr:nth-child(even) {{ background-color: #f9f9f9; }}
        .completa {{ background-color: #e8f5e9; }}
        .regular {{ background-color: #fff3e0; }}
        .insuficiente {{ background-color: #ffebee; }}
        .stats {{ background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
    </style>
</head>
<body>
    <h1>Tabela de Completude das Atividades Desplugados</h1>
    
    <div class="stats">
        <strong>Total:</strong> {self.estatisticas['total']} atividades |
        <strong>Pontuação média:</strong> {self.estatisticas['pontuacao_media']:.1f}/100 |
        <strong>Completas:</strong> {self.estatisticas['completas']} |
        <strong>Com problemas:</strong> {self.estatisticas['com_problemas']}
    </div>
    
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Pontuação</th>
                <th>Status</th>
                <th>Problemas</th>
            </tr>
        </thead>
        <tbody>
''')
            
            # Escrever linhas da tabela
            for atividade in self.todas_atividades_validadas:
                # Determinar classe CSS
                if atividade['pontuacao'] >= 80:
                    classe = 'completa'
                elif atividade['pontuacao'] >= 60:
                    classe = 'regular'
                else:
                    classe = 'insuficiente'
                
                # Status sem emoji
                status = atividade['status'].replace('✅ ', '').replace('⚠️  ', '').replace('❌ ', '')
                
                # Problemas resumidos
                problemas = atividade['problemas']
                if problemas:
                    problemas_html = f"<strong>{len(problemas)} problema(s):</strong><br>"
                    problemas_html += "<ul>"
                    for problema in problemas[:3]:
                        problemas_html += f"<li>{problema}</li>"
                    if len(problemas) > 3:
                        problemas_html += f"<li>... e mais {len(problemas) - 3} problemas</li>"
                    problemas_html += "</ul>"
                else:
                    problemas_html = "Nenhum"
                
                f.write(f'''            <tr class="{classe}">
                <td>{atividade['id']}</td>
                <td><strong>{atividade['nome']}</strong></td>
                <td>{atividade['categoria']}</td>
                <td><strong>{atividade['pontuacao']:.1f}</strong></td>
                <td>{status}</td>
                <td>{problemas_html}</td>
            </tr>
''')
            
            # Rodapé
            data_atual = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            f.write(f'''        </tbody>
    </table>
    
    <p><em>Tabela gerada automaticamente em {data_atual}</em></p>
</body>
</html>''')
        
        print(f"🌐 Tabela HTML exportada: {caminho_html}")

def main():
    """Função principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Gera tabela de completude para Google Docs')
    parser.add_argument('--caminho', default='atividades/resumo/atividades.json',
                       help='Caminho para arquivo JSON ou diretório de atividades')
    parser.add_argument('--csv', default='tabela_completude.csv',
                       help='Caminho para arquivo CSV de saída')
    parser.add_argument('--markdown', default='tabela_completude.md',
                       help='Caminho para arquivo Markdown de saída')
    parser.add_argument('--html', default='tabela_completude.html',
                       help='Caminho para arquivo HTML de saída')
    
    args = parser.parse_args()
    
    # Criar gerador
    gerador = GeradorTabelaCompletude()
    
    # Executar validação
    caminho_completo = Path(__file__).parent.parent / args.caminho
    gerador.executar_validacao(caminho_completo)
    
    # Exportar formatos
    if args.csv:
        csv_path = Path(__file__).parent.parent / args.csv
        gerador.exportar_csv_completo(csv_path)
    
    if args.markdown:
        md_path = Path(__file__).parent.parent / args.markdown
        gerador.exportar_markdown(md_path)
    
    if args.html:
        html_path = Path(__file__).parent.parent / args.html
        gerador.exportar_html(html_path)
    
    print(f"\n🎯 Tabelas geradas com sucesso!")
    print(f"   • Use o CSV para importar no Google Docs")
    print(f"   • Use o Markdown para documentação")
    print(f"   • Use o HTML para visualização")

if __name__ == "__main__":
    main()