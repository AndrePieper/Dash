import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastroDisciplina.css';

import PopUpTopo from '../PopUp/PopUpTopo';
 
const CadastroDisciplina = () => {
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('');
  const [cargaHorario, setCargaHorario] = useState(''); // novo estado para carga_horario
  
  const [curso, setCurso] = useState('');
  const [cursos, setCursos] = useState([]);
  
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('https://projeto-iii-4.vercel.app/cursos', {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCursos(data))
      .catch(err => console.error('Erro ao buscar cursos:', err));

  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const novaDisciplina = {
      descricao,
      id_curso: parseInt(curso),
      carga_horario: parseInt(cargaHorario),  // enviar carga_horario como número
      status: parseInt(status),
    };

    try{

      const res = await fetch('https://projeto-iii-4.vercel.app/disciplinas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(novaDisciplina),
    })

    const data = await res.json()
        
      if (!res.ok) {
        console.log(data.message)
        throw new Error(data.message || "Erro ao cadastrar disciplina")
      }
  
      setPopup({
        show: true,
        message: data.message || "Disciplina cadastrado com sucesso!",
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
        <h2>Cadastrar Disciplina</h2>
      </div>

      {popup.show && (
          <PopUpTopo message={popup.message} type={popup.type} />
        )}
      
      <div className="tela-usuarios">
        <div className="container-form">
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="descricao">Descrição:</label>
              <input
                type="text"
                id="descricao"
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                required
                placeholder="Digite o nome da disciplina"
              />
            </div>
            <div>
              <label htmlFor="curso">Curso:</label>
              <select
                id="curso"
                value={curso}
                onChange={e => setCurso(e.target.value)}
                required
              >
                <option value="">Selecione o Curso</option>
                {cursos.map(cur => (
                  <option key={cur.id} value={cur.id}>{cur.descricao}</option>
                ))}
              </select>
            </div>
            <div>
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
            </div>
            <div>
              <label htmlFor="status">Status:</label>
              <select
                id="status"
                value={status}
                onChange={e => setStatus(e.target.value)}
                required
              >
                <option value={0}>Ativo</option>
                <option value={1}>Inativo</option>
              </select>
            </div>
            <button type="submit">Cadastrar</button>
          </form>
        </div>
      </div>
    </>

  );
};

export default CadastroDisciplina;
