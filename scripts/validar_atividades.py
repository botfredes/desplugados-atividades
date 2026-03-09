#!/usr/bin/env python3
"""
Validador de atividades do Desplugados
Verifica consistência e qualidade das atividades
"""

import json
import csv
from pathlib import Path
import re

class ValidadorAtividades:
    def __init__(self):
        self.erros = []
        self.avisos = []
        self.estatisticas = {
            'total': 0,
            'completas': 0,
            'com_problemas': 0,
            'pontuacao_media': 0,
            'criterios': {}
        }
    
    def extrair_minutos(self, tempo_str):
        """Extrai minutos de strings como '5 min', '10-20 min'"""
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
    
    def validar_tempos(self, atividade):
        """Valida compatibilidade dos tempos"""
        problemas = []
        
        preparo = atividade.get('preparo_adulto', '')
        entretenimento = atividade.get('tempo_entretenimento', '')
        
        prep_min = self.extrair_minutos(preparo)
        ent_min = self.extrair_minutos(entretenimento)
        
        # Critério 1: Preparo não deve ser zero para atividades que precisam
        if prep_min == 0:
            tipo = atividade.get('tipo_atividade', '')
            if tipo in ['Complexa', 'Muito Ativa']:
                problemas.append(f"Atividade {tipo} com preparo zero: '{preparo}'")
        
        # Critério 2: Preparo não deve exceder 50% do tempo de entretenimento
        if prep_min > 0 and ent_min > 0:
            if prep_min > ent_min * 0.5:
                problemas.append(f"Preparo ({preparo}) > 50% do tempo total ({entretenimento})")
        
        # Critério 3: Tempos realistas
        if prep_min > 60:
            problemas.append(f"Preparo muito longo: {preparo}")
        
        if ent_min > 180:
            problemas.append(f"Tempo de entretenimento muito longo: {entretenimento}")
        
        return problemas
    
    def validar_materiais(self, atividade):
        """Valida lista de materiais"""
        problemas = []
        
        materiais = atividade.get('materiais_necessarios', '')
        quantidade = atividade.get('quantidade_materiais', '')
        custo = atividade.get('custo', '')
        
        # Critério 1: Materiais não podem ser "nenhum" ou muito genéricos
        if not materiais or materiais.lower() in ['nenhum', 'nada', 'improvisado']:
            problemas.append("Materiais não especificados ou muito genéricos")
        else:
            # Contar itens
            itens = [m.strip() for m in re.split(r'[,;.]', materiais) if m.strip()]
            
            # Critério 2: Quantidade declarada vs real
            if quantidade:
                if '1-3' in quantidade and len(itens) > 3:
                    problemas.append(f"Quantidade '{quantidade}' mas tem {len(itens)} itens")
                elif '4-7' in quantidade and (len(itens) < 4 or len(itens) > 7):
                    problemas.append(f"Quantidade '{quantidade}' mas tem {len(itens)} itens")
                elif '8+' in quantidade and len(itens) < 8:
                    problemas.append(f"Quantidade '{quantidade}' mas tem {len(itens)} itens")
            
            # Critério 3: Custo vs materiais
            if custo:
                if 'Baixo' in custo and len(itens) > 5:
                    problemas.append(f"Custo '{custo}' mas muitos itens: {len(itens)}")
                elif 'Alto' in custo and len(itens) < 3:
                    problemas.append(f"Custo '{custo}' mas poucos itens: {len(itens)}")
        
        return problemas
    
    def validar_conteudo(self, atividade):
        """Valida qualidade do conteúdo"""
        problemas = []
        
        descricao = atividade.get('descricao', '')
        como_aplicar = atividade.get('como_aplicar', '')
        objetivo = atividade.get('objetivo', '')
        
        # Critério 1: Descrição mínima
        if len(descricao) < 20:
            problemas.append(f"Descrição muito curta ({len(descricao)} caracteres)")
        
        # Critério 2: Instruções mínimas
        if len(como_aplicar) < 30:
            problemas.append(f"Instruções muito curtas ({len(como_aplicar)} caracteres)")
        
        # Critério 3: Objetivo claro
        if not objetivo or len(objetivo) < 10:
            problemas.append("Objetivo não especificado ou muito vago")
        
        return problemas
    
    def validar_faixa_etaria(self, atividade):
        """Valida adequação da faixa etária"""
        problemas = []
        
        faixa = atividade.get('faixa_etaria', '')
        tipo = atividade.get('tipo_atividade', '')
        
        if not faixa:
            problemas.append("Faixa etária não especificada")
            return problemas
        
        # Extrair idade mínima e máxima
        match = re.search(r'(\d+)[^\d]*(\d+)', faixa)
        if match:
            idade_min = int(match.group(1))
            idade_max = int(match.group(2))
            
            # Critério 1: Faixa muito ampla
            if idade_max - idade_min > 3:
                problemas.append(f"Faixa etária muito ampla: {faixa}")
            
            # Critério 2: Adequação ao tipo de atividade
            if idade_min < 4 and tipo in ['Complexa', 'Muito Ativa']:
                problemas.append(f"Atividade {tipo} para faixa muito nova: {faixa}")
        
        return problemas
    
    def calcular_pontuacao(self, atividade, problemas):
        """Calcula pontuação de qualidade (0-100)"""
        # Pontos base
        pontos = 100
        
        # Penalidades
        penalidades = {
            'tempo': 20,      # Problemas de tempo
            'materiais': 25,  # Problemas de materiais
            'conteudo': 15,   # Problemas de conteúdo
            'faixa': 10,      # Problemas de faixa etária
            'outros': 5       # Outros problemas
        }
        
        # Classificar problemas
        for problema in problemas:
            if 'tempo' in problema.lower() or 'preparo' in problema.lower():
                pontos -= penalidades['tempo'] / 2  # Penalidade reduzida
            elif 'material' in problema.lower() or 'custo' in problema.lower():
                pontos -= penalidades['materiais'] / 2
            elif 'descrição' in problema.lower() or 'instru' in problema.lower() or 'objetivo' in problema.lower():
                pontos -= penalidades['conteudo'] / 2
            elif 'faixa' in problema.lower() or 'idade' in problema.lower():
                pontos -= penalidades['faixa'] / 2
            else:
                pontos -= penalidades['outros']
        
        # Garantir mínimo 0
        return max(0, min(100, pontos))
    
    def validar_atividade(self, atividade, atividade_id):
        """Valida uma atividade individual"""
        id_str = f"ID {atividade_id}: {atividade.get('nome', 'Sem nome')}"
        
        problemas = []
        
        # Executar todas as validações
        problemas.extend(self.validar_tempos(atividade))
        problemas.extend(self.validar_materiais(atividade))
        problemas.extend(self.validar_conteudo(atividade))
        problemas.extend(self.validar_faixa_etaria(atividade))
        
        # Calcular pontuação
        pontuacao = self.calcular_pontuacao(atividade, problemas)
        
        # Classificar
        if pontuacao >= 80:
            status = "✅ COMPLETA"
            self.estatisticas['completas'] += 1
        elif pontuacao >= 60:
            status = "⚠️  REGULAR"
            self.estatisticas['com_problemas'] += 1
        else:
            status = "❌ INSUFICIENTE"
            self.estatisticas['com_problemas'] += 1
        
        # Registrar se houver problemas
        if problemas:
            self.erros.append({
                'id': atividade_id,
                'nome': atividade.get('nome', ''),
                'problemas': problemas,
                'pontuacao': pontuacao,
                'status': status
            })
        
        return problemas, pontuacao, status
    
    def carregar_atividades(self, caminho):
        """Carrega atividades de um arquivo ou diretório"""
        caminho = Path(caminho)
        
        if caminho.is_file():
            # É um arquivo JSON
            with open(caminho, 'r', encoding='utf-8') as f:
                return json.load(f)
        elif caminho.is_dir():
            # É um diretório de arquivos JSON individuais
            atividades = []
            for arquivo in caminho.glob("*.json"):
                with open(arquivo, 'r', encoding='utf-8') as f:
                    atividades.append(json.load(f))
            return atividades
        
        return []
    
    def executar_validacao(self, caminho_atividades, saida_csv=None):
        """Executa validação em todas as atividades"""
        print("="*60)
        print("VALIDAÇÃO DE ATIVIDADES DESPLUGADOS")
        print("="*60)
        
        # Carregar atividades
        print(f"\nCarregando atividades de: {caminho_atividades}")
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
            
            if problemas and len(problemas) > 0:
                print(f"{i:3d}. {status} - Pontuação: {pontuacao:.1f} - {len(problemas)} problema(s)")
            else:
                print(f"{i:3d}. {status} - Pontuação: {pontuacao:.1f}")
        
        # Calcular estatísticas
        self.estatisticas['pontuacao_media'] = sum(pontuacoes) / len(pontuacoes) if pontuacoes else 0
        
        # Gerar relatório
        self.gerar_relatorio()
        
        # Exportar CSV se solicitado
        if saida_csv:
            self.exportar_csv(saida_csv)
    
    def gerar_relatorio(self):
        """Gera relatório de validação"""
        print("\n" + "="*60)
        print("RELATÓRIO DE VALIDAÇÃO")
        print("="*60)
        
        print(f"\n📊 ESTATÍSTICAS:")
        print(f"   • Total de atividades: {self.estatisticas['total']}")
        print(f"   • Atividades completas: {self.estatisticas['completas']} ({self.estatisticas['completas']/self.estatisticas['total']*100:.1f}%)")
        print(f"   • Atividades com problemas: {self.estatisticas['com_problemas']} ({self.estatisticas['com_problemas']/self.estatisticas['total']*100:.1f}%)")
        print(f"   • Pontuação média: {self.estatisticas['pontuacao_media']:.1f}/100")
        
        if self.erros:
            print(f"\n⚠️  ATIVIDADES COM PROBLEMAS ({len(self.erros)}):")
            for erro in self.erros[:10]:  # Mostrar apenas as 10 primeiras
                print(f"\n   ID {erro['id']}: {erro['nome'][:50]}...")
                print(f"      Pontuação: {erro['pontuacao']:.1f} - {erro['status']}")
                for problema in erro['problemas'][:3]:  # Mostrar até 3 problemas
                    print(f"      • {problema}")
            
            if len(self.erros) > 10:
                print(f"\n      ... e mais {len(self.erros) - 10} atividades com problemas")
        
        # Salvar relatório em arquivo
        relatorio_path = Path(__file__).parent.parent / "relatorio_validacao.txt"
        with open(relatorio_path, 'w', encoding='utf-8') as f:
            f.write("RELATÓRIO DE VALIDAÇÃO DE ATIVIDADES\n")
            f.write("="*60 + "\n\n")
            f.write(f"Total de atividades: {self.estatisticas['total']}\n")
            f.write(f"Atividades completas: {self.estatisticas['completas']}\n")
            f.write(f"Atividades com problemas: {self.estatisticas['com_problemas']}\n")
            f.write(f"Pontuação média: {self.estatisticas['pontuacao_media']:.1f}\n\n")
            
            if self.erros:
                f.write("ATIVIDADES COM PROBLEMAS:\n")
                f.write("-"*60 + "\n")
                for erro in self.erros:
                    f.write(f"\nID {erro['id']}: {erro['nome']}\n")
                    f.write(f"Pontuação: {erro['pontuacao']:.1f} - {erro['status']}\n")
                    for problema in erro['problemas']:
                        f.write(f"  • {problema}\n")
        
        print(f"\n📄 Relatório salvo em: {relatorio_path}")
    
    def exportar_csv(self, caminho_csv):
        """Exporta resultados para CSV"""
        with open(caminho_csv, 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['ID', 'Nome', 'Pontuação', 'Status', 'Problemas'])
            
            for erro in self.erros:
                problemas_str = ' | '.join(erro['problemas'])
                writer.writerow([
                    erro['id'],
                    erro['nome'],
                    erro['pontuacao'],
                    erro['status'],
                    problemas_str
                ])
        
        print(f"📊 CSV exportado para: {caminho_csv}")

def main():
    """Função principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Validador de atividades do Desplugados')
    parser.add_argument('--caminho', default='atividades/resumo/atividades.json',
                       help='Caminho para arquivo JSON ou diretório de atividades')
    parser.add_argument('--csv', help='Caminho para exportar resultados em CSV')
    parser.add_argument('--criterios', default='todos',
                       choices=['tempos', 'materiais', 'conteudo', 'faixa', 'todos'],
                       help='Critérios de validação a aplicar')
    
    args = parser.parse_args()
    
    # Criar validador
    validador = ValidadorAtividades()
    
    # Executar validação
    caminho_completo = Path(__file__).parent.parent / args.caminho
    validador.executar_validacao(caminho_completo, args.csv)

if __name__ == "__main__":
    main()