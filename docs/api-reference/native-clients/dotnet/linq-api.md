---
title: LINQ API
id: linq-api
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Ignite .NET 클라이언트는 Ignite SQL API와 통합된 LINQ 지원을 제공합니다. SQL 문법을 직접 다루지 않고 C#에서 LINQ로 쿼리를 작성할 수 있습니다. 그러면 C# LINQ 표현식이 Ignite 전용 SQL로 변환됩니다. 예를 들어 다음 두 스니펫은 같은 결과를 냅니다:

<Tabs>
<TabItem value="linq" label="LINQ">

```csharp
var table = await Client.Tables.GetTableAsync("TBL1");
IQueryable<Poco> query = table!.GetRecordView<Poco>().AsQueryable()
    .Where(x => x.Key > 3)
    .OrderBy(x => x.Key);
List<Poco> queryResults = await query.ToListAsync();
```

</TabItem>
<TabItem value="sql" label="SQL">

```csharp
var query = "select KEY, VAL from PUBLIC.TBL1 where (KEY > ?) order by KEY asc";
await using IResultSet<IIgniteTuple> resultSet = await Client.Sql.
    ExecuteAsync(transaction: null, query, 3);
var queryResults = new List<Poco>();
await foreach (IIgniteTuple row in resultSet)
{
    queryResults.Add(new Poco { Key = (long)row[0]!, Val = (string?)row[1] });
}
```

</TabItem>
</Tabs>

LINQ는 SQL보다 다음과 같은 장점이 있습니다:

* 쿼리가 강타입이고 컴파일 시점에 검사됩니다.
* IDE 지원(자동 완성, 탐색, 사용처 찾기)으로 작성하고 유지보수하기가 더 쉽습니다.
* LINQ는 리팩터링에 유리합니다. 컬럼 이름을 바꾸면 모든 쿼리가 한 번에 갱신됩니다.
* Ignite 전용 SQL 지식이 필요 없고, 대부분의 C# 개발자는 이미 LINQ에 익숙합니다.
* LINQ는 SQL 인젝션에 안전합니다.
* 결과가 타입에 자연스럽게 매핑됩니다.

실제 시나리오에서 Ignite LINQ 쿼리의 성능은 동등한 SQL 쿼리와 비슷합니다.
다만 (쿼리 변환으로 인한) 약간의 오버헤드는 여전히 존재하고 쿼리 복잡도에 따라 결과가 달라질 수 있으므로, 쿼리 성능을 측정하는 것이 좋습니다.

## LINQ 시작하기 {#getting-started-with-linq}

Ignite에서 간단한 테이블을 만드는 방법은 다음과 같습니다:

1. 테이블을 생성합니다:

   ```csharp
   await Client.Sql.ExecuteAsync(
       null, @"CREATE TABLE PUBLIC.PERSON (NAME VARCHAR PRIMARY KEY, AGE INT)");
   ```

2. 테이블을 나타내는 클래스(또는 레코드)를 정의합니다:
   * 멤버 이름은 컬럼 이름과 일치해야 합니다(대소문자 구분 없음).
   * 컬럼 이름이 유효한 C# 식별자가 아니면 `[Column("name")]` 특성으로 이름을 지정합니다.

   ```csharp
   public record Person(string Name, int Age, string Address, string Status);
   ```

3. 테이블 참조를 가져옵니다:

   ```csharp
   ITable table = await Client.Tables.GetTableAsync("PERSON");
   ```

4. `GetRecordView<T>()` 메서드로 테이블의 타입 지정 뷰를 가져옵니다:

   ```csharp
   IRecordView<Person> view = table.GetRecordView<Person>();
   ```

5. `AsQueryable()`로 `IRecordView<T>`에 LINQ 쿼리를 수행합니다.

   ```csharp
   List<string> names = await view.AsQueryable()
       .Where(x => x.Age > 30)
       .Select(x => x.Name)
       .ToListAsync();
   ```

## LINQ 사용하기 {#using-linq}

### 생성된 SQL 살펴보기 {#inspecting-generated-sql}

생성된 SQL을 확인하면 디버깅과 성능 튜닝에 유용합니다. 두 가지 방법이 있습니다:

* `IgniteQueryableExtensions.ToQueryString()` 확장 메서드:

  ```csharp
  IQueryable<Person> query = table.GetRecordView<Person>()
      .AsQueryable()
      .Where(x => x.Age > 30);
  string sql = query.ToQueryString();
  ```

* 디버그 로깅:

  ```csharp
  var cfg = new IgniteClientConfiguration
  {
      Logger = new ConsoleLogger { MinLevel = LogLevel.Debug },
      ...
  };
  using var client = IgniteClient.StartAsync(cfg);
  ...
  ```

생성된 모든 SQL이 지정한 로거에 `Debug` 수준으로 기록됩니다.

### 트랜잭션 {#transactions}

`AsQueryable` 매개변수로 LINQ 공급자에 트랜잭션을 전달합니다:

```csharp
await using var tx = await client.Transactions.BeginAsync();
var view = (await client.Tables.GetTableAsync("person"))!.GetRecordView<Person>();
pocoView.AsQueryable(tx)...;
```

### 커스텀 쿼리 옵션 {#custom-query-options}

두 번째 `AsQueryable` 매개변수에 `QueryableOptions`를 사용해 커스텀 쿼리 옵션(타임아웃, 페이지 크기)을 지정합니다:

```csharp
var options = new QueryableOptions
{
    PageSize = 512,
    Timeout = TimeSpan.FromSeconds(30)
};
table.GetRecordView<Person>().AsQueryable(options: options)...;
```

### 결과 구체화 {#result-materialization}

구체화는 쿼리 결과(`IQueryable<T>`)를 객체 또는 객체 컬렉션으로 변환하는 과정입니다.

LINQ는 지연 실행됩니다. 쿼리가 구체화되기 전까지는 아무 일도(네트워크 호출도, SQL 변환도) 일어나지 않습니다.
예를 들어 다음 코드는 표현식을 구성하기만 할 뿐 아무것도 실행하지 않습니다:

```csharp
IQueryable<Person> query = table!.GetRecordView<Person>().AsQueryable()
    .Where(x => x.Key > 3)
    .OrderBy(x => x.Key);
```

쿼리 실행과 구체화는 여러 방식으로 트리거될 수 있습니다:

#### 반복 {#iteration}

`foreach` 문으로 쿼리 결과를 반복하거나, `AsAsyncEnumerable` 메서드로 비동기로 반복할 수 있습니다:

```csharp
foreach (var person in query) { ... }
await foreach (var person in query.AsAsyncEnumerable()) { ... }
```

#### 컬렉션으로 변환 {#converting-to-collections}

`ToList`와 `ToDictionary` 메서드로 쿼리를 컬렉션으로 변환하거나, 비동기로 하려면 `ToListAsync`와 `ToDictionaryAsync` 메서드를 사용합니다:

<Tabs>
<TabItem value="sync" label="동기">

```csharp
List<Person> list = query.ToList();
Dictionary<string, int> dict = query.ToDictionary(x => x.Name, x => x.Age);
```

</TabItem>
<TabItem value="async" label="비동기">

```csharp
List<Person> list = await query.ToListAsync();
Dictionary<string, int> dict = await query.
    ToDictionaryAsync(x => x.Name, x => x.Age);
```

</TabItem>
</Tabs>

#### Ignite 전용 IResultSet {#ignite-specific-iresultset}

기반이 되는 `IResultSet`은 `IgniteQueryableExtensions.ToResultSetAsync()` 확장 메서드로 가져옵니다:

```csharp
await using IResultSet<Person> resultSet = await query.ToResultSetAsync();
Console.WriteLine(resultSet.Metadata);
var rows = resultSet.CollectAsync(...);
```

`IResultSet`을 가져오면 메타데이터와 `CollectAsync` 메서드에 접근할 수 있어 유용하며, 이 메서드는 결과 구체화를 더 세밀하게 제어합니다.

## 지원되는 LINQ 기능 {#supported-linq-features}

### 프로젝션 {#projection}

프로젝션은 쿼리 결과를 다른 타입으로 변환하는 과정입니다.
무엇보다도 프로젝션은 컬럼의 일부만 선택하는 데 사용됩니다.

예를 들어 `Person` 테이블에는 컬럼이 많을 수 있지만 `Name`과 `Age`만 필요합니다.

* 먼저 프로젝션 클래스를 만듭니다:

  ```csharp
  public record PersonInfo(string Name, int Age);
  ```

* 그런 다음 `Select`로 쿼리 결과를 프로젝션합니다:

  ```csharp
  List<PersonInfo> result = query
      .Select(x => new PersonInfo(x.Name, x.Age))
      .ToList();
  ```

결과 SQL은 그 두 컬럼만 선택해 과도한 조회(overfetching)를 피합니다.
과도한 조회는 ORM이 생성한 쿼리가 테이블의 모든 컬럼을 포함하지만 비즈니스 로직에는 그중 일부만 필요할 때 흔히 발생하는 문제입니다.

Ignite는 익명 타입 프로젝션도 지원합니다:

```csharp
var result = query.Select(x => new { x.Name, x.Age }).ToList();
```

### 내부 조인 {#inner-joins}

표준 `Join` 메서드로 다른 테이블에 조인을 수행합니다:

```csharp
var customerQuery = customerTable.GetRecordView<Customer>().AsQueryable();
var orderQuery = orderTable.GetRecordView<Order>().AsQueryable();
var ordersByCustomer = customerQuery
    .Join(orderQuery,
        cust => cust.Id,
        order => order.CustId,
        (cust, order) => new { cust.Name, order.Amount })
    .ToList();
```

### 외부 조인 {#outer-joins}

외부 조인은 `DefaultIfEmpty` 메서드로 지원됩니다.
예를 들어 도서관의 모든 책이 학생에게 대출되는 것은 아니므로, 왼쪽 외부 조인으로 모든 책과 (있다면) 현재 대출자를 조회합니다:

```csharp
var bookQuery = bookTable.GetRecordView<Book>().AsQueryable();
var studentQuery = studentTable.GetRecordView<Student>().AsQueryable();
var booksWithStudents = bookQuery
    .Join(studentQuery.DefaultIfEmpty(),
        book => book.StudentId,
        student => student.Id,
        (book, student) => new { book.Title, student.Name })
    .ToList();
```

### 그룹화 {#grouping}

그룹화는 `GroupBy` 메서드로 지원됩니다. 이는 SQL의 GROUP BY 연산자에 해당합니다. 쿼리에서 단일 컬럼과 다중 컬럼을 모두 가져올 수 있습니다. 다중 컬럼을 다룰 때는 익명 타입을 사용합니다:

<Tabs>
<TabItem value="single" label="단일 컬럼">

```csharp
var bookCountByAuthor = bookTable.GetRecordView<Book>().AsQueryable()
    .GroupBy(book => book.Author)
    .Select(grp => new { Author = grp.Key, Count = grp.Count() })
    .ToList();
```

</TabItem>
<TabItem value="multiple" label="다중 컬럼">

```csharp
var bookCountByAuthorAndYear = bookTable.GetRecordView<Book>().AsQueryable()
    .GroupBy(book => new { book.Author, book.Year })
    .Select(grp => new { Author = grp.Key.Author,
                                  Year = grp.Key.Year,
                                  Count = grp.Count() })
    .ToList();
```

</TabItem>
</Tabs>

집계 함수 `Count`, `Sum`, `Min`, `Max`, `Average`를 그룹화와 함께 사용할 수 있습니다.

### 정렬 {#ordering}

`OrderBy`, `OrderByDescending`, `ThenBy`, `ThenByDescending`을 지원합니다. 이들을 조합해 여러 컬럼으로 정렬할 수 있습니다:

```csharp
var booksOrderedByAuthorAndYear = bookTable.GetRecordView<Book>().AsQueryable()
    .OrderBy(book => book.Author)
    .ThenByDescending(book => book.Year)
    .ToList();
```

### Union, Intersect, Except {#union-intersect-except}

`Union`, `Intersect`, `Except` 메서드로 여러 결과 집합을 결합합니다. 예를 들면:

```csharp
IQueryable<string> employeeEmails = employeeTable
    .GetRecordView<Employee>().AsQueryable()
    .Select(x => x.Email);

IQueryable<string> customerEmails = customerTable
    .GetRecordView<Customer>().AsQueryable()
    .Select(x => x.Email);

List<string> allEmails = employeeEmails.Union(customerEmails)
    .OrderBy(x => x)
    .ToList();

List<string> employeesThatAreCustomers = employeeEmails
    .Intersect(customerEmails).ToList();
```

### 집계 함수 {#aggregate-functions}

다음은 Ignite에서 지원되는 .NET 집계 함수와 그에 대응하는 SQL 함수 목록입니다:

| LINQ 동기 메서드 | LINQ 비동기 메서드 | SQL 연산자 |
|-------------------------|--------------------------|--------------|
| First | FirstAsync | FIRST |
| FirstOrDefault | FirstOrDefaultAsync | FIRST ... LIMIT 1 |
| Single | SingleAsync | FIRST |
| SingleOrDefault | SingleOrDefaultAsync | FIRST ... LIMIT 2 |
| Max | MaxAsync | MAX |
| Min | MinAsync | MIN |
| Average | AverageAsync | AVG |
| Sum | SumAsync | SUM |
| Count | CountAsync | COUNT |
| LongCount | LongCountAsync | COUNT |
| Any | AnyAsync | ANY |
| All | AllAsync | ALL |

다음은 이 메서드들을 사용하는 예시입니다:

<Tabs>
<TabItem value="sync" label="동기">

```csharp
Person first = query.First();
Person? firstOrDefault = query.FirstOrDefault();
Person single = query.Single();
Person? singleOrDefault = query.SingleOrDefault();
int maxAge = query.Max(x => x.Age);
int minAge = query.Min(x => x.Age);
int avgAge = query.Average(x => x.Age);
int sumAge = query.Sum(x => x.Age);
int count = query.Count();
long longCount = query.LongCount();
bool any = query.Any(x => x.Age > 30);
bool all = query.All(x => x.Age > 30);
```

</TabItem>
<TabItem value="async" label="비동기">

```csharp
Person first = await query.FirstAsync();
Person? firstOrDefault = await query.FirstOrDefaultAsync();
Person single = await query.SingleAsync();
Person? singleOrDefault = await query.SingleOrDefaultAsync();
int maxAge = await query.MaxAsync(x => x.Age);
int minAge = await query.MinAsync(x => x.Age);
int avgAge = await query.AverageAsync(x => x.Age);
int sumAge = await query.SumAsync(x => x.Age);
int count = await query.CountAsync();
long longCount = await query.LongCountAsync();
bool any = await query.AnyAsync(x => x.Age > 30);
bool all = await query.AllAsync(x => x.Age > 30);
```

</TabItem>
</Tabs>

### 수학 함수 {#math-functions}

다음 `Math` 함수를 지원합니다(대응하는 SQL 함수로 변환됩니다):
`Abs`, `Cos`, `Cosh`, `Acos`, `Sin`, `Sinh`, `Asin`, `Tan`, `Tanh`, `Atan`, `Ceiling`, `Floor`,
`Exp`, `Log`, `Log10`, `Pow`, `Round`, `Sign`, `Sqrt`, `Truncate`.

다음 `Math` 함수는 지원되지 않습니다(Ignite SQL 엔진에 대응하는 함수가 없음):
`Acosh`, `Asinh`, `Atanh`, `Atan2`, `Log2`, `Log(x, y)`.

다음은 수학 함수를 사용하는 예시입니다:

```csharp
var triangles = table.GetRecordView<Triangle>().AsQueryable()
    .Select(t => new {
            Hypotenuse,
            Opposite = t.Hypotenuse * Math.Sin(t.Angle),
            Adjacent = t.Hypotenuse * Math.Cos(t.Angle)
        })
    .ToList();
```

### 문자열 함수 {#string-functions}

다음 문자열 함수를 지원합니다: `string.Compare(string)`, `string.Compare(string, bool ignoreCase)`, 연결 `s1 + s2 + s3`, `ToUpper`, `ToLower`,
`Substring(start)`, `Substring(start, len)`,
`Trim`, `Trim(char)`, `TrimStart`, `TrimStart(char)`, `TrimEnd`, `TrimEnd(char)`,
`Contains`, `StartsWith`, `EndsWith`, `IndexOf`, `Length`, `Replace`.

다음은 문자열 함수를 사용하는 예시입니다:

```csharp
List<string> fullNames = table.GetRecordView<Person>().AsQueryable()
    .Where(p => p.FirstName.StartsWith("Jo"))
    .Select(p => new {
        FullName = p.FirstName.ToUpper() +
        " " +
        p.LastName.ToLower() })
    .ToList();
```

### 정규 표현식 {#regular-expressions}

`Regex.Replace`는 `regexp_replace` 함수로 변환됩니다. 코드에서 정규 표현식을 사용하는 방법은 다음과 같습니다:

```csharp
List<string> addresses = table.GetRecordView<Person>().AsQueryable()
    .Select(p => new { Address = Regex.Replace(p.Address, @"(\d+)", "[$1]")
    .ToList();
```

:::note
SQL 내부의 정규 표현식 엔진은 .NET 엔진과 다르게 동작할 수 있습니다.
:::

### DML(대량 업데이트 및 삭제) {#dml-bulk-update-and-delete}

선택적 조건을 포함한 대량 업데이트와 삭제는 `IQueryable<T>`의 `ExecuteUpdateAsync`와 `ExecuteDeleteAsync` 확장 메서드로 지원됩니다:

```csharp
var orders = orderTable.GetRecordView<Order>().AsQueryable();
await orders.Where(x => x.Amount == 0).ExecuteDeleteAsync();
```

업데이트 문은 속성을 상수 값으로 설정하거나 같은 행의 다른 속성에 기반한 표현식으로 설정합니다:

```csharp
var orders = orderTable.GetRecordView<Order>().AsQueryable();
await orders
    .Where(x => x.CustomerId == customerId)
    .ExecuteUpdateAsync(
        order => order.SetProperty(x => x.Discount, 0.1m)
                      .SetProperty(x => x.Note, x => x.Note +
                            " Happy birthday, " +
                            x.CustomerName));
```

결과 SQL:

```sql
update PUBLIC.tbl1 as _T0
set NOTE = concat(concat(_T0.NOTE, ?), _T0.CUSTOMERNAME), DISCOUNT = ?
where (_T0.CUSTOMERID IS NOT DISTINCT FROM ?)
```

### 쿼리 조합 {#composing-queries}

`IQueryable<T>` 표현식은 동적으로 조합할 수 있습니다. 흔한 사용 사례는 사용자 입력에 따라 쿼리를 조합하는 것입니다.
예를 들어 서로 다른 컬럼에 대한 선택적 필터를 쿼리에 적용할 수 있습니다:

```csharp
public List<Book> GetBooks(string? author, int? year)
{
    IQueryable<Book> query = bookTable.GetRecordView<Book>().AsQueryable();
    if (!string.IsNullOrEmpty(author))
        query = query.Where(x => x.Author == author);

    if (year != null)
        query = query.Where(x => x.Year == year);
    return query.ToList();
}
```

### 컬럼 이름 매핑 {#column-name-mapping}

`[Column]`으로 커스텀 매핑을 지정하지 않으면, LINQ 공급자는 속성 또는 필드 이름을 컬럼 이름으로 사용하며, 대소문자를 구분하지 않는 따옴표 없는 식별자를 씁니다.

<Tabs>
<TabItem value="csharp" label="C#">

```csharp
bookTable.GetRecordView<Book>().AsQueryable().Select(x => x.Author).ToList();
```

</TabItem>
<TabItem value="sql" label="결과 SQL">

```sql
select _T0.AUTHOR from PUBLIC.books as _T0
```

</TabItem>
</Tabs>

따옴표가 있는 식별자를 사용하거나 컬럼 이름을 다른 속성 이름에 매핑하려면 `[Column]` 특성을 사용합니다:

<Tabs>
<TabItem value="csharp" label="C#">

```csharp
public class Book
{
    [Column("book_author")]
    public string Author { get; set; }
}
// Or a record:
public record Book([property: Column("book_author")] string Author);
```

</TabItem>
<TabItem value="sql" label="결과 SQL">

```sql
SELECT _T0."book_author" FROM PUBLIC.books AS _T0
```

</TabItem>
</Tabs>

### KeyValueView

위의 모든 예시는 `IRecordView<T>`로 쿼리를 수행하지만, LINQ 공급자는 `IKeyValueView<TK, TV>`도 똑같이 잘 지원합니다:

```csharp
IQueryable<KeyValuePair<int, Book>> query =
    bookTable.GetKeyValueView<int, Book>().AsQueryable();
List<Book> books = query
    .Where(x => x.Key > 10)
    .Select(x => x.Value)
    .ToList();
```
