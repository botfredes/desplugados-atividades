# Contribuindo para o Desplugados

Obrigado pelo seu interesse em contribuir para o projeto Desplugados! Este repositório organiza e enriquece atividades infantis para facilitar o uso por pais e educadores.

## 📋 Como Contribuir

### 1. Reportar Problemas
Se encontrar algum problema nas atividades:
1. Vá para a aba **Issues**
2. Clique em **New Issue**
3. Selecione o template apropriado:
   - 🐛 **Bug**: Erros em atividades (tempos, materiais, instruções)
   - 💡 **Melhoria**: Sugestões para melhorar atividades existentes
   - 📝 **Nova Atividade**: Proposta de nova atividade

### 2. Sugerir Melhorias
Para sugerir melhorias em atividades existentes:
- Inclua o **ID da atividade** (encontrado no nome do arquivo)
- Descreva a **melhoria proposta**
- Explique o **benício** da mudança

### 3. Adicionar Novas Atividades
Para adicionar uma nova atividade:
1. Use o template JSON abaixo
2. Siga os critérios de qualidade
3. Envie um **Pull Request**

## 🎯 Template para Novas Atividades

```json
{
  "id": 200,  // Use ID acima de 200 para novas atividades
  "nome": "Nome da Atividade",
  "categoria": "Categoria Apropriada",
  "faixa_etaria": "X-Y anos",  // Ex: "3-4 anos", "5-6 anos", "7-8 anos"
  "tempo_entretenimento": "X-Y min",  // Ex: "10-20 min", "20-40 min"
  "nivel_bagunca": "Baixa/Média/Alta/Nenhuma",
  "quantidade_materiais": "1-3 itens / 4-7 itens / 8+ itens",
  "tipo_atividade": "Simples / Moderada / Ativa / Muito Ativa / Complexa",
  "energia_crianca": "Baixa / Média / Alta / Qualquer",
  "supervisao": "Nenhuma / Mínima / Moderada / Constante",
  "local": "Interno / Externo / Qualquer",
  "custo": "Baixo (até R$10) / Médio (R$10-30) / Alto (R$30+)",
  "preparo_adulto": "X min / X-Y min",  // Ex: "5 min", "10-20 min"
  "habilidade_desenvolvida": "Habilidade principal desenvolvida",
  "momento_ideal": "Manhã / Tarde / Noite / Qualquer hora",
  "clima": "Sol / Chuva / Qualquer",
  "nivel_criatividade": "Baixo / Médio / Alto / Muito Alto",
  "objetivo": "Objetivo educacional claro",
  "descricao": "Descrição breve e atraente",
  "como_aplicar": "Instruções passo a passo detalhadas",
  "materiais_necessarios": "Lista específica de materiais",
  "precisa_antecipacao": "Sim / Não",
  "porque_e_boa": "Por que os pais vão gostar desta atividade",
  "o_que_resolve": "Qual problema da rotina esta atividade resolve",
  "tags": ["tag1", "tag2", "tag3"],
  "resumo_pais": "Resumo rápido para os pais"
}
```

## ✅ Critérios de Qualidade

Todas as atividades devem atender a:

### Obrigatório
- [ ] Tempos realistas (preparo ≤ 30% do tempo total)
- [ ] Materiais específicos (não "nenhum" ou "qualquer")
- [ ] Instruções claras passo a passo
- [ ] Faixa etária apropriada

### Recomendado
- [ ] 3-5 tags relevantes
- [ ] Recursos extras sugeridos (PDFs, vídeos, links)
- [ ] Variações para diferentes idades
- [ ] Dicas de segurança

## 🔧 Desenvolvimento Local

### Clonar o Repositório
```bash
git clone https://github.com/botfredes/desplugados.git
cd desplugados
```

### Usar Scripts
```bash
# Organizar atividades
python scripts/organizar_atividades.py

# Validar atividades
python scripts/validar_atividades.py --caminho atividades/resumo/atividades.json

# Exportar para CSV
python scripts/exportar_csv.py --tipo analise --saida minha_analise.csv
```

### Testar Alterações
1. Faça suas alterações
2. Execute o validador: `python scripts/validar_atividades.py`
3. Verifique se a pontuação permanece acima de 80
4. Teste a exportação para CSV

## 📁 Estrutura de Arquivos

Entenda a estrutura antes de contribuir:

```
atividades/
├── por-categoria/     # Atividades agrupadas por categoria
├── individuais/       # Cada atividade em arquivo único
└── resumo/           # Arquivos consolidados

scripts/
├── organizar_atividades.py
├── validar_atividades.py
└── exportar_csv.py

docs/                 # Documentação
templates/           # Modelos para impressão
recursos/            # Recursos complementares
```

## 🚀 Processo de Pull Request

1. **Fork** o repositório
2. **Crie um branch** para sua feature: `git checkout -b minha-feature`
3. **Commit** suas mudanças: `git commit -m 'Adiciona nova atividade: X'`
4. **Push** para o branch: `git push origin minha-feature`
5. **Abra um Pull Request**

No PR, inclua:
- Descrição das mudanças
- ID(s) das atividades afetadas
- Resultados da validação (print ou texto)
- Qualquer outra informação relevante

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob os mesmos termos do projeto.

---

**Dúvidas?** Abra uma issue ou entre em contato via repositório.

**Obrigado por ajudar a melhorar as atividades para crianças!** 🎨🧩🎶