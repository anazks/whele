// import { createContext } from 'react';

// const AuthContext = createContext({
//   user: null,
//   login: (token: string, user: any) => {},
//   logout: () => {},
//   loading: true,
// });

// export default AuthContext;
// contexts/AuthContext.tsx
import { createContext, useContext } from 'react';

type AuthContextType = {
  user: any;
  login: (token: string, user: any) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);