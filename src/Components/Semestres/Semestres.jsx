import React, { useEffect, useState } from 'react';
import './Semestres.css';
import { FaPlus, FaPen, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Semestres = () => {
  const [semestres, setSemestres] = useState([]);
  const [confirmarExclusao, setConfirmarExclusao] = useState(null); // Estado para controle de exclusão
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
    navigate(`/semestres/editarsemestre/${id}`); // Navegar para a página de edição
  };

  const handleExcluirSemestre = (id) => {
    setConfirmarExclusao(id); // Armazenar o id do semestre a ser excluído
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
      .then((data) => {
        setSemestres(semestres.filter(sem => sem.id !== id)); // Atualiza a lista de semestres
        setConfirmarExclusao(null); // Fecha a confirmação
      })
      .catch((err) => console.error('Erro ao excluir semestre:', err));
  };

  const cancelarExclusao = () => {
    setConfirmarExclusao(null); // Cancela a exclusão
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
            <th>Ações</th> {/* Coluna de ações para editar e excluir */}
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
                <button 
                  className="botao-editar" 
                  onClick={() => handleEditarSemestre(sem.id)} 
                  style={{ backgroundColor: 'green', color: 'white', padding: '5px 10px', fontSize: '14px' }}
                >
                  <FaPen size={16} />
                </button>
                <button 
                  className="botao-excluir" 
                  onClick={() => handleExcluirSemestre(sem.id)} 
                  style={{ backgroundColor: 'red', color: 'white', padding: '5px 10px', fontSize: '14px', marginLeft: '5px' }}
                >
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

      {/* Modal de confirmação de exclusão */}
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
