---
title: "📚 Maven 必知必会"
description: "深入介绍了Maven的核心概念、依赖管理机制和最佳实践。文章重点解析了Maven的.mvn目录配置、依赖冲突解决、Scope使用等关键知识点，并分享了项目级别的Maven配置管理经验。"
pubDate: "2025-09-20"
category: "zeka-stack"
banner: "https://api.dong4j.site/cover/png/v7?title=%F0%9F%93%9A+Maven+%E5%BF%85%E7%9F%A5%E5%BF%85%E4%BC%9A&author=%40dong4j&avatarUrl=https%3A%2F%2Fcdn.dong4j.site%2Fsource%2Fimage%2Favatar.webp&randomize=1"
tags: ["Zeka.Stack", "Javaer"]
toc: true
---

## 📖 前言

Maven 作为 Java 生态系统中最重要的构建工具之一，几乎每个 Java 开发者都会接触到。然而，很多开发者对 Maven 的理解还停留在表面，只知道
`mvn clean install` 等基本命令。

本文将深入探讨 Maven 的核心概念、依赖管理机制、最佳实践等关键知识点，帮助大家从 Maven 使用者成长为 Maven 专家。

---

## 🔧 Maven 核心概念速览

### 📦 什么是 Maven？

Maven 是一个项目管理和构建自动化工具，主要功能包括：

- **依赖管理**：自动下载和管理项目依赖
- **构建生命周期**：标准化的构建流程
- **项目信息管理**：统一的项目描述和配置
- **插件机制**：可扩展的构建功能

### 🏗️ Maven 项目结构

```
my-project/
├── pom.xml                    # 项目配置文件
├── src/
│   ├── main/
│   │   ├── java/             # 主要源代码
│   │   └── resources/        # 主要资源文件
│   └── test/
│       ├── java/             # 测试源代码
│       └── resources/        # 测试资源文件
└── target/                   # 构建输出目录
```

### 🎯 核心配置文件：pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    
    <modelVersion>4.0.0</modelVersion>
    
    <!-- 项目基本信息 -->
    <groupId>com.example</groupId>
    <artifactId>my-project</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    
    <!-- 项目属性 -->
    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    
    <!-- 依赖管理 -->
    <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <version>5.3.21</version>
        </dependency>
    </dependencies>
    
    <!-- 构建配置 -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
                <configuration>
                    <source>11</source>
                    <target>11</target>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 🔍 Maven 依赖管理深度解析

### 📊 依赖冲突解决机制

Maven 使用 **最近优先**（Nearest First）和 **最短路径优先**（Shortest Path First）原则来解决依赖冲突：

#### 1. 最近优先原则

```xml
<!-- 项目 A -->
<dependencies>
    <dependency>
        <groupId>com.example</groupId>
        <artifactId>lib-a</artifactId>
        <version>1.0.0</version>
    </dependency>
    <dependency>
        <groupId>com.example</groupId>
        <artifactId>lib-b</artifactId>
        <version>2.0.0</version>
    </dependency>
</dependencies>
```

如果 `lib-a` 和 `lib-b` 都依赖同一个库的不同版本，Maven 会选择在依赖树中**距离根节点最近**的版本。

#### 2. 最短路径优先原则

当两个依赖距离根节点的距离相同时，Maven 会选择**路径最短**的版本。

#### 3. 依赖冲突检测工具

**Maven Helper 插件**（推荐）：

```xml
<plugin>
    <groupId>com.github.ferstl</groupId>
    <artifactId>depgraph-maven-plugin</artifactId>
    <version>3.3.0</version>
</plugin>
```

**命令行工具**：

```bash
# 查看依赖树
mvn dependency:tree

# 查看依赖冲突
mvn dependency:tree -Dverbose

# 分析依赖
mvn dependency:analyze

# 查看依赖路径
mvn dependency:tree -Dincludes=groupId:artifactId
```

**实际案例**：

```bash
# 查看 Spring Boot 项目的依赖树
mvn dependency:tree -Dincludes=org.springframework:*

# 输出示例：
# [INFO] com.example:my-project:jar:1.0.0
# [INFO] +- org.springframework:spring-core:jar:5.3.21:compile
# [INFO] +- org.springframework:spring-context:jar:5.3.21:compile
# [INFO] |  \- org.springframework:spring-aop:jar:5.3.21:compile
```

### 🎯 Scope 详解：provided vs optional

#### Scope 类型总览

| Scope        | 编译时 | 测试时 | 运行时 | 打包时 | 典型用途   |
|--------------|-----|-----|-----|-----|--------|
| **compile**  | ✅   | ✅   | ✅   | ✅   | 核心依赖   |
| **provided** | ✅   | ✅   | ❌   | ❌   | 容器提供   |
| **runtime**  | ❌   | ✅   | ✅   | ✅   | 运行时依赖  |
| **test**     | ❌   | ✅   | ❌   | ❌   | 测试依赖   |
| **system**   | ✅   | ✅   | ✅   | ✅   | 本地 JAR |

#### provided 详解

```xml
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>4.0.1</version>
    <scope>provided</scope>
</dependency>
```

**使用场景**：

- 容器（如 Tomcat）已经提供的依赖
- 避免与容器中的版本冲突
- 减少最终 JAR 包大小

**实际案例**：

```xml
<!-- Spring Boot 项目中的典型配置 -->
<dependencies>
    <!-- 编译和测试时需要，但运行时由容器提供 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-tomcat</artifactId>
        <scope>provided</scope>
    </dependency>
    
    <!-- 测试时需要，但不会打包到最终 JAR -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

#### optional 详解

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>optional-lib</artifactId>
    <version>1.0.0</version>
    <optional>true</optional>
</dependency>
```

**使用场景**：

- 可选功能依赖
- 避免强制传递依赖
- 让使用者自主选择

**实际案例**：

```xml
<!-- 数据库驱动可选依赖 -->
<dependencies>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.29</version>
        <optional>true</optional>
    </dependency>
    
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <version>42.3.6</version>
        <optional>true</optional>
    </dependency>
</dependencies>
```

#### provided vs optional 对比

| 特性       | provided | optional   |
|----------|----------|------------|
| **传递性**  | 会传递      | 不会传递       |
| **编译时**  | 可用       | 可用         |
| **运行时**  | 不可用      | 可用（如果显式添加） |
| **典型用途** | 容器提供     | 可选功能       |

---

## 🛠️ .mvn 目录详解

### 📁 .mvn 目录的作用和意义

`.mvn` 目录是 Maven 3.3.0+ 引入的重要特性，它允许项目级别的 Maven 配置，这些配置会**跟随项目一起进行 Git 管理**，从而带来以下重要优势：

#### 🎯 核心价值

1. **项目可移植性**：确保项目在任何环境下都能使用相同的 Maven 配置
2. **一致性构建**：团队成员使用相同的构建参数，避免"在我机器上能跑"的问题
3. **版本锁定**：通过 Maven Wrapper 锁定特定 Maven 版本
4. **配置共享**：将构建配置作为项目的一部分进行版本控制

#### 📁 .mvn 目录结构

```
.mvn/
├── jvm.config          # JVM 配置（项目级别）
├── maven.config        # Maven 配置（项目级别）
└── wrapper/            # Maven Wrapper 相关文件
    ├── maven-wrapper.jar
    └── maven-wrapper.properties
```

#### 🔄 配置优先级

Maven 配置的优先级（从高到低）：

1. **命令行参数**：`mvn clean install -X`
2. **项目 .mvn 配置**：`.mvn/jvm.config`、`.mvn/maven.config`
3. **用户 settings.xml**：`~/.m2/settings.xml`
4. **全局 settings.xml**：`$MAVEN_HOME/conf/settings.xml`
5. **默认配置**：Maven 内置默认值

#### 🌟 实际应用场景

**场景 1：团队协作**

```bash
# 开发者 A 的机器
mvn clean install  # 使用项目 .mvn 配置

# 开发者 B 的机器  
mvn clean install  # 使用相同的项目 .mvn 配置

# CI/CD 环境
mvn clean install  # 使用相同的项目 .mvn 配置
```

**场景 2：项目迁移**

```bash
# 项目从开发环境迁移到生产环境
git clone project-repo
cd project-repo
./mvnw clean install  # 自动使用项目配置的 Maven 版本和参数
```

**场景 3：版本一致性**

```bash
# 不同项目使用不同 Maven 版本
project-a/.mvn/wrapper/maven-wrapper.properties  # Maven 3.6.3
project-b/.mvn/wrapper/maven-wrapper.properties  # Maven 3.8.6
project-c/.mvn/wrapper/maven-wrapper.properties  # Maven 3.9.0
```

### ⚙️ 配置文件详解

#### jvm.config

```bash
# JVM 配置示例
-Xmx2048m
-Xms1024m
-XX:MaxMetaspaceSize=512m
-Dfile.encoding=UTF-8
-Djava.awt.headless=true
-XX:+UseG1GC
-XX:+UseStringDeduplication
```

**作用**：

- 为 Maven 构建过程设置 JVM 参数
- 影响所有 Maven 命令的执行
- 项目级别的 JVM 配置
- **跟随项目版本控制**，确保团队一致性

**实际应用场景**：

```bash
# 大型项目配置
-Xmx4096m
-Xms2048m
-XX:MaxMetaspaceSize=1024m
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200

# 内存受限环境配置
-Xmx512m
-Xms256m
-XX:MaxMetaspaceSize=256m
-XX:+UseSerialGC

# 性能优化配置
-Xmx2048m
-Xms1024m
-XX:+UseG1GC
-XX:+UseStringDeduplication
-XX:+OptimizeStringConcat
```

#### maven.config

```bash
# Maven 配置示例
--batch-mode
--show-version
--errors
--threads 4
--no-transfer-progress
```

**常用参数详解**：

- `--batch-mode`: 批处理模式，不显示进度条，适合 CI/CD
- `--show-version`: 显示 Maven 版本信息
- `--errors`: 只显示错误信息，减少日志噪音
- `--threads 4`: 并行构建线程数，提升构建速度
- `--no-transfer-progress`: 不显示依赖下载进度
- `--quiet`: 静默模式，只显示错误
- `--debug`: 调试模式，显示详细日志

**不同环境配置示例**：

```bash
# 开发环境配置
--show-version
--threads 2
--no-transfer-progress

# CI/CD 环境配置
--batch-mode
--show-version
--errors
--threads 4
--no-transfer-progress

# 调试环境配置
--show-version
--debug
--threads 1
```

#### maven-wrapper.properties

```properties
# Maven Wrapper 配置
distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.8.6/apache-maven-3.8.6-bin.zip
wrapperUrl=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.1.0/maven-wrapper-3.1.0.jar
```

**作用**：

- 确保项目使用特定版本的 Maven
- 避免"在我机器上能跑"的问题
- 简化 CI/CD 环境配置
- **版本锁定**，确保构建一致性

**版本管理策略**：

```properties
# 稳定版本（推荐）
distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.8.6/apache-maven-3.8.6-bin.zip

# 最新版本（谨慎使用）
distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.0/apache-maven-3.9.0-bin.zip

# 企业内网版本
distributionUrl=https://nexus.company.com/repository/maven-public/org/apache/maven/apache-maven/3.8.6/apache-maven-3.8.6-bin.zip
```

### 🚀 Maven Wrapper 使用

#### 基本使用

```bash
# 使用 Maven Wrapper（推荐）
./mvnw clean install

# Windows 环境
mvnw.cmd clean install

# 查看 Maven 版本
./mvnw -v

# 查看帮助
./mvnw --help
```

#### 高级使用

```bash
# 指定 Maven 版本（临时）
./mvnw -Dmaven.wrapper.version=3.8.6 clean install

# 跳过 Maven Wrapper 检查
./mvnw -Dmaven.wrapper.skip=true clean install

# 强制更新 Maven Wrapper
./mvnw -Dmaven.wrapper.forceUpdate=true clean install

# 使用特定 Maven 配置文件
./mvnw -s custom-settings.xml clean install
```

#### 团队协作最佳实践

**1. 项目初始化时设置 Maven Wrapper**：

```bash
# 在项目根目录执行
mvn -N io.takari:maven:wrapper

# 或者指定 Maven 版本
mvn -N io.takari:maven:wrapper -Dmaven=3.8.6
```

**2. 确保 .mvn 目录被版本控制**：

```bash
# .gitignore 中不要忽略 .mvn 目录
# 确保以下文件被提交
git add .mvn/
git add mvnw
git add mvnw.cmd
git commit -m "Add Maven Wrapper configuration"
```

**3. 团队使用规范**：

```bash
# 团队成员统一使用 Maven Wrapper
./mvnw clean install

# 而不是使用系统 Maven
mvn clean install  # 不推荐
```

### 🔧 .mvn 目录最佳实践

#### 1. 项目结构标准化

```
project-root/
├── .mvn/
│   ├── jvm.config              # JVM 配置
│   ├── maven.config            # Maven 配置
│   └── wrapper/
│       ├── maven-wrapper.jar
│       └── maven-wrapper.properties
├── mvnw                        # Unix/Linux 脚本
├── mvnw.cmd                    # Windows 脚本
├── pom.xml
└── src/
```

#### 2. 配置管理策略

**开发环境配置**：

```bash
# .mvn/jvm.config
-Xmx2048m
-Xms1024m
-XX:+UseG1GC
-Dfile.encoding=UTF-8

# .mvn/maven.config
--show-version
--threads 2
--no-transfer-progress
```

**生产环境配置**：

```bash
# .mvn/jvm.config
-Xmx4096m
-Xms2048m
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-Dfile.encoding=UTF-8

# .mvn/maven.config
--batch-mode
--show-version
--errors
--threads 4
--no-transfer-progress
```

#### 3. 版本管理策略

```properties
# .mvn/wrapper/maven-wrapper.properties
# 使用稳定版本，避免频繁更新
distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.8.6/apache-maven-3.8.6-bin.zip

# 定期检查更新，但谨慎升级
# 升级前在测试环境验证
```

#### 4. CI/CD 集成

```yaml
# GitHub Actions 示例
- name: Build with Maven Wrapper
  run: ./mvnw clean install

# Jenkins Pipeline 示例
stage('Build') {
    steps {
        sh './mvnw clean install'
    }
}
```

### 🎯 实际应用案例

#### 案例 1：多环境项目

```bash
# 项目 A：Spring Boot 微服务
.mvn/jvm.config:
-Xmx1024m
-Xms512m
-XX:+UseG1GC

.mvn/maven.config:
--show-version
--threads 2

# 项目 B：大型企业应用
.mvn/jvm.config:
-Xmx4096m
-Xms2048m
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200

.mvn/maven.config:
--batch-mode
--show-version
--threads 4
```

#### 案例 2：团队协作

```bash
# 新成员加入团队
git clone project-repo
cd project-repo
./mvnw clean install  # 自动使用项目配置

# 无需安装特定 Maven 版本
# 无需配置特定 JVM 参数
# 无需担心环境差异
```

#### 案例 3：项目迁移

```bash
# 项目从开发环境迁移到生产环境
# 开发环境
./mvnw clean install  # 使用开发配置

# 生产环境
./mvnw clean install  # 使用相同的配置，确保一致性
```

---

## 💡 Maven 使用最佳实践

### 🎯 项目结构最佳实践

#### 1. 多模块项目结构

```
parent-project/
├── pom.xml                    # 父 POM
├── common/                    # 公共模块
│   └── pom.xml
├── service/                   # 服务模块
│   └── pom.xml
├── web/                       # Web 模块
│   └── pom.xml
└── .mvn/                     # Maven 配置
    ├── jvm.config
    └── maven.config
```

#### 2. 父 POM 配置

```xml
<!-- 父 POM 示例 -->
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>parent-project</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>
    
    <!-- 子模块 -->
    <modules>
        <module>common</module>
        <module>service</module>
        <module>web</module>
    </modules>
    
    <!-- 依赖管理 -->
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>2.7.0</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
    
    <!-- 插件管理 -->
    <build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>3.8.1</version>
                    <configuration>
                        <source>11</source>
                        <target>11</target>
                    </configuration>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>
</project>
```

### 🔧 依赖管理最佳实践

#### 1. 使用 BOM 管理版本

```xml
<dependencyManagement>
    <dependencies>
        <!-- Spring Boot BOM -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>2.7.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        
        <!-- 自定义 BOM -->
        <dependency>
            <groupId>com.example</groupId>
            <artifactId>my-dependencies</artifactId>
            <version>1.0.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

#### 2. 依赖分类管理

```xml
<dependencies>
    <!-- 核心依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- 数据库依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- 测试依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### 🚀 构建优化最佳实践

#### 1. 并行构建

```bash
# 使用多线程构建
mvn clean install -T 4

# 或者配置 .mvn/maven.config
--threads 4
```

#### 2. 跳过测试（谨慎使用）

```bash
# 跳过测试
mvn clean install -DskipTests

# 跳过测试编译
mvn clean install -Dmaven.test.skip=true
```

#### 3. 离线模式

```bash
# 离线构建（需要先下载依赖）
mvn clean install -o
```

### 📊 性能监控和优化

#### 1. 构建时间分析

```bash
# 显示构建时间
mvn clean install --show-version

# 详细输出
mvn clean install -X
```

#### 2. 内存优化

```bash
# 设置 Maven 内存
export MAVEN_OPTS="-Xmx2048m -Xms1024m"

# 或者在 .mvn/jvm.config 中配置
-Xmx2048m
-Xms1024m
```

---

## 🚀 Maven 高级特性

### ⚡ Mvnd：Maven 守护进程

Mvnd 是 Maven 的守护进程版本，可以显著提升构建速度：

#### 安装 Mvnd

```bash
# macOS
brew install mvnd

# 或者下载二进制包
wget https://github.com/mvndaemon/mvnd/releases/download/0.8.2/mvnd-0.8.2-darwin-amd64.zip
unzip mvnd-0.8.2-darwin-amd64.zip
export PATH=$PATH:./mvnd-0.8.2-darwin-amd64/bin
```

#### 使用 Mvnd

```bash
# 基本使用（与 mvn 命令相同）
mvnd clean install

# 查看守护进程状态
mvnd status

# 停止守护进程
mvnd stop
```

#### 性能对比

| 构建类型  | Maven | Mvnd | 提升   |
|-------|-------|------|------|
| 冷启动   | 30s   | 5s   | 6x   |
| 增量构建  | 15s   | 3s   | 5x   |
| 多模块构建 | 45s   | 8s   | 5.6x |

### 🔧 Maven 插件开发

#### 1. 创建插件项目

```xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>my-maven-plugin</artifactId>
    <version>1.0.0</version>
    <packaging>maven-plugin</packaging>
    
    <dependencies>
        <dependency>
            <groupId>org.apache.maven</groupId>
            <artifactId>maven-plugin-api</artifactId>
            <version>3.8.6</version>
        </dependency>
        <dependency>
            <groupId>org.apache.maven.plugin-tools</groupId>
            <artifactId>maven-plugin-annotations</artifactId>
            <version>3.6.4</version>
        </dependency>
    </dependencies>
</project>
```

#### 2. 编写 Mojo

```java
@Mojo(name = "hello", defaultPhase = LifecyclePhase.COMPILE)
public class HelloMojo extends AbstractMojo {
    
    @Parameter(property = "name", defaultValue = "World")
    private String name;
    
    @Override
    public void execute() throws MojoExecutionException {
        getLog().info("Hello, " + name + "!");
    }
}
```

### 📈 构建报告和分析

#### 1. 依赖分析报告

```bash
# 生成依赖分析报告
mvn dependency:analyze

# 生成依赖树报告
mvn dependency:tree -Doutput=dependency-tree.txt

# 生成依赖冲突报告
mvn dependency:tree -Dverbose -Doutput=conflicts.txt
```

#### 2. 构建统计

```bash
# 显示构建统计信息
mvn clean install --show-version --batch-mode

# 生成构建时间报告
mvn clean install -Dmaven.build.timestamp.format="yyyy-MM-dd HH:mm:ss"
```

---

## 🐛 常见问题和解决方案

### ❌ 依赖问题

#### 1. 依赖下载失败

```bash
# 清理本地仓库
mvn dependency:purge-local-repository

# 强制更新依赖
mvn clean install -U

# 使用不同的仓库
mvn clean install -Dmaven.repo.remote=https://maven.aliyun.com/repository/public
```

#### 2. 依赖冲突

```bash
# 查看依赖树
mvn dependency:tree

# 排除冲突依赖
<dependency>
    <groupId>com.example</groupId>
    <artifactId>conflicting-lib</artifactId>
    <version>1.0.0</version>
    <exclusions>
        <exclusion>
            <groupId>org.old</groupId>
            <artifactId>old-lib</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### ⚠️ 构建问题

#### 1. 内存不足

```bash
# 增加 Maven 内存
export MAVEN_OPTS="-Xmx4096m -Xms2048m"

# 或者在 .mvn/jvm.config 中配置
-Xmx4096m
-Xms2048m
-XX:MaxMetaspaceSize=1024m
```

#### 2. 构建超时

```bash
# 设置超时时间
mvn clean install -Dmaven.wagon.http.connectionTimeout=60000

# 或者配置 settings.xml
<settings>
    <servers>
        <server>
            <id>my-repo</id>
            <configuration>
                <httpConfiguration>
                    <connectionTimeout>60000</connectionTimeout>
                </httpConfiguration>
            </configuration>
        </server>
    </servers>
</settings>
```

### 🔧 配置问题

#### 1. 代理配置

```xml
<!-- settings.xml -->
<settings>
    <proxies>
        <proxy>
            <id>my-proxy</id>
            <active>true</active>
            <protocol>http</protocol>
            <host>proxy.company.com</host>
            <port>8080</port>
            <username>user</username>
            <password>pass</password>
        </proxy>
    </proxies>
</settings>
```

#### 2. 仓库配置

```xml
<!-- settings.xml -->
<settings>
    <mirrors>
        <mirror>
            <id>aliyun</id>
            <mirrorOf>central</mirrorOf>
            <name>Aliyun Maven</name>
            <url>https://maven.aliyun.com/repository/central</url>
        </mirror>
    </mirrors>
</settings>
```

---

## 🛠️ Maven 高级实用技巧

### 🔧 第三方 JAR 源码修改技巧

在实际开发中，我们经常会遇到需要修改第三方 JAR 包中源码的情况。Maven 提供了几种优雅的解决方案：

#### 方法一：源码覆盖（推荐）

**步骤 1：创建同名包结构**

```
src/main/java/
└── com/thirdparty/library/  # 与第三方 JAR 包相同的包路径
    └── ModifiedClass.java   # 修改后的类
```

**步骤 2：确保类路径优先级**

```xml
<!-- 在 pom.xml 中确保我们的代码优先加载 -->
<build>
    <sourceDirectory>src/main/java</sourceDirectory>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
        </resource>
    </resources>
</build>
```

**步骤 3：验证加载顺序**

```bash
# 查看类加载顺序
mvn dependency:tree -Dverbose

# 或者使用 Java 系统属性
java -verbose:class -cp target/classes:target/lib/* com.example.Main
```

**实际案例**：

假设我们需要修改 `commons-lang3` 中的 `StringUtils` 类：

```java
// 创建文件：src/main/java/org/apache/commons/lang3/StringUtils.java
package org.apache.commons.lang3;

public class StringUtils {
    
    // 重写原有方法
    public static boolean isEmpty(CharSequence cs) {
        return cs == null || cs.length() == 0;
    }
    
    // 添加自定义方法
    public static boolean isNotEmpty(CharSequence cs) {
        return !isEmpty(cs);
    }
    
    // 其他原有方法...
}
```

#### 方法二：使用 Maven Shade Plugin（SDK 开发推荐）

Maven Shade Plugin 是开发 SDK 时的最佳选择，它可以将所有依赖打包到一个 JAR 文件中，并重命名包路径避免冲突。

**基础配置**：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-shade-plugin</artifactId>
    <version>3.4.1</version>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>shade</goal>
            </goals>
            <configuration>
                <createDependencyReducedPom>false</createDependencyReducedPom>
                <shadedArtifactAttached>true</shadedArtifactAttached>
                <shadedClassifierName>all</shadedClassifierName>
            </configuration>
        </execution>
    </executions>
</plugin>
```

**SDK 开发完整配置**：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-shade-plugin</artifactId>
    <version>3.4.1</version>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>shade</goal>
            </goals>
            <configuration>
                <!-- 不生成简化 POM -->
                <createDependencyReducedPom>false</createDependencyReducedPom>
                
                <!-- 生成带分类器的 JAR -->
                <shadedArtifactAttached>true</shadedArtifactAttached>
                <shadedClassifierName>all</shadedClassifierName>
                
                <!-- 包重定位 - 避免依赖冲突 -->
                <relocations>
                    <!-- 重定位 Apache Commons -->
                    <relocation>
                        <pattern>org.apache.commons</pattern>
                        <shadedPattern>com.yourcompany.sdk.internal.commons</shadedPattern>
                    </relocation>
                    
                    <!-- 重定位 Jackson -->
                    <relocation>
                        <pattern>com.fasterxml.jackson</pattern>
                        <shadedPattern>com.yourcompany.sdk.internal.jackson</shadedPattern>
                    </relocation>
                    
                    <!-- 重定位 OkHttp -->
                    <relocation>
                        <pattern>okhttp3</pattern>
                        <shadedPattern>com.yourcompany.sdk.internal.okhttp3</shadedPattern>
                    </relocation>
                    
                    <!-- 重定位 Okio -->
                    <relocation>
                        <pattern>okio</pattern>
                        <shadedPattern>com.yourcompany.sdk.internal.okio</shadedPattern>
                    </relocation>
                </relocations>
                
                <!-- 资源转换器 -->
                <transformers>
                    <!-- 合并 MANIFEST.MF -->
                    <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                        <mainClass>com.yourcompany.sdk.Main</mainClass>
                    </transformer>
                    
                    <!-- 合并 Spring 配置文件 -->
                    <transformer implementation="org.apache.maven.plugins.shade.resource.AppendingTransformer">
                        <resource>META-INF/spring.handlers</resource>
                    </transformer>
                    <transformer implementation="org.apache.maven.plugins.shade.resource.AppendingTransformer">
                        <resource>META-INF/spring.schemas</resource>
                    </transformer>
                    
                    <!-- 合并服务加载器配置 -->
                    <transformer implementation="org.apache.maven.plugins.shade.resource.ServicesResourceTransformer"/>
                    
                    <!-- 合并 Apache 许可证 -->
                    <transformer implementation="org.apache.maven.plugins.shade.resource.ApacheLicenseResourceTransformer"/>
                </transformers>
                
                <!-- 排除不需要的依赖 -->
                <filters>
                    <filter>
                        <artifact>*:*</artifact>
                        <excludes>
                            <exclude>META-INF/*.SF</exclude>
                            <exclude>META-INF/*.DSA</exclude>
                            <exclude>META-INF/*.RSA</exclude>
                            <exclude>META-INF/MANIFEST.MF</exclude>
                        </excludes>
                    </filter>
                </filters>
            </configuration>
        </execution>
    </executions>
</plugin>
```

**使用效果**：

```bash
# 构建后生成两个 JAR 文件
target/
├── your-sdk-1.0.0.jar           # 原始 JAR（不包含依赖）
└── your-sdk-1.0.0-all.jar       # 包含所有依赖的 JAR
```

**在业务项目中使用**：

```xml
<dependency>
    <groupId>com.yourcompany</groupId>
    <artifactId>your-sdk</artifactId>
    <version>1.0.0</version>
    <classifier>all</classifier>
</dependency>
```

**验证包重定位**：

```java
// 在业务代码中，重定位后的类路径
import com.yourcompany.sdk.internal.commons.lang3.StringUtils;
import com.yourcompany.sdk.internal.jackson.databind.ObjectMapper;

public class BusinessService {
    public void processData() {
        // 使用重定位后的类，不会与业务项目的依赖冲突
        StringUtils.isEmpty("test");
        ObjectMapper mapper = new ObjectMapper();
    }
}
```

#### 方法三：使用 Maven Assembly Plugin

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-assembly-plugin</artifactId>
    <version>3.3.0</version>
    <configuration>
        <descriptorRefs>
            <descriptorRef>jar-with-dependencies</descriptorRef>
        </descriptorRefs>
        <archive>
            <manifest>
                <mainClass>com.example.Main</mainClass>
            </manifest>
        </archive>
    </configuration>
</plugin>
```

### 🎯 依赖版本管理技巧

#### 1. 版本范围使用

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>my-lib</artifactId>
    <version>[1.0.0,2.0.0)</version>  <!-- 1.0.0 <= version < 2.0.0 -->
</dependency>

<!-- 常用版本范围 -->
<version>[1.0.0,)</version>           <!-- >= 1.0.0 -->
<version>(,1.0.0]</version>           <!-- <= 1.0.0 -->
<version>[1.0.0,1.2.0]</version>      <!-- 1.0.0 <= version <= 1.2.0 -->
```

#### 2. 版本属性管理

```xml
<properties>
    <!-- 版本属性 -->
    <spring.version>5.3.21</spring.version>
    <junit.version>5.8.2</junit.version>
    
    <!-- 环境属性 -->
    <maven.compiler.source>11</maven.compiler.source>
    <maven.compiler.target>11</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>${spring.version}</version>
    </dependency>
</dependencies>
```

### 🚀 构建性能优化技巧

#### 1. 并行构建优化

```bash
# 使用所有可用 CPU 核心
mvn clean install -T 1C

# 使用指定线程数
mvn clean install -T 4

# 使用指定线程数和每线程模块数
mvn clean install -T 4 -Dmaven.compile.fork=true
```

#### 2. 增量构建

```bash
# 只编译变更的模块
mvn compile -amd -pl module1,module2

# 只测试变更的模块
mvn test -amd -pl module1,module2

# 只打包变更的模块
mvn package -amd -pl module1,module2
```

#### 3. 构建缓存

```xml
<!-- 使用 Maven 构建缓存插件 -->
<plugin>
    <groupId>com.github.ferstl</groupId>
    <artifactId>depgraph-maven-plugin</artifactId>
    <version>3.3.0</version>
    <executions>
        <execution>
            <goals>
                <goal>graph</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

### 🔍 调试和诊断技巧

#### 1. 依赖分析

```bash
# 查看依赖树
mvn dependency:tree

# 查看依赖冲突
mvn dependency:tree -Dverbose

# 分析未使用的依赖
mvn dependency:analyze

# 查看依赖路径
mvn dependency:tree -Dincludes=groupId:artifactId

# 生成依赖图
mvn dependency:tree -Doutput=dependency-tree.txt
```

#### 2. 构建调试

```bash
# 详细输出
mvn clean install -X

# 只显示错误
mvn clean install -q

# 显示版本信息
mvn clean install --show-version

# 批处理模式
mvn clean install --batch-mode
```

#### 3. 内存和性能分析

```bash
# 设置 JVM 参数
export MAVEN_OPTS="-Xmx2048m -Xms1024m -XX:+UseG1GC"

# 分析构建时间
mvn clean install --show-version --batch-mode

# 生成构建报告
mvn clean install -Dmaven.build.timestamp.format="yyyy-MM-dd HH:mm:ss"
```

### 🛡️ 安全最佳实践

#### 1. 依赖安全检查

```xml
<!-- 使用 OWASP 依赖检查插件 -->
<plugin>
    <groupId>org.owasp</groupId>
    <artifactId>dependency-check-maven</artifactId>
    <version>7.1.1</version>
    <executions>
        <execution>
            <goals>
                <goal>check</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

#### 2. 依赖签名验证

```bash
# 验证依赖签名
mvn clean install -Dmaven.wagon.http.ssl.insecure=true

# 或者配置 settings.xml
<settings>
    <servers>
        <server>
            <id>my-repo</id>
            <configuration>
                <httpConfiguration>
                    <all>
                        <params>
                            <property>
                                <name>http.protocol.trust-all</name>
                                <value>false</value>
                            </property>
                        </params>
                    </all>
                </httpConfiguration>
            </configuration>
        </server>
    </servers>
</settings>
```

### 📊 构建监控和报告

#### 1. 构建统计

```bash
# 显示构建时间
mvn clean install --show-version

# 生成构建报告
mvn clean install -Dmaven.build.timestamp.format="yyyy-MM-dd HH:mm:ss"

# 分析构建性能
mvn clean install -Dmaven.build.timestamp.format="yyyy-MM-dd HH:mm:ss" --show-version
```

#### 2. 依赖报告

```bash
# 生成依赖报告
mvn dependency:analyze-report

# 生成依赖树报告
mvn dependency:tree -Doutput=dependency-tree.txt

# 生成依赖冲突报告
mvn dependency:tree -Dverbose -Doutput=conflicts.txt
```

### 🔧 自定义 Maven 配置

#### 1. 自定义生命周期

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-antrun-plugin</artifactId>
    <version>3.0.0</version>
    <executions>
        <execution>
            <id>custom-phase</id>
            <phase>process-resources</phase>
            <goals>
                <goal>run</goal>
            </goals>
            <configuration>
                <target>
                    <echo message="Custom build phase executed!"/>
                </target>
            </configuration>
        </execution>
    </executions>
</plugin>
```

#### 2. 环境特定配置

```xml
<profiles>
    <profile>
        <id>dev</id>
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
        <properties>
            <env>dev</env>
            <log.level>DEBUG</log.level>
        </properties>
    </profile>
    
    <profile>
        <id>prod</id>
        <properties>
            <env>prod</env>
            <log.level>INFO</log.level>
        </properties>
    </profile>
</profiles>
```

### 🏗️ SDK 开发最佳实践

#### 1. SDK 项目结构

```
sdk-project/
├── pom.xml                    # SDK POM 配置
├── src/main/java/
│   └── com/yourcompany/sdk/
│       ├── SdkClient.java     # 公开 API
│       ├── internal/          # 内部实现
│       │   ├── commons/       # 重定位后的依赖
│       │   ├── jackson/       # 重定位后的依赖
│       │   └── okhttp3/       # 重定位后的依赖
│       └── config/            # 配置类
├── src/main/resources/
│   └── META-INF/
│       ├── spring.handlers    # Spring 配置
│       └── spring.schemas
└── .mvn/
    ├── jvm.config
    └── maven.config
```

#### 2. SDK POM 配置模板

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.yourcompany</groupId>
    <artifactId>your-sdk</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    
    <name>Your Company SDK</name>
    <description>SDK for Your Company Services</description>
    
    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        
        <!-- 依赖版本 -->
        <jackson.version>2.13.3</jackson.version>
        <okhttp.version>4.9.3</okhttp.version>
        <commons-lang3.version>3.12.0</commons-lang3.version>
    </properties>
    
    <dependencies>
        <!-- 核心依赖 -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>${jackson.version}</version>
        </dependency>
        
        <dependency>
            <groupId>com.squareup.okhttp3</groupId>
            <artifactId>okhttp</artifactId>
            <version>${okhttp.version}</version>
        </dependency>
        
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
            <version>${commons-lang3.version}</version>
        </dependency>
        
        <!-- 测试依赖 -->
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <!-- 编译插件 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
                <configuration>
                    <source>11</source>
                    <target>11</target>
                </configuration>
            </plugin>
            
            <!-- Shade 插件 - 打包所有依赖 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-shade-plugin</artifactId>
                <version>3.4.1</version>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>shade</goal>
                        </goals>
                        <configuration>
                            <createDependencyReducedPom>false</createDependencyReducedPom>
                            <shadedArtifactAttached>true</shadedArtifactAttached>
                            <shadedClassifierName>all</shadedClassifierName>
                            
                            <!-- 包重定位 -->
                            <relocations>
                                <relocation>
                                    <pattern>com.fasterxml.jackson</pattern>
                                    <shadedPattern>com.yourcompany.sdk.internal.jackson</shadedPattern>
                                </relocation>
                                <relocation>
                                    <pattern>okhttp3</pattern>
                                    <shadedPattern>com.yourcompany.sdk.internal.okhttp3</shadedPattern>
                                </relocation>
                                <relocation>
                                    <pattern>okio</pattern>
                                    <shadedPattern>com.yourcompany.sdk.internal.okio</shadedPattern>
                                </relocation>
                                <relocation>
                                    <pattern>org.apache.commons</pattern>
                                    <shadedPattern>com.yourcompany.sdk.internal.commons</shadedPattern>
                                </relocation>
                            </relocations>
                            
                            <!-- 资源转换器 -->
                            <transformers>
                                <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                                    <mainClass>com.yourcompany.sdk.SdkClient</mainClass>
                                </transformer>
                                <transformer implementation="org.apache.maven.plugins.shade.resource.ServicesResourceTransformer"/>
                                <transformer implementation="org.apache.maven.plugins.shade.resource.ApacheLicenseResourceTransformer"/>
                            </transformers>
                            
                            <!-- 过滤不需要的文件 -->
                            <filters>
                                <filter>
                                    <artifact>*:*</artifact>
                                    <excludes>
                                        <exclude>META-INF/*.SF</exclude>
                                        <exclude>META-INF/*.DSA</exclude>
                                        <exclude>META-INF/*.RSA</exclude>
                                        <exclude>META-INF/MANIFEST.MF</exclude>
                                    </excludes>
                                </filter>
                            </filters>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
            
            <!-- 源码插件 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-source-plugin</artifactId>
                <version>3.2.1</version>
                <executions>
                    <execution>
                        <id>attach-sources</id>
                        <goals>
                            <goal>jar</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
            
            <!-- Javadoc 插件 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-javadoc-plugin</artifactId>
                <version>3.3.2</version>
                <executions>
                    <execution>
                        <id>attach-javadocs</id>
                        <goals>
                            <goal>jar</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

#### 3. SDK 使用示例

**在业务项目中使用 SDK**：

```xml
<!-- 业务项目 POM -->
<dependency>
    <groupId>com.yourcompany</groupId>
    <artifactId>your-sdk</artifactId>
    <version>1.0.0</version>
    <classifier>all</classifier>
</dependency>
```

**业务代码示例**：

```java
import com.yourcompany.sdk.SdkClient;
import com.yourcompany.sdk.config.SdkConfig;

public class BusinessService {
    
    private final SdkClient sdkClient;
    
    public BusinessService() {
        SdkConfig config = SdkConfig.builder()
            .apiKey("your-api-key")
            .baseUrl("https://api.yourcompany.com")
            .timeout(30000)
            .build();
        
        this.sdkClient = new SdkClient(config);
    }
    
    public void processData() {
        // 使用 SDK，不会与业务项目的依赖冲突
        String result = sdkClient.callApi("some-endpoint");
        System.out.println("Result: " + result);
    }
}
```

#### 4. SDK 版本管理策略

```xml
<!-- 在父 POM 中管理 SDK 版本 -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.yourcompany</groupId>
            <artifactId>your-sdk</artifactId>
            <version>1.0.0</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

#### 5. SDK 发布到私有仓库

```xml
<!-- 在 SDK POM 中配置发布 -->
<distributionManagement>
    <repository>
        <id>your-nexus</id>
        <name>Your Company Nexus</name>
        <url>https://nexus.yourcompany.com/repository/maven-releases/</url>
    </repository>
    <snapshotRepository>
        <id>your-nexus-snapshots</id>
        <name>Your Company Nexus Snapshots</name>
        <url>https://nexus.yourcompany.com/repository/maven-snapshots/</url>
    </snapshotRepository>
</distributionManagement>
```

### 💡 实用脚本和别名

#### 1. 常用 Maven 别名

```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
alias mci='mvn clean install'
alias mcp='mvn clean package'
alias mct='mvn clean test'
alias mdt='mvn dependency:tree'
alias mda='mvn dependency:analyze'
alias mdu='mvn dependency:purge-local-repository'
alias mvs='mvn versions:set'
alias mvd='mvn versions:display-dependency-updates'
```

#### 2. 实用脚本

```bash
#!/bin/bash
# mvn-clean-install.sh - 智能构建脚本

# 检查是否有变更
if [ -n "$(git status --porcelain)" ]; then
    echo "检测到未提交的变更，是否继续构建？(y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 执行构建
echo "开始构建..."
mvn clean install -T 1C -DskipTests

# 检查构建结果
if [ $? -eq 0 ]; then
    echo "构建成功！"
else
    echo "构建失败！"
    exit 1
fi
```

---

## 🎯 总结

Maven 作为 Java 生态系统的核心构建工具，掌握其核心概念和最佳实践对于 Java 开发者来说至关重要。通过本文的学习，你应该能够：

### ✅ 核心技能

1. **理解 Maven 依赖管理机制**：包括依赖冲突解决、Scope 使用等
2. **掌握 Maven 配置**：包括 .mvn 目录、settings.xml 等
3. **应用最佳实践**：项目结构、依赖管理、构建优化等
4. **解决常见问题**：依赖冲突、构建失败、性能优化等

### 🚀 进阶方向

1. **Maven 插件开发**：自定义构建逻辑
2. **多模块项目管理**：大型项目的模块化设计
3. **CI/CD 集成**：与 Jenkins、GitLab CI 等工具集成
4. **性能优化**：构建速度优化、内存优化等

### 💡 实践建议

1. **从小项目开始**：先在小项目中实践 Maven 最佳实践
2. **持续学习**：关注 Maven 新特性和社区动态
3. **工具辅助**：使用 Maven Helper、IDE 插件等工具
4. **团队协作**：与团队分享 Maven 最佳实践

记住，Maven 不仅仅是一个构建工具，更是项目管理和团队协作的重要工具。掌握 Maven，让你的 Java 开发之路更加顺畅！

---

**相关资源**：

- [Maven 官方文档](https://maven.apache.org/guides/)
- [Maven 最佳实践](https://maven.apache.org/guides/mini/guide-best-practices.html)
- [Maven 插件开发指南](https://maven.apache.org/guides/plugin/guide-java-plugin-development.html)

**项目地址**：[Zeka Stack](https://github.com/zeka-stack/zeka-stack) | [Arco Maven Plugin](https://github.com/zeka-stack/arco-maven-plugin)

**欢迎交流**：如果你在 Maven 使用过程中遇到问题，或者有好的实践分享，欢迎在 GitHub 上交流讨论！
