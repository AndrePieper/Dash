import React, { useEffect, useState } from 'react';
import './Usuarios.css';
import { FaPlus, FaPen, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch('https://projeto-iii-4.vercel.app/usuarios', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsuarios(data);
      })
      .catch((err) => console.error('Erro ao buscar usuários:', err));
  }, []);

  const handleAdicionarUsuario = () => {
    navigate('/usuarios/cadastrousuario');
  };

  const handleEditarUsuario = (id) => {
    navigate(`/usuarios/editarusuario/${id}`);
  };

  const handleExcluirUsuario = (id) => {
    setConfirmarExclusao(id);
  };

  const confirmarExclusaoUsuario = (id) => {
    const token = localStorage.getItem("token");

    fetch(`https://projeto-iii-4.vercel.app/usuarios/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(() => {
        setUsuarios(usuarios.filter(user => user.id !== id));
        setConfirmarExclusao(null);
      })
      .catch((err) => console.error('Erro ao excluir usuário:', err));
  };

  const cancelarExclusao = () => {
    setConfirmarExclusao(null);
  };

  return (
    <div className="tela-turmas">
      <div className="header-turmas">
        <h2>Cadastro de Entidades</h2>
      </div>

      <table className="tabela-turmas">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Tipo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.nome}</td>
              <td>{user.email}</td>
              <td>{user.tipo}</td>
              <td>
                <button
                  className="botao-editar"
                  onClick={() => handleEditarUsuario(user.id)}
                  style={{ backgroundColor: 'green', color: 'white', padding: '5px 10px', fontSize: '14px' }}
                >
                  <FaPen size={16} />
                </button>
                <button
                  className="botao-excluir"
                  onClick={() => handleExcluirUsuario(user.id)}
                  style={{ backgroundColor: 'red', color: 'white', padding: '5px 10px', fontSize: '14px', marginLeft: '5px' }}
                >
                  <FaTrash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="botao-adicionar" onClick={handleAdicionarUsuario}>
        <FaPlus size={28} />
      </button>

      {confirmarExclusao && (
        <div className="modal">
          <div className="modal-conteudo">
            <h3>Deseja realmente excluir esse usuário?</h3>
            <button onClick={() => confirmarExclusaoUsuario(confirmarExclusao)}>Confirmar</button>
            <button onClick={cancelarExclusao}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;