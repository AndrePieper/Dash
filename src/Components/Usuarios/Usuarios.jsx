import React, { useEffect, useState, useMemo } from 'react';
import './Usuarios.css';
import { FaPlus, FaPen, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import PopUpTopo from '../PopUp/PopUpTopo';

const Usuarios = () => {
  // Estado para armazenar lista de usuários
    const [usuarios, setUsuarios] = useState([]);
  // Estado para controlar o id do usuário que está sendo confirmado para exclusão
    const [confirmarExclusao, setConfirmarExclusao] = useState(null);
  // Estados para filtros de nome e tipo
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');
  // Estado para campo de ordenação e direção da ordenação
    const [ordenarPor, setOrdenarPor] = useState(null);
    const [ordemAscendente, setOrdemAscendente] = useState(true);

  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const navigate = useNavigate();

  // Busca os usuários da API ao montar o componente
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch('https://projeto-iii-4.vercel.app/usuarios', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(err => console.error('Erro ao buscar usuários:', err));
  }, []);

  // Navega para a página de cadastro de novo usuário
  const handleAdicionarUsuario = () => {
    navigate('/usuarios/cadastrousuario');
  };

  // Navega para a página de edição do usuário selecionado
  const handleEditarUsuario = (id) => {
    navigate(`/usuarios/editarusuario/${id}`);
  };

  // Abre modal para confirmar exclusão do usuário
  const handleExcluirUsuario = (id) => {
    setConfirmarExclusao(id);
  };

  // Confirma a exclusão do usuário e atualiza lista localmente
  const confirmarExclusaoUsuario = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const resDel = await fetch(`https://projeto-iii-4.vercel.app/usuarios/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      })

      const data = await resDel.json()
          
      if (!resDel.ok) {
        console.log(data.message)
        throw new Error(data.message || "Erro ao deletar usuário")
      }

      setPopup({
        show: true,
        message: data.message || "Usuário deletado com sucesso!",
        type: "success",
      });

      setUsuarios(usuarios.filter(user => user.id !== id));
      setConfirmarExclusao(null);

      setTimeout(() => navigate("/usuarios"), 1500)

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

  // Cancela a exclusão e fecha o modal
  const cancelarExclusao = () => {
    setConfirmarExclusao(null);
  };

  // Traduz o código do tipo para texto legível
  const tipoUsuarioTexto = (tipo) => {
    switch (tipo) {
      case 0: return 'Aluno';
      case 1: return 'Professor';
      case 2: return 'Administrador';
      default: return 'Desconhecido';
    }
  };

  // Aplica filtros de nome e tipo sobre os usuários
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(user => {
      const nomeLower = user.nome.toLowerCase();
      const filtroNomeLower = filtroNome.toLowerCase();
      const nomeOK = nomeLower.includes(filtroNomeLower);
      const tipoOK = filtroTipo === '' || user.tipo.toString() === filtroTipo;
      const statusOK = filtroStatus == '' || user.status.toString() === filtroStatus;
      return nomeOK && tipoOK && statusOK;
    });
  }, [usuarios, filtroNome, filtroTipo, filtroStatus]);

  // Ordena os usuários filtrados conforme campo e direção
  const usuariosOrdenados = useMemo(() => {
    if (!ordenarPor) return usuariosFiltrados;

    return [...usuariosFiltrados].sort((a, b) => {
      let valA = a[ordenarPor];
      let valB = b[ordenarPor];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA > valB) return ordemAscendente ? 1 : -1;
      if (valA < valB) return ordemAscendente ? -1 : 1;
      return 0;
    });
  }, [usuariosFiltrados, ordenarPor, ordemAscendente]);

  // Limita os usuários que cabem na tela (sem paginação)
  const usuariosVisiveis = usuariosOrdenados.slice(0, 15);

  // Atualiza ordem de ordenação ao clicar no cabeçalho da tabela
  const handleOrdenar = (campo) => {
    if (ordenarPor === campo) {
      setOrdemAscendente(!ordemAscendente);
    } else {
      setOrdenarPor(campo);
      setOrdemAscendente(true);
    }
  };

  return (
    <>
      {/* Cabeçalho com título e filtros */}
      <div className="header-usuarios">
        <h2>Cadastro de Usuários</h2>

        <div className="filtros-usuarios">
          <input
            type="text"
            placeholder="Filtrar por nome"
            value={filtroNome}
            onChange={e => setFiltroNome(e.target.value)}
            className="input-filtro"
          />
          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            className="select-filtro"
          >
            <option value="">Todos os tipos</option>
            <option value="0">Aluno</option>
            <option value="1">Professor</option>
            <option value="2">Administrador</option>
          </select>
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

      {popup.show && (
        <PopUpTopo message={popup.message} type={popup.type} />
      )}

      {/* Conteúdo principal da lista de usuários */}
      <div className="tela-usuarios">
        <table className="tabela-usuarios">
          <thead>
            <tr>
              <th onClick={() => handleOrdenar('id')} style={{ cursor: 'pointer' }}>
                Código {ordenarPor === 'id' ? (ordemAscendente ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleOrdenar('nome')} style={{ cursor: 'pointer' }}>
                Nome {ordenarPor === 'nome' ? (ordemAscendente ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleOrdenar('email')} style={{ cursor: 'pointer' }}>
                Email {ordenarPor === 'email' ? (ordemAscendente ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleOrdenar('tipo')} style={{ cursor: 'pointer' }}>
                Tipo {ordenarPor === 'tipo' ? (ordemAscendente ? '▲' : '▼') : ''}
              </th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuariosVisiveis.length > 0 ? (
              usuariosVisiveis.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.nome}</td>
                  <td>{user.email}</td>
                  <td>{tipoUsuarioTexto(user.tipo)}</td>
                  <td>
                    <button
                      className="botao-editar"
                      onClick={() => handleEditarUsuario(user.id)}
                    >
                      <FaPen size={16} />
                    </button>
                    <button
                      className="botao-excluir"
                      onClick={() => handleExcluirUsuario(user.id)}
                    >
                      <FaTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>Nenhum usuário encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Botão fixo para adicionar usuário */}
        <button className="botao-adicionar" onClick={handleAdicionarUsuario}>
          <FaPlus size={28} />
        </button>

        {/* Modal para confirmar exclusão */}
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
    </>
  );
};

export default Usuarios;
