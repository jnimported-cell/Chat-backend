// index.js — backend do chat (com CORS configurado)
const express = require('express');
const cors = require('cors');
const app = express();

// CORS — permite requisições do Lovable e de qualquer origem
app.use(cors({
  origin: '*', // para maior segurança você pode colocar o domínio do Lovable em vez de '*'
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ limit: '20mb' })); // aceita imagens base64 maiores

// Armazenamento simples em memória (funciona para testes)
let mensagens = [];

/**
 * POST /salvar/mensagem
 * body: { de, para, conteudo, tipo? (texto|imagem), timestamp? }
 */
app.post('/salvar/mensagem', (req, res) => {
  const m = req.body || {};
  const msg = {
    id: Date.now().toString() + '-' + Math.floor(Math.random()*10000),
    de: m.de || 'desconhecido',
    para: m.para || null,
    conteudo: m.conteudo || null, // texto ou dataURL se imagem
    tipo: m.tipo || (m.conteudo && m.conteudo.startsWith('data:') ? 'imagem' : 'texto'),
    timestamp: m.timestamp || new Date().toISOString()
  };
  mensagens.push(msg);
  return res.json({ success: true, message: msg });
});

/**
 * GET /obter/mensagens?usuario=Nome
 * Retorna as mensagens onde o usuário é remetente ou destinatário
 */
app.get('/obter/mensagens', (req, res) => {
  const usuario = req.query.usuario;
  if(!usuario) return res.status(400).json({ error: 'usuario é obrigatório' });
  const filtradas = mensagens.filter(m => m.de === usuario || m.para === usuario);
  return res.json(filtradas);
});

/**
 * DELETE /apagar/conversa?usuario1=Nome&usuario2=Nome
 * Apaga todas as mensagens entre os dois (útil para botão "apagar conversa")
 */
app.delete('/apagar/conversa', (req, res) => {
  const u1 = req.query.usuario1;
  const u2 = req.query.usuario2;
  if(!u1 || !u2) return res.status(400).json({ error: 'usuario1 e usuario2 são obrigatórios' });

  mensagens = mensagens.filter(m => !(
    (m.de === u1 && m.para === u2) ||
    (m.de === u2 && m.para === u1)
  ));
  return res.json({ success: true });
});

/**
 * Endpoint de saúde / root
 */
app.get('/', (req, res) => {
  res.send('Servidor de chat ativo 💬');
});

/* Deploy port (Vercel define a porta automaticamente) */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor rodando na porta', PORT));
