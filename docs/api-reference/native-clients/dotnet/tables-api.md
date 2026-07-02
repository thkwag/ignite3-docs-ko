---
title: Tables API
id: tables-api
sidebar_position: 2
---

# Tables API

Tables API는 레코드 뷰와 키-값 뷰로 타입 안전한 데이터 접근을 제공합니다. 이 API는 C# 클래스를 사용하는 강타입 작업과 튜플을 사용하는 스키마 없는 작업을 모두 지원합니다.

## 핵심 개념 {#key-concepts}

Ignite 3의 테이블은 서로 다른 접근 패턴을 제공하는 뷰 인터페이스로 접근합니다. 레코드 뷰는 완전한 행을 단일 객체로 다루고, 키-값 뷰는 키와 값을 별개의 객체로 분리합니다. 두 패턴 모두 타입 지정 접근(C# 클래스 사용)과 타입 미지정 접근(IIgniteTuple 사용)을 지원합니다.

### 뷰 타입 {#view-types}

**레코드 뷰**는 각 행을 모든 컬럼을 담은 단일 객체로 다룹니다. 작업이 완전한 레코드를 다룰 때 사용합니다.

**키-값 뷰**는 키 컬럼과 값 컬럼을 별개의 객체로 분리합니다. 주로 키로 데이터에 접근하거나 스키마가 자연스럽게 키와 값 영역으로 나뉠 때 사용합니다.

**바이너리 뷰**는 IIgniteTuple을 사용해 타입 미지정 접근을 제공합니다. 동적 스키마에 사용하거나 제네릭 코드로 여러 테이블 타입을 다룰 때 사용합니다.

### 트랜잭션 지원 {#transaction-support}

모든 데이터 작업은 선택적 트랜잭션 매개변수를 받습니다. 자동 커밋 모드에는 null을 전달하고, 트랜잭션 범위에 작업을 포함하려면 ITransaction 인스턴스를 전달합니다.

## 사용 예시 {#usage-examples}

### 테이블 가져오기 {#getting-tables}

```csharp
var tables = client.Tables;

// Get table by name
var table = await tables.GetTableAsync("customers");

// Get table by qualified name (schema.table)
var qualifiedName = QualifiedName.Of("public", "orders");
var table = await tables.GetTableAsync(qualifiedName);

// List all tables
var allTables = await tables.GetTablesAsync();
```

### 레코드 뷰 작업 {#record-view-operations}

```csharp
// Define a POCO class matching table schema
public class Customer
{
    public long Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
}

var table = await tables.GetTableAsync("customers");
var view = table.GetRecordView<Customer>();

// Insert or replace
var customer = new Customer { Id = 1, Name = "Alice", Email = "alice@example.com" };
await view.UpsertAsync(null, customer);

// Get by key (only Id field used)
var key = new Customer { Id = 1 };
var result = await view.GetAsync(null, key);
if (result.HasValue)
{
    Console.WriteLine($"Found: {result.Value.Name}");
}

// Delete by key
await view.DeleteAsync(null, key);
```

### 키-값 뷰 작업 {#key-value-view-operations}

```csharp
public class OrderKey
{
    public long OrderId { get; set; }
}

public class OrderValue
{
    public long CustomerId { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal Amount { get; set; }
}

var table = await tables.GetTableAsync("orders");
var view = table.GetKeyValueView<OrderKey, OrderValue>();

// Put key-value pair
var key = new OrderKey { OrderId = 100 };
var value = new OrderValue
{
    CustomerId = 1,
    OrderDate = DateTime.UtcNow,
    Amount = 49.99m
};
await view.PutAsync(null, key, value);

// Get value by key
var result = await view.GetAsync(null, key);
if (result.HasValue)
{
    Console.WriteLine($"Amount: {result.Value.Amount}");
}

// Remove by key
await view.RemoveAsync(null, key);
```

### 튜플을 사용하는 바이너리 뷰 {#binary-view-with-tuples}

```csharp
var table = await tables.GetTableAsync("products");
var view = table.RecordBinaryView;

// Create tuple
var tuple = new IgniteTuple
{
    ["id"] = 1L,
    ["name"] = "Widget",
    ["price"] = 29.99
};

// Upsert
await view.UpsertAsync(null, tuple);

// Get by key tuple
var keyTuple = new IgniteTuple { ["id"] = 1L };
var result = await view.GetAsync(null, keyTuple);
if (result.HasValue)
{
    Console.WriteLine($"Price: {result.Value["price"]}");
}
```

### 일괄 작업 {#batch-operations}

```csharp
var view = table.GetRecordView<Customer>();

// Upsert multiple records
var customers = new[]
{
    new Customer { Id = 1, Name = "Alice", Email = "alice@example.com" },
    new Customer { Id = 2, Name = "Bob", Email = "bob@example.com" },
    new Customer { Id = 3, Name = "Carol", Email = "carol@example.com" }
};
await view.UpsertAllAsync(null, customers);

// Get multiple records
var keys = new[]
{
    new Customer { Id = 1 },
    new Customer { Id = 2 },
    new Customer { Id = 3 }
};
var results = await view.GetAllAsync(null, keys);
```

### 조건부 작업 {#conditional-operations}

```csharp
var view = table.GetRecordView<Customer>();
var key = new Customer { Id = 1 };

// Insert only if not exists
var inserted = await view.InsertAsync(null, customer);

// Replace only if exists
var replaced = await view.ReplaceAsync(null, customer);

// Replace with compare-and-swap
var oldRecord = new Customer { Id = 1, Name = "Alice", Email = "alice@example.com" };
var newRecord = new Customer { Id = 1, Name = "Alice", Email = "alice@newdomain.com" };
var swapped = await view.ReplaceAsync(null, oldRecord, newRecord);
```

### 가져와서 수정하는 작업 {#get-and-modify-operations}

```csharp
var view = table.GetRecordView<Customer>();

// Upsert and get old value
var result = await view.GetAndUpsertAsync(null, customer);
if (result.HasValue)
{
    Console.WriteLine($"Replaced: {result.Value.Name}");
}

// Delete and get old value
var key = new Customer { Id = 1 };
var deleted = await view.GetAndDeleteAsync(null, key);
if (deleted.HasValue)
{
    Console.WriteLine($"Deleted: {deleted.Value.Name}");
}
```

### LINQ 쿼리 {#linq-queries}

```csharp
var view = table.GetRecordView<Customer>();

// Use LINQ with queryable and ToListAsync
var results = await view.AsQueryable()
    .Where(c => c.Name.StartsWith("A"))
    .OrderBy(c => c.Email)
    .ToListAsync();

foreach (var customer in results)
{
    Console.WriteLine($"{customer.Name}: {customer.Email}");
}

// Alternative: use ToResultSetAsync for streaming results
var resultSet = await view.AsQueryable()
    .Where(c => c.Name.StartsWith("A"))
    .OrderBy(c => c.Email)
    .ToResultSetAsync();

await foreach (var customer in resultSet)
{
    Console.WriteLine($"{customer.Name}: {customer.Email}");
}
```

## 참조 {#reference}

### ITables 인터페이스 {#itables-interface}

테이블 검색 메서드:

- **GetTableAsync(string name)** - 이름으로 테이블을 가져옵니다. 찾을 수 없으면 null을 반환합니다
- **GetTableAsync(QualifiedName name)** - 스키마로 정규화된 이름으로 테이블을 가져옵니다
- **GetTablesAsync()** - 클러스터의 사용 가능한 모든 테이블을 가져옵니다

### ITable 인터페이스 {#itable-interface}

속성:

- **Name** - 스키마 접두어가 없는 테이블 이름
- **QualifiedName** - 스키마로 완전히 정규화된 이름
- **RecordBinaryView** - IIgniteTuple을 사용하는 타입 미지정 레코드 뷰
- **KeyValueBinaryView** - IIgniteTuple을 사용하는 타입 미지정 키-값 뷰
- **PartitionManager** - 고급 파티션 관리

메서드:

- **GetRecordView&lt;T&gt;()** - 타입 T에 대한 타입 지정 레코드 뷰를 생성합니다
- **GetKeyValueView&lt;TK, TV&gt;()** - 키 타입 TK와 값 타입 TV로 타입 지정 키-값 뷰를 생성합니다

### IRecordView&lt;T&gt; 인터페이스 {#irecordviewt-interface}

읽기 작업:

- **GetAsync(ITransaction?, T key)** - 키로 레코드를 가져옵니다. Option&lt;T&gt;를 반환합니다
- **GetAllAsync(ITransaction?, IEnumerable&lt;T&gt; keys)** - 여러 레코드를 가져옵니다
- **ContainsKeyAsync(ITransaction?, T key)** - 키가 존재하는지 확인합니다

쓰기 작업:

- **UpsertAsync(ITransaction?, T record)** - 레코드를 삽입하거나 교체합니다
- **UpsertAllAsync(ITransaction?, IEnumerable&lt;T&gt; records)** - 여러 레코드를 삽입하거나 교체합니다
- **InsertAsync(ITransaction?, T record)** - 존재하지 않을 때만 삽입합니다. bool을 반환합니다
- **InsertAllAsync(ITransaction?, IEnumerable&lt;T&gt; records)** - 여러 개를 삽입합니다. 건너뛴 키 목록을 반환합니다
- **ReplaceAsync(ITransaction?, T record)** - 기존 레코드를 교체합니다. bool을 반환합니다
- **ReplaceAsync(ITransaction?, T record, T newRecord)** - 조건부 교체(compare-and-swap)

삭제 작업:

- **DeleteAsync(ITransaction?, T key)** - 키로 삭제합니다. bool을 반환합니다
- **DeleteAllAsync(ITransaction?, IEnumerable&lt;T&gt; keys)** - 여러 개를 삭제합니다. 존재하지 않는 키 목록을 반환합니다
- **DeleteExactAsync(ITransaction?, T record)** - 모든 컬럼이 정확히 일치할 때만 삭제합니다
- **DeleteAllExactAsync(ITransaction?, IEnumerable&lt;T&gt; records)** - 정확히 일치하는 것을 삭제합니다

가져와서 수정하는 작업:

- **GetAndUpsertAsync(ITransaction?, T record)** - 삽입 또는 교체하고 이전 값을 반환합니다
- **GetAndReplaceAsync(ITransaction?, T record)** - 교체하고 이전 값을 반환합니다
- **GetAndDeleteAsync(ITransaction?, T key)** - 삭제하고 이전 값을 반환합니다

쿼리 작업:

- **AsQueryable(ITransaction?, QueryableOptions?)** - LINQ 쿼리 가능 인터페이스를 생성합니다

### IKeyValueView&lt;TK, TV&gt; 인터페이스 {#ikeyvalueviewtk-tv-interface}

읽기 작업:

- **GetAsync(ITransaction?, TK key)** - 키로 값을 가져옵니다. Option&lt;TV&gt;를 반환합니다
- **GetAllAsync(ITransaction?, IEnumerable&lt;TK&gt; keys)** - 여러 값을 가져옵니다. Dictionary를 반환합니다
- **ContainsAsync(ITransaction?, TK key)** - 키가 존재하는지 확인합니다

쓰기 작업:

- **PutAsync(ITransaction?, TK key, TV val)** - 키-값 쌍을 넣습니다
- **PutAllAsync(ITransaction?, IEnumerable&lt;KeyValuePair&lt;TK, TV&gt;&gt; pairs)** - 여러 쌍을 넣습니다
- **PutIfAbsentAsync(ITransaction?, TK key, TV val)** - 키가 없을 때만 넣습니다. bool을 반환합니다

교체 작업:

- **ReplaceAsync(ITransaction?, TK key, TV val)** - 기존 키의 값을 교체합니다. bool을 반환합니다
- **ReplaceAsync(ITransaction?, TK key, TV oldVal, TV newVal)** - 조건부 교체

제거 작업:

- **RemoveAsync(ITransaction?, TK key)** - 키로 제거합니다. bool을 반환합니다
- **RemoveAsync(ITransaction?, TK key, TV val)** - 값이 일치할 때만 제거합니다
- **RemoveAllAsync(ITransaction?, IEnumerable&lt;TK&gt; keys)** - 키로 여러 개를 제거합니다
- **RemoveAllAsync(ITransaction?, IEnumerable&lt;KeyValuePair&lt;TK, TV&gt;&gt; pairs)** - 키-값 쌍으로 제거합니다

가져와서 수정하는 작업:

- **GetAndPutAsync(ITransaction?, TK key, TV val)** - 넣고 이전 값을 반환합니다
- **GetAndReplaceAsync(ITransaction?, TK key, TV val)** - 교체하고 이전 값을 반환합니다
- **GetAndRemoveAsync(ITransaction?, TK key)** - 제거하고 값을 반환합니다

쿼리 작업:

- **AsQueryable(ITransaction?, QueryableOptions?)** - LINQ 쿼리 가능 인터페이스를 생성합니다

### IIgniteTuple 인터페이스 {#iignitetuple-interface}

속성:

- **FieldCount** - 튜플의 컬럼 수
- **this[int ordinal]** - 순서 위치로 컬럼 값을 가져오거나 설정합니다
- **this[string name]** - 이름으로 컬럼 값을 가져오거나 설정합니다

메서드:

- **GetName(int ordinal)** - 순서 위치로 컬럼 이름을 가져옵니다
- **GetOrdinal(string name)** - 이름으로 컬럼 순서 위치를 가져옵니다(찾을 수 없으면 -1 반환)

정적 메서드:

- **GetHashCode(IIgniteTuple)** - 이름과 값을 고려해 해시를 계산합니다
- **Equals(IIgniteTuple?, IIgniteTuple?)** - 컬럼 순서를 무시하고 튜플을 비교합니다
- **ToString(IIgniteTuple)** - 문자열 표현을 생성합니다

### Option&lt;T&gt; 타입 {#optiont-type}

Option 타입은 null이 될 수 있는 결과를 감쌉니다:

- **HasValue** - 값이 있으면 true
- **Value** - 실제 값(HasValue가 false이면 예외를 던집니다)

이 패턴은 null 참조 문제를 피하고 null 처리를 명시적으로 만듭니다.
