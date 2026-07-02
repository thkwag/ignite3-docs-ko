---
title: 시작하기
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

이 가이드는 Ignite로 작업을 시작하는 방법을 안내합니다. 웹사이트에서 Ignite를 다운로드하고 설치한 다음, 데이터베이스를 시작하고 제공된 CLI 도구로 간단한 SQL 쿼리를 실행합니다.

이 가이드는 [zip 압축 파일](/configure-and-operate/installation/install-zip)로 Ignite 사용법을 보여줍니다. [deb 또는 rpm 패키지](/configure-and-operate/installation/install-deb-rpm)를 사용하거나 Docker에서 Ignite를 실행하는 경우 일부 단계가 다를 수 있습니다.

Java 코드에서 데이터베이스를 실행하는 방식이 더 편하다면 [코드에서 Ignite 시작하기](/getting-started/embedded-mode)를 시도해 보세요.

## 사전 요구 사항 {#prerequisites}

이 섹션은 Ignite를 실행하는 머신의 플랫폼 요구 사항을 설명합니다. Ignite 시스템 요구 사항은 클러스터 크기에 따라 달라집니다.

| 요구 사항 | 버전 |
|-------------|---------|
| JDK | 11 이상 |
| OS | Linux(Debian 및 Red Hat 계열), Windows 10 또는 11 |
| ISA | x86 또는 x64 |

## Ignite 설치 {#install-ignite}

1. 웹사이트에서 Ignite를 [다운로드](https://ignite.apache.org/download.cgi)합니다. 이 압축 파일에는 Ignite 데이터베이스 자체와 관련된 모든 것이 들어 있습니다.

2. 같은 페이지에서 [Ignite 명령줄 인터페이스](/tools/cli-commands)도 다운로드합니다. 이 도구는 Ignite 데이터베이스와 상호작용하는 주된 방법이며 이 튜토리얼에서 사용합니다.

3. 다운로드한 압축 파일의 압축을 풉니다:

<Tabs>
<TabItem value="unix" label="Unix">

```shell
unzip ignite3-3.0.0.zip
```

</TabItem>
<TabItem value="windows-ps" label="Windows (PowerShell)">

```shell
Expand-Archive ignite3-3.0.0.zip -DestinationPath .
```

</TabItem>
<TabItem value="windows-cmd" label="Windows (CMD)">

```shell
unzip -xf ignite3-3.0.0.zip
```

</TabItem>
</Tabs>

이제 `ignite3-db-3.1.0`과 `ignite3-cli-3.1.0` 디렉터리가 생성되며, 이 튜토리얼에서 이 디렉터리를 사용합니다.

## Ignite 노드 시작 {#start-ignite-node}

Ignite는 데이터가 담긴 Ignite 데이터베이스 인스턴스인 **노드**의 모음에서 실행되는 분산 데이터베이스입니다. Ignite를 실행할 때는 보통 여러 노드, 즉 정보를 공유하고 데이터를 노드 전체에 고르게 분산하는 **클러스터**를 실행합니다. 이 튜토리얼에서는 노드 하나만 실행하지만, 뒷부분에서 여러 노드를 시작하는 방법을 보여줍니다.

로컬에서 노드를 시작하려면:

1. `ignite3-db-3.0.0` 디렉터리로 이동합니다.
2. `ignite3db` 스크립트를 실행합니다:

<Tabs>
<TabItem value="linux" label="Linux">

```shell
bin/ignite3db
```

</TabItem>
<TabItem value="windows" label="Windows">

:::note
Windows에서 Ignite를 실행하려면 Bash 환경에 Java를 설치해야 합니다.
:::

```bash
bash bin\ignite3db
```

</TabItem>
</Tabs>

## Ignite CLI 시작 {#start-the-ignite-cli}

노드와 클러스터를 다루는 주된 방법은 [Ignite CLI](/tools/cli-commands)입니다. 로컬 또는 원격 머신에서 실행 중인 노드에 연결할 수 있으며, 데이터베이스를 수동으로 구성하고 관리하는 데 사용하는 주요 도구입니다. 이 예시에서는 로컬 노드에 연결합니다.

Ignite CLI를 시작하려면:

1. `ignite3-cli-3.0.0` 디렉터리로 이동합니다.
2. 다음 명령어를 실행합니다:

<Tabs>
<TabItem value="linux" label="Linux">

```shell
bin/ignite3
```

</TabItem>
<TabItem value="windows" label="Windows">

:::note
Windows에서 Ignite를 실행하려면 Bash 환경에 Java를 설치해야 합니다.
:::

```bash
bash bin\ignite3
```

</TabItem>
</Tabs>

3. CLI 도구가 기본 URI에서 실행 중인 노드와 연결을 시도하면 이를 확인합니다.

4. 노드가 다른 주소에서 실행 중이라면 `connect` 명령어로 노드에 연결합니다. 예시:

<Tabs>
<TabItem value="command" label="Command">

```
connect http://127.0.0.1:10300
```

</TabItem>
<TabItem value="output" label="Output">

```
Connected to http://127.0.0.1:10300
```

</TabItem>
</Tabs>

## 클러스터 초기화 {#initialize-your-cluster}

Ignite 데이터베이스는 클러스터로 동작합니다. 지금은 노드 하나만 실행 중이지만, 이론적으로는 다른 노드를 시작해서 이미 실행 중인 클러스터에 합류시킬 수 있습니다. 노드가 시작되면 서로를 찾아내고 사용자가 클러스터를 시작하기를 기다립니다. 클러스터를 시작하는 과정을 _초기화_라고 부릅니다.

시작한 노드로 클러스터를 초기화하려면([Ignite 노드 시작](#start-ignite-node) 참고) 다음 명령어를 실행합니다:

<Tabs>
<TabItem value="command" label="Command">

```
cluster init --name=sampleCluster
```

</TabItem>
<TabItem value="output" label="Output">

```
Cluster was initialized successfully
```

</TabItem>
</Tabs>

선택적으로 `--metastorage-group` 매개변수를 전달해 클러스터 메타 정보를 저장할 노드를 지정할 수 있습니다. 대부분의 경우 메타스토리지(metastorage) 그룹 노드는 3개, 5개 또는 7개를 두는 것이 좋습니다. 메타스토리지 그룹과 클러스터 라이프사이클에 대한 자세한 내용은 [클러스터 라이프사이클](/configure-and-operate/operations/lifecycle)을 참고하세요.

:::warning
Ignite의 클러스터 구성과 노드 구성은 분리되어 있으며 서로 바꿔 쓸 수 없습니다. 클러스터를 초기화할 때는 반드시 **클러스터** 구성 파일을 제공하세요.
:::

## 클러스터에 SQL 문 실행 {#run-sql-statements-against-the-cluster}

클러스터를 초기화했다면 이제 작업을 시작합니다. 이 튜토리얼에서는 CLI 도구로 테이블을 생성하고 행을 삽입한 다음 데이터를 조회합니다. 대부분의 실제 시나리오에서는 [클라이언트](/develop/ignite-clients/)가 클러스터에 데이터를 쓰고 조회하지만, CLI 도구도 디버깅이나 사소한 조정 작업에 사용할 수 있습니다.

CLI에서 SQL을 다루려면:

1. SQL REPL 모드로 들어갑니다. 이 모드에서는 SQL 힌트와 명령어 자동 완성을 사용할 수 있습니다:

<Tabs>
<TabItem value="command" label="Command">

```
sql
```

</TabItem>
<TabItem value="output" label="Output">

```
sql-cli>
```

</TabItem>
</Tabs>

2. `CREATE TABLE` 문으로 새 테이블을 생성합니다:

<Tabs>
<TabItem value="command" label="Command">

```sql
CREATE TABLE IF NOT EXISTS Person (id int primary key,  city varchar,  name varchar,  age int,  company varchar)
```

</TabItem>
<TabItem value="output" label="Output">

```
Updated 0 rows.
```

</TabItem>
</Tabs>

3. `INSERT` 문으로 테이블에 데이터를 채웁니다:

<Tabs>
<TabItem value="command" label="Command">

```sql
INSERT INTO Person (id, city, name, age, company) VALUES (1, 'London', 'John Doe', 42, 'Apache')
INSERT INTO Person (id, city, name, age, company) VALUES (2, 'New York', 'Jane Doe', 36, 'Apache')
```

</TabItem>
<TabItem value="output" label="Output">

```
Updated 1 rows.
```

</TabItem>
</Tabs>

4. 이전 단계에서 삽입한 데이터를 모두 조회합니다:

<Tabs>
<TabItem value="command" label="Command">

```sql
SELECT * FROM Person
```

</TabItem>
<TabItem value="output" label="Output">

```
╔════╤══════════╤══════════╤═════╤═════════╗
║ ID │ CITY     │ NAME     │ AGE │ COMPANY ║
╠════╪══════════╪══════════╪═════╪═════════╣
║ 2  │ New York │ Jane Doe │ 36  │ Apache  ║
╟────┼──────────┼──────────┼─────┼─────────╢
║ 1  │ London   │ John Doe │ 42  │ Apache  ║
╚════╧══════════╧══════════╧═════╧═════════╝
```

</TabItem>
</Tabs>

5. 필요하면 `exit` 명령어로 REPL 모드를 종료합니다.

:::note
사용 가능한 SQL 문에 대한 자세한 내용은 [SQL 참조](/sql/reference/language-definition/ddl) 섹션을 참고하세요.
:::

## 노드 중지 {#stop-the-node}

클러스터 작업을 마쳤다면 `ignite3db` 프로세스를 중지해 노드를 멈춰야 합니다:

* Unix: `Control + C`
* Windows: `Ctrl+C`

CLI 도구는 `exit` 명령어로도 종료할 수 있습니다.

클러스터는 초기화된 상태를 유지하며, 노드를 다시 시작하면 다시 사용할 준비가 됩니다.

## 클러스터 시작 튜토리얼 확장 {#extended-cluster-startup-tutorial}

Ignite 3는 3개 이상의 노드로 구성된 클러스터에서 한꺼번에 동작하도록 설계되었습니다. 일부 시나리오와 이 튜토리얼에서는 노드 하나만으로도 충분하지만, 클러스터에 여러 노드를 두는 것이 가장 흔한 사용 사례입니다. 실제 시나리오에 더 가까운 다중 노드 클러스터에서 튜토리얼을 진행하고 싶다면, 아래 단계에서 클러스터를 시작하는 선택적 대안을 제공합니다.

### 선택 사항: Docker에서 다중 Ignite 노드 시작 {#optional-starting-multiple-ignite-nodes-in-docker}

Ignite 인스턴스를 여러 개 실행하려면 보통 클러스터를 시작하기 전에 여러 머신에 설치합니다. 이 튜토리얼에서 로컬 VM에 Ignite 클러스터를 실행하려면 Docker 이미지 사용을 권장합니다:

1. 클러스터를 시작하는 데 docker compose가 사용할 docker-compose 파일(문서에서 제공하지 않음)과 노드 구성 파일(문서에서 제공하지 않음)을 다운로드합니다. 노드 구성 파일은 docker compose 파일과 같은 폴더에 두어야 합니다.
2. Docker 이미지를 다운로드합니다:

<Tabs>
<TabItem value="command" label="Command">

```shell
docker pull apacheignite/ignite:3.0.0
```

</TabItem>
<TabItem value="output" label="Output">

```
latest: Pulling from ignite/ignite3
3713021b0277: Pull complete
fea31cb87980: Pull complete
07f7cfe80ff6: Pull complete
ab1fd3f4849e: Pull complete
34896af28f87: Pull complete
Digest: sha256:43ab9cfb8f58b66e4a5027d4ed529216963d0bcab3fa3fc6d5e2042fa3dd5a74
Status: Downloaded newer image for ignite/ignite3:latest
docker.io/ignite/ignite3:latest
```

</TabItem>
</Tabs>

3. 이전에 다운로드한 compose 파일을 지정해 Docker compose 명령어를 실행합니다:

<Tabs>
<TabItem value="command" label="Command">

```shell
docker compose -f docker-compose.yml up -d
```

</TabItem>
<TabItem value="output" label="Output">

```
[+] Running 4/4
 ✔ Network ignite3_default    Created                                                                            0.8s
 ✔ Container ignite3-node1-1  Started                                                                            3.2s
 ✔ Container ignite3-node2-1  Started                                                                            1.7s
 ✔ Container ignite3-node3-1  Started                                                                            3.4s
```

</TabItem>
</Tabs>

Docker에서 노드 3개가 시작되며, 로컬에서 실행하는 CLI 도구로 접근할 수 있게 됩니다.

4. 클러스터 작업을 시도하기 전에 반드시 클러스터를 초기화하세요:

<Tabs>
<TabItem value="command" label="Command">

```
cluster init --name=sampleCluster
```

</TabItem>
<TabItem value="output" label="Output">

```
Cluster was initialized successfully
```

</TabItem>
</Tabs>

### 선택 사항: 서로 다른 호스트에서 다중 Ignite 노드 시작 {#optional-start-multiple-ignite-nodes-on-different-hosts}

위 예시에서는 노드 하나 또는 사전 정의된 구성을 사용하는 작은 클러스터를 실행했습니다. 여러 호스트에 Ignite 클러스터를 만들려면 구성을 조정해야 합니다.

#### NodeFinder에서 모든 노드 나열 {#list-all-nodes-in-nodefinder}

노드는 실행 중일 때 노드 파인더 구성을 사용합니다. 노드가 시작되면 `/etc/ignite-config.conf`에서 구성 파일을 불러옵니다. `network.nodeFinder` 구성에 주소를 추가합니다. 예를 들어 3노드 클러스터라면 다음과 같습니다:

```json
{
  "ignite" : {
    "nodeFinder" : {
      "netClusterNodes" : [
        "localhost:3344",
        "otherhost:3344",
        "thirdhost:3344"
      ]
    }
  }
}
```

이제 노드가 시작되면 나열된 주소에서 자동으로 다른 노드를 찾으려고 시도합니다. 실행 중인 노드의 현재 구성은 언제든 CLI 도구에서 다음 명령어를 실행해 확인할 수 있습니다:

<Tabs>
<TabItem value="command" label="Command">

```
node config show ignite.network.nodeFinder
```

</TabItem>
<TabItem value="output" label="Output">

```
{
  "netClusterNodes" : [ "localhost:3344", "otherhost:3344", "thirdhost:3344" ],
  "type" : "STATIC"
}
```

</TabItem>
</Tabs>

노드가 이미 실행 중이라면 CLI 도구로 노드 구성을 변경할 수도 있습니다. 예를 들면:

```
node config update ignite.network.nodeFinder.netClusterNodes=["localhost:3344", "otherHost:3344"]
```

이 변경 사항을 적용하려면 노드를 다시 시작해야 합니다.

#### 노드 이름 변경 {#change-node-names}

클러스터의 모든 노드는 이름이 서로 달라야 합니다. 노드 이름은 `/etc/vars.env` 파일에 정의되어 있습니다. `NODE_NAME` 변수를 변경해 클러스터의 각 노드에 고유한 이름을 부여하세요. 이름이 충돌하는 노드는 같은 클러스터에 들어갈 수 없습니다.

#### 모든 노드 시작 {#start-all-nodes}

[Ignite 노드 시작](#start-ignite-node)에서 설명한 대로 각 노드를 시작합니다.

#### 클러스터 초기화 {#initialize-your-cluster-1}

클러스터를 초기화하기 전에는 모든 노드가 서로를 찾아 클러스터로 연결될 수 있는지 확인하는 것이 중요합니다. 노드가 서로 보이더라도 반드시 클러스터로 연결된 것은 아니며, 이런 상태를 [물리 토폴로지](/configure-and-operate/operations/lifecycle)라고 합니다. CLI 도구로 임의의 노드에 연결해 다음 명령어를 실행하면 확인합니다:

<Tabs>
<TabItem value="command" label="Command">

```shell
cluster topology physical
```

</TabItem>
<TabItem value="output" label="Output">

```
╔═══════╤════════════╤══════╤═══════════════╤══════════════════════════════════════╗
║ name  │ host       │ port │ consistent id │ id                                   ║
╠═══════╪════════════╪══════╪═══════════════╪══════════════════════════════════════╣
║ node1 │ 172.19.0.4 │ 3344 │ node1         │ 0c61dad3-bc4c-4c60-8772-1a903632dcb4 ║
╟───────┼────────────┼──────┼───────────────┼──────────────────────────────────────╢
║ node2 │ 172.19.0.2 │ 3344 │ node2         │ 21f516bd-0774-4c53-bbfb-ad21bc21c500 ║
╟───────┼────────────┼──────┼───────────────┼──────────────────────────────────────╢
║ node3 │ 172.19.0.3 │ 3344 │ node3         │ b2bbfbff-eb08-4252-b154-681c49164708 ║
╚═══════╧════════════╧══════╧═══════════════╧══════════════════════════════════════╝
```

</TabItem>
</Tabs>

이 명령어는 연결한 노드에 보이는 노드 목록과 각 노드의 주소, 이름, ID를 표시합니다. 모든 노드가 실행 중이고 서로 보이는 것을 확인했다면 클러스터를 초기화합니다:

<Tabs>
<TabItem value="command" label="Command">

```shell
cluster init --name=sampleCluster
```

</TabItem>
<TabItem value="output" label="Output">

```
Cluster was initialized successfully
```

</TabItem>
</Tabs>

클러스터가 시작되면 클러스터에 속한 노드가 _논리 토폴로지_를 형성합니다. 모든 노드가 클러스터에 들어왔는지는 다음 명령어로 확인합니다:

<Tabs>
<TabItem value="command" label="Command">

```shell
cluster topology logical
```

</TabItem>
<TabItem value="output" label="Output">

```
╔═══════╤════════════╤══════╤═══════════════╤══════════════════════════════════════╗
║ name  │ host       │ port │ consistent id │ id                                   ║
╠═══════╪════════════╪══════╪═══════════════╪══════════════════════════════════════╣
║ node1 │ 172.19.0.4 │ 3344 │ node1         │ 0c61dad3-bc4c-4c60-8772-1a903632dcb4 ║
╟───────┼────────────┼──────┼───────────────┼──────────────────────────────────────╢
║ node2 │ 172.19.0.2 │ 3344 │ node2         │ 21f516bd-0774-4c53-bbfb-ad21bc21c500 ║
╟───────┼────────────┼──────┼───────────────┼──────────────────────────────────────╢
║ node3 │ 172.19.0.3 │ 3344 │ node3         │ b2bbfbff-eb08-4252-b154-681c49164708 ║
╚═══════╧════════════╧══════╧═══════════════╧══════════════════════════════════════╝
```

</TabItem>
</Tabs>

명령어 출력에 모든 노드가 나타나면 클러스터가 시작된 것이며 이제 작업을 진행하면 됩니다.

## 다음 단계 {#next-steps}

여기서부터는 다음을 진행해 보세요:

* 지원하는 명령어에 대한 자세한 내용은 [Ignite CLI 도구](/tools/cli-commands) 페이지를 확인하세요
* [예시 코드](https://github.com/apache/ignite-3/tree/main/examples)를 살펴보세요
