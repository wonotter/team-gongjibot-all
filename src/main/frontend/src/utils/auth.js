import axios from 'axios';

// 토큰 저장 함수
export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  // 모든 요청에 기본적으로 Authorization 헤더 추가
  axios.defaults.headers.common['Authorization'] = accessToken;
};

// 토큰 가져오기 함수
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

// 토큰 삭제 함수 (로그아웃 시 사용)
export const removeTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  delete axios.defaults.headers.common['Authorization'];
};

// 로그인 상태 확인 함수
export const isAuthenticated = () => {
  return !!getAccessToken();
};

// axios 인터셉터 설정 - 토큰 만료 시 자동 갱신
export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // 401 에러이고, 재시도하지 않은 요청인 경우
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // 리프레시 토큰으로 새 액세스 토큰 요청
          const refreshToken = getRefreshToken();
          
          if (!refreshToken) {
            // 리프레시 토큰이 없으면 로그아웃 처리
            removeTokens();
            window.location.href = '/'; // 홈 페이지로 리다이렉트
            return Promise.reject(error);
          }
          
          // 토큰 갱신 요청
          const response = await axios.post('http://wonokim.iptime.org:4000/api/v1/auth/refresh', {}, {
            headers: {
              'Authorization-refresh': refreshToken
            },
            withCredentials: true
          });
          
          // 새 토큰 저장
          const newAccessToken = response.headers['authorization'];
          const newRefreshToken = response.headers['authorization-refresh'];
          
          if (newAccessToken && newRefreshToken) {
            setTokens(newAccessToken, newRefreshToken);
            
            // 원래 요청 재시도
            originalRequest.headers['Authorization'] = newAccessToken;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃 처리
          removeTokens();
          window.location.href = '/'; // 홈 페이지로 리다이렉트
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};

// 초기 설정: 저장된 토큰이 있으면 axios 헤더에 설정
export const initializeAuth = () => {
  const accessToken = getAccessToken();
  if (accessToken) {
    axios.defaults.headers.common['Authorization'] = accessToken;
  }
  setupAxiosInterceptors();
}; 