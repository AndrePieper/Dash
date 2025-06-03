import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CadastroDisciplina.css';

import PopUpTopo from '../PopUp/PopUpTopo';

const EditarDisciplina = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [descricao, setDescricao] = useState('');
  const [cargaHorario, setCargaHorario] = useState('');
  const [status, setStatus] = useState('');

  const [curso, setCurso] = useState('');
  const [cursos, setCursos] = useState([]);

  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Buscar cursos
    fetch('https://projeto-iii-4.vercel.app/cursos', {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCursos(data))
      .catch((err) => {
        console.error('Erro ao buscar cursos: ', err)
        setPopup({
          show: true,
          message: err.message || "Erro inesperado!",
          type: "error",
        });

        setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2000);
      });

      // Buscar dados da disciplina
      fetch(`https://projeto-iii-4.vercel.app/disciplinas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setDescricao(data.descricao);
          setStatus(data.status.toString());
          setCargaHorario(data.carga_horario);
        })
        .catch((err) => {
          console.error('Erro ao buscar disciplinas: ', err)
          setPopup({
            show: true,
            message: err.message || "Erro inesperado!",
            type: "error",
          });
  
          setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2000);
        });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    const disciplinaAtualizada = {
      id: parseInt(id),
      descricao,
      id_curso: parseInt(curso),
      carga_horario,
      status: parseInt(status),
    };

    try{

      const res = await fetch('https://projeto-iii-4.vercel.app/disciplinas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(disciplinaAtualizada),
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

    setTimeout(() => navigate("/disciplinas"), 1500)

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
        <h2>Editar Disciplina</h2>
      </div>

      {popup.show && (
        <PopUpTopo message={popup.message} type={popup.type} />
      )}

      <div className="tela-usuarios">
        <div className="container-form">
          <form onSubmit={handleSubmit}>
              <label htmlFor="descricao">Descrição:</label>
              <input
                type="text"
                id="descricao"
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                required
              />
              <label htmlFor="curso">Curso:</label>
              <select
                id="curso"
                value={curso}
                onChange={e => setCurso(e.target.value)}
                required
              >
                {cursos.map(cur => (
                  <option key={cur.id} value={cur.id}>{cur.descricao}</option>
                ))}
              </select>
              <label htmlFor="cargaHorario">Carga Horária:</label>
              <input
                type="number"
                id="cargaHorario"
                value={cargaHorario}
                onChange={e => setCargaHorario(e.target.value)}
                required
                placeholder="Digite a carga horária"
                min="30"
              />
              <label htmlFor="status">Status:</label>
              <select
                id="status"
                value={status}
                onChange={e => setStatus(e.target.value)}
                required
              >
                <option value="">Selecione o Status</option>
                <option value={0}>Ativa</option>
                <option value={1}>Inativa</option>
              </select>
            <button type="submit">Salvar Alterações</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditarDisciplina;
