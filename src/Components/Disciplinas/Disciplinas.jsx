import React, { useEffect, useState, useMemo } from 'react';
import './Disciplinas.css';
import { FaPlus, FaPen, FaTrash } from 'react-icons/fa';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import PopUpTopo from '../PopUp/PopUpTopo';

const Disciplinas = () => {
  const [disciplinas, setDisciplinas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);

  // Estados para filtros de nome e tipo
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCurso, setFiltroCurso] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  // Estado para campo de ordenação e direção da ordenação
  const [ordenarPor, setOrdenarPor] = useState(null);
  const [ordemAscendente, setOrdemAscendente] = useState(true);

  const [paginaAtual, setPaginaAtual] = useState(1);

  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch('https://projeto-iii-4.vercel.app/disciplinas', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setDisciplinas(data);
      })
      .catch((err) => console.error('Erro ao buscar disciplinas:', err));

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

  const handleAdicionarDisciplina = () => {
    navigate('/disciplinas/cadastrodisciplina');
  };

  const handleEditarDisciplina = (id) => {
    navigate(`/disciplinas/editardisciplina/${id}`);
  };

  const handleExcluirDisciplina = (id) => {
    setConfirmarExclusao(id);
  };

  const confirmarExclusaoDisciplina = async (id) => {
    const token = localStorage.getItem("token");

    try {

      const resDel = await fetch(`https://projeto-iii-4.vercel.app/disciplinas/?id=${id}`, {
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

    setDisciplinas(disciplinas.filter((d) => d.id !== id));
    setConfirmarExclusao(null);

    // Ajustar página se excluir último item da página
    if ((disciplinas.length - 1) <= (paginaAtual - 1) * 9 && paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }

    setTimeout(() => navigate("/disciplinas"), 1500)

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
    // Aplica filtros de nome e tipo sobre os disciplinas
    const disciplinasFiltrados = useMemo(() => {
      return disciplinas.filter(disciplina => {
        const nomeLower = disciplina.descricao.toLowerCase();
        const filtroNomeLower = filtroNome.toLowerCase();
        const nomeOK = nomeLower.includes(filtroNomeLower);
        const statusOK = filtroStatus == '' || disciplina.status.toString() === filtroStatus;
        const cursoOK = filtroCurso == '' || disciplina.id_curso.toString() === filtroCurso;
        return nomeOK && statusOK && cursoOK;
      });
    }, [disciplinas, filtroNome, filtroStatus, filtroCurso]);

    // Ordena os disciplinas filtrados conforme campo e direção
    const disciplinasOrdenados = useMemo(() => {
      if (!ordenarPor) return disciplinasFiltrados;

      return [...disciplinasFiltrados].sort((a, b) => {
        let valA = a[ordenarPor];
        let valB = b[ordenarPor];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA > valB) return ordemAscendente ? 1 : -1;
        if (valA < valB) return ordemAscendente ? -1 : 1;
        return 0;
      });
    }, [disciplinasFiltrados, ordenarPor, ordemAscendente]);

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
  
    const totalPaginas = Math.ceil(disciplinasOrdenados.length / registrosPorPagina);
    const indiceInicial = (paginaAtual - 1) * registrosPorPagina;
    const indiceFinal = indiceInicial + registrosPorPagina;
    const disciplinasPaginadas = disciplinasOrdenados.slice(indiceInicial, indiceFinal);


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
        <h2>Disciplinas</h2>

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
          <select
            value={filtroCurso}
            onChange={e => setFiltroCurso(e.target.value)}
            className="select-filtro"
          >
            <option value="">Todos Cursos</option>
            {cursos.map(curso => (
              <option key={curso.id} value={curso.id}>
                {curso.descricao}
              </option>
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
            <th onClick={() => handleOrdenar('descricao')} style={{ cursor: 'pointer' }}>
              Nome {ordenarPor === 'descricao' ? (ordemAscendente ? '▲' : '▼') : ''}
            </th>
            <th>Curso</th>
            <th>Status</th>
            <th className='th-acoes'>Ações</th>
            </tr>
          </thead>
          <tbody>
            {disciplinasPaginadas.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.descricao}</td>
                <td>{d.Curso?.descricao || 'Sem curso'}</td>
                <td>{d.status === 0 ? 'Ativo' : 'Inativo'}</td>
                <td>
                  <button
                  onClick={() => handleEditarDisciplina(d.id)} className="botao-editar" style={{ backgroundColor: 'green', color: 'white' }}
                  >
                    <FaPen size={16} />
                  </button>
                  <button
                  onClick={() => handleExcluirDisciplina(d.id)} className="botao-excluir" style={{ backgroundColor: 'red', color: 'white', marginLeft: '5px' }}
                  >
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

      <button className="botao-adicionar" onClick={handleAdicionarDisciplina}>
        <FaPlus size={28} />
      </button>

      {confirmarExclusao && (
        <div className="modal">
          <div className="modal-conteudo">
            <h3>Deseja realmente excluir essa disciplina?</h3>
            <button onClick={() => confirmarExclusaoDisciplina(confirmarExclusao)}>Confirmar</button>
            <button onClick={() => setConfirmarExclusao(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Disciplinas;
