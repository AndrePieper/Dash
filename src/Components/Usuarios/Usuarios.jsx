import React, { useEffect, useState, useMemo } from 'react';
import './Usuarios.css';
import { FaPlus, FaPen, FaTrash } from 'react-icons/fa';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import PopUpTopo from '../PopUp/PopUpTopo';

const Usuarios = () => {
  // Estados para usuários e exclusão
  const [usuarios, setUsuarios] = useState([]);
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [ordenarPor, setOrdenarPor] = useState(null);
  const [ordemAscendente, setOrdemAscendente] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch('https://projeto-iii-4.vercel.app/usuarios', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(err => console.error('Erro ao buscar usuários:', err));
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

  const confirmarExclusaoUsuario = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const resDel = await fetch(`https://projeto-iii-4.vercel.app/usuarios/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await resDel.json()

      if (!resDel.ok) {
        throw new Error(data.message || "Erro ao deletar usuário")
      }

      setPopup({
        show: true,
        message: data.message || "Usuário deletado com sucesso!",
        type: "success",
      });

      setUsuarios(usuarios.filter(user => user.id !== id));
      setConfirmarExclusao(null);
      
      // Ajustar página se excluir último item da página
      if ((usuarios.length - 1) <= (paginaAtual - 1) * 9 && paginaAtual > 1) {
        setPaginaAtual(paginaAtual - 1);
      }

      setTimeout(() => navigate("/usuarios"), 1500)

    } catch (error) {
      setPopup({
        show: true,
        message: error.message || "Erro inesperado!",
        type: "error",
      });
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2000);
    }
  };

  const cancelarExclusao = () => {
    setConfirmarExclusao(null);
  };

  const tipoUsuarioTexto = (tipo) => {
    switch (tipo) {
      case 0: return 'Aluno';
      case 1: return 'Professor';
      case 2: return 'Administrador';
      default: return 'Desconhecido';
    }
  };

  // Filtra os usuários aplicando nome, tipo e status
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(user => {
      const nomeLower = user.nome.toLowerCase();
      const filtroNomeLower = filtroNome.toLowerCase();
      const nomeOK = nomeLower.includes(filtroNomeLower);
      const tipoOK = filtroTipo === '' || user.tipo.toString() === filtroTipo;
      const statusOK = filtroStatus === '' || user.status.toString() === filtroStatus;
      return nomeOK && tipoOK && statusOK;
    });
  }, [usuarios, filtroNome, filtroTipo, filtroStatus]);

  // Ordena os usuários filtrados
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

  // Pagina os usuários ordenados
  const registrosPorPagina = 9;
  const totalPaginas = Math.ceil(usuariosOrdenados.length / registrosPorPagina);

  // Limita os usuários exibidos à página atual
  const usuariosVisiveis = usuariosOrdenados.slice(
    (paginaAtual - 1) * registrosPorPagina,
    paginaAtual * registrosPorPagina
  );

  // Atualiza a ordenação
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
        <h2>Entidades</h2>

        <div className="filtros-usuarios">
          <input
            type="text"
            placeholder="Filtrar por nome"
            value={filtroNome}
            onChange={e => { setFiltroNome(e.target.value); setPaginaAtual(1); }}
            className="input-filtro"
          />
          <select
            value={filtroTipo}
            onChange={e => { setFiltroTipo(e.target.value); setPaginaAtual(1); }}
            className="select-filtro"
          >
            <option value="">Todos os tipos</option>
            <option value="0">Aluno</option>
            <option value="1">Professor</option>
            <option value="2">Administrador</option>
          </select>
          <select
            value={filtroStatus}
            onChange={e => { setFiltroStatus(e.target.value); setPaginaAtual(1); }}
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
              <th className='th-acoes'>Ações</th>
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
        <button
          onClick={handleAdicionarUsuario}
          className="botao-adicionar"
          aria-label="Adicionar Usuário"
          title="Adicionar Usuário"
        >
          <FaPlus size={28} />
        </button>

        {confirmarExclusao !== null && (
          <div className="modal-exclusao">
            <div className="modal-conteudo">
              <h3>Confirmar Exclusão</h3>
              <p>Deseja realmente excluir o usuário?</p>
              <div className="botoes-modal">
                <button
                  className="botao-confirmar"
                  onClick={() => confirmarExclusaoUsuario(confirmarExclusao)}
                >
                  Confirmar
                </button>
                <button
                  className="botao-cancelar"
                  onClick={cancelarExclusao}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Usuarios;
