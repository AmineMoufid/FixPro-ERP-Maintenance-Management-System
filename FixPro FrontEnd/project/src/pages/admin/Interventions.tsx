import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import axiosInstance from '../../api/axios';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface Intervention {
  id: number;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'CREATED' | 'IN_PROGRESS' | 'DONE';
  machineId?: number;
  machineName?: string;
  technicianId?: number;
  technicianName?: string;
  createdAt?: string;
}

interface Machine {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

const Interventions = () => {
  // Décoder le rôle depuis le JWT stocké dans localStorage.token (ou fallback à localStorage.role)
  const getUserRole = (): string | undefined => {
    try {
      const rawToken = localStorage.getItem('token') || '';
      if (rawToken) {
        const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;
        const parts = token.split('.');
        if (parts.length >= 2) {
          const payload = parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');
          // Pad base64 string
          const pad = payload.length % 4;
          const padded = pad === 2 ? payload + '==' : pad === 3 ? payload + '=' : payload;
          const decoded = JSON.parse(atob(padded));
          return decoded?.role || decoded?.roles?.[0] || (Array.isArray(decoded?.authorities) ? decoded.authorities[0] : undefined);
        }
      }
    } catch (e) {
      // ignorer les erreurs de parsing
    }
    return (localStorage.getItem('role') as string | null) ?? undefined;
  };
  
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [availableMachines, setAvailableMachines] = useState<Machine[]>([]);
  const [availableTechnicians, setAvailableTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    technicianId: '',
    machineId: '',
  });
  const [formData, setFormData] = useState({
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    status: 'CREATED' as 'CREATED' | 'IN_PROGRESS' | 'DONE',
    machineId: '',
    technicianId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const role = getUserRole();
      let interventionsEndpoint = role === 'TECHNICIAN' ? '/interventions/my' : '/interventions';
      let interventionsRes;
      try {
        interventionsRes = await axiosInstance.get(interventionsEndpoint);
      } catch (err: any) {
        const status = err?.response?.status;
        // Si rôle inconnu ou /interventions retourne 403, essayer /interventions/my comme fallback
        if (status === 403 && interventionsEndpoint === '/interventions') {
          try {
            interventionsEndpoint = '/interventions/my';
            interventionsRes = await axiosInstance.get(interventionsEndpoint);
          } catch (err2) {
            throw err;
          }
        } else if (status === 403 && interventionsEndpoint === '/interventions/my') {
          // Endpoint technicien interdit — essayer l'endpoint admin comme fallback
          try {
            interventionsEndpoint = '/interventions';
            interventionsRes = await axiosInstance.get(interventionsEndpoint);
          } catch (err2) {
            throw err;
          }
        } else {
          throw err;
        }
      }

      const [machinesRes, usersRes] = await Promise.all([
        axiosInstance.get('/machines'),
        axiosInstance.get('/users'),
      ]);
      
      // Normaliser la réponse des interventions (peut être un tableau ou un objet paginé)
      const raw = interventionsRes.data;
      const list = Array.isArray(raw) ? raw : raw?.content ?? [];
      const normalized = list.map((it: any) => ({
        id: Number(it.id),
        description: it.description ?? '',
        priority: it.priority ?? 'MEDIUM',
        status: it.status ?? 'CREATED',
        machineId: it.machineId ? Number(it.machineId) : undefined,
        machineName: it.machineName ?? undefined,
        technicianId: it.technicianId ? Number(it.technicianId) : undefined,
        technicianName: it.technicianName ?? undefined,
        createdAt: it.createdAt ?? undefined,
      }));

      setInterventions(normalized);

      // Normaliser la réponse des machines
      const machinesRaw = machinesRes.data;
      const machinesList = Array.isArray(machinesRaw) ? machinesRaw : machinesRaw?.content ?? [];
      const machinesNormalized = machinesList.map((m: any) => ({ id: String(m.id), name: m.name }));
      setAvailableMachines(machinesNormalized);

      // Normaliser la réponse des utilisateurs et filtrer les techniciens
      const usersRaw = usersRes.data;
      const usersList = Array.isArray(usersRaw) ? usersRaw : usersRaw?.content ?? [];
      const usersNormalized = usersList.map((u: any) => ({ id: String(u.id), name: u.name, role: u.role }));
      setAvailableTechnicians(usersNormalized.filter((u: User) => u.role === 'TECHNICIAN'));
    } catch (error) {
      console.error('Échec de la récupération des données:', error);
      
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de charger les interventions',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b82f6',
      });
      
      const status = (error as any)?.response?.status;
      if (status === 403) {
        try {
          const unauth = await import('axios').then((m) => m.default.get('/api/interventions'));
          const raw = unauth.data;
          const list = Array.isArray(raw) ? raw : raw?.content ?? [];
          const normalized = list.map((it: any) => ({
            id: Number(it.id),
            description: it.description ?? '',
            priority: it.priority ?? 'MEDIUM',
            status: it.status ?? 'CREATED',
            machineId: it.machineId ? Number(it.machineId) : undefined,
            machineName: it.machineName ?? undefined,
            technicianId: it.technicianId ? Number(it.technicianId) : undefined,
            technicianName: it.technicianName ?? undefined,
            createdAt: it.createdAt ?? undefined,
          }));
          setInterventions(normalized);
        } catch (inner) {
          console.error('Récupération non authentifiée /interventions échouée:', inner);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'CREATED': 'Créée',
      'IN_PROGRESS': 'En cours',
      'DONE': 'Terminée',
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      'LOW': 'Basse',
      'MEDIUM': 'Moyenne',
      'HIGH': 'Haute',
    };
    return labels[priority] || priority;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        machineId: formData.machineId ? Number(formData.machineId) : null,
        technicianId: formData.technicianId ? Number(formData.technicianId) : null,
      };

      let res;
      if (editingIntervention) {
        res = await axiosInstance.put(`/interventions/${editingIntervention.id}`, payload);
        
        await Swal.fire({
          title: 'Succès!',
          text: 'Intervention modifiée avec succès',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        res = await axiosInstance.post('/interventions', payload);
        
        await Swal.fire({
          title: 'Succès!',
          text: 'Intervention créée avec succès',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
        });
      }

      if (res?.data) {
        setInterventions((prev) => {
          if (editingIntervention) {
            return prev.map((p) => (p.id === editingIntervention.id ? res.data : p));
          }
          return [res.data, ...prev];
        });
        // Actualiser pour s'assurer que toutes les relations jointes sont présentes
        await fetchData();
      } else {
        fetchData();
      }

      setShowModal(false);
      setEditingIntervention(null);
      setFormData({
        description: '',
        priority: 'MEDIUM',
        status: 'CREATED',
        machineId: '',
        technicianId: '',
      });
    } catch (error: any) {
      console.error('Échec de la sauvegarde de l\'intervention:', error);
      
      Swal.fire({
        title: 'Erreur',
        text: error.response?.data?.message || 'Échec de la sauvegarde de l\'intervention',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b82f6',
      });
    }
  };

  const handleEdit = (intervention: Intervention) => {
    setEditingIntervention(intervention);
    setFormData({
      description: intervention.description,
      priority: intervention.priority,
      status: intervention.status,
      machineId: intervention.machineId ? String(intervention.machineId) : '',
      technicianId: intervention.technicianId ? String(intervention.technicianId) : '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number | string) => {
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
        await axiosInstance.delete(`/interventions/${id}`);
        
        await Swal.fire({
          title: 'Supprimée!',
          text: 'L\'intervention a été supprimée avec succès.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
        });
        
        fetchData();
      } catch (error) {
        console.error('Échec de la suppression de l\'intervention:', error);
        
        Swal.fire({
          title: 'Erreur',
          text: 'Échec de la suppression de l\'intervention',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3b82f6',
        });
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingIntervention(null);
    setFormData({
      description: '',
      priority: 'MEDIUM',
      status: 'CREATED',
      machineId: '',
      technicianId: '',
    });
  };

  const getMachineName = (machineName?: string) => {
    return machineName || 'Non attribuée';
  };

  const getTechnicianName = (technicianName?: string) => {
    return technicianName || 'Non attribué';
  };

  const filteredInterventions = interventions.filter((i) => {
    if (filters.status && i.status !== filters.status) return false;
    if (filters.technicianId && String(i.technicianId) !== filters.technicianId) return false;
    if (filters.machineId && String(i.machineId) !== filters.machineId) return false;
    return true;
  });

  const clearFilters = () => {
    setFilters({
      status: '',
      technicianId: '',
      machineId: '',
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Chargement des interventions...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interventions</h1>
              <p className="text-gray-600 mt-1">Gérez les interventions de maintenance</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer une intervention
            </button>
          </div>

          <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-700">Filtres</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Effacer les filtres
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrer par statut
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Tous les statuts</option>
                  <option value="CREATED">Créée</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="DONE">Terminée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrer par technicien
                </label>
                <select
                  value={filters.technicianId}
                  onChange={(e) => setFilters({ ...filters, technicianId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Tous les techniciens</option>
                  {availableTechnicians.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrer par machine
                </label>
                <select
                  value={filters.machineId}
                  onChange={(e) => setFilters({ ...filters, machineId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Toutes les machines</option>
                  {availableMachines.map((machine) => (
                    <option key={machine.id} value={machine.id}>
                      {machine.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {filteredInterventions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  {interventions.length === 0 
                    ? 'Aucune intervention trouvée' 
                    : 'Aucune intervention ne correspond aux filtres'}
                </div>
                {interventions.length === 0 && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer votre première intervention
                  </button>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priorité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Machine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Technicien
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInterventions.map((intervention) => (
                    <tr key={intervention.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={intervention.description}>
                          {intervention.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={intervention.priority} type="priority" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={intervention.status} type="status" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getMachineName(intervention.machineName)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getTechnicianName(intervention.technicianName)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(intervention)}
                            className="inline-flex items-center p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(intervention.id)}
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
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingIntervention ? 'Modifier l\'intervention' : 'Créer une intervention'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="Décrivez le problème ou l'action à effectuer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="LOW">Basse</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="HIGH">Haute</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'CREATED' | 'IN_PROGRESS' | 'DONE' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="CREATED">Créée</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="DONE">Terminée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Machine *</label>
                <select
                  value={formData.machineId}
                  onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Sélectionnez une machine</option>
                  {availableMachines.map((machine) => (
                    <option key={machine.id} value={machine.id}>
                      {machine.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technicien
                </label>
                <select
                  value={formData.technicianId}
                  onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Non attribué</option>
                  {availableTechnicians.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
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
                  disabled={!formData.description || !formData.machineId}
                >
                  {editingIntervention ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Interventions;