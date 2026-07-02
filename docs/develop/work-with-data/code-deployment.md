---
id: code-deployment
title: 코드 배포
---

Ignite 3를 사용하다 보면 [분산 컴퓨트](./compute) 섹션에서 설명하듯이, 클러스터 전체에서 실행할 수 있도록 사용자 코드를 클러스터 노드에 배포해야 할 때가 있습니다.

Ignite 3에서 코드는 고유 ID와 버전을 가진 불변 **배포 단위(deployment unit)**로 배포됩니다.

배포 단위에 담을 수 있는 내용에는 엄격한 정책이 없지만, Ignite 3는 현재 Java와 .NET으로 구현한 컴퓨트 작업을 지원합니다.

:::note
어떤 클라이언트(.NET, Java, C++ 등)에서도 컴퓨트 작업 실행을 호출할 수 있지만, 작업 자체는 Java나 .NET으로 작성해야 합니다.
:::

컴퓨트 작업에서 다른 프로그래밍 언어를 사용하려면 해당 파일을 작업 코드의 일부로 로드해야 합니다. 코드 파일만 단독으로 배포하면 JVM이 로드하지 않으므로 직접 사용할 수 없습니다.

아래 예시는 JAR의 리소스에 패키징된 스크립트를 로드하는 방법을 보여줍니다.

```java
public class MyJob implements ComputeJob<String, String> {
    @Override
    public CompletableFuture<String> executeAsync(JobExecutionContext ctx, String arg) {
        Ignite ignite = ctx.ignite();

        /** Full path to the script we want to run */
        final String resPath = "/org/apache/ignite/example/code/deployment/resources/script.sh";

        try (InputStream in = MyJob.class.getResourceAsStream(resPath)) {
            if (in == null) {
                throw new IllegalStateException("Resource not found: " + resPath);
            }

            byte[] script = in.readAllBytes();

            Process p = new ProcessBuilder("sh", "-s", "--", arg)
                    .redirectErrorStream(true)
                    .start();

            try (OutputStream os = p.getOutputStream()) {
                os.write(script);
            }

            String out;
            try (InputStream procOut = p.getInputStream()) {
                out = new String(procOut.readAllBytes(), StandardCharsets.UTF_8).strip();
            }

            int exit = p.waitFor();
            if (exit != 0) {
                throw new RuntimeException("Script exited with code " + exit + ":\n" + out);
            }

            String result = "Node: " + ignite.name()
                    + "\nArg: " + arg
                    + "\nScript output:\n" + out;

            return CompletableFuture.completedFuture(result);
        } catch (Exception e) {
            throw new RuntimeException("Failed to run script", e);
        }
    }
}
```

배포 단위는 [CLI](/tools/cli-commands) 명령이나 [REST API](https://ignite.apache.org/releases/ignite3/openapi.yaml)로 관리할 수 있습니다. 두 방법 모두 코드를 배포, 목록 조회, 배포 해제하는 동일한 기능을 제공합니다.

## 폴더 구조가 있는 단위 배포 {#deploying-units-with-folder-structures}

:::note
현재 REST로는 ZIP 아카이브만 배포할 수 있습니다.
:::

Apache Ignite는 ZIP 아카이브를 사용해 폴더 구조를 포함한 단위 배포를 지원합니다. 여러 파일을 디렉터리로 구성한 복잡한 배포 단위를 패키징할 수 있으며, 배포 시 자동으로 압축이 풀리고 구조가 그대로 유지됩니다.

이 방식으로 코드를 배포하려면 파일을 ZIP 아카이브로 패키징한 뒤 클러스터에 배포하세요. Apache Ignite는 폴더 구조를 그대로 유지합니다.

## 배포 단위 위치 {#deployment-unit-location}

기본적으로 노드는 배포 단위를 `{IGNITE_HOME}/work/deployment` 디렉터리에 저장합니다. 이 위치는 [`ignite.deployment.location`](/configure-and-operate/reference/node-configuration) 노드 구성 매개변수로 변경할 수 있습니다.

배포 단위의 구조는 다음과 같습니다.

```
deployment
├─ unit1Id
│  ├─ version1
│  └─ version2
└─ unit2Id
   ├─ version1
   └─ version2
```

각 배포 단위는 별도 디렉터리에 저장되며, 각 버전은 자체 하위 디렉터리를 가집니다.

## 새 단위 배포 {#deploy-new-unit}

새 단위를 배포하려면 코드의 고유 문자열 ID와 버전 번호를 지정해야 합니다.

:::note
코드를 업데이트하려면 새 단위를 배포하세요. 새 단위는 기존 단위와 같은 ID를 사용할 수 있지만, 버전은 달라야 합니다.
:::

### CLI로 배포 {#deploy-via-cli}

새 단위를 배포할 때는 단위 ID와 함께 `cluster unit deploy` 명령을 사용하고 다음 옵션을 설정합니다.

| 매개변수 | 설명 |
|-----------|-------------|
| version | **필수** `x.y.z` 형식의 배포 단위 버전입니다. 같은 이름과 버전의 단위가 이미 있으면 `Unit already exists` 오류가 발생합니다. |
| path | **필수** 배포 단위 파일이나 디렉터리의 경로입니다. 절대 경로 사용을 권장합니다. |
| nodes | 배포 대상 노드를 지정합니다. `ALL`을 사용하면 모든 노드에 즉시 배포하고, `MAJORITY`를 사용하면 클러스터 관리 그룹 과반수를 구성하기에 충분한 노드에 배포합니다(나머지 노드는 나중에 업데이트됩니다). 특정 노드 이름을 쉼표로 구분해 지정하면 해당 노드에 즉시 배포합니다. |

:::note
여러 단위를 동시에 배포할 수 없으므로, 배포하려는 파일마다 `unit deploy` 명령을 각각 실행해야 합니다.
:::

예를 들어 노드 과반수에 배포하려면 다음 명령을 사용합니다.

```bash
cluster unit deploy test-unit --version 1.0.0 --path $ABSOLUTE_PATH_TO_CODE_UNIT --nodes MAJORITY
```

여기서 `$ABSOLUTE_PATH_TO_CODE_UNIT`은 코드 단위 파일이나 디렉터리의 절대 경로를 가리킵니다.

### REST로 배포 {#deploy-via-rest}

REST API로 새 단위를 배포하려면 `/management/v1/deployment/units/{unitId}/{unitVersion}` 엔드포인트에 다음 매개변수와 함께 `POST` 요청을 보내세요.

| 매개변수 | 타입 | 설명 |
|-----------|------|-------------|
| unitId | 경로 | **필수** 고유 단위 ID입니다. 이 ID의 배포 단위가 없으면 새로 생성됩니다. |
| unitVersion | 경로 | **필수** 배포 단위의 고유 버전입니다. 지정한 ID와 버전의 배포 단위가 이미 있으면 HTTP 409 "Conflict" 응답을 반환합니다. |
| unitContent | 파일(multipart) | **필수** 배포할 JAR 파일이며, multipart/form-data로 파일 업로드해 전달합니다. |
| deployMode | 쿼리 | 단위를 배포할 노드 수를 정의합니다. `MAJORITY`로 설정하면 클러스터 관리 그룹 과반수를 구성하기에 충분한 노드에 배포합니다. `ALL`로 설정하면 모든 노드에 배포합니다. `initialNodes` 매개변수와 함께 사용할 수 없습니다. |
| initialNodes | 쿼리 | 단위를 배포할 특정 노드 이름 목록입니다. `deployMode` 매개변수와 함께 사용할 수 없습니다. |

예를 들어 로컬 클러스터의 특정 노드에 새 단위를 다음과 같이 배포할 수 있습니다.

```bash
curl -X POST 'http://localhost:10300/management/v1/deployment/units/unit/1.0.0?initialNodes=node1,node2' \
  -H "Content-Type: multipart/form-data" \
  -F "unitContent=@/path/to/your/unit.jar"
```

- `deployMode`나 `initialNodes` 매개변수로 대상 노드를 지정할 수 있습니다. 이 옵션들은 유사한 CLI 매개변수와 같은 목적으로 동작하며, 필요에 따라 단위가 전파되도록 합니다.
- 자세한 내용은 해당 [API 문서](https://ignite.apache.org/releases/ignite3/openapi.yaml)를 참고하세요.

### 수동 배포 {#deploy-manually}

필요하면 노드의 배포 단위 저장소에 코드를 직접 추가해 새 단위를 수동으로 배포할 수 있습니다. 다른 배포 방법과 달리, 새 배포 단위를 로드하려면 노드를 재시작해야 합니다.

코드를 배포하려면:

- 노드에서 [배포 단위 위치](#deployment-unit-location)를 찾습니다.
- 새 디렉터리를 만듭니다. 이 디렉터리는 배포 단위 ID로 사용됩니다.
- 새 하위 디렉터리를 만듭니다. 이 디렉터리는 배포 단위 버전으로 사용되며, 이름은 [시맨틱 버전](https://semver.org/)을 사용해야 합니다.
- 하위 디렉터리에 코드를 추가합니다.
- 노드를 재시작해 새 코드를 로드합니다.

그 결과 디렉터리 구조는 다음과 같은 모습이 됩니다.

```
deployment
└─ myUnit
  └─ 1.0.0
     └─ [code files]
```

## 단위 정보 조회 {#getting-unit-information}

이 섹션에서는 클러스터 전체 또는 특정 노드의 모든 배포를 조회하는 방법, 상태·버전 등 단위 세부 정보를 확인하는 방법, 이러한 속성으로 배포를 검색하거나 필터링하는 방법을 설명합니다.

### CLI로 단위 정보 조회 {#get-unit-information-via-cli}

`unit list` 명령으로 배포 단위 목록을 조회할 수 있습니다.

:::note
CLI에서 `unit list` 명령을 실행하면 배포 단위 목록이 출력됩니다. 별표(*)는 활성 버전을 나타내며, 배포 순서와 관계없이 항상 가장 높은 [시맨틱 버전](https://semver.org/)입니다.
:::

- `cluster unit list` 명령으로 클러스터에 배포된 모든 단위를 확인합니다.
- `node unit list` 명령으로 명령을 실행한 노드의 단위만 확인합니다.
- 명령에 단위 ID를 전달하면 특정 단위의 정보를 조회합니다.

  ```bash
  cluster unit list test-unit
  ```

- `version` 명령 옵션을 추가해 단위를 검색합니다.

  ```bash
  cluster unit list test-unit --version 1.0.0
  ```

- 또는 `status`로 필터링합니다.

  ```bash
  cluster unit list test-unit --status deployed
  ```

| 매개변수 | 설명 |
|-----------|-------------|
| statuses | 상태로 단위를 필터링합니다.<br/>- `UPLOADING` - 단위가 클러스터에 배포되는 중<br/>- `DEPLOYED` - 단위가 클러스터에 배포되어 사용 가능<br/>- `OBSOLETE` - 단위 제거 명령을 받았지만 아직 일부 작업에서 사용 중<br/>- `REMOVING` - 단위가 제거되는 중<br/><br/>지정하지 않으면 모든 상태의 배포 단위를 반환합니다. |

### REST로 단위 정보 조회 {#get-unit-information-via-rest}

`GET` 요청으로도 배포 단위의 세부 정보를 조회할 수 있습니다.

- 노드나 클러스터 전체에서 특정 단위의 정보를 조회하려면 각각 `/management/v1/deployment/node/units/{unitId}`와 `/management/v1/deployment/cluster/units/{unitId}`를 사용합니다.

  ```bash
  curl -X GET 'http://localhost:10300/management/v1/deployment/cluster/units/test-unit/1.0.0'
  ```

- 노드나 클러스터 전체의 모든 배포 단위 목록을 조회하려면 각각 `/management/v1/deployment/node/units`와 `/management/v1/deployment/cluster/units`를 사용합니다.

  ```bash
  curl -X GET 'http://localhost:10300/management/v1/deployment/cluster/units/'
  ```

- 특정 버전이나 상태의 배포만 조회하도록 검색 범위를 좁힐 수도 있습니다.

| 매개변수 | 타입 | 설명 |
|-----------|------|-------------|
| unitId | 경로 | **필수** 배포 단위의 고유 단위 ID입니다. |
| version | 쿼리 | 배포 단위의 고유 버전입니다. 지정하지 않으면 배포 단위의 모든 버전을 반환합니다. |
| statuses | 쿼리 | 반환할 배포 단위의 상태입니다. 가능한 값은 다음과 같습니다.<br/>- `UPLOADING` - 단위가 클러스터에 배포되는 중<br/>- `DEPLOYED` - 단위가 클러스터에 배포되어 사용 가능<br/>- `OBSOLETE` - 단위 제거 명령을 받았지만 아직 일부 작업에서 사용 중<br/>- `REMOVING` - 단위가 제거되는 중<br/><br/>지정하지 않으면 모든 상태의 배포 단위를 반환합니다. |

## 단위 배포 해제 {#undeploying-unit}

배포 단위 버전이 더 이상 필요하지 않으면 클러스터에서 배포 해제할 수 있습니다.

### CLI로 배포 해제 {#undeploy-via-cli}

`cluster unit undeploy` 명령을 사용하세요. 제거할 단위 ID와 단위 `version`을 지정합니다.

```bash
cluster unit undeploy test-unit --version 1.0.0
```

- 같은 ID의 단위를 한 번에 모두 배포 해제할 수 없으므로, 버전별로 제거해야 합니다.
- 버전이 여러 개인 단위를 배포 해제하면, 활성 코드는 버전 번호 기준으로 그다음으로 최신인 버전으로 롤백됩니다.

### REST로 배포 해제 {#undeploy-via-rest}

특정 노드에서 단위를 배포 해제하려면 `/management/v1/deployment/units/{unitId}/{unitVersion}` 엔드포인트로 `DELETE` 요청을 보내세요.

예를 들어 node1과 node2 노드에서 같은 단위를 배포 해제하려면 다음 명령을 사용합니다.

```bash
curl -X DELETE 'http://localhost:10300/management/v1/deployment/units/test-unit/1.0.0?nodes=node1,node2'
```

클러스터가 요청을 받으면 지정한 배포 단위 버전을 모든 노드에서 삭제합니다.
단위가 작업에서 사용 중이면 삭제하는 대신 `OBSOLETE` 상태로 옮겨지며, 더 이상 필요하지 않을 때 제거됩니다.
