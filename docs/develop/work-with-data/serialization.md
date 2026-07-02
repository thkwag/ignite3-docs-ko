---
id: serialization
title: 객체 직렬화
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Apache Ignite는 Java 객체와 타입을 직렬화해 서버와 클라이언트 사이에서 데이터를 주고받는 방법을 제공합니다.

## 네이티브 타입 {#native-types}

Apache Ignite는 네이티브 타입 직렬화를 자동으로 처리합니다. 예를 들어 다음 컴퓨트 작업은 Integer를 받아 Integer를 반환합니다:

```java
class IntegerComputeJob implements ComputeJob<Integer, Integer> {
    @Override
    public @Nullable CompletableFuture<Integer> executeAsync(
        JobExecutionContext context, @Nullable Integer arg
    ) {
        return completedFuture(arg - 1);
    }
}
```

인수와 결과가 모두 네이티브 타입이라 자동으로 직렬화되므로, 직렬화를 처리하는 추가 코드가 필요하지 않습니다:

<Tabs>
<TabItem value="java" label="Java">

```java
try (IgniteClient client = IgniteClient.builder().addresses("address/to/cluster:port").build()) {
Integer result = client.compute().execute(
JobTarget.anyNode(client.clusterNodes()),
JobDescriptor.builder(IntegerComputeJob.class).build(),
1
);
}
```

</TabItem>
<TabItem value="dotnet" label=".NET">

```csharp
using var client = await IgniteClient.StartAsync(
    new IgniteClientConfiguration("address/to/cluster:port"));

IJobExecution<int> jobExec = await client.Compute.SubmitAsync(
    JobTarget.AnyNode(await client.GetClusterNodesAsync()),
    new JobDescriptor<int, int>("org.example.IntegerComputeJob"),
    1);

int result = await jobExec.GetResultAsync();
```

</TabItem>
</Tabs>

## 튜플 {#tuples}

Apache Ignite는 튜플을 중심으로 설계되었으며, 튜플 직렬화를 자동으로 처리합니다. 예를 들어 다음 작업은 Tuple을 받아 Tuple을 반환합니다:

```java
class TupleComputeJob implements ComputeJob<Tuple, Tuple> {
    @Override
    public @Nullable CompletableFuture<Tuple> executeAsync(JobExecutionContext context, @Nullable Tuple arg) {
        Tuple resultTuple = Tuple.copy(arg);
        resultTuple.set("col", "new value");

        return completedFuture(resultTuple);
    }
}
```

인수와 결과가 모두 튜플이라 자동으로 직렬화되므로, 직렬화를 직접 처리할 필요가 없습니다:

<Tabs>
<TabItem value="java" label="Java">

```java
try (IgniteClient client = IgniteClient.builder().addresses("address/to/cluster:port").build()) {
Tuple resultTuple = client.compute().execute(
JobTarget.anyNode(client.clusterNodes()),
JobDescriptor.builder(TupleComputeJob.class).build(),
Tuple.create().set("col", "value")
);
}
```

</TabItem>
<TabItem value="dotnet" label=".NET">

```csharp
using var client = await IgniteClient.StartAsync(
    new IgniteClientConfiguration("address/to/cluster:port"));

IJobExecution<IIgniteTuple> jobExec = await client.Compute.SubmitAsync(
    JobTarget.AnyNode(await client.GetClusterNodesAsync()),
    new JobDescriptor<IIgniteTuple, IIgniteTuple>("org.example.TupleComputeJob"),
    new IgniteTuple { ["col"] = "value" });

IIgniteTuple result = await jobExec.GetResultAsync();
```

</TabItem>
</Tabs>

## 사용자 객체 {#user-objects}

사용자 객체는 다음과 같은 방식으로 자동으로 마샬링됩니다:

- 사용자 정의 마샬러가 정의되어 있으면 해당 마샬러를 사용합니다.
- 마샬러가 정의되어 있지 않으면 사용자 Java 객체는 바이너리 튜플로 마샬링됩니다.
- 중첩 객체가 있으면 재귀적으로 튜플로 마샬링됩니다.

아래는 사용자 정의 로직으로 사용자 객체를 마샬링하는 예시입니다(여기서는 `ObjectMapper`로 JSON 직렬화를 사용하지만, 사용 사례에 맞다고 판단하는 방식은 무엇이든 사용할 수 있습니다).

먼저 같은 배포 단위에 포함되어야 하는 컴퓨트 작업 정의부터 시작합니다.

### 서버 측 {#server-side}

아래 코드는 서버에서 마샬링을 처리해 클라이언트로 데이터를 올바르게 보내고 응답을 받는 방법을 보여줍니다:

- 다음은 작업의 인수로 사용할 사용자 정의 객체입니다:

  ```java
  class ArgumentCustomServerObject {
      int arg1;
      String arg2;
  }
  ```

- `ObjectMapper` 객체를 사용해 이 객체의 마샬러를 정의해야 합니다:

  ```java
  final ObjectMapper MAPPER = new ObjectMapper();

  class ArgumentCustomServerObjectMarshaller implements Marshaller<ArgumentCustomServerObject, byte[]> {
      @Override
      public byte @Nullable [] marshal(@Nullable ArgumentCustomServerObject object) throws UnsupportedObjectTypeMarshallingException {
          try {
              return MAPPER.writeValueAsBytes(object);
          } catch (JsonProcessingException e) {
              throw new RuntimeException(e);
          }
      }

      @Override
      public @Nullable ArgumentCustomServerObject unmarshal(byte @Nullable [] raw) throws UnsupportedObjectTypeMarshallingException {
          try {
              return MAPPER.readValue(raw, ArgumentCustomServerObject.class);
          } catch (IOException e) {
              throw new RuntimeException(e);
          }
      }
  }
  ```

- 컴퓨트 작업 결과를 저장할 또 다른 객체와 그에 대응하는 마샬러도 만들어 봅니다:

  ```java
  class ResultCustomServerObject {
      int res1;
      String res2;
      long res3;
  }

  class ResultCustomServerObjectMarshaller implements Marshaller<ResultCustomServerObject, byte[]> {
      @Override
      public byte @Nullable [] marshal(@Nullable ResultCustomServerObject object) throws UnsupportedObjectTypeMarshallingException {
          try {
              return MAPPER.writeValueAsBytes(object);
          } catch (JsonProcessingException e) {
              throw new RuntimeException(e);
          }
      }

      @Override
      public @Nullable ResultCustomServerObject unmarshal(byte @Nullable [] raw) throws UnsupportedObjectTypeMarshallingException {
          try {
              return MAPPER.readValue(raw, ResultCustomServerObject.class);
          } catch (IOException e) {
              throw new RuntimeException(e);
          }
      }
  }
  ```

위 마샬러들은 해당 객체를 `byte[]`로 표현하는 방법과 `byte[]`에서 이 객체를 읽는 방법을 정의합니다. 하지만 이 클래스들을 정의하는 것만으로는 사용자 정의 직렬화가 활성화되지 않습니다. 객체를 직렬화할 때 사용할 마샬러를 지정해야 하기 때문입니다. Apache Ignite에서는 컴퓨트 작업 정의의 두 메서드를 재정의해 마샬러의 팩토리 메서드로 사용함으로써 이를 처리합니다:

아래 코드는 컴퓨트 작업에서 마샬러를 구현하는 예시를 보여줍니다:

```java
class PojoComputeJob implements ComputeJob<ArgumentCustomServerObject, ResultCustomServerObject> {

    @Override
    public @Nullable CompletableFuture<ResultCustomServerObject> executeAsync(
        JobExecutionContext context,
        @Nullable ArgumentCustomServerObject arg
    ) {
        ResultCustomServerObject res = new ResultCustomServerObject();
        res.res1 = arg.arg1;
        res.res2 = arg.arg2;
        res.res3 = 1;

        return completedFuture(res);
    }

    @Override
    public Marshaller<ArgumentCustomServerObject, byte[]> inputMarshaller() {
        return new ArgumentCustomServerObjectMarshaller();
    }

    @Override
    public Marshaller<ResultCustomServerObject, byte[]> resultMarshaller() {
        return new ResultCustomServerObjectMarshaller();
    }
}
```

이렇게 하면 Apache Ignite 서버가 클라이언트로 보낼 객체를 마샬링하고 클라이언트 응답을 언마샬링할 수 있습니다.

### 클라이언트 측 {#client-side}

클라이언트 측에서도 들어오는 객체를 처리하고 응답을 마샬링하려면 거의 같은 코드가 필요합니다:

- 컴퓨트 작업에 사용할 사용자 정의 객체를 정의하세요:

  <Tabs>
  <TabItem value="java" label="Java">

  ```java
  class ArgumentCustomClientObject {
  int arg1;
  String arg2;
  }
  ```

  </TabItem>
  <TabItem value="dotnet" label=".NET">

  ```csharp
  record ArgumentCustomClientObject(int arg1, string arg2);
  ```

  </TabItem>
  </Tabs>

- 객체의 마샬러를 정의하세요:

  <Tabs>
  <TabItem value="java" label="Java">

  ```java
  final ObjectMapper MAPPER = new ObjectMapper();

  class ArgumentCustomClientObjectMarshaller implements Marshaller<ArgumentCustomClientObject, byte[]> {
  @Override
  public byte @Nullable [] marshal(@Nullable ArgumentCustomClientObject object) throws UnsupportedObjectTypeMarshallingException {
  try {
  return MAPPER.writeValueAsBytes(object);
  } catch (JsonProcessingException e) {
  throw new RuntimeException(e);
  }
  }

      @Override
      public @Nullable ArgumentCustomClientObject unmarshal(byte @Nullable [] raw) throws UnsupportedObjectTypeMarshallingException {
          try {
              return MAPPER.readValue(raw, ArgumentCustomClientObject.class);
          } catch (IOException e) {
              throw new RuntimeException(e);
          }
      }
  }
  ```

  </TabItem>
  <TabItem value="dotnet" label=".NET">

  ```csharp
  class MyJsonMarshaller<T> : IMarshaller<T>
  {
      public void Marshal(T obj, IBufferWriter<byte> writer)
      {
          using var utf8JsonWriter = new Utf8JsonWriter(writer);
          JsonSerializer.Serialize(utf8JsonWriter, obj);
      }

      public T Unmarshal(ReadOnlySpan<byte> bytes) =>
          JsonSerializer.Deserialize<T>(bytes)!;
  }
  ```

  </TabItem>
  </Tabs>

- 결과 객체에도 같은 작업을 하세요:

  <Tabs>
  <TabItem value="java" label="Java">

  ```java
  class ResultCustomClientObject {
  int res1;
  String res2;
  long res3;
  }


  class ResultCustomClientObjectMarshaller implements Marshaller<ResultCustomClientObject, byte[]> {
  @Override
  public byte @Nullable [] marshal(@Nullable ResultCustomClientObject object) throws UnsupportedObjectTypeMarshallingException {
  try {
  return MAPPER.writeValueAsBytes(object);
  } catch (JsonProcessingException e) {
  throw new RuntimeException(e);
  }
  }

      @Override
      public @Nullable ResultCustomClientObject unmarshal(byte @Nullable [] raw) throws UnsupportedObjectTypeMarshallingException {
          try {
              return MAPPER.readValue(raw, ResultCustomClientObject.class);
          } catch (IOException e) {
              throw new RuntimeException(e);
          }
      }
  }

  // ....
  ```

  </TabItem>
  <TabItem value="dotnet" label=".NET">

  ```csharp
  record ResultCustomClientObject(int res1, string res2, long res3);

  // Use the same generic MyJsonMarshaller class (see above) for the result object.
  ```

  </TabItem>
  </Tabs>

이제 모든 마샬러가 정의되었으니, 사용자 정의 객체를 다루고 컴퓨트 작업에서 인수와 결과의 마샬링을 처리할 수 있습니다:

<Tabs>
<TabItem value="java" label="Java">

```java
try (IgniteClient client = IgniteClient.builder().addresses("address/to/cluster:port").build()) {
// Marshalling example of pojo.
ResultCustomClientObject resultPojo = client.compute().execute(
JobTarget.anyNode(client.clusterNodes()),
JobDescriptor.<ArgumentCustomClientObject, ResultCustomClientObject>builder(PojoComputeJob.class.getName())
.argumentMarshaller(new ArgumentCustomClientObjectMarshaller())
.resultMarshaller(new ResultCustomClientObjectMarshaller())
.build(),
new ArgumentCustomClientObject()
);
}
```

</TabItem>
<TabItem value="dotnet" label=".NET">

```csharp
using var client = await IgniteClient.StartAsync(
new IgniteClientConfiguration("address/to/cluster:port"));

IJobExecution<ResultCustomClientObject> jobExec = await client.Compute.SubmitAsync(
JobTarget.AnyNode(await client.GetClusterNodesAsync()),
new JobDescriptor<ArgumentCustomClientObject, ResultCustomClientObject>("org.example.PojoComputeJob")
{
ArgMarshaller = new MyJsonMarshaller<ArgumentCustomClientObject>(),
ResultMarshaller = new MyJsonMarshaller<ResultCustomClientObject>()
},
new ArgumentCustomClientObject(1, "abc"));

ResultCustomClientObject result = await jobExec.GetResultAsync();
```

</TabItem>
</Tabs>
