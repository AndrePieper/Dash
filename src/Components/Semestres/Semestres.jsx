import React, { useEffect, useState, useMemo } from 'react';
import './Semestres.css';
import { FaPlus, FaPen, FaTrash } from 'react-icons/fa';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import PopUpTopo from '../PopUp/PopUpTopo';

const Semestres = () => {
  const [semestres, setSemestres] = useState([]);
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);

  // Estado para campo de ordenação e direção da ordenação
  const [ordenarPor, setOrdenarPor] = useState(null);
  const [ordemAscendente, setOrdemAscendente] = useState(true);

  const [paginaAtual, setPaginaAtual] = useState(1);

  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch('https://projeto-iii-4.vercel.app/semestres', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setSemestres(data);
      })
      .catch((err) => console.error('Erro ao buscar semestres:', err));
  }, []);

  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const handleAdicionarSemestre = () => {
    navigate('/semestres/cadastrosemestre');
  };

  const handleEditarSemestre = (id) => {
    navigate(`/semestres/editarsemestre/${id}`);
  };

  const handleExcluirSemestre = (id) => {
    setConfirmarExclusao(id);
  };

  const confirmarExclusaoSemestre = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const resDel = await fetch(`https://projeto-iii-4.vercel.app/semestres/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await resDel.json()
          
      if (!resDel.ok) {
        console.log(data.message)
        throw new Error(data.message || "Erro ao deletar semestre")
      }

      setPopup({
        show: true,
        message: data.message || "Usuário deletado com sucesso!",
        type: "success",
      });

      setSemestres(semestres.filter(sem => sem.id !== id));
        setConfirmarExclusao(null);

      // Ajustar página se excluir último item da página
      if ((semestres.length - 1) <= (paginaAtual - 1) * 9 && paginaAtual > 1) {
        setPaginaAtual(paginaAtual - 1);
      }  

      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2000)


    } catch (error) {
      console.log(error.message)
      setPopup({
        show: true,
        message: error.message || "Erro inesperado!",
        type: "error",
      });
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
    }
  };

  const cancelarExclusao = () => {
  setConfirmarExclusao(null);
  };

  // Traduz o código do tipo para texto legível
  const padraoSemestreTexto = (padrao) => {
    switch (padrao) {
      case 0: return 'Sim';
      case 1: return 'Não';
      default: return 'Desconhecido';
    }
  };


  // Ordena os usuários filtrados conforme campo e direção
  const semestresOrdenados = useMemo(() => {
    if (!ordenarPor) return semestres;
  
    return [...semestres].sort((a, b) => {
      let valA = a[ordenarPor];
      let valB = b[ordenarPor];
  
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
  
      if (valA > valB) return ordemAscendente ? 1 : -1;
      if (valA < valB) return ordemAscendente ? -1 : 1;
      return 0;
    });
  }, [semestres, ordenarPor, ordemAscendente]);

  // Pagina os usuários ordenados
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

  const totalPaginas = Math.ceil(semestresOrdenados.length / registrosPorPagina);
  const indiceInicial = (paginaAtual - 1) * registrosPorPagina;
  const indiceFinal = indiceInicial + registrosPorPagina;
  const semestresPaginados = semestresOrdenados.slice(indiceInicial, indiceFinal);

  // Atualiza ordem de ordenação ao clicar no cabeçalho da tabela
  const handleOrdenar = (campo) => {
    if (ordenarPor === campo) {
      setOrdemAscendente(!ordemAscendente);
    } else {
      setOrdenarPor(campo);
      setOrdemAscendente(true);
    }
  };

  // Navegação das páginas
  const handlePaginaAnterior = () => {
    if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1);
  };

  const handleProximaPagina = () => {
    if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1);
  };

  return (
    <>
      <div className="header-usuarios">
        <h2>Semestres</h2>
      </div>

      {popup.show && (
            <PopUpTopo message={popup.message} type={popup.type} />
      )}

      <div className="tela-usuarios">
        <table className="tabela-usuarios">
          <thead>
            <tr>
              <th onClick={() => handleOrdenar('id')} style={{ cursor: 'pointer' }} className='th-codigo'>
                Código {ordenarPor === 'id' ? (ordemAscendente ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleOrdenar('descricao')} style={{ cursor: 'pointer' }}>
                Descrição {ordenarPor === 'descricao' ? (ordemAscendente ? '▲' : '▼') : ''}
              </th>
              <th>Data Inicial</th>
              <th>Data Final</th>
              <th>Padrão</th>
              <th className='th-acoes'>Ações</th>
            </tr>
          </thead>
          <tbody>
            {semestresPaginados.map((sem) => (
              <tr key={sem.id}>
                <td>{sem.id}</td>
                <td>{sem.descricao}</td>
                <td>{formatarData(sem.data_inicio)}</td>
                <td>{formatarData(sem.data_final)}</td>
                <td>{padraoSemestreTexto(sem.padrao)}</td>
                <td>
                  <button className="botao-editar" onClick={() => handleEditarSemestre(sem.id)}>
                    <FaPen size={16} />
                  </button>
                  <button className="botao-excluir" onClick={() => handleExcluirSemestre(sem.id)}>
                    <FaTrash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="paginacao-container">
          <button
            onClick={handlePaginaAnterior}
            disabled={paginaAtual === 1}
            className={`botao-paginacao ${paginaAtual === 1 ? 'desabilitado' : ''}`}
          >
            <FiArrowLeft size={20} />
          </button>
          <span className="paginacao-texto">Página {paginaAtual} de {totalPaginas}</span>
          <button
            onClick={handleProximaPagina}
            disabled={paginaAtual === totalPaginas}
            className={`botao-paginacao ${paginaAtual === totalPaginas ? 'desabilitado' : ''}`}
          >
            <FiArrowRight size={20} />
          </button>
        </div>

      </div>

      <button className="botao-adicionar" onClick={handleAdicionarSemestre}>
        <FaPlus size={28} />
      </button>

      {confirmarExclusao && (
        <div className="modal">
          <div className="modal-conteudo">
            <h3>Deseja realmente excluir esse semestre?</h3>
            <button className="botao-excluir" onClick={cancelarExclusao}>Cancelar</button>
            <button className="botao-adicionar-vinculo" onClick={() => confirmarExclusaoSemestre(confirmarExclusao)}>Confirmar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Semestres;
