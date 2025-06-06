import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { decodeJwt } from "jose";
import { FaPlus, FaPen } from "react-icons/fa";
import "./Chamada.css";
import ModaisChamada from "./ModaisChamada";
import PopUpTopo from "../PopUp/PopUpTopo";

const Chamada = () => {
  const navigate = useNavigate();
  const [chamadas, setChamadas] = useState([]);
  const [filtroMateria, setFiltroMateria] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [materias, setMaterias] = useState([]);
  const [carregandoMaterias, setCarregandoMaterias] = useState(false);
  const [tokenDecodificado, setTokenDecodificado] = useState(null);

  const [abrirModalSelecionarMateria, setAbrirModalSelecionarMateria] = useState(false);
  const [abrirModalConfirmacao, setAbrirModalConfirmacao] = useState(false);
  const [modalQRCodeAberto, setModalQRCodeAberto] = useState(false);

  const [materiaSelecionada, setMateriaSelecionada] = useState("");
  const [qrCodeData, setQRCodeData] = useState(null);
  const [idChamadaCriada, setIdChamadaCriada] = useState(null);
  const [chamadaSelecionada, setChamadaSelecionada] = useState(null);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  // NOVO: paginação e ordenação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [ordenacao, setOrdenacao] = useState("desc"); // "asc" ou "desc"

  const limitePorPagina = 9;

  const buscarMaterias = () => {
    setCarregandoMaterias(true);
    const token = localStorage.getItem("token");

    try {
      const decoded = decodeJwt(token);
      fetch(`https://projeto-iii-4.vercel.app/semestre/professor/?id_professor=${decoded.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setMaterias(data);
          setCarregandoMaterias(false);
        })
        .catch((err) => {
          console.error("Erro ao buscar matérias: ", err);
          setPopup({ show: true, message: "Erro ao buscar matérias", type: "error" });
          setCarregandoMaterias(false);
        });
    } catch (err) {
      console.error("Erro ao decodificar o token.");
      setPopup({ show: true, message: "Erro ao decodificar token", type: "error" });
      setCarregandoMaterias(false);
    }
  };

  // BUSCA CHAMADAS COM PAGINAÇÃO E ORDENAÇÃO
  const buscarChamadas = (pagina = paginaAtual, ordem = ordenacao) => {
    const token = localStorage.getItem("token");

    try {
      const decoded = decodeJwt(token);
      setTokenDecodificado(decoded);
      fetch(
        `https://projeto-iii-4.vercel.app/chamadas/professor/?id_professor=${decoded.id}&page=${pagina}&limit=${limitePorPagina}&sort=data_hora_inicio&order=${ordem}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
        .then((res) => {
          const totalItems = res.headers.get("X-Total-Count"); // se backend enviar
          if (totalItems) {
            setTotalPaginas(Math.ceil(totalItems / limitePorPagina));
          }
          return res.json();
        })
        .then((data) => {
          setChamadas(data);
          setPaginaAtual(pagina);
          setOrdenacao(ordem);
        })
        .catch((err) => {
          console.error("Erro ao buscar chamadas: ", err);
          setPopup({ show: true, message: "Erro ao buscar chamadas", type: "error" });
        });
    } catch (err) {
      setPopup({ show: true, message: "Token inválido", type: "error" });
    }
  };

  useEffect(() => {
    buscarChamadas();
    buscarMaterias();
  }, []);

  // FILTRAGEM LOCAL DE CHAMADAS NA PAGINA ATUAL
  const chamadasFiltradas = chamadas.filter((chamada) => {
    const chamadaData = new Date(chamada.data_hora_inicio).toISOString().split("T")[0];
    const filtraPorMateria = filtroMateria
      ? chamada.descricao.toLowerCase().includes(filtroMateria.toLowerCase())
      : true;
    const filtraPorData = filtroData ? chamadaData === filtroData : true;
    return filtraPorMateria && filtraPorData;
  });

  // HANDLE CLICK CABEÇALHO PARA ALTERAR ORDEM
  const toggleOrdenacao = () => {
    const novaOrdenacao = ordenacao === "asc" ? "desc" : "asc";
    buscarChamadas(1, novaOrdenacao); // volta pra página 1 ao ordenar
  };

  // PAGINAÇÃO - avançar
  const irParaProximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      buscarChamadas(paginaAtual + 1, ordenacao);
    }
  };

  // PAGINAÇÃO - voltar
  const irParaPaginaAnterior = () => {
    if (paginaAtual > 1) {
      buscarChamadas(paginaAtual - 1, ordenacao);
    }
  };

  return (
    <div className="container-pagina">
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
              {materias.map((m, index) => (
                <option key={m.id || index} value={m.descricao_disciplina || ""}>
                  {m.descricao_disciplina || `Matéria ${index}`}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              aria-label="Filtro por data"
            />
            <button
              className="botao-adicionar"
              onClick={() => setAbrirModalSelecionarMateria(true)}
              title="Nova Chamada"
            >
              <FaPlus />
            </button>
          </div>
        </div>
      </div>

      {popup.show && <PopUpTopo message={popup.message} type={popup.type} />}

      <div className="tabela-container">
        {chamadasFiltradas.length === 0 ? (
          <p style={{ marginTop: 20 }}>Nenhuma chamada encontrada.</p>
        ) : (
          <table className="tabela-usuarios">
            <thead>
              <tr>
                <th>ID</th>
                <th>Descrição</th>
                <th onClick={toggleOrdenacao} style={{ cursor: "pointer" }}>
                  Data {ordenacao === "asc" ? "▲" : "▼"}
                </th>
                <th>Início</th>
                <th>Encerramento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {chamadasFiltradas.map((chamada) => (
                <tr key={chamada.id}>
                  <td>{chamada.id}</td>
                  <td>{chamada.descricao}</td>
                  <td>{new Date(chamada.data_hora_inicio).toLocaleDateString()}</td>
                  <td>{new Date(chamada.data_hora_inicio).toLocaleTimeString()}</td>
                  <td>{new Date(chamada.data_hora_final).toLocaleTimeString()}</td>
                  <td>
                    <button
                      className="botao-editar"
                      title="Editar Chamada"
                      onClick={() =>
                        navigate(`/chamada/editarchamada/${chamada.id}`, {
                          state: { id_disciplina: chamada.id_disciplina },
                        })
                      }
                    >
                      <FaPen />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* PAGINAÇÃO */}
        <div style={{ marginTop: 15, display: "flex", justifyContent: "center", gap: 15 }}>
          <button onClick={irParaPaginaAnterior} disabled={paginaAtual === 1}>
            Anterior
          </button>
          <span>
            Página {paginaAtual} de {totalPaginas}
          </span>
          <button onClick={irParaProximaPagina} disabled={paginaAtual === totalPaginas}>
            Próxima
          </button>
        </div>
      </div>

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
  );
};

export default Chamada;
