export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true); // Set authenticated state
        localStorage.setItem('token', data.token); // Store token
        localStorage.setItem('user', JSON.stringify(data.user)); // Store user data
        return true; // Return success
      } else {
        return false; // Return failure
      }
    } catch (error) {
      console.error('Login failed', error);
      return false; // Return failure
    }
  };

  const logout = async () => {
    const user = JSON.parse(localStorage.getItem('user')); // Retrieve user data
    console.log("auth context" + user);
    if (user) {
      try {
        await fetch('http://10.16.49.195:5000/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }), // Send user ID to mark as inactive
        });
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }

    setIsAuthenticated(false);
    localStorage.removeItem('token'); // Clear token
    localStorage.removeItem('user');  // Clear user data
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
