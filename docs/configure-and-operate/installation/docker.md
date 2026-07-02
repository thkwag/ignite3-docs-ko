---
id: install-docker
title: Docker로 설치
sidebar_label: Docker
---

## 사전 요구 사항 {#prerequisites}

### 권장 Docker 버전 {#recommended-docker-version}

Apache Ignite 3는 Docker 20.10 이상이 필요합니다.

### 권장 운영 체제 {#recommended-operating-system}

Apache Ignite는 Linux, macOS, Windows 운영 체제를 지원합니다.

### 권장 Java 버전 {#recommended-java-version}

Apache Ignite 3는 Java 11 이상이 필요합니다.

## 노드 실행 {#running-a-node}

`docker run` 명령어로 Docker 컨테이너에서 Apache Ignite를 실행합니다. Docker가 적절한 Apache Ignite 버전을 자동으로 내려받습니다:

```shell
docker run -d -p 10300:10300 -p 10800:10800 -p 3344:3344 ignite/ignite3:latest
```

:::note
영속 데이터를 저장할 계획이라면 볼륨을 마운트하는 것을 권장합니다. 마운트하지 않으면 컨테이너를 제거할 때 데이터가 삭제됩니다.

애플리케이션 데이터와 영속 데이터를 유지하려면 `/opt/ignite/work` 폴더를 저장하는 것이 좋습니다.
:::

이 명령어는 단일 Apache Ignite 노드를 실행합니다. 명령어를 실행한 후 컨테이너 로그에서 Apache Ignite가 실행 중인지 확인할 수 있습니다.

## 클러스터 실행 {#running-a-cluster}

docker-compose 파일로 Docker에서 클러스터 전체를 시작할 수 있습니다. 샘플 docker-compose 파일을 다운로드해 3개 노드로 구성된 클러스터를 실행할 수 있습니다:

- docker-compose 파일을 다운로드합니다(문서에서 파일을 제공하지 않음).

:::note
제공된 compose 파일을 사용하려면 Docker Compose 2.23.1 이상이 필요합니다.
:::

- Docker 이미지를 다운로드합니다:

```shell
docker pull apache/ignite3:{version}
```

- Docker Compose 명령어를 실행합니다:

```shell
docker compose -f docker-compose.yml up -d
```

Docker에서 노드 3개가 시작되며, 로컬에서 실행하는 CLI 도구로 접근할 수 있습니다. 클러스터를 사용하기 전에 CLI 도구로 반드시 클러스터를 초기화하세요.

## Docker에서 CLI 도구 실행 {#running-cli-tool-in-docker}

:::note
Docker에서 CLI 도구를 실행하는 것은 권장하지 않습니다. 대신 CLI 도구를 로컬에 [다운로드해 설치](/configure-and-operate/installation/install-zip)하는 것을 권장합니다.
:::

CLI 도구는 Apache Ignite 노드를 관리하는 데 사용합니다. Docker 노드는 기본적으로 격리되어 서로 다른 네트워크에서 실행되므로, CLI 도구는 다른 컨테이너에서 대상 컨테이너로 연결할 수 없습니다. 이를 해결하려면 네트워크를 생성하고 노드를 실행하는 모든 컨테이너를 여기에 추가해야 합니다.

- `network create` 명령어로 새 네트워크를 생성합니다:

```shell
docker network create ignite-network
```

- 이미 실행 중인 노드가 있는 컨테이너를 네트워크에 추가합니다:

```shell
docker network connect ignite-network {container-id}
```

- 같은 네트워크에서 Apache Ignite CLI 도구가 포함된 컨테이너를 시작합니다:

```shell
docker run -p 10301:10300 -p 10801:10800 -p 3345:3344 -it --network=ignite-network apache/ignite3:{version} cli
```

:::tip
구성 파일이나 데이터 파일을 마운트해야 할 수도 있습니다. 이런 파일을 제공하려면 사용할 파일을 마운트하세요. 예:

```shell
docker run --rm -it --network=host -v /opt/etc/config.conf:/opt/ignite/etc/ignite-config.conf apache/ignite3:{version} cli
```
:::

CLI는 노드의 IP 주소로 연결할 수 있습니다. 주소가 확실하지 않다면 `container inspect` 명령어로 확인하세요:

```shell
docker container inspect {container-id}
```
