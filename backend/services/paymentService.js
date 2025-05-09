const mockProcessPayment = async ({ amount, method }) => {
  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    success: true,
    transactionId: 'mock_' + Math.random().toString(36).substr(2, 9),
    method,
    amount,
    timestamp: new Date().toISOString()
  };
};

module.exports = { mockProcessPayment }; 