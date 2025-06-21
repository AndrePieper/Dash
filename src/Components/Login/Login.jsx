import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, CircularProgress, Container } from "@mui/material";
import logo from "/src/assets/grupo-fasipe.png";
import { isMobile } from "react-device-detect";
import "./Login.css";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const navegar = useNavigate();

  const Logar = async (evento) => {
  evento.preventDefault();
  setCarregando(true);
  setMensagemErro("");

  const credenciais = { email: usuario, senha };

  try {
    const resposta = await fetch("https://projeto-iii-4.vercel.app/login/dash", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credenciais),
    });

    setCarregando(false);

    if (!resposta.ok) {
      const erro = await resposta.json();
      throw new Error(erro.message || "Erro desconhecido. Contate o suporte.");
    }

    const dados = await resposta.json();
    const tokenPartes = dados.token?.split(".");
    let tipoUsuario = null;

    if (tokenPartes?.length === 3) {
      const payload = JSON.parse(atob(tokenPartes[1]));
      localStorage.setItem("tipo", payload.tipo);
      localStorage.setItem("id_professor", payload.id);
      tipoUsuario = payload.tipo;
    }

    localStorage.setItem("token", dados.token);

    // Redirecionamento com base no tipo de dispositivo
    if (isMobile) {
      navegar("/materiasmobile");
    } else {
      if (tipoUsuario === 1) {
        navegar("/home");
      } else if (tipoUsuario === 2) {
        navegar("/homeadm");
      }
    }
  } catch (erro) {
    setCarregando(false);
    setMensagemErro(erro.message);
  }
};


  return (
    <Container maxWidth="xs" className="conteiner">
      <img src={logo} alt="Logo do Grupo Fasipe" className="logo" />
      <Box component="form" onSubmit={Logar} className="formulario">
        <TextField
          label="Usuário"
          variant="outlined"
          fullWidth
          required
          margin="normal"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />
        <TextField
          label="Senha"
          type="password"
          variant="outlined"
          fullWidth
          required
          margin="normal"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={carregando}
          className="btn-verde-login"
        >
          {carregando ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
        </Button>
        {mensagemErro && (
          <Typography className="erro">
            {mensagemErro}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Login;
