#!/usr/bin/env python3
"""
Script de build para o projeto Desplugados
Converte Markdown para JSON e valida a saída
"""

import subprocess
import sys
from pathlib import Path

def run_command(cmd, description):
    """Executa um comando e trata erros"""
    print(f"\n{'='*60}")
    print(f"{description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(cmd, shell=True, check=True, text=True, capture_output=True)
        print(result.stdout)
        if result.stderr:
            print(f"⚠️  Avisos:\n{result.stderr}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao executar: {cmd}")
        print(f"   Código: {e.returncode}")
        print(f"   Saída: {e.stdout}")
        print(f"   Erro: {e.stderr}")
        return False

def main():
    """Fluxo principal de build"""
    print("🏗️  SISTEMA DE BUILD DESPLUGADOS")
    print("="*60)
    
    # Configurações
    config = {
        'md_dir': 'markdown-atividades',
        'output_json': 'atividades/gerado/atividades.json',
        'individual_dir': 'atividades/individuais-gerado',
        'validation_script': 'scripts/validar_atividades.py'
    }
    
    # 1. Converter Markdown para JSON
    cmd_convert = (
        f"python3 scripts/md_to_json_simple.py "
        f"--md-dir {config['md_dir']} "
        f"--output {config['output_json']} "
        f"--individual --individual-dir {config['individual_dir']}"
    )
    
    if not run_command(cmd_convert, "1. CONVERTENDO MARKDOWN → JSON"):
        print("❌ Falha na conversão. Abortando.")
        return False
    
    # 2. Validar JSON gerado
    cmd_validate = (
        f"python3 {config['validation_script']} "
        f"--caminho {config['output_json']}"
    )
    
    if not run_command(cmd_validate, "2. VALIDANDO ATIVIDADES GERADAS"):
        print("⚠️  Validação encontrou problemas. Verifique os relatórios.")
        # Não aborta, apenas avisa
        # return False
    
    # 3. Gerar CSV para análise
    cmd_csv = (
        f"python3 scripts/exportar_csv.py "
        f"--entrada {config['output_json']} "
        f"--saida atividades/gerado/atividades_analise.csv "
        f"--tipo analise"
    )
    
    if not run_command(cmd_csv, "3. GERANDO CSV PARA ANÁLISE"):
        print("⚠️  Falha ao gerar CSV. Continuando...")
    
    # 4. Estatísticas finais
    print(f"\n{'='*60}")
    print("📊 RESUMO DO BUILD")
    print(f"{'='*60}")
    
    # Contar arquivos
    md_count = len(list(Path(config['md_dir']).rglob("*.md")))
    json_count = len(list(Path(config['individual_dir']).glob("*.json")))
    
    print(f"📁 Arquivos Markdown: {md_count}")
    print(f"📁 Arquivos JSON individuais: {json_count}")
    
    if Path(config['output_json']).exists():
        import json
        with open(config['output_json'], 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"📦 JSON consolidado: {len(data)} atividades")
    
    print(f"\n✅ BUILD CONCLUÍDO!")
    print(f"   • JSON final: {config['output_json']}")
    print(f"   • JSONs individuais: {config['individual_dir']}")
    print(f"   • CSV de análise: atividades/gerado/atividades_analise.csv")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)