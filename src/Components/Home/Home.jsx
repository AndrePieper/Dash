import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import "./Home.css";

const Home = () => {
  const [nome, setNome] = useState("");
  const [chamadas, setChamadas] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const idProfessor = localStorage.getItem("id_professor");

    if (token && idProfessor) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setNome(payload.nome || "Usuário");

        fetch(`https://projeto-iii-4.vercel.app/chamadas/professor/?id_professor=${idProfessor}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => setChamadas(data.slice(0, 10))) // Limitar a 10 registros
          .catch((err) => console.error("Erro ao buscar chamadas:", err));
      } catch (e) {
        console.error("Erro ao decodificar token:", e);
      }
    }
  }, []);

  return (
    <Box className="home-container">
      <Box className="menu-lateral-placeholder" />
      <Box className="home-content">
        <Typography variant="h4" className="welcome">
          Olá, {nome}!
        </Typography>
        <Box className="cards-container">
          <Box className="card">Gráfico 1</Box>
          <Box className="card">Gráfico 2</Box>
          <Box className="card">Gráfico 3</Box>
        </Box>

        <Box className="lista-chamadas">
          <Typography variant="h6" className="titulo-chamadas">
            Últimas Chamadas
          </Typography>

          <Box className="tabela-chamadas">
            <Box className="linha tabela-cabecalho">
              <Box className="coluna disciplina">Disciplina</Box>
              <Box className="coluna hora">Hora</Box>
            </Box>

            {chamadas.map((chamada, index) => (
              <Box
                className={`linha ${index % 2 === 0 ? "linha-par" : "linha-impar"}`}
                key={index}
              >
                <Box className="coluna disciplina">{chamada.descricao || "—"}</Box>
                <Box className="coluna hora">
                  {new Date(chamada.data_hora_inicio).toLocaleString()}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
