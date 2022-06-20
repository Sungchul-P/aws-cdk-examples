import { App, YamlOutputType } from 'cdk8s';
import { MongoDbChart } from './construct/psmdb/psmdb'
import { PsmdbOperatorChart } from './construct/psmdb/psmdb-operator'

const app = new App({
  outputFileExtension: '.yaml',
  yamlOutputType: YamlOutputType.FOLDER_PER_CHART_FILE_PER_RESOURCE
});
new MongoDbChart(app, 'psmdb');
new PsmdbOperatorChart(app, 'psmdb-operator');
app.synth();
