import React, { useEffect, useState } from "react";
import ModaisChamada from "../Chamada/ModaisChamada";
import { Box } from "@mui/material";
import { decodeJwt } from "jose";

const MateriasMobile = () => {
  const [materias, setMaterias] = useState([]);
  const [semestre, setSemestre] = useState({});

  const [modalAberto, setModalAberto] = useState(false);
  const [materiaSelecionada, setMateriaSelecionada] = useState(null);

  const [modalQRCodeAberto, setModalQRCodeAberto] = useState(false);
  const [qrCodeData, setQRCodeData] = useState(null);
  const [idChamadaCriada, setIdChamadaCriada] = useState(null);

  const token = localStorage.getItem("token");
  const idProfessor = localStorage.getItem("id_professor");

  const buscarSemestre = () => {
    try {
      fetch(`https://projeto-iii-4.vercel.app/semestres/padrao/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setSemestre(data);
        })
        .catch((err) => {
          console.error("Erro ao buscar semestre: ", err);
        });
    } catch (err) {
      console.error("Erro ao decodificar o token.");
    }
  };

  useEffect(() => {
    if (!idProfessor) {
      console.error("ID do professor não encontrado no localStorage.");
      return;
    }

    fetch(
      `https://projeto-iii-4.vercel.app/semestre/professor/?id_professor=${idProfessor}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMaterias(data);
        } else {
          console.error("Resposta inesperada da API:", data);
        }
      })
      .catch((err) => console.error("Erro ao buscar semestres:", err));

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

const headerStyle = {
  padding: "16px",
  backgroundColor: "#28B657",
  color: "white",
  fontWeight: "bold",
  fontSize: "20px",
  textAlign: "center",
  borderRadius: "12px",
  maxWidth: "400px",     // mesmo valor do card
  width: "100%",
  margin: "16px auto",   // centraliza
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  boxSizing: "border-box",
};


const homeContainerStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  width: "100%", // NÃO "100vw", pois 100vw ignora o padding
  backgroundColor: "#e2e2e2",
  padding: "8px",
  boxSizing: "border-box",
  overflowX: "hidden", // impede rolagem horizontal
};

  const homeContentStyle = {
    flexGrow: 1,
    overflowY: "auto",
  };

 const cardsContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  alignItems: "center",
  width: "100%", // garante que não ultrapasse
  boxSizing: "border-box",
};

 const cardStyle = {
  backgroundColor: "white",
  borderRadius: "8px",
  padding: "16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  cursor: "pointer",
  maxWidth: "400px",
  width: "100%",
  boxSizing: "border-box",
  margin: "0 auto",
  minHeight: "160px",
};


  const cardTitleStyle = {
    margin: "0 0 8px 0",
    fontSize: "18px",
    fontWeight: "bold",
  };

  const cardTextStyle = {
    margin: "4px 0",
    fontSize: "14px",
  };

  return (
    <>
      <Box style={headerStyle}>Matérias - {semestre.descricao}</Box>

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
            {materias.map((m, idx) => (
              <Box
                key={`${m.id_disciplina}-card-${idx}`}
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
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default MateriasMobile;
