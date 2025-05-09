import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CadastroSemestre.css';

const EditarSemestre = () => {
  const { id } = useParams(); // Obtém o id da URL
  const navigate = useNavigate();

  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [padrao, setPadrao] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch(`https://projeto-iii-4.vercel.app/semestres/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setDescricao(data.descricao);
        setDataInicio(data.data_inicio.split('T')[0]);
        setDataFim(data.data_final.split('T')[0]);
        setPadrao(data.padrao);
      })
      .catch((err) => console.error('Erro ao buscar semestre:', err));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const semestreAtualizado = {
      id,  // Envia o ID no corpo junto com os dados atualizados
      descricao,
      data_inicio: new Date(dataInicio).toISOString(),
      data_final: new Date(dataFim).toISOString(),
      padrao,
    };

    fetch('https://projeto-iii-4.vercel.app/semestres', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(semestreAtualizado),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Semestre atualizado:', data);
        navigate('/semestres');
      })
      .catch((err) => console.error('Erro ao atualizar semestre:', err));
  };

  return (
    <div className="tela-cadastro-semestre">
      <h2>Editar Semestre</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="descricao">Descrição:</label>
          <input
            type="text"
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="dataInicio">Data de Início:</label>
          <input
            type="date"
            id="dataInicio"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="dataFim">Data de Fim:</label>
          <input
            type="date"
            id="dataFim"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="padrao">Padrão:</label>
          <select
            id="padrao"
            value={padrao}
            onChange={(e) => setPadrao(Number(e.target.value))}
          >
            <option value={0}>Sim</option>
            <option value={1}>Não</option>
          </select>
        </div>

        <button type="submit">Salvar Alterações</button>
      </form>
    </div>
  );
};

export default EditarSemestre;
