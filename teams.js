/* 2026 team names verified against formula1.com/en/teams; simplified concept colours. */
(function(root){
const teams=[
 {name:'McLAREN',color:'#ff8700',accent:'#101b24',ink:'#101b24'},
 {name:'FERRARI',color:'#df2635',accent:'#ffe45c',ink:'#ffffff'},
 {name:'MERCEDES',color:'#26d6bd',accent:'#151b22',ink:'#101b24'},
 {name:'RED BULL RACING',color:'#182d68',accent:'#f5cf34',ink:'#ffffff'},
 {name:'ASTON MARTIN',color:'#00685c',accent:'#c7e851',ink:'#ffffff'},
 {name:'ALPINE',color:'#ed80ba',accent:'#288bd3',ink:'#102c43'},
 {name:'WILLIAMS',color:'#1669d8',accent:'#edf3fa',ink:'#ffffff'},
 {name:'RACING BULLS',color:'#f0f2f4',accent:'#285acd',ink:'#214fad'},
 {name:'HAAS',color:'#e7e9e9',accent:'#db2437',ink:'#18222c'},
 {name:'AUDI',color:'#e34338',accent:'#b6bbc0',ink:'#121b23'},
 {name:'CADILLAC',color:'#333b47',accent:'#e2e7e9',ink:'#ffffff'}
].map((t,i)=>({...t,x:-267+i*28,z:24,sign:i+3}));
const api={teams,signRows:16};if(typeof module==='object')module.exports=api;else root.CircuitTeams=api;
})(typeof window==='object'?window:this);
