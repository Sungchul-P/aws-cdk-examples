import { Construct } from 'constructs';
import { Chart, ChartProps } from 'cdk8s';

import * as psmdb from '../../imports/psmdb-psmdb.percona.com';
import * as k from '../../imports/k8s';

export class MongoDbChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new k.KubeSecret(this, 'psmdb-secrets', {
      metadata: {
        name: `${id}-secrets`
      },
      type: 'Opaque',
      stringData: {
        MONGODB_BACKUP_USER: 'backup',
        MONGODB_BACKUP_PASSWORD: 'backup123456',
        MONGODB_CLUSTER_ADMIN_USER: 'clusterAdmin',
        MONGODB_CLUSTER_ADMIN_PASSWORD: 'clusterAdmin123456',
        MONGODB_CLUSTER_MONITOR_USER: 'clusterMonitor',
        MONGODB_CLUSTER_MONITOR_PASSWORD: 'clusterMonitor123456',
        MONGODB_USER_ADMIN_USER: 'userAdmin',
        MONGODB_USER_ADMIN_PASSWORD: 'userAdmin123456',
        PMM_SERVER_USER: 'admin',
        PMM_SERVER_PASSWORD: 'admin',
      }
    });
    
    new psmdb.PerconaServerMongoDb(this, 'psmdb1', {
      metadata: {
        name: `${id}-db`,
        finalizers: [
          'delete-psmdb-pods-in-order'
        ]
      },
      spec: {
        // platform: 'openshift',
        // clusterServiceDnsSuffix: '',
        // clusterServiceDnsMode: '',
        // pause: true,
        // unmanaged: false,
        crVersion: '1.12.0',
        image: 'percona/percona-server-mongodb:5.0.7-6',
        imagePullPolicy: 'Always',
        // tls: {
        //   certValidityDuration: '2160h'
        // },
        // imagePullSecrets: [{
        //   name: 'private-registry-credentials'
        // }],
        // runUid: 1001,
        allowUnsafeConfigurations: false,
        updateStrategy: 'SmartUpdate',
        // multiCluster: {
        //   enabled: true,
        //   dnsSuffix: 'svc.clusterset.local'
        // },
        upgradeOptions: {
          versionServiceEndpoint: 'https://check.percona.com',
          apply: '5.0-recommended',
          schedule: '0 2 * * *',
          setFcv: false
        },
        secrets: {
          users: `${id}-secrets`,
          encryptionKey: `${id}-mongodb-encryption-key`
        },
        pmm: {
          enabled: false,
          image: 'percona/pmm-client:2.27.0',
          serverHost: 'monitoring-service',
          // mongodParams: '--environment=ENVIRONMENT'
        },

        // replsets spec. START=>
        replsets: [
          {
            name: 'rs0',
            size: 3,
            // externalNodes: [
            //   {
            //     host: '34.124.76.92',
            //     port: 27017,
            //     votes: 0,
            //     priority: 0 
            //   }
            // ],
            // for more configuration fields refer to https://docs.mongodb.com/manual/reference/configuration-options/
//             configuration: `operationProfiling:
//   mode: slowOp
// systemLog:
//   verbosity: 1
// storage:
//   engine: wiredTiger
//   wiredTiger:
//     engineConfig:
//       directoryForIndexes: false
//       journalCompressor: snappy
//     collectionConfig:
//       blockCompressor: snappy
//     indexConfig:
//       prefixCompression: true`,
            // affinity: {
            //   antiAffinityTopologyKey: 'kubernetes.io/hostname',
            //   advanced: {
            //     nodeAffinity: {
            //       requiredDuringSchedulingIgnoredDuringExecution: {
            //         nodeSelectorTerms: [
            //           {
            //             matchExpressions: [
            //               {
            //                 key: 'kubernetes.io/e2e-az-name',
            //                 operator: 'In',
            //                 values: [
            //                   'e2e-az1',
            //                   'e2e-az2'
            //                 ]
            //               }
            //             ]
            //           }
            //         ]
            //       }
            //     }
            //   }
            // },
            // tolerations: [
            //   {
            //     key: 'node.alpha.kubernetes.io/unreachable',
            //     operator: 'Exists',
            //     effect: 'NoExecute',
            //     tolerationSeconds: 6000
            //   }
            // ],
            // priorityClassName: 'high-priority',
            // annotations: {
            //   'iam.amazonaws.com/role': 'role-arn'
            // },
            // labels: {
            //   rack: 'rack-22'
            // },
            // nodeSelector: {
            //   diskType: 'ssd'
            // },
            // storage: {
            //   engine: 'wiredTiger',
            //   wiredTiger: {
            //     engineConfig: {
            //       cacheSizeRatio: 0.5,
            //       directoryForIndexes: false,
            //       journalCompressor: 'snappy'
            //     },
            //     collectionConfig: {
            //       blockCompressor: 'snappy'
            //     },
            //     indexConfig: {
            //       prefixCompression: true
            //     }
            //   },
            //   inMemory: {
            //     engineConfig: {
            //       inMemorySizeRatio: 0.5
            //     }
            //   }
            // },
            // livenessProbe: {
            //   failureThreshold: 4,
            //   initialDelaySeconds: 60,
            //   periodSeconds: 30,
            //   timeoutSeconds: 10,
            //   startupDelaySeconds: 7200
            // },
            // readinessProbe: {
            //   failureThreshold: 8,
            //   initialDelaySeconds: 10,
            //   periodSeconds: 3,
            //   successThreshold: 1,
            //   timeoutSeconds: 2
            // },
            // runtimeClassName: 'image-rc',
            // sidecars: [
            //   {
            //     name: 'rs-sidecar-1',
            //     image: 'busybox',
            //     command: ["/bin/sh"],
            //     args: ["-c", "while true; do echo echo $(date -u) 'test' >> /dev/null; sleep 5;done"],
            //     volumeMounts: [
            //       {
            //         name: 'sidecar-volume-claim',
            //         mountPath: '/volume1'
            //       },
            //       {
            //         name: 'sidecar-secret',
            //         mountPath: '/secret'
            //       },
            //       {
            //         name: 'sidecar-config',
            //         mountPath: '/configmap'
            //       }
            //     ]
            //   }
            // ],
            // sidecarVolumes: [
            //   {
            //     name: 'sidecar-secret',
            //     secret: {
            //       secretName: 'mysecret'
            //     }
            //   },
            //   {
            //     name: 'sidecar-config',
            //     configMap: {
            //       name: 'myconfigmap'
            //     }
            //   }
            // ],
            // sidecarPvCs: [
            //   {
            //     apiVersion: 'v1',
            //     kind: 'PersistentVolumeClaim',
            //     metadata: {
            //       name: 'sidecar-volume-claim'
            //     },
            //     spec: {
            //       resources: {
            //         requests: {
            //           storage: psmdb.PerconaServerMongoDbSpecReplsetsSidecarPvCsSpecResourcesRequests.fromString('1Gi')
            //         }
            //       },
            //       volumeMode: 'Filesystem',
            //       accessModes: [
            //         'ReadWriteOnce'
            //       ]
            //     }
            //   }
            // ],
            podDisruptionBudget: {
              maxUnavailable: psmdb.PerconaServerMongoDbSpecReplsetsPodDisruptionBudgetMaxUnavailable.fromNumber(1),
              // minAvailable: psmdb.PerconaServerMongoDbSpecReplsetsPodDisruptionBudgetMinAvailable.fromNumber(0)
            },
            expose: {
              enabled: false,
              exposeType: 'ClusterIP',
              // loadBalancerSourceRanges: [
              //   '10.0.0.0/8'
              // ],
              // serviceAnnotations: {
              //   'service.beta.kubernetes.io/aws-load-balancer-backend-protocol': 'http'
              // }
            },
            resources: {
              limits: {
                cpu: psmdb.PerconaServerMongoDbSpecReplsetsResourcesLimits.fromString('300m'),
                memory: psmdb.PerconaServerMongoDbSpecReplsetsResourcesLimits.fromString('0.5G')
              },
              requests: {
                cpu: psmdb.PerconaServerMongoDbSpecReplsetsResourcesRequests.fromString('300m'),
                memory: psmdb.PerconaServerMongoDbSpecReplsetsResourcesRequests.fromString('0.5G')
              }
            },
            volumeSpec: {
              // emptyDir: {},
              // hostPath: {
              //   path: '/data',
              //   type: 'Directory'
              // },
              persistentVolumeClaim: {
                // storageClassName: 'standard',
                // accessModes: ['ReadWriteOnce'],
                resources: {
                  requests: {
                    storage: psmdb.PerconaServerMongoDbSpecReplsetsVolumeSpecPersistentVolumeClaimResourcesRequests.fromString('5Gi')
                  }
                }
              }, 
            },

            // replsets.nonvoting START=>
            nonvoting: {
              enabled: false,
              // podSecurityContext: {},
              // containerSecurityContext: {},
              size: 3,
              // for more configuration fields refer to https://docs.mongodb.com/manual/reference/configuration-options/
//               configuration: `operationProfiling:
//   mode: slowOp
// systemLog:
//   verbosity: 1`,
              affinity: {
                antiAffinityTopologyKey: 'kubernetes.io/hostname',
                // advanced: {
                //   nodeAffinity: {
                //     requiredDuringSchedulingIgnoredDuringExecution: {
                //       nodeSelectorTerms: [
                //         {
                //           matchExpressions: [
                //             {
                //               key: 'kubernetes.io/e2e-az-name',
                //               operator: 'In',
                //               values: [
                //                 'e2e-az1',
                //                 'e2e-az2'
                //               ]
                //             }
                //           ]
                //         }
                //       ]
                //     }
                //   }
                // }
              },
              // tolerations: [
              //   {
              //     key: 'node.alpha.kubernetes.io/unreachable',
              //     operator: 'Exists',
              //     effect: 'NoExecute',
              //     tolerationSeconds: 6000
              //   }
              // ],
              // priorityClassName: 'high-priority',
              // annotations: {
              //   'iam.amazonaws.com/role': 'role-arn'
              // },
              // labels: {
              //   rack: 'rack-22'
              // },
              // nodeSelector: {
              //   diskType: 'ssd'
              // },
              podDisruptionBudget: {
                maxUnavailable: psmdb.PerconaServerMongoDbSpecReplsetsNonvotingPodDisruptionBudgetMaxUnavailable.fromNumber(1),
                // minAvailable: psmdb.PerconaServerMongoDbSpecReplsetsNonvotingPodDisruptionBudgetMinAvailable.fromNumber(0)
              },
              resources: {
                limits: {
                  cpu: psmdb.PerconaServerMongoDbSpecReplsetsNonvotingResourcesLimits.fromString('300m'),
                  memory: psmdb.PerconaServerMongoDbSpecReplsetsNonvotingResourcesLimits.fromString('0.5G')
                },
                requests: {
                  cpu: psmdb.PerconaServerMongoDbSpecReplsetsNonvotingResourcesRequests.fromString('300m'),
                  memory: psmdb.PerconaServerMongoDbSpecReplsetsNonvotingResourcesRequests.fromString('0.5G')
                }
              },
              volumeSpec: {
                emptyDir: {},
                hostPath: {
                  path: '/data',
                  type: 'Directory'
                },
                persistentVolumeClaim: {
                  storageClassName: 'standard',
                  accessModes: ['ReadWriteOnce'],
                  resources: {
                    requests: {
                      storage: psmdb.PerconaServerMongoDbSpecReplsetsNonvotingVolumeSpecPersistentVolumeClaimResourcesRequests.fromString('5Gi')
                    }
                  }
                }
              }
            },
            // => replsets.nonvoting END

            // replsets.arbiter START=>
            arbiter: {
              enabled: false,
              size: 1,
              affinity: {
                antiAffinityTopologyKey: 'kubernetes.io/hostname',
                // advanced: {
                //   nodeAffinity: {
                //     requiredDuringSchedulingIgnoredDuringExecution: {
                //       nodeSelectorTerms: [
                //         {
                //           matchExpressions: [
                //             {
                //               key: 'kubernetes.io/e2e-az-name',
                //               operator: 'In',
                //               values: [
                //                 'e2e-az1',
                //                 'e2e-az2'
                //               ]
                //             }
                //           ]
                //         }
                //       ]
                //     }
                //   }
                // }
              },
              // tolerations: [
              //   {
              //     key: 'node.alpha.kubernetes.io/unreachable',
              //     operator: 'Exists',
              //     effect: 'NoExecute',
              //     tolerationSeconds: 6000
              //   }
              // ],
              // priorityClassName: 'high-priority',
              // annotations: {
              //   'iam.amazonaws.com/role': 'role-arn'
              // },
              // labels: {
              //   rack: 'rack-22'
              // },
              // nodeSelector: {
              //   diskType: 'ssd'
              // }
            },
            // => replsets.arbiter END
          }
        ],
        // => replsets spec. END

        // sharding spec. START=>
        sharding: {
          enabled: false,
          configsvrReplSet: {
            size: 3,
            // externalNodes: [
            //   {
            //     host: '34.124.76.94',
            //     port: 27017,
            //     votes: 0,
            //     priority: 0
            //   }
            // ],
            // for more configuration fields refer to https://docs.mongodb.com/manual/reference/configuration-options/
//             configuration: `operationProfiling:
//   mode: slowOp
// systemLog:
//   verbosity: 1`,
            affinity: {
              antiAffinityTopologyKey: 'kubernetes.io/hostname',
              // advanced: {
              //   nodeAffinity: {
              //     requiredDuringSchedulingIgnoredDuringExecution: {
              //       nodeSelectorTerms: [
              //         {
              //           matchExpressions: [
              //             {
              //               key: 'kubernetes.io/e2e-az-name',
              //               operator: 'In',
              //               values: [
              //                 'e2e-az1',
              //                 'e2e-az2'
              //               ]
              //             }
              //           ]
              //         }
              //       ]
              //     }
              //   }
              // }
            },
            // tolerations: [
            //   {
            //     key: 'node.alpha.kubernetes.io/unreachable',
            //     operator: 'Exists',
            //     effect: 'NoExecute',
            //     tolerationSeconds: 6000
            //   }
            // ],
            // priorityClassName: 'high-priority',
            // annotations: {
            //   'iam.amazonaws.com/role': 'role-arn'
            // },
            // labels: {
            //   rack: 'rack-22'
            // },
            // nodeSelector: {
            //   diskType: 'ssd'
            // },
            // livenessProbe: {
            //   failureThreshold: 4,
            //   initialDelaySeconds: 60,
            //   periodSeconds: 30,
            //   timeoutSeconds: 10,
            //   startupDelaySeconds: 7200
            // },
            // readinessProbe: {
            //   failureThreshold: 3,
            //   initialDelaySeconds: 10,
            //   periodSeconds: 3,
            //   successThreshold: 1,
            //   timeoutSeconds: 2
            // },
            // runtimeClassName: 'image-rc',
            // sidecars: [
            //   {
            //     name: 'rs-sidecar-1',
            //     image: 'busybox',
            //     command: ["/bin/sh"],
            //     args: ["-c", "while true; do echo echo $(date -u) 'test' >> /dev/null; sleep 5;done"]
            //   }
            // ],
            podDisruptionBudget: {
              maxUnavailable: psmdb.PerconaServerMongoDbSpecShardingConfigsvrReplSetPodDisruptionBudgetMaxUnavailable.fromNumber(1)
            },
            expose: {
              enabled: false,
              exposeType: 'ClusterIP',
              // loadBalancerSourceRanges: [
              //   '10.0.0.0/8'
              // ],
              // serviceAnnotations: {
              //   'service.beta.kubernetes.io/aws-load-balancer-backend-protocol': 'http'
              // }
            },
            resources: {
              limits: {
                cpu: psmdb.PerconaServerMongoDbSpecShardingConfigsvrReplSetResourcesLimits.fromString('300m'),
                memory: psmdb.PerconaServerMongoDbSpecShardingConfigsvrReplSetResourcesLimits.fromString('0.5G')
              },
              requests: {
                cpu: psmdb.PerconaServerMongoDbSpecShardingConfigsvrReplSetResourcesRequests.fromString('300m'),
                memory: psmdb.PerconaServerMongoDbSpecShardingConfigsvrReplSetResourcesRequests.fromString('0.5G')
              }
            },
            volumeSpec: {
              // emptyDir: {},
              // hostPath: {
              //   path: '/data',
              //   type: 'Directory'
              // },
              persistentVolumeClaim: {
                // storageClassName: 'standard',
                // accessModes: [ "ReadWriteOnce" ],
                resources: {
                  requests: {
                    storage: psmdb.PerconaServerMongoDbSpecShardingConfigsvrReplSetVolumeSpecPersistentVolumeClaimResourcesRequests.fromString('5Gi')
                  }
                }
              }
            }
          },
          mongos: {
            size: 3,
            // for more configuration fields refer to https://docs.mongodb.com/manual/reference/configuration-options/
            // configuration: `
            // `,
            affinity: {
              antiAffinityTopologyKey: 'kubernetes.io/hostname',
              // advanced: {
              //   nodeAffinity: {
              //     requiredDuringSchedulingIgnoredDuringExecution: {
              //       nodeSelectorTerms: [
              //         {
              //           matchExpressions: [
              //             {
              //               key: 'kubernetes.io/e2e-az-name',
              //               operator: 'In',
              //               values: [
              //                 'e2e-az1',
              //                 'e2e-az2'
              //               ]
              //             }
              //           ]
              //         }
              //       ]
              //     }
              //   }
              // }
            },
            // tolerations: [
            //   {
            //     key: 'node.alpha.kubernetes.io/unreachable',
            //     operator: 'Exists',
            //     effect: 'NoExecute',
            //     tolerationSeconds: 6000
            //   }
            // ],
            // priorityClassName: 'high-priority',
            // annotations: {
            //   'iam.amazonaws.com/role': 'role-arn'
            // },
            // labels: {
            //   rack: 'rack-22'
            // },
            // nodeSelector: {
            //   diskType: 'ssd'
            // },
            // livenessProbe: {
            //   failureThreshold: 4,
            //   initialDelaySeconds: 60,
            //   periodSeconds: 30,
            //   timeoutSeconds: 10,
            //   startupDelaySeconds: 7200
            // },
            // readinessProbe: {
            //   failureThreshold: 3,
            //   initialDelaySeconds: 10,
            //   periodSeconds: 3,
            //   successThreshold: 1,
            //   timeoutSeconds: 2
            // },
            // runtimeClassName: 'image-rc',
            // sidecars: [
            //   {
            //     name: 'rs-sidecar-1',
            //     image: 'busybox',
            //     command: ["/bin/sh"],
            //     args: ["-c", "while true; do echo echo $(date -u) 'test' >> /dev/null; sleep 5;done"]
            //   }
            // ],
            podDisruptionBudget: {
              maxUnavailable: psmdb.PerconaServerMongoDbSpecShardingMongosPodDisruptionBudgetMaxUnavailable.fromNumber(1)
            },
            resources: {
              limits: {
                cpu: psmdb.PerconaServerMongoDbSpecShardingMongosResourcesLimits.fromString('300m'),
                memory: psmdb.PerconaServerMongoDbSpecShardingMongosResourcesLimits.fromString('0.5G')
              },
              requests: {
                cpu: psmdb.PerconaServerMongoDbSpecShardingMongosResourcesRequests.fromString('300m'),
                memory: psmdb.PerconaServerMongoDbSpecShardingMongosResourcesRequests.fromString('0.5G')
              }
            },
            expose: {
              exposeType: 'ClusterIP',
            //   servicePerPod: true,
            //   loadBalancerSourceRanges: [
            //     '10.0.0.0/8'
            //   ],
            //   serviceAnnotations: {
            //     'service.beta.kubernetes.io/aws-load-balancer-backend-protocol': 'http'
            //   }
            },
            // auditLog: {
            //   destination: 'file',
            //   format: 'BSON',
            //   filter: '{}'
            // }
          },
        },
        // => sharding spec. END

        // mongod: {
        //   security: {
        //     encryptionKeySecret: 'my-cluster-name-mongodb-encryption-key'
        //   }
        // }

        // => sharding spec. START =>
        backup: {
          enabled: false,
          image: 'percona/percona-backup-mongodb:1.7.0',
          serviceAccountName: 'percona-server-mongodb-operator',
          // annotations: {
          //   'iam.amazonaws.com/role': 'role-arn'
          // },
          // resources: {
          //   limits: {
          //     cpu: psmdb.PerconaServerMongoDbSpecBackupResourcesLimits.fromString('300m'),
          //     memory: psmdb.PerconaServerMongoDbSpecBackupResourcesLimits.fromString('0.5G')
          //   },
          //   requests: {
          //     cpu: psmdb.PerconaServerMongoDbSpecBackupResourcesRequests.fromString('300m'),
          //     memory: psmdb.PerconaServerMongoDbSpecBackupResourcesRequests.fromString('0.5G')
          //   }
          // },
          // storages: {
          //   's3-ap-northeast': {
          //     type: 's3',
          //     s3: {
          //       bucket: '',
          //       credentialsSecret: 'my-cluster-name-backup-s3',
          //       region: 'ap-northeast-2',
          //       prefix: '',
          //       uploadPartSize: 10485760,
          //       maxUploadParts: 10000,
          //       storageClass: 'STANDARD',
          //       insecureSkipTlsVerify: false
          //     }
          //   },
          //   minio: {
          //     type: 's3',
          //     s3: {
          //       bucket: '',
          //       region: '',
          //       credentialsSecret: '',
          //       endpointUrl: 'http://minio.psmdb.svc.cluster.local:9000/minio/',
          //       insecureSkipTlsVerify: false,
          //       prefix: ''
          //     }
          //   },
          //   'azure-blob': {
          //     type: 'azure',
          //     azure: {
          //       container: '',
          //       prefix: '',
          //       credentialsSecret :''
          //     }
          //   }
          // },

          pitr: {
            enabled: false,
            // oplogSpanMin: 10,
            compressionType: 'gzip',
            compressionLevel: 6
          },
          // tasks: [
          //   {
          //     name: 'daily-s3-ap-northeast2',
          //     enabled: true,
          //     schedule: '0 0 * * *',
          //     keep: 3,
          //     storageName: 's3-ap-northeast',
          //     compressionType: 'gzip',
          //     compressionLevel: 6
          //   }, 
          //   {
          //     name: 'weekly-s3-ap-northeast2',
          //     enabled: false,
          //     schedule: '0 0 * * 0',
          //     keep: 5,
          //     storageName: 's3-ap-northeast',
          //     compressionType: 'gzip',
          //     compressionLevel: 6
          //   }
          // ]
        }
        // => backup spec. END


      }
    }); // psmdb.PerconaServerMongoDb End

  }

}