const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'chave-secreta', // Utilize variável de ambiente para maior segurança
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 3600000 }, // Expira em 1 hora
    })
);

// Definir pasta pública
app.use(express.static(path.join(__dirname, 'public')));

const porta = 4000;
const host = '0.0.0.0';

// Função para verificar autenticação
function verificarAutenticacao(req, resp, next) {
    if (req.session.autenticado) {
        next(); // Usuário autenticado, prosseguir
    } else {
        resp.redirect('/login.html'); // Redireciona para a página de login se não estiver autenticado
    }
}

// Middleware global de tratamento de erros
app.use((err, req, resp, next) => {
    console.error(err.stack);
    resp.status(500).send('Algo deu errado!');
});

// Rota para processar login
app.post('/login', (req, resp) => {
    const { usuario, senha } = req.body;
    // A senha e o usuário devem ser tratados de forma segura
    if (usuario === 'admin' && senha === '123') {
        req.session.autenticado = true; // Marca o usuário como autenticado na sessão
        resp.redirect('/'); // Redireciona para a página inicial (menu)
    } else {
        resp.send('Usuário ou senha inválidos. <a href="/login.html">Tente novamente</a>');
    }
});

// Rota de logout
app.get('/logout', (req, resp) => {
    req.session.destroy(() => {
        resp.redirect('/login.html'); // Redireciona para o login após logout
    });
});

// Página de login
app.get('/login.html', (req, resp) => {
    resp.send(`
        <html>
        <head>
            <title>Login</title>
        </head>
        <body>
            <h1>Login</h1>
            <form action="/login" method="POST">
                <label for="usuario">Usuário:</label>
                <input type="text" id="usuario" name="usuario" required><br>

                <label for="senha">Senha:</label>
                <input type="password" id="senha" name="senha" required><br>

                <button type="submit">Entrar</button>
            </form>
        </body>
        </html>
    `);
});

// Página inicial com menu
app.get('/', verificarAutenticacao, (req, resp) => {
    resp.send(`
        <html>
        <head>
            <title>Menu</title>
        </head>
        <body>
            <h1>Bem-vindo!</h1>
            <a href="/formulario">Preencher Informações Pessoais</a><br>
            <a href="/logout">Logout</a>
        </body>
        </html>
    `);
});

// Formulário de informações pessoais
app.get('/formulario', verificarAutenticacao, (req, resp) => {
    resp.send(`
        <html>
        <head>
            <title>Informações Pessoais</title>
        </head>
        <body>
            <h1>Preencha suas informações</h1>
            <form action="/formulario" method="POST">
                <label for="nome">Nome:</label>
                <input type="text" id="nome" name="nome" required><br>

                <label for="dataNascimento">Data de Nascimento:</label>
                <input type="date" id="dataNascimento" name="dataNascimento" required><br>

                <label for="nickname">Nickname:</label>
                <input type="text" id="nickname" name="nickname" required><br>

                <button type="submit">Enviar</button>
            </form>
        </body>
        </html>
    `);
});

// Receber e exibir informações enviadas
app.post('/formulario', verificarAutenticacao, (req, resp) => {
    const { nome, dataNascimento, nickname } = req.body;
    resp.send(`
        <html>
        <head>
            <title>Informações Recebidas</title>
        </head>
        <body>
            <h1>Informações Enviadas</h1>
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>Data de Nascimento:</strong> ${dataNascimento}</p>
            <p><strong>Nickname:</strong> ${nickname}</p>
            <a href="/">Voltar ao Menu</a>
        </body>
        </html>
    `);
});

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});
