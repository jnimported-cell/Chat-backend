const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json({limit: '10mb'}));

let mensagens = [];

app.post('/save/mensagem', (req, res) => {
  const msg = req.body;
  msg.deletedFor = msg.deletedFor || [];
  mensagens.push(msg);
  res.json({status:'ok'});
});

app.get('/get/mensagens', (req, res) => {
  const user = req.query.user;
  if(!user) return res.status(400).json({error:'user é obrigatório'});
  const filtered = mensagens.filter(m => 
    (m.remetente === user || m.destinatario === user) && 
    !(m.deletedFor.includes(user))
  );
  res.json(filtered);
});

app.post('/delete/mensagem', (req, res) => {
  const { msgId, user } = req.body;
  const msg = mensagens.find(m => m.id === msgId);
  if(msg && !msg.deletedFor.includes(user)) msg.deletedFor.push(user);
  res.json({status:'deleted'});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
