const logo = document.querySelector('.logo') 
const intro = document.querySelector('.intro');
const navlinks = document.querySelector('.nav-links');
const bars = document.querySelector('.bars');


let isIntroVisible = true;




    if (isIntroVisible) {
         logo.style.display = 'block';
        intro.style.display = 'none';
        navlinks.style.display = 'block';
           
            } else {
                logo.style.display = 'none';
              
                navlinks.style.display = 'none';
               
                isIntroVisible = false;
                intro.style.display = 'block';
            }
    
   

