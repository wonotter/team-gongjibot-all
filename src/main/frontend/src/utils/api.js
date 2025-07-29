// 환경에 따른 API URL 설정
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://wonokim.iptime.org:4000'  // 개발 환경 - 기존 개발 서버 사용
  : '';  // 프로덕션 환경 - 같은 서버에서 서빙 (상대 경로)

export default API_BASE_URL;

// API 엔드포인트들을 상수로 관리
export const API_ENDPOINTS = {
  // 인증 관련
  LOGIN: '/login',
  EMAIL_CERTIFICATION: '/api/v1/auth/email-certification',
  SIGN_UP: '/api/v1/auth/sign-up',
  PASSWORD_RESET: '/api/v1/auth/password-reset',
  PROFILE: '/api/v1/auth/profile',
  REFRESH: '/api/v1/auth/refresh',
  
  // OAuth
  OAUTH_KAKAO: '/oauth2/authorization/kakao',
  OAUTH_GOOGLE: '/oauth2/authorization/google',
  OAUTH_NAVER: '/oauth2/authorization/naver',
  
  // 채팅
  CHAT: '/api/chat',
  CHAT_HISTORY: '/api/history'
};

// 완전한 URL을 생성하는 헬퍼 함수
export const createApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
}; 