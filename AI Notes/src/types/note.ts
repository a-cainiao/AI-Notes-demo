/**
 * 笔记数据类型定义
 */
export interface Note {
  /** 笔记唯一标识符 */
  id: string;
  /** 笔记标题 */
  title: string;
  /** 笔记内容 */
  content: string;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}