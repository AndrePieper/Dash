import React, { useEffect, useState } from 'react';
import './Materias.css';

const Materias = () => {
  const [materias, setMaterias] = useState([]);
  const token = localStorage.getItem("token");
  const idProfessor = localStorage.getItem("id_professor");

  useEffect(() => {
    fetch(`https://projeto-iii-4.vercel.app/semestre/professor/?id_professor=${idProfessor}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Resposta da API:", data);
        if (Array.isArray(data)) {
          setMaterias(data);
        } else {
          console.error("Resposta inesperada da API:", data);
        }
      })
      .catch((err) => console.error('Erro ao buscar semestres:', err));
  }, [idProfessor, token]);

  return (
    <div className="tela-materias">
      <div className="header-materias">
        <h2>Matérias Vinculadas</h2>
      </div>

      <table className="tabela-materias">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descrição</th>
            <th>Carga Horária</th>
            <th>Semestre</th>
          </tr>
        </thead>
        <tbody>
          {materias.map((m, idx) => (
            <tr key={`${m.id}-${idx}`}>
              <td>{m.id}</td>
              <td>{m.descricao}</td>
              <td>{m.carga_horaria}</td>
              <td>{m.semestre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Materias;
