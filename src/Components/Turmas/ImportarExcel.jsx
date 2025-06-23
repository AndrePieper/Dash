import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import './CadastroTurma.css';
import PopUpTopo from '../PopUp/PopUpTopo';

// ✅ Função reutilizável exportada
export const processarExcel = async (file, token) => {
  const id_turma = localStorage.getItem("id_turma");

  if (!id_turma) {
    console.log("ID da turma não encontrado.");
    return;
  }

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const primeiraAba = workbook.SheetNames[0];
  const raw = XLSX.utils.sheet_to_json(workbook.Sheets[primeiraAba], { header: 1 });

  if (raw.length < 2) {
    throw new Error("Arquivo Excel está vazio ou mal formatado.");
  }

  const headers = raw[0].map(h => h.toLowerCase());
  const dados = raw.slice(1).map(linha => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = linha[i];
    });
    return obj;
  });

  for (const linha of dados) {
    const { nome, cpf, ra } = linha;

    if (!nome || !cpf || !ra) {
      console.warn("Dados incompletos:", linha);
      continue;
    }

    const usuario = {
      nome: String(nome),
      cpf: String(cpf),
      ra: String(ra),
      tipo: 0
    };

    try {
      const res = await fetch("https://projeto-iii-4.vercel.app/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(usuario),
      });

      if (!res.ok) {
        console.error(`Erro ao importar: ${nome}`);
        continue;
      }

      const usuarioCriado = await res.json();

      await fetch("https://projeto-iii-4.vercel.app/turma/alunos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_turma: parseInt(id_turma),
          id_aluno: usuarioCriado.id
        }),
      });

    } catch (err) {
      console.error(`Erro ao enviar ${nome}`, err);
    }
  }
};

// ✅ Componente principal
const ImportarExcel = () => {
  const inputFileRef = useRef(null);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const abrirSeletorArquivo = () => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  };

  const handleArquivoSelecionado = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const token = localStorage.getItem("token");
      await processarExcel(file, token);
      setPopup({
        show: true,
        message: "Importação finalizada.",
        type: "success"
      });
    } catch (err) {
      setPopup({
        show: true,
        message: err.message || "Erro durante importação.",
        type: "error"
      });
    }
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    try {
      const token = localStorage.getItem("token");
      await processarExcel(file, token);
      setPopup({
        show: true,
        message: "Importação finalizada.",
        type: "success"
      });
    } catch (err) {
      setPopup({
        show: true,
        message: err.message || "Erro durante importação.",
        type: "error"
      });
    }
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  return (
    <div className="container-importar">
      <h1 style={{ marginBottom: '1rem' }}>Painel de Importação de Alunos</h1>
      <h2>Importar dados via Excel</h2>
      {popup.show && <PopUpTopo message={popup.message} type={popup.type} />}

      <a href="/modelo.xlsx" download>
        <button className="botao-download-modelo">📥 Baixar Modelo Excel</button>
      </a>

      <div
        className="dropzone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={abrirSeletorArquivo}
        style={{ cursor: 'pointer' }}
      >
        <p>Arraste o arquivo Excel aqui ou clique para selecionar</p>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleArquivoSelecionado}
          ref={inputFileRef}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default ImportarExcel;