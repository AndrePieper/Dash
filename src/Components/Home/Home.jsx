import { useEffect, useState } from "react";
import {
  Box,
  Typography,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FaPlus } from "react-icons/fa";
import ModaisChamada from "../Chamada/ModaisChamada"; // ajuste o caminho se precisar
import "./Home.css";

const Home = () => {
  const [nome, setNome] = useState("");
  const [chamadas, setChamadas] = useState([]);

  // Estados e funções para modal e matérias
  const [abrirModalSelecionarMateria, setAbrirModalSelecionarMateria] = useState(false);
  const [materias, setMaterias] = useState([]);
  const [carregandoMaterias, setCarregandoMaterias] = useState(false);

  const abrirModalMatérias = () => {
    setAbrirModalSelecionarMateria(true);
    buscarMaterias();
  };

  const buscarMaterias = () => {
    const token = localStorage.getItem("token");
    const idProfessor = localStorage.getItem("id_professor");

    if (!token || !idProfessor) return;

    setCarregandoMaterias(true);
    fetch(`https://projeto-iii-4.vercel.app/semestre/professor/?id_professor=${idProfessor}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setMaterias(data);
        setCarregandoMaterias(false);
      })
      .catch(() => setCarregandoMaterias(false));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const idProfessor = localStorage.getItem("id_professor");

    if (token && idProfessor) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setNome(payload.nome || "Usuário");

        fetch(
          `https://projeto-iii-4.vercel.app/chamadas/professor/?id_professor=${idProfessor}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
          .then((res) => res.json())
          .then((data) => setChamadas(data.slice(0, 10)))
          .catch((err) =>
            console.error("Erro ao buscar chamadas:", err)
          );
      } catch (e) {
        console.error("Erro ao decodificar token:", e);
      }
    }
  }, []);

  const agruparChamadas = (chamadas) => {
    const porDia = {};
    const porMes = {};
    const porMateria = {};

    chamadas.forEach((c) => {
      const data = new Date(c.data_hora_inicio);
      const diaSemana = data.toLocaleDateString("pt-BR", {
        weekday: "short",
      });
      const mes = data.toLocaleDateString("pt-BR", {
        month: "short",
      });
      const materia = c.descricao || "—";

      porDia[diaSemana] = (porDia[diaSemana] || 0) + 1;
      porMes[mes] = (porMes[mes] || 0) + 1;
      porMateria[materia] = (porMateria[materia] || 0) + 1;
    });

    const toDataArray = (obj) =>
      Object.entries(obj).map(([name, total]) => ({ name, total }));

    return {
      porDia: toDataArray(porDia),
      porMes: toDataArray(porMes),
      porMateria: toDataArray(porMateria),
    };
  };

  const agrupado = agruparChamadas(chamadas);

  return (
    <Box className="home-container">
      <Box className="menu-lateral-placeholder" />
      <Box className="home-content">
        <Typography variant="h4" className="welcome">
          Olá, {nome}!
        </Typography>

        <Box className="cards-container">
          <Box className="card">
            <Typography variant="subtitle1">Aulas por Dia</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agrupado.porDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#2e7d32" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Box className="card">
            <Typography variant="subtitle1">Aulas por Mês</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agrupado.porMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#2e7d32" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Box className="card">
            <Typography variant="subtitle1">Aulas por Matéria</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agrupado.porMateria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#2e7d32" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Botão de adicionar igual ao da tela Chamada */}
        <Box
          sx={{
            marginTop: 3,
            marginBottom: 1,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            className="botao-adicionar"
            onClick={abrirModalMatérias}
            title="Nova Chamada"
            style={{
              backgroundColor: "#2e7d32",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FaPlus />
            Nova Chamada
          </button>
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
                className={`linha ${
                  index % 2 === 0 ? "linha-par" : "linha-impar"
                }`}
                key={index}
              >
                <Box className="coluna disciplina">
                  {chamada.descricao || "—"}
                </Box>
                <Box className="coluna hora">
                  {new Date(
                    chamada.data_hora_inicio
                  ).toLocaleString()}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Modal para criar nova chamada */}
        <ModaisChamada
          abrirModalSelecionarMateria={abrirModalSelecionarMateria}
          setAbrirModalSelecionarMateria={setAbrirModalSelecionarMateria}
          // passe os props que você usa dentro do ModaisChamada, ex:
          materias={materias}
          carregandoMaterias={carregandoMaterias}
          // adicione aqui outros props se necessário
        />
      </Box>
    </Box>
  );
};

export default Home;
