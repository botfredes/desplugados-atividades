# Desplugados - Atividades para Crianças

Repositório organizado de 143 atividades infantis, categorizadas e enriquecidas com recursos complementares.

## 📊 Estatísticas

- **Total de atividades:** 143
- **Categorias:** 15
- **Faixa etária:** 3-8 anos
- **Status:** Enriquecidas e validadas

## 🗂️ Estrutura do Repositório

```
desplugados-repo/
├── README.md                          # Este arquivo
├── atividades/
│   ├── por-categoria/                 # Atividades agrupadas por categoria
│   │   ├── Dramatização e Faz de Conta/
│   │   ├── Desafios e Missões/
│   │   └── ... (15 categorias)
│   ├── individuais/                   # Cada atividade em arquivo JSON único
│   │   ├── 001-teatro-sombras-chinesas.json
│   │   ├── 002-caca-tesouro-mapa-pirata.json
│   │   └── ... (143 arquivos)
│   └── resumo/                        # Arquivos consolidados
│       ├── atividades.csv             # Tabela completa em CSV
│       ├── atividades.json            # Todas em um único JSON
│       └── estatisticas.json          # Dados estatísticos
├── scripts/
│   ├── organizar_atividades.py        # Script para organizar a estrutura
│   ├── validar_atividades.py          # Validação de consistência
│   └── exportar_csv.py                # Exportação para CSV
├── templates/                         # Modelos para impressão
│   ├── mapas-tesouro/
│   ├── formas-sombras/
│   └── certificados/
├── recursos/                          # Recursos complementares
│   ├── pesquisas/                     # Resultados de pesquisas online
│   └── links/                         # Links úteis por categoria
└── docs/                              # Documentação
    ├── guia-revisao.md                # Como revisar atividades
    └── criterios-qualidade.md         # Critérios de qualidade
```

## 🎯 Objetivo

Organizar as atividades do Desplugados de forma que:
1. Seja fácil revisar cada atividade individualmente
2. Permita filtragem por categoria, faixa etária, tempo, etc.
3. Inclua todos os recursos necessários para execução
4. Seja mantível e expansível

## 🔍 Como Revisar Atividades

### Revisão Individual
1. Acesse `atividades/individuais/`
2. Abra o arquivo JSON da atividade
3. Verifique:
   - ✅ Tempos compatíveis (preparo vs duração)
   - ✅ Materiais específicos e acessíveis
   - ✅ Instruções claras passo a passo
   - ✅ Recursos extras (PDFs, vídeos, links)

### Revisão por Categoria
1. Acesse `atividades/por-categoria/`
2. Escolha uma categoria
3. Veja todas as atividades daquela categoria
4. Avalie cobertura e variedade

### Análise Estatística
1. Consulte `atividades/resumo/estatisticas.json`
2. Verifique distribuição por:
   - Categoria
   - Faixa etária
   - Tempo de preparo
   - Nível de bagunça

## 📈 Status do Projeto

### ✅ Concluído
- [x] Coleta de 153 atividades originais
- [x] Identificação e remoção de duplicatas
- [x] Consolidação de atividades similares
- [x] Enriquecimento básico (tempos, materiais, tags)
- [x] Correção de inconsistências

### 🚧 Em Andamento
- [ ] Organização em estrutura de repositório
- [ ] Criação de templates para impressão
- [ ] Pesquisa de recursos online complementares
- [ ] Validação final de todas as atividades

### 📋 Próximos Passos
- [ ] Revisão manual de 20% das atividades
- [ ] Criação de PDFs com modelos imprimíveis
- [ ] Integração com site/plataforma
- [ ] Sistema de contribuição da comunidade

## 🛠️ Scripts Disponíveis

### `organizar_atividades.py`
Organiza as atividades na estrutura de pastas:
```bash
python scripts/organizar_atividades.py
```

### `validar_atividades.py`
Valida consistência das atividades:
```bash
python scripts/validar_atividades.py --criterios todos
```

### `exportar_csv.py`
Exporta para CSV para análise em planilhas:
```bash
python scripts/exportar_csv.py --output atividades.csv
```

## 🤝 Como Contribuir

1. **Reportar problemas**: Abra uma issue para atividades com problemas
2. **Sugerir melhorias**: Proponha novos recursos ou correções
3. **Adicionar atividades**: Siga o padrão JSON estabelecido
4. **Traduzir recursos**: Ajude com recursos em outros idiomas

## 📄 Licença

Os dados das atividades são do site Desplugados (https://desplugados.pages.dev/). Este repositório organiza e enriquece esses dados para facilitar o uso por pais e educadores.

---

**Última atualização:** 2026-03-09  
**Responsável:** Juarez (Assistente OpenClaw)  
**Contato:** Via issues deste repositório