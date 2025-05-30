import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CadastroTurma.css';

import PopUpTopo from '../PopUp/PopUpTopo';

const EditarTurma = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [semestre, setSemestre] = useState('');
  const [curso, setCurso] = useState('');
  const [status, setStatus] = useState('');
  const [cursos, setCursos] = useState([]);

  const [popup, setPopup] = useState({ show: false, message: "", type: "" })

  useEffect(() => {
    const token = localStorage.getItem("token");
  
    // Buscar cursos primeiro
    fetch('https://projeto-iii-4.vercel.app/cursos', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data =>  setCursos(data))
      .catch((err) => {
        console.error('Erro ao buscar cursos:', err)
        setPopup({
          show: true,
          message: err.message || "Erro inesperado!",
          type: "error",
        });

        setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2000);
      });

      // Buscar dados da turma
      fetch(`https://projeto-iii-4.vercel.app/turmas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setSemestre(data.semestre_curso); // Agora o semestre será o valor direto
          setCurso(data.id_curso);
          setStatus(data.status.toString());
        })
        .catch((err) => {
          console.error('Erro ao buscar turmas:', err)
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
  
    const turmaAtualizada = {
      id: parseInt(id),
      semestre_curso: parseInt(semestre), // Agora é um valor direto
      id_curso: parseInt(curso),
      status: parseInt(status),
    };
  
    try {

      const res = await fetch('https://projeto-iii-4.vercel.app/turmas', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(turmaAtualizada),
    })

    const data = await res.json()
  
    if (!res.ok) {
      console.log(data.message)
      throw new Error(data.message || "Erro ao alterar turma")
    }

    setPopup({
      show: true,
      message: data.message || "Turma alterado com sucesso!",
      type: "success",
    });

    setTimeout(() => navigate("/turmas"), 1500)

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
    <div className="tela-turmas">
      <div className="header-turmas">
        <h2>Editar Turma</h2>
      </div>

      {popup.show && (
            <PopUpTopo message={popup.message} type={popup.type} />
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="semestre">Semestre:</label>
          <input
            type="number"
            id="semestre"
            value={semestre}
            onChange={(e) => setSemestre(e.target.value)}
            required
            placeholder="Digite o semestre"
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
            {cursos.map((cur) => (
              <option key={cur.id} value={cur.id}>{cur.descricao}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="">Selecione o Status</option>
            <option value="0">Cursando</option>
            <option value="1">Concluído</option>
          </select>
        </div>
        <button type="submit">Salvar Alterações</button>
      </form>
    </div>
  );
};

export default EditarTurma;
