import React, { useState } from 'react';
import { Building2, Phone, Mail, Globe, Instagram, Facebook, Save, Upload } from 'lucide-react';

interface BusinessProfileFormData {
  name: string;
  address: string;
  phone: string;
  cuit: string;
  email: string;
  website: string;
  socialMedia: string;
  logo: File | null;
}

const BusinessProfile: React.FC = () => {
  const [formData, setFormData] = useState<BusinessProfileFormData>({
    name: 'Muscle Man',
    address: '',
    phone: '',
    cuit: '',
    email: '',
    website: '',
    socialMedia: '',
    logo: null
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        logo: file
      });
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    // Simulamos una operación de guardado exitosa
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSuccess(true);
    setLoading(false);
    
    // Ocultar mensaje de éxito después de 3 segundos
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Perfil del Negocio</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre del Gimnasio */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Gimnasio
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre de tu gimnasio"
                  required
                />
              </div>
            </div>
            
            {/* Domicilio */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Domicilio
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dirección física"
              />
            </div>
            
            {/* Celular */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Celular
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Número de contacto"
                />
              </div>
            </div>
            
            {/* CUIT */}
            <div>
              <label htmlFor="cuit" className="block text-sm font-medium text-gray-700 mb-1">
                CUIT
              </label>
              <input
                type="text"
                id="cuit"
                name="cuit"
                value={formData.cuit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CUIT de la empresa"
              />
            </div>
            
            {/* Correo */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email de contacto"
                />
              </div>
            </div>
            
            {/* Sitio Web */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Sitio Web
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe size={18} className="text-gray-400" />
                </div>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="URL de tu sitio web"
                />
              </div>
            </div>
            
            {/* Redes Sociales */}
            <div>
              <label htmlFor="socialMedia" className="block text-sm font-medium text-gray-700 mb-1">
                Redes Sociales
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="flex space-x-1">
                    <Instagram size={18} className="text-gray-400" />
                    <Facebook size={18} className="text-gray-400" />
                  </div>
                </div>
                <input
                  type="text"
                  id="socialMedia"
                  name="socialMedia"
                  value={formData.socialMedia}
                  onChange={handleChange}
                  className="pl-16 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="@tusredes, /tupagina"
                />
              </div>
            </div>
            
            {/* Logo */}
            <div className="md:col-span-2">
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                Logo
              </label>
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-4">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="h-20 w-20 object-cover rounded-md" />
                  ) : (
                    <div className="h-20 w-20 bg-gray-200 rounded-md flex items-center justify-center">
                      <Building2 size={32} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <span className="flex items-center">
                    <Upload size={18} className="mr-2" />
                    Seleccionar archivo
                  </span>
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="sr-only"
                  />
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Formatos permitidos: PNG, JPG, GIF. Tamaño máximo: 2MB
              </p>
            </div>
          </div>
          
          {/* Mensajes de estado y botón de guardar */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              {success && (
                <div className="text-green-600 flex items-center">
                  <span className="mr-2">&#10003;</span>
                  <span>Cambios guardados correctamente</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : (
                <Save size={18} className="mr-2" />
              )}
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessProfile;