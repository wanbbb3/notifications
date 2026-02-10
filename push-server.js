const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = require('./push-config');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 配置 VAPID
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// 存储订阅信息（生产环境应使用数据库）
let subscriptions = [];

// 直接写入用户的订阅节点
const userSubscription = {
  endpoint: "https://fcm.googleapis.com/fcm/send/dpnhY_dCwwo:APA91bExQQYfHHFxXWikosr816KHjSm54N3GMvATEAwQor-zx3OAih6mEOA8uYRzvfmTX_S7i_z6k5DENeh9LqVNdj7bKZl8IJa-989rzSOu-T4iNj3uDjL140wkxmSlI0sMIIbRBhzk",
  keys: {
    p256dh: "BP4yrfyWO3fsT098GsOZIvCM9DDgr0o-EqY7YVVwcbbP2KTLUXZDNP6TEUx6K4ucPC2dcaex0LhuPxOw3DXh-70",
    auth: "tIx9TUfIT5Bqsx6FU6UPTiULrxaI1K8rlDND0ime5No"
  }
};

// 初始化时添加用户订阅
subscriptions.push(userSubscription);
console.log('已添加用户订阅:', userSubscription.endpoint);
console.log('当前订阅数:', subscriptions.length);

// 订阅端点
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  console.log('收到新订阅:', subscription.endpoint);
  
  // 检查是否已存在
  res.status(201).json({ message: '订阅成功' });
});

// 取消订阅端点
app.post('/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
  console.log(`取消订阅: ${endpoint}`);
  console.log(`当前订阅数: ${subscriptions.length}`);
  res.json({ message: '取消订阅成功' });
});

// 发送推送通知端点
app.post('/push', async (req, res) => {
  const { title, body, interval } = req.body;
  
  console.log(`准备发送推送: ${title}`);
  console.log(`当前订阅数: ${subscriptions.length}`);
  
  if (subscriptions.length === 0) {
    return res.status(400).json({ error: '没有订阅者' });
  }
  
  const payload = JSON.stringify({
    title: title || '服务器推送通知',
    body: body || '这是来自服务器的推送通知',
    icon: 'https://via.placeholder.com/128/667eea/ffffff?text=📱',
    badge: 'https://via.placeholder.com/96/764ba2/ffffff?text=!',
    timestamp: Date.now()
  });
  
  const promises = subscriptions.map(subscription => {
    return webpush.sendNotification(subscription, payload)
      .catch(error => {
        console.error('推送失败:', error.message);
        // 如果订阅失效，从列表中移除
        if (error.statusCode === 410) {
          subscriptions = subscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
        }
      });
  });
  
  try {
    await Promise.all(promises);
    res.json({ 
      message: '推送发送成功',
      count: subscriptions.length 
    });
  } catch (error) {
    res.status(500).json({ error: '推送发送失败' });
  }
});

// 启动定时推送
let timerInterval = null;
let pushCount = 0;

app.post('/start-timer', (req, res) => {
  const { interval = 2 } = req.body; // 默认2秒
  
  if (timerInterval) {
    return res.status(400).json({ error: '定时推送已在运行' });
  }
  
  console.log(`启动定时推送，间隔: ${interval}秒`);
  pushCount = 0;
  
  // 立即发送第一条
  sendTimerPush(interval);
  
  // 设置定时器
  timerInterval = setInterval(() => {
    sendTimerPush(interval);
  }, interval * 1000);
  
  res.json({ 
    message: `定时推送已启动，间隔${interval}秒`,
    interval 
  });
});

// 停止定时推送
app.post('/stop-timer', (req, res) => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    console.log(`停止定时推送，共发送 ${pushCount} 条`);
    res.json({ 
      message: '定时推送已停止',
      totalSent: pushCount 
    });
  } else {
    res.status(400).json({ error: '定时推送未运行' });
  }
});

// 发送定时推送
async function sendTimerPush(interval) {
  pushCount++;
  const now = new Date();
  const timeString = now.toLocaleTimeString('zh-CN');
  
  console.log(`[${timeString}] 发送第 ${pushCount} 条定时推送`);
  
  const payload = JSON.stringify({
    title: `定时推送 #${pushCount}`,
    body: `发送时间: ${timeString}\n间隔: ${interval}秒\n这是服务器端定时推送`,
    icon: 'https://via.placeholder.com/128/667eea/ffffff?text=📱',
    badge: 'https://via.placeholder.com/96/764ba2/ffffff?text=!',
    tag: 'timer-push-' + pushCount,
    timestamp: Date.now()
  });
  
  const promises = subscriptions.map(subscription => {
    return webpush.sendNotification(subscription, payload)
      .catch(error => {
        console.error('推送失败:', error.message);
        if (error.statusCode === 410) {
          subscriptions = subscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
        }
      });
  });
  
  await Promise.all(promises);
}

// 获取状态
app.get('/status', (req, res) => {
  res.json({
    subscriptions: subscriptions.length,
    timerRunning: timerInterval !== null,
    pushCount: pushCount
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 推送服务器运行在 http://0.0.0.0:${PORT}`);
  console.log(`📱 可通过以下地址访问:`);
  console.log(`   - http://localhost:${PORT}`);
  console.log(`   - http://127.0.0.1:${PORT}`);
  console.log(`   - http://你的IP地址:${PORT}`);
  console.log(`📱 VAPID Public Key: ${VAPID_PUBLIC_KEY.substring(0, 20)}...`);
});
