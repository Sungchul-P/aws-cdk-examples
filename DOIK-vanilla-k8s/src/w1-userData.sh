#!/bin/bash
hostnamectl --static set-hostname k8s-w1

# Initial Config
export KUBERNETES_VERSION=${KubernetesVersion}
curl -fsSL https://raw.githubusercontent.com/gasida/DOIK/main/vanilla/init.sh | sh

# Config Worker
curl -fsSL https://raw.githubusercontent.com/gasida/DOIK/main/vanilla/worker.sh | sh