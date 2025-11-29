/**
 * 分类类型定义
 */
export interface Category {
  /** 分类唯一标识符 */
  id: string;
  /** 分类名称 */
  name: string;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 标签类型定义
 */
export interface Tag {
  /** 标签唯一标识符 */
  id: string;
  /** 标签名称 */
  name: string;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

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
  /** 分类ID */
  categoryId: string | null;
  /** 分类信息 */
  category?: Category;
  /** 标签列表 */
  tags: Tag[];
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}