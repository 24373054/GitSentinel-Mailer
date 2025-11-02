const nodemailer = require('nodemailer');
const { getTheme } = require('./emailThemes');

// 邮件配置
const EMAIL_CONFIG = {
  service: 'qq',
  auth: {
    user: '2315766973@qq.com',
    pass: 'gkvoxbeffnxmeaaa'
  }
};

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 587,
  secure: false,
  auth: EMAIL_CONFIG.auth
});

/**
 * 生成邮件HTML内容
 */
function generateEmailHTML(repoUrl, commits, themeName = 'default') {
  const theme = getTheme(themeName);
  return theme.generateHTML(repoUrl, commits);
}

/**
 * 发送变更通知邮件
 */
async function sendChangeNotification(toEmail, repoUrl, commits, themeName = 'default') {
  try {
    const theme = getTheme(themeName);
    const subject = themeName === 'yingzhouji' 
      ? `⬡ 链上记录 · ${repoUrl} 有新提交` 
      : `🔔 GitHub仓库 ${repoUrl} 有新提交`;
    
    const mailOptions = {
      from: themeName === 'yingzhouji'
        ? `"瀛州纪 · 链上监控" <${EMAIL_CONFIG.auth.user}>`
        : `"GitHub监控系统" <${EMAIL_CONFIG.auth.user}>`,
      to: toEmail,
      subject: subject,
      html: generateEmailHTML(repoUrl, commits, themeName)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`邮件发送成功 [${theme.name}]: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('邮件发送失败:', error);
    throw error;
  }
}

/**
 * 测试邮件发送
 */
async function sendTestEmail(toEmail) {
  try {
    const mailOptions = {
      from: `"GitHub监控系统" <${EMAIL_CONFIG.auth.user}>`,
      to: toEmail,
      subject: '测试邮件 - GitHub监控系统',
      html: `
        <h2>测试邮件</h2>
        <p>这是一封来自GitHub监控系统的测试邮件。</p>
        <p>如果您收到此邮件，说明邮件服务配置正确。</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`测试邮件发送成功: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('测试邮件发送失败:', error);
    throw error;
  }
}

module.exports = {
  sendChangeNotification,
  sendTestEmail
};

