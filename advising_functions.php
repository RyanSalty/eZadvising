<?php

//all functions require authentication and active session
//store transcript data for student in a session id for performance?
//javascript to 
//login and token and registration and logout
//javascript code to modify dom
//edit profile / edit transcript
//import transcript
//print/export plan to pdf
//look at connection pooling with pdo
//unit tests and harnessing
//T4-7,7-10,4-7W,Thursday am

require_once("config.php");
require_once("pe.php");

/*
check--evalSinglePrereq($token, $studentId, $prereqId)
check--evalFullPrereq($token, $studentId, $courseId)
check--getTranscript($token, $studentId) returns list of courses including which group for each course
check--getRequirements($major) returns list of course groups

check--getPlanned($token, $studentId,$semester, $year) returns list of courses including which group
addPlanItem($token, $studentId, $courseId, $semester, $year, $requirement, $proposedReq)
removePlanItem
getRemainingAfterPlanned
getRemainingIgnorePlan($token, $studentId) returns list of course groups
*/

//returns true if successful
//UPDATED DONE USED
function addPlanItem($token, $studentId, $courseId, $hours, $semester, $planYear, $progYear, $programId, $reqId = null, $proposedReqId = null)
{
//echo "in addPlanItem";
    try {
        if (!validateToken($token, $studentId)) {
            return 403;
        }

        //  if(empty($studentId)) return 404;

        $conn = new PDO(DBCONNECTSTRING, DBUSER, DBPASSWORD);
        $sql = 'INSERT INTO course_records (id, studentId, courseId, grade, hours, semesterCode, year, reqId, type, proposedReqId) ';
        $sql = $sql . ' VALUES (null, :studentId, :courseId, null, :hours, :semester, :year, :reqId, 2, :proposedReqId)';
        $stmt = $conn->prepare($sql);

//echo "courseid: ".$courseId;

     	if ($proposedReqId == '') {$proposedReqId = null;}  //Fixes mysql failure when proposedReqID is an empty string

        $stmt->bindParam(':studentId', $studentId);
        $stmt->bindParam(':semester', $semester);
        $stmt->bindParam(':year', $planYear);
        $stmt->bindParam(':courseId', $courseId);
        $stmt->bindParam(':reqId', $reqId);
        $stmt->bindParam(':proposedReqId', $proposedReqId);
        $stmt->bindParam(':hours', $hours);
        $success = $stmt->execute();
        $inserted = $success ? "yes" : "no";
        //echo "<h4>success:".$inserted."</h4>";
        $result = getUpdatedRequirementForStudent($token, $studentId, $reqId, $programId, $progYear);
        //echo $result;


    }//end try
    catch (PDOException $e) {
        //	echo $sql . "<br>" . $e->getMessage();
        return 500;
    }

    $conn = null;
    return $result;

}

//NOT UPDATED DONE USED
function removePlanItem($token, $studentId, $courseId, $semester, $year, $reqId = null)
{
    try {
        if (!validateToken($token, $studentId)) {
            return 403;
        }

        //  if(empty($studentId)) return 404;

        $conn = new PDO(DBCONNECTSTRING, DBUSER, DBPASSWORD);
        $sql = 'DELETE FROM course_records WHERE studentId=:studentId AND courseId= :courseId AND semester=:semester AND year=:year AND type=2';
        //$sql = $sql. ' VALUES (null, :studentId, :courseId, null, :semester, :year, :reqId, 2, :proposedReqId)';
        $stmt = $conn->prepare($sql);

        $stmt->bindParam(':studentId', $studentId);
        $stmt->bindParam(':semester', $semester);
        $stmt->bindParam(':year', $year);
        $stmt->bindParam(':courseId', $courseId);

        $success = $stmt->execute();
        $inserted = $success ? "yes" : "no";
        echo "<h4>success:" . $inserted . "</h4>";


    }//end try
    catch (PDOException $e) {
        //echo $sql . "<br>" . $e->getMessage();
        return 500;
    }

    $conn = null;

}

//UPDATED DONE USED
function movePlanItem($token, $studentId, $courseId, $semester, $year, $toSemester, $toYear, $reqId = null)
{
    try {
        if (!validateToken($token, $studentId)) {
            return 403;
        }

        //  if(empty($studentId)) return 404;

        $conn = new PDO(DBCONNECTSTRING, DBUSER, DBPASSWORD);
        $sql = 'UPDATE course_records SET semesterCode=:toSemester, year=:toYear WHERE studentId=:studentId AND courseId= :courseId AND semesterCode=:semester AND year=:year AND type=2';
        //$sql = $sql. ' VALUES (null, :studentId, :courseId, null, :semester, :year, :reqId, 2, :proposedReqId)';
        $stmt = $conn->prepare($sql);

        $stmt->bindParam(':studentId', $studentId);
        $stmt->bindParam(':semester', $semester);
        $stmt->bindParam(':year', $year);
        $stmt->bindParam(':courseId', $courseId);
        $stmt->bindParam(':toSemester', $toSemester);
        $stmt->bindParam(':toYear', $toYear);

        $success = $stmt->execute();
        $inserted = $success ? "yes" : "no";
        //echo "<h4>success:".$inserted."</h4>";


    }//end try
    catch (PDOException $e) {
        //echo $sql . "<br>" . $e->getMessage();
        return 500;
    }

    $conn = null;
    return $inserted;
}

//echo "calling";
// movePlanItem("ABC",1,9,1, 2015, 1, 2016, 4);
//echo "after calling";

//TODO add function changePlanItemSelectedCourse
//TODO add courseRecord id to all these?

function validateToken($studentId, $token)
{
    return true;
}

//UPDATED DONE USED
function getUpdatedRequirementForStudent($token, $studentId, $reqId, $programId, $year)
{

    //validate student and token
    if (empty($programId) || empty($year)) return 404;

    //echo "starting getRrequiements";
    //return array of requirement objects
    // each requirement has an id, category, title, numcredit hours, min grade, and array of course objects
    //   each course object has an id, dept, num title, description
    $result = null;
    try {


        // echo "req: ".$reqId.'end';

        $conn = new PDO(DBCONNECTSTRING, DBUSER, DBPASSWORD);
        $sql = 'SELECT program_requirements.id as "reqId", program_requirements.category as "category", program_requirements.groupId as "groupId", title as "name", program_requirements.numCreditHours as "hours", program_requirements.minGrade as "grade" ';
        //$sql = 'select * ';
        $sql = $sql . ' FROM program_requirements WHERE ';
        $sql = $sql . ' program_requirements.programId=:programId AND program_requirements.catalogYear=:year';
        $sql = $sql . ' AND program_requirements.id=:reqId';

        //echo $programId.",".$year.",".$reqId.",";

        //$sql="select * from program_requirements where  program_requirements.id=:reqId AND program_requirements.catalogYear=:year AND program_requirements.programId=:programId";
        $stmt = $conn->prepare($sql);

        $stmt->bindParam(':programId', $programId);
        $stmt->bindParam(':year', $year);
        $stmt->bindParam(':reqId', $reqId);
        $stmt->execute();

        $req = $stmt->fetch();
        // echo "prog query: ".$stmt->rowCount();
        if ($stmt->rowCount() <= 0) return $result;


        //  foreach($reqs as $req) {
        //echo "<p>json:";
        //echo print_r($req);
        //echo "</p>";

        /*** Each req object has:
         * id - requirementId
         * category - core, foundation, major, etc.
         * groupId - group of courses that satisfy requirement
         * groupName - description of courses
         * grade - min grade required for credits to count toward this requirement
         * hours - total hours required for this requirement
         *
         * hoursCounting - total number of hours that are completed twoard this requirement
         * hoursCountingPlanned - total number of hours that are PLANNED toward this requirement
         * complete - compares hours to hoursCounting (true or false)
         * completePlanned - compares hours to hoursCountingPlanned PLUS hoursCounting (true or false)
         *
         * courseOptions - array of course objects that satisfy the requirement (from the groupId)
         * Each course object has
         * id - courseId
         * dept
         * num
         * title
         * description
         *
         * coursesCounting - array of  courseRecord objects that are currently counting towrd
         * requirement
         * Each courseRecord object has
         * id - courseId
         * dept
         * num
         * title
         * desription
         * hours - hours taken or planned for this course record
         * type - 1 is complete, 2 is planned
         *
         * coursesCountingPlanned - array of courseRecord objects that are PLANNED but not
         * completed, and will count toward requirement
         * Each courseRecord object has : SAME AS ABOVE
         ***/
        $r = new stdClass();
        $r->id = $req['reqId'];
        $r->category = $req['category'];
        $r->groupId = $req['groupId'];
        $r->groupName = $req['name'];
        $r->grade = $req['grade'];
        $r->hours = $req['hours'];

        //now get courses for that group
        $secondSql = 'SELECT courses.id as "id", courses.defaultCreditHours as "hours", dept, num, title, description FROM course_groups, courses WHERE course_groups.groupId=:groupId AND course_groups.courseId=courses.id';

        $stmt2 = $conn->prepare($secondSql);

        $stmt2->bindParam(':groupId', $r->groupId);

        $stmt2->execute();

        $courses = $stmt2->fetchAll();
        //if($stmt2->rowCount() <= 0 ) return $result;
        //echo "<p>course count: ".$stmt2->rowCount()."</p>";
        $courseOptions = array();
        foreach ($courses as $course) {
            //build course, then add to array
            $c = new stdClass();
            $c->id = $course['id'];
            $c->dept = $course['dept'];
            $c->num = $course['num'];
            $c->title = $course['title'];
            $c->description = $course['description'];
            $c->hours = $course['hours'];

            $courseOptions[] = $c;


        }//end foreach courses as c
        $r->courseOptions = $courseOptions;

        //now get whether the requirement is met for the student
        $sqlCoursesTaken = 'SELECT courses.id, courses.dept, courses.num, courses.title, courses.description, course_records.hours, course_records.type,course_records.semesterCode, course_records.year FROM courses, course_records WHERE course_records.studentId=:stuId AND course_records.courseId=courses.id AND course_records.reqId=:reqId';
        $stmtCoursesTaken = $conn->prepare($sqlCoursesTaken);
        $stmtCoursesTaken->bindParam(':stuId', $studentId);
        $stmtCoursesTaken->bindParam(':reqId', $r->id);
        $stmtCoursesTaken->execute();
        $coursesTaken = $stmtCoursesTaken->fetchAll();
        //echo "<p>course Taken count: ".$stmtCoursesTaken->rowCount()."</p>";

        //there is a record that meets this requirement (fully or partially)
        //TODO
        $coursesCounting = array();
        $coursesCountingPlanned = array();

        $hoursCounting = 0;
        $hoursCountingPlanned = 0;
        $somePlanned = true;
        if ($stmtCoursesTaken->rowCount() >= 1) {
            foreach ($coursesTaken as $course) {
                $c = new stdClass();
                $c->id = $course['id'];
                $c->dept = $course['dept'];
                $c->num = $course['num'];
                $c->title = $course['title'];
                $c->description = $course['description'];
                $c->hours = $course['hours'];
                $c->type = $course['type'];
                $c->semester = $course['semesterCode'];
                $c->year = $course['year'];
                $c->dirty = false;

                if ($c->type == 1) //complete
                {
                    $hoursCounting = $hoursCounting + $c->hours;
                    $coursesCounting[] = $c;
                } elseif ($c->type == 2) //planned
                {
                    $somePlanned = true;
                    $hoursCountingPlanned = $hoursCountingPlanned + $c->hours;
                    $coursesCountingPlanned[] = $c;
                }


            }//end foreach
        }//end if
        $r->coursesCounting = $coursesCounting;
        $r->coursesCountingPlanned = $coursesCountingPlanned;

        $r->hoursCounting = $hoursCounting;
        $r->hoursCountingPlanned = $hoursCountingPlanned;
        $r->somePlanned = $somePlanned;

        if ($r->hours <= $hoursCounting) //req complete
        {
            $r->complete = true;
            $r->completePlanned = true;
        } elseif ($r->hours <= ($hoursCounting + $hoursCountingPlanned)) {
            $r->complete = false;
            $r->completePlanned = true;
        } else {
            $r->complete = false;
            $r->completePlanned = false;
        }

        $r->dirty = false;


        $result = $r;

        // }//end foreach reqs as req
        $jsonResult = json_encode($result);
        /*echo "<p>json:";
               echo $jsonResult;
        echo "</p>";
        */
        //json_encode


    }//end try
    catch (PDOException $e) {
        //echo $sql . "<br>" . $e->getMessage();
        return 500;
    }

    $conn = null;
    //echo $jsonResult;
    return $jsonResult;


}

//UPDATED DONE USED
function getRequirementsForStudent($token, $studentId, $programId = 0, $year = 0)
{
    //validate student and token
    if (empty($programId) || empty($year)) return 404;

    //echo "starting getRrequiements";
    //return array of requirement objects
    // each requirement has an id, category, title, numcredit hours, min grade, and array of course objects
    //   each course object has an id, dept, num title, description
    $result = array();
    try {
        //no validation needed; nothing personal


        $conn = new PDO(DBCONNECTSTRING, DBUSER, DBPASSWORD);
        $sql = 'SELECT program_requirements.id as "reqId", program_requirements.category as "category", program_requirements.groupId as "groupId", groups.name as "name", program_requirements.numCreditHours as "hours", program_requirements.minGrade as "grade" ';
        $sql = $sql . ' FROM program_requirements, groups WHERE ';
        $sql = $sql . ' program_requirements.programId=:programId AND program_requirements.catalogYear=:year';
        $sql = $sql . ' AND program_requirements.groupId=groups.id';


        $stmt = $conn->prepare($sql);

        $stmt->bindParam(':programId', $programId);
        $stmt->bindParam(':year', $year);
        $stmt->execute();

        $reqs = $stmt->fetchAll();

        if ($stmt->rowCount() <= 0) return $result;


        foreach ($reqs as $req) {


            /*** Each req object has:
             * id - requirementId
             * category - core, foundation, major, etc.
             * groupId - group of courses that satisfy requirement
             * groupName - description of courses
             * grade - min grade required for credits to count toward this requirement
             * hours - total hours required for this requirement
             *
             * hoursCounting - total number of hours that are completed twoard this requirement
             * hoursCountingPlanned - total number of hours that are PLANNED toward this requirement
             * complete - compares hours to hoursCounting (true or false)
             * completePlanned - compares hours to hoursCountingPlanned PLUS hoursCounting (true or false)
             *
             * courseOptions - array of course objects that satisfy the requirement (from the groupId)
             * Each course object has
             * id - courseId
             * dept
             * num
             * title
             * description
             *
             * coursesCounting - array of  courseRecord objects that are currently counting towrd
             * requirement
             * Each courseRecord object has
             * id - courseId
             * dept
             * num
             * title
             * desription
             * hours - hours taken or planned for this course record
             * type - 1 is complete, 2 is planned
             *
             * coursesCountingPlanned - array of courseRecord objects that are PLANNED but not
             * completed, and will count toward requirement
             * Each courseRecord object has : SAME AS ABOVE
             ***/
            $r = new stdClass();
            $r->id = $req['reqId'];
            $r->category = $req['category'];
            $r->groupId = $req['groupId'];
            $r->groupName = $req['name'];
            $r->grade = $req['grade'];
            $r->hours = $req['hours'];

            //now get courses for that group
            $secondSql = 'SELECT courses.id as "id", courses.defaultCreditHours as "hours", dept, num, title, description FROM course_groups, courses WHERE course_groups.groupId=:groupId AND course_groups.courseId=courses.id';

            $stmt2 = $conn->prepare($secondSql);

            $stmt2->bindParam(':groupId', $r->groupId);

            $stmt2->execute();

            $courses = $stmt2->fetchAll();
            //if($stmt2->rowCount() <= 0 ) return $result;
            //echo "<p>course count: ".$stmt2->rowCount()."</p>";
            $courseOptions = array();
            foreach ($courses as $course) {
                //build course, then add to array
                $c = new stdClass();
                $c->id = $course['id'];
                $c->dept = $course['dept'];
                $c->num = $course['num'];
                $c->title = $course['title'];
                $c->description = $course['description'];
                $c->hours = $course['hours'];

                $courseOptions[] = $c;


            }//end foreach courses as c
            $r->courseOptions = $courseOptions;

            //now get whether the requirement is met for the student
            $sqlCoursesTaken = 'SELECT courses.id, courses.dept, courses.num, courses.title, courses.description, course_records.hours, course_records.type,course_records.semesterCode, course_records.year FROM courses, course_records WHERE course_records.studentId=:stuId AND course_records.courseId=courses.id AND course_records.reqId=:reqId';
            $stmtCoursesTaken = $conn->prepare($sqlCoursesTaken);
            $stmtCoursesTaken->bindParam(':stuId', $studentId);
            $stmtCoursesTaken->bindParam(':reqId', $r->id);
            $stmtCoursesTaken->execute();
            $coursesTaken = $stmtCoursesTaken->fetchAll();
            //echo "<p>course Taken count: ".$stmtCoursesTaken->rowCount()."</p>";

            //there is a record that meets this requirement (fully or partially)
            //TODO
            $coursesCounting = array();
            $coursesCountingPlanned = array();

            $hoursCounting = 0;
            $hoursCountingPlanned = 0;
            $somePlanned = true;
            if ($stmtCoursesTaken->rowCount() >= 1) {
                foreach ($coursesTaken as $course) {
                    $c = new stdClass();
                    $c->id = $course['id'];
                    $c->dept = $course['dept'];
                    $c->num = $course['num'];
                    $c->title = $course['title'];
                    $c->description = $course['description'];
                    $c->hours = $course['hours'];
                    $c->type = $course['type'];
                    $c->semester = $course['semesterCode'];
                    $c->year = $course['year'];
                    $c->dirty = false;

                    if ($c->type == 1) //complete
                    {
                        $hoursCounting = $hoursCounting + $c->hours;
                        $coursesCounting[] = $c;
                    } elseif ($c->type == 2) //planned
                    {
                        $somePlanned = true;
                        $hoursCountingPlanned = $hoursCountingPlanned + $c->hours;
                        $coursesCountingPlanned[] = $c;
                    }


                }//end foreach
            }//end if
            $r->coursesCounting = $coursesCounting;
            $r->coursesCountingPlanned = $coursesCountingPlanned;

            $r->hoursCounting = $hoursCounting;
            $r->hoursCountingPlanned = $hoursCountingPlanned;
            $r->somePlanned = $somePlanned;

            if ($r->hours <= $hoursCounting) //req complete
            {
                $r->complete = true;
                $r->completePlanned = true;
            } elseif ($r->hours <= ($hoursCounting + $hoursCountingPlanned)) {
                $r->complete = false;
                $r->completePlanned = true;
            } else {
                $r->complete = false;
                $r->completePlanned = false;
            }

            $r->dirty = false;


            $result[] = $r;

        }//end foreach reqs as req
        $jsonResult = json_encode($result);
        /*echo "<p>json:";
               echo $jsonResult;
        echo "</p>";
        */
        //json_encode


    }//end try
    catch (PDOException $e) {
        //echo $sql . "<br>" . $e->getMessage();
        return 500;
    }

    $conn = null;
    return $jsonResult;

}

//NOT YET USED
function getRequirements($programId, $year)
{
    if (empty($programId) || empty($year)) return 404;

    //echo "starting getRrequiements";
    //return array of requirement objects
    // each requirement has an id, category, title, numcredit hours, min grade, and array of course objects
    //   each course object has an id, dept, num title, description
    $result = array();
    try {
        //no validation needed; nothing personal


        //echo "still going";

        $conn = new PDO(DBCONNECTSTRING, DBUSER, DBPASSWORD);
        $sql = 'SELECT program_requirements.id as "reqId", program_requirements.category as "category", program_requirements.groupId as "groupId", program_requirements.title as "name", program_requirements.numCreditHours as "hours", program_requirements.minGrade as "grade" ';
        $sql = $sql . ' FROM program_requirements, groups WHERE ';
        $sql = $sql . ' program_requirements.programId=:programId AND program_requirements.catalogYear=:year';
        $sql = $sql . ' AND program_requirements.groupId=groups.id';


        $stmt = $conn->prepare($sql);

        $stmt->bindParam(':programId', $programId);
        $stmt->bindParam(':year', $year);
        $stmt->execute();

        $reqs = $stmt->fetchAll();
        //echo "prog query: ".$stmt->rowCount();
        if ($stmt->rowCount() <= 0) return $result;


        foreach ($reqs as $req) {
            /*echo "<p>json:";
                echo print_r($req);
         echo "</p>";
         */
            $r = new stdClass();
            $r->id = $req['reqId'];
            $r->category = $req['category'];
            $r->groupId = $req['groupId'];
            $r->groupName = $req['name'];
            $r->grade = $req['grade'];
            $r->hours = $req['hours'];

            //now get courses for that group
            $secondSql = 'SELECT courses.id as "id", dept, num, title, description FROM course_groups, courses WHERE course_groups.groupId=:groupId AND course_groups.courseId=courses.id';

            $stmt2 = $conn->prepare($secondSql);

            $stmt2->bindParam(':groupId', $r->groupId);

            $stmt2->execute();

            $courses = $stmt2->fetchAll();
            //if($stmt2->rowCount() <= 0 ) return $result;
            //echo "<p>course count: ".$stmt2->rowCount()."</p>";
            $courseList = array();
            foreach ($courses as $course) {
                //build course, then add to array
                $c = new stdClass();
                $c->id = $course['id'];
                $c->dept = $course['dept'];
                $c->num = $course['num'];
                $c->title = $course['title'];
                $c->description = $course['description'];

                $courseList[] = $c;


            }//end foreach courses as c
            $r->courseList = $courseList;

            $result[] = $r;

        }//end foreach reqs as req
        $jsonResult = json_encode($result);
        /*echo "<p>json:";
               echo $jsonResult;
        echo "</p>";
        */
        //json_encode


    }//end try
    catch (PDOException $e) {
        //echo $sql . "<br>" . $e->getMessage();
        return 500;
    }

    $conn = null;
    return $jsonResult;

}


//returns string true or false
//NOT SURE - NEED TO TEST, WORKED BEFORE
function evalFullPrereq($token, $studentId, $courseId)
{
    $result = "false";
    try {
        if (!validateToken($token, $studentId)) {
            return 403;
        }

        $conn = new PDO(DBCONNECTSTRING, DBUSER, DBPASSWORD);
        $sql = 'SELECT expression FROM prereqs WHERE prereqs.courseId=:courseId';

        $stmt = $conn->prepare($sql);

        $stmt->bindParam(':courseId', $courseId);
        $stmt->execute();

        $prereq = $stmt->fetch();
        //echo "pcount: ".$stmt->rowCount()."<br />";
        if ($stmt->rowCount() <= 0) {
            //double check no prereqs
            //echo "courseId: ".$courseId;
            $sql = 'SELECT prereqs FROM courses WHERE courses.id=:courseId';

            $stmt = $conn->prepare($sql);

            $stmt->bindParam(':courseId', $courseId);
            $stmt->execute();

            $course = $stmt->fetch();
            if ($stmt->rowCount() <= 0) {
                //echo "if";
                return 404; //course not found
            } else if ($course['prereqs'] == 0) {
                //echo "else";
                return true; //no prereqs
            }
            //echo "neither";


        }
        //echo "expression: ".$prereq['expression']." ;";

        $tokens = explode(" ", $prereq['expression']);
        $evaledTokens = [];
        foreach ($tokens as $token) {
            //echo "<p>token:".$token;
            if (is_numeric($token)) {
                $eval = evalSinglePrereq($token, $studentId, $token);
                // echo "=>".$eval;
                $evaledTokens[] = $eval;

            } else {
                $evaledTokens[] = $token;
            }
            // echo "</p>";
        }//end foreach token

        //echo "<p>";
        foreach ($evaledTokens as $t) {
            //echo $t." ";
        }
        // echo "</p>";

        //send boolean expression to shunting yard function
        $input = shunting_yard($evaledTokens);
        $result = eval_rpn($input);
        foreach ($evaledTokens as $t)
            //echo $t." ";
            //echo "==> ".($result ? "true" : "false")."\n";


            $sql = "";
        $stmt = null;
        /*
           if($prereq['type'] == 2) // grade of X or above in X course
           {


               //Did student take course and make grade?
               $sql = 'SELECT id, grade from course_records WHERE studentId=:stuId AND courseId=:courseId AND type=1';
               $stmt = $conn->prepare($sql);
               $stmt->bindParam(':stuId',$studentId);
               $stmt->bindParam(':courseId',$prereq['courseId']);
               $stmt->execute();
               $taken = $stmt->fetchAll();
               $count=0;
               $count = $stmt->rowCount();
               echo "taken: ".$count."<br />";

               $meetsPrereq = false;
               if($count>0) {
                 foreach($taken as $c) {
                    if($c['grade'] >= $prereq['minGrade'])
                        $meetsPrereq = true;
                 }
               }
               $result = $meetsPrereq? "true":"false";
               echo "<p> Meets Prereq? ".$result."</p>";


           }//end if type=2
           else  if($prereq['type'] == 3) // at least X hours in X group
           {
             //TODO
           }
       */


    }//end try
    catch (PDOException $e) {
        //echo $sql . "<br>" . $e->getMessage();
        return 500;
    }

    $conn = null;
    return $result;


}

//returns string true or false
function evalSinglePrereq($token, $studentId, $prereqDetailId)
{
    $result = "false";
    try {
        if (!validateToken($token, $studentId)) {
            return 403;
        }

        if (empty($prereqDetailId)) return 404;

        $conn = new PDO(DBCONNECTSTRING, DBUSER, DBPASSWORD);
        $sql = 'SELECT *  FROM prereq_detail WHERE prereq_detail.id=:id';
        $stmt = $conn->prepare($sql);

        $stmt->bindParam(':id', $prereqDetailId);
        $stmt->execute();

        $prereq = $stmt->fetch();
        if ($stmt->rowCount() <= 0) return 404;
        // echo "count: ".$stmt->rowCount()."<br />";
        // echo $prereq.$prereq['id']." ".$prereq['type']." ".$prereq['courseId']." ".$prereq['minGrade']." ;<br />";


        $sql = "";
        $stmt = null;

        if ($prereq['type'] == 2) // grade of X or above in X course
        {


            //Did student take course and make grade?
            $sql = 'SELECT id, grade from course_records WHERE studentId=:stuId AND courseId=:courseId AND type=1';
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':stuId', $studentId);
            $stmt->bindParam(':courseId', $prereq['courseId']);
            $stmt->execute();
            $taken = $stmt->fetchAll();

            $count = 0;
            $count = $stmt->rowCount();
            // echo "taken: ".$count."<br />";

            $meetsPrereq = false;
            if ($count > 0) {
                foreach ($taken as $c) {
                    if ($c['grade'] >= $prereq['minGrade'])
                        $meetsPrereq = true;
                }
            }
            $result = $meetsPrereq ? "true" : "false";
            //echo "<p> Meets Prereq? ".$result."</p>";


        }//end if type=2
        else if ($prereq['type'] == 3) // at least X hours in X group
        {
            //TODO
        }


    }//end try
    catch (PDOException $e) {
        //echo $sql . "<br>" . $e->getMessage();
        return 500;
    }

    $conn = null;
    return $result;


}

//NOT USED
function getTranscript($token, $studentId)
{
    $result = array();
    try {
        if (!validateToken($token, $studentId)) {
            return 403;
        }

        if (empty($studentId)) return 404;

        $conn = new PDO(DBCONNECTSTRING, DBUSER, DBPASSWORD);
        $sql = 'SELECT *  FROM course_records,courses WHERE type=1 AND courseId=courses.id AND studentId=:stuId';
        $stmt = $conn->prepare($sql);

        $stmt->bindParam(':stuId', $studentId);
        $stmt->execute();

        $courses = $stmt->fetchAll();
        //echo "Hello";
        //echo $stmt->rowCount();
        if ($stmt->rowCount() <= 0) return $result;


        foreach ($courses as $course) {
            /*echo "<p>json:";
                echo print_r($course);
         echo "</p>";
         */
            $c = new stdClass();
            $c->id = $course['id'];
            $c->dept = $course['dept'];
            $c->num = $course['num'];
            $c->type = $course['type'];
            $c->reqId = $course['reqId'];
            $c->proposedReqId = $course['proposedReqId'];

            $result[] = $c;

        }
        $jsonResult = json_encode($result);
        /* echo "<p>json:";
                echo $jsonResult;
         echo "</p>";
         */
        //json_encode


    }//end try
    catch (PDOException $e) {
        //echo $sql . "<br>" . $e->getMessage();
        return 500;
    }

    $conn = null;
    return $jsonResult;
}

//NOT USED
function getSemesterName($code)
{
    //more elegant to query database but don't really want to hit database for this info
    // since it rarely changes and is accessed often
    if ($code == 1) return "Fall";
    elseif ($code == 2) return "Spring";
    elseif ($code == 3) return "May";
    elseif ($code == 4) return "Summer I";
    elseif ($code == 5) return "Summer II";
    else return "Unknown";
}

//test getPlanned
//NOT USED
function getPlanned($token, $studentId, $semester, $year)
{
    $result = array();
    try {
        if (!validateToken($token, $studentId)) {
            return 403;
        }

        if (empty($studentId)) return 404;

        $conn = new PDO(DBCONNECTSTRING, DBUSER, DBPASSWORD);
        $sql = 'SELECT *  FROM course_records,courses WHERE type=2 AND courseId=courses.id AND studentId=:stuId AND semesterCode=:semester AND year=:year';
        $stmt = $conn->prepare($sql);

        $stmt->bindParam(':stuId', $studentId);
        $stmt->bindParam(':semester', $semester);
        $stmt->bindParam(':year', $year);
        $stmt->execute();

        $courses = $stmt->fetchAll();
        //echo "Hello";
        //echo $stmt->rowCount();
        if ($stmt->rowCount() <= 0) return $result;


        foreach ($courses as $course) {
            /*echo "<p>json:";
                echo print_r($course);
         echo "</p>";
         */

            $c = new stdClass();
            $c->id = $course['id'];
            $c->dept = $course['dept'];
            $c->num = $course['num'];
            $c->type = $course['type'];
            $c->reqId = $course['reqId'];
            $c->proposedReqId = $course['proposedReqId'];
            $c->plannedSemester = $course['semesterCode'];
            $c->plannedSemesterName = getSemesterName($c->plannedSemester);
            $c->plannedYear = $course['year'];

            $result[] = $c;

        }
        $jsonResult = json_encode($result);
        /*echo "<p>json:";
               echo $jsonResult;
        echo "</p>";
        */
        //json_encode


    }//end try
    catch (PDOException $e) {
        //echo $sql . "<br>" . $e->getMessage();
        return 500;
    }

    $conn = null;
    return $jsonResult;
}


//evalSinglePrereq("ABC",2, 2);

//echo evalFullPrereq("ABC",1, 5);
//echo getTranscript("ABC",1);
//echo getPlanned("ABC",1,"Spring", 2015);
//addPlanItem($token, $studentId, $courseId, $hours,$semester, $year, $programId, $reqId=null, $proposedReqId=null)
//echo "calling addPlanItem";
//addPlanItem("ABC", 1, 29, 3,2,2017,2014,1,2,null );
//function addPlanItem($token, $studentId, $courseId, $hours,$semester, $planYear, $progYear, $programId, $reqId=null, $proposedReqId=null)

//echo "after calling addPlanItem";
//addPlanItem("ABC", 1, 11, "Summer", 2017 );
//movePlanItem("ABC", 1, 10, "Summer", 2017,"Fall",2018 );
//echo getRequirementsForStudent("ABC",1,1,2014);

?>
