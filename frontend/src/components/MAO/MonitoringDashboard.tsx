import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Filter,
  Download,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  TrendingUp,
  Users,
  Activity,
  X,
  User,
  Leaf,
  CheckCircle
} from 'lucide-react';
import { MonitoringRecord, MonitoringFilters } from '../../types/monitoring';
import {
  calculateStats,
  filterRecords,
  sortByDate,
  getUpcomingMonitoring,
  getOverdueMonitoring,
  formatDate,
  daysUntilMonitoring,
  getConditionColor,
  getGrowthStageColor,
  downloadCSV
} from '../../utils/monitoringHelpers';
import MonitoringForm from './MonitoringForm';

interface MonitoringDashboardProps {
  records: MonitoringRecord[];
  onAddRecord: (data: any) => Promise<void>;
  onUpdateRecord: (id: string, data: any) => Promise<void>;
  onDeleteRecord: (id: string) => Promise<void>;
  farmersList?: Array<{ id: string; name: string; association?: string }>;
  currentOfficer?: { name: string; role: string } | null;
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  records,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  farmersList = [],
  currentOfficer = null
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MonitoringRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MonitoringRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MonitoringFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'overdue'>('all');

  const stats = useMemo(() => calculateStats(records), [records]);

  const filteredRecords = useMemo(() => {
    let filtered = filterRecords(records, filters);
    
    if (searchQuery) {
      filtered = filtered.filter(record =>
        record.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.monitoredBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.monitoringId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeTab === 'upcoming') {
      filtered = getUpcomingMonitoring(filtered);
    } else if (activeTab === 'overdue') {
      filtered = getOverdueMonitoring(filtered);
    } else {
      filtered = sortByDate(filtered);
    }

    return filtered;
  }, [records, filters, searchQuery, activeTab]);

  const handleFormSubmit = async (data: any) => {
    if (editingRecord) {
      await onUpdateRecord(editingRecord.monitoringId, data);
    } else {
      await onAddRecord(data);
    }
    setShowForm(false);
    setEditingRecord(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-emerald-50 to-teal-50 p-4 sm:p-6 lg:p-8">
      {/* Modern Statistics Cards with Gradients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8">
          {/* Total Monitoring Card */}
          <div className="group relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-white/60" />
              </div>
              <p className="text-white/90 text-sm font-medium mb-1">Total Monitoring</p>
              <p className="text-4xl font-bold text-white">{stats.totalMonitoring}</p>
            </div>
          </div>

          {/* Healthy Farms Card */}
          <div className="group relative bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs text-white font-semibold">
                  Excellent
                </span>
              </div>
              <p className="text-white/90 text-sm font-medium mb-1">Healthy Farms</p>
              <p className="text-4xl font-bold text-white">{stats.healthyFarms}</p>
            </div>
          </div>

          {/* Needs Support Card */}
          <div className="group relative bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs text-white font-semibold">
                  Action Needed
                </span>
              </div>
              <p className="text-white/90 text-sm font-medium mb-1">Needs Support</p>
              <p className="text-4xl font-bold text-white">{stats.needsSupport}</p>
            </div>
          </div>

          {/* Upcoming Visits Card */}
          <div className="group relative bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs text-white font-semibold">
                  Scheduled
                </span>
              </div>
              <p className="text-white/90 text-sm font-medium mb-1">Upcoming Visits</p>
              <p className="text-4xl font-bold text-white">{stats.upcomingMonitoring}</p>
            </div>
          </div>
      </div>

      {/* Modern Search and Filters with Glassmorphism */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by farmer name, monitoring ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="group px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center justify-center space-x-2 hover:scale-105 text-sm sm:text-base"
          >
            <div className="p-1.5 bg-white rounded-lg group-hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
            </div>
            <span>Filters</span>
          </button>
          <button
            onClick={() => downloadCSV(filteredRecords)}
            className="group px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center justify-center space-x-2 hover:scale-105 text-sm sm:text-base"
          >
            <div className="p-1.5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
              <Download className="w-4 h-4" />
            </div>
            <span>Export</span>
          </button>
          <button
            onClick={() => { setEditingRecord(null); setShowForm(true); }}
            className="group px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center space-x-2 hover:scale-105 text-sm sm:text-base"
          >
            <div className="p-1.5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <span>Add New</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">Farm Condition</label>
              <select
                value={filters.farmCondition || ''}
                onChange={(e) => setFilters({ ...filters, farmCondition: e.target.value as any })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all duration-200"
              >
                <option value="">All Conditions</option>
                <option value="Healthy">Healthy</option>
                <option value="Needs Support">Needs Support</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">Date From</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">Date To</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* Modern Tabs with Glassmorphism */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6 sm:mb-8">
        <button
          onClick={() => setActiveTab('all')}
          className={`group relative flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base ${
            activeTab === 'all'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/50 scale-105'
              : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-lg border border-gray-200'
          }`}
        >
          <div className={`p-2 rounded-lg transition-colors ${
            activeTab === 'all' ? 'bg-white/20' : 'bg-emerald-50 group-hover:bg-emerald-100'
          }`}>
            <Activity className="w-5 h-5" />
          </div>
          <span>All Records ({records.length})</span>
          {activeTab === 'all' && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`group relative flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base ${
            activeTab === 'upcoming'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/50 scale-105'
              : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-lg border border-gray-200'
          }`}
        >
          <div className={`p-2 rounded-lg transition-colors ${
            activeTab === 'upcoming' ? 'bg-white/20' : 'bg-blue-50 group-hover:bg-blue-100'
          }`}>
            <Calendar className="w-5 h-5" />
          </div>
          <span>Upcoming ({stats.upcomingMonitoring})</span>
          {activeTab === 'upcoming' && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`group relative flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base ${
            activeTab === 'overdue'
              ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-xl shadow-red-500/50 scale-105'
              : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-lg border border-gray-200'
          }`}
        >
          <div className={`p-2 rounded-lg transition-colors ${
            activeTab === 'overdue' ? 'bg-white/20' : 'bg-red-50 group-hover:bg-red-100'
          }`}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <span>Overdue ({stats.overdueMonitoring})</span>
          {activeTab === 'overdue' && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-full"></div>
          )}
        </button>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No monitoring records found</h3>
            <p className="text-gray-600 mb-6">Start by creating your first monitoring record</p>
            <button
              onClick={() => { setEditingRecord(null); setShowForm(true); }}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              Create First Record
            </button>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div key={record.monitoringId} className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start justify-between mb-3 sm:mb-4 pb-3 border-b border-gray-200 gap-2">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{record.farmerName}</h3>
                        {record.associationName && (
                          <p className="text-sm text-gray-500 mt-0.5">{record.associationName}</p>
                        )}
                      </div>
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded">
                        {record.monitoringId}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Visit Date</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(record.dateOfVisit)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Monitored By</p>
                        <p className="text-sm font-medium text-gray-900">{record.monitoredBy}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Farm Condition</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getConditionColor(record.farmCondition)}`}>
                          {record.farmCondition}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Growth Stage</p>
                        <p className="text-sm font-medium text-gray-900">{record.growthStage}</p>
                      </div>
                    </div>

                    {/* Issues */}
                    {record.issuesObserved.length > 0 && (
                      <div className="mb-3 bg-red-50 border border-red-200 rounded p-2.5">
                        <p className="text-xs text-red-700 font-medium mb-1.5">Issues Observed:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {record.issuesObserved.map((issue, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                              {issue}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next Monitoring */}
                    <div className="bg-blue-50 border border-blue-200 rounded p-2.5">
                      <p className="text-xs text-blue-700 font-medium mb-0.5">Next Monitoring:</p>
                      <p className="text-sm font-semibold text-blue-900">
                        {formatDate(record.nextMonitoringDate)}
                        <span className="ml-2 text-xs font-normal text-blue-700">
                          ({daysUntilMonitoring(record.nextMonitoringDate) >= 0 
                            ? `in ${daysUntilMonitoring(record.nextMonitoringDate)} days`
                            : `${Math.abs(daysUntilMonitoring(record.nextMonitoringDate))} days overdue`})
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="flex-1 lg:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => { setEditingRecord(record); setShowForm(true); }}
                      className="flex-1 lg:flex-none px-3 sm:px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteRecord(record.monitoringId)}
                      className="flex-1 lg:flex-none px-3 sm:px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <MonitoringForm
            onSubmit={handleFormSubmit}
            onCancel={() => { setShowForm(false); setEditingRecord(null); }}
            initialData={editingRecord || undefined}
            farmersList={farmersList}
            currentOfficer={currentOfficer}
          />
        </div>
      )}

      {/* View Details Modal - Complete Information */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-2xl z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Monitoring Details</h2>
                  <p className="text-emerald-100 text-sm mt-1">Complete monitoring record information</p>
                </div>
                <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Monitoring ID</p>
                    <p className="font-semibold text-gray-800 font-mono text-sm bg-white px-3 py-2 rounded border">{selectedRecord.monitoringId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date of Visit</p>
                    <p className="font-semibold text-gray-800">{formatDate(selectedRecord.dateOfVisit)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Monitored By (Officer)</p>
                    <p className="font-semibold text-gray-800">{selectedRecord.monitoredBy}</p>
                  </div>
                  {selectedRecord.monitoredByRole && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Officer Role</p>
                      <p className="font-semibold text-gray-800">{selectedRecord.monitoredByRole}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Farmer Information */}
              <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Farmer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Farmer Name</p>
                    <p className="font-semibold text-gray-800">{selectedRecord.farmerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Association</p>
                    <p className="font-semibold text-gray-800">{selectedRecord.associationName || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Farm Location</p>
                    <p className="font-semibold text-gray-800">{selectedRecord.farmLocation || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Farm Assessment */}
              <div className="bg-green-50 rounded-xl p-5 border-2 border-green-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Leaf className="w-5 h-5 mr-2 text-green-600" />
                  Farm Assessment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Farm Condition</p>
                    <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getConditionColor(selectedRecord.farmCondition)}`}>
                      {selectedRecord.farmCondition}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Growth Stage</p>
                    <p className="font-semibold text-gray-800">{selectedRecord.growthStage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Weather Condition</p>
                    <p className="font-semibold text-gray-800">{selectedRecord.weatherCondition || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Estimated Yield</p>
                    <p className="font-semibold text-gray-800">{selectedRecord.estimatedYield ? `${selectedRecord.estimatedYield} kg` : 'N/A'}</p>
                  </div>
                </div>

                {/* Issues Observed */}
                {selectedRecord.issuesObserved && selectedRecord.issuesObserved.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-sm text-gray-500 mb-2">Issues Observed</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecord.issuesObserved.map((issue, idx) => (
                        <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-lg font-medium border border-red-200">
                          {issue}
                        </span>
                      ))}
                    </div>
                    {selectedRecord.otherIssues && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-1">Other Issues</p>
                        <p className="text-gray-700 bg-white px-3 py-2 rounded border">{selectedRecord.otherIssues}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions and Recommendations */}
              <div className="bg-purple-50 rounded-xl p-5 border-2 border-purple-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-purple-600" />
                  Actions & Recommendations
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2 font-semibold">Actions Taken</p>
                    <p className="text-gray-700 whitespace-pre-wrap bg-white px-4 py-3 rounded-lg border">{selectedRecord.actionsTaken}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2 font-semibold">Recommendations</p>
                    <p className="text-gray-700 whitespace-pre-wrap bg-white px-4 py-3 rounded-lg border">{selectedRecord.recommendations}</p>
                  </div>
                  {selectedRecord.remarks && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2 font-semibold">Additional Remarks</p>
                      <p className="text-gray-700 whitespace-pre-wrap bg-white px-4 py-3 rounded-lg border">{selectedRecord.remarks}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Monitoring */}
              <div className="bg-indigo-50 rounded-xl p-5 border-2 border-indigo-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                  Next Monitoring Schedule
                </h3>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Next Monitoring Date</p>
                  <p className="text-lg font-bold text-indigo-900">
                    {formatDate(selectedRecord.nextMonitoringDate)}
                    <span className="ml-3 text-sm font-normal text-indigo-700">
                      ({daysUntilMonitoring(selectedRecord.nextMonitoringDate) >= 0 
                        ? `in ${daysUntilMonitoring(selectedRecord.nextMonitoringDate)} days`
                        : `${Math.abs(daysUntilMonitoring(selectedRecord.nextMonitoringDate))} days overdue`})
                    </span>
                  </p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 rounded-xl p-5 border">
                <h3 className="font-bold text-gray-800 mb-4 text-sm">Record Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {selectedRecord.createdAt && (
                    <div>
                      <p className="text-gray-500 mb-1">Created At</p>
                      <p className="text-gray-700 font-mono">{new Date(selectedRecord.createdAt).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedRecord.updatedAt && (
                    <div>
                      <p className="text-gray-500 mb-1">Last Updated</p>
                      <p className="text-gray-700 font-mono">{new Date(selectedRecord.updatedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringDashboard;
