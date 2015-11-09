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
<!--    <select id="select" onchange="filterState()" style="margin-bottom:15px">
            <option id="all" value="0">All</option>
            <option id="1" value="1">Core</option>
            <option id="2" value="2">Foundation</option>
            <option id="3" value="3">Major</option>
        </select>
-->
        <form id="select" action="#" method="post">
            <input type="checkbox" name="check_list[]" value="0" checked><label>All</label><br/>
            <input type="checkbox" name="check_list[]" value="1"><label>Core</label><br/>
            <input type="checkbox" name="check_list[]" value="2"><label>Foundation</label><br/>
            <input type="checkbox" name="check_list[]" value="3"><label>Major</label><br/>
            <input type="button" name="filterSubmit" value="Submit" onclick="filterState()"/>
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
                </td>
            </tr>
            <!-- <tr> <td><button onclick="unplan()" > Save Plan </button> </td> </tr>
             <tr> <td><button onclick="unplan()" > Revert to Saved Plan </button></td></tr>
             -->
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
        <div id="filterNotify" style="margin-bottom: 15px">
            <table id="notify_table">
                <tr>
                    <th>You are filtering Requirements by: </th>
                </tr>
            </table>
            <div id="zeroNotify" title="0">
                <tr>
                    <td> **All** </td>
                </tr>
            </div>
            <div id="oneNotify" title="1">
                <tr>
                    <td> Core </td>
                </tr>
            </div>
            <div id="twoNotify" title="2">
                <tr>
                    <td> Foundation </td>
                </tr>
            </div>
            <div id="threeNotify" title="3">
                <tr>
                    <td> Major </td>
                </tr>
            </div>

        </div>
        <div id="eligibleSwitch">
            <input type="checkbox" id="semCheckBox"/>
            <span>Highlight Courses Eligible </span>
            <select id="semList"></select>
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
