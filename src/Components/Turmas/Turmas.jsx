import React, { useEffect, useState } from 'react';
import './Turmas.css';
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Turmas = () => {
  const [turmas, setTurmas] = useState([]);
  const [cursoFiltro, setCursoFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [cursos, setCursos] = useState([]);
  const [statusUnicos, setStatusUnicos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [turmaIdExcluir, setTurmaIdExcluir] = useState(null);
  const navigate = useNavigate();  // Navegação

  useEffect(() => {
    const token = localStorage.getItem("token");
  
    fetch('https://projeto-iii-4.vercel.app/turmas', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Dados recebidos de /turmas:", data); // <- Aqui mostra todos os dados brutos
  
        setTurmas(data);
  
        const cursosUnicos = [...new Set(data.map(t => t.Curso.descricao))];
        console.log("Cursos únicos extraídos:", cursosUnicos); // <- Cursos únicos filtrados
        setCursos(cursosUnicos);
  
        const status = [...new Set(data.map(t => t.status))];
        console.log("Status únicos extraídos:", status); // <- Status únicos filtrados
        setStatusUnicos(status);
      })
      .catch((err) => console.error('Erro ao buscar turmas:', err));
  
    return () => {
      console.log("Componente Turmas desmontado."); // <- Mostra quando o componente é desmontado
    };
  }, []);
  
  const turmasFiltradas = turmas.filter((t) => {
    const cursoMatch = cursoFiltro ? t.Curso.descricao === cursoFiltro : true;
    const statusMatch = statusFiltro ? t.status === parseInt(statusFiltro) : true;
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
    setTurmaIdExcluir(id); // Armazenar o id da turma a ser excluída
    setShowModal(true); // Exibir o modal de confirmação
  };

  const confirmExcluirTurma = () => {
    const token = localStorage.getItem("token");
    fetch(`https://projeto-iii-4.vercel.app/turmas/${turmaIdExcluir}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          alert('Turma excluída com sucesso!');
          setTurmas(turmas.filter((t) => t.id !== turmaIdExcluir)); // Atualizar o estado após a exclusão
          setShowModal(false); // Fechar o modal
        } else {
          alert('Erro ao excluir turma');
        }
      })
      .catch((err) => console.error('Erro ao excluir turma:', err));
  };

  const cancelExcluirTurma = () => {
    setShowModal(false); // Fechar o modal sem excluir
  };

  return (
    <div className="tela-turmas">
      <div className="header-turmas">
        <h2>Cadastro de Turmas</h2>
        <div className="filtros">
          <select value={cursoFiltro} onChange={(e) => setCursoFiltro(e.target.value)}>
            <option value="">Todos os Cursos</option>
            {cursos.map((curso) => (
              <option key={curso} value={curso}>{curso}</option>
            ))}
          </select>

          <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
            <option value="">Todos os Status</option>
            {statusUnicos.map((status) => (
              <option key={status} value={status}>{status === 1 ? 'Concluído' : 'Cursando'}</option>
            ))}
          </select>
        </div>
      </div>

      <table className="tabela-turmas">
        <thead>
          <tr>
            <th>Código</th>
            <th>Semestre</th>
            <th>Curso</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {turmasFiltradas.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.semestre_curso}</td>
              <td>{t.Curso.descricao}</td>
              <td>{t.status === 1 ? 'Concluído' : 'Cursando'}</td>
              <td>
                <button className="btn-editar" onClick={() => handleEditarTurma(t.id)}>
                  <FaEdit size={20} color="#4caf50" />
                </button>
                <button className="btn-excluir" onClick={() => handleExcluirTurma(t.id)}>
                  <FaTrashAlt size={20} color="#f44336" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="botao-adicionar" onClick={handleAdicionarTurma}>
        <FaPlus size={28} />
      </button>

      {/* Modal de Confirmação de Exclusão */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Tem certeza que deseja excluir esta turma?</h3>
            <div className="modal-buttons">
              <button className="btn-confirm" onClick={confirmExcluirTurma}>Confirmar</button>
              <button className="btn-cancel" onClick={cancelExcluirTurma}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Turmas;
