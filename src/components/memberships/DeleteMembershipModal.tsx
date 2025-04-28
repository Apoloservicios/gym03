// src/components/memberships/DeleteMembershipModal.tsx

import React, { useState } from 'react';
import { AlertCircle, DollarSign } from 'lucide-react';

interface DeleteMembershipModalProps {
  membershipName: string;
  isPaid: boolean;
  onConfirm: (withRefund: boolean) => void;
  onCancel: () => void;
}

const DeleteMembershipModal: React.FC<DeleteMembershipModalProps> = ({
  membershipName,
  isPaid,
  onConfirm,
  onCancel
}) => {
  const [withRefund, setWithRefund] = useState<boolean>(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center mb-4">
          <div className="rounded-full bg-red-100 p-2 mr-3">
            <AlertCircle size={24} className="text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Eliminar Membresía
          </h3>
        </div>
        
        <p className="mb-4 text-gray-600">
          ¿Estás seguro que deseas eliminar la membresía <strong>{membershipName}</strong>?
          Esta acción no se puede deshacer.
        </p>
        
        {isPaid && (
          <div className="mb-4 p-4 bg-yellow-50 rounded-md">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="withRefund"
                checked={withRefund}
                onChange={(e) => setWithRefund(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="withRefund" className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                Realizar reintegro <DollarSign size={16} className="ml-1 text-green-600" />
              </label>
            </div>
            <p className="text-xs text-gray-600">
              Si marca esta opción, se registrará un reintegro por el valor de la membresía.
            </p>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(withRefund)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMembershipModal;