// src/hooks/useAuthStorage.js
const { useContext } = require('react');
const AuthStorageContext = require('../contexts/AuthStorageContext');

const useAuthStorage = () => {
  return useContext(AuthStorageContext);
};

module.exports = useAuthStorage;