
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');


const app = express();


const users = [];
const messages = [];


app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


app.use(
    session({
        secret: 'secret_key',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 1800000 }, 
    })
);


const commonStyles = `
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background-color: black;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            background-color: #0f0f0f;
            border: 2px solid green;
            border-radius: 8px;
            padding: 20px;
            width: 100%;
            max-width: 400px;
            text-align: center;
            box-shadow: 0px 0px 10px green;
        }
        input, button, select, textarea {
            width: calc(100% - 20px);
            margin: 10px 0;
            padding: 10px;
            border: 1px solid green;
            border-radius: 4px;
            background-color: black;
            color: white;
        }
        button {
            cursor: pointer;
            font-weight: bold;
        }
        ul {
            list-style: none;
            padding: 0;
        }
    </style>
`;


app.get('/', (req, res) => {
    res.redirect('/login'); 
});


app.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login</title>
            ${commonStyles}
        </head>
        <body>
            <div class="container">
                <h1>Login</h1>
                <form action="/login" method="POST">
                    <label for="name">Nome</label>
                    <input type="text" name="name" required />
                    <label for="password">Senha</label>
                    <input type="password" name="password" required />
                    <button type="submit">Entrar</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/login', (req, res) => {
    const { name, password } = req.body;
    if (name === 'admin' && password === '123') {
        req.session.user = { name };
        res.cookie('last_access', new Date().toISOString());
        return res.redirect('/menu');
    }
    res.status(401).send('Credenciais inválidas');
});


app.get('/menu', (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    res.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Menu</title>
            ${commonStyles}
        </head>
        <body>
            <div class="container">
                <h2>Bem-vindo, ${req.session.user.name}</h2>
                <p>Último acesso: ${req.cookies.last_access || 'Nenhum acesso registrado'}</p>
                <button onclick="window.location.href='/register'">Cadastro de Usuários</button>
                <button onclick="window.location.href='/chat'">Bate-papo</button>
                <button onclick="window.location.href='/logout'">Sair</button>
            </div>
        </body>
        </html>
    `);
});


app.get('/register', (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    res.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cadastro de Usuários</title>
            ${commonStyles}
        </head>
        <body>
            <div class="container">
                <h1>Cadastrar Novo Usuário</h1>
                <form action="/register" method="POST">
                    <label for="name">Nome</label>
                    <input type="text" name="name" required />
                    <label for="dob">Data de Nascimento</label>
                    <input type="date" name="dob" required />
                    <label for="nickname">Nickname</label>
                    <input type="text" name="nickname" required />
                    <button type="submit">Cadastrar</button>
                </form>
                <h3>Usuários cadastrados:</h3>
                <ul>
                    ${users.map(user => `<li>${user.name} (${user.nickname})</li>`).join('')}
                </ul>
                <button onclick="window.location.href='/menu'">Voltar ao Menu</button>
            </div>
        </body>
        </html>
    `);
});

app.post('/register', (req, res) => {
    const { name, dob, nickname } = req.body;
    if (!name || !dob || !nickname) return res.status(400).send('Todos os campos são obrigatórios');
    users.push({ name, dob, nickname });
    res.redirect('/register');
});


app.get('/chat', (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    res.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bate-papo</title>
            ${commonStyles}
        </head>
        <body>
            <div class="container">
                <h1>Bate-papo</h1>
                <form action="/sendMessage" method="POST">
                    <label for="user">Usuário</label>
                    <select name="user" required>
                        ${users.map(user => `<option value="${user.nickname}">${user.nickname}</option>`).join('')}
                    </select>
                    <label for="message">Mensagem</label>
                    <textarea name="message" required></textarea>
                    <button type="submit">Enviar</button>
                </form>
                <h3>Mensagens:</h3>
                <ul>
                    ${messages.map(msg => `<li><strong>${msg.user}</strong>: ${msg.message} <em>${msg.timestamp}</em></li>`).join('')}
                </ul>
                <button onclick="window.location.href='/menu'">Voltar ao Menu</button>
            </div>
        </body>
        </html>
    `);
});

app.post('/sendMessage', (req, res) => {
    const { user, message } = req.body;
    if (!user || !message) return res.status(400).send('Preencha todos os campos');
    const timestamp = new Date().toISOString();
    messages.push({ user, message, timestamp });
    res.redirect('/chat');
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send('Erro ao fazer logout');
        res.clearCookie('last_access');
        res.redirect('/login');
    });
});


const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
