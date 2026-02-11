export class changelogView {
    content;
    ready=false;
    constructor(setWhenDone) {
        fetch("../html/changelog.html").then((content)=> {
            return content.text();
        }).then((content)=> {
            this.content=content;
            if (setWhenDone) {
                this.setPage();
            }
            this.ready=true;
        });
    }

    setPage() {
        document.getElementById("mainDiv").innerHTML=this.content;
    }
}