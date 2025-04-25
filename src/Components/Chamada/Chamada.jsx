import React, { useEffect, useState } from 'react';
import './Chamada.css';
import { FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Chamada = () => {
  const [chamadas, setChamadas] = useState([]);
  const [mensagemErro, setMensagemErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    let tipoUsuario = localStorage.getItem("tipo");
    const idProfessor = localStorage.getItem("idProfessor");
  
    // Garantir que tipoUsuario seja um número inteiro
    tipoUsuario = Number(tipoUsuario);  // Ou pode usar parseInt(tipoUsuario, 10)
  
    console.log("tipoUsuario:", tipoUsuario, "idProfessor:", idProfessor, token);
  
    let url;
  
    // Se o tipo do usuário for 1 e houver o idProfessor salvo, ajusta o parâmetro para 'id_professor' na URL
    if (tipoUsuario === 1 && idProfessor) {
      // Revertendo para 'id_professor' na URL para corresponder à API
      url = `https://projeto-iii-4.vercel.app/chamadas/professor/?id_professor=${idProfessor}`;
    } else {
      url = "https://projeto-iii-4.vercel.app/chamadas";
    }
  
    // Adicionando o log da URL que será enviada no GET
    console.log("URL enviada no GET:", url);
    console.log("Headers:", {
      Authorization: token,
    });
  
    fetch(url, {
      headers: {
        Authorization: token,
      },
    })
    .then( async res => {
      const data = await res.json();

      if (!res.ok){

        console.log(data.message)
        throw new Error('Erro ao buscar usuário');

      }
      return res.json;
      })
      .then((dados) => {
        // Adicionando o log para exibir a resposta (dados) recebida da API
        console.log("Dados recebidos da API:", dados);
  
        setChamadas(dados);
      })
      .then(data => {

        console.log('Resposta da API inesperada:', data);
        
        })
      .catch((error) => {
        setMensagemErro(error.message);
        console.error("Erro no fetch:", error.message);
      });
  }, []);
  
  return (
    <div className="tela-chamadas">
      <div className="header-chamadas">
        <h2>Chamadas Antigas</h2>
      </div>

      {mensagemErro && <p className="mensagem-erro">{mensagemErro}</p>}

      <table className="tabela-chamadas">
        <thead>
          <tr>
            <th>ID</th>
            <th>Data</th>
            <th>Turma</th>
            <th>Disciplina</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {chamadas.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{new Date(c.data).toLocaleDateString()}</td>
              <td>{c.Turma?.Curso?.descricao} - {c.Turma?.semestre_curso}</td>
              <td>{c.Disciplina?.descricao}</td>
              <td>
                <button className="btn-editar" onClick={() => handleEditarChamada(c.id)}>
                  <FaEdit size={20} color="#4caf50" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Chamada;
