import { Achievement } from "../achievements/achievement.js";
import { achievementManager } from "../achievements/achievementManager.js";
export class achievementsView {
  content;
  ready = false;

  constructor(setWhenDone) {
    fetch("../html/achievements.html")
      .then((r) => r.text())
      .then((content) => {
        this.content = content;
        if (setWhenDone) {
            this.setPage();
        }
        this.ready = true;
      });
  }

  setPage() {
    document.getElementById("mainDiv").innerHTML = this.content;
    //get the number of achievements
    let achievementCount = achievementManager.achievements.size;
    //adjust based on screen size
    let colCount = 5;
    //let table = getElementById("achievementsTable");
    let HTML="";
    let rowCount = Math.ceil(achievementCount/colCount);

    console.log("row count = ",rowCount,"col count=",colCount);
    let arr=this.createAchievementsArr();
    for (let i=0;i<rowCount;i++) {
        //create a table column
        HTML=HTML+"<tr>";
        for (let j=0;j<colCount;j++) {
            HTML=HTML+"<td class=\"achievementsTableSpot\"><div class=\"achievementsTableInnerDiv\">";
            HTML=HTML+this.createAchievementNode(arr[(j+1)*(i+1)-1]);
            HTML=HTML+"</div></td>";
        }
        HTML=HTML+"</tr>";
    }
    console.log("Adding HTML ",HTML);
    document.getElementById("achievementsTable").innerHTML=HTML;
  }
  reset() {}

  //used so I can index achievements
  createAchievementsArr() {
    let arr = [];
    achievementManager.achievements.forEach((value)=> {
        arr.push(value);
    });
    return arr;
  }

  /**
   * @param {Achievement} achievement 
   */
    createAchievementNode(achievement) {
        console.log("Creating achievement node for achievement ",achievement);
        if (achievement==undefined) {
            return "";
        }
        let HTML="";
        //add the image
        HTML=HTML+"<img src=\"";
        HTML=HTML+achievement.imagePath;
        if (achievement.unlocked) {
            HTML=HTML+"\" class=\"achievementImg\"/>";
        } else {
            HTML=HTML+"\" class=\"achievementImg achievementNotObtainedImg\"/>";
        }
        HTML=HTML+"<br/>";
        HTML=HTML+"<span class=\"achievementName\">";
        //add the name
        HTML=HTML+achievement.name;
        HTML=HTML+"</span>";
        HTML=HTML+"<span class=\"achievementDate\">";
        //add the date
        if (achievement.unlocked) {
            HTML=HTML+achievement.unlockDate.getMonth();
            HTML=HTML+"/";
            HTML=HTML+achievement.unlockDate.getDate();
            HTML=HTML+"/";
            HTML=HTML+achievement.unlockDate.getFullYear();
        } else {
            HTML=HTML+"UNOBTAINED";
        }
        HTML=HTML+"</span>";
        HTML=HTML+"<br/>";
        //add the description
        HTML=HTML+"<span class=\"achievementDescription\">";
        HTML=HTML+achievement.description;
        HTML=HTML+"</span>";
        return HTML;
    }
}