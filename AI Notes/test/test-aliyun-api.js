#!/usr/bin/env node

/**
 * 阿里云模型接口测试脚本
 * 用于测试与阿里云通义千问 API 的连通性
 */

// 模拟浏览器环境的 localStorage
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;
global.fetch = require('node-fetch');

// 导入 AI 服务
const { aiService } = require('../dist/services/aiService.js');

// 测试配置
const API_KEY = process.env.ALIYUN_API_KEY || '';
const TEST_TEXT = '请帮我总结一下人工智能的发展历程';

/**
 * 测试阿里云模型接口
 */
async function testAliyunAPI() {
  console.log('=== 阿里云模型接口测试 ===\n');
  
  if (!API_KEY) {
    console.error('错误: 请设置 ALIYUN_API_KEY 环境变量');
    console.log('使用方法: ALIYUN_API_KEY=your-api-key node test-aliyun-api.js');
    process.exit(1);
  }
  
  try {
    // 设置 API Key 和模型提供商
    aiService.setProvider('aliyun');
    aiService.setApiKey(API_KEY);
    
    console.log('1. 设置 API Key 成功');
    console.log('2. 设置模型提供商为阿里云');
    
    // 测试 API 连通性
    console.log('3. 测试 API 连通性...');
    console.log('   测试文本:', TEST_TEXT);
    
    // 使用 Promise 包装 processText 方法
    await new Promise((resolve, reject) => {
      let responseText = '';
      let isComplete = false;
      
      aiService.processText(
        TEST_TEXT,
        (chunk) => {
          responseText += chunk;
          process.stdout.write('.'); // 显示进度
        },
        () => {
          isComplete = true;
          console.log('\n4. API 调用成功');
          console.log('5. 响应结果:');
          console.log('   ' + responseText);
          resolve();
        },
        (error) => {
          if (!isComplete) {
            console.error('\n4. API 调用失败:', error.message);
            reject(error);
          }
        }
      );
      
      // 设置超时
      setTimeout(() => {
        if (!isComplete) {
          console.error('\n4. API 调用超时');
          reject(new Error('API 调用超时'));
        }
      }, 30000); // 30秒超时
    });
    
    console.log('\n=== 测试成功 ===');
    process.exit(0);
    
  } catch (error) {
    console.error('\n=== 测试失败 ===');
    console.error('错误详情:', error);
    process.exit(1);
  }
}

// 运行测试
testAliyunAPI();