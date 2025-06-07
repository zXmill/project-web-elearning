import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Import the api service
// Consider adding a toast notification library like react-toastify if used in the project
// import { toast } from 'react-toastify';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    siteTitle: '', // Initialize as empty, will be fetched
    contactEmail: '',
    maintenanceMode: false,
    allowRegistrations: true,
    defaultUserRole: 'user', // Default to 'user' as per Setting model
    enablePrerequisites: true,
    defaultCertificateTemplate: 'template1', // Or fetch this default too
    siteLogoUrl: '', // Add siteLogoUrl to state
  });
  const [isLoading, setIsLoading] = useState(true); // For loading state

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/admin/settings');
        if (response.data && response.data.status === 'success' && response.data.data.settings) {
          const fetchedSettings = response.data.data.settings;
          // Map backend 'siteName' to frontend 'siteTitle'
          setSettings({
            ...fetchedSettings,
            siteTitle: fetchedSettings.siteName || '', // Ensure siteTitle is set
          });
        } else {
          // Handle case where settings might not exist yet or error in response
          console.warn('Could not fetch settings or settings are not initialized:', response.data.message);
          // alert('Could not load settings. Using defaults.'); // Or use toast
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // alert('Failed to load settings. Please try again.'); // Or use toast
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveChanges = async () => {
    // Map frontend 'siteTitle' to backend 'siteName'
    const payload = {
      ...settings,
      siteName: settings.siteTitle,
    };
    // Remove frontend-specific 'siteTitle' if 'siteName' is the canonical backend field
    delete payload.siteTitle; 
    // Note: siteLogo file upload is not handled here. 
    // This assumes siteLogoUrl is managed if it's just a URL string.
    // If siteLogo is a file, it needs a separate upload mechanism.

    try {
      const response = await api.put('/admin/settings', payload);
      if (response.data && response.data.status === 'success') {
        const updatedSettings = response.data.data.settings;
        // Update state with potentially updated/validated settings from backend
        // Map backend 'siteName' back to frontend 'siteTitle'
        setSettings({
          ...updatedSettings,
          siteTitle: updatedSettings.siteName || '',
        });
        alert('Settings saved successfully!'); // Replace with toast notification
        // toast.success('Settings saved successfully!');
      } else {
        alert(response.data.message || 'Failed to save settings.');
        // toast.error(response.data.message || 'Failed to save settings.');
      }
    } catch (error) {
      console.error('Error saving settings:', error.response?.data?.message || error.message);
      alert(error.response?.data?.message || 'An error occurred while saving settings.');
      // toast.error(error.response?.data?.message || 'An error occurred while saving settings.');
    }
  };
  
  // Handle file input for site logo (basic example, needs actual upload logic)
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected site logo file:', file);
      // Here you would typically upload the file and get a URL back
      // For now, let's just store a placeholder or the file name if needed
      // setSettings(prev => ({ ...prev, siteLogoFile: file, siteLogoUrl: 'new_logo_preview_url_or_name' }));
      alert('Site logo upload is not fully implemented yet. This is a placeholder.');
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Settings</h1>

      {/* General Site Settings */}
      <section className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">General Site Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700 mb-1">Site Title</label>
            <input
              type="text"
              name="siteTitle"
              id="siteTitle"
              value={settings.siteTitle}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teraplus-blue focus:border-teraplus-blue sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
            <input
              type="email"
              name="contactEmail"
              id="contactEmail"
              value={settings.contactEmail}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teraplus-blue focus:border-teraplus-blue sm:text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="siteLogo" className="block text-sm font-medium text-gray-700 mb-1">Site Logo</label>
            <input
              type="file"
              name="siteLogo"
              id="siteLogo"
              onChange={handleFileChange} // Basic handler added
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teraplus-blue-light file:text-teraplus-blue hover:file:bg-teraplus-blue-dark hover:file:text-white"
            />
            {settings.siteLogoUrl && (
              <div className="mt-2">
                <p className="text-xs text-gray-600">Current logo:</p>
                <img src={settings.siteLogoUrl.startsWith('http') ? settings.siteLogoUrl : `${api.defaults.baseURL.replace('/api', '')}${settings.siteLogoUrl}`} alt="Site Logo" className="h-16 mt-1 border p-1"/>
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">Upload your site logo (e.g., PNG, JPG, SVG). Actual upload needs backend endpoint.</p>
          </div>
          <div className="flex items-center">
            <input
              id="maintenanceMode"
              name="maintenanceMode"
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={handleInputChange}
              className="h-4 w-4 text-teraplus-blue border-gray-300 rounded focus:ring-teraplus-blue"
            />
            <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">Enable Maintenance Mode</label>
          </div>
        </div>
      </section>

      {/* User Management Settings */}
      <section className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">User Management Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center">
            <input
              id="allowRegistrations"
              name="allowRegistrations"
              type="checkbox"
              checked={settings.allowRegistrations}
              onChange={handleInputChange}
              className="h-4 w-4 text-teraplus-blue border-gray-300 rounded focus:ring-teraplus-blue"
            />
            <label htmlFor="allowRegistrations" className="ml-2 block text-sm text-gray-900">Allow New User Registrations</label>
          </div>
          <div>
            <label htmlFor="defaultUserRole" className="block text-sm font-medium text-gray-700 mb-1">Default Role for New Users</label>
            <select
              id="defaultUserRole"
              name="defaultUserRole"
              value={settings.defaultUserRole}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teraplus-blue focus:border-teraplus-blue sm:text-sm rounded-md"
            >
              <option value="user">User</option> {/* Ensure this matches backend enum/values */}
              <option value="admin">Admin</option>
              {/* Add other roles like 'instructor' if needed in the future */}
            </select>
          </div>
        </div>
      </section>

      {/* Course Settings */}
      <section className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Course Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center">
            <input
              id="enablePrerequisites"
              name="enablePrerequisites" // Matches Setting model field
              type="checkbox"
              checked={settings.enablePrerequisites}
              onChange={handleInputChange}
              className="h-4 w-4 text-teraplus-blue border-gray-300 rounded focus:ring-teraplus-blue"
            />
            <label htmlFor="enablePrerequisites" className="ml-2 block text-sm text-gray-900">Enable Course Prerequisites Globally</label>
          </div>
          <div>
            <label htmlFor="defaultCertificateTemplate" className="block text-sm font-medium text-gray-700 mb-1">Default Certificate Template</label>
            <select
              id="defaultCertificateTemplate"
              name="defaultCertificateTemplate"
              value={settings.defaultCertificateTemplate}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teraplus-blue focus:border-teraplus-blue sm:text-sm rounded-md"
            >
              <option value="template1">Standard Template</option>
              <option value="template2">Modern Template</option>
              {/* Add other templates as they are developed */}
            </select>
          </div>
        </div>
      </section>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleSaveChanges}
          className="px-6 py-2 bg-teraplus-brand-blue text-white font-semibold rounded-lg shadow-md hover:bg-teraplus-blue-dark focus:outline-none focus:ring-2 focus:ring-teraplus-blue focus:ring-opacity-50 transition ease-in-out duration-150"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
