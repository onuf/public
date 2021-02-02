/* Do not change these import lines. Datagrok will import API library in exactly the same manner */
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

export let _package = new DG.Package();
let packageName = 'Chemblbrowser'

//name: test
//input: string s
export function test(s) {
  grok.shell.info(_package.webRoot);
}



//name: getAllChemblStructures
//input: int molregno
//output: dataframe df
export async function getAllChemblStructures(molregno) {
  let queryName = 'allChemblStructures';
  console.log(molregno)
  return await grok.data.query(`${packageName}:${queryName}`, {'molregno': molregno});
}
