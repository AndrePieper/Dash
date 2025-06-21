import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastroCurso.css';

import PopUpTopo from '../PopUp/PopUpTopo';

const CadastroCurso = () => {
  const [descricao, setDescricao] = useState('');
  const [qtdSemestres, setQtdSemestres] = useState('');
  const [status, setStatus] = useState(0);
  
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const novoCurso = {
      descricao,
      qtd_semestres: parseInt(qtdSemestres),
      status: parseInt(status),
    };

    try {
      const res = await fetch('https://projeto-iii-4.vercel.app/cursos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novoCurso),
      })

      const data = await res.json()
        
      if (!res.ok) {
        console.log(data.message)
        throw new Error(data.message || "Erro ao cadastrar curso")
      }
  
      setPopup({
        show: true,
        message: data.message || "Curso cadastrado com sucesso!",
        type: "success",
      });
      setTimeout(() => navigate("/cursos"), 1500)

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

  return (
    <>
        <div className="header-usuarios">
          <h2>Cadastrar Curso</h2>
        </div>
        
        {popup.show && (
          <PopUpTopo message={popup.message} type={popup.type} />
        )}

        <div className="tela-usuarios"> 
          <div className="container-form">
            <form onSubmit={handleSubmit}>
              <div>
                <label>Nome do Curso:</label>
                <input value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
              </div>
              <div>
                <label>Quantidade de Semestres:</label>
                <input type="number" value={qtdSemestres} onChange={(e) => setQtdSemestres(e.target.value)} required />
              </div>
              <div>
                <label>Status:</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value={0}>Ativo</option>
                  <option value={1}>Inativo</option>
                </select>
              </div>
              <button className="botao-gravar" type="submit">Cadastrar</button>
            </form>
          </div>
        </div>
    </>
  );
};

export default CadastroCurso;
