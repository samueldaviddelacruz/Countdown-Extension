/**
 * Created by Samuel on 11/1/2016.
 */

var timeinterval;
function init(){
    var queryInfo = {
        active: true,
        currentWindow: true
    };
    chrome.tabs.query(queryInfo,function(tabs){

        /*tabs contains a list of tabs on chrome, since active is set to true as an option at least one tab
         is on the array
         */
        var currentTab = tabs[0];
        setMinDateTomorrow();

        getSavedGoal(function(goal){
            console.log(goal);
            var goalDate = new Date(goal.goalMilis);
            console.log(goalDate);
            setGoalLabel(goal.title);
            initializeClock('clockdiv', goalDate);
        })


    });
}

function getTimeRemaining(endtime) {
    var t = Date.parse(endtime) - Date.parse(new Date());

    //var timespan = countdown( new Date(), new Date(2016, 10, 31)).toString();

    //console.log(timespan);

    var seconds = Math.floor((t / 1000) % 60);
    var minutes = Math.floor((t / 1000 / 60) % 60);
    var hours = Math.floor((t / (1000 * 60 * 60)) % 24);

    var days = Math.floor(t / (1000 * 60 * 60 * 24));

    return {
        'total': t,
        'days': days,
        'hours': hours,
        'minutes': minutes,
        'seconds': seconds
    };
}

function getSavedGoal(callback){

    chrome.storage.sync.get({title:'myGoal',goalMilis:getTomorrowDate().getTime()}, callback);

}
function saveGoal(title,date,callback){

    chrome.storage.sync.set({title:title,goalMilis:date.getTime()},callback);
}

function getClockDiv(id){
    var clockdiv = document.getElementById(id);
    return clockdiv;
}
function initializeClock(id, endtime) {
    //clear interval if exists, in case a new goal date is selected
    if(timeinterval){
        //console.log('clear interval')
        clearInterval(timeinterval);
    }
    var clock = getClockDiv(id);
    var daysSpan = clock.querySelector('.days');
    var hoursSpan = clock.querySelector('.hours');
    var minutesSpan = clock.querySelector('.minutes');
    var secondsSpan = clock.querySelector('.seconds');

    function updateClock() {

        var t = getTimeRemaining(endtime);
        if (t.total <= 0) {
            clearInterval(timeinterval);
        }else{

            daysSpan.innerHTML = t.days;
            hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
            minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
            secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
        }

    }

    updateClock();
    timeinterval = setInterval(updateClock, 1000);
}
function getTomorrowDate(){
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
}
function setMinDateTomorrow(){
    var tomorrow = getTomorrowDate();
    var dd = tomorrow.getDate();
    var mm = tomorrow.getMonth()+1; //January is 0!
    var yyyy = tomorrow.getFullYear();

    if(dd<10){
        dd='0'+dd
    }
    if(mm<10){
        mm='0'+mm
    }
    var todayString = yyyy+'-'+mm+'-'+ dd;
    document.getElementById("GoalDate").setAttribute("min", todayString);
}
function setGoalLabel(text){
    document.getElementById("myGoalLabel").innerHTML = text;
}
function setGoalTime(datepicker){

    var goalDate = document.getElementById("GoalDate").valueAsDate;
    var goalText = document.getElementById('GoalText').value;

    if(goalDate && goalText) {

        goalDate.setHours(24);

        saveGoal(goalText,goalDate,function(){
            console.log('Success');

            setGoalLabel(goalText);

            initializeClock('clockdiv', goalDate);

        });


    }

}



document.addEventListener('DOMContentLoaded',function(){
    document.getElementById("setGoalButton").addEventListener('click',setGoalTime);
    init();
});


