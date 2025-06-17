import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { decodeJwt } from "jose";
import { FaPlus, FaSearch } from "react-icons/fa";
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import "./Chamada.css";
import ModaisChamada from "./ModaisChamada";
import PopUpTopo from "../PopUp/PopUpTopo";

const Chamada = () => {
  const navigate = useNavigate();
  const [chamadas, setChamadas] = useState([]);
  const [filtroMateria, setFiltroMateria] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [materias, setMaterias] = useState([]);
  const [semestre, setSemestre] = useState([]);

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

  const [paginaAtual, setPaginaAtual] = useState(1);
  // const [totalPaginas, setTotalPaginas] = useState(1);

  
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
        console.log("RECEBIDO EM materias:", data);
        setMaterias(Array.isArray(data) ? data : []);
        setCarregandoMaterias(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar matérias: ", err);
        setPopup({ show: true, message: "Erro ao buscar matérias", type: "error" });
        setCarregandoMaterias(false);
        setMaterias([]);
      });
    } catch (err) {
      console.error("Erro ao decodificar o token.");
      setMaterias([]);
      setPopup({ show: true, message: "Erro ao decodificar token", type: "error" });
      setCarregandoMaterias(false);
    }
  };

  let limitePorPagina; 
  if (screen.height >= 769 && screen.height <= 1079) {
    limitePorPagina = 7
  } else if (screen.height >= 1079 && screen.height <= 1200) {
    limitePorPagina = 9
  } else if (screen.height > 1200) {
    limitePorPagina = 10
  } else if (screen.height < 769){
    limitePorPagina = 5
  }
  

  const buscarChamadas = (pagina = paginaAtual) => {
    const token = localStorage.getItem("token");
    
    try {
      const decoded = decodeJwt(token);
      setTokenDecodificado(decoded);
      fetch(
        `https://projeto-iii-4.vercel.app/chamadas/professor/?id_professor=${decoded.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        // const totalItems = res.headers.get("X-Total-Count");
        // if (totalItems) {
        //   setTotalPaginas(Math.ceil(totalItems / limitePorPagina));
        // }
        if (!res.ok) {
          if (res.status === 404) return [];
          throw new Error("Erro ao buscar chamadas.");
        }
        return res.json();
      })
      .then((data) => {
        setChamadas(data);
        setSemestre(data.map(d => d.descricao_semestre));
        // setPaginaAtual(pagina);
      })
      .catch((err) => {
        console.error("Erro ao buscar chamadas: ", err);
        setPopup({ show: true, message: "Erro ao buscar chamadas", type: "error" });
        setChamadas([])
      });

    } catch (err) {
      setPopup({ show: true, message: "Token inválido", type: "error" });
    }
  };
  
  useEffect(() => {
    buscarChamadas();
    buscarMaterias();
  }, []);
  
  const chamadasFiltradas = chamadas.filter((chamada) => {
    const chamadaData = new Date(chamada.data_hora_inicio).toISOString().split("T")[0];
    const filtraPorMateria = filtroMateria
    ? chamada.descricao_disciplina.toLowerCase().includes(filtroMateria.toLowerCase())
      : true;
    const filtraPorData = filtroData ? chamadaData === filtroData : true;
    return filtraPorMateria && filtraPorData;
  });

  const totalPaginas = Math.ceil(chamadasFiltradas.length / limitePorPagina);
  const indiceInicial = (paginaAtual - 1) * limitePorPagina;
  const indiceFinal = indiceInicial + limitePorPagina;
  const chamadasPaginados = chamadasFiltradas.slice(indiceInicial, indiceFinal);


  const irParaProximaPagina = () => {
    if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1);
    // if (paginaAtual < totalPaginas) {
      //   buscarChamadas(paginaAtual + 1);
      // }
    };
    
    const irParaPaginaAnterior = () => {
    if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1);
    // if (paginaAtual > 1) {
    //   buscarChamadas(paginaAtual - 1);
    // }
  };

  return (
    <div className="container-pagina">
      <div className="header-usuarios">
        <h2>Chamadas - {semestre[0]}</h2>
        <div className="reader-area">
          <div className="filtros-header">
            <select
              value={filtroMateria}
              onChange={(e) => setFiltroMateria(e.target.value)}
              aria-label="Filtro por matéria"
            >
              <option value="">Todas as matérias</option>
              {materias.length === 0 ? ( 
                <option value="">Todas as matérias</option>
              ) : ( 
                materias.map((m, index) => (
                  <option key={m.id || index} value={m.descricao_disciplina || ""}>
                    {m.descricao_disciplina || `Matéria ${index}`}
                  </option>
                ))
              )}
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
                <th className='th-codigo'>Código</th>
                <th>Descrição</th>
                <th>Data</th> {/* Removido o onClick e cursor pointer */}
                <th>Início</th>
                <th>Encerramento</th>
                <th className='th-acoes'>Ações</th>
              </tr>
            </thead>
            <tbody>
              {/* {chamadasFiltradas.map((chamada) => ( */}
              {chamadasPaginados.map((chamada) => ( 
                <tr key={chamada.id}>
                  <td>{chamada.id}</td>
                  <td>{chamada.descricao_disciplina}</td>
                  <td>{new Date(chamada.data_hora_inicio).toLocaleDateString()}</td>
                  <td>
                    {new Date(chamada.data_hora_inicio).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    {chamada.data_hora_final
                      ? new Date(chamada.data_hora_final).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </td>
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
                      <FaSearch />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* PAGINAÇÃO */}
        {/* <div
          style={{
            marginTop: 15,
            display: "flex",
            justifyContent: "center",
            gap: 15,
          }}
        > */}
        
        <div className="paginacao-container">
          <button 
          onClick={irParaPaginaAnterior} //disabled={paginaAtual === 1}
          className={`botao-paginacao ${paginaAtual === 1 ? 'desabilitado' : ''}`}
          >
            <FiArrowLeft size={20} />
          </button>
          <span className="paginacao-texto">
            Página {paginaAtual} de {totalPaginas}
          </span>
          <button 
          onClick={irParaProximaPagina} disabled={paginaAtual === totalPaginas}
          className={`botao-paginacao ${paginaAtual === totalPaginas ? 'desabilitado' : ''}`}
          >
            <FiArrowRight size={20} />
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
