---
id: install-zip
title: ZIP 아카이브로 설치
sidebar_label: ZIP 아카이브
---

## 사전 요구 사항 {#prerequisites}

### 권장 운영 체제 {#recommended-operating-system}

Apache Ignite는 Linux, macOS, Windows 운영 체제를 지원합니다.

### 권장 Java 버전 {#recommended-java-version}

Apache Ignite 3는 Java 11 이상이 필요합니다.

## Apache Ignite 패키지 구조 {#apache-ignite-package-structure}

Apache Ignite는 배포용으로 2개의 아카이브를 제공합니다:

- `ignite3-db-{version}` - Apache Ignite 데이터베이스와 관련된 모든 것을 포함하는 아카이브입니다. 압축을 풀면 기본적으로 데이터가 저장될 폴더가 생성됩니다. 이 폴더에서 Apache Ignite 노드를 시작합니다.
- `ignite3-cli-{version}` - [Apache Ignite CLI 도구](/tools/cli-commands)를 포함하는 아카이브입니다. 이 도구는 Apache Ignite 클러스터와 노드를 다루는 주요 수단입니다.

## Apache Ignite 데이터베이스 설치 {#installing-apache-ignite-database}

Apache Ignite 데이터베이스를 설치하려면 웹사이트에서 데이터베이스 아카이브를 [다운로드](https://ignite.apache.org/download.cgi)한 다음 아래 단계를 진행합니다:

1. 아카이브의 압축을 풉니다:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="unix" label="Unix">

```shell
unzip ignite3-db-{version}.zip && cd ignite3-db-{version}
```

</TabItem>
<TabItem value="windows-powershell" label="Windows (PowerShell)">

```shell
Expand-Archive ignite3-{version}.zip -DestinationPath . ; cd ignite3-db-{version}
```

</TabItem>
<TabItem value="windows-cmd" label="Windows (CMD)">

```shell
unzip -xf ignite3-db-{version}.zip & cd ignite3-db-{version}
```

</TabItem>
</Tabs>

2. `ignite3-db-{version}` 폴더 경로로 `IGNITE_HOME` 환경 변수를 생성합니다.

## 노드 시작 {#starting-the-node}

아카이브 압축을 풀었다면 Apache Ignite 노드를 시작할 수 있습니다:

```shell
bin/ignite3db
```

노드는 시작할 때 기본적으로 `etc/ignite-config.conf` 구성 파일을 로드합니다. 이 파일을 수정해 노드 구성을 조정하거나, `etc/vars.env` 파일에서 구성 폴더를 변경할 수 있습니다.

노드가 시작되면 클러스터가 이미 구성되고 초기화된 경우 클러스터에 참여하고, 그렇지 않으면 클러스터 초기화를 대기합니다.

## Apache Ignite CLI 도구 설치 {#installing-apache-ignite-cli-tool}

CLI 도구는 Apache Ignite 데이터베이스를 다루는 주요 수단입니다. REST 인터페이스로 노드에 연결할 수 있으므로 Apache Ignite를 실행하는 모든 머신에 설치할 필요는 없습니다.

Apache Ignite CLI를 설치하려면 웹사이트에서 데이터베이스 아카이브를 [다운로드](https://ignite.apache.org/download.cgi)한 다음 압축을 풉니다:

<Tabs>
<TabItem value="unix" label="Unix">

```shell
unzip ignite3-cli-{version}.zip && cd ignite3-cli-{version}
```

</TabItem>
<TabItem value="windows-powershell" label="Windows (PowerShell)">

```shell
Expand-Archive ignite3-cli-{version}.zip -DestinationPath . ; cd ignite3-cli-{version}
```

</TabItem>
<TabItem value="windows-cmd" label="Windows (CMD)">

```shell
unzip -xf ignite3-cli-{version}.zip & cd ignite3-cli-{version}
```

</TabItem>
</Tabs>

## 다음 단계 {#next-steps}

Apache Ignite를 설치했다면 [빠른 시작](/getting-started/quick-start) 가이드로 진행하거나 바로 [사용 가능한 API](/develop/work-with-data/table-api)를 사용할 수 있습니다.
