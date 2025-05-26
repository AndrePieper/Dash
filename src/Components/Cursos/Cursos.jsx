import React, { useEffect, useState } from 'react';
import './Cursos.css';
import { FaPlus, FaPen, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Cursos = () => {
  const [cursos, setCursos] = useState([]);
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);

  // Estados para filtros de nome e tipo
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');

  // Estado para campo de ordenação e direção da ordenação
    const [ordenarPor, setOrdenarPor] = useState(null);
    const [ordemAscendente, setOrdemAscendente] = useState(true);

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
        console.log("Cursos:", data);
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

  const confirmarExclusaoCurso = (id) => {
    const token = localStorage.getItem("token");

    fetch(`https://projeto-iii-4.vercel.app/cursos/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(() => {
        setCursos(cursos.filter(curso => curso.id !== id));
        setConfirmarExclusao(null);
      })
      .catch((err) => console.error('Erro ao excluir curso:', err));
  };

  //FILTROS
    // Aplica filtros de nome e tipo sobre os cursos
    // const cursosFiltrados = useMemo(() => {
    //   return cursos.filter(user => {
    //     const nomeLower = user.nome.toLowerCase();
    //     const filtroNomeLower = filtroNome.toLowerCase();
    //     const nomeOK = nomeLower.includes(filtroNomeLower);
    //     const statusOK = filtroStatus == '' || user.status.toString() === filtroStatus;
    //     return nomeOK && statusOK;
    //   });
    // }, [cursos, filtroNome, filtroStatus]);

    // Ordena os cursos filtrados conforme campo e direção
    // const cursosOrdenados = useMemo(() => {
    //   if (!ordenarPor) return cursosFiltrados;

    //   return [...cursosFiltrados].sort((a, b) => {
    //     let valA = a[ordenarPor];
    //     let valB = b[ordenarPor];

    //     if (typeof valA === 'string') valA = valA.toLowerCase();
    //     if (typeof valB === 'string') valB = valB.toLowerCase();

    //     if (valA > valB) return ordemAscendente ? 1 : -1;
    //     if (valA < valB) return ordemAscendente ? -1 : 1;
    //     return 0;
    //   });
    // }, [cursosFiltrados, ordenarPor, ordemAscendente]);

    // Limita os cursos que cabem na tela (sem paginação)
    // const cursosVisiveis = cursosOrdenados.slice(0, 15);

    // Atualiza ordem de ordenação ao clicar no cabeçalho da tabela
    // const handleOrdenar = (campo) => {
    //   if (ordenarPor === campo) {
    //     setOrdemAscendente(!ordemAscendente);
    //   } else {
    //     setOrdenarPor(campo);
    //     setOrdemAscendente(true);
    //   }
    // };

  return (
    <div className="tela-turmas">
      <div className="header-turmas">
        <h2>Cadastro de Cursos</h2>

        <div className="filtros-cursos">
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
            <option value="0">Cadastrado</option>
            <option value="1">Válido</option>
            <option value="2">Inativo</option>
          </select>
        </div>

      </div>

      <table className="tabela-turmas">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Semestres</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {cursos.map((curso) => (
            <tr key={curso.id}>
              <td>{curso.id}</td>
              <td>{curso.descricao}</td>
              <td>{curso.qtd_semestres}</td>
              <td>{curso.status === 0 ? "Ativo" : "Inativo"}</td>
              <td>
                <button onClick={() => handleEditarCurso(curso.id)} className="botao-editar" style={{ backgroundColor: 'green', color: 'white' }}>
                  <FaPen size={16} />
                </button>
                <button onClick={() => handleExcluirCurso(curso.id)} className="botao-excluir" style={{ backgroundColor: 'red', color: 'white', marginLeft: '5px' }}>
                  <FaTrash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
    </div>
  );
};

export default Cursos;
