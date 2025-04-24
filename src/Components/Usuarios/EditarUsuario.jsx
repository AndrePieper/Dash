import React, { useEffect, useState } from 'react';
import './CadastroUsuario.css';
import { useNavigate, useParams } from 'react-router-dom';

const EditarUsuario = () => {
  const [usuario, setUsuario] = useState({
    id: '',
    nome: '',
    cpf: '',
    ra: '',
    imei: '',
    email: '',
    tipo: ''
  });

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`https://projeto-iii-4.vercel.app/usuarios/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar usuário');
        return res.json();
      })
      .then(data => {
        if (data && data.nome && data.email && data.tipo !== undefined) {
          setUsuario({
            id,
            nome: data.nome || '',
            cpf: data.cpf || '',
            ra: data.ra || '',
            imei: data.imei || '',
            email: data.email || '',
            tipo: parseInt(data.tipo, 10)
          });
        } else {
          throw new Error('Dados incompletos do usuário');
        }
      })
      .catch(err => console.error('Erro ao buscar usuário:', err));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const usuarioAtualizado = {
      ...usuario,
      tipo: parseInt(usuario.tipo, 10)
    };

    fetch(`https://projeto-iii-4.vercel.app/usuarios`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(usuarioAtualizado),
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao atualizar');
        return res.json();
      })
      .then(() => navigate('/usuarios'))
      .catch(err => console.error('Erro ao editar usuário:', err));
  };

  return (
    <div className="container-form">
      <h2>Editar Usuário</h2>
      <form onSubmit={handleSubmit}>
        <label>Nome</label>
        <input
          type="text"
          value={usuario.nome}
          onChange={(e) => setUsuario({ ...usuario, nome: e.target.value })}
          required
        />

        <label>CPF</label>
        <input
          type="text"
          value={usuario.cpf}
          onChange={(e) => setUsuario({ ...usuario, cpf: e.target.value })}
          required
        />

        <label>RA</label>
        <input
          type="text"
          value={usuario.ra}
          onChange={(e) => setUsuario({ ...usuario, ra: e.target.value })}
          required
        />

        <label>IMEI</label>
        <input
          type="text"
          value={usuario.imei}
          onChange={(e) => setUsuario({ ...usuario, imei: e.target.value })}
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={usuario.email}
          onChange={(e) => setUsuario({ ...usuario, email: e.target.value })}
          required
        />

        <label>Tipo de Usuário</label>
        <select
          value={usuario.tipo}
          onChange={(e) => setUsuario({ ...usuario, tipo: parseInt(e.target.value, 10) })}
          required
        >
          <option value="">Selecione o tipo</option>
          <option value={0}>Aluno</option>
          <option value={1}>Professor</option>
          <option value={2}>Administrador</option>
        </select>

        <button type="submit">Salvar Alterações</button>
      </form>
    </div>
  );
};

export default EditarUsuario;
