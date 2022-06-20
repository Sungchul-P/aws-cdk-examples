import { App, YamlOutputType } from 'cdk8s';
import { MongoDbChart } from './construct/psmdb/psmdb'
import { PsmdbOperatorChart } from './construct/psmdb/psmdb-operator'

const app = new App({
  outputFileExtension: '.yaml',
  yamlOutputType: YamlOutputType.FILE_PER_CHART
});
const mongoDb = new MongoDbChart(app, 'psmdb');
const psmdbOperator = new PsmdbOperatorChart(app, 'psmdb-operator');

mongoDb.addDependency(psmdbOperator);

app.synth();
