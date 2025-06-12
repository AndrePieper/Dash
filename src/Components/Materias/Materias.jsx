import React, { useEffect, useState } from 'react';
import ModaisChamada from '../Chamada/ModaisChamada';
import { Box } from "@mui/material";


const Materias = () => {
  const [materias, setMaterias] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [materiaSelecionada, setMateriaSelecionada] = useState(null);
  const token = localStorage.getItem("token");
  const idProfessor = localStorage.getItem("id_professor");

  useEffect(() => {
    if (!idProfessor) {
      console.error("ID do professor não encontrado no localStorage.");
      return;
    }

    fetch(`https://projeto-iii-4.vercel.app/semestre/professor/?id_professor=${idProfessor}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMaterias(data);
        } else {
          console.error("Resposta inesperada da API:", data);
        }
      })
      .catch(err => console.error('Erro ao buscar semestres:', err));
  }, [idProfessor, token]);

  const abrirModalComMateria = (materia) => {
    setMateriaSelecionada(materia);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setMateriaSelecionada(null);
  };

  return (
    <>
      <div className="header-usuarios">
        <h2>Matérias</h2>
      </div>

      {/* <div className="tela-usuarios no-scroll">
        {materias.length > 0 ? (
          <div className="grid-cards-large">
            {materias.map((m, idx) => (
              <div
                key={`${m.id_disciplina}-card-${idx}`}
                className="card-materia-large"
                onClick={() => abrirModalComMateria(m)}
              >
                <h2>{m.descricao_disciplina}</h2>
                <p><strong>Carga Horária:</strong> {m.carga_horaria}</p>
                <p><strong>Semestre:</strong> {m.descricao_semestre}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', fontSize: '1.5rem', marginTop: '50px' }}>
            Nenhuma matéria encontrada.
          </p>
        )}
      </div> */}

      <ModaisChamada
        abrirModalSelecionarMateria={modalAberto}
        setAbrirModalSelecionarMateria={setModalAberto}
        materias={materias}
        materiaSelecionada={materiaSelecionada}
        setMateriaSelecionada={setMateriaSelecionada}
      />
    <Box className="home-container">
      <Box className="menu-lateral-placeholder" />
      <Box className="home-content">
        <Box className="cards-container">
            {materias.map((m, idx) => (
              <Box className="card">
              <div
                key={`${m.id_disciplina}-card-${idx}`}
                className="card-materia-large"
                onClick={() => abrirModalComMateria(m)}
              >
                <h2>{m.descricao_disciplina}</h2>
                <p><strong>Carga Horária:</strong> {m.carga_horaria}</p>
                <p><strong>Semestre:</strong> {m.descricao_semestre}</p>
              </div>
              </Box>
            ))}
            {/* <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agrupado.porDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#2e7d32" />
              </BarChart>
            </ResponsiveContainer> */}
        </Box>
      </Box>
    </Box>
    </>

  );
};

export default Materias;
