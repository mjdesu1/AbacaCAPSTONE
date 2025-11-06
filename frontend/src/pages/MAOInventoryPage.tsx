import { useState, useEffect } from 'react';

interface InventoryItem {
  inventory_id: string;
  harvest_id: string;
  stock_weight_kg: number;
  current_stock_kg: number;
  fiber_grade: string;
  fiber_quality_rating: string;
  storage_location: string;
  status: string;
  total_distributed_kg: number;
  created_at: string;
  harvests: {
    farmer_name: string;
    municipality: string;
    harvest_date: string;
    abaca_variety: string;
  };
}

interface Statistics {
  total_inventory_items: number;
  total_stock_kg: number;
  total_distributed_kg: number;
  stocked_items: number;
}

export default function MAOInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Stocked');

  useEffect(() => {
    fetchInventory();
    fetchStatistics();
  }, [filter]);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const statusParam = filter !== 'all' ? `?status=${encodeURIComponent(filter)}` : '';
      
      const response = await fetch(`http://localhost:3001/api/inventory/inventory${statusParam}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/inventory/inventory/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'Stocked': 'bg-green-100 text-green-800',
      'Reserved': 'bg-yellow-100 text-yellow-800',
      'Partially Distributed': 'bg-blue-100 text-blue-800',
      'Fully Distributed': 'bg-gray-100 text-gray-800',
      'Damaged': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  const getStockPercentage = (current: number, total: number) => {
    return ((current / total) * 100).toFixed(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-800">Inventory Management</h1>
          <button
            onClick={() => alert('Navigate to Harvest Verification page from sidebar')}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-semibold"
          >
            View Verified Harvests
          </button>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total Items</div>
              <div className="text-2xl font-bold text-green-800">{statistics.total_inventory_items}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total Stock (kg)</div>
              <div className="text-2xl font-bold text-green-800">{statistics.total_stock_kg?.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Distributed (kg)</div>
              <div className="text-2xl font-bold text-blue-600">{statistics.total_distributed_kg?.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Stocked Items</div>
              <div className="text-2xl font-bold text-green-600">{statistics.stocked_items}</div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b overflow-x-auto">
            {['Stocked', 'Reserved', 'Partially Distributed', 'Fully Distributed', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-3 font-medium whitespace-nowrap ${
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

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading inventory...</div>
          ) : inventory.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-4">No inventory items found.</p>
              <button
                onClick={() => alert('Navigate to Harvest Verification page')}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
              >
                Add Verified Harvests to Inventory
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variety</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Storage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory.map((item) => (
                    <tr key={item.inventory_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.harvests?.farmer_name}</div>
                        <div className="text-sm text-gray-500">{item.harvests?.municipality}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.harvests?.abaca_variety}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.fiber_grade}</div>
                        <div className="text-xs text-gray-500">{item.fiber_quality_rating}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.current_stock_kg.toFixed(2)} kg
                        </div>
                        <div className="text-xs text-gray-500">
                          of {item.stock_weight_kg.toFixed(2)} kg ({getStockPercentage(item.current_stock_kg, item.stock_weight_kg)}%)
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-green-600 h-1.5 rounded-full" 
                            style={{ width: `${getStockPercentage(item.current_stock_kg, item.stock_weight_kg)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.storage_location || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => alert(`View details for inventory ${item.inventory_id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        {item.current_stock_kg > 0 && (
                          <button
                            onClick={() => alert(`Create distribution for inventory ${item.inventory_id}`)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Distribute
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
      </div>
    </div>
  );
}
