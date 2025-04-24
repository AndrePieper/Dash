import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastroCurso.css';

const CadastroCurso = () => {
  const [descricao, setDescricao] = useState('');
  const [qtdSemestres, setQtdSemestres] = useState('');
  const [status, setStatus] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const novoCurso = {
      descricao,
      qtd_semestres: parseInt(qtdSemestres),
      status: parseInt(status),
    };

    fetch('https://projeto-iii-4.vercel.app/cursos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(novoCurso),
    })
      .then((res) => res.json())
      .then(() => navigate('/cursos'))
      .catch((err) => console.error('Erro ao cadastrar curso:', err));
  };

  return (
    <div className="tela-cadastro-semestre">
      <h2>Cadastrar Curso</h2>
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
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default CadastroCurso;
