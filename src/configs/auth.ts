export default {
  meEndpoint: '/api/auth/me',
  loginEndpoint: '/api/login',
  registerEndpoint: '/jwt/register',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken', // logout | refreshToken
  usersEndpoint: '/api/users',
  roleEndpoint: '/api/role'
}
