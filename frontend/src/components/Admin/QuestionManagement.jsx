import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const QuestionManagement = ({ moduleId }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    teksSoal: '',
    type: 'mcq',
    options: [
      { id: 'opt1', text: '' },
      { id: 'opt2', text: '' },
      { id: 'opt3', text: '' },
      { id: 'opt4', text: '' }
    ],
    correctOptionId: '',
    explanation: ''
  });

  useEffect(() => {
    if (moduleId) {
      fetchQuestions();
    }
  }, [moduleId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/modules/${moduleId}/questions`);
      if (response.data?.status === 'success') {
        setQuestions(response.data.data.questions);
      }
    } catch (err) {
      setError('Gagal mengambil data pertanyaan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const questionData = {
        ...formData,
        options: JSON.stringify(formData.options)
      };

      if (editingQuestion) {
        await api.put(`/admin/questions/${editingQuestion.id}`, questionData);
      } else {
        await api.post(`/admin/modules/${moduleId}/questions`, questionData);
      }
      setShowModal(false);
      setEditingQuestion(null);
      resetForm();
      fetchQuestions();
    } catch (err) {
      setError('Gagal menyimpan pertanyaan');
      console.error(err);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      teksSoal: question.teksSoal || '',
      type: question.type || 'mcq',
      options: typeof question.options === 'string' ? JSON.parse(question.options) : question.options,
      correctOptionId: question.correctOptionId || '',
      explanation: question.explanation || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (questionId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pertanyaan ini?')) {
      try {
        await api.delete(`/admin/questions/${questionId}`);
        fetchQuestions();
      } catch (err) {
        setError('Gagal menghapus pertanyaan');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      teksSoal: '',
      type: 'mcq',
      options: [
        { id: 'opt1', text: '' },
        { id: 'opt2', text: '' },
        { id: 'opt3', text: '' },
        { id: 'opt4', text: '' }
      ],
      correctOptionId: '',
      explanation: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingQuestion(null);
    setShowModal(true);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], text: value };
    setFormData({ ...formData, options: newOptions });
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Pertanyaan</h2>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Tambah Pertanyaan</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {questions.map((question, index) => (
            <div key={question.id} className="p-6 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-grow">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">Pertanyaan {index + 1}</span>
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {question.type}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">{question.teksSoal}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {(typeof question.options === 'string' ? JSON.parse(question.options) : question.options).map((option) => (
                      <div
                        key={option.id}
                        className={`p-3 rounded-lg border ${
                          option.id === question.correctOptionId
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <p className="text-sm text-gray-700">{option.text}</p>
                      </div>
                    ))}
                  </div>

                  {question.explanation && (
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">Penjelasan:</span> {question.explanation}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(question)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingQuestion ? 'Edit Pertanyaan' : 'Tambah Pertanyaan Baru'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pertanyaan</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.teksSoal}
                    onChange={(e) => setFormData({...formData, teksSoal: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipe Pertanyaan</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="mcq">Pilihan Ganda</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Pilihan Jawaban</label>
                  {formData.options.map((option, index) => (
                    <div key={option.id} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="correctOption"
                        value={option.id}
                        checked={formData.correctOptionId === option.id}
                        onChange={() => setFormData({...formData, correctOptionId: option.id})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <input
                        type="text"
                        required
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Pilihan ${index + 1}`}
                        className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Penjelasan (Opsional)</label>
                  <textarea
                    rows={3}
                    value={formData.explanation}
                    onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                    placeholder="Penjelasan untuk jawaban yang benar..."
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

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
                    {editingQuestion ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;
