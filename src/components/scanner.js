'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';

const QrScanner = dynamic(() => import('react-qr-scanner'), { 
  ssr: false,
  loading: () => <p>Cargando escáner QR...</p>
});

// Componente Modal
const Modal = ({ message, onClose }) => {
  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <button style={closeButtonStyle} onClick={onClose}>✖</button>
        <p style={modalText}>{message}</p>
        <img src="./south.png" alt="" />
      </div>
    </div>
  );
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  width: '100%',
  height: '100%',
};

const modalText = {
  color: '#000',
  fontSize: '20px',
  textAlign: 'center',
  backgroundColor: '#fff',
};

const modalStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  gap: '50px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '5px',
  textAlign: 'center',
  position: 'relative',
  minWidth: '90%',
  minHeight: '60%',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  border: 'none',
  background: 'none',
  fontSize: '20px',
  cursor: 'pointer',
};

const QRScanner = () => {
  const [scanResult, setScanResult] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [message, setMessage] = useState('');
  const [facingMode, setFacingMode] = useState('environment');
  const [modalVisible, setModalVisible] = useState(false);
  const [showScanner, setShowScanner] = useState(true); // Controlar el render del escáner QR

  useEffect(() => {
    return () => {
      // Cleanup function if needed
    };
  }, []);

  const handleScan = async (data) => {
    if (data) {
      try {
      setScanResult(data);

      const parsedData = JSON.parse(data.text || data);
      const ticketId = parsedData.ticket_id;
      setTicketId(ticketId);

        const response = await axios.post(
          `https://digisoftware.online/api/tickets/${ticketId}/validate/`
        );

        const { status, message } = response.data;

        if (status === 200) {
          setConfirmation(true);
          setMessage(message);
        } else {
          setConfirmation(false);
          setMessage(message || 'Error desconocido');
        }
      } catch (error) {
        console.error('Error al enviar datos QR', error);
        setConfirmation(false);
        setMessage('Error al verificar el ticket. Intente de nuevo.');
      } finally {
        setModalVisible(true); // Muestra el modal
        setShowScanner(false); // Detiene el renderizado del escáner
      }
    }
  };

  const handleError = (err) => {
    console.error('Error del escáner QR:', err);
  };

  const toggleCamera = () => {
    setFacingMode(prevMode => (prevMode === 'user' ? 'environment' : 'user'));
  };

  const handleRescan = () => {
    setModalVisible(false); // Oculta el modal
    setShowScanner(true); // Muestra el escáner nuevamente
    setTicketId(''); // Resetea el ticket ID
    setMessage(''); // Resetea el mensaje
    setConfirmation(false); // Resetea la confirmación
  };

  const constraints = {
    video: {
      facingMode: facingMode
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Escáner QR de Tickets</h1>
      {showScanner ? (
        <>
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            constraints={constraints}
            style={{ width: '100%' }}
          />
          <button onClick={toggleCamera}>
            Cambiar cámara
          </button>
        </>
      ) : (
        <div>
          <button onClick={handleRescan}>Escanear de nuevo</button>
        </div>
      )}

      {modalVisible && (
        <Modal 
          message={`ID del Ticket: ${ticketId} - ${confirmation ? '✅' : '❌'} ${message}`} 
          onClose={handleRescan} 
        />
      )}
    </div>
  );
};

export default QRScanner;
