---
id: config-cluster-security
title: 클러스터 보안
sidebar_label: 클러스터 보안
---

## 사용자 보안 {#user-security}

기본적으로 모든 사용자가 클러스터에서 어떤 변경이든 수행할 수 있으며, [클러스터에 임의의 코드를 업로드](/develop/work-with-data/code-deployment)하고 [분산 컴퓨트](/develop/work-with-data/compute)으로 원격 코드를 실행할 수도 있습니다. 보안을 강화하려면 사용자 역할과 권한을 구성하고 클러스터에서 인가(authorization)를 활성화하기를 권장합니다.

## 통신 {#communication}

기본적으로 노드는 악의적인 행위에 취약한 평문 통신을 사용합니다. Ignite 3는 클러스터 노드 간 통신과 클라이언트와의 통신을 분리합니다.

## 노드 간 통신 {#node-to-node-communication}

노드 간 통신은 보통 같은 데이터 센터 안에서 이루어집니다. 클러스터의 보안을 높이려면 다음을 권장합니다:

- `ignite.network.ssl` [노드 구성](/configure-and-operate/reference/node-configuration)으로 클러스터 통신에 SSL을 활성화합니다.
- 신뢰할 수 있고 격리된 네트워크에서 클러스터를 실행합니다.

## 노드-클라이언트 통신 {#node-to-client-communication}

클라이언트-서버 통신은 인터넷이나 그 밖의 신뢰할 수 없는 네트워크를 거칠 수 있습니다. 보통 클러스터 외부에 노출되는 것은 클라이언트 포트(기본값 10800)뿐입니다. 클라이언트와 안전하게 통신하려면:

- `ignite.clientConnector.ssl` [노드 구성](/configure-and-operate/reference/node-configuration)으로 클라이언트 통신에 SSL을 활성화합니다.
- 클러스터에서 [인증](/configure-and-operate/configuration/config-authentication)을 활성화합니다.
