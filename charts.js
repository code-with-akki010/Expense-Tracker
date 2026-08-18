let categoryChart,monthlyChart;
function updateCharts(data){
 const byCategory={}; data.filter(t=>t.type==='expense').forEach(t=>byCategory[t.category]=(byCategory[t.category]||0)+t.amount);
 if(categoryChart)categoryChart.destroy(); categoryChart=new Chart(document.getElementById('categoryChart'),{type:'doughnut',data:{labels:Object.keys(byCategory),datasets:[{data:Object.values(byCategory)}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});
 const months={}; data.forEach(t=>{const m=t.date.slice(0,7);if(!months[m])months[m]={income:0,expense:0};months[m][t.type]+=t.amount}); const labels=Object.keys(months).sort();
 if(monthlyChart)monthlyChart.destroy(); monthlyChart=new Chart(document.getElementById('monthlyChart'),{type:'bar',data:{labels,datasets:[{label:'Income',data:labels.map(m=>months[m].income)},{label:'Expense',data:labels.map(m=>months[m].expense)}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true}}}});
}
