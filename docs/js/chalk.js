const path = document.querySelectorAll("path");
const pathLength = [];
const pathArr = [];
const chalk = document.getElementById("chalk");

for (var i = 0; i < path.length; i++) {
  pathArr.push(path[i]);
  pathLength.push(path[i].getTotalLength());
  path[i].style.strokeDasharray = pathLength[i];
  path[i].style.strokeDashoffset = pathLength[i];
}
let countPath = 0;
function write() {
  if (pathLength[countPath] > 0) {
    pathArr[countPath].style.strokeDashoffset = pathLength[countPath] - 1;
    pathLength[countPath] -= 3;
    //chalk.style.position='absolute';
    //chalk.style.left='50px';

    /*   var chalkWrite = document.createElement("<div id='chalk'><animateMotion
       path=pathArr[countPath].getAttribute('d');
              rotate='auto'
       dur='6s' fill='freeze'/></div>");
  chalk.append(chalkWrite);*/
    /* setTimeout( function() {
     Snap.animate(0, pathLength[countPath], function(value) {
       movePoint = pathArr[]
       chalk.attr({cx: movePoint.x, cy: movePoint.y});
     }       
   })*/
  } else {
    pathLength[countPath + 1];
    pathArr[countPath + 1].style.strokeDashoffset =
      pathLength[countPath + 1] - 1;
    pathLength[countPath + 1] -= 3;
    countPath++;
  }
  requestAnimationFrame(write);
}
write();
/*function writeChalk() {
 countPath = 0;
 write();
}

chalk.addEventListener('click', writeChalk());*/
