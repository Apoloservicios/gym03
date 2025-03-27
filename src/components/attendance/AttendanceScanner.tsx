import React, { useState } from 'react';
import { QrCode, CameraOff, Camera, UserCheck, Clock, AlertCircle } from 'lucide-react';

interface MemberData {
  id: string;
  firstName: string;
  lastName: string;
  photo: string | null;
  activeMemberships?: number;
}

interface ScanResult {
  success: boolean;
  message: string;
  timestamp: Date;
  member: MemberData | null;
  error?: string;
}

interface AttendanceRecord {
  id: string;
  memberId: string;
  member: MemberData;
  timestamp: Date;
  status: string;
  error?: string;
}

const AttendanceScanner: React.FC = () => {
  const [scanning, setScanning] = useState<boolean>(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<AttendanceRecord[]>([]);

  // Función para simular escaneo de QR (en producción se usaría una librería de escaneo real)
  const startScanning = () => {
    setScanning(true);
    setScanResult(null);
    
    // Simulamos un escaneo exitoso después de 2 segundos
    setTimeout(() => {
      // Generar un ID de socio aleatorio para simular un escaneo
      const memberId = `MEM${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // Simular validación del QR y obtención de datos del socio
      validateQrAndRegisterAttendance(memberId);
      
      setScanning(false);
    }, 2000);
  };
  
  const stopScanning = () => {
    setScanning(false);
  };
  
  // Función que validaría el QR y registraría la asistencia en la base de datos
  const validateQrAndRegisterAttendance = (memberId: string) => {
    // En un caso real, aquí se consultaría la base de datos
    const now = new Date();
    
    // Simular posibles resultados
    const possibleResults = [
      { 
        success: true, 
        member: { 
          id: memberId, 
          firstName: 'Juan', 
          lastName: 'Pérez', 
          photo: null,
          activeMemberships: 2
        } 
      },
      { 
        success: true, 
        member: { 
          id: memberId, 
          firstName: 'María', 
          lastName: 'González', 
          photo: null,
          activeMemberships: 1
        } 
      },
      { 
        success: false, 
        error: 'membership_expired',
        member: { 
          id: memberId, 
          firstName: 'Carlos', 
          lastName: 'Rodríguez',
          photo: null
        } 
      },
      { 
        success: false, 
        error: 'not_found',
        member: null
      }
    ];
    
    // Elegir un resultado aleatorio para simular
    const result = possibleResults[Math.floor(Math.random() * possibleResults.length)];
    
    if (result.success && result.member) {
      // Registro exitoso
      const attendanceRecord: AttendanceRecord = {
        id: `ATT${Date.now()}`,
        memberId: result.member.id,
        member: result.member,
        timestamp: now,
        status: 'success'
      };
      
      setScanResult({
        success: true,
        message: `Asistencia registrada para ${result.member.firstName} ${result.member.lastName}`,
        timestamp: now,
        member: result.member
      });
      
      // Agregar a historial
      setScanHistory(prev => [attendanceRecord, ...prev].slice(0, 10));
    } else {
      // Error en el registro
      const errorMessage = result.error === 'membership_expired' && result.member 
        ? `Membresía vencida para ${result.member.firstName} ${result.member.lastName}`
        : 'QR no reconocido o socio no encontrado';
      
      setScanResult({
        success: false,
        message: errorMessage,
        timestamp: now,
        member: result.member,
        error: result.error
      });
      
      if (result.member) {
        const errorRecord: AttendanceRecord = {
          id: `ATT${Date.now()}`,
          memberId: result.member.id,
          member: result.member,
          timestamp: now,
          status: 'error',
          error: result.error
        };
        
        // Agregar a historial
        setScanHistory(prev => [errorRecord, ...prev].slice(0, 10));
      }
    }
    
    setLastScan(now);
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
          
          <div className="flex flex-col items-center">
            <div className="mb-4 h-64 w-full max-w-md bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
              {scanning ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera size={64} className="text-gray-400" />
                  </div>
                  <div className="absolute inset-0 border-4 border-blue-500 animate-pulse rounded-lg"></div>
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-10"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500 animate-scan"></div>
                </>
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
                  {scanResult.success ? <UserCheck size={20} /> : <AlertCircle size={20} />}
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
                          ) : record.error === 'membership_expired' ? (
                            'Membresía vencida'
                          ) : (
                            'Error al registrar asistencia'
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
      
      {/* Usamos CSS normal en lugar de jsx para evitar errores */}
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