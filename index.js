const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();

// Simulação de banco de dados de usuários e mensagens
const users = [];
const messages = [];

// Middleware
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Sessões
app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1800000 } // Sessão expira em 30 minutos
}));

// Rota para o caminho raiz
app.get('/', (req, res) => {
  res.redirect('/login');  // Redireciona para a página de login
});

// Rota de Login
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login</title>
    </head>
    <body>
      <h1>Login</h1>
      <form action="/login" method="POST">
        <label for="name">Nome</label>
        <input type="text" name="name" required />
        <label for="password">Senha</label>
        <input type="password" name="password" required />
        <button type="submit">Entrar</button>
      </form>
    </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  const { name, password } = req.body;
  // Verifica se o nome é 'admin' e a senha é '123'
  if (name === 'admin' && password === '123') {
    req.session.user = { name }; // Salva o nome do usuário na sessão
    res.cookie('last_access', new Date().toISOString()); // Armazena a última vez que o usuário acessou
    return res.redirect('/menu');
  }
  res.send('Credenciais inválidas');
});

// Rota de Menu (após login)
app.get('/menu', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Menu</title>
    </head>
    <body>
      <h2>Bem-vindo ao sistema, ${req.session.user.name}</h2>
      <p>Último acesso: ${req.cookies.last_access || 'Nenhum acesso registrado'}</p>
      <a href="/register">Cadastro de Usuários</a> | 
      <a href="/chat">Bate-papo</a> | 
      <a href="/logout">Sair</a>
    </body>
    </html>
  `);
});

// Rota de Cadastro
app.get('/register', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cadastro de Usuários</title>
    </head>
    <body>
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
    </body>
    </html>
  `);
});

app.post('/register', (req, res) => {
  const { name, dob, nickname } = req.body;
  if (!name || !dob || !nickname) return res.send('Todos os campos são obrigatórios');
  users.push({ name, dob, nickname });
  res.redirect('/register');
});

// Rota de Bate-papo
app.get('/chat', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bate-papo</title>
    </head>
    <body>
      <h1>Bate-papo</h1>
      
      <form action="/sendMessage" method="POST">
        <label for="user">Usuário</label>
        <select name="user" required>
          ${users.map(user => `<option value="${user.nickname}">${user.name}</option>`).join('')}
        </select>

        <label for="message">Mensagem</label>
        <textarea name="message" required></textarea>

        <button type="submit">Enviar</button>
      </form>

      <h3>Mensagens:</h3>
      <ul>
        ${messages.map(msg => `<li><strong>${msg.user}</strong>: ${msg.message} <em>${msg.timestamp}</em></li>`).join('')}
      </ul>
    </body>
    </html>
  `);
});

app.post('/sendMessage', (req, res) => {
  const { user, message } = req.body;
  if (!user || !message) return res.send('Preencha todos os campos');
  const timestamp = new Date().toISOString();
  messages.push({ user, message, timestamp });
  res.redirect('/chat');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Erro ao fazer logout');
    }
    res.clearCookie('last_access');
    res.redirect('/login');
  });
});

// Iniciar servidor na porta 5001
app.listen(5001, () => {
  console.log('Servidor iniciado em http://localhost:5001');
});
