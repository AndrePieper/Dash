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

  // Estados para filtros de nome e tipo
  const [filtroCurso, setFiltroCurso] = useState('');
  const [filtroStatus, setFiltroStatus] = useState(''); // 0 Cursando - 1 Conluido

  // Estado para campo de ordenação e direção da ordenação
  const [ordenarPor, setOrdenarPor] = useState(null);
  const [ordemAscendente, setOrdemAscendente] = useState(true);

  const [paginaAtual, setPaginaAtual] = useState(1);

  const [popup, setPopup] = useState({ show: false, message: "", type: "" });


  const navigate = useNavigate();  // Navegaçãoa

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
  
        const cursos = [...new Set(data.map(t => t.Curso.descricao))];
        setCursos(cursos);
  
        const status = [...new Set(data.map(t => t.status))];
        setStatus(status);
      })
      .catch((err) => console.error('Erro ao buscar turmas:', err));
  
  }, []);
  
  const turmasFiltradas = turmas.filter((t) => {
    const cursoMatch = filtroCurso ? t.Curso.descricao === filtroCurso : true;
    const statusMatch = filtroStatus ? t.status === parseInt(filtroStatus) : true;
    return cursoMatch && statusMatch;
  });

  const handleAdicionarTurma = () => {
    // Navegar para a tela de cadastro de turma
    navigate('/turmas/cadastroturma');
  };

  const handleEditarTurma = (id) => {
    // Navegar para a tela de edição de turma
    navigate(`/turmas/editarturma/${id}`);
  };

  const handleExcluirTurma = (id) => {
    setConfirmarExclusao(id);
    // setTurmaIdExcluir(id); // Armazenar o id da turma a ser excluída
    // setShowModal(true); // Exibir o modal de confirmação
  };

  const confirmarExclusaoTurma = async () => {
    const token = localStorage.getItem("token");

    try {
      const resDel = await fetch(`https://projeto-iii-4.vercel.app/turmas/${turmaIdExcluir}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await resDel.json()
      
          
    if (!resDel.ok) {
      console.log(data.message)
      throw new Error(data.message || "Erro ao deletar disciplina")
    }

    setPopup({
      show: true,
      message: data.message || "Disciplina deletada com sucesso!",
      type: "success",
    });
    
    setTurmas(turmas.filter((t) => t.id !== id));
    setConfirmarExclusao(null);

    // Ajustar página se excluir último item da página
    if ((turmas.length - 1) <= (paginaAtual - 1) * 9 && paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }

    setTimeout(() => navigate("/turmas"), 1500)

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
    // Aplica filtros de nome e tipo sobre os turmas
    const turmasFiltrados = useMemo(() => {
      return turmas.filter(turma => {
        const statusOK = filtroStatus == '' || turma.status.toString() === filtroStatus;
        const cursoOK = filtroCurso == '' || turma.id_curso.toString() === filtroCurso;
        return statusOK && cursoOK;
      });
    }, [turmas, filtroStatus, filtroCurso]);

  // Ordena os turmas filtrados conforme campo e direção
  const turmasOrdenados = useMemo(() => {
    if (!ordenarPor) return turmasFiltrados;

    return [...turmasFiltrados].sort((a, b) => {
      let valA = a[ordenarPor];
      let valB = b[ordenarPor];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA > valB) return ordemAscendente ? 1 : -1;
      if (valA < valB) return ordemAscendente ? -1 : 1;
      return 0;
    });
  }, [turmasFiltrados, ordenarPor, ordemAscendente]);

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

  const totalPaginas = Math.ceil(turmasOrdenados.length / registrosPorPagina);
  const indiceInicial = (paginaAtual - 1) * registrosPorPagina;
  const indiceFinal = indiceInicial + registrosPorPagina;
  const turmasPaginadas = turmasOrdenados.slice(indiceInicial, indiceFinal);

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
        <h2>Turmas</h2>

        <div className="filtros-usuarios">
          <select 
            value={filtroCurso} 
            onChange={(e) => setFiltroCurso(e.target.value)}
          >
            <option value="">Todos os Cursos</option>
            {cursos.map((curso) => (
              <option key={curso} value={curso}>
                {curso}
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
                  <button
                    onClick={() => handleEditarTurma(t.id)} className="botao-editar" style={{ backgroundColor: 'green', color: 'white' }} 
                  >
                    <FaPen size={20}/>
                  </button>
                  <button 
                    onClick={() => handleExcluirTurma(t.id)} className="botao-excluir" style={{ backgroundColor: 'red', color: 'white', marginLeft: '5px' }}
                  >
                    <FaTrash size={20}/>
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

      {/* Modal de Confirmação de Exclusão */}
      {confirmarExclusao && (
        <div className="modal">
          <div className="modal-conteudo">
            <h3>Tem certeza que deseja excluir esta turma?</h3>
            <button onClick={() => confirmarExclusaoTurma(confirmarExclusao)}>Confirmar</button>
            <button onClick={() => setConfirmarExclusao(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Turmas;
