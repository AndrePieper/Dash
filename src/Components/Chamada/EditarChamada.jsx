import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import "./EditarChamada.css";

const EditarChamada = () => {
  const { id } = useParams();
  const [alunosPresentes, setAlunosPresentes] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`https://projeto-iii-4.vercel.app/chamada/alunos?id_chamada=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar alunos.");
        return res.json();
      })
      .then((data) => setAlunosPresentes(data))
      .catch((err) => setMensagemErro(err.message));
  }, [id]);

  const removerAluno = (id_aluno) => {
    const token = localStorage.getItem("token");
    fetch("https://projeto-iii-4.vercel.app/chamada/remover", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id_chamada: id, id_aluno }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao remover aluno.");
        return res.json();
      })
      .then(() => {
        setAlunosPresentes((prev) => prev.filter((a) => a.id !== id_aluno));
      })
      .catch((err) => setMensagemErro(err.message));
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
          <div key={aluno.id}>
            <ListItem
              secondaryAction={
                <IconButton edge="end" onClick={() => removerAluno(aluno.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={aluno.nome} secondary={`RA: ${aluno.ra}`} />
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
        onClick={() => alert("Abrir modal para adicionar aluno")}
      >
        Adicionar Aluno
      </Button>
    </div>
  );
};

export default EditarChamada;
