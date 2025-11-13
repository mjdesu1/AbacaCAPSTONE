import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Edit,
  Trash2,
  Package
} from 'lucide-react';
import { getUserData, getAuthToken } from '../../utils/authToken';

interface SalesReport {
  id: string;
  farmerId: string;
  farmerName: string;
  buyerName?: string;
  totalRevenue: number;
  totalQuantity: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

const UnifiedSalesManagement: React.FC = () => {
  const [recentReports, setRecentReports] = useState<SalesReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from API
  useEffect(() => {
    const loadSalesData = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        
        if (!token) {
          console.error('No authentication token found');
          setLoading(false);
          return;
        }

        // Fetch sales reports
        const reportsResponse = await fetch(`${apiUrl}/api/sales/reports`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          if (reportsData.success && reportsData.reports) {
            const formattedReports = reportsData.reports.map((report: any) => ({
              id: report.report_id,
              farmerId: report.farmer_id,
              farmerName: report.farmers?.full_name || 'Unknown Farmer',
              buyerName: report.buyer_company_name,
              totalRevenue: report.total_amount || 0,
              totalQuantity: report.quantity_sold || 0,
              status: report.status || 'pending',
              submittedAt: report.submitted_at
            }));
            setRecentReports(formattedReports);
          }
        }
      } catch (error) {
        console.error('Error loading sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSalesData();
  }, []);

  // Handle approve report
  const handleApproveReport = async (reportId: string) => {
    try {
      const token = getAuthToken();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/sales/reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'approved',
          reviewed_by: getUserData()?.id
        })
      });

      if (response.ok) {
        setRecentReports(prev => 
          prev.map(report => 
            report.id === reportId 
              ? { ...report, status: 'approved' as const }
              : report
          )
        );
      }
    } catch (error) {
      console.error('Error approving report:', error);
    }
  };

  // Handle reject report
  const handleRejectReport = async (reportId: string) => {
    try {
      const token = getAuthToken();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/sales/reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'rejected',
          reviewed_by: getUserData()?.id,
          rejection_reason: 'Rejected by admin'
        })
      });

      if (response.ok) {
        setRecentReports(prev => 
          prev.map(report => 
            report.id === reportId 
              ? { ...report, status: 'rejected' as const }
              : report
          )
        );
      }
    } catch (error) {
      console.error('Error rejecting report:', error);
    }
  };

  // Filter reports based on search and filters
  const filteredReports = recentReports.filter(report => {
    const matchesSearch = !searchTerm || 
      report.farmerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      const reportDate = new Date(report.submittedAt);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          return reportDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return reportDate >= weekAgo;
        case 'month':
          return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Management</h1>
          <p className="text-gray-600">Monitor, verify, and manage farmer sales transactions</p>
        </div>

        {/* Overview Stats - Only show verified data */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₱{recentReports.filter(r => r.status === 'approved').reduce((sum, r) => sum + (r.totalRevenue || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                  <p className="text-2xl font-bold text-yellow-600">{recentReports.filter(r => r.status === 'pending').length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Farmers</p>
                  <p className="text-2xl font-bold text-blue-600">{new Set(recentReports.map(r => r.farmerId)).size}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Abaca Sold</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {recentReports.filter(r => r.status === 'approved').reduce((sum, r) => sum + (r.totalQuantity || 0), 0).toLocaleString()} kg
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{recentReports.length}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search farmers, buyers, locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Reports Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sales Reports</h3>
                <p className="text-sm text-gray-500 mt-1">Manage and verify farmer sales transactions</p>
              </div>
              <div className="flex gap-2">
                {selectedReports.length > 0 && (
                  <button className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete ({selectedReports.length})
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReports(filteredReports.map(r => r.id));
                        } else {
                          setSelectedReports([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedReports.includes(report.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReports([...selectedReports, report.id]);
                          } else {
                            setSelectedReports(selectedReports.filter(id => id !== report.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.farmerName}</div>
                          <div className="text-sm text-gray-500">ID: {report.farmerId?.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.buyerName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {report.status === 'approved' ? `₱${report.totalRevenue?.toLocaleString()}` : 'Pending verification'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.totalQuantity} kg</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {report.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                        {report.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {report.status === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          report.status === 'approved' ? 'bg-green-100 text-green-800' :
                          report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(report.submittedAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Edit Report"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {report.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApproveReport(report.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                              title="Approve Report"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectReport(report.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                              title="Reject Report"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredReports.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-gray-500 mb-2">No sales reports found</div>
              <div className="text-sm text-gray-400">Farmer sales reports will appear here for management and verification</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedSalesManagement;
