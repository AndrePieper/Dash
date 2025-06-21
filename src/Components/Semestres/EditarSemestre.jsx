import React, { useState, useEffect, useRef, useMemo  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import './CadastroSemestre.css';

import PopUpTopo from '../PopUp/PopUpTopo';
import { green } from '@mui/material/colors';

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
            <button onClick={onClose} className="modal-cancel">Cancelar</button>
            {onConfirm && <button onClick={onConfirm} className="modal-confirm">Confirmar</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditarSemestre = () => {
  const { id } = useParams(); // Obtém o id da URL
  const navigate = useNavigate();

  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [padrao, setPadrao] = useState(0);

  // Disciplinas do professor no semestre
  const [professorDisciplinas, setProfessorDisciplinas] = useState([]);

  // Modal
  const [modalData, setModalData] = useState(null);
    // Professores a serem selecionados
    const [usuarios, setUsuarios] = useState([]);
    // Disciplinas a serem selecionadas
    const [disciplinas, setDisciplinas] = useState([]);

    const [filtroProfessor, setFiltroProfessor] = useState('');
    const [filtroDisciplina, setFiltroDisciplina] = useState('');
    const [professorSelecionado, setProfessorSelecionado] = useState(null);
    const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(null);

    const [paginaAtual, setPaginaAtual] = useState(1);


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

    // Buscar disciplinas vinculados a turma
    fetch(`https://projeto-iii-4.vercel.app/semestre/${id}/disciplinas`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) return [];
          throw new Error("Erro ao buscar disciplinas do professor.");
        }
        return res.json();
      })
      .then(data => {
        setProfessorDisciplinas(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error(err);
        setProfessorDisciplinas([]);
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

  const abrirModalExclusao = (idVinculo) => {
    setModalData({ tipo: 'excluir', idVinculo });
  };

  const confirmarExclusao = async () => {
    const token = localStorage.getItem('token');
    const idVinculo = modalData.idVinculo;

    try {
      const res = await fetch(`https://projeto-iii-4.vercel.app/semestre/disciplinas/${idVinculo}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao excluir disciplina do professor.");

      setProfessorDisciplinas(prev => {
        const novaLista = prev.filter(a => a.id !== idVinculo);
        if (novaLista.length <= (paginaAtual - 1) * registrosPorPagina && paginaAtual > 1) {
          setPaginaAtual(paginaAtual - 1);
        }
        return novaLista;
      });
      setModalData(null);
    } catch (error) {
      console.error(error);
    }
  };

  const abrirModalAdicionar = async () => {
    const token = localStorage.getItem('token');
    const resU = await fetch(`https://projeto-iii-4.vercel.app/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const dataU = await resU.json();
    setUsuarios(dataU.filter(u => u.tipo === 1));

    const resd = await fetch(`https://projeto-iii-4.vercel.app/disciplinas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const datad = await resd.json();
    setDisciplinas(Array.isArray(datad) ? datad : [])

    setModalData({ tipo: 'adicionar' });
  };

  const confirmarAdicao = async () => {
    const token = localStorage.getItem('token');
  
    if (!professorSelecionado || !disciplinaSelecionada) {
      alert("Selecione um professor e uma disciplina.");
      return;
    }
  
    try {
      const res = await fetch(`https://projeto-iii-4.vercel.app/semestre/disciplinas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id_professor: professorSelecionado,
          id_disciplina: disciplinaSelecionada,
          id_semestre: parseInt(id)
        })
      });
  
      if (!res.ok) throw new Error("Erro ao adicionar vínculo.");
  
      const resAtualizado = await fetch(`https://projeto-iii-4.vercel.app/semestre/${id}/disciplinas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const novasDisciplinas = await resAtualizado.json();
      setProfessorDisciplinas(Array.isArray(novasDisciplinas) ? novasDisciplinas : []);
  
      setModalData(null);
      setProfessorSelecionado(null);
      setDisciplinaSelecionada(null);
  
      // const novoTotalPaginas = Math.ceil((novasDisciplinas.length) / registrosPorPagina);
      // setPaginaAtual(novoTotalPaginas);
  
    } catch (error) {
      console.error(error);
    }
  };
  

  const registrosPorPagina = 3;
  const totalPaginas = Math.ceil(professorDisciplinas.length / registrosPorPagina);
  const vinculosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * registrosPorPagina;
    const fim = inicio + registrosPorPagina;
    return professorDisciplinas.slice(inicio, fim);
  }, [professorDisciplinas, paginaAtual]);

    // Navegação das páginas Disciplina
    const handlePaginaAnterior = () => {
      if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1);
    };
    const handleProximaPagina = () => {
      if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1);
    };


  return (
    <>
      <div className="header-usuarios">
       <h2>Editar Semestre</h2>
      </div>

      <div className="tela-usuarios">
        
          {popup.show && (
              <PopUpTopo message={popup.message} type={popup.type} />
          )}

        <div style={{ display: 'flex', gap: '2rem' }} >
          {/* CARD 1: FORMULÁRIO */}
          <form onSubmit={handleSubmit} style={{ flex: 1, background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 0 5px rgba(0,0,0,0.1)' }}>
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
            <button className='botao-gravar' type="submit">Salvar Alterações</button>
          </form>

          {/* CARD 2: GESTÃO DE VÍNCULOS */}
          <div style={{ flex: 1, background: '#f9f9f9', padding: '1rem', borderRadius: '8px', boxShadow: '0 0 5px rgba(0,0,0,0.1)' }}>
            {/* CONTEÚDO DAS ABAS */}
            <div>
              <h3>Disciplinas Professores</h3>
              {professorDisciplinas.length === 0 ? (
                <p>Nenhuma disciplina vinculada a professores.</p>
              ) : (
                <table className="tabela-usuarios" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Professor</th>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Disciplina</th>
                      <th style={{ width: '15%' }}>Remover</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vinculosPaginados.map((professorDisciplina) => (
                      <tr key={disciplinas.id}>
                        <td style={{ padding: '0.5rem', borderBottom: '1px solid #D0D0D0' }}>{professorDisciplina.nome_professor}</td>
                        <td style={{ padding: '0.5rem', borderBottom: '1px solid #D0D0D0' }}>{professorDisciplina.descricao_disciplina}</td>
                        <td style={{ justifyContent: 'center', display: 'flex' }}>
                          <button 
                            onClick={() => abrirModalExclusao(professorDisciplina.id)} 
                            className="botao-excluir"
                          >
                            <FaTrash size={20}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              )}
              <div className="rodape-card">
                <div className="paginacao-container-vinculos">

                  <button
                    onClick={handlePaginaAnterior}
                    className={`botao-paginacao ${paginaAtual === 1 ? 'desabilitado' : ''}`}
                  >
                    <FiArrowLeft size={20} />
                  </button>

                  <span className="paginacao-texto">Página {paginaAtual } de {totalPaginas}</span>

                  <button
                    onClick={handleProximaPagina}
                    className={`botao-paginacao ${paginaAtual === totalPaginas ? 'desabilitado' : ''}`}
                  >
                    <FiArrowRight size={20} />
                  </button>

                </div>
                <div className="adicionar-vinculo">
                  <button onClick={abrirModalAdicionar} className="botao-adicionar-vinculo" >
                    <FaPlus size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {modalData?.tipo === 'excluir' && (
            <Modal
              onClose={() => setModalData(null)}
              onConfirm={confirmarExclusao}
            >
              <p>Você realmente deseja remover a disciplina deste professor?</p>
            </Modal>
          )}

          {modalData?.tipo === 'adicionar' && (
           <Modal
            onClose={() => setModalData(null)}
            onConfirm={confirmarAdicao}
          >

            <h3>Adicionar disciplina ao professor</h3>
              <label>Buscar Professor:</label>
              <input
                type="text"
                value={filtroProfessor}
                onChange={(e) => setFiltroProfessor(e.target.value)}
                placeholder="Digite o nome do professor"
              />

              <select
                value={professorSelecionado || ''}
                onChange={(e) => setProfessorSelecionado(parseInt(e.target.value))}
              >
                <option value="">Selecione um professor</option>
                {usuarios
                  .filter((u) => u.nome.toLowerCase().includes(filtroProfessor.toLowerCase()))
                  .map((u) => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                  ))}
              </select>

              <label>Buscar Disciplina:</label>
              <input
                type="text"
                value={filtroDisciplina}
                onChange={(e) => setFiltroDisciplina(e.target.value)}
                placeholder="Digite o nome da disciplina"
              />

              <select
                value={disciplinaSelecionada || ''}
                onChange={(e) => setDisciplinaSelecionada(parseInt(e.target.value))}
              >
                <option value="">Selecione uma disciplina</option>
                {disciplinas
                  .filter((d) => d.descricao.toLowerCase().includes(filtroDisciplina.toLowerCase()))
                  .map((d) => (
                    <option key={d.id} value={d.id}>{d.descricao}</option>
                  ))}
              </select>
          </Modal>
          )}

        </div>
      </div>
    </>
  );
};

export default EditarSemestre;
