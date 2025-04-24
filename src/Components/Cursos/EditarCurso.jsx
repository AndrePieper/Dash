import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CadastroCurso.css';

const EditarCurso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [descricao, setDescricao] = useState('');
  const [qtdSemestres, setQtdSemestres] = useState('');
  const [status, setStatus] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch(`https://projeto-iii-4.vercel.app/cursos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setDescricao(data.descricao);
        setQtdSemestres(data.qtd_semestres);
        setStatus(data.status);
      })
      .catch((err) => console.error('Erro ao buscar curso:', err));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const cursoAtualizado = {
      id: parseInt(id),
      descricao,
      qtd_semestres: parseInt(qtdSemestres),
      status: parseInt(status),
    };

    fetch('https://projeto-iii-4.vercel.app/cursos', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cursoAtualizado),
    })
      .then((res) => res.json())
      .then(() => navigate('/cursos'))
      .catch((err) => console.error('Erro ao atualizar curso:', err));
  };

  return (
    <div className="tela-cadastro-semestre">
      <h2>Editar Curso</h2>
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
  );
};

export default EditarCurso;
