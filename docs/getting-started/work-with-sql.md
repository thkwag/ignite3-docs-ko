---
title: SQL 다루기
---

import Mermaid from '@theme/Mermaid';

이 가이드는 명령줄 인터페이스로 Apache Ignite 3 SQL 기능을 사용하는 과정을 설명합니다. 분산 Apache Ignite 클러스터를 구성하고, Chinook 데이터베이스(디지털 미디어 스토어를 표현하는 샘플 데이터베이스)를 생성·조작하며, Apache Ignite의 다양한 SQL 기능을 활용하는 방법을 배웁니다.

## 사전 요구 사항 {#prerequisites}

* 시스템에 Docker와 Docker Compose 설치
* SQL 기본 지식
* 명령줄 터미널 사용 환경
* 컨테이너 실행에 사용 가능한 8GB 이상의 RAM
* Chinook 데이터베이스 파일을 내려받은 SQL 디렉터리

## 시작하기 전에 {#before-starting}

이 튜토리얼은 배포를 간소화하기 위해 미리 준비된 파일을 사용합니다. 다음 필수 파일을 내려받았는지 확인하세요.

* docker-compose.yml (문서에서 제공하지 않음)
* sql 압축 파일 (문서에서 제공하지 않음)

압축을 새 폴더에 풀고, 이 폴더와 docker compose 파일을 Docker CLI 명령을 실행할 디렉터리에 함께 배치하세요. 이 튜토리얼은 이 SQL 파일이 준비되어 컨테이너에 마운트되어 있다고 가정합니다.

:::caution
이 파일이 없으면 실습에 필요한 샘플 데이터를 불러올 수 없습니다.
:::

## Apache Ignite 3 클러스터 설정 {#setting-up-an-apache-ignite-3-cluster}

SQL을 사용하기 전에 먼저 Apache Ignite 클러스터를 구성해야 합니다. Docker Compose로 3개 노드로 구성된 클러스터를 생성합니다.

### 클러스터 시작 {#starting-the-cluster}

`docker-compose.yml` 파일이 있는 디렉터리에서 터미널을 열고 Docker로 클러스터를 시작하세요.

```bash
docker compose up -d
```

이 명령은 분리(detached) 모드로 클러스터를 시작합니다. 세 노드 모두에서 시작 메시지가 출력됩니다. 노드가 준비되면 서버가 정상적으로 시작되었다는 메시지가 표시됩니다.

```bash
docker compose up -d

[+] Running 4
 ✔ Network ignite3_default    Created
 ✔ Container ignite3-node2-1  Started
 ✔ Container ignite3-node3-1  Started
 ✔ Container ignite3-node1-1  Started
```

다음 명령으로 모든 컨테이너가 실행 중인지 확인할 수 있습니다.

```bash
docker compose ps
```

세 노드 모두 상태가 "running"으로 표시되어야 합니다.

:::tip
계속하기 전에 세 노드 모두 상태가 "running"인지 확인하세요.
:::

## Ignite CLI로 클러스터에 연결 {#connecting-to-the-cluster-using-ignite-cli}

이제 Ignite 명령줄 인터페이스(CLI)로 실행 중인 클러스터에 연결합니다.

### CLI 시작 {#starting-the-cli}

터미널에서 다음을 실행하세요.

```bash
docker run --rm -it --network=host -e LANG=C.UTF-8 -e LC_ALL=C.UTF-8 -v ./sql/:/opt/ignite/downloads/ apacheignite/ignite:3.0.0 cli
```

이 명령은 클러스터와 같은 Docker 네트워크에 연결된 대화형 CLI 컨테이너를 시작하고, Chinook 데이터베이스의 SQL 파일이 담긴 볼륨을 마운트합니다. 연결 여부를 묻는 메시지가 나오면 기본 노드에 연결하세요. 연결을 거부했다면 다음 명령으로 수동으로 연결할 수 있습니다.

```bash
connect http://localhost:10300
```

`http://localhost:10300`에 연결되었다는 메시지와 클러스터가 아직 초기화되지 않았다는 안내가 표시됩니다.

:::note
CLI 컨테이너는 클러스터 노드와 별도로 실행되지만, Docker 네트워크를 통해 노드에 연결됩니다.
:::

### 클러스터 초기화 {#initializing-the-cluster}

클러스터를 사용하려면 먼저 초기화해야 합니다.

```bash
cluster init --name=ignite3 --metastorage-group=node1,node2,node3
```

:::note
라이선스를 사용할 수 없다면 라이선스 파일이 올바르게 마운트되었는지 확인하세요.
:::

```text
           #              ___                         __
         ###             /   |   ____   ____ _ _____ / /_   ___
     #  #####           / /| |  / __ \ / __ `// ___// __ \ / _ \
   ###  ######         / ___ | / /_/ // /_/ // /__ / / / // ___/
  #####  #######      /_/  |_|/ .___/ \__,_/ \___//_/ /_/ \___/
  #######  ######            /_/
    ########  ####        ____               _  __           _____
   #  ########  ##       /  _/____ _ ____   (_)/ /_ ___     |__  /
  ####  #######  #       / / / __ `// __ \ / // __// _ \     /_ <
   #####  #####        _/ / / /_/ // / / // // /_ / ___/   ___/ /
     ####  ##         /___/ \__, //_/ /_//_/ \__/ \___/   /____/
       ##                  /____/

                      Apache Ignite CLI version 3.1.0


You appear to have not connected to any node yet. Do you want to connect to the default node http://localhost:10300? [Y/n] y
Connected to http://localhost:10300
The cluster is not initialized. Run cluster init command to initialize it.
[node1]> cluster init --name=ignite3
Cluster was initialized successfully
[node1]>
```

## Chinook 데이터베이스 스키마 생성 {#creating-the-chinook-database-schema}

클러스터가 실행 중이고 초기화되었으니, 이제 SQL로 Ignite에서 데이터를 생성하고 다룰 수 있습니다. Chinook 데이터베이스는 디지털 음악 스토어 데이터셋으로, 아티스트·앨범·트랙·고객·판매를 위한 테이블로 구성됩니다.

### SQL 모드 진입 {#entering-sql-mode}

SQL 작업을 시작하려면 CLI에서 SQL 모드로 진입하세요.

```text
sql
```

프롬프트가 `sql-cli>`로 바뀌면 SQL 모드로 진입한 것입니다.

```text
[node1]> sql
sql-cli>
```

### 분산 영역 생성 {#creating-distribution-zones}

테이블을 생성하기 전에, 클러스터 전체에서 데이터가 분산되고 복제되는 방식을 제어하는 분산 영역(distribution zone)을 설정합니다.

```sql
CREATE ZONE IF NOT EXISTS Chinook WITH replicas=2, storage_profiles='default';
CREATE ZONE IF NOT EXISTS ChinookReplicated WITH replicas=3, partitions=25, storage_profiles='default';
```

이 명령은 두 개의 영역을 생성합니다.

* `Chinook` - 대부분의 테이블에 사용하는 복제본 2개짜리 표준 영역
* `ChinookReplicated` - 자주 조회되는 참조 데이터용으로 복제본 3개를 사용하는 영역

### 데이터베이스 엔티티 관계 {#database-entity-relationship}

다음은 Chinook 데이터베이스의 엔티티 관계 다이어그램입니다.

<Mermaid chart={`
erDiagram
    ARTIST ||--o{ ALBUM : creates
    ALBUM ||--o{ TRACK : contains
    GENRE ||--o{ TRACK : categorizes
    MEDIATYPE ||--o{ TRACK : formats
    CUSTOMER ||--o{ INVOICE : places
    INVOICE ||--o{ INVOICELINE : contains
    TRACK ||--o{ INVOICELINE : purchased-in
    EMPLOYEE ||--o{ CUSTOMER : supports
    PLAYLIST ||--o{ PLAYLISTTRACK : contains
    TRACK ||--o{ PLAYLISTTRACK : appears-in
`}/>

### 핵심 테이블 생성 {#creating-core-tables}

이제 Chinook 데이터베이스의 주요 테이블을 생성합니다. Artist 테이블과 Album 테이블부터 시작합니다.

:::note
다음 SQL 블록을 `sql-cli>` 프롬프트에 복사해 붙여넣고 Enter 키를 누르세요.
:::

```sql
CREATE TABLE Artist (
    ArtistId INT NOT NULL,
    Name VARCHAR(120),
    PRIMARY KEY (ArtistId)
) ZONE Chinook;

CREATE TABLE Album (
    AlbumId INT NOT NULL,
    Title VARCHAR(160) NOT NULL,
    ArtistId INT NOT NULL,
    ReleaseYear INT,
    PRIMARY KEY (AlbumId, ArtistId)
) COLOCATE BY (ArtistId) ZONE Chinook;
```

**Album** 테이블의 `COLOCATE BY` 절은 같은 아티스트의 앨범이 같은 노드에 저장되도록 보장합니다. 이렇게 하면 쿼리 실행 중 네트워크 전송이 필요 없어져 Artist 테이블과 Album 테이블 간의 조인이 최적화됩니다.

다음으로 Genre와 MediaType 참조 테이블을 생성합니다.

```sql
CREATE TABLE Genre (
    GenreId INT NOT NULL,
    Name VARCHAR(120),
    PRIMARY KEY (GenreId)
) ZONE ChinookReplicated;

CREATE TABLE MediaType (
    MediaTypeId INT NOT NULL,
    Name VARCHAR(120),
    PRIMARY KEY (MediaTypeId)
) ZONE ChinookReplicated;
```

이 참조 테이블은 정적 데이터를 담고 있고 다른 테이블과 자주 조인되므로 복제본 3개를 사용하는 `ChinookReplicated` 영역에 배치합니다. 각 노드에 사본을 두면 읽기 성능이 향상됩니다.

이제 Album, Genre, MediaType 테이블을 참조하는 Track 테이블을 생성합니다.

```sql
CREATE TABLE Track (
    TrackId INT NOT NULL,
    Name VARCHAR(200) NOT NULL,
    AlbumId INT,
    MediaTypeId INT NOT NULL,
    GenreId INT,
    Composer VARCHAR(220),
    Milliseconds INT NOT NULL,
    Bytes INT,
    UnitPrice NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (TrackId, AlbumId)
) COLOCATE BY (AlbumId) ZONE Chinook;
```

대부분의 쿼리가 트랙을 앨범과 조인하므로, Track은 TrackId가 아니라 AlbumId를 기준으로 콜로케이션(colocation)됩니다. 이 콜로케이션은 이런 일반적인 조인 패턴을 최적화합니다.

이제 고객, 직원, 판매를 관리할 테이블도 생성합니다.

```sql
CREATE TABLE Employee (
    EmployeeId INT NOT NULL,
    LastName VARCHAR(20) NOT NULL,
    FirstName VARCHAR(20) NOT NULL,
    Title VARCHAR(30),
    ReportsTo INT,
    BirthDate DATE,
    HireDate DATE,
    Address VARCHAR(70),
    City VARCHAR(40),
    State VARCHAR(40),
    Country VARCHAR(40),
    PostalCode VARCHAR(10),
    Phone VARCHAR(24),
    Fax VARCHAR(24),
    Email VARCHAR(60),
    PRIMARY KEY (EmployeeId)
) ZONE Chinook;

CREATE TABLE Customer (
    CustomerId INT NOT NULL,
    FirstName VARCHAR(40) NOT NULL,
    LastName VARCHAR(20) NOT NULL,
    Company VARCHAR(80),
    Address VARCHAR(70),
    City VARCHAR(40),
    State VARCHAR(40),
    Country VARCHAR(40),
    PostalCode VARCHAR(10),
    Phone VARCHAR(24),
    Fax VARCHAR(24),
    Email VARCHAR(60) NOT NULL,
    SupportRepId INT,
    PRIMARY KEY (CustomerId)
) ZONE Chinook;

CREATE TABLE Invoice (
    InvoiceId INT NOT NULL,
    CustomerId INT NOT NULL,
    InvoiceDate DATE NOT NULL,
    BillingAddress VARCHAR(70),
    BillingCity VARCHAR(40),
    BillingState VARCHAR(40),
    BillingCountry VARCHAR(40),
    BillingPostalCode VARCHAR(10),
    Total NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (InvoiceId, CustomerId)
) COLOCATE BY (CustomerId) ZONE Chinook;

CREATE TABLE InvoiceLine (
    InvoiceLineId INT NOT NULL,
    InvoiceId INT NOT NULL,
    TrackId INT NOT NULL,
    UnitPrice NUMERIC(10,2) NOT NULL,
    Quantity INT NOT NULL,
    PRIMARY KEY (InvoiceLineId, TrackId)
) COLOCATE BY (TrackId) ZONE Chinook;
```

Invoice는 CustomerId를 기준으로, InvoiceLine은 InvoiceId를 기준으로 콜로케이션됩니다. 이렇게 하면 Customer → Invoice → InvoiceLine으로 이어지는 효율적인 지역성 체인이 만들어져, 고객 구매 이력을 분석하는 쿼리가 최적화됩니다.

마지막으로 플레이리스트 관련 테이블을 생성합니다.

```sql
CREATE TABLE Playlist (
    PlaylistId INT NOT NULL,
    Name VARCHAR(120),
    PRIMARY KEY (PlaylistId)
) ZONE Chinook;

CREATE TABLE PlaylistTrack (
    PlaylistId INT NOT NULL,
    TrackId INT NOT NULL,
    PRIMARY KEY (PlaylistId, TrackId)
) ZONE Chinook;
```

PlaylistTrack은 Track과 콜로케이션되지 않는다는 점에 유의하세요. 이는 트랙 세부 정보와의 조인보다 플레이리스트 작업을 우선하는 설계 결정입니다. 실제 환경에서는 가장 자주 실행하는 쿼리 패턴에 따라 다른 콜로케이션 선택을 할 수도 있습니다.

### 테이블 생성 확인 {#verifying-table-creation}

모든 테이블이 정상적으로 생성되었는지 확인합니다.

```sql
SELECT * FROM system.tables WHERE schema = 'PUBLIC';
```

이 쿼리는 시스템 테이블을 조회해 생성한 테이블이 존재하는지 확인합니다. 생성한 모든 테이블의 목록이 표시됩니다.

```bash
sql-cli> SELECT * FROM system.tables WHERE schema = 'PUBLIC';
╔════════╤═══════════════╤════╤═════════════╤═══════════════════╤═════════════════╤══════════════════════╗
║ SCHEMA │ NAME          │ ID │ PK_INDEX_ID │ ZONE              │ STORAGE_PROFILE │ COLOCATION_KEY_INDEX ║
╠════════╪═══════════════╪════╪═════════════╪═══════════════════╪═════════════════╪══════════════════════╣
║ PUBLIC │ ALBUM         │ 20 │ 21          │ CHINOOK           │ default         │ ARTISTID             ║
╟────────┼───────────────┼────┼─────────────┼───────────────────┼─────────────────┼──────────────────────╢
║ PUBLIC │ GENRE         │ 22 │ 23          │ CHINOOKREPLICATED │ default         │ GENREID              ║
╟────────┼───────────────┼────┼─────────────┼───────────────────┼─────────────────┼──────────────────────╢
║ PUBLIC │ ARTIST        │ 18 │ 19          │ CHINOOK           │ default         │ ARTISTID             ║
╟────────┼───────────────┼────┼─────────────┼───────────────────┼─────────────────┼──────────────────────╢
║ PUBLIC │ TRACK         │ 26 │ 27          │ CHINOOK           │ default         │ ALBUMID              ║
╟────────┼───────────────┼────┼─────────────┼───────────────────┼─────────────────┼──────────────────────╢
║ PUBLIC │ PLAYLIST      │ 36 │ 37          │ CHINOOK           │ default         │ PLAYLISTID           ║
╟────────┼───────────────┼────┼─────────────┼───────────────────┼─────────────────┼──────────────────────╢
║ PUBLIC │ PLAYLISTTRACK │ 38 │ 39          │ CHINOOK           │ default         │ PLAYLISTID, TRACKID  ║
╟────────┼───────────────┼────┼─────────────┼───────────────────┼─────────────────┼──────────────────────╢
║ PUBLIC │ MEDIATYPE     │ 24 │ 25          │ CHINOOKREPLICATED │ default         │ MEDIATYPEID          ║
╟────────┼───────────────┼────┼─────────────┼───────────────────┼─────────────────┼──────────────────────╢
║ PUBLIC │ INVOICELINE   │ 34 │ 35          │ CHINOOK           │ default         │ TRACKID              ║
╟────────┼───────────────┼────┼─────────────┼───────────────────┼─────────────────┼──────────────────────╢
║ PUBLIC │ EMPLOYEE      │ 28 │ 29          │ CHINOOK           │ default         │ EMPLOYEEID           ║
╟────────┼───────────────┼────┼─────────────┼───────────────────┼─────────────────┼──────────────────────╢
║ PUBLIC │ CUSTOMER      │ 30 │ 31          │ CHINOOK           │ default         │ CUSTOMERID           ║
╟────────┼───────────────┼────┼─────────────┼───────────────────┼─────────────────┼──────────────────────╢
║ PUBLIC │ INVOICE       │ 32 │ 33          │ CHINOOK           │ default         │ CUSTOMERID           ║
╚════════╧═══════════════╧════╧═════════════╧═══════════════════╧═════════════════╧══════════════════════╝
```

:::tip Checkpoint
다음 섹션으로 넘어가기 전에, `system.tables` 출력에 모든 테이블이 올바른 영역과 콜로케이션 설정으로 표시되는지 확인하세요.
:::

## 샘플 데이터 삽입 {#inserting-sample-data}

테이블 설정을 마쳤으니, 이제 샘플 데이터로 채웁니다.

### 아티스트와 앨범 추가 {#adding-artists-and-albums}

먼저 아티스트 데이터를 추가합니다.

* `exit;`를 입력해 대화형 SQL 모드를 종료하세요.
* 그런 다음 SQL 데이터 파일에서 현재 스토어 카탈로그를 불러오세요.

```bash
sql --file=/opt/ignite/downloads/current_catalog.sql
```

```bash
sql-cli> exit;
[node1]> sql --file=/opt/ignite/downloads/current_catalog.sql
Updated 275 rows.
Updated 347 rows.
```

### 장르와 미디어 타입 추가 {#adding-genres-and-media-types}

같은 방식으로 참조 테이블을 채웁니다.

```bash
sql --file=/opt/ignite/downloads/media_and_genre.sql
```

```bash
[node1]> sql --file=/opt/ignite/downloads/media_and_genre.sql
Updated 25 rows.
Updated 5 rows.
```

### 트랙 추가 {#adding-tracks}

이제 앨범에 트랙을 추가합니다.

```bash
sql --file=/opt/ignite/downloads/tracks.sql
```

```bash
[node1]> sql --file=/opt/ignite/downloads/tracks.sql
Updated 1000 rows.
Updated 1000 rows.
Updated 1000 rows.
Updated 503 rows.
```

### 직원과 고객 추가 {#adding-employees-and-customers}

직원과 고객 데이터를 추가합니다.

```bash
sql --file=/opt/ignite/downloads/ee_and_cust.sql
```

```bash
[node1]> sql --file=/opt/ignite/downloads/ee_and_cust.sql
Updated 8 rows.
Updated 59 rows.
```

### 인보이스와 인보이스 라인 추가 {#adding-invoices-and-invoice-lines}

마지막으로 판매 데이터를 추가합니다.

```bash
sql --file=/opt/ignite/downloads/invoices.sql
```

```bash
[node1]> sql --file=/opt/ignite/downloads/invoices.sql
Updated 412 rows.
Updated 1000 rows.
Updated 1000 rows.
Updated 240 rows.
Updated 18 rows.
Updated 1000 rows.
Updated 1000 rows.
Updated 1000 rows.
Updated 1000 rows.
Updated 1000 rows.
Updated 1000 rows.
Updated 1000 rows.
Updated 1000 rows.
Updated 715 rows.
```

:::tip Checkpoint
각 파일에 대해 "Updated X rows" 메시지가 예상 행 수와 일치하는지 확인해, 모든 데이터가 정상적으로 로드되었는지 검증하세요.
:::

## Ignite SQL에서 데이터 조회 {#querying-data-in-ignite-sql}

테이블에 데이터가 준비되었으니, SQL 쿼리를 실행해 Chinook 데이터베이스를 살펴봅니다.

### 기본 쿼리 {#basic-queries}

`sql-cli>`로 돌아가 간단한 SELECT 쿼리부터 시작합니다.

```bash
sql
```

```sql
-- Get all artists
SELECT * FROM Artist;

-- Get all albums for a specific artist
SELECT * FROM Album WHERE ArtistId = 3;

-- Get all tracks for a specific album
SELECT * FROM Track WHERE AlbumId = 133;
```

### 조인 {#joins}

이번에는 조인을 사용하는 더 복잡한 쿼리를 살펴봅니다.

```sql
-- Get all tracks with artist and album information
SELECT
    t.Name AS TrackName,
    a.Title AS AlbumTitle,
    ar.Name AS ArtistName
FROM
    Track t
    JOIN Album a ON t.AlbumId = a.AlbumId
    JOIN Artist ar ON a.ArtistId = ar.ArtistId
LIMIT 10;
```

## Ignite SQL에서 데이터 조작 {#data-manipulation-in-ignite-sql}

Ignite에서 SQL로 데이터를 수정하는 방법을 살펴봅니다.

### 분산 업데이트 이해하기 {#understanding-distributed-updates}

분산 데이터베이스에서 데이터를 업데이트하면, 변경 사항을 여러 노드에 걸쳐 조정해야 합니다.

<Mermaid chart={`
sequenceDiagram
    participant Client
    participant Node1
    participant Node2
    participant Node3

    Client->>Node1: UPDATE request
    Node1->>Node1: Update local primary copy
    Node1->>Node2: Propagate changes to backup copy
    Node1-->>Client: Confirm update completed
`}/>

### 새 데이터 삽입 {#inserting-new-data}

새 아티스트와 앨범을 추가합니다.

```sql
-- Insert a new artist
INSERT INTO Artist (ArtistId, Name)
VALUES (276, 'New Discovery Band');

-- Insert a new album for this artist
INSERT INTO Album (AlbumId, Title, ArtistId, ReleaseYear)
VALUES (348, 'First Light', 276, 2023);

-- Verify the insertions
SELECT * FROM Artist WHERE ArtistId = 276;
SELECT * FROM Album WHERE AlbumId = 348;
```

### 기존 데이터 업데이트 {#updating-existing-data}

기존 데이터 일부를 업데이트합니다.

```sql
-- Update the album release year
UPDATE Album
SET ReleaseYear = 2024
WHERE AlbumId = 348;

-- Update the artist name
UPDATE Artist
SET Name = 'New Discovery Ensemble'
WHERE ArtistId = 276;

-- Verify the updates
SELECT * FROM Artist WHERE ArtistId = 276;
SELECT * FROM Album WHERE AlbumId = 348;
```

Ignite와 같은 분산 데이터베이스에서는 이러한 업데이트가 모든 복제본에 자동으로 전파됩니다. 프라이머리 사본이 먼저 업데이트된 다음, 변경 사항이 다른 노드의 백업 사본으로 전송됩니다.

### 데이터 삭제 {#deleting-data}

마지막으로 추가했던 데이터를 삭제해 정리합니다.

```sql
-- Delete the album
DELETE FROM Album WHERE AlbumId = 348;

-- Delete the artist
DELETE FROM Artist WHERE ArtistId = 276;

-- Verify the deletions
SELECT * FROM Artist WHERE ArtistId = 276;
SELECT * FROM Album WHERE AlbumId = 348;
```

## 고급 SQL 기능 {#advanced-sql-features}

Ignite의 고급 SQL 기능 몇 가지를 살펴봅니다.

### 시스템 뷰 조회 {#querying-system-views}

Ignite는 클러스터 메타데이터를 조사할 수 있는 시스템 뷰를 제공합니다.

```sql
-- View all tables in the cluster
SELECT * FROM system.tables;

-- View all zones
SELECT * FROM system.zones;

-- View all columns for a specific table
SELECT * FROM system.table_columns WHERE TABLE_NAME = 'TRACK';
```

시스템 뷰는 클러스터 구성에 관한 중요한 메타데이터를 제공하며, 프로덕션 환경에서 모니터링과 문제 해결에 필수적입니다.

### 성능 개선을 위한 인덱스 생성 {#creating-indexes-for-better-performance}

쿼리 성능을 개선할 인덱스를 몇 개 추가합니다.

```sql
-- Create an index on the Name column of the Track table
CREATE INDEX idx_track_name ON Track (Name);

-- Create a composite index on Artist and Album
CREATE INDEX idx_album_artist ON Album (ArtistId, Title);

-- Create a composite index on Track's AlbumId and Name columns to optimize joins with Album table
-- and to improve performance when filtering or sorting by track name within an album
CREATE INDEX idx_track_albumid_name ON Track(AlbumId, Name);

-- Create an index on Album Title to speed up searches and sorts by album title
CREATE INDEX idx_album_title ON Album(Title);

-- Create a composite index on InvoiceLine connecting TrackId and InvoiceId
-- This supports efficient queries that join InvoiceLine with Track while filtering by InvoiceId
CREATE INDEX idx_invoiceline_trackid_invoiceid ON InvoiceLine(TrackId, InvoiceId);

-- Create a hash index for lookups by email
CREATE INDEX idx_customer_email ON Customer USING HASH (Email);

-- Check index information
SELECT * FROM system.indexes;
```

인덱스는 쿼리 성능을 개선하지만 유지 관리 비용이 따릅니다. 쓰기 작업이 발생할 때마다 모든 인덱스를 함께 업데이트해야 합니다. 모든 컬럼에 인덱스를 만들기보다는, 가장 자주 실행하는 쿼리 패턴을 지원하는 인덱스를 선택하세요.

## SQL로 대시보드 만들기 {#creating-a-dashboard-using-sql}

음악 스토어 대시보드에 사용할 수 있는 SQL 쿼리를 작성합니다. 이 쿼리는 저장해 두었다가 주기적으로 실행해 보고서를 생성할 수 있습니다.

### 월별 매출 요약 {#monthly-sales-summary}

```sql
-- Monthly sales summary for the last 12 months
SELECT
    CAST(EXTRACT(YEAR FROM i.InvoiceDate) AS VARCHAR) || '-' ||
    CASE
        WHEN EXTRACT(MONTH FROM i.InvoiceDate) < 10
        THEN '0' || CAST(EXTRACT(MONTH FROM i.InvoiceDate) AS VARCHAR)
        ELSE CAST(EXTRACT(MONTH FROM i.InvoiceDate) AS VARCHAR)
    END AS YearMonth,
    COUNT(DISTINCT i.InvoiceId) AS InvoiceCount,
    COUNT(DISTINCT i.CustomerId) AS CustomerCount,
    SUM(i.Total) AS MonthlyRevenue,
    AVG(i.Total) AS AverageOrderValue
FROM
    Invoice i
GROUP BY
    EXTRACT(YEAR FROM i.InvoiceDate), EXTRACT(MONTH FROM i.InvoiceDate)
ORDER BY
    YearMonth DESC;
```

이 쿼리는 연도와 월을 정렬 가능한 문자열(YYYY-MM)로 만들면서 주요 비즈니스 메트릭 몇 가지를 함께 계산합니다.

### 최다 판매 장르 {#top-selling-genres}

```sql
-- Top selling genres by revenue
SELECT
    g.Name AS Genre,
    SUM(il.UnitPrice * il.Quantity) AS Revenue
FROM
    InvoiceLine il
    JOIN Track t ON il.TrackId = t.TrackId
    JOIN Genre g ON t.GenreId = g.GenreId
GROUP BY
    g.Name
ORDER BY
    Revenue DESC;
```

### 직원별 판매 실적 {#sales-performance-by-employee}

```sql
-- Sales performance by employee
SELECT
    e.EmployeeId,
    e.FirstName || ' ' || e.LastName AS EmployeeName,
    COUNT(DISTINCT i.InvoiceId) AS TotalInvoices,
    COUNT(DISTINCT i.CustomerId) AS UniqueCustomers,
    SUM(i.Total) AS TotalSales
FROM
    Employee e
    JOIN Customer c ON e.EmployeeId = c.SupportRepId
    JOIN Invoice i ON c.CustomerId = i.CustomerId
GROUP BY
    e.EmployeeId, e.FirstName, e.LastName
ORDER BY
    TotalSales DESC;
```

### 장르별 최장 트랙 20곡 {#top-20-longest-tracks-with-genres}

```sql
-- Top 20 longest tracks with genre information
SELECT
    t.trackid,
    t.name AS track_name,
    g.name AS genre_name,
    ROUND(t.milliseconds / (1000 * 60), 2) AS duration_minutes
FROM
    track t
    JOIN genre g ON t.genreId = g.genreId
WHERE
    t.genreId < 17
ORDER BY
    duration_minutes DESC
LIMIT
    20;
```

### 월별 고객 구매 패턴 {#customer-purchase-patterns-by-month}

```sql
-- Customer purchase patterns by month
SELECT
    c.CustomerId,
    c.FirstName || ' ' || c.LastName AS CustomerName,
    CAST(EXTRACT(YEAR FROM i.InvoiceDate) AS VARCHAR) || '-' ||
    CASE
        WHEN EXTRACT(MONTH FROM i.InvoiceDate) < 10
        THEN '0' || CAST(EXTRACT(MONTH FROM i.InvoiceDate) AS VARCHAR)
        ELSE CAST(EXTRACT(MONTH FROM i.InvoiceDate) AS VARCHAR)
    END AS YearMonth,
    COUNT(DISTINCT i.InvoiceId) AS NumberOfPurchases,
    SUM(i.Total) AS TotalSpent,
    SUM(i.Total) / COUNT(DISTINCT i.InvoiceId) AS AveragePurchaseValue
FROM
    Customer c
    JOIN Invoice i ON c.CustomerId = i.CustomerId
GROUP BY
    c.CustomerId, c.FirstName, c.LastName,
    EXTRACT(YEAR FROM i.InvoiceDate), EXTRACT(MONTH FROM i.InvoiceDate)
ORDER BY
    c.CustomerId, YearMonth;
```

## 콜로케이션된 테이블로 성능 튜닝하기 {#performance-tuning-with-colocated-tables}

Ignite의 핵심 장점 중 하나는 데이터 콜로케이션으로 조인을 최적화하는 능력입니다. 기존에 콜로케이션된 테이블로 이를 살펴봅니다.

### 콜로케이션된 쿼리 {#colocated-queries}

먼저 콜로케이션 전략이 어긋난 쿼리를 살펴봅니다.

```sql
--This is an example of a poorly created table.
CREATE TABLE InvoiceLine (
    InvoiceLineId INT NOT NULL,
    InvoiceId INT NOT NULL,
    TrackId INT NOT NULL,
    UnitPrice NUMERIC(10,2) NOT NULL,
    Quantity INT NOT NULL,
    PRIMARY KEY (InvoiceLineId, InvoiceId)
) COLOCATE BY (InvoiceId) ZONE Chinook;
```

`InvoiceLine` 테이블을 InvoiceId 기준으로 콜로케이션하면, 쿼리에 불일치가 발생합니다.

* Album은 ArtistId를 기준으로 콜로케이션됩니다
* Track은 AlbumId를 기준으로 콜로케이션됩니다
* InvoiceLine은 InvoiceId를 기준으로 콜로케이션됩니다

즉, InvoiceLine·Track·Album을 조인하는 쿼리를 실행하면, 각 테이블이 서로 다른 키로 콜로케이션되어 있어 데이터가 여러 노드에 흩어져 있을 수 있습니다. 이 쿼리는 invoice ID 1을 조회한 다음 Track, Album과 조인하지만, 이 테이블은 서로 다른 키로 콜로케이션되어 있습니다.

```sql
EXPLAIN PLAN FOR
SELECT
    il.InvoiceId,
    COUNT(il.InvoiceLineId) AS LineItemCount,
    SUM(il.UnitPrice * il.Quantity) AS InvoiceTotal,
    t.Name AS TrackName,
    a.Title AS AlbumTitle
FROM
    InvoiceLine il
    JOIN Track t ON il.TrackId = t.TrackId
    JOIN Album a ON t.AlbumId = a.AlbumId
WHERE
    il.InvoiceId = 1
GROUP BY
    il.InvoiceId, t.Name, a.Title;
```

```text
╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║ PLAN                                                                                                                                                                                                                                                                                      ║
╠═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ Project(INVOICEID=[$0], LINEITEMCOUNT=[$3], INVOICETOTAL=[$4], TRACKNAME=[$1], ALBUMTITLE=[$2]): rowcount = 4484471.100479999, cumulative cost = IgniteCost [rowCount=2.3054813220479995E7, cpu=2.3643376967575923E7, memory=9.866772781055996E7, io=2.0, network=50190.0], id = 23843    ║
║   ColocatedHashAggregate(group=[{0, 1, 2}], LINEITEMCOUNT=[COUNT()], INVOICETOTAL=[SUM($3)]): rowcount = 4484471.100479999, cumulative cost = IgniteCost [rowCount=1.8570341119999997E7, cpu=1.9158904867095925E7, memory=9.866772681055996E7, io=1.0, network=50189.0], id = 23842       ║
║     Project(INVOICEID=[$3], TRACKNAME=[$1], ALBUMTITLE=[$8], $f4=[*($5, $6)]): rowcount = 9189489.959999999, cumulative cost = IgniteCost [rowCount=9380851.159999998, cpu=9969414.907095924, memory=9362.6, io=1.0, network=50189.0], id = 23841                                         ║
║       MergeJoin(condition=[=($2, $7)], joinType=[inner], leftCollation=[[2]], rightCollation=[[0]]): rowcount = 9189489.959999999, cumulative cost = IgniteCost [rowCount=191360.19999999998, cpu=779923.9470959246, memory=9361.6, io=0.0, network=50188.0], id = 23840                  ║
║         HashJoin(condition=[=($4, $0)], joinType=[inner]): rowcount = 176551.19999999998, cumulative cost = IgniteCost [rowCount=13421.0, cpu=65201.0, memory=6585.6, io=0.0, network=47412.0], id = 23836                                                                                ║
║           Exchange(distribution=[single]): rowcount = 3503.0, cumulative cost = IgniteCost [rowCount=7006.0, cpu=17515.0, memory=0.0, io=0.0, network=42036.0], id = 23833                                                                                                                ║
║             IndexScan(table=[[PUBLIC, TRACK]], tableId=[26], index=[IDX_TRACK_ALBUMID_NAME], type=[SORTED], requiredColumns=[{0, 1, 2}], collation=[[2, 1]]): rowcount = 3503.0, cumulative cost = IgniteCost [rowCount=3503.0, cpu=14012.0, memory=0.0, io=0.0, network=0.0], id = 23832 ║
║           Exchange(distribution=[single]): rowcount = 336.0, cumulative cost = IgniteCost [rowCount=2576.0, cpu=9296.0, memory=0.0, io=0.0, network=5376.0], id = 23835                                                                                                                   ║
║             TableScan(table=[[PUBLIC, INVOICELINE]], tableId=[34], filters=[=($t0, 1)], requiredColumns=[{1, 2, 3, 4}]): rowcount = 336.0, cumulative cost = IgniteCost [rowCount=2240.0, cpu=8960.0, memory=0.0, io=0.0, network=0.0], id = 23834                                        ║
║         Exchange(distribution=[single]): rowcount = 347.0, cumulative cost = IgniteCost [rowCount=1041.0, cpu=7130.147095924681, memory=2776.0, io=0.0, network=2776.0], id = 23839                                                                                                       ║
║           Sort(sort0=[$0], dir0=[ASC]): rowcount = 347.0, cumulative cost = IgniteCost [rowCount=694.0, cpu=6783.147095924681, memory=2776.0, io=0.0, network=0.0], id = 23838                                                                                                            ║
║             TableScan(table=[[PUBLIC, ALBUM]], tableId=[20], requiredColumns=[{0, 1}]): rowcount = 347.0, cumulative cost = IgniteCost [rowCount=347.0, cpu=347.0, memory=0.0, io=0.0, network=0.0], id = 23837                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

#### 실행 계획의 주요 관찰 사항 {#key-observations-in-the-execution-plan}

**ColocatedHashAggregate 연산**: 이 실행 계획은 `ColocatedHashAggregate` 연산을 사용합니다. 이는 결과를 합치기 전에 콜로케이션된 데이터에서 집계 일부를 수행할 수 있음을 Ignite가 인식했다는 뜻입니다. 이렇게 하면 `GROUP BY` 연산 중 네트워크 전송이 줄어듭니다.

**Exchange 연산**: 실행 계획에 `Exchange(distribution=[single])` 연산이 여러 번 나타나는데, 이는 노드 간 데이터 이동이 여전히 필요하다는 뜻입니다. 이 연산은 Album 테이블, Track 테이블, 그리고 필터링된 InvoiceLine 결과에 적용됩니다.

**조인 구현**: 실행 계획은 중첩 루프 조인 대신 `HashJoin`과 `MergeJoin` 연산을 조합해 사용합니다. 옵티마이저는 해당 데이터 양에서 이 조인 방식이 더 효율적이라고 판단했습니다.

* Track과 Album을 조인할 때는 HashJoin
* 위 결과를 InvoiceLine과 조인할 때는 MergeJoin

**효율적인 데이터 접근**: 이 쿼리는 InvoiceLine에 대해 전체 테이블 스캔 대신 `IDX_INVOICELINE_INVOICE_TRACK` 인덱스를 사용하는 `IndexScan`을 활용합니다. 이 방식은 다음과 같은 이점을 제공합니다.

* InvoiceId = 1에 대해 `searchBounds: [ExactBounds [bound=1], null]`을 사용한 효율적인 필터링
* `collation: [INVOICEID ASC, TRACKID ASC]`로 미리 정렬된 결과

**행 수 추정**: 조인 이후 예상 행 수가 크게 증가하는 것으로 나타납니다.

* 필터링된 초기 InvoiceLine 행 수: 746
* Album과 HashJoin 후: 182,331
* Track과 MergeJoin 후: 20,400,668

### 개선된 콜로케이션 전략 {#improved-cololocation-strategy}

하지만 `InvoiceLine` 테이블을 `TrackId` 기준으로 콜로케이션하면 쿼리가 크게 최적화됩니다.

```sql
--This table was already created on an earlier step.
CREATE TABLE InvoiceLine (
    InvoiceLineId INT NOT NULL,
    InvoiceId INT NOT NULL,
    TrackId INT NOT NULL,
    UnitPrice NUMERIC(10,2) NOT NULL,
    Quantity INT NOT NULL,
    PRIMARY KEY (InvoiceLineId, TrackId)
) COLOCATE BY (TrackId) ZONE Chinook;
```

그리고 `EXPLAIN PLAN FOR`를 다시 실행합니다...

```sql
EXPLAIN PLAN FOR
SELECT
    il.InvoiceId,
    COUNT(il.InvoiceLineId) AS LineItemCount,
    SUM(il.UnitPrice * il.Quantity) AS InvoiceTotal,
    t.Name AS TrackName,
    a.Title AS AlbumTitle
FROM
    Track t
    JOIN Album a ON t.AlbumId = a.AlbumId
    JOIN InvoiceLine il ON t.TrackId = il.TrackId
WHERE
    il.InvoiceId = 1
GROUP BY
    il.InvoiceId, t.Name, a.Title;
```

```text
╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║ PLAN                                                                                                                                                                                                                                                                                       ║
╠════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ Project(INVOICEID=[$0], LINEITEMCOUNT=[$3], INVOICETOTAL=[$4], TRACKNAME=[$1], ALBUMTITLE=[$2]): rowcount = 2.0019960269999995E9, cumulative cost = IgniteCost [rowCount=1.020839200715E10, cpu=1.0214411135647097E10, memory=4.404685537199999E10, io=2.0, network=2444814.0], id = 25112 ║
║   ColocatedHashAggregate(group=[{0, 1, 2}], LINEITEMCOUNT=[COUNT()], INVOICETOTAL=[SUM($3)]): rowcount = 2.0019960269999995E9, cumulative cost = IgniteCost [rowCount=8.20639597915E9, cpu=8.212415107647097E9, memory=4.404685537099999E10, io=1.0, network=2444813.0], id = 25111        ║
║     Project(INVOICEID=[$5], TRACKNAME=[$1], ALBUMTITLE=[$4], $f4=[*($7, $8)]): rowcount = 4.102450875E9, cumulative cost = IgniteCost [rowCount=4.10394510415E9, cpu=4.109964232647096E9, memory=2942777.0, io=1.0, network=2444813.0], id = 25110                                         ║
║       HashJoin(condition=[=($0, $6)], joinType=[inner]): rowcount = 4.102450875E9, cumulative cost = IgniteCost [rowCount=1494228.15, cpu=7513356.647095924, memory=2942776.0, io=0.0, network=2444812.0], id = 25109                                                                      ║
║         MergeJoin(condition=[=($2, $3)], joinType=[inner], leftCollation=[[2, 1]], rightCollation=[[0]]): rowcount = 182331.15, cumulative cost = IgniteCost [rowCount=11897.0, cpu=40045.14709592468, memory=2776.0, io=0.0, network=44812.0], id = 25106                                 ║
║           Exchange(distribution=[single]): rowcount = 3503.0, cumulative cost = IgniteCost [rowCount=7006.0, cpu=17515.0, memory=0.0, io=0.0, network=42036.0], id = 25102                                                                                                                 ║
║             IndexScan(table=[[PUBLIC, TRACK]], tableId=[26], index=[IDX_TRACK_ALBUMID_NAME], type=[SORTED], requiredColumns=[{0, 1, 2}], collation=[[2, 1]]): rowcount = 3503.0, cumulative cost = IgniteCost [rowCount=3503.0, cpu=14012.0, memory=0.0, io=0.0, network=0.0], id = 25101  ║
║           Exchange(distribution=[single]): rowcount = 347.0, cumulative cost = IgniteCost [rowCount=1041.0, cpu=7130.147095924681, memory=2776.0, io=0.0, network=2776.0], id = 25105                                                                                                      ║
║             Sort(sort0=[$0], dir0=[ASC]): rowcount = 347.0, cumulative cost = IgniteCost [rowCount=694.0, cpu=6783.147095924681, memory=2776.0, io=0.0, network=0.0], id = 25104                                                                                                           ║
║               TableScan(table=[[PUBLIC, ALBUM]], tableId=[20], requiredColumns=[{0, 1}]): rowcount = 347.0, cumulative cost = IgniteCost [rowCount=347.0, cpu=347.0, memory=0.0, io=0.0, network=0.0], id = 25103                                                                          ║
║         Exchange(distribution=[single]): rowcount = 150000.0, cumulative cost = IgniteCost [rowCount=1150000.0, cpu=4150000.0, memory=0.0, io=0.0, network=2400000.0], id = 25108                                                                                                          ║
║           TableScan(table=[[PUBLIC, INVOICELINE]], tableId=[46], filters=[=($t0, 1)], requiredColumns=[{1, 2, 3, 4}]): rowcount = 150000.0, cumulative cost = IgniteCost [rowCount=1000000.0, cpu=4000000.0, memory=0.0, io=0.0, network=0.0], id = 25107                                  ║
╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

#### 실행 계획의 주요 관찰 사항 {#key-observations-in-the-execution-plan-1}

**ColocatedHashAggregate 연산**: 이 실행 계획은 `ColocatedHashAggregate` 연산을 사용합니다. 이는 결과를 합치기 전에 콜로케이션된 데이터에서 집계 일부를 수행할 수 있음을 Ignite가 인식했다는 뜻입니다. 이렇게 하면 `GROUP BY` 연산 중 네트워크 전송이 줄어듭니다.

**개선된 행 수 추정치**: 행 수 추정치가 크게 개선되어, 이제 각 단계에서 1행만 표시되는 점에 주목하세요. 이는 수백만 행을 추정했던 기존 실행 계획보다 옵티마이저가 실제 데이터 분포에 대한 통계와 이해가 훨씬 정확해졌음을 보여줍니다.

**조인 구현**: 실행 계획은 `HashJoin`과 `MergeJoin` 연산의 조합을 보여줍니다.

* Track과 InvoiceLine을 조인할 때는 HashJoin
* 위 결과를 Album과 조인할 때는 MergeJoin

**효율적인 인덱스 사용**: 이 쿼리는 이제 Track 테이블의 복합 인덱스 `IDX_TRACK_ALBUMID_NAME`을 사용하며, 다음과 같은 이점을 제공합니다.

* AlbumId와 Name 기준의 효율적인 정렬 접근
* 조인과 SELECT 연산에 필요한 필드에 대한 직접 접근

**Exchange 연산**: Exchange 연산은 실행 계획에 여전히 나타나지만, 예상 행 수는 이제 최소 수준(교환당 1행)입니다. 이는 수백만 행이 전송될 것으로 추정됐던 기존 계획보다 노드 간 데이터 이동이 훨씬 적다는 것을 시사합니다.

#### 콜로케이션 영향 {#colocation-impact}

이 실행 계획에서 나타난 큰 개선은 Ignite에서 적절한 데이터 콜로케이션이 얼마나 효과적인지 보여줍니다. 방법은 다음과 같습니다.

1. 테이블을 최적의 순서(Track → Album → InvoiceLine)로 조인하도록 쿼리를 구성
2. 적절한 보조 인덱스를 생성
3. 관련 테이블 간 올바른 콜로케이션을 보장

이를 통해 예상 행 수와 데이터 이동이 크게 줄었습니다. 실행 계획은 이제 각 단계에서 최소한의 행 추정치로 간소화된 연산을 보여주며, 이는 데이터 지역성을 활용하는 효율적인 실행 경로임을 나타냅니다.

이러한 최적화 접근 방식은 분산 SQL 데이터베이스에서 최적의 성능을 내기 위한 세 가지 핵심 원칙을 보여줍니다.

* 관련 데이터의 올바른 콜로케이션
* 조인 패턴에 맞춘 보조 인덱스
* 콜로케이션 모델을 따르는 쿼리 구조

## 정리하기 {#cleaning-up}

Ignite SQL CLI 사용을 마쳤다면, 다음을 입력해 종료할 수 있습니다.

```sql
exit;
```

이렇게 하면 Ignite CLI로 돌아갑니다. Ignite CLI를 종료하려면 다음을 입력하세요.

```bash
exit
```

Ignite 클러스터를 중지하려면 터미널에서 다음 명령을 실행하세요.

```bash
docker compose down
```

이 명령은 Ignite 클러스터의 Docker 컨테이너를 중지하고 제거합니다.

## Ignite SQL 모범 사례 {#best-practices-for-ignite-sql}

Ignite SQL을 최대한 활용하려면 다음 모범 사례를 따르세요.

### 스키마 설계 {#schema-design}

* 자주 조인되는 테이블에는 적절한 콜로케이션을 사용하세요
* 클러스터 전체에 데이터를 고르게 분산하는 기본 키를 선택하세요
* 특히 대규모 배포에서는 쿼리 패턴을 염두에 두고 설계하세요

### 쿼리 최적화 {#query-optimization}

* `WHERE`, `JOIN`, `ORDER BY` 절에서 사용하는 컬럼에는 인덱스를 생성하세요
* `EXPLAIN` 문으로 쿼리를 분석하고 최적화하세요
* 카티션 곱과 비효율적인 조인 조건을 피하세요

### 트랜잭션 관리 {#transaction-management}

* 트랜잭션은 가능한 한 짧게 유지하세요
* 사용자 입력을 기다리는 동안 트랜잭션을 열어 두지 마세요
* 원자성을 위해 관련 작업을 하나의 트랜잭션으로 묶으세요

### 리소스 관리 {#resource-management}

* 프로덕션 환경에서 쿼리 성능을 모니터링하세요
* 매우 큰 테이블에는 파티셔닝 전략을 고려하세요
* 저장 공간 요구량을 최소화하려면 적절한 데이터 타입을 사용하세요

## 다음 단계 {#whats-next}

Ignite의 SQL 기능은 고처리량, 낮은 지연, 강한 일관성을 요구하는 분산 애플리케이션을 구축하기 위한 플랫폼입니다. 이 가이드의 패턴과 방식을 따르면 Ignite SQL로 확장 가능하고 복원력 있는 시스템을 구축할 수 있습니다.

Ignite는 단순한 SQL 데이터베이스가 아니라는 점을 기억하세요. 여기서 다룬 것 이상의 기능을 갖춘 분산 컴퓨트 플랫폼입니다. Ignite SQL에 익숙해지면, 컴퓨트 그리드, 머신러닝, 스트림 처리 같은 다른 기능도 살펴보고 싶어질 것입니다.

즐거운 쿼리 작업 되세요!
