import React, { useEffect, useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { FaPlus, FaTrash, FaPrint, FaComment } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  List,
  ListItem,
  IconButton,
  Divider,
  Modal,
  Box,
  Tooltip,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "/src/assets/grupo-fasipe.png";
import PopUpTopo from '../PopUp/PopUpTopo';
import "./EditarChamada.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";



const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: "80vh",
  overflowY: "auto",
};

const EditarChamada = () => {
  const { id } = useParams();
  const location = useLocation();
  const { id_disciplina } = location.state || {};

  const [alunosPresentes, setAlunosPresentes] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [alunosFaltantes, setAlunosFaltantes] = useState([]);
  const [alunosSelecionados, setAlunosSelecionados] = useState([]);
  const [alunoParaRemover, setAlunoParaRemover] = useState(null);
  const [observacao, setObservacao] = useState(null);
  const [modalRemocaoOpen, setModalRemocaoOpen] = useState(false);

  const [modalLocalizacaoAberto, setModalLocalizacaoAberto] = useState(false);

  const [nomeProfessor, setNomeProfessor] = useState(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ordemAscendente, setOrdemAscendente] = useState(true);
  const [ordenarPor, setOrdenarPor] = useState(null);
  const [filtroNome, setFiltroNome] = useState('');


  let registrosPorPagina; 
  if (screen.height >= 769 && screen.height <= 1079) {
    registrosPorPagina = 7
  } else if (screen.height >= 1079 && screen.height <= 1200) {
    registrosPorPagina = 9
  } else if (screen.height > 1200) {
    registrosPorPagina = 10
  } else if (screen.height < 769){
    registrosPorPagina = 5
  }

  const alunosOrdenados = useMemo(() => {
    
    return [...alunosPresentes].sort((a, b) => {
      let valA = a['aluno'];
      let valB = b['aluno'];
      
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA > valB) return ordemAscendente ? 1 : -1;
      if (valA < valB) return ordemAscendente ? -1 : 1;
      return 0;
    });
    }, [alunosPresentes, ordemAscendente]);
    
    const totalPaginas = Math.ceil(alunosOrdenados.length / registrosPorPagina);
    const alunosPaginados = alunosOrdenados.slice(
      (paginaAtual - 1) * registrosPorPagina,
      paginaAtual * registrosPorPagina
    );
    // Atualiza a ordenação
    // const handleOrdenar = (campo) => {
    //   if (ordenarPor === campo) {
    //     setOrdemAscendente(!ordemAscendente);
    //   } else {
    //     setOrdenarPor(campo);
    //     setOrdemAscendente(true);
    //   }
    // };



  const token = localStorage.getItem("token");

  useEffect(() => {

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.nome) {
          setNomeProfessor(payload.nome);
          localStorage.setItem("nome_professor", payload.nome);
        }
      } catch (e) {
        console.error("Erro ao decodificar token para nome do professor:", e);
      }
    }
  }, [token]);
  const [chamadaInfo, setChamadaInfo] = useState(null);

  useEffect(() => {
  if (id && token) {
    buscarChamada();
  }
}, [id, token]);

const [enderecoAluno, setEnderecoAluno] = React.useState('Carregando endereço...');
React.useEffect(() => {
  const lat = alunosSelecionados?.latitude;
  const lon = alunosSelecionados?.longitude;

  const coordenadasValidas =
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    lat !== 0 &&
    lon !== 0;

  if (modalLocalizacaoAberto) {
    if (coordenadasValidas) {
      buscarEndereco(lat, lon).then(setEnderecoAluno);
    } else {
      setEnderecoAluno('Endereço não disponível');
    }
  }
}, [modalLocalizacaoAberto, alunosSelecionados]);

const buscarChamada = () => {
  fetch(`https://projeto-iii-4.vercel.app/chamadas/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erro ao buscar informações da chamada.");
      return res.json();
    })
    .then((data) => {

      const dataHoraInicio = new Date(data.data_hora_inicio);
      const dataHoraFim = new Date(data.data_hora_final);

      const formatarData = (data) => {
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        return `${dia}/${mes}/${ano}`;
      };

      const formatarHora = (data) => {
        const hora = String(data.getHours()).padStart(2, '0');
        const minuto = String(data.getMinutes()).padStart(2, '0');
        const segundo = String(data.getSeconds()).padStart(2, '0');
        return `${hora}:${minuto}:${segundo}`;
      };

      const dataFormatada = formatarData(dataHoraInicio);
      const horaInicio = formatarHora(dataHoraInicio);
      const horaFim = formatarHora(dataHoraFim);

      setChamadaInfo({
        ...data,
        descricao_disciplina: data.descricao,
        dataFormatada,
        horaInicio,
        horaFim,
      });
    })
    .catch((err) => {
      setPopup({
        show: true,
        message: err.message || "Erro inesperado!",
        type: "error",
      });
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
    });
};

  const buscarAlunosPresentes = () => {
    fetch(`https://projeto-iii-4.vercel.app/chamada/presencas/?id_chamada=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar alunos da chamada.");
        return res.json();
      })
      .then(setAlunosPresentes)
      .catch((err) => {
        setPopup({
          show: true,
          message: err.message || "Erro inesperado!",
          type: "error",
        });
        setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
      });
  };

  useEffect(() => {
    if (!id) {
      setPopup({
        show: true,
        message: "Erro na chamada.",
        type: "error",
      });
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
      return;
    }
    buscarAlunosPresentes();
  }, [id]);

  const confirmarRemocaoAluno = () => {
    if (!alunoParaRemover) return;

    fetch(
      `https://projeto-iii-4.vercel.app/chamada/alunos/remover?id_chamada=${id}&id_aluno=${alunoParaRemover.id_aluno}`,
      {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ observacao })
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ao remover aluno: ${res.status}`);
        return res.json();
      })
      .then(() => {
        setAlunosPresentes((prev) =>
          prev.map((aluno) =>
            aluno.id_aluno === alunoParaRemover.id_aluno
              ? { ...aluno, status: 0 }
              : aluno
          )
        );
        setModalRemocaoOpen(false);
        setAlunoParaRemover(null);
        buscarAlunosPresentes();
      })
      .catch((err) => {
        setPopup({
          show: true,
          message: err.message || "Erro inesperado!",
          type: "error",
        });
        setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
        setModalRemocaoOpen(false);
      });
  };

  const abrirModal = () => {
    if (!id_disciplina) {
      setPopup({
        show: true,
        message: "Erro na disciplina.",
        type: "error",
      });
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
      return;
    }

    fetch(`https://projeto-iii-4.vercel.app/chamada/falta?id_disciplina=${id_disciplina}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar alunos faltantes.");
        return res.json();
      })
      .then((data) => {
        const alunosOrdenados = [...data].sort((a, b) =>
        (a.aluno || a.nome || "").localeCompare(b.aluno || b.nome || ""));
        setAlunosFaltantes(alunosOrdenados);
        setAlunosSelecionados([]);
        setModalOpen(true);
      })
      .catch((err) => {
        setPopup({
          show: true,
          message: err.message || "Erro inesperado!",
          type: "error",
        });
        setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
      });
  };

  const toggleAlunosSelecionados = (id_aluno) => {
    setAlunosSelecionados((prev) =>
      prev.includes(id_aluno)
        ? prev.filter((id) => id !== id_aluno)
        : [...prev, id_aluno]
    );
  };

  const adicionarAlunos = () => {
    if (alunosSelecionados.length === 0) {
      alert("Selecione pelo menos um aluno.");
      return;
    }

    Promise.all(
      alunosSelecionados.map((id_aluno) =>
        fetch("https://projeto-iii-4.vercel.app/chamada/alunos/manual", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id_chamada: id, id_aluno }),
        }).then(async (res) => {
          if (res.ok) {
            return res.json();
          } else if (res.status === 409) {
            // Aluno já está na chamada, segue o fluxo
            return null;
          } else {
            throw new Error(`Erro ao adicionar aluno ID ${id_aluno}`);
          }
        })
      )
    )
      .then(() => {
        const novos = alunosFaltantes.filter((a) =>
          alunosSelecionados.includes(a.id_aluno)
        );
        const novosFormatados = novos.map((a) => ({
          id_aluno: a.id_aluno,
          status: 1,
          Aluno: { aluno: a.aluno },
        }));

        setAlunosPresentes((prev) => {
          const atualizados = [...prev];
          novosFormatados.forEach((novo) => {
            const existe = atualizados.find((a) => a.id_aluno === novo.id_aluno);
            if (!existe) atualizados.push(novo);
          });
          return [...atualizados];
        });

        setModalOpen(false);
        buscarAlunosPresentes();
      })
      .catch((err) => {
        setPopup({
          show: true,
          message: err.message || "Erro inesperado!",
          type: "error",
        });
        setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
      });
  };

const buscarEndereco = async (lat, lon) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    const data = await res.json();

    const addr = data.address || {};
    const enderecoFormatado = [
      addr.road,
      addr.house_number,
      addr.neighbourhood,
      addr.city || addr.town || addr.village,
      addr.state,
    ].filter(Boolean).join(", ");

    return enderecoFormatado || "Endereço não encontrado";
  } catch (error) {
    return "Erro ao buscar endereço";
  }
};



const imprimirChamada = () => {
  if (!nomeProfessor) {
    alert("Nome do professor não está disponível. Aguarde o carregamento e tente novamente.");
    return;
  }

  if (!chamadaInfo) {
    alert("Informações da chamada não foram carregadas. Tente novamente.");
    return;
  }

  const doc = new jsPDF();
  const img = new Image();
  img.src = logo;

  // Usa diretamente os dados da chamadaInfo
  const dataHoraInicio = chamadaInfo.data_hora_inicio ? new Date(chamadaInfo.data_hora_inicio) : null;
  const dataHoraFim = chamadaInfo.data_hora_final ? new Date(chamadaInfo.data_hora_final) : null;

  const dataFormatada = dataHoraInicio
    ? dataHoraInicio.toLocaleDateString("pt-BR")
    : "";

  const horaInicio = dataHoraInicio
    ? dataHoraInicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "";

  const horaFim = dataHoraFim
    ? dataHoraFim.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "";

  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const logoBase64 = canvas.toDataURL("image/png");

    const alturaTexto = 21; 
    const posX = 10;
    const posY = 20;
    const proporcao = img.width / img.height;
    const larguraLogo = alturaTexto * proporcao;

    doc.addImage(logoBase64, "PNG", posX, posY, larguraLogo, alturaTexto);

    doc.setFontSize(16);
    doc.text(`Relatório da Chamada nº ${chamadaInfo.id || ""}`, 80, 20);

    doc.setFontSize(12);
    doc.text(`Professor: ${nomeProfessor || ""}`, 80, 30);
    doc.text(`Disciplina: ${chamadaInfo.descricao_disciplina || ""}`, 80, 36);
    doc.text(`Data: ${dataFormatada}`, 80, 42);
    doc.text(`Início: ${horaInicio}`, 80, 48);
    doc.text(`Fim: ${horaFim}`, 80, 54);

    let startY = 60;
    doc.setFontSize(14);
    doc.text("Alunos Presentes", 14, startY);
  


      const presentesData = alunosOrdenados
        .filter((aluno) => aluno.status === 1)
        .map((aluno) => [aluno.id_aluno, aluno.aluno]);

      autoTable(doc, {
        startY: startY + 4,
        head: [["ID", "Nome"]],
        body: presentesData,
        styles: { fontSize: 11, halign: "center", valign: "middle" },
        headStyles: {
          fillColor: [46, 125, 50],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
        },
      });

      doc.save(`chamada_${chamadaInfo.id}.pdf`);
    };

    img.onerror = () => {
      alert("Erro ao carregar a imagem da logo.");
    };
  };
  const alunosFiltrados = alunosFaltantes.filter(a =>
    (a.nome || '').toLowerCase().includes(filtroNome.toLowerCase())
  );

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

return (
  <> 
    <header className="header-usuarios">
      <h2>Editar Chamada</h2>
    </header>

    {popup.show && (
      <PopUpTopo message={popup.message} type={popup.type} />
    )}  

    <div className="tela-usuarios">

    <Typography variant="h6">Alunos Presentes:</Typography>
    <List>
      {alunosPaginados.map((aluno) => (
        <div key={aluno.id_aluno}>
          <ListItem>
            <Box display="flex" justifyContent="space-between" width="100%">
              <Typography style={{ width: '300px' }}>{aluno.aluno}</Typography>
              <Typography
                style={{ width: 100, textAlign: "center" }}
                color={aluno.status === 1 ? "green" : "#c40000"}
              >
                {aluno.status === 1 ? "Presente" : "Removido"}
              </Typography>
              <Typography style={{ width: '200px', display: 'flex', justifyContent: 'center' }}>
                {aluno.data_hora_presenca ? new Date(aluno.data_hora_presenca).toLocaleTimeString() : 'Presença Manual'}
              </Typography>
              <div>
                <IconButton
                  edge="end"
                  style={{ marginRight: '20px' }}
                  onClick={() => {
                    setAlunosSelecionados(aluno);
                    setModalLocalizacaoAberto(true);
                    buscarEndereco(aluno.latitude, aluno.longitude);
                  }}
                >
                  <FaLocationDot color={aluno.proximo === 1 ? "#1155ff" : (aluno.data_hora_presenca ? "#ffa400" : "#ff0000")} /> { /* 1 - Próximo */ }
                </IconButton>
                {aluno.status === 1 ? (
                  <IconButton
                    edge="end"
                    onClick={() => {
                      setAlunoParaRemover(aluno);
                      setModalRemocaoOpen(true);
                      setObservacao(null);
                    }}
                  >
                    <FaTrash />
                  </IconButton>
                ) : (
                  <Tooltip
                    title={aluno.observacao || "Sem observação"}
                    arrow
                    componentsProps={{
                      tooltip: {
                        sx: {
                          fontSize: '1rem',
                          maxWidth: 300,
                          whiteSpace: 'pre-line',
                        },
                      },
                    }}
                  >
                    <span>
                      <IconButton edge="end" tabIndex={10}>
                        <FaComment />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </div>
            </Box>
          </ListItem>
          <Divider />
        </div>
      ))}
    </List>


    </div>
      <div className="rodape-principal"> 
        <div className="paginacao-container-vinculo">
          <button
            onClick={() => setPaginaAtual(paginaAtual - 1)}
            disabled={paginaAtual === 1}
            className={`botao-paginacao ${paginaAtual === 1 ? 'desabilitado' : ''}`}
          >
            <FiArrowLeft size={20} />
          </button>
    
          <span className="paginacao-texto">Página {paginaAtual} de {totalPaginas}</span>
    
          <button
            onClick={() => setPaginaAtual(paginaAtual + 1)}
            disabled={paginaAtual === totalPaginas}
            className={`botao-paginacao ${paginaAtual === totalPaginas ? 'desabilitado' : ''}`}
          >
            <FiArrowRight size={20} />
          </button>
        </div>

        <div className="adicionar-principal">
          <Button
            variant="contained"
            className="botao-adicionar-vinculo"
            onClick={abrirModal}
            title="Adicionar Presença"
          >
          <FaPlus size={'30px'}/>
          </Button>
          <Button
            style={{ marginLeft: "10px" }}
            onClick={imprimirChamada}
            className="botao-download"
            disabled={!nomeProfessor}
            title={"Imprimir Lista de Presença"}
          >
            <FaPrint size={30} />
          </Button>
        </div>
      </div>

    {/* MODAL DE LOCALIZAÇÃO FORA DO MAP */}
    <Dialog
      open={modalLocalizacaoAberto}
      onClose={() => setModalLocalizacaoAberto(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Localização do Aluno</DialogTitle>
      <DialogContent>
        <Typography><strong>Aluno:</strong> {alunosSelecionados?.aluno}</Typography>
        <Typography>
          <strong>Hora da Presença:</strong>{" "}
          {alunosSelecionados?.data_hora_presenca
            ? new Date(alunosSelecionados.data_hora_presenca).toLocaleString()
            : "Presença Manual"}
        </Typography>
        <Typography><strong>Endereço da Presença:</strong> {enderecoAluno}</Typography>

        {(alunosSelecionados?.latitude && alunosSelecionados?.longitude) ? (
          <div style={{ marginTop: 20 }}>
          {alunosSelecionados?.latitude && alunosSelecionados?.longitude && (
      <MapContainer
        key={`${alunosSelecionados.latitude}-${alunosSelecionados.longitude}`} // força recriação
        center={[alunosSelecionados.latitude, alunosSelecionados.longitude]}
        zoom={16}
        scrollWheelZoom={false}
        style={{ height: "400px", width: "100%", borderRadius: 8 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <Marker position={[alunosSelecionados.latitude, alunosSelecionados.longitude]}>
          <Popup>{alunosSelecionados.aluno}</Popup>
        </Marker>
      </MapContainer>
    )}

          </div>
        ) : (
          <Typography color="error" style={{ marginTop: 20 }}>
            Localização não disponível.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
      <Button
      className="botao-excluir"
      onClick={() => setModalLocalizacaoAberto(false)}
    >
      Fechar
    </Button>

      </DialogActions>
    </Dialog>

    {/* Modal de adicionar */}
    <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
      <Box sx={styleModal}>
        <Typography variant="h6" gutterBottom>
          Adicionar alunos à chamada
        </Typography>

        <input
          type="text"
          placeholder="Buscar por nome"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />

        <div className="lista-alunos-disponiveis" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {alunosFiltrados.length === 0 ? (
            <p>Nenhum aluno faltante encontrado.</p>
          ) : (
            alunosFiltrados.map((aluno) => (
              <label key={aluno.id_aluno} style={{ display: 'flex', padding: '5px' }}>
                <input
                  type="checkbox"
                  checked={alunosSelecionados.includes(aluno.id_aluno)}
                  onChange={(e) =>
                    setAlunosSelecionados((prev) =>
                      e.target.checked
                        ? [...prev, aluno.id_aluno]
                        : prev.filter((id) => id !== aluno.id_aluno)
                    )
                  }
                  style={{ marginRight: '10px' }}
                />
                {aluno.nome}
              </label>
            ))
          )}
        </div>

        <Box display="flex" justifyContent="flex-end" mt={2} gap={2}>
          <Button onClick={() => setModalOpen(false)} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={adicionarAlunos} variant="contained">
            Adicionar
          </Button>
        </Box>
      </Box>
    </Modal>

    {/* Modal de remover */}
    <Modal open={modalRemocaoOpen} onClose={() => setModalRemocaoOpen(false)}>
      <Box sx={styleModal}>
        <Typography variant="h6">
          Deseja remover a presença do aluno{" "}
          <strong>{alunoParaRemover?.aluno}</strong>?
        </Typography>
        <Box mt={2}>
          <label>Motivo da remoção</label>
          <input 
            type="text" 
            value={observacao} 
            placeholder="Descreva o motivo da remoção"
            onChange={(e) => setObservacao(e.target.value)}
            style={{ width: "100%", height: "40px", marginTop: "4px" }}
            /> 
        </Box>
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button onClick={() => setModalRemocaoOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" 
            onClick={() => {
              if (!observacao || observacao.length < 10) {
                setPopup({
                  show: true,
                  message: "Por favor, insira uma observação com pelo menos 10 caracteres.",
                  type: "error",
                });
                setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
                return;
              }
              confirmarRemocaoAluno()
            }
          }>
            Remover
          </Button>
        </Box>
      </Box>
    </Modal>
  </>
);
};

export default EditarChamada;