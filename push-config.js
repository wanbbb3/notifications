// VAPID 密钥配置
const VAPID_PUBLIC_KEY = 'BGrQ8hwKR2GVqx135MplUTtwvRWZdfjPU39m4dxwlNmp5bPqBLd8d4GlrObsdj6BsD328NGVh_jkEJ8a_vVpkS8';
const VAPID_PRIVATE_KEY = 'hMCvlxw7A6nMzrNx3gwOnE8ox-_nd2NPhcuka0eaRz8';

// 服务器配置
const PUSH_SERVER_URL = 'http://localhost:3000';

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
    PUSH_SERVER_URL
  };
}
