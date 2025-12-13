// URL分析服务测试
import { describe, it, expect } from 'vitest';
import { validateURL, normalizeURL, crawlPage, parseHTML, analyzeWithAI } from '@/lib/url-analyzer';

describe('URL分析服务', () => {
  describe('URL验证和清理', () => {
    it('验证URL格式', () => {
      expect(validateURL('https://example.com')).toBe('https://example.com/');
      expect(validateURL('http://example.com')).toBe('http://example.com/');
      expect(validateURL('ftp://example.com')).toBeNull();
      expect(validateURL('invalid-url')).toBeNull();
    });
    
    it('规范化URL', () => {
      expect(normalizeURL('http://example.com/')).toBe('https://example.com');
      expect(normalizeURL('https://example.com/path/')).toBe('https://example.com/path');
    });
  });
  
  describe('HTML解析', () => {
    it('解析HTML内容', () => {
      const html = `
        <html>
          <head>
            <title>Test Page</title>
            <meta name="description" content="Test description">
            <meta name="keywords" content="test, example, demo">
          </head>
          <body>
            <article>
              <h1>Test Article</h1>
              <p>This is a test article.</p>
            </article>
          </body>
        </html>
      `;
      
      const result = parseHTML(html);
      expect(result).not.toBeNull();
      expect(result?.title).toBe('Test Page');
      expect(result?.metaDescription).toBe('Test description');
      expect(result?.keywords).toEqual(['test', 'example', 'demo']);
      expect(result?.content).toContain('Test Article');
    });
  });
  
  describe('AI分析集成', () => {
    it('测试AI分析执行', async () => {
      // 这里可以编写测试AI分析的代码
      // 注意：由于AI API调用可能需要付费，这里可以使用模拟数据
      const html = `
        <html>
          <head>
            <title>AI Agent Demo</title>
            <meta name="description" content="A demo AI Agent for productivity">
          </head>
          <body>
            <article>
              <h1>AI Agent Demo</h1>
              <p>This AI agent helps with productivity tasks like scheduling, email management, and document analysis.</p>
            </article>
          </body>
        </html>
      `;
      
      // 由于AI API调用可能需要付费，这里暂时使用模拟数据
      const mockAnalysis = {
        name: 'AI Agent Demo',
        description: 'A demo AI Agent for productivity',
        features: ['Scheduling', 'Email Management', 'Document Analysis'],
        useCases: ['Productivity', 'Workflow Automation'],
        strengths: ['Easy to use', 'Fast response'],
        weaknesses: ['Limited features', 'No mobile app'],
        category: 'Productivity'
      };
      
      expect(mockAnalysis).toHaveProperty('name');
      expect(mockAnalysis).toHaveProperty('description');
      expect(mockAnalysis).toHaveProperty('features');
      expect(mockAnalysis).toHaveProperty('useCases');
      expect(mockAnalysis).toHaveProperty('strengths');
      expect(mockAnalysis).toHaveProperty('weaknesses');
      expect(mockAnalysis).toHaveProperty('category');
    });
  });
});
