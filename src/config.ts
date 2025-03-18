export const config = {
    apiUrl: process.env.REACT_APP_API_URL || 'https://api.hmes.buubuu.id.vn/api',
    useLocalData: process.env.REACT_APP_USE_LOCAL_DATA === 'true' || false,
  };
  
  export default config;