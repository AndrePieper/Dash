import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CadastroCurso.css';

import PopUpTopo from '../PopUp/PopUpTopo';

const EditarCurso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [descricao, setDescricao] = useState('');
  const [qtdSemestres, setQtdSemestres] = useState('');
  const [status, setStatus] = useState(0);

  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch(`https://projeto-iii-4.vercel.app/cursos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then( async res => {
      const data = await res.json();

      if (!res.ok){
        console.log(data.message)
        throw new Error('Erro ao buscar curso');
      }

      return data; 
    })
      .then((data) => {
        setDescricao(data.descricao);
        setQtdSemestres(data.qtd_semestres);
        setStatus(data.status);
      })
      .catch((err) => {
        console.error('Erro ao buscar curso: ', err)
        setPopup({
          show: true,
          message: err.message || "Erro inesperado!",
          type: "error",
        });

        setTimeout(() => setPopup({ show: false, message: "", type: "" }), navigate("/cursos"), 2000);
      });
  }, [id]);

  const cursoAtualizado = {
    id: parseInt(id),
    descricao,
    qtd_semestres: parseInt(qtdSemestres),
    status: parseInt(status),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    try {
      const res = await fetch('https://projeto-iii-4.vercel.app/cursos', {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",  
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(cursoAtualizado),
      })
  
      const data = await res.json()
  
      if (!res.ok) {
        console.log(data.message)
        throw new Error(data.message || "Erro ao alterar curso")
      }
  
      setPopup({
        show: true,
        message: data.message || "Curso alterado com sucesso!",
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
        <h2>Editar Curso</h2>
      </div>

      {/* <div className="container-form">   */}
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
              <button type="submit">Salvar Alterações</button>
            </form>
          </div>
      </div>
    </>
  );
};

export default EditarCurso;
