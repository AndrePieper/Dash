import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import ModaisChamada from "../Chamada/ModaisChamada";

export default function Home({ nomeProfessor, idProfessor, token }) {
  const [chamadas, setChamadas] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    if (!idProfessor || !token) return;

    fetch(`https://projeto-iii-4.vercel.app/chamadas/professor/?id_professor=${idProfessor}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType.includes("application/json")) {
          throw new Error("Resposta inválida da API");
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setChamadas(data);
        } else {
          console.warn("Resposta inesperada:", data);
          setChamadas([]);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar chamadas:", err);
        setChamadas([]);
      });
  }, [idProfessor, token]);

  if (!idProfessor || !token) {
    return <div className="ml-[220px] p-6">Carregando dados do professor...</div>;
  }

  return (
    <div className="ml-[220px] p-6 bg-gray-100 min-h-screen">
      <h2 className="text-xl font-semibold mb-4">NOME PROFESSOR: {nomeProfessor}</h2>

      <div className="flex gap-4 mb-6">
        <div className="bg-blue-500 text-white p-4 rounded-lg shadow w-1/3">
          <p className="font-semibold">Aulas Por Dia da Semana</p>
          {/* gráfico ou imagem aqui */}
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg shadow w-1/3">
          <p className="font-semibold">Aulas Aplicadas Por Mês</p>
        </div>
        <div className="bg-gray-600 text-white p-4 rounded-lg shadow w-1/3">
          <p className="font-semibold">Aulas Por Matéria</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Últimas chamadas</h3>
        <div className="border-b border-gray-300 mb-2" />
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="pb-1">Disciplina</th>
              <th className="pb-1">Data</th>
            </tr>
          </thead>
          <tbody>
            {chamadas.map((chamada, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="py-2">{chamada.nome_disciplina}</td>
                <td className="py-2">{chamada.data_hora_inicio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => setModalAberto(true)}
        className="fixed bottom-8 right-8 bg-green-500 text-white rounded-full p-4 shadow-lg hover:bg-green-600"
      >
        <Plus size={28} />
      </button>

      <ModaisChamada isOpen={modalAberto} onClose={() => setModalAberto(false)} />
    </div>
  );
}
