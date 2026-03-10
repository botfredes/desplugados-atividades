# Desplugados Admin

Este projeto é uma aplicação React para gerenciamento administrativo do Desplugados. O sistema utiliza Vite, TypeScript, Supabase e Shadcn UI para fornecer uma interface rica para gerenciamento de atividades.

## Estrutura do Projeto

- **package.json**: Contém as dependências necessárias e os scripts de execução/build.
- **tailwind.config.js**: Configuração do Tailwind CSS com esquemas de cores personalizadas.
- **vite.config.ts**: Configuração para o bundler Vite.
- **src/**: Contém os arquivos de frontend incluindo componentes e lógica de API.

### Componentes Principais

- **ActivityList**: Apresenta a lista de atividades com paginação e filtros reais.
- **ActivityDetail**: Apresenta detalhes completos de uma atividade específica com funcionalidade para solicitar melhorias.
- **CommentSection**: Módulo de comentários para adição e visualização de feedback.

### Configuração do Ambiente

1. Clone este repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute o projeto:
   ```bash
   npm run dev
   ```

### Configuração Supabase

Certifique-se de que o Supabase esteja corretamente configurado utilizando as credenciais fornecidas no arquivo `src/lib/supabase.ts`.

### Dependências

- **React**: Para construção de interfaces dinâmicas.
- **React Router**: Para navegação de rotas dentro da aplicação.
- **Supabase**: Para backend as a service e banco de dados.
- **Shadcn UI**: Biblioteca de componentes UI.

### Desenvolvimento

Para iniciar o desenvolvimento:
- Edite os arquivos em `src/`
- Utilize Tailwind para facilitar a estilizacão

### Contribuição

Contribuições são bem-vindas! Por favor, faça fork do repositório e envie suas alterações.

### Licença

Este projeto está licenciado sob a licença MIT.