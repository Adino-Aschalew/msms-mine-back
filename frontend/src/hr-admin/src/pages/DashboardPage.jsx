import { useState, useEffect } from 'react';
import { 
  Users, 
  UserMinus, 
  Briefcase, 
  Clock 
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
import { DepartmentChart, AttendanceChart, DiversityChart } from '../components/Dashboard/AnalyticsCharts';
import SortableWidget from '../components/Dashboard/SortableWidget';

// Initial Widgets State
const initialTopWidgets = [
  {
    id: 'stat-employees',
    component: <StatCard title="Total Employees" value="1,245" icon={Users} trend="up" trendValue="12%" colorClass="bg-blue-500" />
  },
  {
    id: 'stat-leave',
    component: <StatCard title="On Leave" value="38" icon={UserMinus} trend="down" trendValue="4%" colorClass="bg-rose-500" />
  },
  {
    id: 'stat-positions',
    component: <StatCard title="Open Positions" value="24" icon={Briefcase} trend="up" trendValue="8%" colorClass="bg-amber-500" />
  },
  {
    id: 'stat-pending',
    component: <StatCard title="Pending Approvals" value="12" icon={Clock} trend="down" trendValue="2%" colorClass="bg-violet-500" />
  }
];

const initialBottomWidgets = [
  { id: 'chart-dept', component: <DepartmentChart />, className: "col-span-1 lg:col-span-1" },
  { id: 'chart-attendance', component: <AttendanceChart />, className: "col-span-1 lg:col-span-2" },
  { id: 'chart-diversity', component: <DiversityChart />, className: "col-span-1 lg:col-span-1" },
  { id: 'activity-feed', component: <ActivityFeed />, className: "col-span-1 lg:col-span-2" }
];

export default function DashboardPage() {
  const [topWidgets, setTopWidgets] = useState(initialTopWidgets);
  const [bottomWidgets, setBottomWidgets] = useState(initialBottomWidgets);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await hrAPI.getDashboardStats();
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to fetch HR dashboard data');
      console.error('HR Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real widgets with backend data
  const dynamicTopWidgets = [
    {
      id: 'stat-employees',
      component: <StatCard title="Total Employees" value={dashboardData?.totalEmployees?.toLocaleString() || '0'} icon={Users} trend="up" trendValue={`${dashboardData?.employeeGrowthRate || '0'}%`} colorClass="bg-blue-500" />
    },
    {
      id: 'stat-leave',
      component: <StatCard title="On Leave" value={dashboardData?.employeesOnLeave?.toLocaleString() || '0'} icon={UserMinus} trend="down" trendValue={`${dashboardData?.leaveRate || '0'}%`} colorClass="bg-rose-500" />
    },
    {
      id: 'stat-positions',
      component: <StatCard title="Open Positions" value={dashboardData?.openPositions?.toLocaleString() || '0'} icon={Briefcase} trend="up" trendValue={`${dashboardData?.positionGrowthRate || '0'}%`} colorClass="bg-amber-500" />
    },
    {
      id: 'stat-pending',
      component: <StatCard title="Pending Approvals" value={dashboardData?.pendingApprovals?.toLocaleString() || '0'} icon={Clock} trend="down" trendValue={`${dashboardData?.approvalRate || '0'}%`} colorClass="bg-violet-500" />
    }
  ];

  const dynamicBottomWidgets = [
    { id: 'chart-dept', component: <DepartmentChart data={dashboardData?.departmentData} />, className: "col-span-1 lg:col-span-1" },
    { id: 'chart-attendance', component: <AttendanceChart data={dashboardData?.attendanceData} />, className: "col-span-1 lg:col-span-2" },
    { id: 'chart-diversity', component: <DiversityChart data={dashboardData?.diversityData} />, className: "col-span-1 lg:col-span-1" },
    { id: 'activity-feed', component: <ActivityFeed activities={dashboardData?.recentActivities} />, className: "col-span-1 lg:col-span-2" }
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    </div>
  );
}
