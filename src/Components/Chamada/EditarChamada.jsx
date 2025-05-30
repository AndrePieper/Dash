// ... imports
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

  const token = localStorage.getItem("token");

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
        setAlunosFaltantes(data);
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
        }).then((res) => {
          if (!res.ok) throw new Error(`Erro ao adicionar aluno ID ${id_aluno}`);
          return res.json();
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

  return (
    <div className="pagina-padrao">
      <header className="header-verde">
        <h2>Editar Chamada</h2>
      </header>

      {mensagemErro && <p style={{ color: "red" }}>{mensagemErro}</p>}

      <Typography variant="h6">Alunos Presentes:</Typography>
      <List>
        {alunosPresentes.map((aluno) => (
          <div key={aluno.id_aluno}>
            <ListItem>
              <Box display="flex" justifyContent="space-between" width="100%">
                <Typography>{aluno.Aluno.nome}</Typography>
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

      <Button
        variant="contained"
        color="success"
        startIcon={<AddIcon />}
        style={{ marginTop: "20px" }}
        onClick={abrirModal}
      >
        Adicionar Aluno
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
