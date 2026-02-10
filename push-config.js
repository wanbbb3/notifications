// VAPID 密钥配置（浏览器和 Node.js 通用）
var VAPID_PUBLIC_KEY = 'BP4yrfyWO3fsT098GsOZIvCM9DDgr0o-EqY7YVVwcbbP2KTLUXZDNP6TEUx6K4ucPC2dcaex0LhuPxOw3DXh-70';
var VAPID_PRIVATE_KEY = 'tIx9TUfIT5Bqsx6FU6UPTiULrxaI1K8rlDND0ime5No';

// 服务器配置（使用局域网 IP 以支持手机访问）
var PUSH_SERVER_URL = 'http://192.168.0.18:3000';

// Node.js 环境导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
    PUSH_SERVER_URL
  };
}

// 浏览器环境全局变量（已通过 var 声明）
// VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, PUSH_SERVER_URL 可直接使用
