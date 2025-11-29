// 导入 @testing-library/jest-dom 扩展
import '@testing-library/jest-dom';
// 导入whatwg-fetch，提供fetch API支持
import 'whatwg-fetch';

// 模拟localStorage
interface LocalStorageMock {
  store: Record<string, string>;
  getItem: jest.Mock<string | null, [string]>;
  setItem: jest.Mock<void, [string, string]>;
  removeItem: jest.Mock<void, [string]>;
  clear: jest.Mock<void, []>;
  length: number;
  key: jest.Mock<string | null, [number]>;
}

const localStorageMock: LocalStorageMock = {
  store: {} as Record<string, string>,
  getItem: jest.fn<string | null, [string]>((key: string) => localStorageMock.store[key] || null),
  setItem: jest.fn<void, [string, string]>((key: string, value: string) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: jest.fn<void, [string]>((key: string) => {
    delete localStorageMock.store[key];
  }),
  clear: jest.fn<void, []>(() => {
    localStorageMock.store = {};
  }),
  length: 0,
  key: jest.fn<string | null, [number]>((index: number) => {
    return Object.keys(localStorageMock.store)[index] || null;
  }),
};

global.localStorage = localStorageMock as any;

// 在每个测试运行前清空localStorage
beforeEach(() => {
  localStorageMock.store = {};
  jest.clearAllMocks();
});

// 使用类型断言来避免TextEncoder/TextDecoder的类型错误
global.TextEncoder = class MockTextEncoder {
  encode(str: string): Uint8Array {
    return new Uint8Array(Buffer.from(str));
  }
  // 添加缺失的属性以满足类型要求
  encoding = 'utf-8';
  encodeInto = jest.fn();
} as any;

global.TextDecoder = class MockTextDecoder {
  decode(uint8Array: Uint8Array | undefined): string {
    if (!uint8Array) {
      return '';
    }
    return Buffer.from(uint8Array).toString();
  }
  // 添加缺失的属性以满足类型要求
  encoding = 'utf-8';
  fatal = false;
  ignoreBOM = false;
} as any;



// 模拟import.meta.env
// 使用类型断言来解决TypeScript类型检查问题
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_AI_API_KEY: null,
        VITE_AI_PROVIDER: 'aliyun',
      },
    },
  },
  writable: true,
  configurable: true,
});

// 确保 @testing-library/jest-dom 匹配器可用
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
    }
  }
}
