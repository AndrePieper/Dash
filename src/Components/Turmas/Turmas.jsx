import React, { useEffect, useState, useMemo } from 'react';
import './Turmas.css';
import { FaPlus, FaPen, FaTrash } from 'react-icons/fa';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PopUpTopo from '../PopUp/PopUpTopo';

const Turmas = () => {
  const [turmas, setTurmas] = useState([]);
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [status, setStatus] = useState([]);
  const [filtroCurso, setFiltroCurso] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [ordenarPor, setOrdenarPor] = useState(null);
  const [ordemAscendente, setOrdemAscendente] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch('https://projeto-iii-4.vercel.app/turmas', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setTurmas(data);
        const cursos = [...new Set(data.map(t => ({ id: t.id_curso, descricao: t.Curso.descricao })))];
        setCursos(cursos);
        const status = [...new Set(data.map(t => t.status))];
        setStatus(status);
      })
      .catch((err) => console.error('Erro ao buscar turmas:', err));
  }, []);

  const turmasFiltradas = useMemo(() => {
    return turmas.filter(turma => {
      const statusOK = filtroStatus === '' || turma.status.toString() === filtroStatus;
      const cursoOK = filtroCurso === '' || turma.id_curso.toString() === filtroCurso;
      return statusOK && cursoOK;
    });
  }, [turmas, filtroStatus, filtroCurso]);

  const turmasOrdenados = useMemo(() => {
    if (!ordenarPor) return turmasFiltradas;

    return [...turmasFiltradas].sort((a, b) => {
      let valA = a[ordenarPor];
      let valB = b[ordenarPor];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA > valB) return ordemAscendente ? 1 : -1;
      if (valA < valB) return ordemAscendente ? -1 : 1;
      return 0;
    });
  }, [turmasFiltradas, ordenarPor, ordemAscendente]);

  let registrosPorPagina;
  if (screen.height >= 769 && screen.height <= 1079) {
    registrosPorPagina = 7;
  } else if (screen.height >= 1079 && screen.height <= 1200) {
    registrosPorPagina = 9;
  } else if (screen.height > 1200) {
    registrosPorPagina = 10;
  } else if (screen.height < 769) {
    registrosPorPagina = 5;
  }

  const totalPaginas = Math.ceil(turmasOrdenados.length / registrosPorPagina);
  const indiceInicial = (paginaAtual - 1) * registrosPorPagina;
  const indiceFinal = indiceInicial + registrosPorPagina;
  const turmasPaginadas = turmasOrdenados.slice(indiceInicial, indiceFinal);

  const handleOrdenar = (campo) => {
    if (ordenarPor === campo) {
      setOrdemAscendente(!ordemAscendente);
    } else {
      setOrdenarPor(campo);
      setOrdemAscendente(true);
    }
  };

  const handlePaginaAnterior = () => {
    if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1);
  };

  const handleProximaPagina = () => {
    if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1);
  };

  const handleAdicionarTurma = () => {
    navigate('/turmas/cadastroturma');
  };

  const handleEditarTurma = (id) => {
    localStorage.setItem('id_turma', id);
    navigate(`/turmas/editarturma/${id}`);
  };

  const handleExcluirTurma = (id) => {
    setConfirmarExclusao(id);
  };

  const confirmarExclusaoTurma = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const resDel = await fetch(`https://projeto-iii-4.vercel.app/turmas/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await resDel.json();

      if (!resDel.ok) {
        throw new Error(data.message || "Erro ao deletar disciplina");
      }

      setPopup({
        show: true,
        message: data.message || "Turma deletada com sucesso!",
        type: "success",
      });

      setTurmas(turmas.filter((t) => t.id !== id));
      setConfirmarExclusao(null);

      if ((turmas.length - 1) <= (paginaAtual - 1) * 9 && paginaAtual > 1) {
        setPaginaAtual(paginaAtual - 1);
      }

      setTimeout(() => navigate("/turmas"), 1500);

    } catch (error) {
      setPopup({
        show: true,
        message: error.message || "Erro inesperado!",
        type: "error",
      });
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2000);
    }
  };

  return (
    <>
      <div className="header-usuarios">
        <h2>Turmas</h2>
        <div className="filtros-usuarios">
          <select value={filtroCurso} onChange={(e) => setFiltroCurso(e.target.value)}>
            <option value="">Todos os Cursos</option>
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.descricao}
              </option>
            ))}
          </select>

          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value="">Todos os Status</option>
            {status.map((status) => (
              <option key={status} value={status}>{status === 0 ? 'Cursando' : 'Concluído'}</option>
            ))}
          </select>
        </div>
      </div>

      {popup.show && <PopUpTopo message={popup.message} type={popup.type} />}

      <div className="tela-usuarios">
        <table className="tabela-usuarios">
          <thead>
            <tr>
              <th onClick={() => handleOrdenar('id')} style={{ cursor: 'pointer' }} className='th-codigo'>
                Código {ordenarPor === 'id' ? (ordemAscendente ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleOrdenar('semestre_curso')} style={{ cursor: 'pointer' }}>
                Semestre {ordenarPor === 'semestre_curso' ? (ordemAscendente ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleOrdenar('id_curso')} style={{ cursor: 'pointer' }}>
                Curso {ordenarPor === 'id_curso' ? (ordemAscendente ? '▲' : '▼') : ''}
              </th>
              <th>Status</th>
              <th className='th-acoes'>Ações</th>
            </tr>
          </thead>
          <tbody>
            {turmasPaginadas.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.semestre_curso}º Semestre</td>
                <td>{t.Curso.descricao}</td>
                <td>{t.status === 0 ? 'Cursando' : 'Concluído'}</td>
                <td>
                  <button onClick={() => handleEditarTurma(t.id)} className="botao-editar">
                    <FaPen size={20} />
                  </button>
                  <button onClick={() => handleExcluirTurma(t.id)} className="botao-excluir">
                    <FaTrash size={20} />
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

      <button className="botao-adicionar" onClick={handleAdicionarTurma}>
        <FaPlus size={28} />
      </button>

      {confirmarExclusao && (
        <div className="modal">
          <div className="modal-conteudo">
            <h3>Tem certeza que deseja excluir esta turma?</h3>
            <button className='botao-excluir' onClick={() => setConfirmarExclusao(null)}>Cancelar</button>
            <button className='botao-adicionar-vinculo' onClick={() => confirmarExclusaoTurma(confirmarExclusao)}>Confirmar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Turmas;
