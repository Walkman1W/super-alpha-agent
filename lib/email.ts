/**
 * 邮件服务
 * 使用 Resend 发送验证邮件
 */

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'Super Alpha Agent <noreply@superalphaagent.com>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://superalphaagent.com'

/**
 * 生成6位验证码
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * 发送验证码邮件
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
  agentName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `[Super Alpha Agent] 验证码: ${code}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">🚀 Super Alpha Agent</h1>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              你好！感谢你提交 AI Agent${agentName ? ` <strong>${agentName}</strong>` : ''}。
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              请使用以下验证码完成邮箱验证：
            </p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: bold; color: white; letter-spacing: 8px;">${code}</span>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              验证码有效期为 <strong>10分钟</strong>，请尽快完成验证。
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              验证成功后，你的 Agent 将自动上架到平台。<br>
              我们会在你的 Agent 被 AI 搜索引擎收录时通知你。
            </p>
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 16px;">
              © ${new Date().getFullYear()} Super Alpha Agent | <a href="${SITE_URL}" style="color: #4f46e5;">superalphaagent.com</a>
            </p>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('Send email error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Email service error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '发送邮件失败' 
    }
  }
}

/**
 * 发送上架成功通知邮件
 */
export async function sendPublishSuccessEmail(
  email: string,
  agentName: string,
  agentSlug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const agentUrl = `${SITE_URL}/agents/${agentSlug}`
    
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `🎉 你的 Agent "${agentName}" 已成功上架！`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
              <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">上架成功！</h1>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              恭喜！你的 AI Agent <strong>${agentName}</strong> 已成功上架到 Super Alpha Agent 平台。
            </p>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="color: #666; font-size: 14px; margin: 0 0 8px 0;">你的 Agent 页面：</p>
              <a href="${agentUrl}" style="color: #4f46e5; font-size: 14px; word-break: break-all;">${agentUrl}</a>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              接下来会发生什么？
            </p>
            <ul style="color: #666; font-size: 14px; line-height: 1.8; padding-left: 20px;">
              <li>AI 搜索引擎（ChatGPT、Claude、Perplexity）会逐步收录你的 Agent</li>
              <li>当有用户通过 AI 搜索发现你的 Agent 时，我们会通知你</li>
              <li>你可以随时查看 Agent 的访问统计</li>
            </ul>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Super Alpha Agent | <a href="${SITE_URL}" style="color: #4f46e5;">superalphaagent.com</a>
            </p>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('Send success email error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Email service error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '发送邮件失败' 
    }
  }
}
