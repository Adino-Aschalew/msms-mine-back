import { useState, useEffect } from 'react';
import {
  Users,
  UserMinus,
  UserX,
  UserCheck,
  Briefcase,
  Clock,
  RefreshCw
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { hrAPI } from '../../../shared/services/hrAPI';
import { useAuth } from '../../../shared/contexts/AuthContext';

import StatCard from '../components/Dashboard/StatCard';
import ActivityFeed from '../components/Dashboard/ActivityFeed';
import SortableWidget from '../components/Dashboard/SortableWidget';
import SuccessModal from '../components/Dashboard/SuccessModal';

const DashboardPage = () => {
  // Compact number formatting function
  const formatCompactNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'METB';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'KETB';
    }
    return num.toString();
  };

// Initial Widgets State
const initialTopWidgets = [
  {
    id: 'stat-employees',
    component: <StatCard title="Total Employees" value="1,245" icon={Users} trend="up" trendValue="12%" colorClass="bg-blue-500" />
  },
  {
    id: 'stat-terminated',
    component: <StatCard title="Terminated User" value="12" icon={UserX} trend="up" trendValue="2%" colorClass="bg-rose-500" />
  },
  {
    id: 'stat-active',
    component: <StatCard title="Active User" value="1,233" icon={UserCheck} trend="up" trendValue="10%" colorClass="bg-emerald-500" />
  },
  {
    id: 'stat-pending',
    component: <StatCard title="Pending Approvals" value="12" icon={Clock} trend="down" trendValue="2%" colorClass="bg-violet-500" />
  }
];

const initialBottomWidgets = [
  { id: 'activity-feed', component: <ActivityFeed />, className: "col-span-1 lg:col-span-3" }
];

export default function DashboardPage() {
  const [topWidgets, setTopWidgets] = useState(initialTopWidgets);
  const [bottomWidgets, setBottomWidgets] = useState(initialBottomWidgets);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { user } = useAuth();

  // Move hooks to the top before any conditional returns
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await hrAPI.getDashboardStats();
      // Since hrAPI already returns response.data, we check if it's nested or the stats themselves
      const stats = response?.success ? response.data : (response?.data || response);
      setDashboardData(stats || {});
    } catch (err) {
      console.error('HR Dashboard error:', err);
      setError('Failed to fetch HR dashboard data. Please try again.');
      // Set default data to prevent UI crashes
      setDashboardData({
        totalEmployees: 0,
        activeEmployees: 0,
        terminated: 0,
        pendingApprovals: 0,
        employeeGrowthRate: 0,
        terminatedRate: 0,
        activeRate: 0,
        departmentData: [],
        attendanceData: [],
        diversityData: []
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDashboard = async () => {
    try {
      setUpdating(true);

      // Create stats object to update
      const statsToUpdate = {
        totalEmployees: dashboardData?.totalEmployees || 0,
        activeEmployees: dashboardData?.activeEmployees || 0,
        terminatedRate: dashboardData?.terminatedRate || 0,
        employeeGrowthRate: dashboardData?.employeeGrowthRate || 0,
        pendingApprovals: dashboardData?.pendingApprovals || 0,
        lastUpdated: new Date().toISOString()
      };

      const response = await hrAPI.updateDashboardStats(statsToUpdate);

      // Refresh dashboard data
      await fetchDashboardData();

      // Show success modal
      setShowSuccessModal(true);

    } catch (err) {
      console.error('Update dashboard error:', err);
      setError('Failed to update dashboard');
    } finally {
      setUpdating(false);
    }
  };

  // Real widgets with backend data
  const dynamicTopWidgets = [
    {
      id: 'stat-employees',
      component: <StatCard title="Total Employees" value={formatCompactNumber(dashboardData?.totalEmployees || 0)} icon={Users} trend="up" trendValue={`${dashboardData?.employeeGrowthRate || '0'}%`} colorClass="bg-blue-500" />
    },
    {
      id: 'stat-terminated',
      component: <StatCard title="Terminated User" value={formatCompactNumber(dashboardData?.terminated || 0)} icon={UserX} trend="up" trendValue={`${dashboardData?.terminatedRate || '0'}%`} colorClass="bg-rose-500" />
    },
    {
      id: 'stat-active',
      component: <StatCard title="Active User" value={formatCompactNumber(dashboardData?.activeEmployees || 0)} icon={UserCheck} trend="up" trendValue={`${dashboardData?.activeRate || '0'}%`} colorClass="bg-emerald-500" />
    },
    {
      id: 'stat-pending',
      component: <StatCard title="Pending Approvals" value={formatCompactNumber(dashboardData?.pendingApprovals || 0)} icon={Clock} trend="down" trendValue={`${dashboardData?.approvalRate || '0'}%`} colorClass="bg-violet-500" />
    }
  ];

  const dynamicBottomWidgets = [
    { id: 'activity-feed', component: <ActivityFeed activities={dashboardData?.recentActivities} />, className: "col-span-1 lg:col-span-3" }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const handleDragEndTop = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setTopWidgets((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEndBottom = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setBottomWidgets((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground text-sm">Welcome back, {user?.first_name || 'HR Admin'}. Here is what is happening today.</p>
        </div>

        <button
          onClick={updateDashboard}
          disabled={updating || !dashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors shadow-sm font-medium text-sm w-full sm:w-auto justify-center"
        >
          <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
          <span>{updating ? 'Updating...' : 'Update Dashboard'}</span>
        </button>
      </div>

      {/* Top STATS Row Editable via Drag-and-Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEndTop}
        modifiers={[restrictToWindowEdges]}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SortableContext
            items={dynamicTopWidgets.map(w => w.id)}
            strategy={rectSortingStrategy}
          >
            {dynamicTopWidgets.map(widget => (
              <SortableWidget key={widget.id} id={widget.id}>
                {widget.component}
              </SortableWidget>
            ))}
          </SortableContext>
        </div>
      </DndContext>

      {/* Analytics & Activity Row Editable via Drag-and-Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEndBottom}
        modifiers={[restrictToWindowEdges]}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SortableContext
            items={dynamicBottomWidgets.map(w => w.id)}
            strategy={rectSortingStrategy}
          >
            {dynamicBottomWidgets.map(widget => (
              <SortableWidget key={widget.id} id={widget.id} className={widget.className}>
                {widget.component}
              </SortableWidget>
            ))}
          </SortableContext>
        </div>
      </DndContext>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Dashboard Updated Successfully!"
        message="Your dashboard statistics have been updated and saved to the database. The latest data is now displayed."
      />
    </div>
  );
}
