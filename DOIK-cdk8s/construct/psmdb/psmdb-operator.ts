import { Construct } from 'constructs';
import { Chart, ChartProps } from 'cdk8s';

import * as k from '../../imports/k8s';

export class PsmdbOperatorChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    const psmdb_operator_role = new k.KubeRole(this, 'psmdb-operator-role', {
      metadata: {
        name: 'percona-server-mongodb-operator'
      },
      rules: [
        { 
          apiGroups: [
            'psmdb.percona.com'
          ],
          resources: [
            'perconaservermongodbs',
            'perconaservermongodbs/status',
            'perconaservermongodbbackups',
            'perconaservermongodbbackups/status',
            'perconaservermongodbrestores',
            'perconaservermongodbrestores/status'
          ],
          verbs: [
            'get',
            'list',
            'watch',
            'create',
            'update',
            'patch',
            'delete'
          ]
        }, {
          apiGroups: [
            ''
          ], 
          resources: [
            'pods',
            'pods/exec',
            'services',
            'persistentvolumeclaims',
            'secrets',
            'configmaps'
          ],
          verbs: [
            'get',
            'list',
            'watch',
            'create',
            'update',
            'patch',
            'delete'
          ]
        }, {
          apiGroups: [
            'apps'
          ],
          resources: [
            'deployments',
            'replicasets',
            'statefulsets'
          ],
          verbs: [
            'get',
            'list',
            'watch',
            'create',
            'update',
            'patch',
            'delete'
          ]
        }, {
          apiGroups: [
            'batch'
          ], 
          resources: [
            'cronjobs'
          ],
          verbs: [
            'get',
            'list',
            'watch',
            'create',
            'update',
            'patch',
            'delete'
          ]
        }, {
          apiGroups: [
            'policy'
          ],
          resources: [
            'poddisruptionbudgets'
          ],
          verbs: [
            'get',
            'list',
            'watch',
            'create',
            'update',
            'patch',
            'delete'
          ]
        }, {
          apiGroups: [
            'coordination.k8s.io'
          ], 
          resources: [
            'leases'
          ],
          verbs: [
            'get',
            'list',
            'watch',
            'create',
            'update',
            'patch',
            'delete'
          ]
        }, {
          apiGroups: [
            ''
          ],
          resources: [
            'events'
          ],
          verbs: [
            'create',
            'patch'
          ]
        }, {
          apiGroups: [
            'certmanager.k8s.io',
            'cert-manager.io'
          ],
          resources: [
            'issuers',
            'certificates'
          ],
          verbs: [
            'get',
            'list',
            'watch',
            'create',
            'update',
            'patch',
            'delete',
            'deletecollection'
          ]
        }, {
          apiGroups: [
            'net.gke.io',
            'multicluster.x-k8s.io'
          ],
          resources: [
            'serviceexports',
            'serviceimports'
          ],
          verbs: [
            'get',
            'list',
            'watch',
            'create',
            'update',
            'patch',
            'delete',
            'deletecollection'
          ]
        }
      ]
    });

    const psmdb_operator_sa = new k.KubeServiceAccount(this, 'psmdb-operator-sa', {
      metadata: {
        name: 'percona-server-mongodb-operator'
      }
    });

    new k.KubeRoleBinding(this, 'psmdb-operator-rolebinding', {
      metadata: {
        name: 'service-account-percona-server-mongodb-operator'
      },
      subjects: [
        {
          kind: 'ServiceAccount',
          name: psmdb_operator_sa.name
        }
      ],
      roleRef: {
        kind: 'Role',
        name: psmdb_operator_role.name,
        apiGroup: psmdb_operator_role.apiGroup
      }
    });

    new k.KubeDeployment(this, 'psmdb-operator-deployment', {
      metadata: {
        name: 'percona-server-mongodb-operator'
      }, 
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            name: 'percona-server-mongodb-operator'
          }
        }, 
        template: {
          metadata: {
            labels: {
              name: 'percona-server-mongodb-operator'
            }
          },
          spec: {
            serviceAccountName: psmdb_operator_sa.name,
            containers: [
              {
                name: 'percona-server-mongodb-operator',
                image: 'percona/percona-server-mongodb-operator:1.12.0',
                ports: [
                  {
                    containerPort: 60000,
                    protocol: 'TCP',
                    name: 'metrics'
                  }
                ],
                command: [
                  'percona-server-mongodb-operator'
                ],
                imagePullPolicy: 'Always',
                env: [
                  { 
                    name: 'WATCH_NAMESPACE',
                    valueFrom: {
                      fieldRef: {
                        fieldPath: 'metadata.namespace'
                      }
                    }
                  }, {
                    name: 'POD_NAME',
                    valueFrom: {
                      fieldRef: {
                        fieldPath: 'metadata.name'
                      }
                    }
                  }, {
                    name: 'OPERATOR_NAME',
                    value: 'percona-server-mongodb-operator'
                  }, {
                    name: 'RESYNC_PERIOD',
                    value: '5s'
                  }, {
                    name: 'LOG_VERBOSE',
                    value: 'false'
                  }
                ]
              }
            ],
            nodeSelector: {
              'kubernetes.io/hostname': 'k8s-m'
            },
            tolerations: [
              {
                effect: 'NoSchedule',
                key: 'node-role.kubernetes.io/master',
                operator: 'Exists'
              }
            ]
          }
        }
      }
    });
  }
}