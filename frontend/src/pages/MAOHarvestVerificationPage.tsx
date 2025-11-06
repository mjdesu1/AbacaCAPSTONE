import { useState, useEffect } from 'react';

interface Harvest {
  harvest_id: string;
  harvest_date: string;
  farmer_name: string;
  municipality: string;
  barangay: string;
  abaca_variety: string;
  area_hectares: number;
  dry_fiber_output_kg: number;
  fiber_grade: string;
  status: string;
  created_at: string;
}

export default function MAOHarvestVerificationPage() {
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending Verification');
  const [selectedHarvest, setSelectedHarvest] = useState<Harvest | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [actionType, setActionType] = useState<'verify' | 'reject'>('verify');

  useEffect(() => {
    fetchHarvests();
  }, [filter]);

  const fetchHarvests = async () => {
    try {
      const token = localStorage.getItem('token');
      const statusParam = filter !== 'all' ? `?status=${encodeURIComponent(filter)}` : '';
      
      const response = await fetch(`http://localhost:3001/api/harvests/mao/harvests${statusParam}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setHarvests(data.harvests);
      }
    } catch (error) {
      console.error('Error fetching harvests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyClick = (harvest: Harvest) => {
    setSelectedHarvest(harvest);
    setActionType('verify');
    setVerificationNotes('');
    setShowVerifyModal(true);
  };

  const handleRejectClick = (harvest: Harvest) => {
    setSelectedHarvest(harvest);
    setActionType('reject');
    setVerificationNotes('');
    setShowVerifyModal(true);
  };

  const handleSubmitVerification = async () => {
    if (!selectedHarvest) return;

    try {
      const token = localStorage.getItem('token');
      const endpoint = actionType === 'verify' ? 'verify' : 'reject';
      
      const response = await fetch(
        `http://localhost:3001/api/harvests/mao/harvests/${selectedHarvest.harvest_id}/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ verification_notes: verificationNotes })
        }
      );

      if (response.ok) {
        alert(`Harvest ${actionType === 'verify' ? 'verified' : 'rejected'} successfully!`);
        setShowVerifyModal(false);
        fetchHarvests();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process verification');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'Pending Verification': 'bg-yellow-100 text-yellow-800',
      'Verified': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'In Inventory': 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-green-800 mb-6">Harvest Verification</h1>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            {['Pending Verification', 'Verified', 'Rejected', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-3 font-medium ${
                  filter === status
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Harvests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading harvests...</div>
          ) : harvests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No harvests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harvest Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variety</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area (ha)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiber (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {harvests.map((harvest) => (
                    <tr key={harvest.harvest_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {harvest.farmer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {harvest.municipality}, {harvest.barangay}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(harvest.harvest_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {harvest.abaca_variety}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {harvest.area_hectares}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {harvest.dry_fiber_output_kg?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(harvest.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => alert(`View details for harvest ${harvest.harvest_id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        {harvest.status === 'Pending Verification' && (
                          <>
                            <button
                              onClick={() => handleVerifyClick(harvest)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleRejectClick(harvest)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {harvest.status === 'Verified' && (
                          <button
                            onClick={() => alert('Add to Inventory feature: Navigate to inventory add page')}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Add to Inventory
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Verification Modal */}
        {showVerifyModal && selectedHarvest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">
                {actionType === 'verify' ? 'Verify Harvest' : 'Reject Harvest'}
              </h2>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Farmer: <span className="font-medium">{selectedHarvest.farmer_name}</span>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Harvest Date: <span className="font-medium">
                    {new Date(selectedHarvest.harvest_date).toLocaleDateString()}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Fiber Output: <span className="font-medium">{selectedHarvest.dry_fiber_output_kg} kg</span>
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Notes {actionType === 'reject' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder={actionType === 'verify' 
                    ? 'Optional notes about the verification...' 
                    : 'Please provide reason for rejection...'}
                  required={actionType === 'reject'}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSubmitVerification}
                  disabled={actionType === 'reject' && !verificationNotes.trim()}
                  className={`flex-1 px-4 py-2 rounded-md text-white font-semibold ${
                    actionType === 'verify'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:bg-gray-400`}
                >
                  {actionType === 'verify' ? 'Verify' : 'Reject'}
                </button>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
