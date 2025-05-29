const AdminDashboard = () => {
  return (
    <div className="admin-grid">
      <ContentUploadSection />
      <UserStatsChart />
      <QuizManager />
      <LinkManager 
        type="whatsapp" 
        url="https://wa.me/628123456789" 
      />
    </div>
  );
};