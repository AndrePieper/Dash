import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { decodeJwt } from "jose";
import { Typography, Alert, Card, CardContent } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import "./Chamada.css";
import ModaisChamada from "./ModaisChamada";

import PopUpTopo from '../PopUp/PopUpTopo';

const Chamada = () => {
  const navigate = useNavigate();
  const [chamadas, setChamadas] = useState([]);
  const [filtroMateria, setFiltroMateria] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [tokenDecodificado, setTokenDecodificado] = useState(null);

  const [abrirModalSelecionarMateria, setAbrirModalSelecionarMateria] = useState(false);
  const [abrirModalConfirmacao, setAbrirModalConfirmacao] = useState(false);
  const [modalQRCodeAberto, setModalQRCodeAberto] = useState(false);

  const [materias, setMaterias] = useState([]);
  const [materiaSelecionada, setMateriaSelecionada] = useState("");
  const [carregandoMaterias, setCarregandoMaterias] = useState(false);

  const [qrCodeData, setQRCodeData] = useState(null);
  const [idChamadaCriada, setIdChamadaCriada] = useState(null);
  const [chamadaSelecionada, setChamadaSelecionada] = useState(null);

  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const buscarMaterias = () => {
    setCarregandoMaterias(true);
    const token = localStorage.getItem("token");
    let idProfessor = null;

    try {
      const decoded = decodeJwt(token);
      idProfessor = decoded.id;
    } catch (error) {
      setMensagemErro("Erro ao decodificar o token.");
      setCarregandoMaterias(false);
      return;
    }

    fetch(`https://projeto-iii-4.vercel.app/semestre/professor/?id_professor=${idProfessor}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar matérias");
        return res.json();
      })
      .then((data) => {
        setMaterias(data);
        setCarregandoMaterias(false);
      })
      .catch((err) => {
        console.error('Erro ao buscar matérias: ', err)
        setPopup({
          show: true,
          message: err.message || "Erro ao buscar matérias",
          type: "success",
        });
        setCarregandoMaterias(false);
      });
  };

  const buscarChamadas = () => {
    const token = localStorage.getItem("token");
    let idProfessor = null;

    try {
      const decoded = decodeJwt(token);
      idProfessor = decoded.id;
      setTokenDecodificado(decoded);
    } catch (error) {
      console.error('Erro ao decodificar o token: ', err)
      setPopup({
        show: true,
        message: err.message || "Erro ao decodificar o token.",
        type: "success",
      });
      return;
    }

    fetch(`https://projeto-iii-4.vercel.app/chamadas/professor/?id_professor=${idProfessor}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar as chamadas.");
        return res.json();
      })
      .then((data) => setChamadas(data.reverse().slice(0, 9)))
      .catch((error) => {
        console.error('Erro ao buscar matérias:', err)
        setPopup({
          show: true,
          message: err.message || "Erro ao buscar matérias",
          type: "success",
        });
        // setMensagemErro(error.message);
      });
  };

  useEffect(() => {
    buscarChamadas();
    buscarMaterias();
  }, []);

  const abrirModalMatérias = () => {
    setAbrirModalSelecionarMateria(true);
    setCarregandoMaterias(true);
    buscarMaterias();
  };

  const chamadasFiltradas = chamadas.filter((chamada) => {
    const chamadaData = new Date(chamada.data_hora_inicio).toISOString().split("T")[0];
    const filtraPorMateria = filtroMateria
      ? chamada.descricao.toLowerCase().includes(filtroMateria.toLowerCase())
      : true;
    const filtraPorData = filtroData ? chamadaData === filtroData : true;
    return filtraPorMateria && filtraPorData;
  });

  return (
    <>
      <div className="header-usuarios">
        <h2>Chamadas</h2>
        <div className="reader-area">
          <div className="filtros-header">
            <select
              value={filtroMateria}
              onChange={(e) => setFiltroMateria(e.target.value)}
              aria-label="Filtro por matéria"
              >
              <option value="">Todas as matérias</option>
              {materias.map((m, index) => {
                const valor = m.descricao_disciplina || `Undefined` || `materia-${index}`;
                const chave = m.id || `materia-${index}`;
                return (
                  <option key={chave} value={valor}>
                    {valor}
                  </option>
                );
              })}
            </select>

            <input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              aria-label="Filtro por data"
              />

            <button
              className="botao-adicionar"
              onClick={abrirModalMatérias}
              title="Nova Chamada"
              >
              <FaPlus />
            </button>
          </div>
        </div>
      </div>

      {popup.show && (
        <PopUpTopo message={popup.message} type={popup.type} />
      )}

      {chamadasFiltradas.length === 0 && !popup && (
        <Typography variant="body1">Nenhuma chamada encontrada.</Typography>
      )}

      <div className="tela-usuarios">
        {chamadasFiltradas.length > 0 && (
          <div className="lista-cards">
            {chamadasFiltradas.map((chamada) => (
              <Card
                key={chamada.id}
                className="card"
                onClick={() =>
                  navigate(`/chamada/editarchamada/${chamada.id}`, {
                    state: { id_disciplina: chamada.id_disciplina },
                  })
                }
                title="Clique para editar essa chamada"
              >
                <CardContent>
                  <Typography className="cardTexto">
                    <strong>{chamada.descricao}</strong>
                  </Typography>
                  <Typography variant="body2">
                    <strong>Número:</strong> {chamada.id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Data:</strong>{" "}
                    {new Date(chamada.data_hora_inicio).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Hora de Início:</strong>{" "}
                    {new Date(chamada.data_hora_inicio).toLocaleTimeString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Hora de Fechamento:</strong>{" "}
                    {new Date(chamada.data_hora_final).toLocaleTimeString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <ModaisChamada
          abrirModalSelecionarMateria={abrirModalSelecionarMateria}
          setAbrirModalSelecionarMateria={setAbrirModalSelecionarMateria}
          abrirModalConfirmacao={abrirModalConfirmacao}
          setAbrirModalConfirmacao={setAbrirModalConfirmacao}
          modalQRCodeAberto={modalQRCodeAberto}
          setModalQRCodeAberto={setModalQRCodeAberto}
          materias={materias}
          materiaSelecionada={materiaSelecionada}
          setMateriaSelecionada={setMateriaSelecionada}
          carregandoMaterias={carregandoMaterias}
          setCarregandoMaterias={setCarregandoMaterias}
          chamadaSelecionada={chamadaSelecionada}
          tokenDecodificado={tokenDecodificado}
          setQRCodeData={setQRCodeData}
          setIdChamadaCriada={setIdChamadaCriada}
          qrCodeData={qrCodeData}
          idChamadaCriada={idChamadaCriada}
          onChamadaCriada={buscarChamadas}
        />
      </div>
    </>
    
  );
};

export default Chamada;
