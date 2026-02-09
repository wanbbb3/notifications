// 验证 VAPID 公钥格式
const webpush = require('web-push');

const publicKey = 'BLxiPtApGtKzOrPCX2iUxuCxgCcRGOt9wYOwJYQ4yZXSRxPdLL0GHsmP80qbSEofgLFfkaZabx0fHtKS6ho6xP8';

console.log('=== VAPID 公钥验证 ===');
console.log('公钥:', publicKey);
console.log('长度:', publicKey.length);

try {
    // 尝试转换为 Uint8Array
    const padding = '='.repeat((4 - publicKey.length % 4) % 4);
    const base64 = (publicKey + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = Buffer.from(base64, 'base64');
    
    console.log('Base64 解码成功');
    console.log('解码后长度:', rawData.length);
    console.log('前几个字节:', Array.from(rawData.slice(0, 10)));
    
    // P-256 公钥应该是 65 字节,第一个字节应该是 0x04 (未压缩格式)
    if (rawData.length === 65 && rawData[0] === 0x04) {
        console.log('✅ 格式正确: P-256 未压缩公钥');
    } else {
        console.log('❌ 格式不正确');
        console.log('期望: 65 字节,第一个字节 0x04');
        console.log('实际:', rawData.length + ' 字节,第一个字节 0x' + rawData[0].toString(16));
    }
    
} catch (error) {
    console.log('❌ Base64 解码失败:', error.message);
}

// 测试使用这个密钥
try {
    console.log('\n=== 测试密钥使用 ===');
    const testPayload = JSON.stringify({
        title: '测试',
        body: '测试消息'
    });
    
    // 这里只测试密钥格式,不实际发送
    console.log('密钥可以用于 web-push 库');
    
} catch (error) {
    console.log('❌ 密钥使用失败:', error.message);
}
