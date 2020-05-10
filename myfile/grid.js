window.onload = function(){



var mapSketch = function(p5j){
    p5j.earthquakes;
    p5j.loaded = 0; // 確認是否有讀取檔案
    p5j.map = L.map('map').setView([0,0], 2); // 經緯度 比例


    p5j.arr = [];//裝經緯度的arr
    p5j.arrarea = [];

    p5j.download;
    //用於控制canvas深度
    p5j.canvas;
    p5j.displaycanvas = true;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(p5j.map); // 將openstreetmap資料下載到 畫面中

    //p5j.arr = [[51.509,-0.08],[51.503,-0.06],[51.51,-0,047]];

    //oop(eg. var XXXX) 用物件導向的方式去 定義 polygon (類似canvas的做法)
    var area = function(arr,popup){
      this.arr = arr;
      this.popup = popup;
      this.polygon = L.polygon(
        this.arr).bindPopup(this.popup).addTo(p5j.map);

      //特殊滑鼠狀況
      this.polygon.on('mouseover',()=>{
        console.log('bb');
        this.polygon.setStyle({color:'green'})
      })
      this.polygon.on('mouseout',()=>{
        console.log('ll');
        this.polygon.setStyle({color:'blue'})
      })

      this.update = function(){

      }
    }

    p5j.preload = function() { // 需要先讀取 json
      // 取得日期段內的強度大於3的地震
      let url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?' +
        'format=geojson&starttime=2020-03-01&endtime=2020-04-12&minmagnitude=3';

      p5j.httpGet(url, 'jsonp', false, function(response) {
        p5j.earthquakes = response; // 會把所有回呼資料存於 earthquakes
      });
    }

    p5j.setup = function(){
      p5j.canvas = p5j.createCanvas(1200,600);
      p5j.canvas.style('z-index:400');//讓p5j的圖層一直維持在最上方，所以才可以看到動態效果

    }
    p5j.draw = function(){
      if (!p5j.download) {
        // Wait until the earthquake data has loaded before drawing.
        return;
      }else {
          if (p5j.loaded === 1){
            //L.polygon( p5j.arr).addTo(p5j.map);
            /*
          p5j.earthquakes.features.forEach((val)=>{
            L.circle([val.geometry.coordinates[1], val.geometry.coordinates[0]], { // 緯度在前面
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.1,
                stroke: false, // 取消邊線
                radius: val.properties.mag*100000 // 強度 乘上大小單位為公尺
            }).addTo(p5j.map).bindPopup('Here is '+val.geometry.coordinates[1]+','+val.geometry.coordinates[0]);
          });
          */
          p5j.download.feed.entry.forEach((v)=>{
              let lat = v.gsx$lat.$t.split(','); // 取得lat資料字串
              let lng = v.gsx$lng.$t.split(','); // 取得lng資料字串
              let val = v.gsx$data.$t; // 取得資料字串
              let arr = [];
              lat.forEach((v,i)=>{
                arr.push(L.latLng(parseFloat(lat[i]),parseFloat(lng[i])));
              });
              p5j.arrarea.push(new area(arr,val))
            });
        }
    
        p5j.loaded +=1;
      }
      $('#content').html('POLYGON<br>目前有 '+p5j.arrarea.length+' 個');    
  }

  p5j.mouseReleased = function(e){
    //e是一種事件 來紀錄裡面發生的事情
    console.log(e);//會顯示function裡的所有事情（eg 按鍵）

    if(p5j.mouseButton === 'left'){
      let pix = [p5j.mouseX,p5j.mouseY]; //儲存mouseX mouseY位置

      let latlng = p5j.map.mouseEventToLatLng(e);//把滑鼠位置轉換成經緯度
      console.log(pix);//顯示mouseX mouseY位置
      console.log(latlng);//顯示轉換成經緯度的mouseX mouseY位置

      //陣列每次點擊左鍵就新增一經緯度資料陣列
      if (p5j.displaycanvas){
          this.arr.push(latlng);
          p5j.circle(pix[0],pix[1],5);
        } 
      
    }else if (p5j.mouseButton === 'center' && p5j.displaycanvas) {
      //原本的直接呼叫
      /*L.polygon( p5j.arr,{color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.3,
                stroke: true,}).addTo(p5j.map);*/

        //更改為oop
        if (p5j.arr.length < 3) {
          //確保至少為一個三角多邊形
        }else{
          p5j.arrarea.push(new area(p5j.arr,"val"));
          p5j.arr = [];
          p5j.arrarea.forEach((v)=>{
            console.log(v.arr);
          });
        }
    }else if (p5j.mouseButton === 'right' && p5j.displaycanvas) {

    }
  }

  $('#zbutton').click((e)=>{
    if (p5j.displaycanvas) { //畫布顯示在最上面的時候
        p5j.canvas.style('z-index:0');//把canvas移到最下面
        p5j.displaycanvas = false;
      }else{
        p5j.canvas.style('z-index:400');
        p5j.displaycanvas = true;
      }
    });

  $('#cbutton').click(()=>{
      p5j.arr = [];
      p5j.clear()
  });

  $('#ubutton').click(()=>{
    if (p5j.arrarea.length>0) {
        //把現在的資料轉換成字串文字
        let lattxt='';
        let lngtxt='';
        let valtxt='';
        
        p5j.arrarea.forEach((v)=>{

          v.arr.forEach((latlng)=>{
            //每點一個點會有一個txt然後中間用逗號隔開
            lattxt += latlng.lat.toFixed(3).toString()+',';
            lngtxt += latlng.lng.toFixed(3).toString()+',';
          });

            lattxt = lattxt.substring(0, lattxt.length - 1);
            lattxt += '|'; // 減去最後一個chr 改為 |

            lngtxt = lngtxt.substring(0, lngtxt.length - 1);
            lngtxt += '|'; 

            valtxt += v.popup+'|';
          });
        //area01at0,area01at1,area01at2,area01at3|area02at0....
          lattxt = lattxt.substring(0, lattxt.length - 1);
          lngtxt = lngtxt.substring(0, lngtxt.length - 1);
          valtxt = valtxt.substring(0, valtxt.length - 1);
        
      
        let exeurl = 'https://script.google.com/macros/s/AKfycbxPRUov24ay03e62qw5kipb_jmbuxsmXMAo48PCJyC6alE_Tw0/exec';
        
        let editurl = 'https://docs.google.com/spreadsheets/d/18Xeryq9cnFu2jtTcvikTEJTidESDD-nyGOCJXi7cCi4/edit#gid=0';
        $.post(exeurl,{
          lat: lattxt,//第一列的資料和其內容
          lng: lngtxt,
          val: valtxt,
          url: editurl,
          num: 2,
          tag: '工作表1'//工作表
          },function(e){
          console.log(e);
        });
      }
    });

  $('#ibutton').click(()=>{
    let url = 'https://spreadsheets.google.com/feeds/list/18Xeryq9cnFu2jtTcvikTEJTidESDD-nyGOCJXi7cCi4/1/public/values?alt=json';
        console.log(url);
        p5j.httpGet(url, 'jsonp', false, function(response) {
          p5j.download = response; // 會把所有回呼資料存於 earthquakes
        });
  });
  p5j.keyPressed = function(e){
    console.log(e.key);
    if (e.key === 'c') {
      
    }
    if (e.key === 'z') {
      
    }
    if (e.key === 'u') {
      
    }
    if (e.key === 'l') {
      
    }
    if (e.key === 'i') {
      
    }
  }
}
  
new p5(mapSketch, 'map');
}