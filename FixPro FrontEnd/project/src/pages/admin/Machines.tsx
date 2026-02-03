import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import axiosInstance from '../../api/axios';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface Machine {
  id: number;
  name: string;
  serialNumber: string;
  status: string;
  clientId?: number;
  clientName?: string;
}

interface Client {
  id: string;
  companyName: string;
}

const Machines = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [rawMachines, setRawMachines] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    status: 'ACTIVE',
    clientId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const normalizeMachine = (m: any) => ({
    id: Number(m.id),
    name: m.name ?? '',
    serialNumber: m.serialNumber ?? '',
    status: m.status ?? 'ACTIVE',
    clientId: m.clientId ? Number(m.clientId) : undefined,
    clientName: m.clientName ?? undefined,
  });

  const fetchData = async () => {
    try {
      const [machinesRes, clientsRes] = await Promise.all([
        axiosInstance.get('/machines'),
        axiosInstance.get('/clients'),
      ]);
      if (import.meta.env.DEV) {
        console.debug('GET /api/machines réponse', machinesRes.data);
        console.debug('GET /api/clients réponse', clientsRes.data);
        setRawMachines(machinesRes.data);
      }

      // Normaliser la réponse des machines en tableau
      const machinesRaw = machinesRes.data;
      const machinesList = Array.isArray(machinesRaw) ? machinesRaw : machinesRaw?.content ?? [];
      const machinesNormalized = machinesList.map(normalizeMachine);
      setMachines(machinesNormalized);

      // Normaliser les clients pour la liste déroulante du formulaire
      const clientsRaw = clientsRes.data;
      const clientsList = Array.isArray(clientsRaw) ? clientsRaw : clientsRaw?.content ?? [];
      const clientsNormalized = clientsList.map((c: any) => ({ id: String(c.id), companyName: c.companyName ?? '' }));
      setAvailableClients(clientsNormalized);
    } catch (error) {
      console.error('Échec de la récupération des données:', error);
      
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de charger les données',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b82f6',
      });
      
      // Si interdit, tenter une récupération non authentifiée pour voir la réponse brute
      const status = (error as any)?.response?.status;
      if (status === 403) {
        try {
          const unauth = await import('axios').then((m) => m.default.get('/api/machines'));
          if (import.meta.env.DEV) {
            console.debug('Réponse GET /api/machines non authentifiée', unauth.data);
            setRawMachines(unauth.data);
          }
          const machinesList = Array.isArray(unauth.data) ? unauth.data : unauth.data?.content ?? [];
          setMachines(machinesList.map(normalizeMachine));
        } catch (inner) {
          console.error('La récupération non authentifiée a également échoué:', inner);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: formData.name,
        serialNumber: formData.serialNumber,
        status: formData.status,
        clientId: formData.clientId ? Number(formData.clientId) : null,
      };

      let res;
      if (editingMachine) {
        res = await axiosInstance.put(`/machines/${editingMachine.id}`, payload);
        
        await Swal.fire({
          title: 'Succès!',
          text: 'Machine modifiée avec succès',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        res = await axiosInstance.post('/machines', payload);
        
        await Swal.fire({
          title: 'Succès!',
          text: 'Machine ajoutée avec succès',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
        });
      }

      if (res?.data) {
        const m = normalizeMachine(res.data);
        setMachines((prev) => {
          if (editingMachine) {
            return prev.map((p) => (p.id === editingMachine.id ? m : p));
          }
          return [m, ...prev];
        });
        // Actualiser la liste depuis le serveur pour s'assurer que les relations jointes (client) sont présentes
        await fetchData();
      } else {
        fetchData();
      }

      setShowModal(false);
      setEditingMachine(null);
      setFormData({ name: '', serialNumber: '', status: 'ACTIVE', clientId: '' });
    } catch (error: any) {
      console.error('Échec de la sauvegarde de la machine:', error);
      
      Swal.fire({
        title: 'Erreur',
        text: error.response?.data?.message || 'Échec de la sauvegarde de la machine',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b82f6',
      });
    }
  };

  const handleEdit = (machine: Machine) => {
    setEditingMachine(machine);
    setFormData({
      name: machine.name,
      serialNumber: machine.serialNumber,
      status: machine.status,
      clientId: machine.clientId ? String(machine.clientId) : '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Cette action ne peut pas être annulée!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await axiosInstance.delete(`/machines/${id}`);
        
        await Swal.fire({
          title: 'Supprimée!',
          text: 'La machine a été supprimée avec succès.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
        });
        
        setMachines((prev) => prev.filter((m) => m.id !== id));
        if (res?.status >= 400) fetchData();
      } catch (error) {
        console.error('Échec de la suppression de la machine:', error);
        
        Swal.fire({
          title: 'Erreur',
          text: 'Échec de la suppression de la machine',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3b82f6',
        });
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMachine(null);
    setFormData({ name: '', serialNumber: '', status: 'ACTIVE', clientId: '' });
  };

  const getClientName = (clientName?: string) => {
    return clientName || 'Non attribué';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'ACTIVE': 'Active',
      'BROKEN': 'Cassée',
      'UNDER_REPAIR': 'En réparation',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Chargement des machines...</div>
        </div>
      </>
    );
  }

  // Panneau de débogage uniquement en développement
  const DebugPanel = ({ title, data }: { title: string; data: any }) => {
    if (!import.meta.env.DEV) return null;
    if (data == null) return null;
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm">
          <div className="font-medium mb-2">{title}</div>
          <pre className="whitespace-pre-wrap max-h-56 overflow-auto">{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Machines</h1>
              <p className="text-gray-600 mt-1">Gérez l'équipement et les machines</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une machine
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {machines.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">Aucune machine trouvée</div>
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter votre première machine
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Numéro de série
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {machines.map((machine) => (
                    <tr key={machine.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {machine.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {machine.serialNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={machine.status} type="status" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getClientName(machine.clientName)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(machine)}
                            className="inline-flex items-center p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(machine.id)}
                            className="inline-flex items-center p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingMachine ? 'Modifier la machine' : 'Ajouter une nouvelle machine'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Entrez le nom de la machine"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de série *
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Entrez le numéro de série"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="BROKEN">Cassée</option>
                  <option value="UNDER_REPAIR">En réparation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Sélectionnez un client</option>
                  {availableClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!formData.name || !formData.serialNumber || !formData.clientId}
                >
                  {editingMachine ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DebugPanel title="GET /api/machines (brut)" data={rawMachines} />
    </>
  );
};

export default Machines;