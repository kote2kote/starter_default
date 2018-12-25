///Modules Basics
//-------------------------------------------------------------

//export let keyValue = 1000;
//export function test() {
//  console.log('モジュール側からハロー！');
//}

let keyValue = 1000;
function test() {
  keyValue = 2000;
  console.log(keyValue);
  console.log('モジュール側からハロー！');
}

export {keyValue, test};

///Import & Export Syntax
//-------------------------------------------------------------

let ab = 'ABテスト。なんつって。';
export default ab; //defaultは一つのみを持つことができる
