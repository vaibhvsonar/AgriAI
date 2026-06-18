import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('agriAI_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('agriAI_users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role };
          setCurrentUser(sessionUser);
          localStorage.setItem('agriAI_user', JSON.stringify(sessionUser));
          resolve(sessionUser);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 800);
    });
  };

  const signup = (name, email, password, role) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('agriAI_users')) || [];
        if (users.some(u => u.email === email)) {
          reject(new Error('Email already in use'));
          return;
        }
        
        const newUser = { id: Date.now().toString(), name, email, password, role };
        users.push(newUser);
        localStorage.setItem('agriAI_users', JSON.stringify(users));
        
        const sessionUser = { id: newUser.id, name, email, role };
        setCurrentUser(sessionUser);
        localStorage.setItem('agriAI_user', JSON.stringify(sessionUser));
        resolve(sessionUser);
      }, 800);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('agriAI_user');
  };

  const value = {
    currentUser,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
