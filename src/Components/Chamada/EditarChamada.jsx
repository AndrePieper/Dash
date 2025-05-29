import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Modal,
  Box,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
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
  const { id } = useParams(); // id da chamada
  const location = useLocation();
  const { id_disciplina } = location.state || {};

  const [alunosPresentes, setAlunosPresentes] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [alunosFaltantes, setAlunosFaltantes] = useState([]);
  const [alunosSelecionados, setAlunosSelecionados] = useState([]);
  const [alunoParaRemover, setAlunoParaRemover] = useState(null);
  const [modalRemocaoOpen, setModalRemocaoOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!id) {
      setMensagemErro("ID da chamada não foi fornecido.");
      return;
    }

    fetch(`https://projeto-iii-4.vercel.app/chamada/alunos/?id_chamada=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar alunos da chamada.");
        return res.json();
      })
      .then((data) => {
        setAlunosPresentes(data);
        setMensagemErro("");
      })
      .catch((err) => {
        setMensagemErro(err.message);
        console.error(err);
      });
  }, [id]);

  const confirmarRemocaoAluno = () => {
  if (!alunoParaRemover) return;
  const token = localStorage.getItem("token");

  console.log("Removendo aluno com os dados:");
  console.log("id_chamada:", id);
  console.log("id_aluno:", alunoParaRemover.id_aluno);

  fetch(
    `https://projeto-iii-4.vercel.app/chamada/alunos/remover?id_chamada=${id}&id_aluno=${alunoParaRemover.id_aluno}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then(async (res) => {
  if (!res.ok) throw new Error(`Erro ao remover aluno: ${res.status}`);

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }

  return {}; // Caso não tenha corpo JSON
})

    .then(() => {
      setAlunosPresentes((prev) =>
        prev.filter((a) => a.id_aluno !== alunoParaRemover.id_aluno)
      );
      setModalRemocaoOpen(false);
      setAlunoParaRemover(null);
    })
    .catch((err) => {
      setMensagemErro(err.message);
      console.error("Erro na remoção do aluno:", err);
      setModalRemocaoOpen(false);
    });
};



  const abrirModal = () => {
    if (!id_disciplina) {
      setMensagemErro("ID da disciplina (turma) não fornecido.");
      return;
    }

    const token = localStorage.getItem("token");
    fetch(
      `https://projeto-iii-4.vercel.app/chamada/falta?id_disciplina=${id_disciplina}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar alunos faltantes.");
        return res.json();
      })
      .then((data) => {
        setAlunosFaltantes(data);
        setAlunosSelecionados([]);
        setMensagemErro("");
        setModalOpen(true);
      })
      .catch((err) => {
        setMensagemErro(err.message);
        console.error(err);
      });
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

    const token = localStorage.getItem("token");

    Promise.all(
      alunosSelecionados.map((id_aluno) =>
        fetch("https://projeto-iii-4.vercel.app/chamada/alunos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id_chamada: id, id_aluno }),
        }).then((res) => {
          if (!res.ok)
            throw new Error(`Erro ao adicionar aluno ID ${id_aluno}`);
          return res.json();
        })
      )
    )
      .then(() => {
        const novosAlunos = alunosFaltantes.filter((a) =>
          alunosSelecionados.includes(a.id_aluno)
        );
        setAlunosPresentes((prev) => [...prev, ...novosAlunos]);
        setMensagemErro("");
        setModalOpen(false);
      })
      .catch((err) => {
        setMensagemErro(err.message);
        console.error(err);
      });
  };

  return (
    <div className="pagina-padrao">
      <header className="header-verde">
        <h2>Editar Chamada</h2>
      </header>

      {mensagemErro && <p style={{ color: "red" }}>{mensagemErro}</p>}

      <Typography variant="h6" gutterBottom>
        Alunos Presentes:
      </Typography>

      <List>
        {alunosPresentes.map((aluno) => (
          <div key={aluno.id_aluno}>
            <ListItem
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => {
                    setAlunoParaRemover(aluno);
                    setModalRemocaoOpen(true);
                  }}
                  aria-label={`Remover ${aluno.Aluno.nome}`}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={aluno.Aluno.nome} />
            </ListItem>
            <Divider />
          </div>
        ))}
      </List>

      <Button
        variant="contained"
        color="success"
        startIcon={<AddIcon />}
        style={{ marginTop: "20px" }}
        onClick={abrirModal}
      >
        Adicionar Aluno
      </Button>

      {/* Modal para adicionar alunos */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={styleModal}>
          <Typography variant="h6" gutterBottom>
            Selecione alunos para adicionar:
          </Typography>

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
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="contained" color="primary" onClick={adicionarAlunos}>
              Adicionar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal de confirmação de remoção */}
      <Modal open={modalRemocaoOpen} onClose={() => setModalRemocaoOpen(false)}>
        <Box sx={styleModal}>
          <Typography variant="h6" gutterBottom>
            Deseja remover a presença do aluno{" "}
            <strong>{alunoParaRemover?.Aluno?.nome}</strong>?
          </Typography>

          <Box mt={2} display="flex" justifyContent="space-between">
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setModalRemocaoOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmarRemocaoAluno}
            >
              Remover
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default EditarChamada;
