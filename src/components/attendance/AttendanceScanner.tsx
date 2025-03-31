// src/components/attendance/AttendanceScanner.tsx
import React, { useState, useEffect, useRef } from 'react';
import { QrCode, CameraOff, Camera, UserCheck, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import useAuth from '../../hooks/useAuth';
import { registerAttendance } from '../../services/attendance.service';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';




interface ScanResult {
  success: boolean;
  message: string;
  timestamp: Date;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    photo: string | null;
    activeMemberships?: number;
  } | null;
  error?: string;
}

interface AttendanceRecord {
  id: string;
  memberId: string;
  member: any;
  timestamp: Date;
  status: string;
  error?: string;
}

const AttendanceScanner: React.FC = () => {
  
  
  const { gymData } = useAuth();
  const [scanning, setScanning] = useState<boolean>(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<AttendanceRecord[]>([]);
  const [processingQR, setProcessingQR] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = "html5-qrcode-scanner";

  // Cargar historial de escaneos recientes al montar el componente
  useEffect(() => {
    // Aquí podrías cargar los últimos escaneos desde Firestore
    // Por ahora dejamos un historial vacío
    return () => {
      if (qrScannerRef.current && qrScannerRef.current.isScanning) {
        qrScannerRef.current.stop().catch(err => console.error(err));
      }
    };
  }, []);

  const startScanning = async () => {
    setScanResult(null);
    setCameraError(null);
    
    try {
      // Asegurarse de que el elemento existe
      const scannerElement = document.getElementById(scannerDivId);
      if (!scannerElement) {
        setCameraError("No se pudo encontrar el elemento del escáner en el DOM");
        console.error("El elemento scannerDivId no existe:", scannerDivId);
        return;
      }
      
      // Instanciar el escáner
      const html5QrCode = new Html5Qrcode(scannerDivId);
      qrScannerRef.current = html5QrCode;
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      // Comprobar cámaras disponibles
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length === 0) {
        setCameraError("No se encontraron cámaras en el dispositivo");
        return;
      }
      
      // Iniciar el escáner
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
      );
      
      setScanning(true);
    } catch (err: any) {
      console.error("Error al iniciar el escáner:", err);
      setCameraError(err.message || "Error al iniciar la cámara");
      setScanning(false);
    }
  };
  
  const stopScanning = async () => {
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
      try {
        await qrScannerRef.current.stop();
        setScanning(false);
      } catch (err) {
        console.error("Error al detener el escáner:", err);
      }
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    if (!gymData?.id || processingQR) {
      return;
    }

    try {
      setProcessingQR(true);
      console.log("QR Code escaneado:", decodedText);

      // Decodificar datos del QR (asumiendo formato base64)
      let qrData;
      try {
        // Intentar decodificar como JSON
        const decoded = atob(decodedText);
        qrData = JSON.parse(decoded);
      } catch (e) {
        // Si falla el decode, asumimos que el QR contiene directamente el ID del miembro
        qrData = { memberId: decodedText };
      }

      // Verificar que contiene ID de miembro
      if (!qrData.memberId) {
        throw new Error("Código QR inválido o dañado");
      }

      const memberId = qrData.memberId;
      const now = new Date();

      // Obtener datos del miembro
      const memberRef = doc(db, `gyms/${gymData.id}/members`, memberId);
      const memberSnap = await getDoc(memberRef);

      if (!memberSnap.exists()) {
        throw new Error("Socio no encontrado");
      }

      const memberData = memberSnap.data();
      
      // Obtener membresías activas del socio
      const membershipsQuery = collection(db, `gyms/${gymData.id}/members/${memberId}/memberships`);
      const activeQ = query(membershipsQuery, where('status', '==', 'active'));
      const activeSnap = await getDocs(activeQ);
      
      if (activeSnap.empty) {
        throw new Error("El socio no tiene membresías activas");
      }
      
      // Seleccionar la primera membresía activa para registrar asistencia
      const membershipDoc = activeSnap.docs[0];
      const membershipData = membershipDoc.data();
      
      // Registrar la asistencia
      const result = await registerAttendance(
        gymData.id,
        memberId,
        `${memberData.firstName} ${memberData.lastName}`,
        membershipDoc.id,
        membershipData.activityName || "General"
      );
      
      // Crear objeto de resultado
      const scanResultObj: ScanResult = {
        success: result.status === 'success',
        message: result.status === 'success' 
          ? `Asistencia registrada para ${memberData.firstName} ${memberData.lastName}`
          : result.error || "Error al registrar asistencia",
        timestamp: now,
        member: {
          id: memberId,
          firstName: memberData.firstName,
          lastName: memberData.lastName,
          photo: memberData.photo || null,
          activeMemberships: activeSnap.size
        },
        error: result.status === 'error' ? result.error : undefined
      };
      
      setScanResult(scanResultObj);
      
      // Agregar al historial
      const attendanceRecord: AttendanceRecord = {
        id: result.id || `ATT${Date.now()}`,
        memberId,
        member: {
          firstName: memberData.firstName,
          lastName: memberData.lastName
        },
        timestamp: now,
        status: result.status,
        error: result.status === 'error' ? result.error : undefined
      };
      
      setScanHistory(prev => [attendanceRecord, ...prev].slice(0, 10));
      
      // Actualizar timestamp del último escaneo
      setLastScan(now);
      
      // Opcional: detener el escaneo después de un resultado exitoso
      if (result.status === 'success') {
        setTimeout(() => {
          stopScanning();
        }, 2000);
      }
      
    } catch (error: any) {
      console.error("Error procesando QR:", error);
      
      // Crear resultado de error
      const errorResult: ScanResult = {
        success: false,
        message: error.message || "Error al procesar el código QR",
        timestamp: new Date(),
        member: null,
        error: error.message
      };
      
      setScanResult(errorResult);
      
    } finally {
      setProcessingQR(false);
    }
  };

  const onScanFailure = (error: any) => {
    // No hacemos nada aquí, porque estas son fallas comunes de escaneo
    // console.error("Error de escaneo:", error);
  };

  // Formatear fecha y hora
  const formatDateTime = (date: Date) => {
    return date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Control de Asistencias</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sección de escáner */}
        <div className="border rounded-lg p-5">
          <h3 className="text-lg font-medium mb-4">Escanear QR</h3>
          
          {cameraError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
              <AlertCircle size={18} className="mr-2" />
              <div>
                <p className="font-medium">Error de cámara</p>
                <p className="text-sm">{cameraError}</p>
                <p className="text-sm mt-1">Asegúrate de que tu dispositivo tiene cámara y has concedido permisos.</p>
              </div>
            </div>
          )}
          
          <div className="flex flex-col items-center">
            <div className="mb-4 h-64 w-full max-w-md bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
              {scanning ? (
                <div className="w-full h-full relative">
                  <div id={scannerDivId} className="w-full h-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-500 animate-pulse rounded-lg pointer-events-none"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500 animate-scan pointer-events-none"></div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <CameraOff size={64} className="text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">Cámara inactiva</p>
                </div>
              )}
            </div>
            
            <div className="w-full max-w-md flex justify-center">
              {!scanning ? (
                <button
                  onClick={startScanning}
                  className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center justify-center"
                >
                  <QrCode size={20} className="mr-2" />
                  Iniciar Escaneo
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="w-full py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors flex items-center justify-center"
                >
                  <CameraOff size={20} className="mr-2" />
                  Detener Escaneo
                </button>
              )}
            </div>
            
            {lastScan && (
              <div className="mt-4 w-full max-w-md text-center text-sm text-gray-500">
                Último escaneo: {formatDateTime(lastScan)}
              </div>
            )}
          </div>
          
          {/* Resultado del escaneo */}
          {scanResult && (
            <div className={`mt-6 p-4 rounded-lg ${scanResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-start">
                <div className={`flex-shrink-0 rounded-full p-2 ${scanResult.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {scanResult.success ? <CheckCircle size={20} /> : <XCircle size={20} />}
                </div>
                
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${scanResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {scanResult.success ? 'Asistencia Registrada' : 'Error al Registrar'}
                  </h3>
                  <div className="mt-1 text-sm text-gray-600">
                    <p>{scanResult.message}</p>
                    {scanResult.timestamp && (
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDateTime(scanResult.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {scanResult.member && (
                <div className="mt-3 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    {scanResult.member.firstName.charAt(0)}{scanResult.member.lastName.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-700">
                      {scanResult.member.firstName} {scanResult.member.lastName}
                    </div>
                    {scanResult.success && scanResult.member.activeMemberships !== undefined && (
                      <div className="text-xs text-gray-500">
                        {scanResult.member.activeMemberships} membresía(s) activa(s)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Historial de escaneos */}
        <div className="border rounded-lg p-5">
          <h3 className="text-lg font-medium mb-4">Últimos Registros</h3>
          
          {scanHistory.length === 0 ? (
            <div className="text-center py-10">
              <Clock size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No hay registros de asistencia recientes</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-96">
              <div className="space-y-3">
                {scanHistory.map((record) => (
                  <div
                    key={record.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      record.status === 'success' ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                        {record.member.firstName.charAt(0)}{record.member.lastName.charAt(0)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                          <div className="text-sm font-medium">
                            {record.member.firstName} {record.member.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDateTime(record.timestamp)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {record.status === 'success' ? (
                            'Asistencia registrada correctamente'
                          ) : (
                            record.error || 'Error al registrar asistencia'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
              Ver Historial Completo
            </button>
          </div>
        </div>
      </div>
      
      {/* Estilos para la animación de escaneo */}
      <style>
        {`
        @keyframes scan {
          0% {
            transform: translateY(-100px);
          }
          100% {
            transform: translateY(100px);
          }
        }
        
        .animate-scan {
          animation: scan 2s linear infinite;
        }
        `}
      </style>
    </div>
  );
};

export default AttendanceScanner;