---
title: 임베디드 모드
---

대부분의 경우 Ignite CLI 도구로 Ignite 클러스터를 시작하고 관리합니다. 하지만 경우에 따라 Java 프로젝트에서 클러스터를 관리하는 편이 더 나을 때가 있습니다. 코드에서 클러스터를 시작하고 다루는 방식을 "임베디드 모드(embedded mode)"라고 합니다.

이 튜토리얼에서는 Java 프로젝트에서 Ignite 3를 시작하는 방법을 다룹니다.

:::note
Ignite 2와 달리 Ignite 3의 노드는 클라이언트 노드와 서버 노드로 나뉘지 않습니다. 임베디드 모드로 시작한 노드는 기본적으로 데이터 저장에 사용됩니다.
:::

## 사전 요구 사항 {#prerequisites}

이 절에서는 Ignite를 실행하는 머신의 플랫폼 요구 사항을 설명합니다. Ignite 시스템 요구 사항은 클러스터 규모에 따라 달라집니다.

| 요구 사항 | 버전 |
|-------------|---------|
| JDK | 11 이상 |
| OS | Linux(Debian, Red Hat 계열), Windows 10 또는 11 |
| ISA | x86 또는 x64 |

## 프로젝트에 Ignite 추가하기 {#add-ignite-to-your-project}

먼저 프로젝트에 Ignite를 추가해야 합니다. 가장 쉬운 방법은 Maven을 사용하는 것입니다.

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <configuration>
                <source>11</source>
                <target>11</target>
            </configuration>
        </plugin>
    </plugins>
</build>

<dependencies>
    <dependency>
        <groupId>org.apache.ignite</groupId>
        <artifactId>ignite-api</artifactId>
        <version>3.1.0</version>
    </dependency>

    <dependency>
        <groupId>org.apache.ignite</groupId>
        <artifactId>ignite-runner</artifactId>
        <version>3.1.0</version>
    </dependency>
</dependencies>
```

## Ignite 구성 준비하기 {#prepare-ignite-configuration}

Ignite 노드를 시작하려면 노드의 모든 구성 속성을 지정하는 Ignite 구성 파일이 필요합니다. 이 튜토리얼에서는 Ignite 3를 [설치](/configure-and-operate/installation/install-zip)하고 여기에 포함된 기본 구성 파일을 사용하기를 권장합니다. 이 파일은 `ignite3-db-3.0.0/etc/ignite-config.conf` 파일에 있습니다.

## JVM 매개변수 전달하기 {#pass-jvm-parameters}

독점 SDK API를 사용할 수 있게 하려면 애플리케이션에 다음 JVM 매개변수를 전달해야 합니다.

```
--add-opens java.base/java.lang=ALL-UNNAMED
--add-opens java.base/java.lang.invoke=ALL-UNNAMED
--add-opens java.base/java.lang.reflect=ALL-UNNAMED
--add-opens java.base/java.io=ALL-UNNAMED
--add-opens java.base/java.nio=ALL-UNNAMED
--add-opens java.base/java.math=ALL-UNNAMED
--add-opens java.base/java.util=ALL-UNNAMED
--add-opens java.base/java.time=ALL-UNNAMED
--add-opens java.base/jdk.internal.misc=ALL-UNNAMED
--add-opens java.base/jdk.internal.access=ALL-UNNAMED
--add-opens java.base/sun.nio.ch=ALL-UNNAMED
-Dio.netty.tryReflectionSetAccessible=true
```

## Ignite 서버 노드 시작하기 {#start-ignite-server-nodes}

Ignite 노드를 시작하려면 다음 코드 스니펫을 사용하세요.

```java
IgniteServer node = IgniteServer.start("node", configFilePath, workDir);
```

이 코드 스니펫은 이름이 `node1`인 Ignite 노드를 시작합니다. 이 노드는 `configFilePath` 경로 매개변수로 지정한 파일의 구성을 사용하고, `workDir` 경로 매개변수로 지정한 폴더에 데이터를 저장합니다. 노드가 시작되면 이 메서드는 노드를 다루는 데 사용할 수 있는 `IgniteServer` 클래스의 인스턴스를 반환합니다.

## 클러스터 초기화하기 {#initiate-a-cluster}

시작된 노드는 기본적으로 서로를 찾지만, 클러스터를 초기화하지 않으면 동작 가능한 클러스터를 구성하지 않습니다. 노드를 활성화하려면 클러스터를 초기화해야 합니다. 노드가 여러 개면, 클러스터가 활성화된 후 노드가 토폴로지를 구성하고 서로 워크로드를 자동으로 분산합니다.

아래 코드 스니펫을 사용해 클러스터를 초기화하세요.

```java
InitParameters initParameters = InitParameters.builder()
    .metaStorageNodeNames("node")
    .clusterName("cluster")
    .build();

node.initCluster(initParameters);
```

:::note
Ignite 3 클러스터를 시작하려면 `clusterConfiguration` 매개변수에 클러스터 구성과 함께 라이선스를 제공해야 합니다.
:::

## Ignite 인스턴스 가져오기 {#get-an-ignite-instance}

클러스터가 시작되었으니 이제 `Ignite` 클래스의 인스턴스를 가져올 수 있습니다.

```java
Ignite ignite = node.api();
```

이 인스턴스로 클러스터 작업을 시작할 수 있습니다. 클러스터가 활성화되면 future가 반환됩니다.

다음 예시에서는 SQL API를 사용해 클러스터와 상호작용합니다.

```java
ignite.sql().execute(null, "CREATE TABLE IF NOT EXISTS Person (id int primary key, name varchar, age int);");
ignite.sql().execute(null, "insert into Person (id, name, age) values ('1', 'Person Man', '501'");
try (ResultSet<SqlRow> rs = ignite.sql().execute(null, "SELECT id, name, age from Person")) {
    while (rs.hasNext()) {
        SqlRow row = rs.next();
        System.out.println("    "
                + row.value(1) + ", "
                + row.value(2));
    }
}
```

:::note
세션은 닫을 수 있지만, DDL 및 DML 쿼리는 커서를 열어두지 않으므로 `close()` 메서드를 건너뛰어도 안전합니다.
:::

Ignite로 작업하는 예시는 [예시](https://github.com/apache/ignite-3/tree/main/examples) 저장소에서 더 찾을 수 있습니다.

## 다음 단계 {#next-steps}

여기서부터는 다음을 살펴볼 수 있습니다.

* 사용 가능한 API를 더 알아보려면 [개발자 가이드](/develop/work-with-data/table-api) 페이지를 확인하세요
* [예시](https://github.com/apache/ignite-3/tree/main/examples)를 사용해 보세요
