#!/bin/bash
hostnamectl --static set-hostname k8s-m

# K8S Version
export KUBERNETES_VERSION=${KubernetesVersion}
echo "Kubernetes Version : $KUBERNETES_VERSION" > /root/kubernetes-version.txt

# Initial Config
curl -fsSL https://raw.githubusercontent.com/gasida/DOIK/main/vanilla/init.sh | sh

# Config Master
curl -fsSL https://raw.githubusercontent.com/gasida/DOIK/main/vanilla/master.sh | sh

# EFS
export EFS_FILE_SYSTEM_ID=${ElasticFileSystem}
echo "$EFS_FILE_SYSTEM_ID.efs.ap-northeast-2.amazonaws.com" > /root/efs.txt
mount -t nfs4 -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport $EFS_FILE_SYSTEM_ID.efs.ap-northeast-2.amazonaws.com:/ /nfs4-share