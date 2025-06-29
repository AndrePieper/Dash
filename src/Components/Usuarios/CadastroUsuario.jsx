import React, { useState } from 'react';
import './CadastroUsuario.css';
import { useNavigate } from 'react-router-dom';

import PopUpTopo from '../PopUp/PopUpTopo';

const CadastroUsuario = () => {
  const [nome, setNome] = useState('');
  const [cpf, setCPF] = useState('');
  const [ra, setRA] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('');
  
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch('https://projeto-iii-4.vercel.app/usuarios', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",  
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ nome, cpf, ra, email, senha, tipo: Number(tipo) }),
      })
  
      const data = await res.json()
  
      if (!res.ok) {
        console.log(data.message)
        throw new Error(data.message || "Erro ao cadastrar usuário")
      }
  
      setPopup({
        show: true,
        message: data.message || "Usuário cadastrado com sucesso!",
        type: "success",
      });
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), navigate("/usuarios"), 2000)
  
    } catch (error) {
      console.log(error.message)
      setPopup({
        show: true,
        message: error.message || "Erro inesperado!",
        type: "error",
      });
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
    }
  }

  return (
    <>
      <div className="header-usuarios">
        <h2>Cadastro de Entidades</h2>
      </div>

        {popup.show && (
            <PopUpTopo message={popup.message} type={popup.type} />
        )}

      <div className="tela-usuarios">
        <div className="container-form">

          <form onSubmit={handleSubmit} autoComplete="off">
              <label>Tipo</label>
              <select 
              id="tipo"
              value={tipo} 
              onChange={(e) => setTipo(e.target.value )}
              >
              <option value="">Selecione o tipo</option>
              <option value={0}>Aluno</option>
              <option value={1}>Professor</option>
              <option value={2}>Admin</option>
              </select>
              <label>Nome</label>
              <input
                type="text"
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value )}
                required
              />
              <label>CPF</label>
              <input
                type="text"
                placeholder="CPF"
                value={cpf}
                onChange={(e) => setCPF(e.target.value )}
              />
              <label>RA</label>
              <input
                type="text"
                placeholder="RA"
                value={ra}
                onChange={(e) => setRA(e.target.value )}
              />
              <label>Email</label>
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value )}
              />
              <label>Senha</label>
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="new-password"
              />
              <br/>
            <button className="botao-gravar" type="submit">Cadastrar</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CadastroUsuario;