import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Login/Login';
import Layout from './Components/MenuLateral/Layout';

import Home from './Components/Home/Home';
import HomeADM from './Components/Home/HomeADM';

import Chamada from './Components/Chamada/Chamada';
import EditarChamada from './Components/Chamada/EditarChamada';

import Materias from './Components/Materias/Materias';

import Usuarios from './Components/Usuarios/Usuarios';
import CadastroUsuario from './Components/Usuarios/CadastroUsuario'
import EditarUsuario from './Components/Usuarios/EditarUsuario'

import Disciplinas from './Components/Disciplinas/Disciplinas';
import CadastroDisciplina from './Components/Disciplinas/CadastroDisciplina'
import EditarDisciplina from './Components/Disciplinas/EditarDisciplina'

import Cursos from './Components/Cursos/Cursos';
import CadastroCurso from './Components/Cursos/CadastroCurso';
import EditarCurso from './Components/Cursos/EditarCurso';

import Turmas from './Components/Turmas/Turmas';
import CadastroTurma from './Components/Turmas/CadastroTurma'; 
import EditarTurma from './Components/Turmas/EditarTurma';

import Semestres from './Components/Semestres/Semestres';
import CadastroSemestre from './Components/Semestres/CadastroSemestre';
import EditarSemestre from './Components/Semestres/EditarSemestre';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
         <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
  
          <Route path="/home" element={<Home />} />
          <Route path="/homeadm" element={<HomeADM />} />

          <Route path="/chamada" element={<Chamada />} />
          <Route path="/chamada/editarchamada/:id" element={<EditarChamada />} />

          <Route path="/materias" element={<Materias />} />

          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/usuarios/cadastrousuario" element={<CadastroUsuario />} />
          <Route path="/usuarios/editarusuario/:id" element={<EditarUsuario />} />

          <Route path="/disciplinas" element={<Disciplinas />} />
          <Route path="/disciplinas/cadastrodisciplina" element={<CadastroDisciplina />} />
          <Route path="/disciplinas/editardisciplina/:id" element={<EditarDisciplina />} />

          <Route path="/cursos" element={<Cursos />} />
          <Route path="/cursos/cadastrocurso" element={<CadastroCurso />} />
          <Route path="/cursos/editarcurso/:id" element={<EditarCurso />} />

          <Route path="/turmas" element={<Turmas />} />
          <Route path="/turmas/cadastroturma" element={<CadastroTurma />} />
          <Route path="/turmas/editarturma/:id" element={<EditarTurma />} />

          <Route path="/semestres" element={<Semestres />} />
          <Route path="/semestres/cadastrosemestre" element={<CadastroSemestre />} />
          <Route path="/semestres/editarsemestre/:id" element={<EditarSemestre />} />

        </Route>
      </Routes>
    </Router>
  );
};

export default App;
