# Vision Agro — versão demonstrativa para Vercel

Esta versão publica a interface do Vision Agro com Express + EJS. Não utiliza SQLite nem outro banco de dados.

## Executar localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:3000.

## Publicar na Vercel

1. Envie esta pasta para um repositório GitHub.
2. Na Vercel, escolha **Add New → Project** e importe o repositório.
3. Mantenha as configurações detectadas pelo projeto e clique em **Deploy**.
4. Não é necessário configurar variáveis de ambiente ou banco de dados nesta etapa.

## Limitações desta versão

- Os dados de demonstração estão em memória no processo da aplicação.
- Cadastros, edições e exclusões são temporários e podem desaparecer quando a função reiniciar.
- A aplicação pode ser reiniciada entre requisições e instâncias diferentes podem não compartilhar as alterações.
- Não utilize esta versão para armazenar dados reais de colaboradores. A persistência será adicionada posteriormente com um banco de dados remoto.

## Acesso demonstrativo

A tela inicial solicita e-mail e senha. A senha compartilhada de demonstração é `1234`.

E-mails que já estão cadastrados nos dados demonstrativos:
- `jao@visionagro.com`
- `biu@visionagro.com`
- `games@visionagro.com`
- `bia@gmail.com`

A autenticação usa um cookie assinado, com duração de 12 horas. Para publicar na Vercel, configure a variável de ambiente `LOGIN_SECRET` com um segredo longo e aleatório em **Project → Settings → Environment Variables** e faça um novo deploy. A senha `1234` é fixa nesta versão de demonstração e deve ser substituída por autenticação individual antes de qualquer uso real.

Os e-mails vêm da lista demonstrativa em memória; cadastros e alterações continuam temporários e podem ser perdidos quando a aplicação reiniciar.
