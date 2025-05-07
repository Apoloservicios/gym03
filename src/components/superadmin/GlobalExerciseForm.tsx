// src/components/superadmin/GlobalExerciseForm.tsx

import React, { useState, useRef } from 'react';
import { X, Camera } from 'lucide-react';
import { Exercise } from '../../types/exercise.types';

interface GlobalExerciseFormProps {
  initialData?: Exercise | null;
  isEditing: boolean;
  onSave: (exerciseData: any, imageFile?: File) => void;
  onCancel: () => void;
}

const GlobalExerciseForm: React.FC<GlobalExerciseFormProps> = ({ 
  initialData, isEditing, onSave, onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    muscleGroup: initialData?.muscleGroup || 'espalda',
    difficulty: initialData?.difficulty || 'principiante',
    instructions: initialData?.instructions || '',
    isActive: initialData?.isActive !== false
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null
  );
  const [videoUrl, setVideoUrl] = useState<string>(
    initialData?.video || ''
  );
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validar tipo de archivo
      if (!file.type.includes('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido.');
        return;
      }
      
      // Validar tamaño (2MB máximo)
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen no debe superar los 2MB.');
        return;
      }
      
      setImageFile(file);
      
      // Generar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.name || !formData.description || !formData.instructions) {
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }
    
    // Preparar datos para guardar
    const exerciseData = {
      ...formData,
      video: videoUrl || null
    };
    
    onSave(exerciseData, imageFile || undefined);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grupo Muscular *
                </label>
                <select
                  name="muscleGroup"
                  value={formData.muscleGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  // src/components/superadmin/GlobalExerciseForm.tsx (continuación)

<option value="espalda">Espalda</option>
<option value="pecho">Pecho</option>
<option value="hombros">Hombros</option>
<option value="brazos">Brazos</option>
<option value="piernas">Piernas</option>
<option value="abdominales">Abdominales</option>
<option value="gluteos">Glúteos</option>
<option value="cardio">Cardio</option>
<option value="fullbody">Full Body</option>
<option value="calentamiento">Calentamiento</option>
<option value="elongacion">Elongación</option>
</select>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-1">
Dificultad *
</label>
<select
name="difficulty"
value={formData.difficulty}
onChange={handleChange}
className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
required
>
<option value="principiante">Principiante</option>
<option value="intermedio">Intermedio</option>
<option value="avanzado">Avanzado</option>
</select>
</div>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-1">
Instrucciones *
</label>
<textarea
name="instructions"
value={formData.instructions}
onChange={handleChange}
rows={5}
className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
required
></textarea>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-1">
URL de Video (opcional)
</label>
<input
type="url"
value={videoUrl}
onChange={(e) => setVideoUrl(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="https://www.youtube.com/..."
/>
<p className="text-xs text-gray-500 mt-1">
Ingresa un enlace a un video demostrativo (YouTube, Vimeo, etc.)
</p>
</div>

<div className="flex items-center">
<input
type="checkbox"
id="isActive"
name="isActive"
checked={formData.isActive}
onChange={handleChange}
className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
/>
<label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
Ejercicio Activo
</label>
</div>
</div>

{/* Imagen */}
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">
Imagen
</label>

<div 
className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
onClick={triggerFileInput}
>
{imagePreview ? (
<div className="relative w-full">
<img 
  src={imagePreview} 
  alt="Preview" 
  className="mx-auto max-h-64 object-contain"
/>
<button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
  }}
  className="absolute top-2 right-2 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200"
>
  <X size={16} />
</button>
</div>
) : (
<>
<Camera size={48} className="text-gray-400 mb-4" />
<p className="text-sm text-gray-500 text-center mb-2">
  Haz clic para seleccionar una imagen o arrástrala aquí
</p>
<p className="text-xs text-gray-400 text-center">
  PNG, JPG o GIF (máx. 2MB)
</p>
</>
)}

<input
ref={fileInputRef}
type="file"
accept="image/*"
onChange={handleImageChange}
className="hidden"
/>
</div>
</div>
</div>

<div className="flex justify-end space-x-3 mt-6">
<button
type="button"
onClick={onCancel}
className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
>
Cancelar
</button>
<button
type="submit"
className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
>
{isEditing ? 'Actualizar' : 'Crear'} Ejercicio
</button>
</div>
</form>
</div>
);
};

export default GlobalExerciseForm;