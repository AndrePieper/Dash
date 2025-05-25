import React, { useEffect, useState } from 'react';
import './Materias.css';
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Materias = () => {
  const [materias, setMaterias] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState('');
  const [statusUnicos, setStatusUnicos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [materiaIdExcluir, setMateriaIdExcluir] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch('https://projeto-iii-4.vercel.app/materias', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setMaterias(data);
        const status = [...new Set(data.map(t => t.status))];
        setStatusUnicos(status);
      })
      .catch((err) => console.error('Erro ao buscar matérias:', err));
  }, []);

  const materiasFiltradas = materias.filter((m) => {
    return statusFiltro ? m.status === parseInt(statusFiltro) : true;
  });

  const handleAdicionarMateria = () => {
    navigate('/usuarios/cadastromateria');
  };

  const handleEditarMateria = (id) => {
    navigate(`/usuarios/editarmateria/${id}`);
  };

  const handleExcluirMateria = (id) => {
    setMateriaIdExcluir(id);
    setShowModal(true);
  };

  const confirmExcluirMateria = () => {
    const token = localStorage.getItem("token");
    fetch(`https://projeto-iii-4.vercel.app/materias/${materiaIdExcluir}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          alert('Matéria excluída com sucesso!');
          setMaterias(materias.filter((m) => m.id !== materiaIdExcluir));
          setShowModal(false);
        } else {
          alert('Erro ao excluir matéria');
        }
      })
      .catch((err) => console.error('Erro ao excluir matéria:', err));
  };

  const cancelExcluirMateria = () => {
    setShowModal(false);
  };

  return (
    <div className="tela-materias">
      <div className="header-materias">
        <h2>Cadastro de Matérias</h2>
        <div className="filtros">
          <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
            <option value="">Todos os Status</option>
            {statusUnicos.map((status) => (
              <option key={status} value={status}>{status === 1 ? 'Ativo' : 'Inativo'}</option>
            ))}
          </select>
        </div>
      </div>

      <table className="tabela-materias">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {materiasFiltradas.map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.nome}</td>
              <td>{m.status === 1 ? 'Ativo' : 'Inativo'}</td>
              <td>
                <button className="btn-editar" onClick={() => handleEditarMateria(m.id)}><FaEdit size={20} color="#4caf50" /></button>
                <button className="btn-excluir" onClick={() => handleExcluirMateria(m.id)}><FaTrashAlt size={20} color="#f44336" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="botao-adicionar" onClick={handleAdicionarMateria}>
        <FaPlus size={28} />
      </button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Tem certeza que deseja excluir esta matéria?</h3>
            <div className="modal-buttons">
              <button className="btn-confirm" onClick={confirmExcluirMateria}>Confirmar</button>
              <button className="btn-cancel" onClick={cancelExcluirMateria}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materias;
