import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Login/Login';
import Layout from './Components/MenuLateral/Layout';
import Home from './Components/Home/Home';
import Chamadas from './Components/Chamada/Chamada';
import Materias from './Components/Materias/Materias';
import Entidades from './Components/Entidades/Entidades';
import Disciplinas from './Components/Disciplinas/Disciplinas';
import Cursos from './Components/Cursos/Cursos';

import Turmas from './Components/Turmas/Turmas';
import CadastroTurma from './Components/Turmas/CadastroTurma'; 
import EditarTurma from './Components/Turmas/EditarTurma';

import Semestres from './Components/Semestres/Semestres';
import CadastroSemestre from './Components/Semestres/cadastroSemestre';
import EditarSemestre from './Components/Semestres/EditarSemestre';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Layout />}>
  
          <Route path="/home" element={<Home />} />

          <Route path="/chamadas" element={<Chamadas />} />

          <Route path="/materias" element={<Materias />} />

          <Route path="/entidades" element={<Entidades />} />

          <Route path="/disciplinas" element={<Disciplinas />} />

          <Route path="/cursos" element={<Cursos />} />

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
