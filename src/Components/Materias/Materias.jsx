import React, { useEffect, useState } from 'react';
import './Materias.css';

const Materias = () => {
  const [materias, setMaterias] = useState([]);
  const token = localStorage.getItem("token");
  const idProfessor = localStorage.getItem("id_professor");

  useEffect(() => {
    if (!idProfessor) {
      console.error("ID do professor não encontrado no localStorage.");
      return;
    }

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
    <>
      <div className="header-usuarios">
        <h2>Matérias Vinculadas</h2>
      </div>

      <div className="tela-usuarios no-scroll">
        <table className="tabela-usuarios">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição</th>
              <th>Carga Horária</th>
              <th>Semestre</th>
            </tr>
          </thead>
          <tbody>
            {materias.length > 0 ? (
              materias.map((m, idx) => (
                <tr key={`${m.id_disciplina}-${idx}`}>
                  <td>{m.id_disciplina}</td>
                  <td>{m.descricao}</td>
                  <td>{m.carga_horaria}</td>
                  <td>{m.semestre}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>
                  Nenhuma matéria encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Materias;
