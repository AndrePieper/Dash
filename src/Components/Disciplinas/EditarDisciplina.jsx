import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CadastroDisciplina.css';

const EditarDisciplina = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [descricao, setDescricao] = useState('');
  const [curso, setCurso] = useState('');
  const [semestre, setSemestre] = useState('');
  const [status, setStatus] = useState('');
  const [cursos, setCursos] = useState([]);
  const [semestres, setSemestres] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Buscar cursos e semestres
    Promise.all([
      fetch('https://projeto-iii-4.vercel.app/cursos', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.json()),
      fetch('https://projeto-iii-4.vercel.app/semestres', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.json())
    ]).then(([cursosData, semestresData]) => {
      setCursos(cursosData);
      setSemestres(semestresData);

      // Buscar dados da disciplina
      fetch(`https://projeto-iii-4.vercel.app/disciplinas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setDescricao(data.descricao);
          setCurso(data.id_curso.toString());
          setSemestre(data.id_semestre.toString());
          setStatus(data.status.toString());
        });
    }).catch(err => console.error('Erro ao buscar dados:', err));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const disciplinaAtualizada = {
      id: parseInt(id),
      descricao,
      id_curso: parseInt(curso),
      id_semestre: parseInt(semestre),
      status: parseInt(status),
    };

    fetch('https://projeto-iii-4.vercel.app/disciplinas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(disciplinaAtualizada),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Disciplina atualizada:', data);
        navigate('/disciplinas');
      })
      .catch(err => console.error('Erro ao atualizar disciplina:', err));
  };

  return (
    <div className="tela-cadastro-disciplina">
      <h2>Editar Disciplina</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="descricao">Descrição:</label>
          <input
            type="text"
            id="descricao"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            required
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
          <label htmlFor="semestre">Semestre:</label>
          <select
            id="semestre"
            value={semestre}
            onChange={e => setSemestre(e.target.value)}
            required
          >
            <option value="">Selecione o Semestre</option>
            {semestres.map(sem => (
              <option key={sem.id} value={sem.id}>{sem.descricao}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={status}
            onChange={e => setStatus(e.target.value)}
            required
          >
            <option value="">Selecione o Status</option>
            <option value="1">Ativa</option>
            <option value="0">Inativa</option>
          </select>
        </div>
        <button type="submit">Salvar Alterações</button>
      </form>
    </div>
  );
};

export default EditarDisciplina;
