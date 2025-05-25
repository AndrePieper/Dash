import React, { useEffect, useState } from 'react';
import './Semestres.css';
import { FaPlus, FaPen, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Semestres = () => {
  const [semestres, setSemestres] = useState([]);
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);
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

  const confirmarExclusaoSemestre = (id) => {
    const token = localStorage.getItem("token");

    fetch(`https://projeto-iii-4.vercel.app/semestres/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(() => {
        setSemestres(semestres.filter(sem => sem.id !== id));
        setConfirmarExclusao(null);
      })
      .catch((err) => console.error('Erro ao excluir semestre:', err));
  };

  const cancelarExclusao = () => {
    setConfirmarExclusao(null);
  };

  return (
    <div className="tela-turmas">
      <div className="header-turmas">
        <h2>Cadastro de Semestres</h2>
      </div>

      <table className="tabela-turmas">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descrição</th>
            <th>Data Inicial</th>
            <th>Data Final</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {semestres.map((sem) => (
            <tr key={sem.id}>
              <td>{sem.id}</td>
              <td>{sem.descricao}</td>
              <td>{formatarData(sem.data_inicio)}</td>
              <td>{formatarData(sem.data_final)}</td>
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

      <button className="botao-adicionar" onClick={handleAdicionarSemestre}>
        <FaPlus size={28} />
      </button>

      {confirmarExclusao && (
        <div className="modal">
          <div className="modal-conteudo">
            <h3>Deseja realmente excluir esse semestre?</h3>
            <button onClick={() => confirmarExclusaoSemestre(confirmarExclusao)}>Confirmar</button>
            <button onClick={cancelarExclusao}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Semestres;
