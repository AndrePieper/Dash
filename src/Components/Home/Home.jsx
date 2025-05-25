import React, { useEffect, useState } from "react";
import { decodeJwt } from "jose";
import {
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import "./Home.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [chamadas, setChamadas] = useState([]);

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Token não encontrado");
    return;
  }

  let idProfessor;
  try {
    const decoded = decodeJwt(token);
    idProfessor = decoded.id;
  } catch (err) {
    console.error("Erro ao decodificar token");
    return;
  }

  fetch(`https://projeto-iii-4.vercel.app/chamadas/professor?id_professor=${idProfessor}`, {
    headers: {
      Authorization: token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        console.error("Formato de dados inválido:", data);
        return;
      }
      setChamadas(data);
    })
    .catch((err) => console.error(err));
}, []);


  const totalChamadas = chamadas.length;

  const chamadasPorMes = chamadas.reduce((acc, chamada) => {
    const mes = new Date(chamada.data_hora_inicio).getMonth();
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {});

  const dadosChamadasMensais = {
    labels: [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez",
    ],
    datasets: [
      {
        label: "Chamadas por mês",
        data: Array.from({ length: 12 }, (_, i) => chamadasPorMes[i] || 0),
        backgroundColor: "#1976d2",
      },
    ],
  };

  const dadosDistribuicaoChamadas = {
    labels: ["Com faltas", "Sem faltas"],
    datasets: [
      {
        data: [
          chamadas.filter((c) => c.faltas > 0).length,
          chamadas.filter((c) => c.faltas === 0).length,
        ],
        backgroundColor: ["#e53935", "#43a047"],
      },
    ],
  };

  const linhaTempoChamadas = {
    labels: chamadas.map((c) =>
      new Date(c.data_hora_inicio).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Faltas registradas",
        data: chamadas.map((c) => c.faltas || 0),
        borderColor: "#ffa726",
        fill: false,
      },
    ],
  };

  if (loading) return <div className="carregando"><CircularProgress /></div>;

  return (
    <div className="home-container">
      <Typography variant="h4" className="titulo">
        Painel do Professor
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card className="card">
            <CardContent>
              <Typography variant="h6">Total de Chamadas</Typography>
              <Typography variant="h3" color="primary">{totalChamadas}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="card">
            <CardContent>
              <Typography variant="h6">Distribuição de Chamadas</Typography>
              <Pie data={dadosDistribuicaoChamadas} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="card">
            <CardContent>
              <Typography variant="h6">Chamadas por Mês</Typography>
              <Bar data={dadosChamadasMensais} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="card">
            <CardContent>
              <Typography variant="h6">Histórico de Faltas</Typography>
              <Line data={linhaTempoChamadas} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Home;
