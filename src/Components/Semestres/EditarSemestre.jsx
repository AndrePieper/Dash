import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CadastroSemestre.css';

import PopUpTopo from '../PopUp/PopUpTopo';

const EditarSemestre = () => {
  const { id } = useParams(); // Obtém o id da URL
  const navigate = useNavigate();

  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [padrao, setPadrao] = useState(0);

   const [popup, setPopup] = useState({ show: false, message: "", type: "" });

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
      .catch((err) => {
        console.error('Erro ao buscar semestre: ', err)
        setPopup({
          show: true,
          message: err.message || "Erro inesperado!",
          type: "error",
        });

        setTimeout(() => setPopup({ show: false, message: "", type: "" }), navigate("/semestres"), 2000);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const semestreAtualizado = {
      id,  // Envia o ID no corpo junto com os dados atualizados
      descricao,
      data_inicio: new Date(dataInicio).toISOString(),
      data_final: new Date(dataFim).toISOString(),
      padrao,
    };

    try {

      const res = await fetch('https://projeto-iii-4.vercel.app/semestres', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(semestreAtualizado),
      })

      const data = await res.json()
  
      if (!res.ok) {
        console.log(data.message)
        throw new Error(data.message || "Erro ao alterar semestre")
      }
  
      setPopup({
        show: true,
        message: data.message || "Semestre alterado com sucesso!",
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
       <h2>Editar Semestre</h2>
      </div>

      <div className="tela-usuarios">
        <div className="container-form">
          {popup.show && (
              <PopUpTopo message={popup.message} type={popup.type} />
          )}

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
                onChange={(e) => setPadrao(Number(e.target.value))}
              >
                <option value={0}>Sim</option>
                <option value={1}>Não</option>
              </select>
            <button type="submit">Salvar Alterações</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditarSemestre;
