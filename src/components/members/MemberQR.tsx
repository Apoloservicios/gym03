import React, { useState, useEffect } from 'react';
import { QrCode, Download, Printer, Share2 } from 'lucide-react';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  [key: string]: any; // Para otras propiedades que pueda tener el miembro
}

interface MemberQRProps {
  member: Member;
}

const MemberQR: React.FC<MemberQRProps> = ({ member }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  // En una implementación real, esto podría:
  // 1. Generar un QR en el servidor
  // 2. Usar una librería como qrcode.react
  // 3. Solicitar el QR ya generado desde la base de datos
  useEffect(() => {
    // Simulamos la generación/carga del QR
    setLoading(true);
    
    const generateQR = async () => {
      try {
        // En una implementación real, aquí generaríamos el QR
        // Para este ejemplo, usamos una imagen de placeholder
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // URL de placeholder para simular un QR
        setQrDataUrl('/api/placeholder/300/300');
        setLoading(false);
      } catch (error) {
        console.error('Error generando QR:', error);
        setLoading(false);
      }
    };
    
    generateQR();
  }, [member]);
  
  const handleDownload = () => {
    // Crear un enlace para descargar la imagen
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qr-socio-${member.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handlePrint = () => {
    // Abrir una ventana de impresión con solo el QR
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR de ${member.firstName} ${member.lastName}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              .container {
                text-align: center;
              }
              img {
                max-width: 300px;
                border: 1px solid #ccc;
              }
              h2 {
                margin-bottom: 5px;
              }
              p {
                margin-top: 5px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>${member.firstName} ${member.lastName}</h2>
              <p>ID: ${member.id}</p>
              <img src="${qrDataUrl}" alt="QR de identificación" />
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.setTimeout(function() {
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-2">Código QR de Identificación</h2>
      <p className="text-gray-600 mb-6">
        Socio: {member.firstName} {member.lastName}
      </p>
      
      <div className="flex flex-col items-center">
        {loading ? (
          <div className="h-64 w-64 flex items-center justify-center bg-gray-100 rounded-lg">
            <span className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
          </div>
        ) : (
          <div className="relative">
            <img 
              src={qrDataUrl} 
              alt="QR Code" 
              className="h-64 w-64 border border-gray-200 rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="bg-blue-600 bg-opacity-90 p-3 rounded-full">
                <QrCode size={32} className="text-white" />
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Este código QR es único para el socio y permite registrar su asistencia</p>
          <p className="mt-1">El socio debe presentarlo al ingresar al gimnasio</p>
        </div>
        
        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-blue-300"
          >
            <Download size={18} className="mr-2" />
            Descargar
          </button>
          <button
            onClick={handlePrint}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:text-gray-400 disabled:border-gray-200"
          >
            <Printer size={18} className="mr-2" />
            Imprimir
          </button>
          <button
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:text-gray-400 disabled:border-gray-200"
          >
            <Share2 size={18} className="mr-2" />
            Compartir
          </button>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">Información importante</h3>
        <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
          <li>El código QR es personal e intransferible</li>
          <li>Si pierde el código, puede generar uno nuevo desde la aplicación</li>
          <li>El socio debe mantener activa al menos una membresía para poder ingresar</li>
        </ul>
      </div>
    </div>
  );
};

export default MemberQR;