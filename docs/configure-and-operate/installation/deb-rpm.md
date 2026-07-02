---
id: install-deb-rpm
title: DEB/RPM 패키지로 설치
sidebar_label: DEB/RPM 패키지
---

Apache Ignite는 플랫폼의 표준 패키지 관리자로 설치할 수 있습니다.

## 사전 요구 사항 {#prerequisites}

### 권장 운영 체제 {#recommended-operating-system}

Apache Ignite는 Linux, macOS, Windows 운영 체제를 지원합니다.

### 권장 Java 버전 {#recommended-java-version}

Apache Ignite 3는 Java 11 이상이 필요합니다.

## Deb 또는 RPM 패키지 설치 {#installing-deb-or-rpm-package}

Apache Ignite 3 패키지를 설치합니다:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="deb" label="deb">

```shell
sudo apt-get install ./ignite3-db-{version}.deb --no-install-recommends
sudo apt-get install ./ignite3-cli-{version}.deb --no-install-recommends
```

</TabItem>
<TabItem value="rpm" label="RPM">

```shell
sudo rpm -i ignite3-db-{version}.noarch.rpm
sudo rpm -i ignite3-cli-{version}.noarch.rpm
```

</TabItem>
</Tabs>

패키지는 다음과 같이 설치됩니다:

| 폴더 | 설명 |
|---|---|
| /usr/share/ignite3db | Apache Ignite의 루트 설치 위치입니다. |
| /etc/ignite3db | 구성 파일의 위치입니다. |
| /var/log/ignite3db | 노드 로그의 위치입니다. |
| /usr/lib/ignite3db | CLI 도구의 위치입니다. |

## 서비스로 Apache Ignite 실행 {#running-apache-ignite-as-a-service}

:::note
Windows 10 WSL 또는 Docker에서 실행할 때는 Apache Ignite를 서비스가 아닌 독립 실행형 프로세스로 시작해야 합니다. 이러한 환경에서는 [ZIP 아카이브로 Apache Ignite 3 설치](/configure-and-operate/installation/install-zip)를 권장합니다.
:::

사용자 지정 구성으로 Apache Ignite 노드를 시작하려면 다음 명령어를 실행합니다:

```bash
sudo systemctl start ignite3db
```

시스템 시작 시 노드를 실행하려면 다음 명령어를 실행합니다:

```bash
sudo systemctl enable ignite3db
```

## 독립 실행형 프로세스로 Apache Ignite 실행 {#running-apache-ignite-as-a-stand-alone-process}

일반적으로 Apache Ignite는 서비스로 실행하는 것이 좋습니다. 하지만 Apache Ignite는 독립 실행형 애플리케이션으로 시작할 수 있는 시작 스크립트도 제공합니다. 이 스크립트를 실행하려면 다음 명령어를 사용합니다:

```bash
sudo bash /usr/share/ignite3db/start.sh 1>/tmp/ignite3-start.log 2>&1 &
```

## 다음 단계 {#next-steps}

Apache Ignite를 설치했다면 [빠른 시작](/getting-started/quick-start) 가이드로 진행하거나 바로 [사용 가능한 API](/develop/work-with-data/table-api)를 사용할 수 있습니다.
