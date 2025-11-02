// 验证GitHub Token配置
require('dotenv').config();

console.log('====================================');
console.log('GitHub Token 配置验证');
console.log('====================================\n');

if (process.env.GITHUB_TOKEN) {
  const token = process.env.GITHUB_TOKEN;
  const maskedToken = token.substring(0, 10) + '...' + token.substring(token.length - 4);
  console.log('✅ GitHub Token 已配置');
  console.log('   Token: ' + maskedToken);
  console.log('   长度: ' + token.length + ' 字符');
  console.log('   速率限制: 5000次/小时');
  console.log('\n🎉 配置正确！您可以使用10秒监控间隔。\n');
} else {
  console.log('❌ 未检测到 GitHub Token');
  console.log('\n请检查：');
  console.log('1. .env 文件是否在项目根目录');
  console.log('2. .env 文件内容格式: GITHUB_TOKEN=your_token_here');
  console.log('3. .env 文件中没有多余的引号或空格\n');
}

console.log('====================================');
console.log('当前监控配置');
console.log('====================================');
console.log('监控间隔: 10秒');
console.log('环境变量文件: .env');
console.log('====================================\n');

