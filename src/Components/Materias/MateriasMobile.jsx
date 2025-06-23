import React, { useEffect, useState } from "react";
import ModaisChamada from "../Chamada/ModaisChamada";
import { Box, Typography } from "@mui/material";
import { decodeJwt } from "jose";

const MateriasMobile = () => {
  const [materias, setMaterias] = useState([]);
  const [semestre, setSemestre] = useState(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [materiaSelecionada, setMateriaSelecionada] = useState(null);

  const [modalQRCodeAberto, setModalQRCodeAberto] = useState(false);
  const [qrCodeData, setQRCodeData] = useState(null);
  const [idChamadaCriada, setIdChamadaCriada] = useState(null);

  const [erroMaterias, setErroMaterias] = useState(null);
  const [erroSemestre, setErroSemestre] = useState(null);
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [loadingSemestre, setLoadingSemestre] = useState(true);

  const token = localStorage.getItem("token");
  const idProfessor = localStorage.getItem("id_professor");

  console.log("Token:", token);
  console.log("ID Professor:", idProfessor);

  const buscarSemestre = () => {
    setLoadingSemestre(true);
    setErroSemestre(null);
    fetch(`https://projeto-iii-4.vercel.app/semestres/padrao/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro na resposta do semestre");
        return res.json();
      })
      .then((data) => {
        console.log("Semestre recebido:", data);
        setSemestre(data);
      })
      .catch((err) => {
        console.error("Erro ao buscar semestre: ", err);
        setErroSemestre(err.message || "Erro desconhecido ao buscar semestre");
      })
      .finally(() => setLoadingSemestre(false));
  };

  useEffect(() => {
    if (!idProfessor) {
      setErroMaterias("ID do professor não encontrado no localStorage.");
      setLoadingMaterias(false);
      return;
    }

    setLoadingMaterias(true);
    setErroMaterias(null);

    fetch(
      `https://projeto-iii-4.vercel.app/semestre/professor/?id_professor=${idProfessor}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Erro na resposta das matérias");
        return res.json();
      })
      .then((data) => {
        console.log("Matérias recebidas:", data);
        if (Array.isArray(data)) {
          setMaterias(data);
        } else {
          throw new Error("Resposta inesperada da API");
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar matérias:", err);
        setErroMaterias(err.message || "Erro desconhecido ao buscar matérias");
        setMaterias([]);
      })
      .finally(() => setLoadingMaterias(false));

    buscarSemestre();
  }, [idProfessor, token]);

  const tokenDecodificado = token ? decodeJwt(token) : null;

  const abrirModalComMateria = (materia) => {
    setMateriaSelecionada(materia);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setMateriaSelecionada(null);
  };

  // Estilos para mobile
  const headerStyle = {
    padding: "12px",
    backgroundColor: "#28B657",
    color: "white",
    fontWeight: "bold",
    fontSize: "18px",
    textAlign: "center",
    borderRadius: "12px",
    maxWidth: "320px",
    width: "100%",
    margin: "12px auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    boxSizing: "border-box",
  };

  const homeContainerStyle = {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100%",
    backgroundColor: "#e2e2e2",
    padding: "8px 4px",
    boxSizing: "border-box",
    overflowX: "hidden",
  };

  const homeContentStyle = {
    flexGrow: 1,
    overflowY: "auto",
  };

  const cardsContainerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "center",
    width: "100%",
    boxSizing: "border-box",
  };

  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
    maxWidth: "320px",
    width: "100%",
    boxSizing: "border-box",
    margin: "0 auto",
    minHeight: "140px",
  };

  const cardTitleStyle = {
    margin: "0 0 6px 0",
    fontSize: "16px",
    fontWeight: "bold",
  };

  const cardTextStyle = {
    margin: "3px 0",
    fontSize: "13px",
  };

  return (
    <>
      <Box style={headerStyle}>
        {loadingSemestre
          ? "Carregando semestre..."
          : erroSemestre
          ? `Erro ao carregar semestre: ${erroSemestre}`
          : `Matérias - ${semestre?.descricao || "Sem descrição"}`}
      </Box>

      <ModaisChamada
        abrirModalSelecionarMateria={modalAberto}
        setAbrirModalSelecionarMateria={setModalAberto}
        materias={materias}
        materiaSelecionada={materiaSelecionada}
        setMateriaSelecionada={setMateriaSelecionada}
        tokenDecodificado={tokenDecodificado}
        modalQRCodeAberto={modalQRCodeAberto}
        setModalQRCodeAberto={setModalQRCodeAberto}
        qrCodeData={qrCodeData}
        setQRCodeData={setQRCodeData}
        idChamadaCriada={idChamadaCriada}
        setIdChamadaCriada={setIdChamadaCriada}
      />

      <Box style={homeContainerStyle}>
        <Box style={homeContentStyle}>
          <Box style={cardsContainerStyle}>
            {loadingMaterias ? (
              <Typography align="center" sx={{ mt: 2 }}>
                Carregando matérias...
              </Typography>
            ) : erroMaterias ? (
              <Typography align="center" color="error" sx={{ mt: 2 }}>
                {`Erro ao carregar matérias: ${erroMaterias}`}
              </Typography>
            ) : materias.length === 0 ? (
              <Typography align="center" sx={{ mt: 2 }}>
                Nenhuma matéria encontrada.
              </Typography>
            ) : (
              materias.map((m, idx) => (
                <Box
                  key={`${m.id_disciplina ?? idx}-card-${idx}`}
                  style={cardStyle}
                  onClick={() => abrirModalComMateria(m)}
                >
                  <h2 style={cardTitleStyle}>{m.descricao_disciplina}</h2>
                  <p style={cardTextStyle}>
                    <strong>Carga Horária:</strong> {m.carga_horaria}
                  </p>
                  <p style={cardTextStyle}>
                    <strong>Semestre:</strong> {m.descricao_semestre}
                  </p>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default MateriasMobile;
