import React, { useEffect, useState } from "react";
import { decodeJwt } from "jose";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Alert, Card, CardContent } from "@mui/material";
import "./Chamada.css";

const Chamada = () => {
  const [chamadas, setChamadas] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    let idProfessor = null;
    try {
      const decoded = decodeJwt(token);
      idProfessor = decoded.id;
    } catch (error) {
      setMensagemErro("Erro ao decodificar o token.");
      console.error(error.message);
      return;
    }

    const url = `https://projeto-iii-4.vercel.app/chamadas/professor/?id_professor=${idProfessor}`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    fetch(url, { headers })
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
        console.error("❌ Erro na requisição:", error.message);
      });
  }, []);

  const handleNovaChamada = () => {
    navigate("/novachamada");
  };

  return (
    <div className="tela-chamadas">
      <div className="header-chamadas">
        <h2>Chamadas Antigas</h2>
      </div>

      {mensagemErro && (
        <Alert className="mensagem-erro" severity="error">
          {mensagemErro}
        </Alert>
      )}

      {chamadas.length === 0 && !mensagemErro && (
        <Typography variant="body1">Nenhuma chamada encontrada.</Typography>
      )}

      {chamadas.length > 0 && (
        <div className="lista-cards">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <button className="botao-adicionar" onClick={handleNovaChamada} title="Nova Chamada">
        +
      </button>
    </div>
  );
};

export default Chamada;
