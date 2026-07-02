---
id: transactions
title: 트랜잭션 수행
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Apache Ignite의 모든 쿼리는 트랜잭션으로 처리됩니다. Table API와 SQL API를 호출할 때 첫 번째 인수로 명시적 트랜잭션을 전달할 수 있습니다. 명시적 트랜잭션을 지정하지 않으면 호출마다 암묵적 트랜잭션이 생성됩니다.

## 트랜잭션 라이프사이클 {#transaction-lifecycle}

트랜잭션이 생성되면 트랜잭션을 시작한 노드가 **트랜잭션 코디네이터**로 선택됩니다. 코디네이터는 필요한 [파티션](/understand/core-concepts/data-partitioning)을 찾아 프라이머리 파티션을 보유한 노드로 읽기 또는 쓰기 요청을 보냅니다. 트랜잭션이 올바르게 동작하려면 클러스터의 모든 노드가 비슷한 시각을 유지해야 하며, 그 차이는 `schemaSync.maxClockSkewMillis`를 넘을 수 없습니다.

다른 트랜잭션이 해당 키를 잠그지 않았다면 노드는 관련 키에 락을 걸고 트랜잭션의 변경 사항 적용을 시도합니다. 작업이 끝나면 락이 해제됩니다. 이런 방식으로 여러 트랜잭션이 서로 다른 키를 변경하면서 같은 파티션에서 동시에 동작할 수 있습니다. 또한 일부 작업은 올바르게 처리되도록 미리 키에 **단기** 락을 걸기도 합니다.

트랜잭션에 관련된 파티션의 프라이머리 복제본을 가진 노드에 장애가 발생하면 트랜잭션은 결국 자동으로 롤백됩니다. 이때 Apache Ignite는 커밋을 시도할 때 `TransactionException`을 반환합니다.

## 트랜잭션 격리와 동시성 {#transaction-isolation-and-concurrency}

Apache Ignite의 모든 읽기-쓰기 트랜잭션은 첫 읽기 또는 쓰기 접근 시 락을 획득하고, 트랜잭션이 커밋되거나 롤백될 때까지 락을 유지합니다. 모든 읽기-쓰기 트랜잭션은 `SERIALIZABLE` 수준으로 동작하므로, 락이 유지되는 동안에는 다른 트랜잭션이 잠긴 데이터를 변경할 수 없습니다. 다만 [읽기 전용 트랜잭션](#read-only-transactions)으로는 데이터를 읽을 수 있습니다.

### 데드락 방지 {#deadlock-prevention}

Apache Ignite는 `WAIT_DIE` 데드락 방지 알고리즘을 사용합니다. 더 최근에 시작된 트랜잭션이 다른 트랜잭션이 이미 잠근 데이터를 요청하면 해당 트랜잭션은 취소되고 같은 타임스탬프로 재시도됩니다. 반대로 더 오래된 트랜잭션은 취소되지 않고 락이 풀릴 때까지 대기합니다.

## 트랜잭션 실행 {#executing-transactions}

다음은 트랜잭션을 명시적으로 지정하는 방법입니다.

<Tabs>
<TabItem value="java" label="Java">

```java
KeyValueView<Long, Account> accounts =
  table.keyValueView(Mapper.of(Long.class), Mapper.of(Account.class));

accounts.put(null, 42, new Account(16_000));

var tx = client.transactions().begin();

Account account = accounts.get(tx, 42);
account.balance += 500;
accounts.put(tx, 42, account);

assert accounts.get(tx, 42).balance == 16_500;

tx.rollback();

assert accounts.get(tx, 42).balance == 16_000;
```

</TabItem>
<TabItem value="net" label=".NET">

```csharp
var accounts = table.GetKeyValueView<long, Account>();
await accounts.PutAsync(transaction: null, 42, new Account(16_000));

await using ITransaction tx = await client.Transactions.BeginAsync();

(Account account, bool hasValue) = await accounts.GetAsync(tx, 42);
account = account with { Balance = account.Balance + 500 };

await accounts.PutAsync(tx, 42, account);

Debug.Assert((await accounts.GetAsync(tx, 42)).Value.Balance == 16_500);

await tx.RollbackAsync();

Debug.Assert((await accounts.GetAsync(null, 42)).Value.Balance == 16_000);

public record Account(decimal Balance);
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
auto accounts = table.get_key_value_view<account, account>();

account init_value(42, 16'000);
accounts.put(nullptr, {42}, init_value);

auto tx = client.get_transactions().begin();

std::optional<account> res_account = accounts.get(&tx, {42});
res_account->balance += 500;
accounts.put(&tx, {42}, res_account);

assert(accounts.get(&tx, {42})->balance == 16'500);

tx.rollback();

assert(accounts.get(&tx, {42})->balance == 16'000);
```

</TabItem>
</Tabs>

## 트랜잭션 관리 {#transaction-management}

`runInTransaction` 메서드로도 트랜잭션을 관리할 수 있습니다. 이 메서드를 사용하면 다음이 자동으로 처리됩니다.

- 트랜잭션이 시작되고 클로저에 전달됩니다.
- 클로저 실행 중 예외가 발생하지 않으면 트랜잭션이 커밋됩니다.
- 복구 가능한 오류가 발생하면 트랜잭션이 재시도됩니다. 클로저는 부작용이 없는 순수 함수형이어야 합니다.

트랜잭션은 동기 방식과 비동기 방식 모두로 실행할 수 있습니다.

다음 예시는 계좌 잔액을 동기 방식으로 갱신하는 방법을 보여줍니다.

<Tabs>
<TabItem value="java" label="Java">

```java
client.transactions().runInTransaction(tx -> {
    Account acct = accounts.get(tx, key);
    if (acct != null) {
        acct.balance += 200.0d;
    }
    accounts.put(tx, key, acct);
});

```

</TabItem>
</Tabs>

다음 예시는 같은 로직을 비동기 방식으로 수행합니다.

<Tabs>
<TabItem value="java" label="Java">

```java
CompletableFuture<Void> future = client.transactions().runInTransactionAsync(tx ->
        accounts.getAsync(tx, key)
                .thenCompose(acct -> {
                    acct.balance += 300.0d;
                    return accounts.putAsync(tx, key, acct);
                })
);
future.join();
```

</TabItem>
</Tabs>

## 읽기 전용 트랜잭션 {#read-only-transactions}

트랜잭션을 시작할 때 **읽기 전용** 트랜잭션으로 구성할 수 있습니다. 읽기 전용 트랜잭션에서는 데이터를 수정할 수 없지만, 락을 확보하지 않고 프라이머리가 아닌 [파티션](/understand/core-concepts/data-partitioning)에서도 실행할 수 있어 성능이 더 좋습니다. 읽기 전용 트랜잭션은 이후 데이터베이스에 새 데이터가 기록되더라도 항상 트랜잭션을 시작한 시점의 데이터를 확인합니다.

다음은 읽기 전용 트랜잭션을 만드는 방법입니다.

<Tabs>
<TabItem value="java" label="Java">

```java
var tx = client.transactions().begin(new TransactionOptions().readOnly(true));
int balance = accounts.get(tx, 42).balance;
tx.commit();
```

</TabItem>
<TabItem value="net" label=".NET">

```csharp
await using var tx = await client.Transactions.BeginAsync(
    new TransactionOptions { ReadOnly = true });
var account = await accounts.GetAsync(tx, 42);
int balance = account.Value.Balance;
await tx.CommitAsync();
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
auto tx_opts = transaction_options()
        .set_read_only(true);

auto tx = m_client.get_transactions().begin(tx_opts);

record_view.get(&tx, 42);

tx.commit();
```

</TabItem>
</Tabs>

:::note
읽기 전용 트랜잭션은 특정 시점의 데이터를 읽습니다. 그 이후 새 데이터가 기록되더라도 이전 데이터는 [버전 저장](/understand/core-concepts/data-partitioning#version-storage)에 남아 있으며 하한 워터마크에 도달할 때까지 사용할 수 있습니다. 트랜잭션이 진행되는 동안 하한 워터마크에 도달하면 트랜잭션이 끝날 때까지 데이터를 계속 사용할 수 있습니다.
:::

## 트랜잭션 타임아웃 {#transaction-timeout}

특정 상황에서는 트랜잭션이 너무 오래 걸리면 중단하는 것이 좋습니다. 타임아웃에 도달하면 트랜잭션이 자동으로 롤백됩니다.

다음은 트랜잭션 타임아웃을 구성하는 방법입니다.

<Tabs>
<TabItem value="java" label="Java">

```java
KeyValueView<Long, Account> accounts =
  table.keyValueView(Mapper.of(Long.class), Mapper.of(Account.class));

var tx = client.transactions().begin(new TransactionOptions().timeoutMillis(10000));
accounts.put(tx, 42, account);
tx.commit();
```

</TabItem>
<TabItem value="net" label=".NET">

```csharp
await using var tx = await Client.Transactions.BeginAsync(
    new TransactionOptions { TimeoutMillis = 10_000 });
await accounts.PutAsync(tx, 42, account);
await tx.CommitAsync();
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
auto accounts = table.get_key_value_view<account, account>();

auto tx_opts = transaction_options()
       .set_timeout_millis(10000);

auto tx = m_client.get_transactions().begin(tx_opts);

record_view.insert(&tx, 42);

tx.commit();
```

</TabItem>
</Tabs>
