import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastroTurma.css';

import PopUpTopo from '../PopUp/PopUpTopo';

const CadastroTurma = () => {
  const [semestre, setSemestre] = useState('1'); // Definindo o valor default como 1
  const [curso, setCurso] = useState('');
  const [status, setStatus] = useState('');
  const [cursos, setCursos] = useState([]);

  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
  
    // Buscando cursos
    fetch('https://projeto-iii-4.vercel.app/cursos', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setCursos(data);
      })
      .catch(err => console.error('Erro ao buscar cursos:', err));
  }, []);  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const novaTurma = {
      semestre_curso: semestre, // Agora o semestre estará como '1' por padrão
      id_curso: curso,
      status: status
    };

    try{

      const res = await fetch('https://projeto-iii-4.vercel.app/turmas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(novaTurma),
    }) 

    const data = await res.json()
        
      if (!res.ok) {
        console.log(data.message)
        throw new Error(data.message || "Erro ao cadastrar turma")
      }
  
      setPopup({
        show: true,
        message: data.message || "Turma cadastrado com sucesso!",
        type: "success",
      });
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), navigate("/turmas"), 2000)

    }  catch (error) {
      console.log(error.message)
      setPopup({
        show: true,
        message: error.message || "Erro inesperado!",
        type: "error",
      });
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
    }
  };

  return (
    <>
      <div className="header-usuarios">
        <h2>Cadastrar Turma</h2>
      </div>

      {popup.show && (
        <PopUpTopo message={popup.message} type={popup.type} />
      )}

    <div className="tela-usuarios">
      <div className="container-form">
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="semestre">Semestre:</label>
            <input
              type="number"
              id="semestre"
              value={semestre}
              placeholder="Digite o semestre"
              onChange={(e) => setSemestre(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="curso">Curso:</label>
            <select
              id="curso"
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              required
            >
              <option value="">Selecione o Curso</option>
              {cursos.map((cur, index) => (
                <option key={index} value={cur.id}>{cur.descricao}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {/* <option value="">Selecione o Status</option> */}
              <option value="0">Cursando</option>
              {/* <option value="1">Concluído</option> */}
            </select>
          </div>
          <button className="botao-gravar" type="submit">Cadastrar</button>
        </form>
      </div>
    </div>
    </>
  );
};

export default CadastroTurma;
