function getCurrentState($token, $studentId) {
alert("in getCurrentState");
    $.ajax({
        url: "getSomething.php",
        success: function (result) {
            //$("#div1").html(result);
            alert(result);
            return result;
        }//end success
    });//end ajax
}//end function getCurrentState

function processReqUpdate(req, update) {
    var reqsParentDiv = $('#currentState'); //left
    var missingParentDiv = $('#stillRequiredList'); //right

    //var req = ;
    var courseOptions = req.courseOptions; //courseOptions is now array of courses
    var coursesCounting = req.coursesCounting; //coursesCounting is now array of course records
    var coursesCountingPlanned = req.coursesCountingPlanned;

    //build base classes
    var classStr = "req_box";
    //TODO: add classes for category
//    var category = req.category;
    // From the database
    // 1 = Core
    // 2 = Foundation
    // 3 = Major
    /* if(req.category==2) classStr+=" foundation";
     else if(req.category==3) classStr+=" major";
     */

    //create the MAIN requirement box element
    //group name is the requirement name (now comes from program_requirements.title)
    var newElStr = "<div draggable=true class='" + classStr + "'><header>" + req.groupName + "</header>" + "</div>";

    //Convert into jQuery object
    // not sure why but some things don't work without doing this first
    var newEl = $(newElStr);


    //prepare the ids
    var reqSideId = "r" + req.id;
    var planId = "p" + req.id;
    var workingSideId = "w" + req.id;

    //add the data object before cloning (I don't think clone method copies data object too?)
    $(newEl).data("req", req);

    /***************** OPTIONS BOX *********************/
    //add the select box for options OR select box for what counts including PLANNED
    var selEl = $("<select></select>");
    var newId = "op" + req.id;
    $(selEl).attr("id", newId); //each select field has id "opX" where X is req.id


    var optionsCount = 0;
    for (j = 0; j < courseOptions.length; j++) {

        //Is course already taken or planned? If so, remove from options list or add a NOTE and style
        var tempId = courseOptions[j].id;
        var found = false;
        for (q = 0; q < coursesCounting.length; q++) {
            if (coursesCounting[q].id == tempId) {
                found = true;
                break;
            }
        }
        if (!found)
            for (q = 0; q < coursesCountingPlanned.length; q++) {
                if (coursesCountingPlanned[q].id == tempId) {
                    found = true;
                    break;
                }
            }

        if (!found) {

            var opEl = $("<option>" + courseOptions[j].dept + " " + courseOptions[j].num + "</option>");
            $(opEl).attr("value", courseOptions[j].id);
            $(opEl).data("hours", courseOptions[j].hours);
            $(opEl).addClass("option_available");
            $(opEl).attr('id', "opt" + courseOptions[j].id);
            $(selEl).append(opEl);
            optionsCount++;
        }
        if (found) {
            var opEl = $("<option>" + courseOptions[j].dept + " " + courseOptions[j].num + "- USED </option>");
            $(opEl).attr("value", courseOptions[j].id);
            $(opEl).data("hours", courseOptions[j].hours);
            $(opEl).addClass("option_used");
            $(opEl).attr('id', "opt" + courseOptions[j].id);
            $(selEl).append(opEl);
            optionsCount++;
        }
    }//end for j - creating options drop down
    //add class to remove the drop-down arrow if single
    if (optionsCount <= 1) {
        $(selEl).addClass("single");
    }

    //put the options in a div
    var boxStr = "<div class='options'> Options: </div>";
    var boxEl = $(boxStr);
    $(boxEl).append(selEl);
    $(boxEl).attr('id', req.id + "opbox");

    $(newEl).append(boxEl);

    /***************** COMPLETED COURSES BOX *********************/

    //Create the courses taken list within the requirement
    //  Use CSS to only show on left side

    var takenBoxStr = "<div class='taken'> Completed: </div>";
    var takenBoxEl = $(takenBoxStr);

    for (j = 0; j < coursesCounting.length; j++) {
        var theCourse = coursesCounting[j];
        var theCourseName = theCourse.dept + " " + theCourse.num;
        var courseTowardsStr = "<span class='course_box course_counting'>" + theCourseName + "</span>";
        var courseTowardsEl = $(courseTowardsStr);

        //attach the course data object and req id to each course span element
        $(courseTowardsEl).data('course', theCourse);
        $(courseTowardsEl).data('forReq', req.id);

        $(takenBoxEl).append(courseTowardsEl);
        //attach the course data and the requirement id req.id

        //first time through, add the containing div with the first course
        if (j == 0) {
            $(newEl).append(takenBoxEl);
        }
        //after, just add more courses to the containing div
    }

    $(newEl).append(takenBoxEl);

    //repeat loop for courses counting (and place courses counting in middle)
    var plannedBoxStr = "<div class='planned'> Planned: </div>";
    var plannedBoxEl = $(plannedBoxStr);

    for (k = 0; k < coursesCountingPlanned.length; k++) {
        var theCourseP = coursesCountingPlanned[k];
        var theCourseNameP = theCourseP.dept + " " + theCourseP.num;
        var courseTowardsStrP = "<span class='course_box course_counting_planned'>" + theCourseNameP + "</span>";
        var courseTowardsElP = $(courseTowardsStrP);
        $(courseTowardsElP).data('course', theCourseP);
        $(courseTowardsElP).data('forReq', req.id);
        $(courseTowardsElP).attr('id', "planned-" + planId);


        $(plannedBoxEl).append(courseTowardsElP);

        //need to go ahead and append the span here before putting on the plan
        if (k == 0) {
            $(newEl).append(plannedBoxEl);
        }


        //if planned then put on plan for matching semester
        pSem = theCourseP.semester;
        pYear = theCourseP.year;
        pStr = "p" + pYear + pSem;

        var theCoursePId = theCourseP.id;
        //console.dir("looking for: "+pStr);

        var newElPlan = $(newEl).clone(true); //to put on plan
        var newElPlanWorking = $(newEl).clone(true); //to put on right side in case it gets moved off plan
        //$(newElPlan).data("req",req);
        //$(newElPlanWorking).data("req",req);

        $(newElPlanWorking).data("whereami", "working");
        $(newElPlanWorking).addClass("req_working");
        $(newElPlanWorking).addClass("req_been_planned");
        $(newElPlanWorking).attr('id', workingSideId);

        //add to right
        // $(missingParentDiv).append(newElPlanWorking);

        $(newElPlan).data("onSemester", pStr);
        $(newElPlan).data("whereami", "plan");
        $(newElPlan).addClass("req_on_plan");
        $(newElPlan).attr('id', planId);


        $(newElPlan).draggable({
            containment: 'document',
            cursor: 'move',
            snap: '.target',
            helper: 'clone',
            revert: 'true'
        });//end draggable


        if (update) {
            var replaceIdPlan = $(newElPlan).attr('id');
            $("#" + pStr + " #" + replaceIdPlan).replaceWith(newElPlan);
        } else {
            $("#" + pStr).append(newElPlan);
        }
        //set the drop-down box to be the right course
        $("#" + pStr + " #op" + req.id).val(theCoursePId);

        //update hours for each semester
        var currentHours = parseInt($("#" + pStr).data("currentHours"), 10);
        var add = parseInt(theCourseP.hours);
        currentHours = currentHours + add;
        $("#" + pStr).data("currentHours", currentHours);
        var targetElSel = "#fstats" + pStr;
        $(targetElSel).text(currentHours);
    }

    //already added classes to plan and plan-working,
    // now add for left side and right side unplanned
    //Clones have id's and data attributes whereami to help identify
    //Req object must be re-added after each clone


    var met = req.complete;
    var metPlanned = req.completePlanned;
    var somePlanned = req.somePlanned;

    //start with classes for the left side
    if (met) {
        $(newEl).addClass("req_complete");
    }
    else if (metPlanned) {
        $(newEl).addClass("req_completePlanned");
    }
    else if (somePlanned) {
        $(newEl).addClass("req_partialPlanned");
    }
    else {
        $(newEl).addClass("req_incomplete");
    }

    //set up stats data
    $(newEl).data("hoursCounting", req.hoursCounting);
    $(newEl).data("hoursCountingPlanned", req.hoursCountingPlanned);
    $(newEl).data("hours", req.hours);
    var needed = req.hours - req.hoursCounting - req.hoursCountingPlanned;
    $(newEl).data("stillNeeded", needed);

    //split into left only and right clone here
    var newElWorking = $(newEl).clone(true); //for the right side
    $(newElWorking).attr('id', workingSideId);
    $(newElWorking).data("whereami", "working");

    $(newEl).attr('id', reqSideId);
    $(newEl).data("whereami", "reqs");


    //Add stats to left side box
    $(newEl).append("<span class='stats'> c:" + req.hoursCounting + "/p:" + req.hoursCountingPlanned + "/r:" + req.hours + "</span>");

    //Add stats to right side box
    $(newElWorking).append("<span class='stats'> need:" + needed + "</span>");
<<<<<<< HEAD
	
	$(newElWorking).attr("category", req['category']);


    // groupName not currently used
    $(newEl).attr("groupName", req['groupName']);	
	$(newEl).attr("category", req['category']);
=======
    //ADDED SPG
    $(newElWorking).attr("category", req['category']);


    // groupName not currently used
    $(newEl).attr("groupName", req['groupName']);
    //ADDED SPG
    $(newEl).attr("category", req['category']);
>>>>>>> filtering


    //add the jquery data object - TODO check if already added
    $(newEl).data("req", req);
    $(newElWorking).data("req", req);


    if (met) {
        //place on left
        $(newEl).addClass("req_complete");

        if (update) {
            var replaceIdNewEl = $(newEl).attr('id');
            $("#currentState #" + replaceIdNewEl).replaceWith(newEl);
        } else {
            $(reqsParentDiv).append(newEl);
        }
    }
    else if (metPlanned) {
        //place on left
        // $(reqsParentDiv).append(newEl);
        //$(newEl).addClass("req_completePlanned");

        //UPDATE
        if (update) {
            var replaceIdNewEl = $(newEl).attr('id');
            $("#currentState #" + replaceIdNewEl).replaceWith(newEl);
        } else {
            $(reqsParentDiv).append(newEl);
        }
    }
    else {

        //still place on left but also on right
        $(newEl).addClass("req_incomplete");
        //
        //UPDATE
        if (update) {
            var replaceIdNewEl = $(newEl).attr('id');
            $("#currentState #" + replaceIdNewEl).replaceWith(newEl);
        } else {
            $(reqsParentDiv).append(newEl);
        }

        //****return
        //
        //UPDATE
        if (update) {
            var replaceIdNewElWorking = $(newElWorking).attr('id');
            $("#stillRequiredList #" + replaceIdNewElWorking).replaceWith(newElWorking);
        } else {
            $(missingParentDiv).append(newElWorking);
        }
        $(newElWorking).addClass("req_working");
        $(newElWorking).draggable({
            containment: 'document',
            cursor: 'move',
            snap: '.target',
            helper: function (event) {
                //return $('<span style="white-space:nowrap;"/>').text($(this).text() + " helper");

                var theClone = $(this).clone(true);
                var baseId = $(theClone).attr('id');
                var selectedValue = $("#" + baseId + " #op" + baseId.substr(1)).val();
                console.dir("dragging: " + selectedValue);
                $(theClone).attr('id', "dragging" + baseId);
                //var test = $(theClone).attr('id'); console.dir("teset: "+test);
                //add the clone to a hidden area of the dom so we can select it
                $(theClone).addClass("temp_hidden").appendTo($("#temp_hidden"));

                //console.dir($("#dragging"+baseId+" #op"+baseId.substr(1)));
                $("#dragging" + baseId + " #op" + baseId.substr(1)).val(selectedValue);
                //$("#temp_hidden").remove($(theClone));
                return $(theClone);
            },

            revert: 'true'
        });//end draggable


    }//end else


}

function getSemesterName(code) {
    //keep in sync with semester_code table
    // but don't need to query database for this for performance reasons
    var name = "";
    switch (code) {
        case 1:
            name = "Fall";
            break;
        case 2:
            name = "Spring";
            break;
        case 3:
            name = "May";
            break;
        case 4:
            name = "Summer 1";
            break;
        case 5:
            name = "Summer II";
            break;
        case 6:
            name = "Summer 8-week";
            break;
        default:
            name = "N/A";
    }
    return name;
}

function incrementSemester(sem, year, scale) {
    //add code for scale later (increment to next major or next minor)
    var nextSemester = 0;
    var nextYear = 0;
    switch (sem) {
        case 1:
            nextSemester = 2;
            nextYear = ++year;
            break;
        case 6:
            nextSemester = 1;
            nextYear = year;
            break;
        default:
            nextSemester = ++sem;
            nextYear = year;

    }
    var next = [nextYear, nextSemester];
    return next;

}

var reqs;
var semesterList;
$(initSemesterStart);
$(initState);

$(init);

function showHideSummers() {
    $(".semester_block.minor").toggle();
}
//#TODO change logic  teal for hidden #odffd9
//call init state, show all, then based on dmv hide whats needed 
function semShown(dmv){
 var now = new Date();
 var year = now.getFullYear();
 var lastYear = year + 5;
 var end2Year = year + 2;
 var end4Year = year + 4;
 alert('in semShown function ' + dmv + 'passed to function.');
    document.getElementById('hide').style.display = "none";
    switch (dmv){
    //decrease to 2 years
        case "2":
        alert("decrese to 2 years.");
    //hide from 3-5 year
            for(var j = 0; j < 3; j++){
                for(var i = 6; i > 1; i--){
                    var id = "s" + lastYear + i;

                        //  alert("id created: " + id);
                    document.getElementById(id).style.display = "none";
                }
                lastYear--;
                var id2 = "s" + lastYear + "1";
                //alert("id2 created:" + id2);
                document.getElementById(id2).style.display = "none";
            }
        break;


    //increase to 5 years
        case "5":
        alert("increase to 5 years.");
            id = "s" + end2Year + "1";
            document.getElementById(id).style.display = "block";
          //  document.getElementById(id2).style.checked(false);
            for(var k = 0; k < 4; k++){
                for(var l = 6; l > 0 ; l--){
                id = "s" + end2Year + l;
                    var id2 = "cs" + lastYear + i;
                //alert(id);
                document.getElementById(id).style.display = "block";
                   // document.getElementById(id2).style.checked(false);

                }
                end2Year++;
            }
        break;

        case "4" :
            alert("back to default 4");
           for(var n = end4Year; n > year; n--){
               //alert("outside: s"+n + "1");
            for(var m = 2; m < 7; m++){
                id = "s" + end4Year + m;
                id2 = "cs" + end4Year + m;
                //alert(id);
                document.getElementById(id).style.display = "block";
                //document.getElementById(id2).style.checked(false);

            }
               end4Year--;
               id = "s"+end4Year + "1";
               //alert(id);
               document.getElementById(id).style.display = "block";
             //  document.getElementById(id2).style.checked(false);

           }
            end4Year = year + 4;
            for(var p = 0; p < 1; p++){
                id = "s" + end4Year + "1";
                //alert(id);
                document.getElementById(id).style.display = "none";
                end4Year ++;
              for(var q = 2; q < 7; q++){
                  id = "s" + end4Year + q;
                  //alert(id);
                  document.getElementById(id).style.display = "none";

              }
            }

   }
}

function showHideSemesters(){
   // alert("clicked");
    //get date of first planned for student or current semester and show whichever
// is earlier
    var now = new Date();
    var nowYear = now.getFullYear();
//console.dir("year:"+nowYear);
    var nowMonth = now.getMonth();
    var startSem;
    var startYear;

    if (nowMonth >= 1 && nowMonth <= 5) //spring
    {
        startSem = 2;
        startYear = nowYear;
    }
    else if (nowMonth >= 6 && nowMonth <= 12) //fall
    {
        startSem = 1;
        startYear = nowYear;
    }
    else {
        startSem = 2;
        startYear = nowYear;
    }
    //var sem = startSem;
    var year = startYear;

    //alert("clicked first semester is " + startYear + startSem);
    //loop through all boxes, if check, change display.
    //TODO if it's already hidden, the confirmation should not happen again.
    for(var i = 0; i < 5; i++) {
        //alert("cs" + year + "1" + " " + document.getElementById("cs" + year + "1").checked + " i=" + i);
        if (document.getElementById("cs" + year + "1").checked) {
            //  alert("cs" + year + "1" + " " + document.getElementById("cs" + year + "1").checked);
            var id = "s" + year + "1";
            var id2 = "p" + year + "1";
            var hideId = "h" + year + 1;
            //check to see if courses present on hidden semester,
            //alert("DIV S"+ document.getElementById(id).hasChildNodes());
            if (document.getElementById(id2).hasChildNodes()) {
                //if(!document.getElementById(id2).style.display == "none") {
                    var b = confirm("Are you sure you wish to hide " + getSemesterName(1) + " " + year + " with already planned courses?");
                    if (b == true) {
                        document.getElementById(id).style.display = "none";
                        document.getElementById(hideId).style.display = "block";
                        document.getElementById('hide').style.display = "block";
                    }
                }

            //if so, change to remove current class and ass req_hidden class
            else {
                document.getElementById(id).style.display = "none";
                document.getElementById(hideId).style.display = "block";
            }
        }
        year++;
        for (var j = 2; j < 7; j++) {
           // alert("cs" + year + j + " " + document.getElementById("cs" + year + j).checked + " j=" + j);
            if (document.getElementById("cs" + year + j).checked) {
                //       alert("cs" + year + j + " " + document.getElementById("cs" + year + j).checked);
                var id3 = "s" + year + j;
                var id4 = "p" + year + j;
                var hideId2 = "h" + year + j;
                //alert("DIV S"+ document.getElementById(id).hasChildNodes());
                if (document.getElementById(id4).hasChildNodes()) {
                    var c = confirm("Are you sure you wish to hide " + getSemesterName(j) + " " + year + " with already planned courses?");
                    if (c == true) {
                        document.getElementById(id3).style.display = "none";
                        document.getElementById(hideId2).style.display = "block";
                        //var img = document.createElement("img");
                        //img.src = "http://www.google.com/imgres?imgurl=http://studio665.com/wp-content/uploads/2013/11/exclamation-point-sign-red-triangle_2.png&imgrefurl=http://studio665.com/salsa-class-cancelled/&h=256&w=256&tbnid=JPnZgevurUm63M:&docid=-4gwbmEmRQLuwM&ei=MwpCVtGfPMT0mAGZ6pOACg&tbm=isch&ved=0CC0QMygRMBFqFQoTCJGFv4GThskCFUQ6JgodGfUEoA";
                        document.getElementById('hide').style.display = "block";
                    }
                }
                else {
                    document.getElementById(id3).style.display = "none";
                    document.getElementById(hideId2).style.display = "block";

                }
            }
        }
    }

}

function showAll(){
    var checkboxID = "";
    var blockID = "";
    var hideID = "";
    var now = new Date();
    var nowYear = now.getFullYear();
    var nowMonth = now.getMonth();
    var year;
    var sem;

    if (nowMonth >= 1 && nowMonth <= 5) //spring
    {
        sem = 2;
       year = nowYear;
    }
    else if (nowMonth >= 6 && nowMonth <= 12) //fall
    {
        sem = 1;
        year = nowYear;
    }
    else {
        sem = 2;
        year = nowYear;
    }


//loop through everything on plan
for(var i = 0; i < 5; i++){//five years
    checkboxID = "cs" + year + "1";
    blockID = "s" + year +"1";
    hideID = "h" + year + "1";
   // alert(checkboxID +" "+ blockID);
    if(document.getElementById(checkboxID).checked){
        document.getElementById(blockID).style.display = "block";//bring back semester block
        document.getElementById(hideID).style.display = "none";//hide div that holds hidden semester spot

    }
    year++;
    for(var j = 2; j < 7; j++){
        checkboxID = "cs" + year +j;
        blockID = "s" + year +j;
        hideID = "h" + year +j;
       // alert(checkboxID + " "+ blockID);
        if(document.getElementById(checkboxID).checked){
            document.getElementById(blockID).style.display = "block";//bring semester back
            document.getElementById(hideID).style.display = "none";//hide hive that holds hidden semester spot
        }
    }
}

}

<<<<<<< HEAD
function verticalScaling(){
	
	var classTotal;
	var now = new Date();
	var year = now.getFullYear();
	var sem = 1;
	
	classTotal = $('#p'+ year +'1 div.req_box').length;
	for(i=0;i<24;i++){
		var pBoxId = "p" + year + sem;
		
		if($('#' + pBoxId + ' div.req_box').length > classTotal){
			classTotal = $('#' + pBoxId + ' div.req_box').length;
		}
		sem++;
			
		if(sem >6){
			sem = 1;
			year++;
		}
	}
	if(classTotal > 5){
		year = now.getFullYear();
		var pHeight = (classTotal + 2) * 4.15;
		var sHeight = (classTotal + 2) * 4.75;
		var semester_plan = document.getElementById("s"+ year + "1");
		semester_plan.style.height = sHeight + "rem";
		
		var semester_plan2 = document.getElementById("p"+year+"1");
		semester_plan2.style.height = pHeight + "rem";
		
		year++;
		sem = 1;
		for(i=0;i<24;i++){
		var sBoxId = "s" + year + sem;
		semester_plan = document.getElementById(sBoxId);
		semester_plan.style.height =  sHeight + "rem";
		
		var boxId = "p" + year + sem;
		semester_plan2 = document.getElementById(boxId);
		semester_plan2.style.height = pHeight + "rem";
		
		sem++;
		
		if(sem >6){
			sem = 1;
			year++;
		}
		}

	}
	else{
		year = now.getFullYear();
		var semester_plan = document.getElementById("s"+year+"1");
		semester_plan.style.height = "31.5rem";
		
		var semester_plan2 = document.getElementById("p"+year+"1");
		semester_plan2.style.height = "26.75rem";
		
		year = now.getFullYear() + 1;
		sem = 1;
		for(i=0;i<24;i++){
			var sBoxId = "s" + year + sem;
			semester_plan = document.getElementById(sBoxId);
			semester_plan.style.height =  "31.5rem";
			
			var boxId = "p" + year + sem;
			semester_plan2 = document.getElementById(boxId);
			semester_plan2.style.height = "26.75rem";
			
			sem++;
			
			if(sem >6){
				sem = 1;
				year++;
			}
		}
		
	}

}

function clearSemester(innerDivId){ //function called by button in each semester block div. clears all classes from plan in that semester.
	//TODO optimize code
	//var innerDivId = $(this).attr("id");
	var str = innerDivId.split("");
	var year = str[1] + str[2] + str[3] + str[4];
	var semester = str[5];
	var c = confirm("Are you sure you want to clear all planned classes for this semester?"); //confirmation prompt
	if(c==true){
		$.ajax({
			type: "POST",
			url: "clearSemester.php?year="+year+"&semester="+semester,
			data:{
				year : year, 
				semester : semester,
			},
			success: function (result) {
				location.reload(); 
			}//end success
		});//end ajax
	}
}
	
function clearPlan($token, $studentId) { //function called by clear button at top of plan. clears all classes from plan.
	var c = confirm("Are you sure you want to clear all planned classes?"); //confirmation prompt
	if(c==true){
		$.ajax({
			type: "POST",
			url: "clearPlan.php",
			success: function (result) {
				location.reload(); 
			}//end success
		});//end ajax
		}
	}

=======
>>>>>>> filtering
function initState() {
document.getElementById('hide').style.display = 'none';
//get user id from session or redirect to login (wiht message to come back)
//student meets prereqs based on already loaded classes
//would student meet prereq based on already loaded plus plan
//idea:simple course prereq calculator in javascript - load prereq data for each course and fill with true or

    //fix hardcoding for student, pass as post params
    $.ajax({
        url: "reqsByStudent.php",
        success: function (result) {

            //Build DOM
            var reqs = JSON.parse(result); //reqs is array of requirement objects
            //each req object also has a list of course option objects, a list of
            // courses taken objects, and a list of courses planned objects
            //  see advising.php for description of these objects

            var reqsParentDiv = $('#currentState'); //left
            var missingParentDiv = $('#stillRequiredList'); //right

            //parse reqs
            for (i = 0; i < reqs.length; i++) {

                var req = reqs[i];
                processReqUpdate(req);

            }//end for each requirement

            //return result;
        }//end success
    });//end ajax

}//end function

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}
<<<<<<< HEAD

function filterState() {
//This currently will filter both the requirement and working side of the code. If the class only decides to do the req side we can eliminate stillRequiredList code. - SPG

   var chosen= document.getElementById("select");
//   var selectNumber = chosen.value;
   var selectNumber = []; 

    for (var i=0; i<chosen.length; i++) {
        if (chosen[i].checked) {
            selectNumber.push(chosen[i].value);
        }
    }

//If All is selected then the number is 0 which just sets all children to block. This is also the default setting. - SPG
    if(selectNumber == 0){
        $('#currentState').children('div').each(function(){
            var innerDivId = $(this).attr('id');
            var currReqBox = document.getElementById(innerDivId)
            currReqBox.style.display = "block";
        });
        $('#stillRequiredList').children('div').each(function(){
            var innerDivId = $(this).attr('id');
            var currReqBox = document.getElementById(innerDivId)
            currReqBox.style.display = "block";
        });
        $('#filterNotify').children('div').each(function() {
           var innerDivId = $(this).attr('id');
           var currNotify = document.getElementById(innerDivId)
           currNotify.style.display = "block";
        });
        return;
    }

//    console.log(selectNumber);
for (var i=0; i<selectNumber.length; i++) {
    $('#currentState').children('div').each(function () {
        var innerDivId = $(this).attr('id');
//        console.log(innerDivId);

        var currReqBox = document.getElementById(innerDivId);
        var currCat = currReqBox.getAttribute('category');

        console.log(currCat);
//        if (currCat == selectNumber[i] ) {
        if (isInArray(currCat,selectNumber)) {
            currReqBox.style.display = "block";
//            console.log("in the if statement with val of " + value);
//            console.log(currReqBox.category);
        } else {
            currReqBox.style.display = "none";
        }
    });
    $('#stillRequiredList').children('div').each(function () {
        var innerDivId = $(this).attr('id');
//        console.log(innerDivId);

        var currReqBox = document.getElementById(innerDivId);
        var currCat = currReqBox.getAttribute('category');

        console.log(currCat);
//        if (currCat == selectNumber[i]) {
        if (isInArray(currCat,selectNumber)) {
            currReqBox.style.display = "block";
        } else {
            currReqBox.style.display = "none";
        }
    });
    $('#filterNotify').children('div').each(function () {
        var innerDivId = $(this).attr('id');

        var currNotify = document.getElementById(innerDivId);
        var currCat = currNotify.getAttribute('title');

        if (isInArray(currCat,selectNumber)) {
            currNotify.style.display = "block";
        } else {
            currNotify.style.display = "none";
        }
    });
}

} // end of filterState()
=======
>>>>>>> filtering

function toggleCheckBoxes(master,group){
    var boxArray = document.getElementsByClassName(group);
    for(var i=0; i<boxArray.length; i++){
        var checkbox = document.getElementById(boxArray[i].id);
        checkbox.checked = master.checked;
    }
}

function filterNotify(){
    var inputElems = document.getElementsByName("check_list[]"),
        notifyDiv = document.getElementById("filterNotify"),
        count = 0,
        totalBoxes = 0;
    for (var i=0; i<inputElems.length; i++) {
        if (inputElems[i].type === "checkbox" && inputElems[i].checked === true) {
            count++;
        }
        totalBoxes++;
    }
    if(count == 0 || count == totalBoxes){
        notifyDiv.style.display = "none";
    }else{
        notifyDiv.style.display = "block";
    }
}

function filterState() {
//This currently will filter both the requirement and working side of the code. If the class only decides to do the req side we can eliminate stillRequiredList code. - SPG

   var chosen= document.getElementById("select");
//   var selectNumber = chosen.value;
   var selectNumber = [];

    for (var i=0; i<chosen.length; i++) {
        if (chosen[i].checked) {
            selectNumber.push(chosen[i].value);
        }
    }

//If All is selected then the number is 0 which just sets all children to block. This is also the default setting. - SPG
    if(selectNumber == 0){
        $('#currentState').children('div').each(function(){
            var innerDivId = $(this).attr('id');
            var currReqBox = document.getElementById(innerDivId)
            currReqBox.style.display = "block";
        });
        $('#stillRequiredList').children('div').each(function(){
            var innerDivId = $(this).attr('id');
            var currReqBox = document.getElementById(innerDivId)
            currReqBox.style.display = "block";
        });
        return;
    }

//    console.log(selectNumber);
for (var i=0; i<selectNumber.length; i++) {
    $('#currentState').children('div').each(function () {
        var innerDivId = $(this).attr('id');
//        console.log(innerDivId);

        var currReqBox = document.getElementById(innerDivId);
        var currCat = currReqBox.getAttribute('category');

        console.log(currCat);
//        if (currCat == selectNumber[i] ) {
        if (isInArray(currCat,selectNumber)) {
            currReqBox.style.display = "block";
//            console.log("in the if statement with val of " + value);
//            console.log(currReqBox.category);
        } else {
            currReqBox.style.display = "none";
        }
    });
    $('#stillRequiredList').children('div').each(function () {
        var innerDivId = $(this).attr('id');
//        console.log(innerDivId);

        var currReqBox = document.getElementById(innerDivId);
        var currCat = currReqBox.getAttribute('category');

        console.log(currCat);
//        if (currCat == selectNumber[i]) {
        if (isInArray(currCat,selectNumber)) {
            currReqBox.style.display = "block";
        } else {
            currReqBox.style.display = "none";
        }
    });
}

} // end of filterState()


function initSemesterStart() {

//get date of first planned for student or current semester and show whichever
// is earlier
    var now = new Date();
    var nowYear = now.getFullYear();
//console.dir("year:"+nowYear);
    var nowMonth = now.getMonth();
    var startSem;
    var startYear;

    if (nowMonth >= 1 && nowMonth <= 5) //spring
    {
        startSem = 2;
        startYear = nowYear;
    }
    else if (nowMonth >= 6 && nowMonth <= 12) //fall
    {
        startSem = 1;
        startYear = nowYear;
    }
    else {
        startSem = 2;
        startYear = nowYear;
    }

//var fallStart = new Date("08/15/2015");

    var year = startYear;
    var sem = startSem;


    for (i = 0; i < 30; i++) {

        var newElStr = '<div class="semester_block"></div>';
        var newEl = $(newElStr);
        if (sem == 1 || sem == 2) {
            $(newEl).addClass("major");
        }
        else {
            $(newEl).addClass("minor");
        }
        var newElId = "s" + year + sem;

        $(newEl).attr('id', newElId);
        console.dir($(newEl).attr('id'));
        var headerStr = getSemesterName(sem) + " " + year;
		var innerBtnId = "c" + year + sem;
		//var innerBtn = $(innerBtnStr);
        $(newEl).append("<header class='semester_name'>" + headerStr + '<button data-show="on" onclick="clearSemester('+ "\'" + innerBtnId + "\'" + ')"> Clear Semester</button>' + "<input type='checkbox' name='selected' id = c"+ newElId+"></header>");

<<<<<<< HEAD

		var innerDivId = "p" + year + sem;
=======
>>>>>>> filtering
        var innerDivStr = '<div class="target semester_plan"></div>';
        var innerDiv = $(innerDivStr);
		
        $(innerDiv).attr('id', innerDivId);
        $(innerDiv).data("currentHours", 0);
        $(newEl).append(innerDiv);
        $(newEl).append("<footer class='stats' id='fstats" + innerDivId + "'>0</footer>");

        var hideID = "h" + year + sem;
        var hiddenSemesterDiv = '<div class="semester_hidden" id="'+hideID+'"></div>'


        $('#thePlan').append(newEl);
       $('#thePlan').append(hiddenSemesterDiv);



        if(i >= 24){
            document.getElementById(newElId).style.display = "none";
        }

        //add the semester to the semList drop-down on right
        var optId = "d" + year + sem;
        var semOptStr = "<option value='" + optId + "' id='" + optId + "' >" + headerStr + "</option>";
        var semOptEl = $(semOptStr);
        $(semOptEl).appendTo("#semList");

        var nextSemArray = incrementSemester(sem, year, 1);
        sem = nextSemArray[1];
        year = nextSemArray[0];

    }//end for

}//end function

function highlightEligible() {
//TODO if single course requirement - hightlight whole box with yellow or green
//If multiple options, highlight lighter box and highlight options
}


function init() {
    $('.req_box').draggable({
        containment: 'document',
        cursor: 'move',
        snap: '.target',
        helper: 'clone',
        revert: true
    });

    $('.semester_plan').droppable({
        drop: handleDropEventOnPlan,
        hoverClass: "highlight_drop"
    });
    $('#stillRequiredList').droppable({
        drop: handleDropEventOnWorking,
        hoverClass: "highlight_drop"
    });

    // $( ".req_box" ).draggable( "option", "helper", 'clone' );
    // $( ".req_box" ).on( "dragstop", function( event, ui ) {} ); //dragstart, drag, dragstop, dragcrete


}
function handleDropEventOnRequired(event, ui) {
//if($("#" + name).length == 0) {
    //it doesn't exist
//}
	verticalScaling();
	
    var sourceId = ui.draggable.attr('id');
    if (sourceId.substr(0, 1) == "w") {

    }


    var newId = "c" + sourceId.substr(1);
    var sel = "#stillRequiredList #" + newId;
    console.log("sel: " + sel);
    if ($(sel).length != 0) {
        console.log("in req if");
        $(sel).removeClass("req_been_planned");
        $(sel).draggable('enable');
        $(sel).attr('draggable', 'true');
        $(sel).draggable('option', 'revert', true);
        $(ui.draggable).remove();
    }


}


//TODO - redo this whole method to undo the plan
//redo this one, on drop on plan adjust semester hours, get from semester/year TODO
function handleDropEventOnWorking(event, ui) {
	
	verticalScaling();

    var targId = $(this).attr('id');

    //if prereqs met and course offered, let it drop
    //update planned course record
    //if (true) {

    var original;
    var sourceId = ui.draggable.attr('id');
    console.log("source is " + sourceId.substr(0, 1));
    var req;
    if (sourceId.substr(0, 1) == "w") //original move coming from the working side-insert
    {
        //console.log("in if");
        var oldId = sourceId;
        var newId = "p" + sourceId.substr(1);
        //console.dir($(ui.draggable).data('req'));
        req = $(ui.draggable).data('req');
        //show reqbox on plan

        var plannedEl = $(ui.draggable).clone();
        $(plannedEl).data('req', req);
        $(plannedEl).attr('id', newId).addClass('req_on_plan').removeClass('req_working').draggable({
            containment: 'document',
            cursor: 'move',
            snap: '.target',
            helper: 'original',
            revert: true
        }).appendTo($(this));

        //insert into database then update req everywhere.
        console.dir($(plannedEl).data('req'));
        var req = $(plannedEl).data('req');
        var reqId = req.id;
        //console.dir(event.this.id);
        var semesterCode = targId.substr(5, 1);
        var planYear = targId.substr(1, 4);
        var url = "addPlanItem.php";
        var proposedReqId = "";
        //get selected course
        //var selOptionBox=$(plannedEl).

        //TODO get progyear from student session data
        var progYear = 2014;

        //jquery bug--doesn't properly clone or drag the selected value
        var theSourceSelect = $("#" + sourceId + " " + "#op" + reqId);
        console.dir(theSourceSelect);
        var courseId = $(theSourceSelect).val();

        var theCloneSelect = $("#" + newId + " " + "#op" + reqId);
        $(theCloneSelect).val(courseId);
        console.dir("value: " + courseId);

        //TODO don't hardcode program id, pull from student session data
        var programId = 1;

        var hours = 0;
        hours = parseInt($("#op" + reqId + " #opt" + courseId).data("hours"));
        var hoursRequired = parseInt($("#r" + reqId).data("hours"));
        var hoursCounting = parseInt($("#r" + reqId).data("hoursCounting"));
        var hoursPlanned = parseInt($("#r" + reqId).data("hoursCountingPlanned"));

        var remaining = hoursRequired - hoursCounting - hoursPlanned - hours;
        console.dir("remaining:" + remaining);
        if (remaining <= 0) {
            //remove
            $(ui.draggable).remove();
        }
        else {
            ui.draggable.addClass('req_been_planned');
            //ui.draggable.draggable('disable');
            //ui.draggable.attr('draggable','false');
            //ui.draggable.draggable( 'option', 'revert', false );
        }


        console.dir("hours: " + hours);

        //insert into database
        $.ajax({
            url: "addPlanItem.php",
            method: 'POST',
            data: {
                programId: programId,
                courseId: courseId,
                hours: hours,
                semesterCode: semesterCode,
                planYear: planYear,
                progYear: progYear,
                reqId: reqId,
                proposedReqId: proposedReqId
            },
            success: function (result) {
                //alert("success");
                //alert(result);
                //Build DOM
                var req = JSON.parse(result); //reqs is array of requirement objects
                //each req object also has a list of course option objects and list of courses taken objects
                //alert("after parse");
                //for(i=0;i<reqs.length;i++)
                //{
                processReqUpdate(req, true);
                //}
                //parse reqs


                //return result;
            }//end success
        });//end ajax


        //Will this complete the requirement? If so, disable on right, otherwise, update hours on right
        //update left and right with returned requirement

        //style the copy of requirement still left on working side
        //

    }//end if original move
    else if (sourceId.substr(0, 1) == "p") //move from one semester to another
    {
        //call movemethod
        $(ui.draggable).appendTo($(this)).css({position: 'relative', top: 0, left: 0});
        // ui.draggable.draggable( 'option', 'revert', true );

        console.log("in else");
    }//end else not original move
    //add code for drop-down change

}//end function


//TODO add function for changing drop-down selection on plan
function handleDropEventOnPlan(event, ui) {
	
	verticalScaling();

    var targId = $(this).attr('id');

	
    //if prereqs met and course offered, let it drop
    //update planned course record
    //if (true) {

    var original;
    var sourceId = ui.draggable.attr('id');
    console.log("source is " + sourceId.substr(0, 1));
    var req;
    if (sourceId.substr(0, 1) == "w") //original move coming from the working side-insert
    {
        //console.log("in if");
        var oldId = sourceId;
        var newId = "p" + sourceId.substr(1);
        //console.dir($(ui.draggable).data('req'));
        req = $(ui.draggable).data('req');
        //show reqbox on plan

        var plannedEl = $(ui.draggable).clone();
        $(plannedEl).data('req', req);
        $(plannedEl).attr('id', newId).addClass('req_on_plan').removeClass('req_working').draggable({
            containment: 'document',
            cursor: 'move',
            snap: '.target',
            helper: 'original',
            revert: true
        }).appendTo($(this));

        //insert into database then update req everywhere.
        console.dir($(plannedEl).data('req'));
        var req = $(plannedEl).data('req');
        var reqId = req.id;
        //console.dir(event.this.id);
        var semesterCode = targId.substr(5, 1);
        var planYear = targId.substr(1, 4);
        $(plannedEl).data("onSemester", targId);
        var url = "addPlanItem.php";
        var proposedReqId = "";
        //get selected course
        //var selOptionBox=$(plannedEl).

        //TODO get progyear from student session data
        var progYear = 2014;

        //jquery bug--doesn't properly clone or drag the selected value
        var theSourceSelect = $("#" + sourceId + " " + "#op" + reqId);
        console.dir(theSourceSelect);
        var courseId = $(theSourceSelect).val();

        var theCloneSelect = $("#" + newId + " " + "#op" + reqId);
        $(theCloneSelect).val(courseId);
        console.dir("value: " + courseId);

        //TODO don't hardcode program id, pull from student session data
        var programId = 1;

        var  hours = 0;
        hours = parseInt($("#op" + reqId + " #opt" + courseId).data("hours"));
        var hoursRequired = parseInt($("#r" + reqId).data("hours"));
        var hoursCounting = parseInt($("#r" + reqId).data("hoursCounting"));
        var hoursPlanned = parseInt($("#r" + reqId).data("hoursCountingPlanned"));

        var remaining = hoursRequired - hoursCounting - hoursPlanned - hours;
        console.dir("remaining:" + remaining);
        if (remaining <= 0) {
            //remove
            $(ui.draggable).remove();
        }
        else {
            ui.draggable.addClass('req_been_planned');
            //ui.draggable.draggable('disable');
            //ui.draggable.attr('draggable','false');
            //ui.draggable.draggable( 'option', 'revert', false );
        }


        console.dir("hours: " + hours);

        //insert into database
        $.ajax({
            url: "addPlanItem.php",
            method: 'POST',
            data: {
                programId: programId,
                courseId: courseId,
                hours: hours,
                semesterCode: semesterCode,
                planYear: planYear,
                progYear: progYear,
                reqId: reqId,
                proposedReqId: proposedReqId
            },
            success: function (result) {
                //alert("success");
                //alert(result);
                //Build DOM
                var req = JSON.parse(result); //reqs is array of requirement objects
                //each req object also has a list of course option objects and list of courses taken objects
                //	alert("after parse");
                //for(i=0;i<reqs.length;i++)
                //{
                processReqUpdate(req, true);
                //}
                //parse reqs


                //return result;
            }//end success
        });//end ajax

        //update hours for the semester
        /*
         already done on update
         var currentHours = parseInt( $("#"+targId).data("currentHours"), 10);
         var add = parseInt(hours);
         currentHours = currentHours + add;
         $("#"+targId).data("currentHours",currentHours);
         var targetElSel = "#fstats"+targId;
         $(targetElSel).text(currentHours);
         */

        //Will this complete the requirement? If so, disable on right, otherwise, update hours on right
        //update left and right with returned requirement

        //style the copy of requirement still left on working side
        //

    }//end if original move
    else if (sourceId.substr(0, 1) == "p") //move from one semester to another
    {
        //move, don't clone
        $(ui.draggable).appendTo($(this)).css({position: 'relative', top: 0, left: 0});
        //do db update moveplan

        var req = $(ui.draggable).data('req');
        var reqId = req.id;

        //var reqIdToMove=req.id;
        //var reqToMove

        //update hours per semester for both


        /***** work with ****/

        //no cloning, just move
        //	var plannedEl= $(ui.draggable).clone();
        // $(plannedEl).data('req',req);
        /* $(plannedEl).attr('id',newId).addClass('req_on_plan').removeClass('req_working').draggable({
         containment: 'document',
         cursor: 'move',
         snap: '.target',
         helper: 'original',
         revert: true}).appendTo($(this));
         */

        //insert into database then update req everywhere.
        // console.dir($(plannedEl).data('req'));
        //var req=$(plannedEl).data('req');
        ///var reqId=req.id;
        //console.dir(event.this.id);

        var toSemesterCode = targId.substr(5, 1);
        var toPlanYear = targId.substr(1, 4);
        var fromSemesterCode = $(ui.draggable).data('onSemester');
        fromSemesterCode = fromSemesterCode.substr(5, 1);
        var fromPlanYear = $(ui.draggable).data('onSemester');
        fromPlanYear = fromPlanYear.substr(1, 4);
        var url = "movePlanItem.php";
        var proposedReqId = "";


        //TODO get progyear from student session data
        // var progYear=2014;

        //jquery bug--doesn't properly clone or drag the selected value
        var theSourceSelect = $("#" + sourceId + " " + "#op" + reqId);
        //console.dir(theSourceSelect);
        var courseId = $(theSourceSelect).val();

        //TODO don't hardcode program id, pull from student session data
        var programId = 1;

        var hours = 0;
        hours = parseInt($("#op" + reqId + " #opt" + courseId).data("hours"));

        console.dir("hours: " + hours);
        //heeeeeeeeere set up ajax
        //insert into database &&&&&&&&&&& function movePlanItem($token, $studentId, $courseId, $semester, $year, $toSemester, $toYear,$reqId=null)

        $.ajax({
            url: "movePlanItem.php",
            method: 'POST',
            data: {
                courseId: courseId, studentId: 1, fromSem: fromSemesterCode, fromYear: fromPlanYear,
                toSem: toSemesterCode, toYear: toPlanYear, reqId: reqId
            },
            success: function (result) {
                //alert("success");
                //alert(result);
                /*
                 var req=JSON.parse(result); //reqs is array of requirement objects
                 //each req object also has a list of course option objects and list of courses taken objects
                 alert("after parse");
                 //for(i=0;i<reqs.length;i++)
                 //{
                 processReqUpdate(req);
                 //}
                 */
				 verticalScaling();

            }//end success
        });//end ajax


        /***** *****/


        // ui.draggable.draggable( 'option', 'revert', true );

        //console.log("in else");
    }//end else not original move
    //add code for drop-down change

}//end function

function handleHiddenClassesOnPlan() {
    //this function will be used to tell the program to change
    // css of courses on left, will be called by function that hides
    //individual semesters.
}

/********* experimental for automating movement **********/
function trigger_drop() {
    var draggable = $("div.semester_plan div.req_on_plan").draggable();
    var y = $("div.semester_plan div.req_on_plan").length;
    console.dir("y: " + y);
//  console.log("clicked:"+draggable);
    var droppable = $('#stillRequiredList').droppable({
        drop: handleDropEventOnRequired,
        hoverClass: "highlight_drop"
    });
    var x = $('#stillRequiredList').length;
    console.dir(droppable);


    var droppableOffset = droppable.offset();
    console.dir(droppableOffset);
//console.dir("droppableOffset:"+droppableOffset);
    var draggableOffset = draggable.offset();
    console.dir(draggableOffset);
    var dx = droppableOffset.left - draggableOffset.left;
    console.dir(dx);
    var dy = droppableOffset.top - draggableOffset.top;


    draggable.simulate("drag", {
        dx: dx,
        dy: dy
    });
}

function unplan() {
    console.log("clicked unplan");
    trigger_drop();
}