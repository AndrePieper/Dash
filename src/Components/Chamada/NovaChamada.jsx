import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Box, Typography } from '@mui/material';
import './NovaChamada.css';

function NovaChamada() {
  const [modalCardFinalizar, setCardFinalizar] = useState(false);
  const [dadosChamada, setDadosChamada] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const id_chamada = localStorage.getItem("id_chamada");
    const hora_inicio = localStorage.getItem("hora_inicio") || new Date().toISOString();
    setDadosChamada({ id_chamada, hora_inicio });
  }, []);

  const qrData = dadosChamada
    ? JSON.stringify({
        id_chamada: dadosChamada.id_chamada,
        hora_inicio: dadosChamada.hora_inicio,
      })
    : '';

  const finalizarChamada = async () => {
    const token = localStorage.getItem("token");
    const dataHoraFinal = new Date().toISOString();
    const idChamada = dadosChamada?.id_chamada;
    if (!idChamada) return;

    try {
      const resposta = await fetch("https://projeto-iii-4.vercel.app/chamadas/finalizar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
        body: JSON.stringify({
          id: idChamada,
          data_hora_final: dataHoraFinal,
        }),
      });
      if (resposta.ok) {
        alert("Chamada finalizada com sucesso!");
        navigate("/home");
        window.location.reload();
      } else {
        const resultado = await resposta.json();
        alert(resultado.message || "Erro ao finalizar chamada.");
      }
    } catch {
      alert("Erro ao finalizar chamada.");
    }
  };

  const abrirModalFinalizar = () => setCardFinalizar(true);
  const cancelarFinalizacao = () => setCardFinalizar(false);
  const confirmarFinalizacao = () => {
    setCardFinalizar(false);
    finalizarChamada();
  };

  return (
    <div className="pagina-com-menu">
      <header className="header-tela">
        <Typography variant="h5" component="h1" sx={{ color: '#222', fontWeight: 'bold' }}>
          Nova Chamada - Gerar QR Code
        </Typography>
      </header>

      <main className="conteudo-principal">
        {dadosChamada ? (
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <QRCodeCanvas
                value={qrData}
                size={280}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={true}
              />
            </Box>
            <Typography variant="body1" sx={{ textAlign: 'center', mb: 2 }}>
              <strong>ID Chamada:</strong> {dadosChamada.id_chamada}
            </Typography>
            <Typography variant="body1" sx={{ textAlign: 'center', mb: 4 }}>
              <strong>Hora Início:</strong> {new Date(dadosChamada.hora_inicio).toLocaleString()}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant="contained" color="error" onClick={abrirModalFinalizar}>
                Finalizar Chamada
              </Button>
            </Box>
          </>
        ) : (
          <Typography sx={{ textAlign: 'center' }}>Carregando dados da chamada...</Typography>
        )}
      </main>

      <Modal open={modalCardFinalizar} onClose={cancelarFinalizacao}>
        <Box className="ModalContainer">
          <Typography variant="h6" sx={{ mb: 2 }}>
            Deseja mesmo finalizar a chamada agora?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <Button variant="contained" color="success" onClick={confirmarFinalizacao}>
              Confirmar
            </Button>
            <Button variant="outlined" color="error" onClick={cancelarFinalizacao}>
              Cancelar
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default NovaChamada;
