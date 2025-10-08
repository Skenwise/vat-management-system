// src/contexts/DBContext.jsx
import React, { createContext, useState } from "react";

export const DBContext = createContext();

export const DBProvider = ({ children }) => {
  const [connection, setConnection] = useState({
    host: "",
    user: "",
    database: "",
    password: "",
    isConnected: false
  });

  const updateConnection = (data) => {
    setConnection((prev) => ({ ...prev, ...data }));
  };

  return (
    <DBContext.Provider value={{ connection, updateConnection }}>
      {children}
    </DBContext.Provider>
  );
};