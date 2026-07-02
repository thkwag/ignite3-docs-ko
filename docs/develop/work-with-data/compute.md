---
id: compute
title: 분산 컴퓨트
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Apache Ignite에서는 직접 작성한 코드를 클러스터에서 분산 실행할 수 있으며, 부하 분산과 장애 허용성을 함께 제공합니다.

작업은 단일 노드, 여러 노드, 또는 클러스터 전체에서 실행할 수 있으며, 동기 실행과 비동기 실행 중에서 선택할 수 있습니다.

:::note
이제 Apache Ignite 컴퓨트 엔진은 Java와 .NET으로 구현한 작업을 모두 지원합니다. .NET 컴퓨트 작업은 약간의 추가 설정이 필요하므로, 자세한 내용은 [.NET 컴퓨트 작업](#net-compute-jobs) 하위 절을 참고하세요.
:::

표준 컴퓨트 작업 외에도 Apache Ignite는 [콜로케이션 실행](#colocated-execution)을 지원합니다. 즉, 작업을 필요한 데이터가 저장된 노드에서 직접 실행하여 네트워크 부담을 줄이고 성능을 높일 수 있습니다.
클러스터는 [맵리듀스 태스크](#mapreduce-tasks)도 지원하여 대규모 데이터셋을 효율적으로 처리합니다. 이 경우 태스크는 필요한 데이터를 보유한 노드에서 실행됩니다.

노드 간에 코드와 데이터를 전송할 때, 객체는 정확하게 다시 만들 수 있도록 전송 가능한 형식으로 변환됩니다. Apache Ignite는 튜플, POJO, 네이티브 타입 같은 일반적인 타입의 마샬링(marshalling)을 자동으로 처리하지만, 더 복잡하거나 사용자 정의한 객체는 직접 [마샬링](./serialization) 로직을 구현해야 할 수 있습니다.

## 컴퓨트 작업 코드 배포 {#compute-job-code-deployment}

컴퓨트 작업을 제출하기 전에, 필요한 코드가 실행될 노드에 [배포](./code-deployment)되어 있는지 확인하세요.

[임베디드 노드](/getting-started/embedded-mode)를 사용하는 경우, 프로젝트 클래스패스에 포함된 코드는 컴퓨트 작업에서도 사용할 수 있습니다.

## 작업 구성 {#configuring-jobs}

Apache Ignite에서 컴퓨트 작업의 실행은 두 가지 핵심 컴포넌트 `JobTarget`과 `JobDescriptor`로 정의됩니다. 이 컴포넌트는 작업이 어느 노드에서 실행될지, 그리고 입력·출력 타입, 마샬러, 작업을 나타내는 배포된 클래스를 포함해 작업이 어떻게 구성될지를 결정합니다.

### 작업 대상 {#job-target}

작업을 제출하기 전에, 어느 노드가 작업을 실행할지 지정하는 `JobTarget` 객체를 만들어야 합니다. 작업 대상은 특정 노드나 클러스터의 임의 노드를 가리킬 수 있으며, 특정 키를 보유한 노드에서 실행되는 [콜로케이션](#colocated-execution) 컴퓨트 작업을 시작할 수도 있습니다. 사용할 수 있는 메서드는 다음과 같습니다.

- `JobTarget.anyNode()` - 지정한 노드 중 아무 노드에서나 작업이 실행됩니다.
- `JobTarget.node()` - 특정 노드에서 작업이 실행됩니다.
- `JobTarget.colocated()` - 지정한 키를 보유한 노드에서 작업이 실행됩니다.

:::note
작업을 [여러 노드](#multiple-node-execution)에서 실행하려면 대신 `BroadcastJobTarget` 객체를 사용하세요.
:::

### 작업 디스크립터 {#job-descriptor}

`JobDescriptor` 객체는 작업 실행에 필요한 모든 세부 정보를 담습니다. 다음 인수를 제공해야 합니다.

- 작업 디스크립터는 작업 인수의 입력 타입, 예상 출력 타입, 실행할 작업 클래스의 정규화된 이름을 지정하는 빌더로 생성합니다.
- `units`는 배포 단위를 받습니다. 단위 이름으로 배포 단위를 만들고 `Version.LATEST`를 지정하면 작업이 항상 가장 최근에 배포된 버전으로 실행됩니다.
- `resultClass`는 예상 결과 타입을 설정하여 시스템이 작업 출력을 올바르게 처리하도록 합니다.
- `argumentMarshaller`와 `resultMarshaller`는 작업의 입력 인수와 출력 결과를 직렬화하는 방식을 정의합니다. 일반적인 타입은 Apache Ignite가 마샬링을 자동으로 처리하므로 마샬러를 생략하고 빌더에 `null`을 전달할 수 있습니다.

아래 예시는 `NodeNameJob` 클래스가 [코드 배포](./code-deployment)로 노드에 배포되어 있다고 가정합니다.

- 일반적인 타입을 다룰 때는 사용자 정의 마샬러를 정의할 필요가 없습니다. Apache Ignite가 자동으로 처리합니다. 다음 예시는 내장 마샬링을 사용하는 더 간단한 작업 디스크립터를 보여줍니다.

  ```java
  String result = client.compute().execute(
      JobTarget.anyNode(client.cluster().nodes()),
      JobDescriptor.builder(WordPrintJob.class)
          .units(new DeploymentUnit(DEPLOYMENT_UNIT_NAME, DEPLOYMENT_UNIT_VERSION))
          .resultClass(String.class)
          .build(),
      "Hello, Ignite!"
  );
  ```

- 다음 예시는 사용자 정의 `MyJobArgument`를 받아 임의의 클러스터 노드에서 실행되고, 사용자 정의 마샬러로 `MyJobResult` 객체를 반환하는 작업의 사용자 정의 작업 디스크립터를 만드는 방법을 보여줍니다.

  ```java
  MyJobResult result = client.compute().execute(
      JobTarget.anyNode(client.cluster().nodes()),
      JobDescriptor.<MyJobArgument, MyJobResult>builder(WordPrintJob.class)
          .units(new DeploymentUnit(DEPLOYMENT_UNIT_NAME, DEPLOYMENT_UNIT_VERSION))
          .resultClass(MyJobResult.class)
          .argumentMarshaller(new ArgMarshaller())
          .resultMarshaller(new ResultMarshaller())
          .build(),
      new MyJobArgument("Hello, Ignite!")
  );
  ```

작업 구성에 관한 자세한 내용은 해당 API 섹션을 참고하세요.

### 배포 단위 정보 {#deployment-unit-information}

`JobExecutionContext` 객체는 작업이 사용하는 배포 단위 정보를, 작업에 관련된 각 배포 단위에 대한 `DeploymentUnitInfo` 컬렉션으로 담습니다.

각 `DeploymentUnitInfo` 객체는 다음 정보를 제공합니다.

* `name()` - 배포 단위의 이름
* `version()` - 배포 단위의 버전
* `path()` - 배포 단위 콘텐츠의 파일 시스템 경로

```java
public class DiagnosticJob implements ComputeJob<Void, String> {
    @Override
    public CompletableFuture<String> executeAsync(JobExecutionContext context, Void input) {
        // Access deployment unit information
        String deploymentInfo = context.deploymentUnits().stream()
            .map(unit -> String.format("%s:%s at %s",
                unit.name(),
                unit.version(),
                unit.path()))
            .collect(Collectors.joining(", "));

        return CompletableFuture.completedFuture(deploymentInfo);
    }
}
```

## 작업 실행 {#executing-jobs}

Apache Ignite 컴퓨트 작업은 특정 노드나 임의 노드에서 실행하거나, 관련 데이터 키를 보유한 노드에서 실행하는 콜로케이션 방식으로 실행할 수 있습니다.

### 단일 노드 실행 {#single-node-execution}

클러스터의 한 노드에서 작업을 수행해야 하는 경우가 많습니다. 이때 작업 실행을 시작하는 방법은 여러 가지입니다.

- `submitAsync()` - 작업을 클러스터로 보내고, 작업이 실행을 위해 제출되면 `JobExecution` 객체로 완료되는 future를 반환합니다.
- `executeAsync()` - 작업을 클러스터로 보내고, 작업 실행 결과가 준비되면 완료되는 future를 반환합니다.
- `execute()` - 작업을 클러스터로 보내고 작업 실행 결과를 기다립니다.

<Tabs>
<TabItem value="java" label="Java">

```java
try (IgniteClient client = IgniteClient.builder()
        .addresses("127.0.0.1:10800")
        .build()
) {

    System.out.println("\nConfiguring compute job...");

    JobDescriptor<String, Void> job = JobDescriptor.builder(WordPrintJob.class)
            .units(new DeploymentUnit(DEPLOYMENT_UNIT_NAME, DEPLOYMENT_UNIT_VERSION))
            .build();

    JobTarget jobTarget = JobTarget.anyNode(client.clusterNodes());


    for (String word : "Print words using runnable".split(" ")) {

        System.out.println("\nExecuting compute job for word '" + word + "'...");

        client.compute().execute(jobTarget, job, word);
    }
}
```

</TabItem>
<TabItem value="dotnet" label=".NET">

```csharp
ICompute compute = Client.Compute;
IList<IClusterNode> nodes = await Client.GetClusterNodesAsync();

IJobExecution<string> execution = await compute.SubmitAsync(
JobTarget.AnyNode(nodes),
new JobDescriptor<string, string>("org.example.NodeNameJob"),
arg: "Hello");

string result = await execution.GetResultAsync();
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
using namespace ignite;

compute comp = client.get_compute();
std::vector<cluster_node> nodes = client.get_nodes();

// Unit `unitName:1.1.1` contains NodeNameJob class.
auto job_desc = job_descriptor::builder("org.company.package.NodeNameJob")
.deployment_units({deployment_unit{"unitName", "1.1.1"}})
.build();

job_execution execution = comp.submit(job_target::any_node(nodes), job_desc, {std::string("Hello")}, {});
std::string result = execution.get_result()->get<std::string>();
```

</TabItem>
</Tabs>

### 다중 노드 실행 {#multiple-node-execution}

여러 노드에서 컴퓨트 작업을 실행할 때는 단일 노드 실행과 동일한 메서드를 사용하되, 실행 노드를 지정하는 `JobTarget` 객체를 만드는 대신 `BroadcastJobTarget`을 사용하고 작업을 실행할 노드 목록을 지정합니다.

`BroadcastJobTarget` 객체는 다음을 지정할 수 있습니다.

- `BroadcastJobTarget.nodes()` - 목록에 있는 모든 노드에서 작업이 실행됩니다.
- `BroadcastJobTarget.table()` - 지정한 테이블의 파티션을 보유한 모든 노드에서 작업이 실행됩니다.

노드 목록을 설정하여 작업이 실행되는 노드를 제어할 수 있습니다.

<Tabs>
<TabItem value="java" label="Java">

```java
try (IgniteClient client = IgniteClient.builder()
        .addresses("127.0.0.1:10800")
        .build()
) {

    System.out.println("\nConfiguring compute job...");


    JobDescriptor<String, Void> job = JobDescriptor.builder(HelloMessageJob.class)
            .units(new DeploymentUnit(DEPLOYMENT_UNIT_NAME, DEPLOYMENT_UNIT_VERSION))
            .build();

    BroadcastJobTarget target = BroadcastJobTarget.nodes(client.cluster().nodes());


    System.out.println("\nExecuting compute job...");

    client.compute().execute(target, job, "John");

    System.out.println("\nCompute job executed...");
}
```

</TabItem>
<TabItem value="dotnet" label=".NET">

```csharp
ICompute compute = Client.Compute;
IList<IClusterNode> nodes = await Client.GetClusterNodesAsync();

IBroadcastExecution<string> execution = await compute.SubmitBroadcastAsync(
BroadcastJobTarget.Nodes(nodes),
new JobDescriptor<object, string>("org.example.NodeNameJob"),
arg: "Hello");

foreach (IJobExecution<string> jobExecution in execution.JobExecutions)
{
string jobResult = await jobExecution.GetResultAsync();
Console.WriteLine($"Job result from node {jobExecution.Node}: {jobResult}");
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
using namespace ignite;

compute comp = client.get_compute();
std::vector<cluster_node> nodes = client.get_nodes();

// Unit `unitName:1.1.1` contains NodeNameJob class.
auto job_desc = job_descriptor::builder("org.company.package.NodeNameJob")
.deployment_units({deployment_unit{"unitName", "1.1.1"}})
.build();

broadcast_execution execution = comp.submit_broadcast(broadcast_job_target::nodes(nodes), job_desc, {std::string("Hello")}, {});
for (auto &exec: execution.get_job_executions()) {
std::string result = exec.get_result()->get<std::string>();
}
```

</TabItem>
</Tabs>

### 콜로케이션 실행 {#colocated-execution}

Apache Ignite에서는 필요한 데이터를 보유한 노드에서 작업을 실행하도록 작업 대상을 지정하여 콜로케이션 연산을 실행할 수 있습니다.

아래 예시에서 작업은 기본 키 `accountNumber`로 식별되는 `accounts` 테이블 행의 파티션을 소유한 노드에서 실행됩니다.
노드를 선택하기 위해 `JobTarget.colocated()`에 키를 전달하고, 작업이 어떤 레코드를 읽어야 하는지 알 수 있도록
같은 키를 작업 인수로도 전달합니다.

<Tabs>
<TabItem value="java" label="Java">

```java
try (IgniteClient client = IgniteClient.builder()
        .addresses("127.0.0.1:10800")
        .build()) {

    System.out.println("\nConfiguring compute job...");

    JobDescriptor<Integer, Void> job = JobDescriptor.builder(PrintAccountInfoJob.class)
                    .units(new DeploymentUnit(DEPLOYMENT_UNIT_NAME, DEPLOYMENT_UNIT_VERSION))
                    .build();

    int accountNumber = ThreadLocalRandom.current().nextInt(ACCOUNTS_COUNT);

    JobTarget jobTarget = JobTarget.colocated("accounts", accountKey(accountNumber));
    client.compute().execute(jobTarget, job, accountNumber);
}
```

</TabItem>
<TabItem value="dotnet" label=".NET">

```csharp
string table = "Person";
string key = "John";

IJobExecution<string> execution = await Client.Compute.SubmitAsync(
JobTarget.Colocated(table, key),
new JobDescriptor<string, string>("org.example.NodeNameJob"),
arg: "Hello");

string result = await execution.GetResultAsync();
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
using namespace ignite;

compute comp = client.get_compute();
std::string table{"Person"};
std::string key{"John"};

// Unit `unitName:1.1.1` contains NodeNameJob class.
auto job_desc = job_descriptor::builder("org.company.package.NodeNameJob")
.deployment_units({deployment_unit{"unitName", "1.1.1"}})
.build();

job_execution execution = comp.submit(job_target::colocated(table, key), job_desc, {std::string("Hello")}, {});
std::string result = execution.get_result()->get<std::string>();
```

</TabItem>
</Tabs>

또는 `BroadcastJobTarget.table()` 대상을 만들어, 지정한 테이블의 파티션을 보유한 클러스터의 모든 노드에서 컴퓨트 작업을 실행할 수 있습니다. 이 경우 Apache Ignite는 지정한 테이블의 데이터 파티션을 보유한 모든 노드를 자동으로 찾아 그 노드 전부에서 작업을 실행합니다.

## 정규화된 테이블 이름 사용 {#using-qualified-table-names}

테이블 스키마를 지정하지 않으면 `PUBLIC` 스키마가 사용됩니다. 다른 스키마를 사용하려면 정규화된 테이블 이름을 지정하세요. 문자열로 제공하거나 `QualifiedName` 객체를 만들어 제공할 수 있습니다.

<Tabs>
<TabItem value="java" label="Java">

```java
QualifiedName myTableName = QualifiedName.parse("PUBLIC.MY_QUALIFIED_TABLE");
String executionResult = client.compute()
.execute(
JobTarget.colocated(myTableName, Tuple.create(Map.of("k", 1))),
JobDescriptor.builder(NodeNameJob.class).build(),
null
);
```

</TabItem>
<TabItem value="dotnet" label=".NET">

지원되지 않음

</TabItem>
<TabItem value="cpp" label="C++">

지원되지 않음

</TabItem>
</Tabs>

단일 노드 실행과 마찬가지로, `QualifiedName` 객체로 정규화된 테이블 이름을 지정하고 `BroadcastJobTarget`을 사용해 여러 노드에서 작업을 실행할 수 있습니다.

<Tabs>
<TabItem value="java" label="Java">

```java
QualifiedName customSchemaTable = QualifiedName.parse("CUSTOM_SCHEMA.MY_QUALIFIED_TABLE");

client.compute().execute(BroadcastJobTarget.table(customSchemaTable), JobDescriptor.builder(HelloMessageJob.class).build(), null);
```

</TabItem>
</Tabs>

또는 `of` 메서드를 사용해 테이블 이름과 스키마를 따로 지정할 수도 있습니다.

<Tabs>
<TabItem value="java" label="Java">

```java
QualifiedName customSchemaTableName = QualifiedName.of("PUBLIC", "MY_TABLE");

client.compute().execute(BroadcastJobTarget.table(customSchemaTableName), JobDescriptor.builder(HelloMessageJob.class).build(), null);
```

</TabItem>
</Tabs>

제공하는 이름은 SQL의 식별자 구문 규칙을 따라야 합니다.

- 식별자는 "Lu", "Ll", "Lt", "Lm", "Lo", "Nl" 유니코드 범주에 속하는 문자로 시작해야 합니다.
- 식별자 문자(첫 번째 문자 제외)는 `U+00B7`(가운뎃점), `U+0331`(밑줄), 또는 "Mn", "Mc", "Nd", "Pc", "Cf" 유니코드 범주에 속하는 문자일 수 있습니다.
- 그 밖의 문자를 포함하는 식별자는 큰따옴표로 감싸야 합니다.
- 식별자 안의 큰따옴표는 큰따옴표 2개로 표기해야 합니다.

따옴표로 감싸지 않은 이름은 모두 대문자로 변환됩니다. 이 경우 `Person`과 `PERSON` 이름은 동일합니다. 이를 피하려면 이름을 이스케이프된 따옴표로 감싸세요. 예를 들어 `\"Person\"`은 대소문자를 구분하는 `Person` 이름으로 인코딩됩니다. 이름에 `U+2033`(큰따옴표) 기호가 포함되면 `""`(큰따옴표 기호 2개)로 이스케이프해야 합니다.

## .NET 컴퓨트 작업 {#net-compute-jobs}

.NET으로 작성한 컴퓨트 작업을 다룰 때는, 결과 바이너리(DLL 파일)를 서버 노드에 배포하고 어셈블리 정규화된 타입 이름으로 호출해야 합니다. 배포 단위 조합마다 별도의 [AssemblyLoadContext](https://learn.microsoft.com/en-us/dotnet/core/dependency-loading/understanding-assemblyloadcontext)로 로드됩니다.

Apache Ignite는 배포 단위 격리를 지원하므로, 같은 작업(어셈블리)의 여러 버전을 클러스터에 배포할 수 있습니다. 하나의 작업은 여러 배포 단위로 구성될 수 있습니다. 어셈블리와 타입은 나열한 순서대로 조회됩니다.

:::note
.NET 컴퓨트 작업은 서버 노드에서 별도 프로세스([Sidecar](https://learn.microsoft.com/en-us/azure/architecture/patterns/sidecar))로 실행됩니다. 이 프로세스는 첫 .NET 작업 호출 시 시작되어 이후 작업에 재사용됩니다.
:::

컴퓨트 작업 클래스는 `IDisposable`과 `IAsyncDisposable` 인터페이스를 구현할 수 있습니다. Apache Ignite는 작업 실행이 성공하든 실패하든 실행 후 `Dispose` 또는 `DisposeAsync`를 호출합니다.

### .NET 컴퓨트 요구 사항 {#net-compute-requirements}

* 각 서버 노드에 .NET 8 런타임 이상(SDK 아님)이 필요합니다.
* ZIP, DEB, RPM 설치를 사용할 때는 .NET 런타임을 직접 설치해야 합니다. Apache Ignite Docker 이미지에는 .NET 8 런타임이 포함되어 있어, Docker에서는 별도 설정 없이 .NET 작업을 실행할 수 있습니다.

### .NET 컴퓨트 작업 구현 {#implementing-net-compute-jobs}

다음은 .NET 컴퓨트 작업을 구현하는 예시입니다.

1. 먼저 `dotnet new classlib`로 작업 구현을 위한 "클래스 라이브러리" 프로젝트를 준비합니다.

   :::tip
   대부분의 경우 배포 크기를 줄이기 위해 컴퓨트 작업에는 별도 프로젝트를 사용하는 것이 좋습니다.
   :::

   ```bash
   dotnet new classlib -n MyComputeJobs
   cd MyComputeJobs
   dotnet add package Apache.Ignite
   ```

2. 클래스 라이브러리 프로젝트에 `Apache.Ignite` 패키지 참조를 추가합니다.

   ```bash
   dotnet add package Apache.Ignite
   ```

3. 그런 다음 `IComputeJob<TArg, TRes>` 인터페이스를 구현하는 클래스를 만듭니다. 예를 들면 다음과 같습니다.

   ```csharp
   public class HelloJob : IComputeJob<string, string>
   {
   public ValueTask<string> ExecuteAsync(IJobExecutionContext context, string arg, CancellationToken cancellationToken) =>
   ValueTask.FromResult("Hello " + arg);
   }
   ```

4. `dotnet publish -c Release` 명령어로 프로젝트를 게시합니다.

   ```bash
   dotnet publish -c Release
   mkdir deploy
   cp bin/Release/net8.0/MyComputeJobs.dll deploy/
   # Exclude Ignite assemblies; no subdirectories allowed
   ignite cluster unit deploy --name MyDotNetJobsUnit --path ./deploy
   ```

5. 결과 dll 파일과 추가 의존성을 Apache Ignite dll을 **제외하고** 별도 디렉터리로 복사합니다.

   :::note
   dll이 있는 디렉터리에는 하위 디렉터리가 없어야 합니다.
   :::

6. Apache Ignite CLI 명령어 `cluster unit deploy command`를 사용해 디렉터리를 배포 단위로 클러스터에 [배포](./code-deployment)합니다. 배포된 코드는 클러스터에서 사용할 수 있습니다.

### .NET 컴퓨트 작업 실행 {#running-net-compute-jobs}

어셈블리 정규화된 작업 클래스 이름으로 `JobDescriptor`를 만들고 `JobExecutionOptions`에 `JobExecutorType.DotNetSidecar`를 설정하면, 모든 클라이언트(.NET, Java, C++ 등)에서 .NET 컴퓨트 작업을 실행할 수 있습니다.

- 예를 들어, .NET에서 단일 노드에 작업을 실행하는 방법은 다음과 같습니다.

  ```csharp
  var jobTarget = JobTarget.AnyNode(await client.GetClusterNodesAsync());
  var jobDesc = new JobDescriptor<string, string>(
  JobClassName: typeof(HelloJob).AssemblyQualifiedName!,
  DeploymentUnits: [new DeploymentUnit("MyDeploymentUnit")],
  Options: new JobExecutionOptions(ExecutorType: JobExecutorType.DotNetSidecar));

  IJobExecution<string> jobExec = await client.Compute.SubmitAsync(jobTarget, jobDesc, "world");
  ```

  또는 `JobDescriptor.Of` 단축 메서드를 사용해 작업 인스턴스에서 작업 디스크립터를 만들 수 있습니다.

  ```csharp
  JobDescriptor<string, string> jobDesc = JobDescriptor.Of(new HelloJob())
  with { DeploymentUnits = [new DeploymentUnit("MyDeploymentUnit")] };
  ```

- .NET 코드에서 [Java 컴퓨트 작업](./compute)을 호출할 수 있습니다. 예를 들면 다음과 같습니다.

  ```csharp
  IList<IClusterNode> nodes = await client.GetClusterNodesAsync();
  IJobTarget<IEnumerable<IClusterNode>> jobTarget = JobTarget.AnyNode(nodes);

  var jobDesc = new JobDescriptor<string, string>(JobClassName: "org.foo.bar.MyJob", DeploymentUnits: [new DeploymentUnit("MyDeploymentUnit")]);

  IJobExecution<string> jobExecution = await client.Compute.SubmitAsync(jobTarget, jobDesc, "Job Arg");

  string jobResult = await jobExecution.GetResultAsync();
  ```

- Java 클라이언트에서 .NET 컴퓨트 작업을 실행할 수도 있습니다. 예를 들면 다음과 같습니다.

  ```java
  try (IgniteClient client = IgniteClient.builder().addresses("127.0.0.1:10800")
  .build()
  ) {

  JobDescriptor<String, String> jobDesc = JobDescriptor.<String, String>builder().jobClassName("MyNamespace.HelloJob, MyComputeJobsAssembly").deploymentUnits(new DeploymentUnit("MyDeploymentUnit")).executionOptions(new JobExecutionOptions().executorType(JobExecutorType.DotNetSidecar)).build();

  JobTarget jobTarget = JobTarget.anyNode(client.clusterNodes());
  for (String word : "Print words using runnable".split(" ")) {

      System.out.println("\nExecuting compute job for word '" + word + "'...");

      client.compute().execute(jobTarget, job, word);
      }
  }
  ```

## 작업 소유권 {#job-ownership}

클러스터에 [인증](/configure-and-operate/configuration/config-authentication)이 활성화되어 있으면 컴퓨트 작업은 특정 사용자로 실행됩니다. 클러스터에 사용자 권한이 구성되어 있으면, 분산 컴퓨트 작업을 다루려면 해당 사용자에게 적절한 [분산 컴퓨트 권한](/configure-and-operate/configuration/config-cluster-security)이 필요합니다. `JOBS_ADMIN` 액션을 가진 사용자만 다른 사용자의 작업을 다룰 수 있습니다.

## 작업 실행 상태 {#job-execution-states}

비동기 API를 사용하면 서버에서 작업 상태를 추적하고 상태 변화에 대응할 수 있습니다. 예를 들면 다음과 같습니다.

<Tabs>
<TabItem value="java" label="Java">

```java
public static void example() throws ExecutionException, InterruptedException {
IgniteClient client = IgniteClient.builder().addresses("127.0.0.1:10800").build();

CompletableFuture<JobExecution<Void>> execution = client.compute().submitAsync(JobTarget.anyNode(client.cluster().nodes()), JobDescriptor.builder(WordPrintJob.class).build(), null);

execution.get().stateAsync().thenApply(state -> {
                if (state.status() == FAILED) {
                    System.out.println("\nJob failed...");
                }
                return null;
            });
            System.out.println(execution.resultAsync().get());
}
```

</TabItem>
<TabItem value="dotnet" label=".NET">

```csharp
IList<IClusterNode> nodes = await Client.GetClusterNodesAsync();

IJobExecution<string> execution = await Client.Compute.SubmitAsync(
    JobTarget.AnyNode(nodes),
    new JobDescriptor<string, string>("org.example.NodeNameJob"),
    arg: "Hello");

JobState? state = await execution.GetStateAsync();

if (state?.Status == JobStatus.Failed)
{
    // Handle failure
}

string result = await execution.GetResultAsync();
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
using namespace ignite;

compute comp = client.get_compute();
std::vector<cluster_node> nodes = client.get_nodes();

// Unit `unitName:1.1.1` contains NodeNameJob class.
auto job_desc = job_descriptor::builder("org.company.package.NodeNameJob")
	.deployment_units({deployment_unit{"unitName", "1.1.1"}})
	.build();

job_execution execution = comp.submit(job_target::any_node(nodes), job_desc, {std::string("Hello")}, {});

std::optional<job_status> status = execution.get_status();
if (status && status->state == job_state::FAILED)
{
    // Handle failure
}
std::string result = execution.get_result()->get<std::string>();
```

</TabItem>
</Tabs>

### 가능한 상태와 전환 {#possible-states-and-transitions}

아래 다이어그램은 작업 상태의 가능한 전환을 나타냅니다.

![컴퓨트 작업 상태](/img/compute_job_statuses.png)

아래 표는 가능한 작업 상태를 나열합니다.

| 상태 | 설명 | 전환 대상 |
|--------|-------------|----------------|
| `Queued` | 작업이 큐에 추가되어 실행을 기다리고 있습니다. | `Executing`, `Canceled` |
| `Executing` | 작업이 실행되고 있습니다. | `Canceling`, `Completed`, `Queued` |
| `Completed` | 작업이 성공적으로 실행되어 실행 결과가 반환되었습니다. | |
| `Failed` | 작업이 실행 중 예기치 않게 종료되었습니다. | `Queued` |
| `Canceling` | 작업이 취소 명령을 받았지만 아직 실행 중입니다. | `Completed`, `Canceled` |
| `Canceled` | 작업이 성공적으로 취소되었습니다. | |

모든 작업 실행 스레드가 사용 중이면, 노드가 받은 새 작업은 [작업 우선순위](#job-priority)에 따라 작업 큐에 들어갑니다. Apache Ignite는 들어오는 모든 작업을 먼저 우선순위로, 그다음 시간순으로 정렬하여 먼저 큐에 들어온 작업을 먼저 실행합니다.

### 실행 중인 작업 취소 {#cancelling-executing-jobs}

노드가 `Executing` 상태인 작업을 취소하라는 명령을 받으면, 해당 작업을 담당하는 스레드에 즉시 인터럽트를 보냅니다. 대부분의 경우 작업이 즉시 취소되지만, 작업이 계속되는 경우도 있습니다. 이때 작업은 `Canceling` 상태가 됩니다. 실행 중인 코드에 따라 작업은 성공적으로 완료되거나, 중단할 수 없는 연산이 끝난 뒤 취소되거나, 완료되지 않은 상태로 남을 수 있습니다(예: 코드가 루프에 갇힌 경우). `JobExecution.stateAsync()` 메서드로 작업이 어떤 상태인지 추적하고 상태 변화에 대응할 수 있습니다.

컴퓨트 작업을 취소하려면, 먼저 취소 핸들러를 만들고 거기서 토큰을 가져옵니다. 그런 다음 이 토큰으로 컴퓨트 작업을 취소할 수 있습니다.

<Tabs>
<TabItem value="java" label="Java">

```java
CancelHandle cancelHandle = CancelHandle.create();
CancellationToken cancelToken = cancelHandle.token();

CompletableFuture<Void> execution = client.compute().executeAsync(JobTarget.anyNode(client.clusterNodes()), JobDescriptor.builder(NodeNameJob.class).build(), cancelToken, null);

cancelHandle.cancel();
```

</TabItem>
<TabItem value="dotnet" label=".NET">

```csharp
var cts = new CancellationTokenSource();
CancellationToken cancelToken = cts.Token;

var execution = client.Compute.ExecuteAsync(
JobTarget.AnyNode(await client.GetClusterNodesAsync()),
new JobDescriptor(typeof(NodeNameJob)),
cancelToken);

cts.Cancel();
```

</TabItem>
</Tabs>

작업을 취소하는 또 다른 방법은 SQL [KILL COMPUTE](/sql/reference/data-types-and-functions/operational-commands#kill-compute) 명령어를 사용하는 것입니다. 작업 id는 `COMPUTE_JOBS` [시스템 뷰](/configure-and-operate/monitoring/metrics-system-views)로 가져올 수 있습니다.

### 작업 우선순위 {#job-priority}

`JobExecutionOptions.priority` 속성을 설정하여 작업 우선순위를 지정할 수 있습니다. 우선순위가 높은 작업은 낮은 작업보다 먼저 큐에 배치됩니다(예: 우선순위 4인 작업이 우선순위 2인 작업보다 먼저 실행됩니다).

<Tabs>
<TabItem value="java" label="Java">

```java
public static void example() throws ExecutionException, InterruptedException {
try (IgniteClient client = IgniteClient.builder().addresses("127.0.0.1:10800").build()) {

    // Create job execution options
    JobExecutionOptions options = JobExecutionOptions.builder().priority(1).build();

    String executionResult = client.compute().execute(JobTarget.anyNode(client.cluster().nodes()),
            JobDescriptor.builder(HighPriorityJob.class).options(options).build(), null
    );

    System.out.println(executionResult);
    }
}
```

</TabItem>
<TabItem value="dotnet" label=".NET">

```csharp
var options = JobExecutionOptions.Default with { Priority = 1 };

IJobExecution<string> execution = await Client.Compute.SubmitAsync(
    JobTarget.AnyNode(await Client.GetClusterNodesAsync()),
    new JobDescriptor<string, string>("org.example.NodeNameJob", Options: options),
    arg: "Hello");

string result = await execution.GetResultAsync();
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
using namespace ignite;

compute comp = client.get_compute();
std::vector<cluster_node> nodes = client.get_nodes();

// Unit `unitName:1.1.1` contains NodeNameJob class.
auto job_desc = job_descriptor::builder("org.company.package.NodeNameJob")
	.deployment_units({deployment_unit{"unitName", "1.1.1"}})
	.build();

job_execution_options options{1, 0};
job_execution execution = comp.submit(job_target::any_node(nodes), job_desc, {std::string("Hello")}, std::move(options));
std::string result = execution.get_result()->get<std::string>();
```

</TabItem>
</Tabs>

### 작업 재시도 {#job-retries}

`JobExecutionOptions.maxRetries` 속성을 설정하여 작업이 실패 시 재시도되는 횟수를 지정할 수 있습니다. 설정하면 실패한 작업은 `Failed` 상태로 넘어가기 전에 지정한 횟수만큼 재시도됩니다.

<Tabs>
<TabItem value="java" label="Java">

```java
public static void example() throws ExecutionException, InterruptedException {
try (IgniteClient client = IgniteClient.builder().addresses("127.0.0.1:10800").build()) {

   // Create job execution options with maxRetries set to 5.
    JobExecutionOptions options = JobExecutionOptions.builder()
                                                          .maxRetries(5)
                                                          .build();

    String executionResult = client.compute().execute(JobTarget.anyNode(client.clusterNodes()),
            JobDescriptor.builder(NodeNameJob.class).options(options).build(), null
    );

    System.out.println(executionResult);
    }
}
```

</TabItem>
<TabItem value="dotnet" label=".NET">

```csharp
var options = JobExecutionOptions.Default with { MaxRetries = 5 };

IJobExecution<string> execution = await Client.Compute.SubmitAsync(
    JobTarget.AnyNode(await Client.GetClusterNodesAsync()),
    new JobDescriptor<string, string>("org.example.NodeNameJob", Options: options),
    arg: "Hello");

string result = await execution.GetResultAsync();
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
using namespace ignite;

compute comp = client.get_compute();
std::vector<cluster_node> nodes = client.get_nodes();

// Unit `unitName:1.1.1` contains NodeNameJob class.
std::vector<deployment_unit> units{deployment_unit{"unitName", "1.1.1"}};

job_execution_options options{0, 5};
job_execution execution = comp.submit(nodes, units, NODE_NAME_JOB, {std::string("Hello")}, std::move(options));
std::string result = execution.get_result()->get<std::string>();
```

</TabItem>
</Tabs>

## 작업 장애 조치 {#job-failover}

Apache Ignite는 작업 실행 중 발생하는 문제를 처리하는 메커니즘을 구현합니다. 다음 상황이 처리됩니다.

### 워커 노드 종료 {#worker-node-shutdown}

워커 노드가 종료되면, 코디네이터 노드는 워커에 배정된 모든 작업을 다른 사용 가능한 노드로 재분배합니다. 사용 가능한 노드가 없으면 작업이 실패하고 클라이언트로 예외가 전송됩니다.

### 코디네이터 노드 종료 {#coordinator-node-shutdown}

코디네이터 노드가 종료되면, 노드가 코디네이터의 종료를 감지하는 즉시 모든 작업이 취소됩니다. [일부 작업](#cancelling-executing-jobs)은 취소되는 데 오래 걸릴 수 있습니다.

### 클라이언트 연결 해제 {#client-disconnect}

클라이언트 연결이 끊기면, 코디네이터 노드가 연결 해제를 감지하는 즉시 모든 작업이 취소됩니다. [일부 작업](#cancelling-executing-jobs)은 취소되는 데 오래 걸릴 수 있습니다.

## 맵리듀스 태스크 {#mapreduce-tasks}

Apache Ignite는 클러스터에서 맵리듀스 연산을 수행하는 API를 제공합니다. 이렇게 하면 컴퓨트 작업을 여러 노드로 나눈 뒤 결과를 집계하여 사용자에게 반환합니다.

### 맵리듀스 태스크 이해하기 {#understanding-mapreduce-tasks}

맵리듀스 태스크는 `MapReduceTask` 인터페이스를 구현한 클래스가 [배포](./code-deployment)된 노드에서 실행해야 합니다. 이 인터페이스는 사용자 정의 map·reduce 로직을 구현하는 방법을 제공합니다. 태스크를 받은 노드는 코디네이터 노드가 되며, 다른 노드에 작업을 매핑하고 그 결과를 리듀스하여 최종 결과를 클라이언트에 반환하는 일을 모두 담당합니다.

클래스는 두 메서드 `splitAsync`와 `reduceAsync`를 구현해야 합니다.

`splitAsync()` 메서드는 입력 매개변수를 바탕으로 컴퓨트 작업을 만들어 워커 노드에 매핑하도록 구현해야 합니다. 이 메서드는 실행 컨텍스트와 태스크 인수를 받아, 워커 노드로 전송될 작업 디스크립터 목록을 담은 completable future를 반환합니다.

`reduceAsync()` 메서드는 모든 작업이 완료된 뒤 reduce 단계에서 호출됩니다. 이 메서드는 각 워커 노드와 완료된 작업 결과를 대응시킨 맵을 받아 연산의 최종 결과를 반환합니다.

### 매퍼 클래스 만들기 {#creating-a-mapper-class}

모든 맵리듀스 작업은 적절한 클래스가 [배포](./code-deployment)된 노드에 제출해야 합니다. 다음은 맵리듀스 작업의 예시입니다.

<Tabs>
<TabItem value="java" label="Java">

```java
public static class PhraseWordLengthCountMapReduceTask implements MapReduceTask<String, String, Integer, Integer> {
    /** {@inheritDoc} */
    @Override
    public CompletableFuture<List<MapReduceJob<String, Integer>>> splitAsync(
            TaskExecutionContext taskContext,
            String input) {
        assert input != null;

        var job = JobDescriptor.builder(WordLengthJob.class)
                .units(new DeploymentUnit(DEPLOYMENT_UNIT_NAME, DEPLOYMENT_UNIT_VERSION))
                .build();

        List<MapReduceJob<String, Integer>> jobs = new ArrayList<>();

        for (String word : input.split(" ")) {
            jobs.add(
                    MapReduceJob.<String, Integer>builder()
                            .jobDescriptor(job)
                            .nodes(taskContext.ignite().cluster().nodes())
                            .args(word)
                            .build()
            );
        }

        return completedFuture(jobs);
    }

    /** {@inheritDoc} */
    @Override
    public CompletableFuture<Integer> reduceAsync(TaskExecutionContext taskContext, Map<UUID, Integer> results) {
        return completedFuture(results.values().stream()
                .reduce(Integer::sum)
                .orElseThrow());
    }
}
```

</TabItem>
</Tabs>

### 맵리듀스 태스크 실행 {#executing-a-mapreduce-task}

맵리듀스 태스크를 실행하려면 다음 메서드 중 하나를 사용합니다.

- `submitMapReduce()` - 맵리듀스 작업을 클러스터로 보내고, 컴퓨트 작업 실행을 모니터링하거나 수정하는 데 사용할 수 있는 `TaskExecution` 객체를 반환합니다.
- `executeMapReduceAsync()` - 맵리듀스 작업을 클러스터로 보내고 작업 실행 결과에 대한 future를 가져옵니다.
- `executeMapReduce()` - 작업을 클러스터로 보내고 작업 실행 결과를 기다립니다.

맵리듀스 태스크를 보내는 노드에는 `MapReduceTask` 인터페이스를 구현한 클래스가 있어야 합니다.

<Tabs>
<TabItem value="java" label="Java">

```java
try (IgniteClient client = IgniteClient.builder().addresses("127.0.0.1:10800").build()) {

    System.out.println("\nConfiguring map reduce task...");


    TaskDescriptor<String, Integer> taskDescriptor = TaskDescriptor.builder(PhraseWordLengthCountMapReduceTask.class)
            .units(new DeploymentUnit(DEPLOYMENT_UNIT_NAME, DEPLOYMENT_UNIT_VERSION))
            .build();


    System.out.println("\nExecuting map reduce task...");

    String phrase = "Count characters using map reduce";

    Integer result = client.compute().executeMapReduce(taskDescriptor, phrase);


    System.out.println("\nTotal number of characters in the words is '" + result + "'.");
}
```

</TabItem>
<TabItem value="dotnet" label=".NET">

```csharp
ICompute compute = Client.Compute;
var taskDescriptor = new TaskDescriptor<string, string>("com.example.MapReduceNodeNameTask");
ITaskExecution<string> exec = await compute.SubmitMapReduceAsync(taskDescriptor, "arg");
string result = await exec.GetResultAsync();
Console.WriteLine(result);
```

</TabItem>
<TabItem value="cpp" label="C++">

지원되지 않음

</TabItem>
</Tabs>
