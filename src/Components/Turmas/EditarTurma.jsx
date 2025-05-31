import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CadastroTurma.css';

import PopUpTopo from '../PopUp/PopUpTopo';

const EditarTurma = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [semestre, setSemestre] = useState('');
  const [curso, setCurso] = useState('');
  const [status, setStatus] = useState('');
  const [cursos, setCursos] = useState([]);

  const [popup, setPopup] = useState({ show: false, message: "", type: "" })

  // Armazenar Alunos
  const [abaSelecionada, setAbaSelecionada] = useState('alunos');
  const [alunos, setAlunos] = useState([]);

  // Armazenar Discilpinas
  const [disciplinas, setDisciplinas] = useState([]);

  // Filtro
  const [filtroSemestre, setFiltroSemestre] = useState('');


  useEffect(() => {
    const token = localStorage.getItem("token");
  
    // Buscar cursos primeiro
    fetch('https://projeto-iii-4.vercel.app/cursos', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data =>  setCursos(data))
      .catch((err) => {
        console.error('Erro ao buscar cursos:', err)
        setPopup({
          show: true,
          message: err.message || "Erro inesperado!",
          type: "error",
        });

        setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2000);
      });

      // Buscar dados da turma
      fetch(`https://projeto-iii-4.vercel.app/turmas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setSemestre(data.semestre_curso); // Agora o semestre será o valor direto
          setCurso(data.id_curso);
          setStatus(data.status.toString());
        })
        .catch((err) => {
          console.error('Erro ao buscar turmas:', err)
          setPopup({
            show: true,
            message: err.message || "Erro inesperado!",
            type: "error",
          });

          setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2000);
        });

        // Buscar alunos vinculados a turma
        fetch(`https://projeto-iii-4.vercel.app/turma/alunos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => {
            if (!res.ok) {
              if (res.status === 404) return [];
              throw new Error("Erro ao buscar alunos.");
            }
            return res.json();
          })
          .then(data => {
            setAlunos(Array.isArray(data) ? data : []);
          })
          .catch(err => {
            console.error(err);
            setAlunos([]); // Garante array vazio mesmo em caso de erro
          });

          // Buscar disciplinas vinculados a turma
          fetch(`https://projeto-iii-4.vercel.app/turma/disciplinas/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => {
              if (!res.ok) {
                if (res.status === 404) return [];
                throw new Error("Erro ao buscar disciplinas.");
              }
              return res.json();
            })
            .then(data => {
              setDisciplinas(Array.isArray(data) ? data : []);
            })
            .catch(err => {
              console.error(err);
              setDisciplinas([]);
            });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
  
    const turmaAtualizada = {
      id: parseInt(id),
      semestre_curso: parseInt(semestre), // Agora é um valor direto
      id_curso: parseInt(curso),
      status: parseInt(status),
    };
  
    try {

      const res = await fetch('https://projeto-iii-4.vercel.app/turmas', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(turmaAtualizada),
    })

    const data = await res.json()
  
    if (!res.ok) {
      console.log(data.message)
      throw new Error(data.message || "Erro ao alterar turma")
    }

    setPopup({
      show: true,
      message: data.message || "Turma alterado com sucesso!",
      type: "success",
    });

    setTimeout(() => navigate("/turmas"), 1500)

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

  const semestresDisponiveis = [...new Set(disciplinas.map((d) => d.Semestre?.descricao))];

  const disciplinasFiltradas = filtroSemestre
  ? disciplinas.filter((d) => d.Semestre?.descricao === filtroSemestre)
  : disciplinas;

  return (
    <div className="tela-turmas">
      <div className="header-turmas">
        <h2>Editar Turma</h2>
      </div>
  
      {popup.show && (
        <PopUpTopo message={popup.message} type={popup.type} />
      )}
  
      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* CARD 1: FORMULÁRIO */}
        <form onSubmit={handleSubmit} style={{ flex: 1, background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 0 5px rgba(0,0,0,0.1)' }}>
          <div>
            <label htmlFor="semestre">Semestre:</label>
            <input
              type="number"
              id="semestre"
              value={semestre}
              onChange={(e) => setSemestre(e.target.value)}
              required
              placeholder="Digite o semestre"
            />
          </div>
          <div>
            <label htmlFor="curso">Curso:</label>
            <select
              id="curso"
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              required
            >
              <option value="">Selecione o Curso</option>
              {cursos.map((cur) => (
                <option key={cur.id} value={cur.id}>{cur.descricao}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="">Selecione o Status</option>
              <option value="0">Cursando</option>
              <option value="1">Concluído</option>
            </select>
          </div>
          <button type="submit">Salvar Alterações</button>
        </form>
  
        {/* CARD 2: GESTÃO DE VÍNCULOS */}
        <div style={{ flex: 1, background: '#f9f9f9', padding: '1rem', borderRadius: '8px', boxShadow: '0 0 5px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button
              onClick={() => setAbaSelecionada('alunos')}
              style={{
                backgroundColor: abaSelecionada === 'alunos' ? '#009232' : '#ccc',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Alunos
            </button>
            <button
              onClick={() => setAbaSelecionada('disciplinas')}
              style={{
                backgroundColor: abaSelecionada === 'disciplinas' ? '#009232' : '#ccc',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Disciplinas
            </button>
          </div>
  
          {/* CONTEÚDO DAS ABAS */}
          {abaSelecionada === 'alunos' && (
            <div>
              <h3>Alunos Vinculados</h3>
              {alunos.length === 0 ? (
                <p>Nenhum aluno vinculado à turma.</p>
              ) : (
                <table className="tabela-usuarios" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Nome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alunos.map((aluno) => (
                      <tr key={aluno.id}>
                        <td style={{ padding: '0.5rem', borderBottom: '1px solid #D0D0D0' }}>{aluno.Usuario?.nome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
  
          {abaSelecionada === 'disciplinas' && (
            <div>
            <h3>Disciplinas Vinculadas</h3>
        
            {disciplinas.length === 0 ? (
              <p>Nenhuma disciplina vinculada à turma.</p>
            ) : (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <select
                    id="filtroSemestre"
                    value={filtroSemestre}
                    onChange={(e) => setFiltroSemestre(e.target.value)}
                    style={{ padding: '0.4rem', width: '50%', display: 'flex', alignItems: 'rigth' }}
                  >
                    <option value="">Todos os Semestres</option>
                    {semestresDisponiveis.map((semestre) => (
                      <option key={semestre} value={semestre}>
                        {semestre}
                      </option>
                    ))}
                  </select>
                </div>
        
                <table className="tabela-usuarios" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Disciplina</th>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Semestre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disciplinasFiltradas.map((item) => (
                      <tr key={item.id}>
                        <td style={{ padding: '0.5rem', borderBottom: '1px solid #D0D0D0' }}>{item.Disciplina?.descricao || '—'}</td>
                        <td style={{ padding: '0.5rem', borderBottom: '1px solid #D0D0D0' }}>{item.Semestre?.descricao || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
  
  // return (
  //   <div className="tela-turmas">
  //     <div className="header-turmas">
  //       <h2>Editar Turma</h2>
  //     </div>

  //     {popup.show && (
  //           <PopUpTopo message={popup.message} type={popup.type} />
  //     )}

  //     <form onSubmit={handleSubmit}>
  //       <div>
  //         <label htmlFor="semestre">Semestre:</label>
  //         <input
  //           type="number"
  //           id="semestre"
  //           value={semestre}
  //           onChange={(e) => setSemestre(e.target.value)}
  //           required
  //           placeholder="Digite o semestre"
  //         />
  //       </div>
  //       <div>
  //         <label htmlFor="curso">Curso:</label>
  //         <select
  //           id="curso"
  //           value={curso}
  //           onChange={(e) => setCurso(e.target.value)}
  //           required
  //         >
  //           <option value="">Selecione o Curso</option>
  //           {cursos.map((cur) => (
  //             <option key={cur.id} value={cur.id}>{cur.descricao}</option>
  //           ))}
  //         </select>
  //       </div>
  //       <div>
  //         <label htmlFor="status">Status:</label>
  //         <select
  //           id="status"
  //           value={status}
  //           onChange={(e) => setStatus(e.target.value)}
  //           required
  //         >
  //           <option value="">Selecione o Status</option>
  //           <option value="0">Cursando</option>
  //           <option value="1">Concluído</option>
  //         </select>
  //       </div>
  //       <button type="submit">Salvar Alterações</button>
  //     </form>
  //   </div>
  // );
};

export default EditarTurma;
