---
id: spring-data
title: Spring Data 통합
---

Apache Ignite 3는 저장소 기반 데이터 접근을 지원하는 Spring Data JDBC 방언(dialect)을 제공합니다. Spring Boot의 JDBC 스타터와 결합하면 `CrudRepository`나 파생 쿼리(derived query) 메서드 같은 익숙한 패턴으로 표준 Spring Data 저장소를 Ignite 테이블과 함께 사용할 수 있습니다.

## 사전 요구 사항 {#prerequisites}

- Java 17 이상
- Spring Data JDBC가 포함된 Spring Boot 3.x
- 실행 중인 Ignite 3 클러스터
- 저장소 작업 전에 Ignite에 생성한 테이블

## 설치 {#installation}

Spring Data 통합에는 세 가지 의존성이 필요합니다.

- `spring-boot-starter-data-jdbc`(Spring 제공)는 Spring Data JDBC 프레임워크를 제공합니다.
- `spring-data-ignite`(Apache Ignite 제공)는 Ignite 호환 쿼리를 생성하는 SQL 방언을 제공합니다.
- `ignite-jdbc`(Apache Ignite 제공)는 데이터베이스 연결을 위한 JDBC 드라이버를 제공합니다.

Ignite 아티팩트 버전은 Apache Ignite 클러스터 버전과 일치해야 합니다.

**Maven:**

```xml
<properties>
    <ignite.version>3.1.0</ignite.version>
</properties>

<!-- Spring Data JDBC framework -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jdbc</artifactId>
</dependency>

<!-- Ignite SQL dialect for Spring Data -->
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>spring-data-ignite</artifactId>
    <version>${ignite.version}</version>
</dependency>

<!-- Ignite JDBC driver -->
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-jdbc</artifactId>
    <version>${ignite.version}</version>
</dependency>
```

**Gradle:**

```groovy
ext {
    igniteVersion = '3.1.0'
}

// Spring Data JDBC framework
implementation 'org.springframework.boot:spring-boot-starter-data-jdbc'

// Ignite SQL dialect for Spring Data
implementation "org.apache.ignite:spring-data-ignite:${igniteVersion}"

// Ignite JDBC driver
implementation "org.apache.ignite:ignite-jdbc:${igniteVersion}"
```

:::note 버전 일치
`spring-data-ignite`와 `ignite-jdbc` 아티팩트는 Apache Ignite의 일부로 릴리스되므로 버전이 Ignite 릴리스 버전과 일치합니다. Ignite 3.1.0에서는 두 아티팩트 모두 `3.1.0` 버전을 사용하세요.
:::

## 구성 {#configuration}

### 데이터소스 속성 {#datasource-properties}

`application.properties`에서 JDBC 데이터소스를 구성하세요:

```properties
spring.datasource.url=jdbc:ignite:thin://localhost:10800
spring.datasource.driver-class-name=org.apache.ignite.jdbc.IgniteJdbcDriver
```

여러 노드를 사용하는 경우:

```properties
spring.datasource.url=jdbc:ignite:thin://node1:10800,node2:10800,node3:10800
```

### SQL 방언 등록 {#sql-dialect-registration}

Spring Data JDBC는 페이지네이션, 아이덴티티 컬럼, 특정 함수 같은 작업을 위해 데이터베이스별 SQL을 생성해야 합니다. `spring-data-ignite` 아티팩트에는 Ignite 호환 SQL을 생성하는 방법을 Spring Data에 알려주는 `IgniteDialectProvider`가 들어 있습니다.

방언 공급자는 Spring의 SPI 메커니즘으로 등록됩니다. 다음 내용으로 `src/main/resources/META-INF/spring.factories` 파일을 생성하세요:

```properties
org.springframework.data.jdbc.repository.config.DialectResolver$JdbcDialectProvider=org.apache.ignite.data.IgniteDialectProvider
```

이 구성이 없으면 Spring Data는 일반 ANSI SQL로 대체됩니다. 일반 ANSI SQL은 기본 쿼리에는 동작하지만 데이터베이스별 작업에서는 실패할 수 있습니다.

## 애플리케이션 설정 {#application-setup}

Spring Boot 애플리케이션에서 JDBC 저장소를 활성화하세요:

```java
@EnableJdbcRepositories
@SpringBootApplication
public class MyApplication {

    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }
}
```

## 엔티티 정의 {#defining-entities}

엔티티는 Ignite 테이블에 매핑됩니다. Spring Data 애노테이션으로 매핑을 정의하세요:

```java
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("PERSON")
public class Person {

    @Id
    private Long id;
    private String name;
    private String email;

    @Column("COUNTRYCODE")
    private String countryCode;  // Maps to COUNTRYCODE column

    public Person() {}

    public Person(Long id, String name, String email, String countryCode) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.countryCode = countryCode;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCountryCode() { return countryCode; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }
}
```

저장소를 사용하기 전에 Ignite에 해당 테이블을 생성하세요:

```sql
CREATE TABLE PERSON (
    id BIGINT PRIMARY KEY,
    name VARCHAR,
    email VARCHAR,
    COUNTRYCODE VARCHAR
);
```

주요 애노테이션:

- `@Table`은 클래스를 특정 테이블 이름에 매핑합니다.
- `@Id`는 기본 키 필드를 표시합니다.
- `@Column`은 이름이 다를 때 필드를 컬럼에 매핑합니다(Java의 `countryCode`를 SQL의 `COUNTRYCODE`에). `@Column`이 없는 필드는 필드 이름을 기준으로 관례에 따라 매핑됩니다.

## 저장소 정의 {#repository-definition}

`CrudRepository`를 확장하는 저장소 인터페이스를 정의하세요:

```java
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonRepository extends CrudRepository<Person, Long> {
}
```

## CRUD 작업 {#crud-operations}

`CrudRepository` 인터페이스는 표준 데이터 접근 메서드를 제공합니다:

```java
@Service
public class PersonService {

    private final PersonRepository repository;

    public PersonService(PersonRepository repository) {
        this.repository = repository;
    }

    public Person save(Person person) {
        return repository.save(person);
    }

    public Optional<Person> findById(Long id) {
        return repository.findById(id);
    }

    public Iterable<Person> findAll() {
        return repository.findAll();
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    public long count() {
        return repository.count();
    }

    public boolean existsById(Long id) {
        return repository.existsById(id);
    }
}
```

## 파생 쿼리 메서드 {#derived-query-methods}

Spring Data는 메서드 이름에서 쿼리를 생성합니다:

```java
@Repository
public interface PersonRepository extends CrudRepository<Person, Long> {

    // SELECT * FROM PERSON WHERE name = ?
    List<Person> findByName(String name);

    // SELECT * FROM PERSON WHERE name LIKE '%value%'
    List<Person> findByNameContains(String namePart);

    // SELECT * FROM PERSON WHERE email = ?
    Optional<Person> findByEmail(String email);

    // SELECT COUNT(*) FROM PERSON WHERE name = ?
    int countByName(String name);

    // SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM PERSON WHERE name = ?
    boolean existsByName(String name);

    // SELECT * FROM PERSON WHERE name IN (?, ?, ...)
    List<Person> findByNameIn(Collection<String> names);
}
```

## 사용자 정의 쿼리 {#custom-queries}

명시적인 SQL에는 `@Query`를 사용하세요:

```java
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface PersonRepository extends CrudRepository<Person, Long> {

    @Query("SELECT * FROM PERSON WHERE name = :name AND email = :email")
    Optional<Person> findByNameAndEmail(@Param("name") String name, @Param("email") String email);

    @Query("SELECT * FROM PERSON WHERE name IN (:names)")
    List<Person> findByNames(@Param("names") Set<String> names);
}
```

## 페이지네이션 {#pagination}

Spring Data는 페이지 단위 쿼리를 지원합니다:

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

@Repository
public interface PersonRepository extends CrudRepository<Person, Long> {

    // Returns Page with total count
    Page<Person> findByNameContains(String namePart, Pageable pageable);

    // Returns Slice without total count (more efficient for large datasets)
    Slice<Person> findSliceByNameContains(String namePart, Pageable pageable);
}
```

사용법:

```java
@Service
public class PersonService {

    private final PersonRepository repository;

    public PersonService(PersonRepository repository) {
        this.repository = repository;
    }

    public Page<Person> getPage(String namePart, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("name"));
        return repository.findByNameContains(namePart, pageRequest);
    }

    public void processAllPersons(String namePart) {
        Pageable pageable = PageRequest.of(0, 100);
        Slice<Person> slice;

        do {
            slice = repository.findSliceByNameContains(namePart, pageable);
            slice.getContent().forEach(this::process);
            pageable = slice.nextPageable();
        } while (slice.hasNext());
    }

    private void process(Person person) {
        // Process person
    }
}
```

## Query by Example

엔티티 인스턴스를 기반으로 하는 동적 쿼리에는 `QueryByExampleExecutor`를 확장하세요:

```java
import org.springframework.data.repository.query.QueryByExampleExecutor;

@Repository
public interface PersonRepository extends CrudRepository<Person, Long>, QueryByExampleExecutor<Person> {
}
```

사용법:

```java
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;

@Service
public class PersonService {

    private final PersonRepository repository;

    public PersonService(PersonRepository repository) {
        this.repository = repository;
    }

    public List<Person> findByExample(String name, String email) {
        Person probe = new Person();
        probe.setName(name);
        probe.setEmail(email);

        // Match non-null properties
        Example<Person> example = Example.of(probe);
        return (List<Person>) repository.findAll(example);
    }

    public List<Person> findByNameStartsWith(String prefix) {
        Person probe = new Person();
        probe.setName(prefix);

        ExampleMatcher matcher = ExampleMatcher.matching()
            .withMatcher("name", ExampleMatcher.GenericPropertyMatchers.startsWith())
            .withIgnorePaths("id", "email");

        Example<Person> example = Example.of(probe, matcher);
        return (List<Person>) repository.findAll(example);
    }
}
```

## 엔티티 상태 처리 {#handling-entity-state}

Ignite 테이블은 ID를 자동 생성하지 않습니다. `Persistable`을 구현해 INSERT와 UPDATE 중 어떤 동작을 수행할지 제어하세요:

```java
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;

public class Person implements Persistable<Long> {

    @Id
    private Long id;
    private String name;

    @Transient
    private boolean isNew = true;

    @Override
    public Long getId() {
        return id;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    public void setNew(boolean newValue) {
        this.isNew = newValue;
    }

    // After loading from database, mark as not new
    public void markNotNew() {
        this.isNew = false;
    }

    // Other getters and setters
}
```

기존 엔티티를 수정할 때:

```java
Person person = repository.findById(1L).orElseThrow();
person.setName("Updated Name");
person.setNew(false);  // Prevents INSERT, performs UPDATE
repository.save(person);
```

## 지원 기능 {#supported-features}

Ignite 방언은 다음을 지원합니다:

| 기능 | 상태 |
|---------|--------|
| CrudRepository | 지원 |
| PagingAndSortingRepository | 지원 |
| QueryByExampleExecutor | 지원 |
| 파생 쿼리 메서드 | 지원 |
| @Query 애노테이션 | 지원 |
| Page와 Slice | 지원 |
| Sort | 지원 |
| Limit | 지원 |
| Enum 타입 | 지원 |
| 배열 컬럼 | 지원 |

## 제한 사항 {#limitations}

- Ignite는 기본 키를 자동 생성하지 않습니다. ID 값을 명시적으로 제공하세요.
- 락 절(`@Lock`)은 지원되지 않습니다. 방언은 빈 락 절을 반환합니다.
- 연관 엔티티의 단일 쿼리 로딩은 지원되지 않습니다. 연관 엔티티는 별도의 쿼리가 필요합니다.

## 다음 단계 {#next-steps}

- [Spring Boot 통합](./spring-boot) - 자동 구성된 IgniteClient
- [JDBC 드라이버](../connect-to-ignite/jdbc) - JDBC 연결 세부 정보
- [SQL 참조](../../sql) - 테이블 생성 구문
