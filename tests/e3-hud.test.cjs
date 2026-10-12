const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
test('E3 compact HUD keeps only route length and laps and has no removed-element updates',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');for(const id of ['turnCount','pitLength','focusDesc'])assert.ok(!html.includes(id));for(const text of ['預估單圈','最高速目標','概念估算','概念建議'])assert.ok(!html.includes(text));assert.ok(html.includes('id="len"'));assert.ok(html.includes('id="laps"'));assert.ok(html.includes('非官方概念設計 / UNOFFICIAL CONCEPT'));
});
