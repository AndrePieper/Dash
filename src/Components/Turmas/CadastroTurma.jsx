import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastroTurma.css';

const CadastroTurma = () => {
  const [semestre, setSemestre] = useState('1'); // Definindo o valor default como 1
  const [curso, setCurso] = useState('');
  const [status, setStatus] = useState('');
  const [cursos, setCursos] = useState([]);
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
        console.log('Dados do curso:', data);
        setCursos(data);
      })
      .catch(err => console.error('Erro ao buscar cursos:', err));
  }, []);  

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const novaTurma = {
      semestre_curso: semestre, // Agora o semestre estará como '1' por padrão
      id_curso: curso,
      status: status
    };

    fetch('https://projeto-iii-4.vercel.app/turmas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(novaTurma),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Turma cadastrada:", data);
        navigate('/turmas'); // Redireciona de volta para a página de turmas após o cadastro
      })
      .catch((err) => console.error('Erro ao cadastrar turma:', err));
  };

  return (
    <div className="tela-cadastro-turma">
      <h2>Cadastrar Turma</h2>
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
            required
          >
            <option value="">Selecione o Status</option>
            <option value="1">Concluído</option>
            <option value="0">Cursando</option>
          </select>
        </div>
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default CadastroTurma;
