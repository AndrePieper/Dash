import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaDownload } from 'react-icons/fa';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
//import ImportarExcel from './ImportarExcel';
import { processarExcel } from "./ImportarExcel";
import './CadastroTurma.css';

import PopUpTopo from '../PopUp/PopUpTopo';




const Modal = ({ title, children, onClose, onConfirm }) => {
  const modalRef = useRef();

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose(); // Fecha o modal ao clicar fora dele
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal" >
        <h3>{title}</h3>
        <div className="modal-content" ref={modalRef}>{children}
          <div className="modal-actions">
            <button onClick={onClose} className="botao-excluir" style={{ backgroundColor: 'red' }}>Cancelar</button>
            {onConfirm && <button onClick={onConfirm} className="botao-adicionar-vinculo" style={{ backgroundColor: 'green' }}>Confirmar</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditarTurma = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [semestre, setSemestre] = useState('');
  const ImportarExcel = async (file) => {
    const token = localStorage.getItem("token");
    const id_turma = localStorage.getItem("id_turma");

    try {
      await processarExcel(file, token);

      const response = await fetch(`https://projeto-iii-4.vercel.app/turma/alunos/${id_turma}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setAlunos([]);
        } else {
          throw new Error("Erro ao buscar alunos após importação.");
        }
      } else {
        const data = await response.json();
        setAlunos(Array.isArray(data) ? data : []);
      }

      setPopup({
        show: true,
        message: "Alunos importados com sucesso!",
        type: "success"
      });
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);

    } catch (err) {
      console.error("Erro no ImportarExcel:", err);
      setPopup({
        show: true,
        message: err.message || "Erro ao importar alunos.",
        type: "error"
      });
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
    }
  };

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
  const [filtroSemestre, setFiltroSemestre] = useState(''); // Filtro Pesquisa Disciplina
  const [filtroNome, setFiltroNome] = useState(''); // Filtro Adicionar Alunos

  // Modal
  const [modalData, setModalData] = useState(null);

  // Turma Alunos
  const [usuarios, setUsuarios] = useState([]);
  const [selecionados, setSelecionados] = useState([]);

  // Turma Disciplinas
  const [todasDisciplinas, setTodasDisciplinas] = useState([]);
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState([]);

  const [paginaAtualAluno, setPaginaAtualAluno] = useState(1);
  const [paginaAtualDisciplina, setPaginaAtualDisciplina] = useState(1);


  useEffect(() => {
    const token = localStorage.getItem("token");

    // Buscar cursos primeiro
    fetch('https://projeto-iii-4.vercel.app/cursos', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCursos(data))
      .catch((err) => {
        console.error('Erro ao buscar cursos:', err)
        setPopup({
          show: true,
          message: err.message || "Erro inesperado!",
          type: "error",
        });

        setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
      });

    // Buscar dados da turma
    fetch(`https://projeto-iii-4.vercel.app/turmas/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setSemestre(data.semestre_curso);
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

        setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
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
      semestre_curso: parseInt(semestre),
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

      setTimeout(() => setPopup({ show: false, message: "", type: "" }), navigate("/turmas"), 2000)

    } catch (error) {
      console.log(error.message)
      setPopup({
        show: true,
        message: error.message || "Erro inesperado!",
        type: "error",
      });

      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
    }
  };

  const abrirModalExclusao = ({ idVinculo, tipoVinculo }) => {
    console.log("abrirmodal")
    setModalData({ tipo: 'excluir', idVinculo, tipoVinculo });
  };

  const confirmarExclusao = async () => {
    const token = localStorage.getItem('token');
    const { idVinculo, tipoVinculo } = modalData;
  
    let url = '';
    if (tipoVinculo === 'aluno') {
      url = `https://projeto-iii-4.vercel.app/turma/alunos/?id_vinculo=${idVinculo}`;
    } else if (tipoVinculo === 'disciplina') {
      url = `https://projeto-iii-4.vercel.app/turma/disciplinas/?id_vinculo=${idVinculo}`;
    } else {
      console.error('Tipo de vínculo não reconhecido');
      return;
    }
  
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao excluir vínculo");
  
      setPopup({
        show: true,
        message: data.message || "Vínculo deletado com sucesso!",
        type: "success",
      });
  
      // Atualiza lista com base no tipoVinculo
      if (tipoVinculo === 'aluno') {
        setAlunos(prev => {
          const novaLista = prev.filter(a => a.id !== idVinculo);
          if (novaLista.length <= (paginaAtualAluno - 1) * registrosPorPagina && paginaAtualAluno > 1) {
            setPaginaAtualAluno(paginaAtualAluno - 1);
          }
          return novaLista;
        });
      } else if (tipoVinculo === 'disciplina') {
        setDisciplinas(prev => {
          const novaLista = prev.filter(d => d.id !== idVinculo);
          if (novaLista.length <= (paginaAtualDisciplina - 1) * registrosPorPagina && paginaAtualDisciplina > 1) {
            setPaginaAtualDisciplina(paginaAtualDisciplina - 1);
          }
          return novaLista;
        });
      }
  
      setModalData(null);
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  
    } catch (error) {
      console.error(error);
      setPopup({
        show: true,
        message: error.message || "Erro inesperado!",
        type: "error",
      });
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
    }
  };

  // Modal controle Alunos
  const abrirModalAdicionar = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`https://projeto-iii-4.vercel.app/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setUsuarios(data.filter(u => u.tipo === 0));
    setModalData({ tipo: 'adicionar' });
  };

  // Adicionar vinculo Alnuos
  const confirmarAdicao = async () => {
    const token = localStorage.getItem('token');
    try {
      for (let idAluno of selecionados) {
        await fetch(`https://projeto-iii-4.vercel.app/turma/alunos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id_turma: parseInt(id), id_aluno: idAluno })
        });
      }

      const resAtualizado = await fetch(`https://projeto-iii-4.vercel.app/turma/alunos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const novosAlunos = await resAtualizado.json();
      setAlunos(novosAlunos);

      setModalData(null);
      setSelecionados([]);
    } catch (error) {
      console.error(error);
    }
  };

  // Modal Controle Disciplinas
  const abrirModalAdicionarDisciplina = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://projeto-iii-4.vercel.app/disciplinas/curso/?id_curso=${curso}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 404) {
          console.log("Sem disciplinas deste curso")
          setPopup({
            show: true,
            message: "Não existe disciplina cadastrada para este curso.",
            type: "alert",
          });
          setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
          
          setTodasDisciplinas([])
        }
        throw new Error("Erro ao excluir aluno da turma")
      };
      const data = await res.json();
      setTodasDisciplinas(data);
      setModalData({ tipo: 'adicionarDisciplina' });
    } catch (error) {
      setTodasDisciplinas([])
      console.error("Erro ao buscar disciplinas disponíveis:", error);
    }
  };

  const confirmarAdicaoDisciplina = async () => {
    const token = localStorage.getItem('token');
    try {
      for (let idDisciplina of disciplinasSelecionadas) {
        await fetch('https://projeto-iii-4.vercel.app/turma/disciplinas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id_turma: parseInt(id), id_disciplina: idDisciplina })
        });
      }

      // Atualiza lista
      const resAtualizado = await fetch(`https://projeto-iii-4.vercel.app/turma/disciplinas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const novasDisciplinas = await resAtualizado.json();
      setDisciplinas(novasDisciplinas);

      setModalData(null);
      setDisciplinasSelecionadas([]);
    } catch (error) {
      console.error("Erro ao adicionar disciplinas:", error);
    }
  };

  const alunosFiltrados = usuarios.filter(u => u.nome.toLowerCase().includes(filtroNome.toLowerCase()));

  const semestresDisponiveis = [...new Set(disciplinas.map((d) => d.Semestre?.descricao))];

  const disciplinasFiltradas = useMemo(() => {
    return filtroSemestre
      ? disciplinas.filter((d) => d.Semestre?.descricao === filtroSemestre)
      : disciplinas;
  }, [disciplinas, filtroSemestre]);


  // Pagina os usuários ordenados
  const registrosPorPagina = 3;

  const totalPaginasAluno = Math.ceil(alunos.length / registrosPorPagina);
  const alunosPaginados = useMemo(() => {
    const inicio = (paginaAtualAluno - 1) * registrosPorPagina;
    const fim = inicio + registrosPorPagina;
    return alunos.slice(inicio, fim);
  }, [alunos, paginaAtualAluno]);

  // Navegação das páginas Alunos
  const handlePaginaAnteriorAluno = () => {
    if (paginaAtualAluno > 1) setPaginaAtualAluno(paginaAtualAluno - 1);
  };
  const handleProximaPaginaAluno = () => {
    if (paginaAtualAluno < totalPaginasAluno) setPaginaAtualAluno(paginaAtualAluno + 1);
  };

  const totalPaginasDisciplina = Math.ceil(disciplinasFiltradas.length / registrosPorPagina);
  const disciplinasPaginadas = useMemo(() => {
    const inicio = (paginaAtualDisciplina - 1) * registrosPorPagina;
    const fim = inicio + registrosPorPagina;
    return disciplinasFiltradas.slice(inicio, fim);
  }, [disciplinasFiltradas, paginaAtualDisciplina]);

  // Navegação das páginas Disciplina
  const handlePaginaAnteriorDisciplina = () => {
    if (paginaAtualDisciplina > 1) setPaginaAtualDisciplina(paginaAtualDisciplina - 1);
  };
  const handleProximaPaginaDisciplina = () => {
    if (paginaAtualDisciplina < totalPaginasDisciplina) setPaginaAtualDisciplina(paginaAtualDisciplina + 1);
  };

  return (
    <>
      <div className="header-usuarios">
        <h2>Editar Turma</h2>
      </div>

      {popup.show && (
        <PopUpTopo message={popup.message} type={popup.type} />
      )}

      <div className="tela-usuarios">
        <div style={{ display: 'flex', gap: '2rem' }} >
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
            <button className='botao-gravar' type="submit">Salvar Alterações</button>
          </form>

          {/* CARD 2: GESTÃO DE VÍNCULOS */}
          <div style={{ flex: 1, background: '#f9f9f9', padding: '5px 1rem', borderRadius: '8px', boxShadow: '0 0 5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setAbaSelecionada('alunos')}
                style={{
                  backgroundColor: abaSelecionada === 'alunos' ? '#009232' : '#4E4E4E',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  margin: '10px 0px'
                }}
              >
                Alunos
              </button>
              <button
                onClick={() => setAbaSelecionada('disciplinas')}
                style={{
                  backgroundColor: abaSelecionada === 'disciplinas' ? '#009232' : '#4E4E4E',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  margin: '10px 0px'
                }}
              >
                Disciplinas
              </button>
              

            </div>
          {/* CONTEÚDO DAS ABAS */}
            {abaSelecionada === 'alunos' && (
              <div>
                <h3 style={{ margin: '00px 0px 15px 0px' }}>Alunos Vinculados</h3>
                {alunos.length === 0 ? (
                  <p>Nenhum aluno vinculado à turma.</p>
                ) : (
                  <table className="tabela-usuarios" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Nome</th>
                        <th className='th-acao'>Remover</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alunosPaginados.map((aluno) => (
                        <tr key={aluno.id}>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #D0D0D0' }} className="dado-vinculo">{aluno.Usuario?.nome}</td>
                          <td style={{ justifyContent: 'center', display: 'flex', borderBottom: '1px solid #D0D0D0' }}>
                            <button
                              onClick={() => abrirModalExclusao({ idVinculo: aluno.id, tipoVinculo: 'aluno' })}
                              className="botao-excluir"
                            >
                              <FaTrash size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="rodape-card" >
                  <div className="paginacao-container">
                    <button
                      onClick={handlePaginaAnteriorAluno}
                      className={`botao-paginacao ${paginaAtualAluno === 1 ? 'desabilitado' : ''}`}
                    >
                      <FiArrowLeft size={20} />
                    </button>

                    <span className="paginacao-texto">Página {paginaAtualAluno} de {totalPaginasAluno}</span>

                    <button
                      onClick={handleProximaPaginaAluno}
                      className={`botao-paginacao ${paginaAtualAluno === totalPaginasAluno ? 'desabilitado' : ''}`}
                    >
                      <FiArrowRight size={20} />
                    </button>
                  </div>

                  <div className="adicionar-vinculo" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={abrirModalAdicionar} className="botao-adicionar-vinculo" title="Adicionar aluno">
                      <FaPlus size={28} />
                    </button>

                    <a
                      title="Baixar Modelo Excel Padrão"
                      href="/modelo.xlsx"
                      download
                      className="baixar-modelo"
                    >
                      <FaDownload size={20} />
                    </a>

                    <div
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                          ImportarExcel(file);
                        } else {
                          setPopup({
                            show: true,
                            message: "Por favor, envie um arquivo Excel (.xlsx)",
                            type: "alert",
                          });
                          setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      className="importar-excel"
                    >
                      Arraste o Excel aqui
                    </div>
                  </div>
                </div>
              </div>
            )}

            {abaSelecionada === 'disciplinas' && (
              <div>
                <h3>Disciplinas Vinculadas</h3>

                {disciplinas.length === 0 ? (
                  <p>Nenhuma disciplina vinculada à turma.</p>
                ) : (
                  <>
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'end' }}>
                      <select
                        id="filtroSemestre"
                        value={filtroSemestre}
                        onChange={(e) => setFiltroSemestre(e.target.value)}
                        style={{ padding: '0.4rem', width: '42%', display: 'flex', alignItems: 'rigth' }}
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
                          <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem', width: '20%' }}>Semestre</th>
                          <th className='th-acao'>Remover</th>
                        </tr>
                      </thead>
                      <tbody>
                        {disciplinasPaginadas.map((item) => (
                          <tr key={item.id}>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #D0D0D0' }}>{item.Disciplina?.descricao || '—'}</td>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #D0D0D0' }}>{item.Semestre?.descricao || '—'}</td>
                            <td style={{ justifyContent: 'center', display: 'flex', borderBottom: '1px solid #D0D0D0' }}>
                              <button
                                onClick={() => abrirModalExclusao({ idVinculo: item.id, tipoVinculo: 'disciplina' })}
                                className="botao-excluir"
                              >
                                <FaTrash size={20} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                <div className="rodape-card">
                  <div className="paginacao-container-vinculos">

                    <button
                      onClick={handlePaginaAnteriorDisciplina}
                      className={`botao-paginacao ${paginaAtualDisciplina === 1 ? 'desabilitado' : ''}`}
                    >
                      <FiArrowLeft size={20} />
                    </button>

                    <span className="paginacao-texto">Página {paginaAtualDisciplina} de {totalPaginasDisciplina}</span>

                    <button
                      onClick={handleProximaPaginaDisciplina}
                      className={`botao-paginacao ${paginaAtualDisciplina === totalPaginasDisciplina ? 'desabilitado' : ''}`}
                    >
                      <FiArrowRight size={20} />
                    </button>

                  </div>
                  <div className="adicionar-vinculo">
                    <button onClick={abrirModalAdicionarDisciplina} className="botao-adicionar-vinculo" >
                      <FaPlus size={28} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {modalData?.tipo === 'excluir' && (
          <Modal
            onClose={() => setModalData(null)}
            onConfirm={confirmarExclusao}
          >
           <strong><p>Você realmente deseja remover este vinculo desta turma?</p></strong> 
          </Modal> 
        )}

        {modalData && modalData.tipo === 'adicionar' && (
          <Modal
            onClose={() => setModalData(null)}
            onConfirm={confirmarAdicao}
          >
            <h3>Adicionar alunos à turma</h3>
            <input
              type="text"
              placeholder="Buscar por nome"
              value={filtroNome}
              onChange={e => setFiltroNome(e.target.value)}
            />
            <div className="lista-alunos-disponiveis">
              {alunosFiltrados.map(aluno => (
                <label key={aluno.id} style={{ display: 'flex', padding: '5px' }}>
                  <input
                    type="checkbox"
                    checked={selecionados.includes(aluno.id)}
                    onChange={(e) =>
                      setSelecionados((prev) =>
                        e.target.checked
                          ? [...prev, aluno.id]
                          : prev.filter((id) => id !== aluno.id)
                      )
                    }
                    style={{ width: 'auto', display: 'flex', marginRight: '10px' }}
                  />
                  {aluno.nome}
                </label>
              ))}
            </div>
          </Modal>
        )}

        {modalData && modalData.tipo === 'adicionarDisciplina' && (
          <Modal
            onClose={() => setModalData(null)}
            onConfirm={confirmarAdicaoDisciplina}
          >
            <h3>Adicionar disciplinas à turma</h3>
            <input
              type="text"
              placeholder="Buscar por nome"
              value={filtroNome}
              onChange={e => setFiltroNome(e.target.value)}
            />
            <div className="lista-disciplinas-disponiveis">
              {todasDisciplinas.length === 0 ? (
                <input>
                  Nenhuma disciplina encontrada.
                </input>
              ) : (
                todasDisciplinas
                  .filter(d => d.descricao.toLowerCase().includes(filtroNome.toLowerCase()))
                  .map((disciplina) => (
                    <label key={disciplina.id} style={{ display: 'flex', padding: '5px' }}>
                      <input
                        type="checkbox"
                        checked={disciplinasSelecionadas.includes(disciplina.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDisciplinasSelecionadas((prev) => [...prev, disciplina.id]);
                          } else {
                            setDisciplinasSelecionadas((prev) =>
                              prev.filter((id) => id !== disciplina.id)
                            );
                          }
                        }}
                        style={{ width: 'auto', display: 'flex', marginRight: '10px' }}
                      />
                      {disciplina.descricao}
                    </label>
                  ))
              )}
            </div>
          </Modal>
        )}
      </div>
    </>
  );
};

export default EditarTurma;
