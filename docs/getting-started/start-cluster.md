---
title: Docker에서 클러스터 시작하기
---

이 가이드는 Docker 컨테이너를 사용해 Apache Ignite 3 클러스터를 설정하고 실행하는 과정을 설명합니다. 다음 단계를 따라 3노드 클러스터를 빠르게 구성해 실행해 보세요.

## 사전 요구 사항 {#prerequisites}

* 시스템에 최신 버전의 Docker와 Docker Compose가 설치되어 있어야 합니다
* 명령줄 작업에 대한 기본 지식
* 원하는 코드 편집기(VS Code, IntelliJ IDEA 등)

## 1단계: Docker Compose 구성 만들기 {#step-1-create-a-docker-compose-configuration}

1. 프로젝트 디렉터리에 `docker-compose.yml` 파일을 만듭니다:

```yaml
name: ignite3

x-ignite-def: &ignite-def
  image: apacheignite/ignite:3.0.0
  environment:
    JVM_MAX_MEM: "4g"
    JVM_MIN_MEM: "4g"
  configs:
    - source: node_config
      target: /opt/ignite/etc/ignite-config.conf
      mode: 0644

services:
  node1:
    <<: *ignite-def
    command: --node-name node1
    ports:
      - "10300:10300"
      - "10800:10800"
  node2:
    <<: *ignite-def
    command: --node-name node2
    ports:
      - "10301:10300"
      - "10801:10800"
  node3:
    <<: *ignite-def
    command: --node-name node3
    ports:
      - "10302:10300"
      - "10802:10800"

configs:
  node_config:
    content: |
      ignite {
        network {
          port: 3344
          nodeFinder.netClusterNodes = ["node1:3344", "node2:3344", "node3:3344"]
        }
      }
```

## 2단계: Ignite 클러스터 시작하기 {#step-2-start-the-ignite-cluster}

1. `docker-compose.yml` 파일이 있는 디렉터리에서 터미널을 엽니다
2. 다음 명령어를 실행해 클러스터를 시작합니다:

```bash
docker compose up -d
```

3. 모든 컨테이너가 실행 중인지 확인합니다:

```bash
docker compose ps
```

명령어 출력은 다음과 비슷하게 나타납니다:

```text
NAME              IMAGE                       COMMAND                  SERVICE   CREATED          STATUS          PORTS
ignite3-node1-1   apacheignite/ignite:3.0.0   "docker-entrypoint.s…"   node1     13 seconds ago   Up 10 seconds   0.0.0.0:10300->10300/tcp, 3344/tcp, 0.0.0.0:10800->10800/tcp
ignite3-node2-1   apacheignite/ignite:3.0.0   "docker-entrypoint.s…"   node2     13 seconds ago   Up 10 seconds   3344/tcp, 0.0.0.0:10301->10300/tcp, 0.0.0.0:10801->10800/tcp
ignite3-node3-1   apacheignite/ignite:3.0.0   "docker-entrypoint.s…"   node3     13 seconds ago   Up 10 seconds   3344/tcp, 0.0.0.0:10302->10300/tcp, 0.0.0.0:10802->10800/tcp
```

이제 노드가 실행 중이지만 클러스터는 아직 초기화되지 않았습니다.

## 3단계: 클러스터 초기화하기 {#step-3-initialize-the-cluster}

1. Docker에서 Ignite CLI를 시작합니다:

```text
docker run --rm -it --network=host -e LANG=C.UTF-8 -e LC_ALL=C.UTF-8 apacheignite/ignite:3.0.0 cli
```

2. CLI 안에서 노드 중 하나에 연결합니다:

```bash
connect http://localhost:10300
```

3. CLI 도구에서 기본 노드 연결을 확인합니다.

4. 이름과 모든 노드의 메타스토리지 그룹을 지정해 클러스터를 초기화합니다:

```bash
cluster init --name=ignite3 --metastorage-group=node1,node2,node3
```

이 단계의 출력은 다음과 비슷합니다:

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

                      Apache Ignite CLI version 3.0.0


You appear to have not connected to any node yet. Do you want to connect to the default node http://localhost:10300? [Y/n] y
Connected to http://localhost:10300
The cluster is not initialized. Run cluster init command to initialize it.
[node1]> cluster init --name=ignite3 --metastorage-group=node1,node2,node3
Cluster was initialized successfully
```

## 4단계: 클러스터 확인하기 {#step-4-verify-your-cluster}

1. `cluster status` CLI 명령어로 클러스터가 정상적으로 실행 중인지 확인합니다.

```bash
cluster status
```

출력은 다음과 비슷하게 나타납니다:

```text
[name: ignite3, nodes: 3, status: active, cmgNodes: [node1, node2, node3], msNodes: [node1, node2, node3]]
```

이는 3개 노드가 모두 서로를 찾아 활성 클러스터를 구성했다는 의미입니다.

2. `exit`를 입력하거나 Ctrl+D를 눌러 CLI를 종료합니다. 이렇게 하면 CLI 컨테이너도 함께 중지됩니다.

축하합니다! 이제 개발에 사용할 수 있는 로컬 Apache Ignite 3 클러스터가 실행되고 있습니다.

## 포트 구성 이해하기 {#understanding-port-configuration}

Docker Compose 파일은 각 노드에 대해 두 종류의 포트를 노출합니다:

* **10300-10302**: 관리 작업용 REST API 포트
* **10800-10802**: 애플리케이션의 클라이언트 연결 포트

## 클러스터 중지하기 {#stopping-the-cluster}

클러스터를 일시 중지하려면 다음을 실행합니다:

```bash
docker compose stop

[+] Stopping 3/3
 ✔ Container ignite3-node1-1  Stopped
 ✔ Container ignite3-node2-1  Stopped
 ✔ Container ignite3-node3-1  Stopped
```

이렇게 하면 컨테이너가 중지되고 데이터는 유지됩니다.

## 클러스터 제거하기 {#removing-the-cluster}

클러스터 작업을 마쳤다면 다음 명령어로 제거할 수 있습니다:

```bash
docker compose down

[+] Running 4/4
 ✔ Container ignite3-node3-1  Removed
 ✔ Container ignite3-node2-1  Removed
 ✔ Container ignite3-node1-1  Removed
 ✔ Network ignite3_default    Removed
```

이렇게 하면 모든 컨테이너가 중지되고 제거됩니다. 영속 스토리지를 구성하지 않았다면 데이터가 사라집니다.
