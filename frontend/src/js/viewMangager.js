function initializeViews() {
    fetch('../html/mainMenu.html').then((content)=> {
        return content.text();
    }).then((content)=> {
        document.getElementById("page").innerHTML=content;
    });
}
export function setView(view) {
    fetch('../html/'+view+'.html').then((content)=> {
        return content.text();
    }).then((content)=> {
        document.getElementById("page").innerHTML=content;
    });
}

if (typeof window !== "undefined") {
  window.initializeViews = initializeViews;
}
