import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import axiosInstance from '../../api/axios';
import { 
  Clipboard, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Wrench, 
  TrendingUp, 
  Activity,
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    done: 0,
    highPriority: 0,
    lowPriority: 0,
    mediumPriority: 0,
  });
  const [machineStats, setMachineStats] = useState<{name: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/interventions');
      const machinesResponse = await axiosInstance.get('/machines');
      
      if (import.meta.env.DEV) console.debug('GET /api/interventions response (dashboard)', response.data);
      
      const raw = response.data;
      const list = Array.isArray(raw) ? raw : raw?.content ?? [];
      
      // Récupérer les données des machines
      const machinesRaw = machinesResponse.data;
      const machinesList = Array.isArray(machinesRaw) ? machinesRaw : machinesRaw?.content ?? [];

      // Calculer les statistiques des interventions par machine
      const machineInterventions = new Map<string, number>();
      
      list.forEach((intervention: any) => {
        if (intervention.machineId && intervention.machineName) {
          const currentCount = machineInterventions.get(intervention.machineName) || 0;
          machineInterventions.set(intervention.machineName, currentCount + 1);
        }
      });

      // Trier les machines par nombre d'interventions et prendre les 5 premières
      const sortedMachineStats = Array.from(machineInterventions.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setMachineStats(sortedMachineStats);

      const stats = {
        total: list.length,
        pending: list.filter((i: any) => i.status === 'CREATED' || i.status === 'ASSIGNED').length,
        inProgress: list.filter((i: any) => i.status === 'IN_PROGRESS').length,
        done: list.filter((i: any) => i.status === 'DONE').length,
        highPriority: list.filter((i: any) => i.priority === 'HIGH').length,
        mediumPriority: list.filter((i: any) => i.priority === 'MEDIUM').length,
        lowPriority: list.filter((i: any) => i.priority === 'LOW').length,
      };

      setStats(stats);
    } catch (error) {
      console.error('Échec de la récupération des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, description }: any) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-2">{description}</p>
          )}
          {trend && (
            <div className={`inline-flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`} />
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} shadow-md`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  const PriorityCard = ({ title, value, color, percentage }: any) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
            <div 
              className={`h-2.5 rounded-full ${color}`} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{percentage.toFixed(1)}% du total</p>
        </div>
      </div>
    </div>
  );

  const MachineCard = ({ machine, index }: any) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-3 rounded-xl ${index === 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'} mr-4`}>
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{machine.name}</p>
            <p className="text-sm text-gray-500">Nombre d'interventions</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{machine.count}</p>
          {index === 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
              Plus fréquente
            </span>
          )}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" 
          style={{ 
            width: `${(machine.count / Math.max(...machineStats.map(m => m.count))) * 100}%` 
          }}
        ></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-gray-600">Chargement du tableau de bord...</div>
          </div>
        </div>
      </>
    );
  }

  const totalPriority = stats.highPriority + stats.mediumPriority + stats.lowPriority;
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
              <p className="text-gray-600 mt-1">Vue d'ensemble des interventions de maintenance</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-2 border border-gray-200">
                <span className="text-sm text-gray-600 px-3">Période:</span>
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="text-sm border-none focus:ring-0 focus:outline-none bg-transparent"
                >
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="quarter">Ce trimestre</option>
                  <option value="year">Cette année</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cartes principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Interventions totales"
              value={stats.total}
              icon={Clipboard}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
              description="Toutes les interventions"
            />
            <StatCard
              title="En attente"
              value={stats.pending}
              icon={Clock}
              color="bg-gradient-to-r from-yellow-500 to-yellow-600"
              description="Créées ou assignées"
            />
            <StatCard
              title="En cours"
              value={stats.inProgress}
              icon={Wrench}
              color="bg-gradient-to-r from-purple-500 to-purple-600"
              description="En traitement"
            />
            <StatCard
              title="Terminées"
              value={stats.done}
              icon={CheckCircle}
              color="bg-gradient-to-r from-green-500 to-green-600"
              description="Résolues"
            />
          </div>

          {/* Section des priorités */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <BarChart3 className="w-6 h-6 text-gray-700 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Analyse des priorités</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PriorityCard
                title="Haute priorité"
                value={stats.highPriority}
                color="bg-gradient-to-r from-red-500 to-red-600"
                percentage={totalPriority > 0 ? (stats.highPriority / stats.total) * 100 : 0}
              />
              <PriorityCard
                title="Priorité moyenne"
                value={stats.mediumPriority}
                color="bg-gradient-to-r from-orange-500 to-orange-600"
                percentage={totalPriority > 0 ? (stats.mediumPriority / stats.total) * 100 : 0}
              />
              <PriorityCard
                title="Basse priorité"
                value={stats.lowPriority}
                color="bg-gradient-to-r from-blue-500 to-blue-600"
                percentage={totalPriority > 0 ? (stats.lowPriority / stats.total) * 100 : 0}
              />
            </div>
          </div>

          {/* Machines les plus fréquemment réparées */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Activity className="w-6 h-6 text-gray-700 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Machines les plus réparées</h2>
              </div>
              <span className="text-sm text-gray-500">
                Top {machineStats.length} machines
              </span>
            </div>
            
            {machineStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {machineStats.map((machine, index) => (
                  <MachineCard key={machine.name} machine={machine} index={index} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-xl bg-gray-100 text-gray-600 mb-4">
                    <Activity className="w-8 h-8" />
                  </div>
                  <p className="text-gray-900 font-medium mb-2">Aucune donnée de machine disponible</p>
                  <p className="text-gray-500">Les données d'interventions par machine seront affichées ici</p>
                </div>
              </div>
            )}
          </div>

          {/* Carte d'alerte haute priorité */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-white mr-3" />
                    <h3 className="text-2xl font-bold text-white">Alertes haute priorité</h3>
                  </div>
                  <p className="text-red-100 mb-2">
                    {stats.highPriority > 0 
                      ? `${stats.highPriority} intervention(s) nécessite(nt) une attention immédiate`
                      : "Aucune alerte haute priorité actuellement"}
                  </p>
                  <p className="text-red-100 text-sm">
                    Ces interventions doivent être traitées en priorité
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center justify-center p-4 bg-white/20 rounded-xl">
                    <span className="text-4xl font-bold text-white">{stats.highPriority}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Statistiques rapides</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-600">Taux de réussite</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-gray-600">En attente</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
                <p className="text-sm text-gray-600">Actives</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;