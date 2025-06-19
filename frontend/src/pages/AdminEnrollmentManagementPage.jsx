import React, { useState, useEffect, useCallback } from 'react';
import { 
  getEnrollmentsForApprovalAdmin, 
  updateEnrollmentPracticalTestDetailsAdmin, 
  approveEnrollmentCertificateAdmin, 
  rejectEnrollmentCertificateAdmin 
} from '../services/api'; // Assuming api service is correctly set up
import { toast } from 'react-toastify';
import { EyeIcon, CheckCircleIcon, XCircleIcon, PencilSquareIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const INDONESIAN_PRACTICAL_TEST_STATUSES = {
  BELUM_DIKUMPULKAN: 'Belum Dikumpulkan',
  SUDAH_DIKUMPULKAN: 'Sudah Dikumpulkan',
  LULUS_PENILAIAN: 'Lulus Penilaian',
  GAGAL_PENILAIAN: 'Gagal Penilaian',
  SERTIFIKAT_DISETUJUI: 'Sertifikat Disetujui',
  SERTIFIKAT_DITOLAK: 'Sertifikat Ditolak',
};

const AdminEnrollmentManagementPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(''); // 'update_test', 'reject_cert'
  const [practicalTestStatus, setPracticalTestStatus] = useState('');
  const [practicalTestAdminNotes, setPracticalTestAdminNotes] = useState('');
  const [certificateRejectionReason, setCertificateRejectionReason] = useState('');

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getEnrollmentsForApprovalAdmin();
      // Ensure the response has the expected structure and enrollments is an array
      if (response && response.data && Array.isArray(response.data.enrollments)) {
        setEnrollments(response.data.enrollments);
      } else {
        // If the structure is not as expected, or enrollments is not an array,
        // set to empty array to prevent .map error and log an issue.
        console.error('Unexpected response structure or enrollments is not an array:', response);
        setEnrollments([]);
        // Optionally, set an error message for the user
        // setError('Failed to load enrollment data in expected format.');
        // toast.error('Failed to load enrollment data in expected format.');
      }
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch enrollments');
      toast.error(err.response?.data?.message || err.message || 'Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const openModal = (enrollment, action) => {
    setSelectedEnrollment(enrollment);
    setModalAction(action);
    if (action === 'update_test') {
      setPracticalTestStatus(enrollment.practicalTestStatus || INDONESIAN_PRACTICAL_TEST_STATUSES.BELUM_DIKUMPULKAN);
      setPracticalTestAdminNotes(enrollment.practicalTestAdminNotes || '');
    } else if (action === 'reject_cert') {
      setCertificateRejectionReason('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEnrollment(null);
    setModalAction('');
    setPracticalTestStatus('');
    setPracticalTestAdminNotes('');
    setCertificateRejectionReason('');
  };

  const handleUpdatePracticalTest = async (e) => {
    e.preventDefault();
    if (!selectedEnrollment) return;
    try {
      await updateEnrollmentPracticalTestDetailsAdmin(selectedEnrollment.id, {
        practicalTestStatus,
        practicalTestAdminNotes,
      });
      toast.success('Practical test details updated successfully!');
      fetchEnrollments();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update practical test details.');
    }
  };

  const handleApproveCertificate = async (enrollmentId) => {
    if (window.confirm('Are you sure you want to approve this certificate?')) {
      try {
        await approveEnrollmentCertificateAdmin(enrollmentId);
        toast.success('Certificate approved successfully!');
        fetchEnrollments();
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Failed to approve certificate.');
      }
    }
  };

  const handleRejectCertificate = async (e) => {
    e.preventDefault();
    if (!selectedEnrollment || !certificateRejectionReason) {
      toast.error('Rejection reason is required.');
      return;
    }
    try {
      await rejectEnrollmentCertificateAdmin(selectedEnrollment.id, {
        certificateRejectionReason,
      });
      toast.success('Certificate rejected successfully!');
      fetchEnrollments();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to reject certificate.');
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case INDONESIAN_PRACTICAL_TEST_STATUSES.BELUM_DIKUMPULKAN:
        return 'text-gray-500';
      case INDONESIAN_PRACTICAL_TEST_STATUSES.SUDAH_DIKUMPULKAN:
        return 'text-blue-500';
      case INDONESIAN_PRACTICAL_TEST_STATUSES.LULUS_PENILAIAN:
        return 'text-green-600';
      case INDONESIAN_PRACTICAL_TEST_STATUSES.GAGAL_PENILAIAN:
        return 'text-red-600';
      case INDONESIAN_PRACTICAL_TEST_STATUSES.SERTIFIKAT_DISETUJUI:
        return 'text-green-700 font-semibold';
      case INDONESIAN_PRACTICAL_TEST_STATUSES.SERTIFIKAT_DITOLAK:
        return 'text-red-700 font-semibold';
      default:
        return 'text-gray-700';
    }
  };


  if (loading) return <div className="p-6">Loading enrollments...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">Enrollment & Certificate Management</h1>

      {enrollments.length === 0 ? (
        <p className="text-gray-600">No enrollments found requiring attention.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Practical Test Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted File</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enrollments.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {/* Ensure enrollment.user exists before trying to access its properties */}
                    <div className="text-sm font-medium text-gray-900">{enrollment.user?.namaLengkap || enrollment.User?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{enrollment.user?.email || enrollment.User?.email || 'N/A'}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {/* Ensure enrollment.course exists */}
                    <div className="text-sm text-gray-900">{enrollment.course?.judul || enrollment.Course?.title || 'N/A'}</div>
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${getStatusColor(enrollment.practicalTestStatus)}`}>
                    {enrollment.practicalTestStatus || 'N/A'}
                    {enrollment.practicalTestAdminNotes && (
                        <p className="text-xs text-gray-500 mt-1 italic">Notes: {enrollment.practicalTestAdminNotes}</p>
                    )}
                    {enrollment.practicalTestStatus === INDONESIAN_PRACTICAL_TEST_STATUSES.SERTIFIKAT_DITOLAK && enrollment.certificateRejectionReason && (
                        <p className="text-xs text-red-500 mt-1 italic">Rejection: {enrollment.certificateRejectionReason}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {enrollment.practicalTestFileUrl ? (
                      <a
                        href={enrollment.practicalTestFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teraplus-brand-blue hover:text-teraplus-brand-blue-dark inline-flex items-center"
                        title="Download/View Submitted File"
                      >
                        <DocumentArrowDownIcon className="h-5 w-5 mr-1" /> View File
                      </a>
                    ) : (
                      'Not Submitted'
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => openModal(enrollment, 'update_test')}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-100"
                      title="Update Practical Test"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    {enrollment.practicalTestStatus === INDONESIAN_PRACTICAL_TEST_STATUSES.LULUS_PENILAIAN && (
                       <>
                        <button
                            onClick={() => handleApproveCertificate(enrollment.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-100"
                            title="Approve Certificate"
                        >
                            <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => openModal(enrollment, 'reject_cert')}
                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-100"
                            title="Reject Certificate"
                        >
                            <XCircleIcon className="h-5 w-5" />
                        </button>
                       </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && selectedEnrollment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
            {modalAction === 'update_test' && (
              <>
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Update Practical Test for {selectedEnrollment.user?.namaLengkap || selectedEnrollment.User?.name}</h3>
                <form onSubmit={handleUpdatePracticalTest}>
                  <div className="mb-4">
                    <label htmlFor="practicalTestStatus" className="block text-sm font-medium text-gray-700">Practical Test Status</label>
                    <select
                      id="practicalTestStatus"
                      name="practicalTestStatus"
                      value={practicalTestStatus}
                      onChange={(e) => setPracticalTestStatus(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      {Object.values(INDONESIAN_PRACTICAL_TEST_STATUSES)
                        .filter(status => status !== INDONESIAN_PRACTICAL_TEST_STATUSES.SERTIFIKAT_DISETUJUI && status !== INDONESIAN_PRACTICAL_TEST_STATUSES.SERTIFIKAT_DITOLAK) // Admins shouldn't manually set these from this modal
                        .map(status => (
                          <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="practicalTestAdminNotes" className="block text-sm font-medium text-gray-700">Admin Notes</label>
                    <textarea
                      id="practicalTestAdminNotes"
                      name="practicalTestAdminNotes"
                      rows="3"
                      value={practicalTestAdminNotes}
                      onChange={(e) => setPracticalTestAdminNotes(e.target.value)}
                      className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    ></textarea>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-teraplus-brand-blue border border-transparent rounded-md shadow-sm hover:bg-teraplus-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teraplus-brand-blue"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </>
            )}
            {modalAction === 'reject_cert' && (
              <>
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Reject Certificate for {selectedEnrollment.user?.namaLengkap || selectedEnrollment.User?.name}</h3>
                <form onSubmit={handleRejectCertificate}>
                  <div className="mb-4">
                    <label htmlFor="certificateRejectionReason" className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                    <textarea
                      id="certificateRejectionReason"
                      name="certificateRejectionReason"
                      rows="3"
                      value={certificateRejectionReason}
                      onChange={(e) => setCertificateRejectionReason(e.target.value)}
                      className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    ></textarea>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Reject Certificate
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnrollmentManagementPage;
