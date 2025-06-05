import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import "./ModaisChamada.css";

const ModaisChamada = ({
  abrirModalSelecionarMateria,
  setAbrirModalSelecionarMateria,
  abrirModalConfirmacao,
  setAbrirModalConfirmacao,
  modalQRCodeAberto,
  setModalQRCodeAberto,
  materias,
  materiaSelecionada,
  setMateriaSelecionada,
  carregandoMaterias,
  setCarregandoMaterias,
  chamadaSelecionada,
  tokenDecodificado,
  setQRCodeData,
  setIdChamadaCriada,
  qrCodeData,
  idChamadaCriada,
  onChamadaCriada,
}) => {
  const [abrirModalConfirmarEncerramento, setAbrirModalConfirmarEncerramento] = useState(false);

  const fecharModalMatérias = () => {
    setAbrirModalSelecionarMateria(false);
    setMateriaSelecionada("");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (modalQRCodeAberto && e.key === "Escape") {
        e.preventDefault();
        abrirConfirmarEncerramento();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalQRCodeAberto]);

  const confirmarMateriaSelecionada = () => {
    if (!tokenDecodificado || !materiaSelecionada) return;

    if (!navigator.geolocation) {
      alert("Geolocalização não suportada pelo navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const dataHoraInicio = new Date().toISOString();
        const chamadaData = {
          id_professor: tokenDecodificado.id,
          id_disciplina: materiaSelecionada.id_disciplina,
          data_hora_inicio: dataHoraInicio,
          latitude,
          longitude,
        };

        console.log("Enviando POST para /chamadas com:", JSON.stringify(chamadaData, null, 2));

        fetch("https://projeto-iii-4.vercel.app/chamadas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify(chamadaData),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Erro ao iniciar a chamada");
            return res.json();
          })
          .then((data) => {
            fecharModalMatérias();
            const qrData = {
              id: data.id,
              id_professor: chamadaData.id_professor,
              id_disciplina: chamadaData.id_disciplina,
              data_hora_inicio: chamadaData.data_hora_inicio,
              lat_professor: latitude,
              long_professor: longitude,
            };
            setQRCodeData(qrData);
            setIdChamadaCriada(data.id);
            setModalQRCodeAberto(true);
          })
          .catch(() => {});
      },
      (error) => {
        alert("Erro ao obter localização: " + error.message);
      }
    );
  };

  const abrirConfirmarEncerramento = () => setAbrirModalConfirmarEncerramento(true);
  const cancelarEncerramento = () => setAbrirModalConfirmarEncerramento(false);

  const confirmarEncerramento = () => {
    if (!idChamadaCriada) return cancelarEncerramento();

    const dataHoraFinal = new Date().toISOString();

    const encerramentoData = {
      id: idChamadaCriada,
      data_hora_final: dataHoraFinal,
    };

    console.log("Enviando PUT para /chamadas/finalizar com:", JSON.stringify(encerramentoData, null, 2));

    fetch("https://projeto-iii-4.vercel.app/chamadas/finalizar", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify(encerramentoData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao encerrar chamada");
        return res.json();
      })
      .then(() => {
        setModalQRCodeAberto(false);
        setAbrirModalConfirmarEncerramento(false);
        if (onChamadaCriada) onChamadaCriada();
      })
      .catch(cancelarEncerramento);
  };

  const fecharConfirmacao = () => setAbrirModalConfirmacao(false);

  const confirmarChamada = () => {
    if (!tokenDecodificado || !chamadaSelecionada) return;

    if (!navigator.geolocation) {
      alert("Geolocalização não suportada pelo navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const dataHoraInicio = new Date().toISOString();
        const chamadaData = {
          id_professor: tokenDecodificado.id,
          id_disciplina: chamadaSelecionada.id_disciplina,
          data_hora_inicio: dataHoraInicio,
          lat_professor: latitude,
          long_professor: longitude,
        };

        console.log("Enviando POST para /chamadas com:", JSON.stringify(chamadaData, null, 2));

        fetch("https://projeto-iii-4.vercel.app/chamadas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify(chamadaData),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Erro ao iniciar a chamada");
            return res.json();
          })
          .then(fecharConfirmacao)
          .catch(() => {});
      },
      (error) => {
        console.log("Erro ao obter localização: " + error.message);
      }
    );
  };

  return (
    <>
      <Dialog open={abrirModalSelecionarMateria} onClose={fecharModalMatérias} maxWidth="md" fullWidth>
        <DialogTitle>Selecione a Matéria</DialogTitle>
        <DialogContent dividers>
          {carregandoMaterias ? (
            <CircularProgress />
          ) : (
            <FormControl fullWidth>
              <InputLabel id="select-materia-label">Matéria</InputLabel>
              <Select
                labelId="select-materia-label"
                value={materiaSelecionada}
                onChange={(e) => setMateriaSelecionada(e.target.value)}
                label="Matéria"
              >
                {materias.map((materia) => (
                  <MenuItem key={materia.id_disciplina} value={materia}>
                    {materia.descricao_disciplina}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModalMatérias} className="btn-vermelho">
            Cancelar
          </Button>
          <Button onClick={confirmarMateriaSelecionada} className="btn-verde">
            Iniciar Chamada
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={modalQRCodeAberto}
        onClose={() => setModalQRCodeAberto(false)}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>QR Code da Chamada</DialogTitle>
        <DialogContent dividers>
          <div className="qr-modal-content">
            <div className="qr-instructions">
              <Typography variant="body1">Acesse o seu aplicativo</Typography>
              <Typography variant="body1">Realize Login com o seu email e senha cadastrados</Typography>
              <Typography variant="body1">Selecione a opção de “Registrar”</Typography>
              <Typography variant="body1">Centralize o QRCode na sua tela até que a presença seja registrada</Typography>
            </div>
            <div className="qr-code">
              {qrCodeData && <QRCodeCanvas value={JSON.stringify(qrCodeData)} />}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={abrirConfirmarEncerramento} className="btn-verde" variant="contained">
            Encerrar Chamada
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={abrirModalConfirmarEncerramento} onClose={cancelarEncerramento}>
        <DialogTitle>Confirmar Encerramento</DialogTitle>
        <DialogContent dividers>
          <Typography>Deseja mesmo encerrar a chamada?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelarEncerramento} className="btn-vermelho">
            Cancelar
          </Button>
          <Button onClick={confirmarEncerramento} className="btn-verde" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={abrirModalConfirmacao} onClose={fecharConfirmacao}>
        <DialogTitle>Confirmar Início da Chamada</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Deseja iniciar a chamada para <strong>{chamadaSelecionada?.descricao}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharConfirmacao} className="btn-vermelho">
            Cancelar
          </Button>
          <Button onClick={confirmarChamada} className="btn-verde" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ModaisChamada;
