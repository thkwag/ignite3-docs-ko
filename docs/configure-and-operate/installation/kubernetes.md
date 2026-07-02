---
id: install-kubernetes
title: Kubernetes에 설치
sidebar_label: Kubernetes
---

Kubernetes 클러스터에 Apache Ignite 3를 설치하고 Apache Ignite 클러스터를 실행할 수 있습니다. 이 섹션에서는 필요한 모든 단계를 설명하며, 환경에 복사해 붙여넣을 수 있는 구성과 매니페스트도 함께 제공합니다.

:::note
프로덕션 배포에는 Helm 차트 사용을 권장합니다. 다만 Helm을 사용하지 않기로 했다면, 이 가이드에서 Apache Ignite를 Kubernetes에 수동으로 설치하는 방법을 안내합니다.
:::

## 사전 요구 사항 {#prerequisites}

### 권장 Kubernetes 버전 {#recommended-kubernetes-version}

Apache Ignite 3는 Kubernetes 1.20 이상이 필요합니다.

## 설치 단계 {#installation-steps}

### ConfigMap 생성 {#create-configmaps}

1. Apache Ignite 구성 파일을 생성합니다. 최소 노드 구성은 다음과 같습니다:

```json title="ignite-config.conf"
ignite: {
  network: {
    # Apache Ignite 3 node port
    port = 3344
    nodeFinder = {
      netClusterNodes = [
        # Kubernetes service to access the Apache Ignite 3 cluster on the Kubernetes network
        "ignite-svc-headless:3344"
      ]
    }
  }

  storage: {
    profiles = [
      {
        engine = "aipersist"
        name = "default"
        replacementMode = "CLOCK"
        # Explicit storage size configuration
        sizeBytes = 2147483648
      }
    ]
  }
}
```

2. Apache Ignite 구성을 위한 ConfigMap 객체를 생성합니다:

```shell
kubectl create configmap ignite-config -n <namespace> --from-file=ignite-config.conf
```

`<namespace>`를 Apache Ignite를 배포할 네임스페이스 이름으로 바꿉니다.

:::note
Kubernetes 배포에서 `ignite-config.conf` 파일은 읽기 전용 ConfigMap으로 마운트되므로, `node config update` 명령어로 업데이트를 시도하면 실패합니다.

Apache Ignite 노드 구성을 업데이트하려면 기존 ConfigMap을 수정하고 모든 Apache Ignite 파드를 재시작하세요.
:::

- 이전에 구성한 ConfigMap 객체를 수정합니다:

```bash
kubectl edit configmap ignite-config -n <namespace>
```

- Apache Ignite 파드를 재시작합니다. 모든 파드에 대해 반복하세요:

```bash
kubectl delete pod <Apache Ignite pod name> -n <namespace>
```

### 서비스 생성 및 배포 {#create-and-deploy-the-service}

요구 사항에 따라 Kubernetes 서비스를 정의하고 배포합니다. Apache Ignite 3는 두 가지 유형의 서비스를 사용합니다. 하나는 내부 클러스터 검색용이고, 다른 하나는 외부 클라이언트 접근용입니다.

1. 먼저 필요한 서비스 유형을 선택하고 `service.yaml` 파일을 준비합니다.

- Kubernetes 클러스터 내부 통신에는 `clusterIP` 매개변수를 `None`으로 설정해 헤드리스 서비스를 사용하세요. 이렇게 하면 각 파드의 IP가 노출되어 Apache Ignite가 파티션 인식(partition awareness)이 가능해집니다. 즉 클라이언트가 모든 노드의 주소를 파악하고, 어느 파티션이 어느 노드에 있는지 확인해, 데이터가 있는 곳으로 요청을 직접 전송합니다.

```yaml title="service.yaml"
apiVersion: v1
kind: Service
metadata:
  # The name must be equal to netClusterNodes.
  name: ignite-svc-headless
  # Place your namespace name here.
  namespace: <namespace>
spec:
  clusterIP: None
  internalTrafficPolicy: Cluster
  ipFamilies:
  - IPv4
  ipFamilyPolicy: SingleStack
  ports:
  - name: management
    port: 10300
    protocol: TCP
    targetPort: 10300
  - name: rest
    port: 10800
    protocol: TCP
    targetPort: 10800
  - name: cluster
    port: 3344
    protocol: TCP
    targetPort: 3344
  selector:
    # Must be equal to the label set for pods.
    app: ignite
  # Include not-yet-ready nodes.
  publishNotReadyAddresses: True
  sessionAffinity: None
  type: ClusterIP
```

- 외부 클라이언트 연결을 허용하려면 `LoadBalancer` 서비스를 사용하세요. 단, 이 옵션을 사용하면 파티션 인식을 포기하게 된다는 점에 유의하세요.

환경에서 `LoadBalancer`를 지원하지 않는다면 대신 `type: NodePort`를 사용할 수 있습니다. 자세한 내용은 Kubernetes [문서](https://kubernetes.io/docs/tasks/access-application-cluster/create-external-load-balancer/)를 참고하세요.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ignite-loadbalancer
  labels:
    app: ignite
spec:
  type: LoadBalancer
  selector:
    app: ignite
  ports:
    - name: rest
      protocol: TCP
      port: 10800
      targetPort: 10800
    - name: client
      port: 10300
      protocol: TCP
      targetPort: 10300
```

2. 그런 다음 `service.yaml` 파일을 적용해 이 서비스를 설정합니다:

```shell
kubectl apply -f service.yaml
```

### StatefulSet 배포 {#deploy-the-statefulset}

1. StatefulSet 배포를 위해 `statefulset.yaml` 파일을 준비합니다:

```yaml title="statefulset.yaml"
apiVersion: apps/v1
kind: StatefulSet
metadata:
  # The cluster name.
  name: ignite-cluster
  # Place your namespace name.
  namespace: <namespace>
spec:
  # The initial number of pods to be started by Kubernetes.
  replicas: 2
  # Kubernetes service to access the Ignite 3 cluster on the Kubernetes network.
  serviceName: ignite-svc-headless
  selector:
    matchLabels:
      app: ignite
  template:
    metadata:
      labels:
        app: ignite
    spec:
      terminationGracePeriodSeconds: 60000
      containers:
        # Custom pod name.
      - name: ignite-node
        # Limits and requests for the Ignite container.
        resources:
          limits:
            cpu: "4"
            memory: 4Gi
          requests:
            cpu: "4"
            memory: 4Gi
        env:
          # Must be specified to ensure that Apache Ignite 3 cluster replicas are visible to each other.
          - name: IGNITE_NODE_NAME
            valueFrom:
              fieldRef:
                fieldPath: metadata.name
          # Apache Ignite 3 working directory.
          - name: IGNITE_WORK_DIR
            value: /ai3-work
        # Apache Ignite Docker image and its version.
        image: apache/ignite3:{version}
        ports:
        - containerPort: 10300
        - containerPort: 10800
        - containerPort: 3344
        volumeMounts:
        # The config will be placed at this path in the container.
        - mountPath: /opt/ignite/etc/ignite-config.conf
          name: config-vol
          subPath: ignite-config.conf
        # Ignite 3 working directory.
        - mountPath: /ai3-work
          name: persistence
      volumes:
      - name: config-vol
        configMap:
          name: ignite-config
  volumeClaimTemplates:
  - apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: persistence
    spec:
      accessModes:
      - ReadWriteOnce
      resources:
        requests:
          storage: 10Gi # Provide enough space for your application data.
      volumeMode: Filesystem
```

2. `statefulset.yaml` 파일을 적용해 Apache Ignite 3의 주요 구성 요소를 배포합니다:

```shell
kubectl apply -f statefulset.yaml
```

### 파드 시작 대기 {#wait-for-pods-to-start}

1. 파드 상태를 모니터링합니다:

```shell
kubectl get pods -n <namespace> -w
```

2. 계속 진행하기 전에 모든 파드의 `STATUS`가 `Running`인지 확인하세요.

### Job 배포 {#deploy-the-job}

1. Job 배포를 위해 `job.yaml` 파일을 준비합니다:

```yaml title="job.yaml"
apiVersion: batch/v1
kind: Job
metadata:
  name: cluster-init
  # Place your namespace name here.
  namespace: <namespace>
spec:
  template:
    spec:
      containers:
      # Command to init the cluster. URL and host must be the name of the service you created before. Port is 10300 as the management port.
      - args:
        - -ec
        - |
          apt update && apt-get install -y bind9-host
          IGNITE_NODES=$(host -tsrv _cluster._tcp.ignite-svc-headless | grep 'SRV record' | awk '{print $8}' | awk -F. '{print $1}' | paste -sd ',')
          /opt/ignite3cli/bin/ignite3 cluster init --name=ignite --url=http://ignite-svc-headless:10300
        command:
        - /bin/sh
        # Specify the Docker image with the Apache Ignite 3 CLI and its version.
        image: apache/ignite3:{version}
        imagePullPolicy: IfNotPresent
        name: cluster-init
        resources: {}
      restartPolicy: Never
      terminationGracePeriodSeconds: 120
```

2. `job.yaml` 파일을 적용해 설치를 완료합니다:

```shell
kubectl apply -f job.yaml
```

## 설치 확인 {#installation-verification}

1. 네임스페이스의 모든 리소스 상태를 확인합니다:

```shell
kubectl get all -n <namespace>
```

2. 모든 구성 요소가 오류 없이 예상대로 실행 중이고, 초기화 Job이 `Completed` 상태인지 확인하세요.
3. 클러스터가 초기화되어 실행 중인지 확인합니다:

```shell
kubectl exec -it ignite-cluster-0 bash -n <namespace>
/opt/ignite3cli/bin/ignite3 cluster status
```

명령어 출력에는 클러스터 이름과 노드 수가 포함되어야 합니다. 상태는 `ACTIVE`여야 합니다.

## 설치 문제 해결 {#installation-troubleshooting}

설치 도중 문제가 발생하면 다음을 확인하세요:

- 특정 파드의 로그를 확인합니다:

```shell
kubectl logs <pod-name> -n <namespace>
```

- 네임스페이스의 이벤트를 검토합니다:

```shell
kubectl get events -n <namespace>
```
