import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CadastroTurma.css';

// import { Card, CardContent } from "../../components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import PopUpTopo from '../PopUp/PopUpTopo';


const EditarTurma = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [semestre, setSemestre] = useState('');
  const [curso, setCurso] = useState('');
  const [status, setStatus] = useState('');
  const [cursos, setCursos] = useState([]);

  const [alunosTurma, setAlunosTurma] = useState([]);

  const [popup, setPopup] = useState({ show: false, message: "", type: "" })



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

      fetch(`https://projeto-iii-4.vercel.app/turma/alunos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setAlunosTurma(data))
        .catch((err) => {
          console.error('Erro ao buscar alunos da turma:', err);
          setPopup({
            show: true,
            message: "Erro ao buscar alunos da turma",
            type: "error"
          });
          setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2000);
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

  return (
    <div className="tela-turmas">
      <div className="header-turmas">
        <h2>Editar Turma</h2>
      </div>

      {popup.show && (
            <PopUpTopo message={popup.message} type={popup.type} />
      )}

       {/* <div style={{ display: 'flex', gap: '20px' }}>
    <form onSubmit={handleSubmit} style={{ flex: 1 }}>
      <Card>
        <CardContent className="p-4 space-y-4">
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
        </CardContent>
      </Card>
    </form>

    <div style={{ flex: 1 }}>
      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="alunos">
            <TabsList className="mb-4">
              <TabsTrigger value="alunos">Alunos</TabsTrigger>
              <TabsTrigger value="disciplinas">Disciplinas</TabsTrigger>
            </TabsList>

            <TabsContent value="alunos">
              <h3 className="text-lg font-semibold mb-2">Alunos vinculados à turma</h3>
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b font-medium">
                    <th className="p-2">Nome do Aluno</th>
                  </tr>
                </thead>
                <tbody>
                  {alunosTurma.length === 0 ? (
                    <tr>
                      <td className="p-2">Nenhum aluno vinculado</td>
                    </tr>
                  ) : (
                    alunosTurma.map((aluno) => (
                      <tr key={aluno.id} className="border-t">
                        <td className="p-2">{aluno.Usuario?.nome}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </TabsContent>

            <TabsContent value="disciplinas">
              <p>Conteúdo das disciplinas ainda será implementado.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  </div> */}

      <form onSubmit={handleSubmit}>
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
    </div>
  );
};

export default EditarTurma;
