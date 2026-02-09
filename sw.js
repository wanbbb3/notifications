// Service Worker for Android Chrome Notifications
const CACHE_NAME = 'notification-app-v1';
const urlsToCache = [
  './index.html',
  './manifest.json'
];

// 安装 Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: 安装中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: 缓存文件');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活 Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: 激活中...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: 删除旧缓存', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截请求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// 处理推送通知（服务器推送）
self.addEventListener('push', event => {
  console.log('Service Worker: 收到服务器推送消息');
  
  let notificationData = {
    title: '新消息',
    body: '您有一条新消息',
    icon: 'https://via.placeholder.com/128/667eea/ffffff?text=📱',
    badge: 'https://via.placeholder.com/96/764ba2/ffffff?text=!',
    vibrate: [200, 100, 200],
    tag: 'push-notification-' + Date.now(),
    requireInteraction: false
  };

  // 解析推送数据
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('推送数据:', data);
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      console.error('解析推送数据失败:', e);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      vibrate: notificationData.vibrate,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: {
        url: self.location.origin,
        timestamp: notificationData.timestamp || Date.now()
      }
    })
  );
});

// 处理通知点击事件
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: 通知被点击');
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // 如果已有窗口打开,则聚焦
        for (let client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // 否则打开新窗口
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});

// 处理通知关闭事件
self.addEventListener('notificationclose', event => {
  console.log('Service Worker: 通知被关闭', event.notification.tag);
});

// 处理周期性后台同步(用于定时通知)
self.addEventListener('periodicsync', event => {
  console.log('Service Worker: 收到周期性同步事件', event.tag);
  
  if (event.tag === 'timer-notification') {
    event.waitUntil(sendPeriodicNotification());
  }
});

// 发送周期性通知
async function sendPeriodicNotification() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('zh-CN');
  
  console.log('Service Worker: 发送周期性通知', timeString);
  
  return self.registration.showNotification('后台定时通知', {
    body: `发送时间: ${timeString}\n这是后台周期性通知`,
    icon: 'https://via.placeholder.com/128/667eea/ffffff?text=📱',
    badge: 'https://via.placeholder.com/96/764ba2/ffffff?text=!',
    vibrate: [200, 100, 200],
    tag: 'periodic-notification-' + Date.now(),
    requireInteraction: false,
    data: {
      url: self.location.origin,
      timestamp: Date.now()
    }
  });
}

// 处理消息(用于页面和 Service Worker 通信)
self.addEventListener('message', event => {
  console.log('Service Worker: 收到消息', event.data);
  
  if (event.data && event.data.type === 'SEND_NOTIFICATION') {
    const { title, body, options } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        body: body,
        icon: 'https://via.placeholder.com/128/667eea/ffffff?text=📱',
        badge: 'https://via.placeholder.com/96/764ba2/ffffff?text=!',
        vibrate: [200, 100, 200],
        tag: 'message-notification-' + Date.now(),
        requireInteraction: false,
        ...options,
        data: {
          url: self.location.origin,
          timestamp: Date.now()
        }
      })
    );
  }
});
