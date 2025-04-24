import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastroSemestre.css';

const CadastroSemestre = () => {
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [padrao, setPadrao] = useState(0); // Novo estado para o campo "padrão"
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    // Garantir que as datas estão no formato ISO 8601 (com hora no formato 'T00:00:00Z')
    const dataInicioISO = new Date(dataInicio).toISOString();
    const dataFimISO = new Date(dataFim).toISOString();

    const novoSemestre = {
      descricao,
      data_inicio: dataInicioISO,  // Agora estamos enviando em formato ISO
      data_final: dataFimISO,      // E a data_final também
      padrao: padrao,               // Incluindo o valor do campo "padrão"
    };

    fetch('https://projeto-iii-4.vercel.app/semestres', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(novoSemestre),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Semestre cadastrado:', data);
        navigate('/semestres'); // Volta para a listagem de semestres
      })
      .catch((err) => console.error('Erro ao cadastrar semestre:', err));
  };

  return (
    <div className="tela-cadastro-semestre">
      <h2>Cadastrar Semestre</h2>
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
            onChange={(e) => setPadrao(Number(e.target.value))} // Converte para número (0 ou 1)
            required
          >
            <option value={0}>Sim</option>
            <option value={1}>Não</option>
          </select>
        </div>

        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default CadastroSemestre;
