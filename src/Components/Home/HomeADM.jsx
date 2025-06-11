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
import "./Home.css";

const Home = () => {
  const [nome, setNome] = useState("");
  const [chamadas, setChamadas] = useState([]);
   const [info, setInfo] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const idProfessor = localStorage.getItem("id_professor");

    if (token && idProfessor) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setNome(payload.nome || "Usuário");

        fetch(
          `https://projeto-iii-4.vercel.app/chamadas`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
          .then((res) => res.json())
          .then((data) => {
            setChamadas(data.slice(0, 10));
            setInfo(data.slice(0, 10000))
          })
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

    info.forEach((c) => {
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

    // Define a ordem dos dias manualmente
    const ordemDias = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."]; 

    const porDiaOrdenado = ordemDias
      .filter((dia) => porDia[dia] !== undefined)
      .map((dia) => ({ name: dia, total: porDia[dia] }));

      // Ordem manual dos meses
    const ordemMeses = [
        "jan.", "fev.", "mar.", "abr.", "mai.", "jun.",
        "jul.", "ago.", "set.", "out.", "nov.", "dez."
    ];
    const porMesOrdenado = ordemMeses
        .filter(mes => porMes[mes] !== undefined)
        .map(mes => ({ name: mes, total: porMes[mes] }));

    return {
      porDia: porDiaOrdenado,
      porMes: porMesOrdenado,
      porMateria: toDataArray(porMateria),
    };
  };

  const agrupado = agruparChamadas(info);

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

        <Box className="lista-chamadas">
          <Typography variant="h6" className="titulo-chamadas">
            Últimas Chamadas
          </Typography>

          <Box className="tabela-chamadas">
            <Box className="linha tabela-cabecalho">
              <Box className="coluna professor">Professor</Box>
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
                <Box className="coluna professor">
                  {chamada.nome || "—"}
                </Box>
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
      </Box>
    </Box>
  );
};

export default Home;
