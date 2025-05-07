// src/components/superadmin/GlobalExercisesPanel.tsx

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash, Search, Filter, ChevronDown, ChevronUp, Info 
} from 'lucide-react';
import { 
  getGlobalExercises, 
  createGlobalExercise, 
  updateGlobalExercise, 
  deleteGlobalExercise 
} from '../../services/exercise.service';
import { Exercise } from '../../types/exercise.types';
import SuperAdminHeader from './SuperAdminHeader';
import GlobalExerciseForm from './GlobalExerciseForm';

const GlobalExercisesPanel: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Cargar ejercicios al montar
  useEffect(() => {
    loadExercises();
  }, []);
  
  // Aplicar filtros cuando cambian
  useEffect(() => {
    applyFilters();
  }, [exercises, searchTerm, muscleGroupFilter, difficultyFilter]);
  
  const loadExercises = async () => {
    setLoading(true);
    try {
      const exercisesData = await getGlobalExercises();
      setExercises(exercisesData);
    } catch (error) {
      console.error('Error cargando ejercicios:', error);
      setError('Error al cargar ejercicios. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let result = [...exercises];
    
    // Filtro de búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(exercise => 
        exercise.name.toLowerCase().includes(search) ||
        exercise.description.toLowerCase().includes(search) ||
        exercise.instructions.toLowerCase().includes(search)
      );
    }
    
    // Filtro por grupo muscular
    if (muscleGroupFilter !== 'all') {
      result = result.filter(exercise => exercise.muscleGroup === muscleGroupFilter);
    }
    
    // Filtro por dificultad
    if (difficultyFilter !== 'all') {
      result = result.filter(exercise => exercise.difficulty === difficultyFilter);
    }
    
    setFilteredExercises(result);
  };
  
  const handleNewExercise = () => {
    setSelectedExercise(null);
    setIsEditing(false);
    setShowForm(true);
  };
  
  const handleEditExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsEditing(true);
    setShowForm(true);
  };
  
  const handleDeleteExercise = async (exercise: Exercise) => {
    if (!window.confirm(`¿Estás seguro que deseas eliminar el ejercicio "${exercise.name}"?`)) {
      return;
    }
    
    try {
      await deleteGlobalExercise(exercise.id);
      // Actualizar la lista
      setExercises(prev => prev.filter(e => e.id !== exercise.id));
    } catch (error) {
      console.error('Error eliminando ejercicio:', error);
      setError('Error al eliminar el ejercicio. Por favor, intenta nuevamente.');
    }
  };
  
  const handleSaveExercise = async (exerciseData: any, imageFile?: File) => {
    try {
      if (isEditing && selectedExercise) {
        // Actualizar ejercicio existente
        const updatedExercise = await updateGlobalExercise(selectedExercise.id, exerciseData, imageFile);
        // Actualizar la lista
        setExercises(prev => 
          prev.map(e => e.id === selectedExercise.id ? updatedExercise : e)
        );
      } else {
        // Crear nuevo ejercicio
        const newExercise = await createGlobalExercise(exerciseData, imageFile);
        // Actualizar la lista
        setExercises(prev => [...prev, newExercise]);
      }
      
      setShowForm(false);
    } catch (error) {
      console.error('Error guardando ejercicio:', error);
      setError('Error al guardar el ejercicio. Por favor, intenta nuevamente.');
    }
  };
  
  return (
    <div className="p-6">
      <SuperAdminHeader activePage="exercises" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ejercicios Globales</h1>
        
        <button
          onClick={handleNewExercise}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Nuevo Ejercicio
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {showForm ? (
        <GlobalExerciseForm
          initialData={selectedExercise}
          isEditing={isEditing}
          onSave={handleSaveExercise}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar ejercicio por nombre o descripción..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select 
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={muscleGroupFilter}
                onChange={(e) => setMuscleGroupFilter(e.target.value)}
              >
                <option value="all">Todos los grupos musculares</option>
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
              
              <select 
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="all">Todas las dificultades</option>
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>
          </div>
          
          {/* Lista de ejercicios */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Info size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron ejercicios</h3>
              <p className="text-gray-500 mb-6">No hay ejercicios que coincidan con los filtros seleccionados</p>
              <button
                onClick={handleNewExercise}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Crear Ejercicio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.map(exercise => (
                <div key={exercise.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-40 bg-gray-200">
                    {exercise.image ? (
                      <img 
                        src={exercise.image} 
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <span className="text-gray-400">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{exercise.name}</h3>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditExercise(exercise)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteExercise(exercise)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {exercise.muscleGroup}
                      </span>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs">
                        {exercise.difficulty}
                      </span>
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {exercise.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GlobalExercisesPanel;