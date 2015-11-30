<?php
session_start();
$_SESSION['username'] = "crystal";
$_SESSION['studentId'] = 1;
$_SESSION['token'] = "ABC";
/** login, registration and enter records, import records, auto-plan, print option, email option **/
/** scrape for course availability **/
?>
<!DOCTYPE html>
<html xmlns:display="http://www.w3.org/1999/xhtml">
<head>
    <title> eZAdvising </title>
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/themes/smoothness/jquery-ui.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>

    <script src="jquery-simulate.js"></script>

    <link rel="stylesheet" href="main.css">
</head>

<body>
<div id="top" class="top">
    <h3> eZAdvising </h3>
</div>
<div id="wrapper">

    <div id="left">
        <table>
            <tr>
                <th>Requirements</th>
            </tr>
        </table>

        <!-- Updated from dropdown to a checkbox for Sprint 2 SPG 11/10/2015 -->
        <form id="select" action="#" method="post">
            <input type="checkbox" id="checkbox1_master" name="check_list[]" value="0" onchange="toggleCheckBoxes(this,'cb1group')" checked><label>Toggle All</label><br/>
            <input type="checkbox" id="cb1_1" name="check_list[]" class="cb1group" value="1" checked><label>Core</label><br/>
            <input type="checkbox" id="cb1_2" name="check_list[]" class="cb1group" value="2" checked><label>Foundation</label><br/>
            <input type="checkbox" id="cd1_3" name="check_list[]" class="cb1group" value="3" checked><label>Major</label><br/>
            <input type="button" name="filterSubmit" value="Submit" onclick="filterState();filterNotify()"/>
        </form>

        <div id="currentState">

        </div>
    </div>

    <!-- newlayout <div id="col23"> -->

    <div id="main">
        <table>
            <tr>
                <th>Plan</th>
            </tr>
				
            <tr></tr>
        </table>


        <table>

            <tr>
                <td>
                    <button data-show="on" onclick="showHideSummers()"> Show/Hide Summers</button>
                    <button data-show="on" onclick="showHideSemesters()"> Hide Semesters</button>
                    <button data-show="on" onclick="showAll()"> Show All</button>
                </td>
                <td>
                    <select name ="semesters" id = "semesters" onchange="semShown(semesters.value)">
                        <option value="4">4 Years</option>
                        <option value="2">2 Years</option>
                        <option value="5">5 Years</option>
                    </select>
                </td>
            </tr>
			
			<tr>
				<td>
					<button data-show="on" onclick="clearPlan();" > Clear Plan</button>
				</td>
			</tr>

        </table>
        <div id="thePlan"></div>

    </div>
    <!-- end div main -->
	

    <!-- newlayout </div> --><!-- end div col23 -->

    <div class="target" id="right">

        <table id="required_table">
            <tr>
                <th>Need to Take</th>
            </tr>
        </table>
        <div id="filterNotify" style="display: none">
            <table id="notify_table">
                <tr>
                    <th>WARNING! You currently have filters on.</th>
                </tr>
            </table>
        </div>
        <div id="eligibleSwitch">
            <input type="checkbox" id="semCheckBox"/>
            <span>Highlight Courses Eligible </span>
            <select id="semList"></select>
            <div id ='courseWarning' class = 'error' style="display: none">Courses Hidden!</div>
        </div>
        <div id="stillRequiredList">
		
        </div>
		

        <!-- end stillRequiredList div -->


    </div>
    <!-- end div right -->


</div>
<!-- end div wrapper -->

<footer>
</footer>
<div id="temp_hidden" class="temp_hidden"></div>
<script src="advising_functions.js"></script>
<script>

</script>

<script>

</script>
