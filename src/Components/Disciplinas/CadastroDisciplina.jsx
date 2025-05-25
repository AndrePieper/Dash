import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastroDisciplina.css';

const CadastroDisciplina = () => {
  const [descricao, setDescricao] = useState('');
  const [curso, setCurso] = useState('');
  const [semestre, setSemestre] = useState('');
  const [status, setStatus] = useState('');
  const [cargaHorario, setCargaHorario] = useState(''); // novo estado para carga_horario
  const [cursos, setCursos] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('https://projeto-iii-4.vercel.app/cursos', {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCursos(data))
      .catch(err => console.error('Erro ao buscar cursos:', err));

    fetch('https://projeto-iii-4.vercel.app/semestres', {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setSemestres(data))
      .catch(err => console.error('Erro ao buscar semestres:', err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const novaDisciplina = {
      descricao,
      id_curso: parseInt(curso),
      id_semestre: parseInt(semestre),
      status: parseInt(status),
      carga_horario: parseInt(cargaHorario),  // enviar carga_horario como número
    };

    fetch('https://projeto-iii-4.vercel.app/disciplinas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(novaDisciplina),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Disciplina cadastrada:', data);
        navigate('/disciplinas');
      })
      .catch(err => console.error('Erro ao cadastrar disciplina:', err));
  };

  return (
    <div className="tela-cadastro-disciplina">
      <h2>Cadastrar Disciplina</h2>
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
          <label htmlFor="cargaHorario">Carga Horária:</label>
          <input
            type="number"
            id="cargaHorario"
            value={cargaHorario}
            onChange={e => setCargaHorario(e.target.value)}
            required
            placeholder="Digite a carga horária"
            min="1"
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
            <option value="">Selecione o Status</option>
            <option value="1">Ativa</option>
            <option value="0">Inativa</option>
          </select>
        </div>
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default CadastroDisciplina;
