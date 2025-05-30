import React, { useState } from "react";
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
}) => {
  const [abrirModalConfirmarEncerramento, setAbrirModalConfirmarEncerramento] = useState(false);

  const fecharModalMatérias = () => {
    setAbrirModalSelecionarMateria(false);
    setMateriaSelecionada("");
  };

  const confirmarMateriaSelecionada = () => {
    if (!tokenDecodificado || !materiaSelecionada) {
      return;
    }

    const dataHoraInicio = new Date().toISOString();
    const chamadaData = {
      id_professor: tokenDecodificado.id,
      id_disciplina: materiaSelecionada.id_disciplina,
      data_hora_inicio: dataHoraInicio,
    };

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
        };
        setQRCodeData(qrData);
        setIdChamadaCriada(data.id);
        setModalQRCodeAberto(true);
      })
      .catch(() => {
        // Tratar erro visualmente
      });
  };

  const abrirConfirmarEncerramento = () => {
    setAbrirModalConfirmarEncerramento(true);
  };

  const cancelarEncerramento = () => {
    setAbrirModalConfirmarEncerramento(false);
  };

  const confirmarEncerramento = () => {
    if (!idChamadaCriada) {
      setAbrirModalConfirmarEncerramento(false);
      return;
    }

    const dataHoraFinal = new Date().toISOString();

    fetch("https://projeto-iii-4.vercel.app/chamadas/finalizar", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        id: idChamadaCriada,
        data_hora_final: dataHoraFinal,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao encerrar chamada");
        return res.json();
      })
      .then(() => {
        setModalQRCodeAberto(false);
        setAbrirModalConfirmarEncerramento(false);
        window.location.reload();
      })
      .catch(() => {
        setAbrirModalConfirmarEncerramento(false);
      });
  };

  const fecharConfirmacao = () => {
    setAbrirModalConfirmacao(false);
  };

  const confirmarChamada = () => {
    if (!tokenDecodificado || !chamadaSelecionada) {
      return;
    }

    const dataHoraInicio = new Date().toISOString();
    const chamadaData = {
      id_professor: tokenDecodificado.id,
      id_disciplina: chamadaSelecionada.id_disciplina,
      data_hora_inicio: dataHoraInicio,
    };

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
      .then(() => {
        fecharConfirmacao();
      })
      .catch(() => {
        // Tratar erro visualmente
      });
  };

  return (
    <>
      <Dialog open={abrirModalSelecionarMateria} onClose={fecharModalMatérias}>
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
                    {materia.descricao}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModalMatérias}>Cancelar</Button>
          <Button
            onClick={confirmarMateriaSelecionada}
            color="primary"
            variant="contained"
            disabled={!materiaSelecionada}
          >
            Iniciar Chamada
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalQRCodeAberto} onClose={() => setModalQRCodeAberto(false)}>
        <DialogTitle>QR Code da Chamada</DialogTitle>
        <DialogContent dividers style={{ textAlign: "center" }}>
          {qrCodeData && <QRCodeCanvas value={JSON.stringify(qrCodeData)} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={abrirConfirmarEncerramento} color="secondary" variant="contained">
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
          <Button onClick={cancelarEncerramento}>Cancelar</Button>
          <Button onClick={confirmarEncerramento} color="primary" variant="contained">
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
          <Button onClick={fecharConfirmacao}>Cancelar</Button>
          <Button onClick={confirmarChamada} color="primary" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ModaisChamada;
