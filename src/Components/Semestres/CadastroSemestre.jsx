import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastroSemestre.css';

import PopUpTopo from '../PopUp/PopUpTopo';

const CadastroSemestre = () => {
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [padrao, setPadrao] = useState(0); // Novo estado para o campo "padrão"
  const navigate = useNavigate();

    const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const handleSubmit = async (e) => {
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

    try {

      const res = await fetch('https://projeto-iii-4.vercel.app/semestres', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(novoSemestre),
      })

      const data = await res.json()
          
      if (!res.ok) {
        console.log(data.message)
        throw new Error(data.message || "Erro ao cadastrar semestre")
      }

      setPopup({
        show: true,
        message: data.message || "Semestre cadastrado com sucesso!",
        type: "success",
      });
      setTimeout(() => navigate("/semestres"), 1500)


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
        <h2>Cadastrar Semestre</h2>
      </div>

      {popup.show && (
        <PopUpTopo message={popup.message} type={popup.type} />
      )}
      
      <div className="tela-usuarios">
        <div className="container-form">
          <form onSubmit={handleSubmit}>
              <label htmlFor="descricao">Descrição:</label>
              <input
                type="text"
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
              />
              <label htmlFor="dataInicio">Data de Início:</label>
              <input
                type="date"
                id="dataInicio"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                required
              />
              <label htmlFor="dataFim">Data de Fim:</label>
              <input
                type="date"
                id="dataFim"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                required
              />
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
            <button type="submit">Cadastrar</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CadastroSemestre;
