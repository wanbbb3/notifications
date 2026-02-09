// VAPID 密钥配置（浏览器和 Node.js 通用）
var VAPID_PUBLIC_KEY = 'BNVOICRKtD4y5tB5ZZiMq0-BDT1I8lG15FiA0AU20G8AZ6VryXj8HPYhCT8_1o-nOv7u2g7zjbEqcn3EcTWH4VK-YKOUeqKkLjcQKuSv-tSUaY';
var VAPID_PRIVATE_KEY = 'L1byowFcEy6n3slYq_Z7DXSJzR879W4CPj5mVa1JxAY';

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
