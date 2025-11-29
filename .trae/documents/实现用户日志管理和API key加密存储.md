# 实现用户日志管理和API key加密存储

## 1. 数据库结构修改

### 1.1 创建用户密钥表，添加API key字段和模型提供商字段。

<br />

用户可以有多个模型提供商，对应不同的密钥。

### 1.2 创建日志表

* 创建`user_logs`表，包含以下字段：

  * `id`：日志ID（主键，自增）

  * `user_id`：用户ID（外键）

  * `action`：操作类型（如login, create\_note, update\_note等）

  * `details`：操作详情（JSON格式）

  * `ip_address`：IP地址

  * `user_agent`：用户代理

  * `created_at`：创建时间

  * `deleted_at`：删除时间（用于逻辑删除）

## 2. 代码修改

### 2.1 更新类型定义

* 在`backend/src/types/index.ts`中添加日志相关类型

* 更新User接口，添加apiKey字段

### 2.2 更新用户模型

* 在`UserModel`中添加获取和更新API key的方法

### 2.3 创建日志模型

* 创建`LogModel`，包含创建日志、获取日志列表、删除日志（逻辑删除）等方法

<br />

### 2.5 创建日志服务

* 创建`LogService`，处理日志相关业务逻辑

### 2.6 添加API端点

* 添加日志管理的API端点

* 添加API key管理的API端点

### 2.7 前端测试

* 测试已有日志管理功能，日志查看和管理

