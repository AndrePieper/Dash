import React, { useEffect, useState } from 'react';
import './Disciplinas.css';
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Disciplinas = () => {
  const [disciplinas, setDisciplinas] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState('');
  const [statusUnicos, setStatusUnicos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [disciplinaIdExcluir, setDisciplinaIdExcluir] = useState(null);
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
        const status = [...new Set(data.map(t => t.status))];
        setStatusUnicos(status);
      })
      .catch((err) => console.error('Erro ao buscar disciplinas:', err));
  }, []);

  const disciplinasFiltradas = disciplinas.filter((d) => {
    return statusFiltro ? d.status === parseInt(statusFiltro) : true;
  });

  const handleAdicionarDisciplina = () => {
    navigate('/disciplinas/cadastrodisciplina');
  };

  const handleEditarDisciplina = (id) => {
    navigate(`/disciplinas/editardisciplina/${id}`);
  };

  const handleExcluirDisciplina = (id) => {
    setDisciplinaIdExcluir(id);
    setShowModal(true);
  };

  const confirmExcluirDisciplina = () => {
    const token = localStorage.getItem("token");
    fetch(`https://projeto-iii-4.vercel.app/disciplinas/${disciplinaIdExcluir}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          alert('Disciplina excluída com sucesso!');
          setDisciplinas(disciplinas.filter((d) => d.id !== disciplinaIdExcluir));
          setShowModal(false);
        } else {
          alert('Erro ao excluir disciplina');
        }
      })
      .catch((err) => console.error('Erro ao excluir disciplina:', err));
  };

  const cancelExcluirDisciplina = () => {
    setShowModal(false);
  };

  return (
    <div className="tela-disciplinas">
      <div className="header-disciplinas">
        <h2>Cadastro de Disciplinas</h2>
        <div className="filtros">
          <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
            <option value="">Todos os Status</option>
            {statusUnicos.map((status) => (
              <option key={status} value={status}>{status === 1 ? 'Ativo' : 'Inativo'}</option>
            ))}
          </select>
        </div>
      </div>

      <table className="tabela-disciplinas">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {disciplinasFiltradas.map((d) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.descricao}</td>
              <td>{d.status === 1 ? 'Ativo' : 'Inativo'}</td>
              <td>
                <button className="btn-editar" onClick={() => handleEditarDisciplina(d.id)}><FaEdit size={20} color="#4caf50" /></button>
                <button className="btn-excluir" onClick={() => handleExcluirDisciplina(d.id)}><FaTrashAlt size={20} color="#f44336" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="botao-adicionar" onClick={handleAdicionarDisciplina}>
        <FaPlus size={28} />
      </button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Tem certeza que deseja excluir esta disciplina?</h3>
            <div className="modal-buttons">
              <button className="btn-confirm" onClick={confirmExcluirDisciplina}>Confirmar</button>
              <button className="btn-cancel" onClick={cancelExcluirDisciplina}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Disciplinas;
