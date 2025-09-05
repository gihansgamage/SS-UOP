import React, { useState } from 'react';
import { UserPlus, Edit, Trash2, Shield } from 'lucide-react';
import { FACULTIES } from '../../types';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'dean' | 'assistant_registrar' | 'vice_chancellor' | 'student_service' | 'test_user';
  faculty?: string;
  createdAt: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('sms_admin_users');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        name: 'Prof. John Silva',
        email: 'dean.medicine@pdn.ac.lk',
        role: 'dean',
        faculty: 'Faculty of Medicine',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Dr. Sarah Fernando',
        email: 'registrar@pdn.ac.lk',
        role: 'assistant_registrar',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        name: 'Prof. Michael Perera',
        email: 'vc@pdn.ac.lk',
        role: 'vice_chancellor',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ];
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'dean' as AdminUser['role'],
    faculty: ''
  });

  const saveUsers = (updatedUsers: AdminUser[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('sms_admin_users', JSON.stringify(updatedUsers));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      const updated = users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...formData, faculty: formData.role === 'dean' ? formData.faculty : undefined }
          : user
      );
      saveUsers(updated);
      setEditingUser(null);
    } else {
      const newUser: AdminUser = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        faculty: formData.role === 'dean' ? formData.faculty : undefined,
        createdAt: new Date().toISOString()
      };
      saveUsers([...users, newUser]);
    }

    setFormData({ name: '', email: '', role: 'dean', faculty: '' });
    setShowAddModal(false);
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      faculty: user.faculty || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const updated = users.filter(user => user.id !== userId);
      saveUsers(updated);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      dean: { label: 'Dean', bg: 'bg-blue-100', text: 'text-blue-800' },
      assistant_registrar: { label: 'Assistant Registrar', bg: 'bg-green-100', text: 'text-green-800' },
      vice_chancellor: { label: 'Vice Chancellor', bg: 'bg-purple-100', text: 'text-purple-800' },
      student_service: { label: 'Student Service', bg: 'bg-orange-100', text: 'text-orange-800' },
      test_user: { label: 'Test User', bg: 'bg-gray-100', text: 'text-gray-800' }
    };

    const config = roleConfig[role as keyof typeof roleConfig];
    return (
      <span className={`px-2 py-1 ${config.bg} ${config.text} text-xs font-medium rounded-full`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({ name: '', email: '', role: 'dean', faculty: '' });
            setShowAddModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Faculty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {user.faculty || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminUser['role'] })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="dean">Dean</option>
                      <option value="assistant_registrar">Assistant Registrar</option>
                      <option value="vice_chancellor">Vice Chancellor</option>
                      <option value="student_service">Student Service</option>
                      <option value="test_user">Test User</option>
                    </select>
                  </div>

                  {formData.role === 'dean' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Faculty *
                      </label>
                      <select
                        value={formData.faculty}
                        onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Faculty</option>
                        {FACULTIES.map(faculty => (
                          <option key={faculty} value={faculty}>{faculty}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                    setFormData({ name: '', email: '', role: 'dean', faculty: '' });
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingUser ? 'Update' : 'Add'} User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;