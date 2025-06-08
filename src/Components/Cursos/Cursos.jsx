import React, { useEffect, useState, useMemo } from 'react';
import './Cursos.css';
import { FaPlus, FaPen, FaTrash } from 'react-icons/fa';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import PopUpTopo from '../PopUp/PopUpTopo';

const Cursos = () => {
  const [cursos, setCursos] = useState([]);
  const [confirmarExclusao, setConfirmarExclusao] = useState(null); 

  // Estados para filtros de nome e tipo
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  // Estado para campo de ordenação e direção da ordenação
  const [ordenarPor, setOrdenarPor] = useState(null);
  const [ordemAscendente, setOrdemAscendente] = useState(true);

  const [paginaAtual, setPaginaAtual] = useState(1);

  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch('https://projeto-iii-4.vercel.app/cursos', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCursos(data);
      })
      .catch((err) => console.error('Erro ao buscar cursos:', err));
  }, []);

  const handleAdicionarCurso = () => {
    navigate('/cursos/cadastrocurso');
  };

  const handleEditarCurso = (id) => {
    navigate(`/cursos/editarcurso/${id}`);
  };

  const handleExcluirCurso = (id) => {
    setConfirmarExclusao(id);
  };

  const confirmarExclusaoCurso = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const resDel = await fetch(`https://projeto-iii-4.vercel.app/cursos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await resDel.json()
      
          
      if (!resDel.ok) {
        console.log(data.message)
        throw new Error(data.message || "Erro ao deletar curso")
      }

      setPopup({
        show: true,
        message: data.message || "Curso deletado com sucesso!",
        type: "success",
      });

      setCursos(cursos.filter(curso => curso.id !== id));
      setConfirmarExclusao(null);

      // Ajustar página se excluir último item da página
      if ((cursos.length - 1) <= (paginaAtual - 1) * 9 && paginaAtual > 1) {
        setPaginaAtual(paginaAtual - 1);
      }

      setTimeout(() => navigate("/cursos"), 1500)

    } catch (error) {
      console.log(error.message)
      setPopup({
        show: true,
        message: error.message || "Erro inesperado!",
        type: "error",
      });
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2000);
    }
  };

  //FILTROS
    // Aplica filtros de nome e tipo sobre os cursos
    const cursosFiltrados = useMemo(() => {
      return cursos.filter(curso => {
        const nomeLower = curso.descricao.toLowerCase();
        const filtroNomeLower = filtroNome.toLowerCase();
        const nomeOK = nomeLower.includes(filtroNomeLower);
        const statusOK = filtroStatus == '' || curso.status.toString() === filtroStatus;
        return nomeOK && statusOK;
      });
    }, [cursos, filtroNome, filtroStatus]);

    // Ordena os cursos filtrados conforme campo e direção
    const cursosOrdenados = useMemo(() => {
      if (!ordenarPor) return cursosFiltrados;

      return [...cursosFiltrados].sort((a, b) => {
        let valA = a[ordenarPor];
        let valB = b[ordenarPor];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA > valB) return ordemAscendente ? 1 : -1;
        if (valA < valB) return ordemAscendente ? -1 : 1;
        return 0;
      });
    }, [cursosFiltrados, ordenarPor, ordemAscendente]);

    // Pagina os usuários ordenados
    const registrosPorPagina = 9;
    const totalPaginas = Math.ceil(cursosOrdenados.length / registrosPorPagina);


    // Limita os cursos que cabem na tela (sem paginação)
    const cursosVisiveis = cursosOrdenados.slice(0, 15);

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
        <h2>Cursos</h2>

        <div className="filtros-usuarios">
          <input
            type="text"
            placeholder="Filtrar por nome"
            value={filtroNome}
            onChange={e => setFiltroNome(e.target.value)}
            className="input-filtro"
            />
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="select-filtro"
            >
            <option value="">Todos Status</option>
            <option value="0">Ativo</option>
            <option value="1">Inativo</option>
          </select>
        </div>

      </div>
      
      {popup.show && (
        <PopUpTopo message={popup.message} type={popup.type} />
      )}

      <div className="tela-usuarios">
        <table className="tabela-usuarios">
          <thead>
            <tr>
              <th onClick={() => handleOrdenar('id')} style={{ cursor: 'pointer' }}>
                Código {ordenarPor === 'id' ? (ordemAscendente ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleOrdenar('descricao')} style={{ cursor: 'pointer' }}>
                Nome {ordenarPor === 'descricao' ? (ordemAscendente ? '▲' : '▼') : ''}
              </th>
              <th>Semestres</th>
              <th>Status</th>
              <th className='th-acoes'>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cursosVisiveis.length > 0 ? (
              cursosVisiveis.map((curso) => (
                <tr key={curso.id}>
                  <td>{curso.id}</td>
                  <td>{curso.descricao}</td>
                  <td>{curso.qtd_semestres}</td>
                  <td>{curso.status === 0 ? "Ativo" : "Inativo"}</td>
                  <td>
                    <button
                    onClick={() => handleEditarCurso(curso.id)} className="botao-editar" style={{ backgroundColor: 'green', color: 'white' }}
                    >
                      <FaPen size={16} />
                    </button>
                    <button
                    onClick={() => handleExcluirCurso(curso.id)} className="botao-excluir" style={{ backgroundColor: 'red', color: 'white', marginLeft: '5px' }}
                    >
                      <FaTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>Nenhum curso encontrado.</td>
              </tr>
            )}
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

      <button className="botao-adicionar" onClick={handleAdicionarCurso}>
        <FaPlus size={28} />
      </button>

      {confirmarExclusao && (
        <div className="modal">
          <div className="modal-conteudo">
            <h3>Deseja realmente excluir esse curso?</h3>
            <button onClick={() => confirmarExclusaoCurso(confirmarExclusao)}>Confirmar</button>
            <button onClick={() => setConfirmarExclusao(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Cursos;
