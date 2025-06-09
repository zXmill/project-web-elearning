import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PlusIcon, PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, BookOpenIcon } from '@heroicons/react/24/outline'; // Added BookOpenIcon
import RichTextEditor from './RichTextEditor';
import QuestionManagement from './QuestionManagement'; // Import QuestionManagement


const ModuleManagement = ({ courseId }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [showQuestionManagementModal, setShowQuestionManagementModal] = useState(false); // New state for question modal
  const [formData, setFormData] = useState({
    judul: '',
    type: 'PAGE', // Default to PAGE
    contentText: '',
    pdfPath: '', // Will be handled by pageContent for PAGE type later
    videoLink: '', // Will be handled by pageContent for PAGE type later
    pageContent: null, // For PAGE type's structured content
    order: 0,
    // isPreTest, isPostTest, hasQuiz are removed as type now covers this
  });

  useEffect(() => {
    if (courseId) {
      fetchModules();
    }
  }, [courseId]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/courses/${courseId}/modules`);
      if (response.data?.status === 'success') {
        setModules(response.data.data.modules);
      }
    } catch (err) {
      setError('Gagal mengambil data modul');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = { ...formData }; // Create a copy to modify

      if (payload.type === 'PAGE') {
        payload.initialContent = payload.pageContent; // Move/copy editor content to initialContent
        payload.pageContent = null;                   // Nullify pageContent for PAGE type as initialContent is primary
      }
      // Note: If pageContent is used for JSON in QUIZ types, ensure this logic is appropriate
      // or that QUIZ types don't incorrectly populate formData.pageContent via the RichTextEditor.
      // Currently, RichTextEditor is only shown for formData.type === 'PAGE'.

      if (editingModule) {
        await api.put(`/admin/modules/${editingModule.id}`, payload); // Send modified payload
      } else {
        // For creating new modules, ensure initialContent is handled if type is PAGE
        if (payload.type === 'PAGE' && payload.initialContent === undefined && payload.pageContent !== undefined) {
          // This case might occur if resetForm() sets pageContent and it's not yet moved to initialContent
          payload.initialContent = payload.pageContent;
          payload.pageContent = null;
        }
        await api.post(`/admin/courses/${courseId}/modules`, payload); // Send modified payload
      }
      setShowModal(false);
      setEditingModule(null);
      resetForm();
      fetchModules();
    } catch (err) {
      setError('Gagal menyimpan modul');
      console.error(err);
    }
  };

  const handleEdit = (module) => {
    setEditingModule(module);
    let editorContent = null;

    if (module.type === 'PAGE') {
      // For PAGE type, RichTextEditor is bound to formData.pageContent.
      // So, populate formData.pageContent with module.initialContent.
      editorContent = module.initialContent || module.pageContent || ''; // Prioritize initialContent
    } else {
      // For other types (e.g., QUIZ), pageContent might hold JSON.
      // The RichTextEditor is not shown for these.
      editorContent = module.pageContent || null;
    }

    setFormData({
      judul: module.judul || '',
      type: module.type || 'PAGE',
      contentText: module.contentText || '',
      pdfPath: module.pdfPath || '',
      videoLink: module.videoLink || '',
      pageContent: editorContent, // This will be used by RichTextEditor if type is PAGE
      order: module.order || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (moduleId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus modul ini?')) {
      try {
        await api.delete(`/admin/modules/${moduleId}`);
        fetchModules();
      } catch (err) {
        setError('Gagal menghapus modul');
        console.error(err);
      }
    }
  };

  const handleReorder = async (moduleId, direction) => {
    try {
      const moduleIndex = modules.findIndex(m => m.id === moduleId);
      if (moduleIndex === -1) return;

      const newModules = [...modules];
      const module = newModules[moduleIndex];

      if (direction === 'up' && moduleIndex > 0) {
        const prevModule = newModules[moduleIndex - 1];
        newModules[moduleIndex - 1] = module;
        newModules[moduleIndex] = prevModule;
      } else if (direction === 'down' && moduleIndex < newModules.length - 1) {
        const nextModule = newModules[moduleIndex + 1];
        newModules[moduleIndex + 1] = module;
        newModules[moduleIndex] = nextModule;
      } else {
        return;
      }

      // Prepare data in the format expected by the backend: [{id, order}, ...]
      const moduleOrders = newModules.map((module, index) => ({
        id: module.id,
        order: index // Use the array index as the new order
      }));

      await api.post(`/admin/courses/${courseId}/modules/reorder`, { moduleOrders: moduleOrders });
      fetchModules(); // Refresh from backend to ensure consistency
    } catch (err) {
      setError('Gagal mengubah urutan modul');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      judul: '',
      type: 'PAGE', // Default to PAGE
      contentText: '',
      pdfPath: '',
      videoLink: '',
      pageContent: null,
      order: modules.length,
      // isPreTest, isPostTest, hasQuiz are removed
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingModule(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Modul</h2>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Tambah Modul</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Urutan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Judul
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {modules.map((module, index) => (
              <tr key={module.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">{module.order}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleReorder(module.id, 'up')}
                        disabled={index === 0}
                        className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <ArrowUpIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleReorder(module.id, 'down')}
                        disabled={index === modules.length - 1}
                        className={`p-1 rounded ${index === modules.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <ArrowDownIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{module.judul}</div>
                  {module.type === 'text' && (
                    <div className="text-sm text-gray-500">{module.contentText?.substring(0, 50)}...</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${module.type === 'PAGE' ? 'bg-blue-100 text-blue-800' :
                        module.type === 'PRE_TEST_QUIZ' ? 'bg-yellow-100 text-yellow-800' :
                          module.type === 'POST_TEST_QUIZ' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                      }`}>
                      {module.type === 'PAGE' && 'Page'}
                      {module.type === 'PRE_TEST_QUIZ' && 'Pre-Test Quiz'}
                      {module.type === 'POST_TEST_QUIZ' && 'Post-Test Quiz'}
                      {!['PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ'].includes(module.type) && module.type /* Fallback for old types if any */}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(module)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(module.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingModule ? 'Edit Modul' : 'Tambah Modul Baru'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Judul Modul</label>
                  <input
                    type="text"
                    required
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipe Modul</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value, pageContent: null, contentText: '', pdfPath: '', videoLink: '' })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PAGE">Page (Text, Video, PDF, etc.)</option>
                    <option value="PRE_TEST_QUIZ">Pre-Test Quiz</option>
                    <option value="POST_TEST_QUIZ">Post-Test Quiz</option>
                  </select>
                </div>

                {/* Conditional fields will be revamped later. For now, 'contentText' can serve as a temporary field for PAGE type. */}
                {(formData.type === 'PAGE' || formData.type === 'PRE_TEST_QUIZ' || formData.type === 'POST_TEST_QUIZ') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {formData.type === 'PAGE' ? 'Initial Content / Description' : 'Quiz Instructions / Description'}
                    </label>
                    {formData.type === 'PAGE' ? (
                      <RichTextEditor
                        value={formData.pageContent || ''}
                        onChange={(content) => setFormData({ ...formData, pageContent: content })}
                      />
                    ) : (
                      <textarea
                        rows={5}
                        value={formData.contentText}
                        onChange={(e) => setFormData({ ...formData, contentText: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter instructions or a brief description for this quiz."
                      />
                    )}
                  </div>
                )}

                {/* Old pdfPath and videoLink fields are no longer primary inputs for new types. 
                    They will be handled by the pageContent editor for PAGE type.
                    The conditional rendering for these specific inputs can be removed or adapted later.
                    For now, they won't show for the new types unless explicitly handled.
                */}

                {/* Old Test Type Options (isPreTest, isPostTest, hasQuiz checkboxes) are removed as type now covers this */}

                {/* Old videoLink input - will be handled by pageContent for PAGE type */}
                {/*
                {formData.type === 'video' && ( // This condition will no longer be met with new types
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Link Video (YouTube ID)</label>
                    <input
                      type="text"
                      value={formData.videoLink}
                      onChange={(e) => setFormData({...formData, videoLink: e.target.value})}
                      placeholder="dQw4w9WgXcQ"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
                */}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {editingModule ? 'Update' : 'Simpan'}
                  </button>
                </div>
                {editingModule && (formData.type === 'PRE_TEST_QUIZ' || formData.type === 'POST_TEST_QUIZ') && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuestionManagementModal(true);
                        setShowModal(false); // Close the Edit Modul modal
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <BookOpenIcon className="h-5 w-5 mr-2" />
                      Manage Questions
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Question Management Modal */}
      {showQuestionManagementModal && editingModule && typeof editingModule.id !== 'undefined' && editingModule.id !== null && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full z-60 flex justify-center items-start pt-10">
          <div className="relative p-6 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white py-3 z-10">
              <h3 className="text-xl font-semibold text-gray-900">
                Manage Questions for: {editingModule.judul}
              </h3>
              <button
                onClick={() => setShowQuestionManagementModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none p-1"
              >
                &times;
              </button>
            </div>
            <QuestionManagement moduleId={editingModule.id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleManagement;
