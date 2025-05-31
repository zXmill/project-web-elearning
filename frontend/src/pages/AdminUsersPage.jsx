import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Basic Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    namaLengkap: '',
    email: '',
    password: '',
    role: 'admin' // Default to admin
  });
  const [formError, setFormError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormError, setEditFormError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/users');
      if (response.data && response.data.status === 'success') {
        setUsers(response.data.data.users);
      } else {
        setError('Gagal mengambil data pengguna.');
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || 'Terjadi kesalahan server. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newUser.namaLengkap || !newUser.email || !newUser.password) {
      setFormError('Semua field (Nama Lengkap, Email, Password) harus diisi.');
      return;
    }
    try {
      const response = await api.post('/admin/users', newUser);
      if (response.data && response.data.status === 'success') {
        fetchUsers(); // Refetch the user list
        setIsAddUserModalOpen(false);
        setNewUser({ namaLengkap: '', email: '', password: '', role: 'admin' }); // Reset form
        // Consider using a more robust notification system than alert
        alert('Pengguna baru berhasil ditambahkan!'); 
      } else {
        setFormError(response.data?.message || 'Gagal menambahkan pengguna.');
      }
    } catch (err) {
      console.error("Error adding user:", err);
      setFormError(err.response?.data?.message || 'Terjadi kesalahan server saat menambahkan pengguna.');
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingUser(prev => ({ ...prev, [name]: value }));
  };

  const openEditModal = (user) => {
    setEditingUser({ ...user, password: '' }); // Clear password field for security/UX
    setIsEditModalOpen(true);
    setEditFormError('');
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    setEditFormError('');
    if (!editingUser || !editingUser.namaLengkap || !editingUser.email) {
      setEditFormError('Nama Lengkap and Email are required.');
      return;
    }

    const payload = {
      namaLengkap: editingUser.namaLengkap,
      email: editingUser.email,
      role: editingUser.role,
    };
    if (editingUser.password && editingUser.password.trim() !== '') {
      payload.password = editingUser.password;
    }

    try {
      const response = await api.put(`/admin/users/${editingUser.id}`, payload);
      if (response.data && response.data.status === 'success') {
        fetchUsers();
        setIsEditModalOpen(false);
        setEditingUser(null);
        alert('User updated successfully!');
      } else {
        setEditFormError(response.data?.message || 'Failed to update user.');
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setEditFormError(err.response?.data?.message || 'Server error while updating user.');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}" (ID: ${userId})? This action cannot be undone.`)) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers(); // Refresh the list
        alert(`User ${userName} (ID: ${userId}) deleted successfully.`);
      } catch (err) {
        console.error("Error deleting user:", err);
        alert(err.response?.data?.message || 'Server error while deleting user.');
      }
    }
  };

  if (loading && users.length === 0) { // Show main loading only if users haven't been loaded yet
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teraplus-primary"></div>
      </div>
    );
  }

  if (error && users.length === 0) { // Show main error only if users haven't been loaded
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Manage Users</h1>
        <button 
          onClick={() => { setIsAddUserModalOpen(true); setFormError(''); }}
          className="text-teraplus-brand-blue-dark bg-white border border-teraplus-brand-blue-dark hover:bg-teraplus-primary-hover font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2 text-teraplus-brand-blue-dark" /> {/* Ensure icon also uses dark color */}
          Add User
        </button>
      </div>

      {/* Display general error if users list is empty and an error occurred during fetch */}
      {error && users.length > 0 && (
         <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error fetching users! </strong>
            <span className="block sm:inline">{error}. Displaying cached or partial data.</span>
        </div>
      )}


      {users.length === 0 && !loading && !error ? (
        <p className="text-gray-500 text-center">Tidak ada pengguna untuk ditampilkan.</p>
      ) : users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.namaLengkap}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => openEditModal(user)} 
                      className="text-teraplus-brand-blue hover:text-teraplus-brand-blue-dark mr-3 transition-colors duration-150"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id, user.namaLengkap)} 
                      className="text-red-600 hover:text-red-800 transition-colors duration-150"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} title="Add New Admin User">
        <form onSubmit={handleAddUserSubmit}>
          {formError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
              {formError}
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input 
              type="text" 
              name="namaLengkap" 
              id="namaLengkap" 
              value={newUser.namaLengkap} 
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teraplus-primary focus:border-teraplus-primary sm:text-sm"
              required 
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              name="email" 
              id="email" 
              value={newUser.email} 
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teraplus-primary focus:border-teraplus-primary sm:text-sm"
              required 
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              name="password" 
              id="password" 
              value={newUser.password} 
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teraplus-primary focus:border-teraplus-primary sm:text-sm"
              required 
            />
          </div>
          <div className="mb-6">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select 
              name="role" 
              id="role" 
              value={newUser.role} 
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-teraplus-primary focus:border-teraplus-primary sm:text-sm"
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => setIsAddUserModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-teraplus-brand-blue-dark bg-white border border-teraplus-brand-blue-dark hover:bg-teraplus-primary-hover rounded-md shadow-sm"
            >
              Add User
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      {editingUser && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit User: ${editingUser.namaLengkap}`}>
          <form onSubmit={handleEditUserSubmit}>
            {editFormError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
                {editFormError}
              </div>
            )}
            <div className="mb-4">
              <label htmlFor="editNamaLengkap" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                name="namaLengkap"
                id="editNamaLengkap"
                value={editingUser.namaLengkap}
                onChange={handleEditInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teraplus-primary focus:border-teraplus-primary sm:text-sm"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                id="editEmail"
                value={editingUser.email}
                onChange={handleEditInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teraplus-primary focus:border-teraplus-primary sm:text-sm"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="editPassword" className="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep current)</label>
              <input
                type="password"
                name="password"
                id="editPassword"
                value={editingUser.password || ''}
                onChange={handleEditInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teraplus-primary focus:border-teraplus-primary sm:text-sm"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="editRole" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                id="editRole"
                value={editingUser.role}
                onChange={handleEditInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-teraplus-primary focus:border-teraplus-primary sm:text-sm"
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-teraplus-brand-blue-dark bg-white border border-teraplus-brand-blue-dark hover:bg-teraplus-primary-hover rounded-md shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminUsersPage;
