---
id: config-authentication
title: 인증
sidebar_label: 인증
---

Apache Ignite 3는 기본 인증(authentication) 기능을 제공합니다.

## 인증 구성 {#authentication-configuration}

### 기본 인증 {#basic-authentication}

클러스터에서 기본 인증을 사용하려면 인증을 활성화하고 초기 관리자 사용자를 생성해야 합니다. 기본적으로 관리자 권한을 부여하는 역할은 `admin`이라고 하며, 이 이름은 클러스터 구성에서 변경할 수 있습니다.

다음은 클러스터를 초기화하고 보안을 활성화하는 구성 예시입니다:

- 보안 구성이 포함된 클러스터 구성 파일을 준비합니다:

```hocon
ignite {
  security {
    enabled:true
    authentication {
      providers=[
        {
          name=default
          type=basic
          users=[
            {
              displayName=administrator
              password="ignite"
              roles=[
                system
              ]
              username=ignite
            }
          ]
        }
      ]
    }
  }
}
```

- 보안 구성으로 클러스터를 초기화합니다:

```shell
cluster init --name=sampleCluster --config-files=/cluster-config.conf
```

클러스터가 초기화되면 `ignite` 사용자 이름과 `ignite` 비밀번호에 시스템 수준 접근 권한을 부여하는 기본 인가(authorization)가 구성됩니다. 다만 보안은 기본적으로 비활성화되어 있습니다. 활성화하려면:

```shell
cluster config update ignite.security.enabled=true
```

:::warning
system 역할을 가진 모든 계정에 접근할 수 없게 되면 클러스터의 관리자 접근 권한을 잃게 됩니다.
:::

인가가 활성화되면 클러스터와의 연결이 끊어지므로 다시 연결해야 합니다:

```shell
connect http://127.0.0.1:10300 --username ignite --password ignite
```

클러스터 구성을 업데이트하면 기본 사용자의 비밀번호를 변경할 수 있습니다. 예를 들어:

```shell
cluster config update  ignite.security.authentication.providers.default.users.ignite.password=myPass
```
