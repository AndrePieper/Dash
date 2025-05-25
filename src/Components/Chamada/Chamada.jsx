import React, { useEffect, useState } from "react";
import { decodeJwt } from "jose";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Alert, Card, CardContent } from "@mui/material";
import { FaEdit } from "react-icons/fa";
import "./Chamada.css";

const Chamada = () => {
  const [chamadas, setChamadas] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMensagemErro("Token não encontrado. Faça login novamente.");
      return;
    }

    let idProfessor = null;
    try {
      const decoded = decodeJwt(token);
      idProfessor = decoded.id;
    } catch (error) {
      setMensagemErro("Erro ao decodificar o token.");
      console.error(error.message);
      return;
    }

    fetch(`https://projeto-iii-4.vercel.app/chamadas/professor/${idProfessor}`, {
      headers: {
        Authorization: token,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao buscar as chamadas.");
        }
        return response.json();
      })
      .then((data) => {
        setChamadas(data.reverse().slice(0, 9));
      })
      .catch((error) => {
        setMensagemErro(error.message);
        console.error(error.message);
      });
  }, []);

  const handleEditarChamada = (id) => {
    navigate(`/editar-chamada/${id}`);
  };

  const handleNovaChamada = () => {
    navigate("/gerar-chamada");
  };

  return (
    <div className="tela-chamadas">
      <Typography className="titulo" variant="h4" gutterBottom>
        Chamadas Antigas
      </Typography>

      {mensagemErro && (
        <Alert className="mensagem-erro" severity="error">
          {mensagemErro}
        </Alert>
      )}

      {chamadas.length === 0 && !mensagemErro && (
        <Typography variant="body1">Nenhuma chamada encontrada.</Typography>
      )}

      {chamadas.length > 0 && (
        <div className="grid">
          {chamadas.map((chamada) => (
            <Card key={chamada.id} className="card">
              <CardContent>
                <Typography className="cardTexto">
                  <strong>{chamada.descricao}</strong>
                </Typography>
                <Typography variant="body2">
                  <strong>Número:</strong> {chamada.id}
                </Typography>
                <Typography variant="body2">
                  <strong>Data:</strong>{" "}
                  {new Date(chamada.data_hora_inicio).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Hora de Início:</strong>{" "}
                  {new Date(chamada.data_hora_inicio).toLocaleTimeString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Hora de Fechamento:</strong>{" "}
                  {new Date(chamada.data_hora_final).toLocaleTimeString()}
                </Typography>
                <Button
                  className="botao-editar"
                  variant="outlined"
                  startIcon={<FaEdit />}
                  onClick={() => handleEditarChamada(chamada.id)}
                >
                  Editar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button
        className="botaoPadrao"
        variant="contained"
        onClick={handleNovaChamada}
      >
        Nova Chamada
      </Button>
    </div>
  );
};

export default Chamada;
