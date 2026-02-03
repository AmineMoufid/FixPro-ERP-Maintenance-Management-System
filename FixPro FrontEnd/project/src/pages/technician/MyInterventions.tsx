import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { 
  Check, 
  Clock, 
  X, 
  Edit, 
  AlertCircle, 
  Info, 
  Wrench, 
  HardHat,
  TrendingUp,
  Calendar,
  Filter,
  ChevronRight,
  ExternalLink,
  MoreVertical,
  Loader2,
  Search,
  RefreshCw
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Définir l'interface Intervention
interface Intervention {
  id: number;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'CREATED' | 'CANCELLED' | 'DONE' | 'ASSIGNED' | 'IN_PROGRESS';
  machineId?: number;
  machineName?: string;
  machine?: {
    id: number;
    name: string;
    location?: string;
  };
  technicianId?: number;
  technicianName?: string;
  technician?: {
    id: number;
    name: string;
  };
  createdAt?: string;
  estimatedDuration?: string;
}

export default function TechnicianInterventions() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [filteredInterventions, setFilteredInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: 'CREATED',
    description: '',
  });
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    done: 0,
    assigned: 0,
  });

  useEffect(() => {
    fetchMyInterventions();
  }, []);

  useEffect(() => {
    filterAndSearchInterventions();
  }, [interventions, searchTerm, statusFilter, priorityFilter]);

  useEffect(() => {
    if (interventions.length > 0) {
      calculateStats();
    }
  }, [interventions]);

  const fetchMyInterventions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8089/api/interventions/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const raw = res.data;
      const list = Array.isArray(raw) ? raw : raw?.content ?? [];
      
      // Ajouter une durée estimée à titre démonstratif
      const normalized = list.map((it: any) => ({
        id: Number(it.id),
        description: it.description ?? '',
        priority: it.priority ?? 'MEDIUM',
        status: it.status ?? 'CREATED',
        machineId: it.machineId ? Number(it.machineId) : it.machine?.id,
        machineName: it.machineName ?? it.machine?.name ?? 'Machine inconnue',
        machine: it.machine,
        technicianId: it.technicianId ? Number(it.technicianId) : it.technician?.id,
        technicianName: it.technicianName ?? it.technician?.name ?? 'Technicien inconnu',
        createdAt: it.createdAt ?? undefined,
        estimatedDuration: ['1-2 heures', '2-3 heures', '3-4 heures', '4+ heures'][Math.floor(Math.random() * 4)],
      }));

      setInterventions(normalized);
      
      await MySwal.fire({
        title: 'Données chargées',
        text: 'Vos interventions ont été mises à jour',
        icon: 'success',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'OK',
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error('Échec du chargement des interventions', err);
      showError('Échec du chargement des interventions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMyInterventions();
  };

  const filterAndSearchInterventions = () => {
    let filtered = [...interventions];

    // Appliquer le filtre de recherche
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.machineName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Appliquer le filtre de statut
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Appliquer le filtre de priorité
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }

    setFilteredInterventions(filtered);
  };

  const calculateStats = () => {
    const stats = {
      total: interventions.length,
      inProgress: interventions.filter(i => i.status === 'IN_PROGRESS').length,
      done: interventions.filter(i => i.status === 'DONE').length,
      assigned: interventions.filter(i => i.status === 'ASSIGNED').length,
    };
    setStats(stats);
  };

  const showSuccess = (title: string, text: string = '') => {
    MySwal.fire({
      title,
      text,
      icon: 'success',
      background: '#f9fafb',
      color: '#1f2937',
      confirmButtonColor: '#10b981',
      confirmButtonText: 'OK',
      timer: 3000,
      timerProgressBar: true,
    });
  };

  const showError = (message: string) => {
    MySwal.fire({
      title: 'Erreur',
      text: message,
      icon: 'error',
      background: '#f9fafb',
      color: '#1f2937',
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'OK',
    });
  };

  const showConfirmation = (title: string, text: string) => {
    return MySwal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      background: '#f9fafb',
      color: '#1f2937',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, continuer',
      cancelButtonText: 'Annuler',
    });
  };

  const handleOpenUpdate = (intervention: Intervention) => {
    setSelectedIntervention(intervention);
    setUpdateData({
      status: intervention.status,
      description: intervention.description || '',
    });
    setShowUpdateModal(true);
  };

  const handleQuickStatusUpdate = async (interventionId: number, newStatus: 'IN_PROGRESS' | 'DONE' | 'CANCELLED', interventionName: string) => {
    const statusLabels = {
      'IN_PROGRESS': 'En cours',
      'DONE': 'Terminée',
      'CANCELLED': 'Annulée'
    };

    const result = await showConfirmation(
      `Mettre à jour le statut en ${statusLabels[newStatus]} ?`,
      `Êtes-vous sûr de vouloir changer le statut de "${interventionName}" à ${statusLabels[newStatus]} ?`
    );

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      const payload = { status: newStatus };
      
      await axios.patch(
        `http://localhost:8089/api/interventions/${interventionId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Mettre à jour l'état local
      setInterventions(prev => prev.map(intervention => 
        intervention.id === interventionId 
          ? { ...intervention, status: newStatus }
          : intervention
      ));
      
      showSuccess(`Statut mis à jour`, `Le statut de l'intervention a été changé en ${statusLabels[newStatus]}`);
      fetchMyInterventions();
    } catch (error: any) {
      console.error('Échec de la mise à jour du statut:', error);
      showError(error.response?.data?.message || 'Échec de la mise à jour du statut');
    }
  };

  const handleUpdateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntervention) return;

    const result = await showConfirmation(
      'Mettre à jour l\'intervention',
      'Êtes-vous sûr de vouloir mettre à jour cette intervention ?'
    );

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      const payload = {
        status: updateData.status,
        description: updateData.description,
      };

      await axios.patch(
        `http://localhost:8089/api/interventions/${selectedIntervention.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Mettre à jour l'état local
      setInterventions(prev => prev.map(intervention => 
        intervention.id === selectedIntervention.id 
          ? { ...intervention, ...payload }
          : intervention
      ));

      showSuccess('Intervention mise à jour', 'L\'intervention a été mise à jour avec succès');
      setShowUpdateModal(false);
      setSelectedIntervention(null);
      setUpdateData({ status: 'CREATED', description: '' });
      fetchMyInterventions();
    } catch (error: any) {
      console.error('Échec de la mise à jour de l\'intervention:', error);
      showError(error.response?.data?.message || 'Échec de la mise à jour de l\'intervention');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ASSIGNED':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'IN_PROGRESS':
        return 'bg-violet-100 text-violet-700 border-violet-200';
      case 'DONE':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CREATED':
        return '📝';
      case 'ASSIGNED':
        return '👤';
      case 'IN_PROGRESS':
        return '⚙️';
      case 'DONE':
        return '✅';
      case 'CANCELLED':
        return '❌';
      default:
        return '📋';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'CREATED': 'Créée',
      'ASSIGNED': 'Assignée',
      'IN_PROGRESS': 'En cours',
      'DONE': 'Terminée',
      'CANCELLED': 'Annulée',
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'HIGH':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return '⬇️';
      case 'MEDIUM':
        return '➡️';
      case 'HIGH':
        return '⬆️';
      default:
        return '📊';
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      'LOW': 'Basse',
      'MEDIUM': 'Moyenne',
      'HIGH': 'Haute',
    };
    return labels[priority] || priority;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      <span className="mr-1">{getStatusIcon(status)}</span>
      {getStatusLabel(status)}
    </span>
  );

  const PriorityBadge = ({ priority }: { priority: string }) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(priority)}`}>
      <span className="mr-1">{getPriorityIcon(priority)}</span>
      {getPriorityLabel(priority)}
    </span>
  );

  const StatCard = ({ title, value, color, icon: Icon }: any) => (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-2" style={{ color }}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Chargement de vos interventions...</p>
            <p className="text-gray-400 text-sm mt-2">Veuillez patienter pendant que nous récupérons vos données</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* En-tête */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mes interventions</h1>
                <p className="text-gray-600 mt-1">Gérez vos tâches de maintenance assignées</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
                </button>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg flex items-center">
                    <HardHat className="w-5 h-5 mr-2" />
                    <span className="font-medium">{stats.total} Tâches</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Vue d'ensemble des statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Tâches totales"
              value={stats.total}
              color="#4f46e5"
              icon={TrendingUp}
            />
            <StatCard
              title="En cours"
              value={stats.inProgress}
              color="#7c3aed"
              icon={Wrench}
            />
            <StatCard
              title="Terminées"
              value={stats.done}
              color="#10b981"
              icon={Check}
            />
            <StatCard
              title="Assignées"
              value={stats.assigned}
              color="#f59e0b"
              icon={HardHat}
            />
          </div>

          {/* Filtres et recherche */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher des interventions par description ou machine..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="ALL">Tous les statuts</option>
                    <option value="CREATED">Créée</option>
                    <option value="ASSIGNED">Assignée</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="DONE">Terminée</option>
                    <option value="CANCELLED">Annulée</option>
                  </select>
                </div>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="ALL">Toutes les priorités</option>
                  <option value="LOW">Basse</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="HIGH">Haute</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grille d'interventions */}
          {filteredInterventions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune intervention trouvée</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                  ? 'Essayez de modifier vos critères de recherche ou de filtrage'
                  : 'Aucune intervention ne vous est actuellement assignée'}
              </p>
              {(searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                    setPriorityFilter('ALL');
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredInterventions.map((intervention) => (
                <div
                  key={intervention.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="p-6">
                    {/* En-tête */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg line-clamp-2 leading-snug">
                          {intervention.description}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-medium text-gray-700">Machine :</span>
                          <span className="text-sm text-gray-600">{intervention.machineName}</span>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Étiquettes */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      <StatusBadge status={intervention.status} />
                      <PriorityBadge priority={intervention.priority} />
                    </div>

                    {/* Détails */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>
                          Créée le : {intervention.createdAt ? formatDate(intervention.createdAt) : 'Non disponible'}
                        </span>
                      </div>
                      {intervention.estimatedDuration && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          <span>Durée estimée : {intervention.estimatedDuration}</span>
                        </div>
                      )}
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex flex-wrap gap-2">
                      {intervention.status === 'ASSIGNED' || intervention.status === 'CREATED' ? (
                        <button
                          onClick={() => handleQuickStatusUpdate(intervention.id, 'IN_PROGRESS', intervention.description)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-200 font-medium"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Démarrer le travail
                        </button>
                      ) : intervention.status === 'IN_PROGRESS' ? (
                        <>
                          <button
                            onClick={() => handleQuickStatusUpdate(intervention.id, 'DONE', intervention.description)}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-lg hover:from-emerald-700 hover:to-green-600 transition-all duration-200 font-medium"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Marquer comme terminé
                          </button>
                          <button
                            onClick={() => handleQuickStatusUpdate(intervention.id, 'CANCELLED', intervention.description)}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-rose-600 to-pink-500 text-white rounded-lg hover:from-rose-700 hover:to-pink-600 transition-all duration-200 font-medium"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Annuler
                          </button>
                        </>
                      ) : null}

                      <button
                        onClick={() => handleOpenUpdate(intervention)}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 font-medium"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier les détails
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Compteur de résultats */}
          {filteredInterventions.length > 0 && (
            <div className="mt-8 text-center text-gray-500 text-sm">
              Affichage de {filteredInterventions.length} sur {interventions.length} interventions
            </div>
          )}
        </div>
      </div>

      {/* Modal de mise à jour - CORRIGÉE POUR RESPONSIVE */}
      {showUpdateModal && selectedIntervention && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 transform transition-all duration-300 scale-100">
            {/* En-tête de la modal */}
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Mettre à jour l'intervention</h2>
                  <p className="text-gray-600 mt-1">Mettez à jour les détails de votre intervention</p>
                </div>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Corps de la modal avec défilement */}
            <form onSubmit={handleUpdateIntervention} className="max-h-[calc(100vh-16rem)] overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Informations sur la machine */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{selectedIntervention.machineName}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <div className="flex-shrink-0">
                          <PriorityBadge priority={selectedIntervention.priority} />
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap">• La priorité ne peut pas être modifiée</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Champ de statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Statut <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(['CREATED', 'ASSIGNED', 'IN_PROGRESS', 'DONE', 'CANCELLED'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setUpdateData({ ...updateData, status })}
                        className={`px-3 py-3 rounded-xl border transition-all duration-200 min-h-[70px] flex flex-col items-center justify-center ${
                          updateData.status === status
                            ? `${getStatusColor(status)} border-2`
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg mb-1">{getStatusIcon(status)}</span>
                        <span className="text-xs font-medium text-center px-1">{getStatusLabel(status)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Champ de description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={updateData.description}
                    onChange={(e) => setUpdateData({ ...updateData, description: e.target.value })}
                    rows={4}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
                    placeholder="Décrivez ce qui doit être fait ou mettez à jour la description..."
                  />
                </div>

                {/* Boîte d'information */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900">Note</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        En tant que technicien, vous ne pouvez modifier que les champs de statut et de description. 
                        Toutes les modifications sont enregistrées et suivies dans le système.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pied de la modal - fixé en bas */}
              <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 rounded-b-2xl">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 order-2 sm:order-1"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-500 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg order-1 sm:order-2"
                  >
                    <div className="flex items-center justify-center">
                      <Check className="w-5 h-5 mr-2" />
                      Enregistrer les modifications
                    </div>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}