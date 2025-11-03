const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

let mensagens = [];

// ➕ Salvar mensagem
app.post("/salvar/mensagem", (req, res) => {
  const mensagem = req.body;

  // cada mensagem terá um ID único
  mensagem.id = Date.now();
  mensagem.horario = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  mensagens.push(mensagem);
  res.json({ status: "OK" });
});

// 📩 Obter mensagens (todas ou filtradas por usuário)
app.get("/obter/mensagens", (req, res) => {
  const usuario = req.query.usuario;
  if (!usuario) {
    return res.status(400).json({ erro: "Usuário não informado" });
  }

  const filtradas = mensagens.filter(
    (m) => m.de === usuario || m.para === usuario
  );

  res.json(filtradas);
});

// 🗑️ Limpar conversa entre dois usuários
app.delete("/apagar/conversa", (req, res) => {
  const { usuario1, usuario2 } = req.query;

  if (!usuario1 || !usuario2) {
    return res.status(400).json({ erro: "Usuários não informados" });
  }

  mensagens = mensagens.filter(
    (m) =>
      !(
        (m.de === usuario1 && m.para === usuario2) ||
        (m.de === usuario2 && m.para === usuario1)
      )
  );

  res.json({ status: "Conversa apagada" });
});

// 🔁 Rota padrão
app.get("/", (req, res) => {
  res.send("Painel de bate-papo ativo 💬");
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000 🚀");
});

module.exports = app;
