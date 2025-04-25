import React, { useEffect, useState } from 'react';
import './CadastroUsuario.css';
import { useNavigate, useParams } from 'react-router-dom';

import PopUpTopo from '../PopUp/PopUpTopo';

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
  
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`https://projeto-iii-4.vercel.app/usuarios/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then( async res => {
        const data = await res.json();

        if (!res.ok){
          console.log(data.message)
          throw new Error('Erro ao buscar usuário');
        }

        return data; 
      })
      .then(data => {
          setUsuario({
            id,
            nome: data.nome || '',
            cpf: data.cpf || '',
            ra: data.ra || '',
            imei: data.imei || '',
            email: data.email || '',
            tipo: parseInt(data.tipo, 10)
          });
    })
    .catch(erro => {
      console.error('Erro ao buscar usuário:', erro.message);
      navigate('/usuarios');
    });
  }, [id]);

  const usuarioAtualizado = {
    ...usuario,
    id: parseInt(usuario.id),
    tipo: parseInt(usuario.tipo, 10)
  };

  const handleSubmit = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`https://projeto-iii-4.vercel.app/usuarios`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",  
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(usuarioAtualizado),
      })
  
      const data = await res.json()
  
      if (!res.ok) {
        console.log(data.message)
        throw new Error(data.message || "Erro ao alterar usuário")
      }
  
      setPopup({
        show: true,
        message: data.message || "Usuário alterado com sucesso!",
        type: "success",
      });
  
      setTimeout(() => navigate("/usuarios"), 1500)
  
    } catch (error) {
      setPopup({
        show: true,
        message: error.message || "Erro inesperado!",
        type: "error",
      });

      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2000);
    }
  }

  return (
    <div className="container-form">

      {popup.show && (
        <PopUpTopo message={popup.message} type={popup.type} />
      )}

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
        />

        <label>RA</label>
        <input
          type="text"
          value={usuario.ra}
          onChange={(e) => setUsuario({ ...usuario, ra: e.target.value })}
        />

        <label>IMEI</label>
        <input
          type="text"
          value={usuario.imei}
          onChange={(e) => setUsuario({ ...usuario, imei: e.target.value })}
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
