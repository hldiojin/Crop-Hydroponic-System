export const config = {
    apiUrl: process.env.REACT_APP_API_URL || 'https://api.hmes.site/api',
    useLocalData: process.env.REACT_APP_USE_LOCAL_DATA === 'true' || false,
  };
  
  export default config;