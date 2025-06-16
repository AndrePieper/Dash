import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Typography,
  Button,
  List,
  ListItem,
  IconButton,
  Divider,
  Modal,
  Box,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "/src/assets/grupo-fasipe.png";
import "./EditarChamada.css";

const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: "80vh",
  overflowY: "auto",
};

const EditarChamada = () => {
  const { id } = useParams();
  const location = useLocation();
  const { id_disciplina } = location.state || {};

  const [alunosPresentes, setAlunosPresentes] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [alunosFaltantes, setAlunosFaltantes] = useState([]);
  const [alunosSelecionados, setAlunosSelecionados] = useState([]);
  const [alunoParaRemover, setAlunoParaRemover] = useState(null);
  const [modalRemocaoOpen, setModalRemocaoOpen] = useState(false);

  const [nomeProfessor, setNomeProfessor] = useState(null);

  const [paginaAtual, setPaginaAtual] = useState(1);

  let registrosPorPagina; 
  if (screen.height >= 769 && screen.height <= 1079) {
    registrosPorPagina = 7
  } else if (screen.height >= 1079 && screen.height <= 1200) {
    registrosPorPagina = 9
  } else if (screen.height > 1200) {
    registrosPorPagina = 10
  } else if (screen.height < 769){
    registrosPorPagina = 5
  }

  const totalPaginas = Math.ceil(alunosPresentes.length / registrosPorPagina);
  const alunosPaginados = alunosPresentes.slice(
    (paginaAtual - 1) * registrosPorPagina,
    paginaAtual * registrosPorPagina
  );

  const token = localStorage.getItem("token");

  useEffect(() => {

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.nome) {
          setNomeProfessor(payload.nome);
          localStorage.setItem("nome_professor", payload.nome);
        }
      } catch (e) {
        console.error("Erro ao decodificar token para nome do professor:", e);
      }
    }
  }, [token]);
  const [chamadaInfo, setChamadaInfo] = useState(null);

  useEffect(() => {
  if (id && token) {
    buscarChamada();
  }
}, [id, token]);


const buscarChamada = () => {
  fetch(`https://projeto-iii-4.vercel.app/chamadas/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erro ao buscar informações da chamada.");
      return res.json();
    })
    .then((data) => {
  console.log("📦 Dados da chamada recebidos:", data);

  const dataHoraInicio = new Date(data.data_hora_inicio);
  const dataHoraFim = new Date(data.data_hora_final);

  const formatarData = (data) => {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const formatarHora = (data) => {
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    const segundo = String(data.getSeconds()).padStart(2, '0');
    return `${hora}:${minuto}:${segundo}`;
  };

  const dataFormatada = formatarData(dataHoraInicio);
  const horaInicio = formatarHora(dataHoraInicio);
  const horaFim = formatarHora(dataHoraFim);

  console.log("📆 Data formatada:", dataFormatada);
  console.log("⏰ Hora início:", horaInicio);
  console.log("⏱️ Hora fim:", horaFim);

  setChamadaInfo({
    ...data,
    dataFormatada,
    horaInicio,
    horaFim,
  });
})

    .catch((err) => setMensagemErro(err.message));
};



  const buscarAlunosPresentes = () => {
    fetch(`https://projeto-iii-4.vercel.app/chamada/presencas/?id_chamada=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar alunos da chamada.");
        return res.json();
      })
      .then(setAlunosPresentes)
      .catch((err) => setMensagemErro(err.message));
  };

  useEffect(() => {
    if (!id) {
      setMensagemErro("ID da chamada não foi fornecido.");
      return;
    }
    buscarAlunosPresentes();
  }, [id]);

  const confirmarRemocaoAluno = () => {
    if (!alunoParaRemover) return;

    fetch(
      `https://projeto-iii-4.vercel.app/chamada/alunos/remover?id_chamada=${id}&id_aluno=${alunoParaRemover.id_aluno}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ao remover aluno: ${res.status}`);
        return res.json();
      })
      .then(() => {
        setAlunosPresentes((prev) =>
          prev.map((aluno) =>
            aluno.id_aluno === alunoParaRemover.id_aluno
              ? { ...aluno, status: 0 }
              : aluno
          )
        );
        setModalRemocaoOpen(false);
        setAlunoParaRemover(null);
        buscarAlunosPresentes();
      })
      .catch((err) => {
        setMensagemErro(err.message);
        setModalRemocaoOpen(false);
      });
  };

  const abrirModal = () => {
    if (!id_disciplina) {
      setMensagemErro("ID da disciplina (turma) não fornecido.");
      return;
    }

    fetch(`https://projeto-iii-4.vercel.app/chamada/falta?id_disciplina=${id_disciplina}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar alunos faltantes.");
        return res.json();
      })
      .then((data) => {
        const alunosOrdenados = [...data].sort((a, b) => a.nome.localeCompare(b.nome));
        setAlunosFaltantes(alunosOrdenados);
        setAlunosSelecionados([]);
        setModalOpen(true);
      })
      .catch((err) => setMensagemErro(err.message));
  };

  const toggleAlunoSelecionado = (id_aluno) => {
    setAlunosSelecionados((prev) =>
      prev.includes(id_aluno)
        ? prev.filter((id) => id !== id_aluno)
        : [...prev, id_aluno]
    );
  };

  const adicionarAlunos = () => {
    if (alunosSelecionados.length === 0) {
      alert("Selecione pelo menos um aluno.");
      return;
    }

    Promise.all(
      alunosSelecionados.map((id_aluno) =>
        fetch("https://projeto-iii-4.vercel.app/chamada/alunos/manual", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id_chamada: id, id_aluno }),
        }).then(async (res) => {
          if (res.ok) {
            return res.json();
          } else if (res.status === 409) {
            // Aluno já está na chamada, segue o fluxo
            return null;
          } else {
            throw new Error(`Erro ao adicionar aluno ID ${id_aluno}`);
          }
        })
      )
    )
      .then(() => {
        const novos = alunosFaltantes.filter((a) =>
          alunosSelecionados.includes(a.id_aluno)
        );
        const novosFormatados = novos.map((a) => ({
          id_aluno: a.id_aluno,
          status: 1,
          Aluno: { nome: a.nome },
        }));

        setAlunosPresentes((prev) => {
          const atualizados = [...prev];
          novosFormatados.forEach((novo) => {
            const existe = atualizados.find((a) => a.id_aluno === novo.id_aluno);
            if (!existe) atualizados.push(novo);
          });
          return [...atualizados];
        });

        setModalOpen(false);
        buscarAlunosPresentes();
      })
      .catch((err) => setMensagemErro(err.message));
  };

const imprimirChamada = () => {
  if (!nomeProfessor) {
    alert("Nome do professor não está disponível. Aguarde o carregamento e tente novamente.");
    return;
  }

  if (!chamadaInfo) {
    alert("Informações da chamada não foram carregadas. Tente novamente.");
    return;
  }

  const doc = new jsPDF();
  const img = new Image();
  img.src = logo;

  // Usa diretamente os dados da chamadaInfo
  const dataHoraInicio = chamadaInfo.data_hora_inicio ? new Date(chamadaInfo.data_hora_inicio) : null;
  const dataHoraFim = chamadaInfo.data_hora_final ? new Date(chamadaInfo.data_hora_final) : null;

  const dataFormatada = dataHoraInicio
    ? dataHoraInicio.toLocaleDateString("pt-BR")
    : "";

  const horaInicio = dataHoraInicio
    ? dataHoraInicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "";

  const horaFim = dataHoraFim
    ? dataHoraFim.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "";

  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const logoBase64 = canvas.toDataURL("image/png");

    doc.addImage(logoBase64, "PNG", 10, 10, 60, 25);

    doc.setFontSize(16);
    doc.text(`Relatório da Chamada nº ${chamadaInfo.id || ""}`, 80, 20);

    doc.setFontSize(12);
    doc.text(`Professor: ${nomeProfessor || ""}`, 80, 30);
    doc.text(`Data: ${dataFormatada}`, 80, 36);
    doc.text(`Início: ${horaInicio}`, 80, 42);
    doc.text(`Fim: ${horaFim}`, 80, 48);

    let startY = 60;
    doc.setFontSize(14);
    doc.text("Alunos Presentes", 14, startY);

    const presentesData = alunosPresentes
      .filter((aluno) => aluno.status === 1)
      .map((aluno) => [aluno.id_aluno, aluno.Aluno.nome]);

    autoTable(doc, {
      startY: startY + 4,
      head: [["ID", "Nome"]],
      body: presentesData,
      styles: { fontSize: 11, halign: "center", valign: "middle" },
      headStyles: {
        fillColor: [46, 125, 50],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
      },
    });

    doc.save(`chamada_${chamadaInfo.id}.pdf`);
  };

  img.onerror = () => {
    alert("Erro ao carregar a imagem da logo.");
  };
};

  return (
    <div className="pagina-padrao">
      <header className="header-verde">
        <h2>Editar Chamada</h2>
      </header>

      {mensagemErro && <p style={{ color: "red" }}>{mensagemErro}</p>}

      <Typography variant="h6">Alunos Presentes:</Typography>
      <List>
        {alunosPaginados.map((aluno) => (
          <div key={aluno.id_aluno}>
            <ListItem>
              <Box display="flex" justifyContent="space-between" width="100%">
                
                <Typography
                  style={{ width: '300px' }}
                >
                  {aluno.Aluno.nome}
                </Typography>
                <Typography
                  style={{ width: 100, textAlign: "center" }}
                  color={aluno.status === 1 ? "green" : "gray"}
                >
                  {aluno.status === 1 ? "Presente" : "Removido"}
                </Typography>

                {aluno.status === 1 && (
                  <IconButton
                    edge="end"
                    onClick={() => {
                      setAlunoParaRemover(aluno);
                      setModalRemocaoOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            </ListItem>
            <Divider />
          </div>
        ))}
      </List>

      <Box display="flex" justifyContent="center" mt={2} gap={2}>
        <Button
          variant="outlined"
          disabled={paginaAtual === 1}
          onClick={() => setPaginaAtual(paginaAtual - 1)}
        >
          Anterior
        </Button>
        <Typography style={{ display: "flex", alignItems: "center" }}>
          Página {paginaAtual} de {totalPaginas}
        </Typography>
        <Button
          variant="outlined"
          disabled={paginaAtual === totalPaginas}
          onClick={() => setPaginaAtual(paginaAtual + 1)}
        >
          Próxima
        </Button>
      </Box>

      <Button
        variant="contained"
        color="success"
        startIcon={<AddIcon />}
        style={{ marginTop: "20px" }}
        onClick={abrirModal}
      >
        Adicionar Aluno
      </Button>
      {/* Botão só habilita se nomeProfessor estiver carregado */}
      <Button
        variant="outlined"
        color="primary"
        style={{ marginTop: "10px", marginLeft: "10px" }}
        onClick={imprimirChamada}
        disabled={!nomeProfessor}
        title={!nomeProfessor ? "Aguardando nome do professor carregar" : ""}
      >
        Imprimir Chamada
      </Button>

      {/* Modal de adicionar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={styleModal}>
          <Typography variant="h6">Selecione alunos para adicionar:</Typography>
          {alunosFaltantes.length === 0 && (
            <Typography>Nenhum aluno faltante encontrado.</Typography>
          )}
          {alunosFaltantes.map((aluno) => (
            <FormControlLabel
              key={aluno.id_aluno}
              control={
                <Checkbox
                  checked={alunosSelecionados.includes(aluno.id_aluno)}
                  onChange={() => toggleAlunoSelecionado(aluno.id_aluno)}
                />
              }
              label={aluno.nome}
            />
          ))}
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={adicionarAlunos}>
              Adicionar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal de remover */}
      <Modal open={modalRemocaoOpen} onClose={() => setModalRemocaoOpen(false)}>
        <Box sx={styleModal}>
          <Typography variant="h6">
            Deseja remover a presença do aluno{" "}
            <strong>{alunoParaRemover?.Aluno?.nome}</strong>?
          </Typography>
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button onClick={() => setModalRemocaoOpen(false)}>Cancelar</Button>
            <Button color="error" variant="contained" onClick={confirmarRemocaoAluno}>
              Remover
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default EditarChamada;
