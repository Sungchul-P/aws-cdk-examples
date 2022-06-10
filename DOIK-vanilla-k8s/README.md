# [DOIK Study] 바닐라 쿠버네티스 실습 환경 (CDK Version)

CloudNet@ Team에서 DOIK(Database Operator In Kubernetes) 스터디 실습 환경으로 공개해주신 [바닐라 쿠베네티스 실습 환경 배포 가이드](https://gasidaseo.notion.site/db0869d191ec4e4d90b1c9bb722a7175)의 CloudFormation 템플릿을 CDK로 작성해봤습니다. 자세한 내용은 원본 가이드를 참고해 주시기 바랍니다!

CDK 연습삼아 작성한 것이기에, 작성 방식이 모범사례라고 볼 수 없으니 참고만 하시기 바랍니다.  
제가 검색해본 결과로는 CDK Layer2(모범사례에 맞춰 캡슐화된 자원을 사용하는 방식)를 사용하면 VPC를 구성하기 편리하나, 서브넷 CIDR을 원하는 대역으로 변경하는 것이 어려워 CDK Layer1(CloudFormation 작성 방식 그대로 사용 하는 방식)을 사용하여 구성했습니다. 

## 사전 준비 

### AWS 연결 준비

AWS 계정, SSH 키 페어, (권장) IAM 계정 생성, MFA 설정, aws-cli([설치 가이드](https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/getting-started-install.html))

### CDK 실행 준비

Node.js 10.13.0 이상 ([설치 가이드](https://nodejs.org/en/download/))

```bash
npm install -g aws-cdk

cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

## 배포 가이드

### 사용 가능한 파라미터

- KubernetesVersion : 쿠버네티스 설치 버전 (기본 1.23.6)
- (필수) KeyName : EC2 접속에 사용하는 SSH 키페어 지정
- (필수) SgIngressCidr : EC2 인스턴스를 접속할 수 있는 IP 주소 입력 (집 공인IP/32 입력) ← 보안그룹 : 모든 트래픽 허용이니 주의!

### 배포 명령어 예시

스택 기본 이름은 **myk8s** 입니다. 변경하려면 bin/doik-vanilla-k8s.ts 파일의 stackName을 수정하시면 됩니다.  
배포 시, 보안 그룹(Security Group)의 변경에 대해 확인을 요청하는데 구성 확인 후 'y'를 입력하여 진행하면 됩니다.

```bash
cdk deploy --parameters KubernetesVersion=1.23.6 \
--parameters SgIngressCidr=0.0.0.0/32 \
--parameters KeyName=doik-study-keypair	
```

### 자원 삭제

```bash
cdk destroy
```