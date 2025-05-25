// JudgesList.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const JudgesList = ({ judges = [], loading = false, onSort }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('display_name');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    onSort?.(field, newDirection);
  };

  const SortIcon = ({ field }) => (
    <span className="ml-1 inline-block">
      {sortField === field ? (
        sortDirection === 'asc' ? '↑' : '↓'
      ) : '↕'}
    </span>
  );

  const filteredJudges = judges.filter(judge => {
    if (!judge) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (judge.displayName || '').toLowerCase().includes(searchLower) ||
      (judge.username || '').toLowerCase().includes(searchLower) ||
      (judge.email || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-slate-700">
          Existing Judges ({filteredJudges.length})
        </h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search judges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th 
                  onClick={() => handleSort('displayName')}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                >
                  Name <SortIcon field="displayName" />
                </th>
                <th 
                  onClick={() => handleSort('username')}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                >
                  Username <SortIcon field="username" />
                </th>
                <th 
                  onClick={() => handleSort('email')}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                >
                  Email <SortIcon field="email" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Stats
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredJudges.map((judge) => (
                <tr key={judge.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {judge.displayName}
                    </div>
                    <div className="text-xs text-slate-500">
                      Role: {judge.role}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {judge.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {judge.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      judge.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {judge.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div>Scores: {judge.stats?.scoresGiven || 0}</div>
                    <div>Participants: {judge.stats?.participantsScored || 0}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredJudges.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              {searchTerm ? 'No judges found matching your search' : 'No judges added yet'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

JudgesList.propTypes = {
  judges: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    displayName: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string,
    isActive: PropTypes.bool,
    stats: PropTypes.shape({
      scoresGiven: PropTypes.number,
      participantsScored: PropTypes.number
    })
  })),
  loading: PropTypes.bool,
  onSort: PropTypes.func
};

export default JudgesList;