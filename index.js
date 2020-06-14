/**
 * This javascript file will constitute the entry point of your solution.
 *
 * Edit it as you need.  It currently contains things that you might find helpful to get started.
 */

// This is not really required, but means that changes to index.html will cause a reload.
require('./site/index.html')
// Apply the styles in style.css to the page.
require('./site/style.css')

// if you want to use es6, you can do something like
//     require('./es6/myEs6code')
// here to load the myEs6code.js file, and it will be automatically transpiled.

// Change this to get detailed logging from the stomp library
global.DEBUG = false;

const url = 'ws://localhost:8011/stomp';
const client = Stomp.client(url);
client.debug = function (msg) {
  if (global.DEBUG) {
    console.info(msg);
  }
}
/*Global variable*/
let updatedData = [];
let updatedValues = {};
let changeObj = {};
let x = [];

/*
*
* ConnectedCallback():
* When you DOM is ready this function get called**
*/
function connectCallback() {
  //Variable to  get Data from stomp updates 
  let apiData;

  //Method to subscibe the stomp websocket to get updated data 
  client.subscribe('/fx/prices', function (message) {
    apiData = JSON.parse(message.body);

    //Craeting array of Object by using upadtes from server 
    updatedData.push(apiData);

    //Removing duplicate name keys from array of objects 
    x=[...new Set(updatedData.map(item=> item.name))];

    //to create sparkline 
    for(let i =0;i<x.length;i++){
      updatedValues[x[i]] = updatedData.filter(function(itm){
        return itm.name === x[i];
      }).map(item=>{
        return (item.bestBid+item.bestAsk)/2;      
        });
    }
    
    //To cteate formated data for table ctreation 
    for(let i =0;i<x.length;i++){
      changeObj[x[i]] = updatedData.filter(function(itm){
        return itm.name === x[i];
      })[updatedData.filter(function(itm){
        return itm.name === x[i];
      }).length-1]
      
    }

    //Function call to craete table with updated data 
    generateTableHead(changeObj, [
      ...new Set(updatedData.map((item) => item.name)),
    ],updatedValues );
  })
  
  document.getElementById('lastBid').addEventListener('click',sortTable);
  document.getElementById('stomp-status').innerHTML =
    'It has now successfully connected to a stomp server serving price updates for some foreign exchange currency pairs.'
}

/*
*
*sortTable():
*Function written for sorting of table columns
*/
function sortTable(){
  var table, i, x, y; 
  table = document.getElementById("table"); 
  var switching = true; 

  // Run loop until no switching is needed 
  while (switching) { 
      switching = false; 
      var rows = table.rows; 

      // Loop to go through all rows 
      for (i = 1; i < (rows.length - 1); i++) { 
          var Switch = false; 

          // Fetch 2 elements that need to be compared 
          x = rows[i].getElementsByTagName("TD")[6]; 
          y = rows[i + 1].getElementsByTagName("TD")[6]; 

          // Check if 2 rows need to be switched 
          if (Number(x.innerHTML) > Number(y.innerHTML)) 
              { 

              // If yes, mark Switch as needed and break loop 
              Switch = true; 
              break; 
          } 
      } 
      if (Switch) { 
          // Function to switch rows and mark switch as completed 
          rows[i].parentNode.insertBefore(rows[i + 1], rows[i]); 
          switching = true; 
      } 
  }
}

/*generateTableHead():
*
*
*Function written for craeting dynamic table by using uodated data
*/
function generateTableHead(data, keys, updatedValues) {
  var html = '';

  //loop for careting row and column according to data
    for(let i=0; i<keys.length;i++) {
    html += '<tr id="row">';
    html += '<td>' + data[keys[i]].name + '</td>';
    html += '<td>' + data[keys[i]].bestBid + '</td>';
    html += '<td>' + data[keys[i]].bestAsk + '</td>';
    html += '<td>' + data[keys[i]].openBid + '</td>';
    html += '<td>' + data[keys[i]].openAsk + '</td>';
    html += '<td>' + data[keys[i]].lastChangeAsk + '</td>';
    html += '<td>' + data[keys[i]].lastChangeBid + '</td>';
   
    
        html += '</tr>';
    
  
      document.getElementById('stock-update').innerHTML = html;
    }

    //loop for adding sparkline at the end of each row
    let colReady;
    for(let i=0; i<keys.length;i++) {
      colReady = document.getElementById('stock-update').rows[i];
   
      
      let col = document.createElement('td');
      let spanEle = document.createElement('span');
      spanEle.id='Sparkline' + i ;
      col.appendChild(spanEle);
      Sparkline.draw(spanEle,updatedValues[keys[i]]) ;
       var newCell = colReady.insertCell(-1);
       newCell.appendChild(spanEle);

    }
  
}

client.connect({}, connectCallback, function (error) {
  alert(error.headers.message)
})

